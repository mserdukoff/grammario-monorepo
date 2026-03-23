import os
import asyncio
import time
import logging
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor

from app.services.stanza_manager import stanza_manager
from app.services.spacy_manager import spacy_manager
from app.services.strategies.concrete import RomanceStrategy, InflectionStrategy, AgglutinativeStrategy
from app.models.schemas import (
    SentenceAnalysis, SentenceMetadata, TokenNode, PedagogicalData,
    DifficultyInfo, RuleBasedError,
)
from app.services.llm_service import llm_service
from app.services.cache import cache_service
from app.services.difficulty_scorer import difficulty_scorer
from app.services.error_detector import error_detector
from app.services.embeddings import embedding_service

logger = logging.getLogger(__name__)

PREFERRED_ENGINE = os.getenv("PREFERRED_ENGINE", "spacy")
_executor = ThreadPoolExecutor(max_workers=4)


class NLPService:
    def __init__(self):
        self._strategies = {
            'it': RomanceStrategy('it'),
            'es': RomanceStrategy('es'),
            'de': InflectionStrategy(),
            'ru': InflectionStrategy(),
            'tr': AgglutinativeStrategy()
        }

    def _run_nlp_pipeline(self, text: str, lang_code: str) -> List[TokenNode]:
        """Run the best available NLP pipeline + strategy (CPU-bound)."""
        t0 = time.perf_counter()
        engine_used = "stanza"

        use_spacy = (
            PREFERRED_ENGINE == "spacy"
            and spacy_manager.available
            and lang_code in spacy_manager.SUPPORTED_LANGUAGES
        )

        if use_spacy:
            try:
                nlp = spacy_manager.get_pipeline(lang_code)
                doc = nlp(text)
                strategy = self._strategies[lang_code]
                nodes = strategy.process_spacy(doc)
                engine_used = "spacy"
            except Exception as e:
                logger.warning(f"spaCy failed for {lang_code}, falling back to Stanza: {e}")
                use_spacy = False

        if not use_spacy:
            pipeline = stanza_manager.get_pipeline(lang_code)
            doc = pipeline(text)
            strategy = self._strategies[lang_code]
            nodes = strategy.process(doc)

        elapsed = (time.perf_counter() - t0) * 1000
        logger.info(f"NLP pipeline ({engine_used}) completed in {elapsed:.0f}ms for lang={lang_code}")
        return nodes

    def _run_llm(self, text: str, lang_code: str) -> Optional[PedagogicalData]:
        """Run LLM explanation (I/O-bound)."""
        t0 = time.perf_counter()
        try:
            result = llm_service.explain_sentence(text, lang_code)
            elapsed = (time.perf_counter() - t0) * 1000
            logger.info(
                f"LLM completed in {elapsed:.0f}ms: "
                f"translation={result.translation[:30] if result.translation else 'None'}..., "
                f"concepts={len(result.concepts)}, "
                f"tips={len(result.tips) if result.tips else 0}, "
                f"errors={len(result.errors) if result.errors else 0}"
            )
            return result
        except Exception as e:
            elapsed = (time.perf_counter() - t0) * 1000
            logger.error(f"LLM failed after {elapsed:.0f}ms: {e}", exc_info=True)
            return None

    def _run_embedding(self, text: str) -> Optional[List[float]]:
        """Encode sentence to embedding vector."""
        try:
            return embedding_service.encode(text)
        except Exception as e:
            logger.warning(f"Embedding failed: {e}")
            return None

    async def analyze_text_async(self, text: str, lang_code: str) -> SentenceAnalysis:
        """Full analysis pipeline with parallel execution and ML enrichment."""
        if lang_code not in self._strategies:
            raise ValueError(f"Unsupported language code: {lang_code}")

        t0 = time.perf_counter()

        cached = cache_service.get(text, lang_code)
        if cached:
            elapsed = (time.perf_counter() - t0) * 1000
            logger.info(f"Cache hit, returned in {elapsed:.0f}ms")
            return SentenceAnalysis(**cached)

        loop = asyncio.get_event_loop()

        # Phase 1: Run NLP pipeline, LLM, and embedding in parallel
        nlp_future = loop.run_in_executor(_executor, self._run_nlp_pipeline, text, lang_code)
        llm_future = loop.run_in_executor(_executor, self._run_llm, text, lang_code)
        emb_future = loop.run_in_executor(_executor, self._run_embedding, text)

        results = await asyncio.gather(nlp_future, llm_future, emb_future, return_exceptions=True)

        nodes = results[0] if not isinstance(results[0], Exception) else []
        pedagogical_data = results[1] if not isinstance(results[1], Exception) else None
        embedding = results[2] if not isinstance(results[2], Exception) else None

        if isinstance(results[0], Exception):
            logger.error(f"NLP pipeline failed: {results[0]}", exc_info=True)
            raise results[0]

        # Phase 2: Post-processing (fast, CPU-only, ~1-5ms each)
        difficulty_info = None
        try:
            level, score, features = difficulty_scorer.score(nodes)
            difficulty_info = DifficultyInfo(
                level=level,
                score=round(score, 3),
                features=features.to_dict(),
            )
        except Exception as e:
            logger.warning(f"Difficulty scoring failed: {e}")

        # Rule-based error detection
        grammar_errors = None
        try:
            raw_errors = error_detector.detect(nodes, lang_code)
            if raw_errors:
                grammar_errors = [
                    RuleBasedError(**err.to_dict()) for err in raw_errors
                ]
        except Exception as e:
            logger.warning(f"Error detection failed: {e}")

        total_ms = (time.perf_counter() - t0) * 1000
        logger.info(f"Total analysis completed in {total_ms:.0f}ms (parallel)")

        analysis = SentenceAnalysis(
            metadata=SentenceMetadata(text=text, language=lang_code),
            nodes=nodes,
            pedagogical_data=pedagogical_data,
            difficulty=difficulty_info,
            grammar_errors=grammar_errors,
            embedding=embedding,
        )

        # Cache the result (without embedding to save space)
        cache_data = analysis.model_dump()
        cache_data.pop("embedding", None)
        cache_service.set(text, lang_code, cache_data)

        return analysis

    def analyze_text(self, text: str, lang_code: str) -> SentenceAnalysis:
        """Synchronous fallback for non-async contexts."""
        if lang_code not in self._strategies:
            raise ValueError(f"Unsupported language code: {lang_code}")

        nodes = self._run_nlp_pipeline(text, lang_code)
        pedagogical_data = self._run_llm(text, lang_code)

        difficulty_info = None
        try:
            level, score, features = difficulty_scorer.score(nodes)
            difficulty_info = DifficultyInfo(level=level, score=round(score, 3), features=features.to_dict())
        except Exception:
            pass

        grammar_errors = None
        try:
            raw_errors = error_detector.detect(nodes, lang_code)
            if raw_errors:
                grammar_errors = [RuleBasedError(**err.to_dict()) for err in raw_errors]
        except Exception:
            pass

        return SentenceAnalysis(
            metadata=SentenceMetadata(text=text, language=lang_code),
            nodes=nodes,
            pedagogical_data=pedagogical_data,
            difficulty=difficulty_info,
            grammar_errors=grammar_errors,
        )


nlp_service = NLPService()
