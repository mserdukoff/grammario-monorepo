import os
import time
import logging
from typing import Dict, Optional
from collections import OrderedDict

logger = logging.getLogger(__name__)

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    logger.warning("spaCy not installed, will fall back to Stanza")


class SpacyManager:
    _instance = None

    SUPPORTED_LANGUAGES = ['it', 'es', 'de', 'ru']

    LANGUAGE_MODELS = {
        'it': 'it_core_news_md',
        'es': 'es_core_news_md',
        'de': 'de_core_news_md',
        'ru': 'ru_core_news_md',
    }

    MAX_LOADED_MODELS = int(os.environ.get("MAX_LOADED_MODELS", "5"))

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            if not hasattr(cls._instance, 'pipelines'):
                cls._instance.pipelines: OrderedDict = OrderedDict()
                cls._instance.last_used: Dict[str, float] = {}
        return cls._instance

    @property
    def available(self) -> bool:
        return SPACY_AVAILABLE

    def get_pipeline(self, lang_code: str):
        if not SPACY_AVAILABLE:
            raise RuntimeError("spaCy not available")

        if lang_code not in self.SUPPORTED_LANGUAGES:
            raise ValueError(f"spaCy does not support '{lang_code}'. Supported: {self.SUPPORTED_LANGUAGES}")

        if lang_code in self.pipelines:
            self.pipelines.move_to_end(lang_code)
            self.last_used[lang_code] = time.time()
            return self.pipelines[lang_code]

        self._maybe_evict()
        self._load_model(lang_code)
        self.last_used[lang_code] = time.time()
        return self.pipelines[lang_code]

    def _maybe_evict(self):
        while len(self.pipelines) >= self.MAX_LOADED_MODELS:
            oldest = next(iter(self.pipelines))
            logger.info(f"Evicting spaCy model '{oldest}'")
            del self.pipelines[oldest]
            self.last_used.pop(oldest, None)
            import gc
            gc.collect()

    def _load_model(self, lang_code: str):
        model_name = self.LANGUAGE_MODELS[lang_code]
        logger.info(f"Loading spaCy model '{model_name}' for '{lang_code}'...")
        t0 = time.perf_counter()
        try:
            nlp = spacy.load(model_name)
            self.pipelines[lang_code] = nlp
            elapsed = (time.perf_counter() - t0) * 1000
            logger.info(f"spaCy model '{model_name}' loaded in {elapsed:.0f}ms")
        except OSError:
            logger.warning(f"spaCy model '{model_name}' not found, attempting download...")
            from spacy.cli import download
            download(model_name)
            nlp = spacy.load(model_name)
            self.pipelines[lang_code] = nlp
            elapsed = (time.perf_counter() - t0) * 1000
            logger.info(f"spaCy model '{model_name}' downloaded and loaded in {elapsed:.0f}ms")

    def get_loaded_models(self) -> list:
        return list(self.pipelines.keys())


spacy_manager = SpacyManager()
