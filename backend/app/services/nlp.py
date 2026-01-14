from app.services.stanza_manager import stanza_manager
from app.services.strategies.concrete import RomanceStrategy, InflectionStrategy, AgglutinativeStrategy
from app.models.schemas import SentenceAnalysis, SentenceMetadata
from app.services.llm_service import llm_service
import logging

logger = logging.getLogger(__name__)

class NLPService:
    def __init__(self):
        self._strategies = {
            'it': RomanceStrategy('it'),
            'es': RomanceStrategy('es'),
            'de': InflectionStrategy(),
            'ru': InflectionStrategy(),
            'tr': AgglutinativeStrategy()
        }

    def analyze_text(self, text: str, lang_code: str) -> SentenceAnalysis:
        if lang_code not in self._strategies:
            raise ValueError(f"Unsupported language code: {lang_code}")

        # 1. Get Pipeline
        pipeline = stanza_manager.get_pipeline(lang_code)

        # 2. Process Text with Stanza
        doc = pipeline(text)

        # 3. Apply Strategy
        strategy = self._strategies[lang_code]
        nodes = strategy.process(doc)

        # 4. Get Pedagogical Data from LLM
        pedagogical_data = None
        try:
            pedagogical_data = llm_service.explain_sentence(text, lang_code)
            logger.info(f"LLM explanation received: translation={pedagogical_data.translation[:30] if pedagogical_data.translation else 'None'}..., concepts={len(pedagogical_data.concepts)}, tips={len(pedagogical_data.tips) if pedagogical_data.tips else 0}")
        except Exception as e:
            logger.error(f"Failed to get LLM explanation: {e}", exc_info=True)
            # We continue without pedagogical data if LLM fails

        # 5. Construct Response
        return SentenceAnalysis(
            metadata=SentenceMetadata(text=text, language=lang_code),
            nodes=nodes,
            pedagogical_data=pedagogical_data
        )

nlp_service = NLPService()
