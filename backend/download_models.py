import stanza
import os

# Define the languages and processors we need
# Must match stanza_manager.py
LANGUAGES = ['it', 'es', 'de', 'ru', 'tr']

LANGUAGE_PROCESSORS = {
    'it': 'tokenize,mwt,pos,lemma,depparse',
    'es': 'tokenize,mwt,pos,lemma,depparse',
    'de': 'tokenize,mwt,pos,lemma,depparse',
    'ru': 'tokenize,pos,lemma,depparse',
    'tr': 'tokenize,mwt,pos,lemma,depparse'
}

def download_models():
    print("Pre-downloading Stanza models...")
    resources_dir = os.environ.get("STANZA_RESOURCES_DIR", "/app/stanza_resources")
    
    for lang in LANGUAGES:
        print(f"Downloading {lang}...")
        processors = LANGUAGE_PROCESSORS.get(lang)
        # Stanza > 1.4 uses 'model_dir' instead of 'dir'
        stanza.download(lang, model_dir=resources_dir, processors=processors)
    
    print("All models downloaded successfully.")

if __name__ == "__main__":
    download_models()

