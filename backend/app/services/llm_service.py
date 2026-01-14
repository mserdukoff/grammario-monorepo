import os
import json
import logging
from openai import OpenAI
from app.models.schemas import PedagogicalData, GrammarConcept, GrammarTip

logger = logging.getLogger(__name__)


class LLMService:
    # Best models on OpenRouter for language analysis (in order of capability)
    OPENROUTER_BEST_MODELS = [
        "anthropic/claude-sonnet-4",      # Latest Claude Sonnet - excellent for languages
        "anthropic/claude-3.5-sonnet",     # Claude 3.5 Sonnet - great balance
        "openai/gpt-4o",                   # GPT-4o - very capable
        "google/gemini-pro-1.5",           # Gemini Pro 1.5
        "anthropic/claude-3-haiku",        # Fast and cheap fallback
    ]
    
    def __init__(self):
        openrouter_key = os.getenv("OPENROUTER_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        
        self.api_key = None
        self.base_url = None
        self.model_name = None
        self.default_headers = None
        
        # Priority: OpenRouter (more model options) > OpenAI
        if openrouter_key:
            self._setup_openrouter(openrouter_key)
        elif openai_key:
            self._setup_openai(openai_key)
        
        if not self.api_key:
            logger.warning("No LLM API key found. Set OPENROUTER_KEY or OPENAI_API_KEY.")
            self.client = None
        else:
            logger.info(f"LLM Service initialized with model: {self.model_name}")
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
                default_headers=self.default_headers
            )
    
    def _setup_openai(self, api_key: str):
        """Configure for direct OpenAI API."""
        self.api_key = api_key
        self.base_url = None
        self.model_name = os.getenv("LLM_MODEL", "gpt-4o-mini")
        self.default_headers = None
        logger.info("Using OpenAI directly")
    
    def _setup_openrouter(self, api_key: str):
        """Configure for OpenRouter API with best available model."""
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"
        # Use env var or default to best model
        self.model_name = os.getenv("LLM_MODEL", self.OPENROUTER_BEST_MODELS[0])
        self.default_headers = {
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Grammario",
        }
        logger.info(f"Using OpenRouter with model: {self.model_name}")

    def explain_sentence(self, text: str, language: str) -> PedagogicalData:
        """
        Generates a pedagogical explanation for the given sentence.
        Uses manual caching to avoid caching errors.
        """
        if not self.client:
            raise Exception("LLM service not configured")
        
        # Check cache first
        cache_key = f"{language}:{text}"
        if hasattr(self, '_cache') and cache_key in self._cache:
            logger.info(f"Returning cached result for: {text[:30]}...")
            return self._cache[cache_key]
            
        try:
            prompt = self._get_prompt(language)
            model = os.getenv("LLM_MODEL", self.model_name)

            logger.info(f"Calling LLM for language: {language}, text: {text[:50]}...")
            
            # Try with JSON mode first, fall back to regular completion
            try:
                completion = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": f"Analyze this sentence: '{text}'"},
                    ],
                    response_format={"type": "json_object"},
                )
            except Exception as json_mode_error:
                logger.warning(f"JSON mode failed, trying without: {json_mode_error}")
                # Fallback without response_format for providers that don't support it
                completion = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": f"Analyze this sentence: '{text}'\n\nRespond ONLY with valid JSON, no other text."},
                    ],
                )
            
            # Parse the JSON response
            content = completion.choices[0].message.content
            logger.info(f"LLM response received, length: {len(content) if content else 0}")
            
            if not content:
                logger.error("LLM returned empty response")
                raise Exception("LLM returned empty response")
            
            # Try to extract JSON from the response (handle markdown code blocks)
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            logger.debug(f"LLM cleaned response: {content[:300]}...")
                
            data = json.loads(content)
            logger.info(f"Parsed JSON with keys: {list(data.keys())}")
            
            # Build PedagogicalData from response
            concepts = []
            for concept in data.get("concepts", []):
                concepts.append(GrammarConcept(
                    name=concept.get("name", ""),
                    description=concept.get("description", ""),
                    related_words=concept.get("related_words", [])
                ))
            
            # Parse tips
            tips = []
            for tip in data.get("tips", []):
                tips.append(GrammarTip(
                    word=tip.get("word", ""),
                    question=tip.get("question", ""),
                    explanation=tip.get("explanation", ""),
                    rule=tip.get("rule"),
                    examples=tip.get("examples")
                ))
            
            result = PedagogicalData(
                translation=data.get("translation", ""),
                nuance=data.get("nuance"),
                concepts=concepts,
                tips=tips if tips else None
            )
            
            # Cache successful result
            if not hasattr(self, '_cache'):
                self._cache = {}
            if len(self._cache) > 100:
                # Simple cache eviction - clear half
                keys = list(self._cache.keys())[:50]
                for k in keys:
                    del self._cache[k]
            self._cache[cache_key] = result
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON response: {e}")
            raise Exception("Failed to parse LLM response")
        except Exception as e:
            logger.error(f"LLM explanation failed: {e}")
            raise e

    def _get_prompt(self, language: str) -> str:
        lang_names = {
            "it": "Italian",
            "es": "Spanish", 
            "de": "German",
            "ru": "Russian",
            "tr": "Turkish"
        }
        
        lang_specifics = {
            "it": """Focus on: clitics (mi, ti, lo, la, ci, vi, li, le), auxiliary selection (essere vs avere), gender/number agreement, and article usage.

For TIPS, you MUST explain:
- WHY "essere" vs "avere" as auxiliary (e.g., "sono andato" - motion verbs use essere)
- WHY articles change (il/lo/la/i/gli/le) based on the following word
- WHY certain verbs require specific prepositions (pensare A, parlare DI)
- WHY clitic pronouns are positioned where they are
- WHY gender/number agreement works the way it does
Example tip: "perché 'gli' invece di 'i'?" → Because words starting with z, s+consonant, gn, ps, x take 'gli' (gli studenti)""",

            "es": """Focus on: object pronouns, ser vs estar distinction, subjunctive mood if present, and reflexive verbs.

For TIPS, you MUST explain:
- WHY "ser" vs "estar" in this specific context (inherent quality vs temporary state vs location)
- WHY subjunctive is triggered (doubt, emotion, wish, impersonal expression)
- WHY "a personal" is used with animate direct objects
- WHY reflexive form is required for certain verbs
- WHY indirect object pronouns double with "a + noun"
Example tip: "¿por qué 'está' y no 'es'?" → Because we're describing a temporary state/condition, not an inherent characteristic""",

            "de": """Focus on: case governance (Nominative, Accusative, Dative, Genitive), verb placement (V2 rule), separable prefix verbs, and gender agreement.

For TIPS, you MUST explain:
- WHY this verb requires Accusative/Dative/Genitive (e.g., "helfen" takes Dative)
- WHY this preposition triggers this case (e.g., "mit" always takes Dative)
- WHY the verb is in second position / final position (main clause vs subordinate)
- WHY the separable prefix moved to the end
- WHY adjective endings change based on article type
Example tip: "Warum 'dem Mann' und nicht 'den Mann'?" → Because "helfen" (to help) governs the Dative case, not Accusative""",

            "ru": """Focus on: case usage and endings, verbal aspect (perfective vs imperfective), motion verbs, and lack of articles.

For TIPS, you MUST explain:
- WHY this verb requires this case (e.g., "помогать" takes Dative)
- WHY perfective vs imperfective aspect (completed action vs ongoing/repeated)
- WHY motion verb is directional vs non-directional (идти vs ходить)
- WHY preposition triggers this case (в + Accusative for direction, в + Prepositional for location)
- WHY this ending and not another (gender/number/case agreement)
Example tip: "Почему 'книгу' а не 'книга'?" → Because it's the direct object (Accusative case). Feminine nouns change -а to -у in Accusative.""",

            "tr": """Focus on AGGLUTINATION - this is critical! 
Turkish words are built by stacking suffixes. You MUST break down each word into its morphemes.
For example: 'odasına' = oda (room) + sı (3rd person possessive) + n (buffer) + a (dative case) = "to his/her room"
For example: 'gidiyorum' = git (go) + iyor (present continuous) + um (1st person) = "I am going"

For TIPS, you MUST explain:
- WHY each suffix is needed (e.g., why -a? because 'girmek' requires dative for the destination)
- Vowel harmony rules (why -sı not -su? why -a not -e?)
- Buffer consonants (when and why 'n' appears between vowels)
- Case requirements of verbs (which verbs take which cases)
- Consonant mutations (k→ğ, t→d, p→b before vowels)
Example tip: "Neden 'odasına' ve 'odasına' değil 'odası'?" → Because "girmek" requires the Dative case (-a/-e) for the destination you enter INTO.""",
        }

        lang_name = lang_names.get(language, "the target language")
        specific = lang_specifics.get(language, "Focus on key grammatical structures.")
        
        return f"""You are an expert {lang_name} linguistics professor teaching a language learner.
Analyze the given sentence and provide a structured pedagogical explanation.

{specific}

You MUST respond with valid JSON in this exact format:
{{
  "translation": "Natural English translation of the sentence",
  "nuance": "Any cultural context or subtle meaning (optional, can be null)",
  "concepts": [
    {{
      "name": "Grammar Concept Name",
      "description": "Clear explanation of this grammar point as it appears in the sentence",
      "related_words": ["word1", "word2"]
    }}
  ],
  "tips": [
    {{
      "word": "the specific word form being explained",
      "question": "Why does X take Y? / Why is Z used here?",
      "explanation": "Because [verb/preposition] requires [case/form]. In this sentence...",
      "rule": "The underlying grammar rule (optional)",
      "examples": ["additional example 1", "additional example 2"]
    }}
  ]
}}

IMPORTANT:
- Include 2-4 grammar concepts
- Include 2-4 tips that answer "WHY" questions about specific word forms
- Tips should explain the REASON behind grammatical choices, not just describe them
- Be specific about which verbs/prepositions require which cases/forms"""


llm_service = LLMService()
