import stanza
import os
import time
import logging
from typing import Dict, Optional
from collections import OrderedDict

logger = logging.getLogger(__name__)

class StanzaManager:
    _instance = None
    
    # Supported languages configuration
    SUPPORTED_LANGUAGES = ['it', 'es', 'de', 'ru', 'tr']

    # Processors per language
    LANGUAGE_PROCESSORS = {
        'it': 'tokenize,mwt,pos,lemma,depparse',
        'es': 'tokenize,mwt,pos,lemma,depparse',
        'de': 'tokenize,mwt,pos,lemma,depparse',
        'ru': 'tokenize,pos,lemma,depparse',
        'tr': 'tokenize,mwt,pos,lemma,depparse'
    }
    
    # Memory management: max models to keep loaded at once
    # On 2GB RAM with 4GB swap, can keep all 5 models (with some swapping)
    # On 4GB+ RAM, can comfortably keep all 5 models
    MAX_LOADED_MODELS = int(os.environ.get("MAX_LOADED_MODELS", "5"))

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(StanzaManager, cls).__new__(cls)
            if not hasattr(cls._instance, 'pipelines'):
                # Use OrderedDict to track LRU order
                cls._instance.pipelines: OrderedDict[str, stanza.Pipeline] = OrderedDict()
                cls._instance.last_used: Dict[str, float] = {}
        return cls._instance

    def get_pipeline(self, lang_code: str) -> stanza.Pipeline:
        """
        Returns a Stanza pipeline for the specified language.
        Loads lazily and uses LRU eviction to manage memory.
        """
        if lang_code not in self.SUPPORTED_LANGUAGES:
            raise ValueError(f"Language '{lang_code}' is not supported. Supported: {self.SUPPORTED_LANGUAGES}")

        # If already loaded, move to end (most recently used)
        if lang_code in self.pipelines:
            self.pipelines.move_to_end(lang_code)
            self.last_used[lang_code] = time.time()
            return self.pipelines[lang_code]
        
        # Need to load - check if we should evict first
        self._maybe_evict_models()
        
        # Load the model
        self._load_model(lang_code)
        self.last_used[lang_code] = time.time()
        
        return self.pipelines[lang_code]
    
    def _maybe_evict_models(self):
        """Evict least recently used models if at capacity."""
        while len(self.pipelines) >= self.MAX_LOADED_MODELS:
            # Get oldest (first item in OrderedDict)
            oldest_lang = next(iter(self.pipelines))
            logger.info(f"Evicting model '{oldest_lang}' to free memory (loaded: {len(self.pipelines)}/{self.MAX_LOADED_MODELS})")
            
            # Remove from pipelines
            del self.pipelines[oldest_lang]
            if oldest_lang in self.last_used:
                del self.last_used[oldest_lang]
            
            # Force garbage collection to free memory
            import gc
            gc.collect()
    
    def get_loaded_models(self) -> list:
        """Return list of currently loaded model languages."""
        return list(self.pipelines.keys())

    def _load_model(self, lang_code: str):
        """
        Downloads (if necessary) and loads the model for the given language.
        """
        logger.info(f"Loading Stanza model for '{lang_code}'...")
        
        # Use environment variable for resources directory if set
        resources_dir = os.environ.get("STANZA_RESOURCES_DIR", None)
        
        try:
            kwargs = {}
            if lang_code == 'tr':
                kwargs['tokenize_no_ssplit'] = True

            processors_list = self.LANGUAGE_PROCESSORS.get(lang_code, 'tokenize,mwt,pos,lemma,depparse')

            self.pipelines[lang_code] = stanza.Pipeline(
                lang=lang_code, 
                model_dir=resources_dir,
                processors=processors_list,
                download_method=stanza.DownloadMethod.REUSE_RESOURCES,
                verbose=False,  # Reduce console spam
                **kwargs
            )
            logger.info(f"Model '{lang_code}' loaded successfully. Active models: {list(self.pipelines.keys())}")
            
        except Exception as e:
            logger.warning(f"Model not found for {lang_code}, downloading: {e}")
            
            processors_list = self.LANGUAGE_PROCESSORS.get(lang_code, 'tokenize,mwt,pos,lemma,depparse')
            stanza.download(lang_code, model_dir=resources_dir, processors=processors_list)
            
            kwargs = {}
            if lang_code == 'tr':
                kwargs['tokenize_no_ssplit'] = True
                
            self.pipelines[lang_code] = stanza.Pipeline(
                lang=lang_code, 
                model_dir=resources_dir,
                processors=processors_list,
                download_method=stanza.DownloadMethod.REUSE_RESOURCES,
                verbose=False,
                **kwargs
            )
            logger.info(f"Model '{lang_code}' downloaded and loaded. Active models: {list(self.pipelines.keys())}")

# Global instance
stanza_manager = StanzaManager()




