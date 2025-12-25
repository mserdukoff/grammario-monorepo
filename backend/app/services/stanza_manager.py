import stanza
import os
from typing import Dict, Optional

class StanzaManager:
    _instance = None
    _pipelines: Dict[str, stanza.Pipeline] = {}
    
    # Supported languages configuration
    SUPPORTED_LANGUAGES = ['it', 'es', 'de', 'ru', 'tr']

    # Processors per language
    # Note: 'ru' does not use MWT in standard models usually.
    LANGUAGE_PROCESSORS = {
        'it': 'tokenize,mwt,pos,lemma,depparse',
        'es': 'tokenize,mwt,pos,lemma,depparse',
        'de': 'tokenize,mwt,pos,lemma,depparse',
        'ru': 'tokenize,pos,lemma,depparse',
        'tr': 'tokenize,mwt,pos,lemma,depparse'
    }

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(StanzaManager, cls).__new__(cls)
            # Initialize any shared resources here if needed
            # For now, we just rely on the class-level _pipelines dict
            # or we could make it an instance attribute if we wanted per-instance state
            # but Singleton usually implies shared state.
            # Let's make _pipelines an instance attribute to be cleaner with Singleton pattern
            if not hasattr(cls._instance, 'pipelines'):
                cls._instance.pipelines = {}
        return cls._instance

    def get_pipeline(self, lang_code: str) -> stanza.Pipeline:
        """
        Returns a Stanza pipeline for the specified language.
        Loads it lazily if it hasn't been loaded yet.
        """
        if lang_code not in self.SUPPORTED_LANGUAGES:
            raise ValueError(f"Language '{lang_code}' is not supported. Supported: {self.SUPPORTED_LANGUAGES}")

        if lang_code not in self.pipelines:
            self._load_model(lang_code)
        
        return self.pipelines[lang_code]

    def _load_model(self, lang_code: str):
        """
        Downloads (if necessary) and loads the model for the given language.
        """
        print(f"Checking availability of model for '{lang_code}'...")
        
        # Use environment variable for resources directory if set
        resources_dir = os.environ.get("STANZA_RESOURCES_DIR", None)
        
        try:
            # Only download if not present. Stanza handles this usually.
            print(f"Initializing pipeline for '{lang_code}'...")
            
            kwargs = {}
            if lang_code == 'tr':
                kwargs['tokenize_no_ssplit'] = True

            processors_list = self.LANGUAGE_PROCESSORS.get(lang_code, 'tokenize,mwt,pos,lemma,depparse')

            self.pipelines[lang_code] = stanza.Pipeline(
                lang=lang_code, 
                model_dir=resources_dir,
                processors=processors_list,
                download_method=stanza.DownloadMethod.REUSE_RESOURCES,
                **kwargs
            )
        except Exception as e:
            print(f"Error loading model for {lang_code}: {e}")
            # Attempt download explicitly if pipeline creation failed due to missing model
            print(f"Downloading model for '{lang_code}'...")
            
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
                **kwargs
            )

# Global instance
stanza_manager = StanzaManager()




