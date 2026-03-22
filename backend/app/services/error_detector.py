"""
Grammar Error Detection Service

Combines rule-based heuristics from the dependency parse tree with LLM-powered
error detection. Rule-based checks catch structural errors (agreement, case);
the LLM prompt is enhanced to additionally return grammar errors.

Rule-based checks by language family:
  - Romance (IT, ES): article-noun gender agreement, subject-verb number agreement
  - Inflected (DE, RU): case governance, adjective-noun agreement
  - Agglutinative (TR): vowel harmony violations
"""
import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict

from app.models.schemas import TokenNode

logger = logging.getLogger(__name__)

# Universal dependency relations for subject-verb pairs
SUBJ_DEPRELS = {"nsubj", "nsubj:pass", "csubj", "csubj:pass"}


@dataclass
class GrammarError:
    word: str
    word_id: int
    error_type: str
    severity: str  # "info", "warning", "error"
    message: str
    correction: Optional[str] = None
    rule: Optional[str] = None

    def to_dict(self) -> dict:
        return {k: v for k, v in asdict(self).items() if v is not None}


class ErrorDetector:
    """Detect grammar errors using dependency parse tree heuristics."""

    def detect(self, nodes: List[TokenNode], language: str) -> List[GrammarError]:
        errors = []
        node_map = {n.id: n for n in nodes}

        if language in ("it", "es"):
            errors.extend(self._check_romance_agreement(nodes, node_map, language))
        elif language in ("de", "ru"):
            errors.extend(self._check_inflection_agreement(nodes, node_map, language))
        elif language == "tr":
            errors.extend(self._check_turkish(nodes, node_map))

        errors.extend(self._check_universal(nodes, node_map))

        return errors

    def _parse_feats(self, feats_str: Optional[str]) -> Dict[str, str]:
        if not feats_str:
            return {}
        result = {}
        for pair in feats_str.split("|"):
            if "=" in pair:
                k, v = pair.split("=", 1)
                result[k] = v
        return result

    def _check_romance_agreement(
        self, nodes: List[TokenNode], node_map: Dict[int, TokenNode], lang: str
    ) -> List[GrammarError]:
        """Check article-noun and adjective-noun gender/number agreement for Romance languages."""
        errors = []

        for node in nodes:
            if node.upos not in ("DET", "ADJ"):
                continue

            head = node_map.get(node.head_id)
            if not head or head.upos != "NOUN":
                continue

            det_feats = self._parse_feats(node.feats)
            noun_feats = self._parse_feats(head.feats)

            det_gender = det_feats.get("Gender")
            noun_gender = noun_feats.get("Gender")
            det_number = det_feats.get("Number")
            noun_number = noun_feats.get("Number")

            if det_gender and noun_gender and det_gender != noun_gender:
                errors.append(GrammarError(
                    word=node.text,
                    word_id=node.id,
                    error_type="gender_agreement",
                    severity="warning",
                    message=f"'{node.text}' ({det_gender}) may not agree in gender with '{head.text}' ({noun_gender})",
                    rule=f"In {lang.upper()}, determiners and adjectives must match the gender of the noun they modify.",
                ))

            if det_number and noun_number and det_number != noun_number:
                errors.append(GrammarError(
                    word=node.text,
                    word_id=node.id,
                    error_type="number_agreement",
                    severity="warning",
                    message=f"'{node.text}' ({det_number}) may not agree in number with '{head.text}' ({noun_number})",
                    rule=f"In {lang.upper()}, determiners and adjectives must match the number of the noun.",
                ))

        return errors

    def _check_inflection_agreement(
        self, nodes: List[TokenNode], node_map: Dict[int, TokenNode], lang: str
    ) -> List[GrammarError]:
        """Check case/gender agreement for German and Russian."""
        errors = []

        for node in nodes:
            if node.upos == "ADJ" and node.deprel in ("amod", "nmod"):
                head = node_map.get(node.head_id)
                if not head or head.upos != "NOUN":
                    continue

                adj_feats = self._parse_feats(node.feats)
                noun_feats = self._parse_feats(head.feats)

                adj_case = adj_feats.get("Case")
                noun_case = noun_feats.get("Case")

                if adj_case and noun_case and adj_case != noun_case:
                    errors.append(GrammarError(
                        word=node.text,
                        word_id=node.id,
                        error_type="case_agreement",
                        severity="warning",
                        message=f"'{node.text}' ({adj_case}) may not agree in case with '{head.text}' ({noun_case})",
                        rule=f"In {lang.upper()}, adjectives must match the case of the noun they modify.",
                    ))

                adj_gender = adj_feats.get("Gender")
                noun_gender = noun_feats.get("Gender")
                if adj_gender and noun_gender and adj_gender != noun_gender:
                    errors.append(GrammarError(
                        word=node.text,
                        word_id=node.id,
                        error_type="gender_agreement",
                        severity="warning",
                        message=f"'{node.text}' ({adj_gender}) may not agree in gender with '{head.text}' ({noun_gender})",
                        rule=f"In {lang.upper()}, adjectives must agree in gender with their noun.",
                    ))

        return errors

    def _check_turkish(
        self, nodes: List[TokenNode], node_map: Dict[int, TokenNode]
    ) -> List[GrammarError]:
        """Check for common Turkish-specific issues like vowel harmony."""
        errors = []
        front_vowels = set("eiöü")
        back_vowels = set("aıou")

        for node in nodes:
            if not node.feats or node.upos in ("PUNCT", "PROPN"):
                continue

            text_lower = node.text.lower()
            vowels_in_word = [c for c in text_lower if c in front_vowels | back_vowels]

            if len(vowels_in_word) >= 2:
                has_front = any(v in front_vowels for v in vowels_in_word)
                has_back = any(v in back_vowels for v in vowels_in_word)

                if has_front and has_back:
                    # This could be a compound word or loanword, so just info-level
                    if node.lemma and node.text.lower() != node.lemma.lower():
                        lemma_vowels = [c for c in node.lemma.lower() if c in front_vowels | back_vowels]
                        suffix_start = len(node.lemma)
                        suffix = text_lower[suffix_start:] if suffix_start < len(text_lower) else ""
                        suffix_vowels = [c for c in suffix if c in front_vowels | back_vowels]

                        if suffix_vowels and lemma_vowels:
                            last_stem_vowel_is_front = lemma_vowels[-1] in front_vowels
                            first_suffix_vowel_is_front = suffix_vowels[0] in front_vowels
                            if last_stem_vowel_is_front != first_suffix_vowel_is_front:
                                errors.append(GrammarError(
                                    word=node.text,
                                    word_id=node.id,
                                    error_type="vowel_harmony",
                                    severity="info",
                                    message=f"Possible vowel harmony issue in '{node.text}': stem ends with {'front' if last_stem_vowel_is_front else 'back'} vowel but suffix has {'front' if first_suffix_vowel_is_front else 'back'} vowel",
                                    rule="Turkish vowel harmony: suffixes must match the frontness/backness of the last vowel in the stem.",
                                ))

        return errors

    def _check_universal(
        self, nodes: List[TokenNode], node_map: Dict[int, TokenNode]
    ) -> List[GrammarError]:
        """Universal checks that apply to all languages."""
        errors = []

        for node in nodes:
            if node.deprel not in SUBJ_DEPRELS:
                continue
            verb = node_map.get(node.head_id)
            if not verb or verb.upos != "VERB":
                continue

            subj_feats = self._parse_feats(node.feats)
            verb_feats = self._parse_feats(verb.feats)

            subj_number = subj_feats.get("Number")
            verb_number = verb_feats.get("Number")
            subj_person = subj_feats.get("Person")
            verb_person = verb_feats.get("Person")

            if subj_number and verb_number and subj_number != verb_number:
                errors.append(GrammarError(
                    word=verb.text,
                    word_id=verb.id,
                    error_type="subject_verb_agreement",
                    severity="warning",
                    message=f"Subject '{node.text}' ({subj_number}) may not agree in number with verb '{verb.text}' ({verb_number})",
                    rule="Subjects and verbs must agree in number.",
                ))

            if subj_person and verb_person and subj_person != verb_person:
                errors.append(GrammarError(
                    word=verb.text,
                    word_id=verb.id,
                    error_type="subject_verb_person",
                    severity="info",
                    message=f"Subject '{node.text}' (person={subj_person}) and verb '{verb.text}' (person={verb_person}) may not agree in person",
                ))

        return errors


error_detector = ErrorDetector()
