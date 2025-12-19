import os
import logging
from functools import lru_cache
from openai import OpenAI
from app.models.schemas import PedagogicalData

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        # Try OpenRouter first
        self.api_key = os.getenv("OPENROUTER_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        # Using Gemini 3 Flash as requested
        self.model_name = "google/gemini-2.0-flash-exp:free"
        
        # OpenRouter specific headers
        self.default_headers = {
            "HTTP-Referer": "http://localhost:3000",  # Update with production URL later
            "X-Title": "Grammario",
        }

        # Fallback to direct OpenAI if OpenRouter key is missing
        if not self.api_key:
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.base_url = None
            self.model_name = "gpt-4o-2024-08-06"
            self.default_headers = None
            
        if not self.api_key:
            logger.warning("Neither OPENROUTER_KEY nor OPENAI_API_KEY found. LLM features will be disabled or fail.")

        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            default_headers=self.default_headers
        )

    @lru_cache(maxsize=100)
    def explain_sentence(self, text: str, language: str) -> PedagogicalData:
        """
        Generates a pedagogical explanation for the given sentence.
        Cached up to 100 recent unique queries.
        """
        try:
            prompt = self._get_prompt(language)
            
            # Allow model override via env var, useful for testing different OpenRouter models
            model = os.getenv("LLM_MODEL", self.model_name)

            completion = self.client.beta.chat.completions.parse(
                model=model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": f"Analyze this sentence: '{text}'"},
                ],
                response_format=PedagogicalData,
            )
            
            return completion.choices[0].message.parsed
        except Exception as e:
            logger.error(f"LLM explanation failed: {e}")
            raise e

    def _get_prompt(self, language: str) -> str:
        base_prompt = (
            "You are an expert linguistics professor teaching a student. "
            "Analyze the given sentence and provide a structured pedagogical explanation. "
            "Focus on the unique grammatical features of the language."
        )

        lang_specifics = {
            "it": "Focus on clitics, auxiliary selection (essere vs avere), and gender/number agreement.",
            "es": "Focus on object pronouns, ser vs estar, and subjunctive usage if present.",
            "de": "Focus on case governance (Nominative, Accusative, Dative, Genitive), verb placement (V2), and separable verbs.",
            "ru": "Focus on case usage, verbal aspect (perfective/imperfective), and motion verbs.",
            "tr": "Focus on agglutination. Break down suffix chains explicitly in your explanation. Explain vowel harmony and case suffixes.",
        }

        specific_instruction = lang_specifics.get(language, "Focus on key grammatical structures.")
        
        return f"{base_prompt} {specific_instruction}"

llm_service = LLMService()
