import os
import sys

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.services.llm_service import llm_service
from dotenv import load_dotenv

# Load env vars
load_dotenv()

def test_turkish_explanation():
    text = "Evden geliyorum"
    print(f"\nAnalyzing Turkish: '{text}'")
    try:
        explanation = llm_service.explain_sentence(text, "tr")
        print(f"Translation: {explanation.translation}")
        print(f"Nuance: {explanation.nuance}")
        print("Concepts:")
        for concept in explanation.concepts:
            print(f"  - {concept.name}: {concept.description} (e.g., {concept.related_words})")
    except Exception as e:
        print(f"Error: {e}")

def test_german_explanation():
    text = "Der Hund beißt den Mann"
    print(f"\nAnalyzing German: '{text}'")
    try:
        explanation = llm_service.explain_sentence(text, "de")
        print(f"Translation: {explanation.translation}")
        print(f"Nuance: {explanation.nuance}")
        print("Concepts:")
        for concept in explanation.concepts:
            print(f"  - {concept.name}: {concept.description} (e.g., {concept.related_words})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_turkish_explanation()
    test_german_explanation()


