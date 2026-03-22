"""
CEFR Difficulty Scorer

Classifies sentence difficulty into CEFR levels (A1-C2) using engineered
linguistic features extracted from the parse tree. Uses a rule-based heuristic
mapping that can be swapped for a trained sklearn model.

Features:
  - Lexical: avg word length, type-token ratio, proportion of rare words
  - Syntactic: sentence length, dependency tree depth/width, subordinate clause count
  - Morphological: avg features per token, unique POS tags
"""
import math
import logging
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

from app.models.schemas import TokenNode

logger = logging.getLogger(__name__)

CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]

SUBORDINATE_DEPRELS = {
    "acl", "acl:relcl", "advcl", "csubj", "ccomp", "xcomp",
    "advcl:relcl", "acl:inf", "csubj:pass"
}


@dataclass
class LinguisticFeatures:
    """Extracted linguistic features for difficulty scoring."""
    sentence_length: int
    avg_word_length: float
    type_token_ratio: float
    tree_depth: int
    tree_width: int
    subordinate_clause_count: int
    avg_morphological_complexity: float
    unique_pos_count: int
    rare_word_proportion: float
    lexical_density: float

    def to_dict(self) -> dict:
        return {
            "sentence_length": self.sentence_length,
            "avg_word_length": round(self.avg_word_length, 2),
            "type_token_ratio": round(self.type_token_ratio, 2),
            "tree_depth": self.tree_depth,
            "tree_width": self.tree_width,
            "subordinate_clause_count": self.subordinate_clause_count,
            "avg_morphological_complexity": round(self.avg_morphological_complexity, 2),
            "unique_pos_count": self.unique_pos_count,
            "rare_word_proportion": round(self.rare_word_proportion, 2),
            "lexical_density": round(self.lexical_density, 2),
        }


class DifficultyScorer:
    """Scores sentence difficulty using linguistic feature engineering."""

    CONTENT_POS = {"NOUN", "VERB", "ADJ", "ADV"}

    def extract_features(
        self,
        nodes: List[TokenNode],
        frequency_bands: Optional[Dict[int, int]] = None,
    ) -> LinguisticFeatures:
        if not nodes:
            return LinguisticFeatures(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

        texts = [n.text for n in nodes]
        lemmas = [n.lemma.lower() for n in nodes if n.lemma]

        sentence_length = len(nodes)
        avg_word_length = sum(len(t) for t in texts) / len(texts) if texts else 0

        # Type-token ratio (lexical diversity)
        unique_lemmas = set(lemmas)
        ttr = len(unique_lemmas) / len(lemmas) if lemmas else 0

        # Dependency tree depth and width via BFS from root(s)
        children: Dict[int, List[int]] = {}
        for n in nodes:
            parent = n.head_id if n.head_id else 0
            children.setdefault(parent, []).append(n.id)

        tree_depth, tree_width = self._tree_metrics(children, nodes)

        # Subordinate clauses
        sub_count = sum(1 for n in nodes if n.deprel and n.deprel in SUBORDINATE_DEPRELS)

        # Morphological complexity: avg feature count per token
        morph_counts = []
        for n in nodes:
            if n.feats:
                morph_counts.append(len(n.feats.split("|")))
            else:
                morph_counts.append(0)
        avg_morph = sum(morph_counts) / len(morph_counts) if morph_counts else 0

        unique_pos = len({n.upos for n in nodes if n.upos})

        # Rare word proportion (from frequency bands if available)
        rare_proportion = 0.0
        if frequency_bands:
            rare_count = sum(1 for nid, band in frequency_bands.items() if band >= 4)
            rare_proportion = rare_count / sentence_length if sentence_length > 0 else 0

        # Lexical density: content words / total words
        content_count = sum(1 for n in nodes if n.upos in self.CONTENT_POS)
        lexical_density = content_count / sentence_length if sentence_length > 0 else 0

        return LinguisticFeatures(
            sentence_length=sentence_length,
            avg_word_length=avg_word_length,
            type_token_ratio=ttr,
            tree_depth=tree_depth,
            tree_width=tree_width,
            subordinate_clause_count=sub_count,
            avg_morphological_complexity=avg_morph,
            unique_pos_count=unique_pos,
            rare_word_proportion=rare_proportion,
            lexical_density=lexical_density,
        )

    def _tree_metrics(self, children: Dict[int, List[int]], nodes: List[TokenNode]) -> Tuple[int, int]:
        """BFS to compute max depth and max width of dependency tree."""
        roots = children.get(0, [])
        if not roots:
            return 0, 0

        max_depth = 0
        max_width = 0
        queue = [(r, 1) for r in roots]

        depth_counts: Dict[int, int] = {}
        visited = set()

        while queue:
            node_id, depth = queue.pop(0)
            if node_id in visited:
                continue
            visited.add(node_id)

            max_depth = max(max_depth, depth)
            depth_counts[depth] = depth_counts.get(depth, 0) + 1

            for child in children.get(node_id, []):
                if child not in visited:
                    queue.append((child, depth + 1))

        max_width = max(depth_counts.values()) if depth_counts else 0
        return max_depth, max_width

    def score(
        self,
        nodes: List[TokenNode],
        frequency_bands: Optional[Dict[int, int]] = None,
    ) -> Tuple[str, float, LinguisticFeatures]:
        """
        Score sentence difficulty.

        Returns:
            (cefr_level, raw_score_0_to_1, features)
        """
        features = self.extract_features(nodes, frequency_bands)
        raw_score = self._heuristic_score(features)
        cefr = self._score_to_cefr(raw_score)

        logger.info(
            f"Difficulty: {cefr} (score={raw_score:.2f}), "
            f"len={features.sentence_length}, depth={features.tree_depth}, "
            f"sub_clauses={features.subordinate_clause_count}"
        )
        return cefr, raw_score, features

    def _heuristic_score(self, f: LinguisticFeatures) -> float:
        """
        Weighted heuristic scoring. Returns 0.0 (trivial) to 1.0 (extremely complex).

        Weights are calibrated based on linguistic research on readability
        and CEFR proficiency descriptors.
        """
        components = []

        # Sentence length: 1-3 words trivial, 20+ complex
        len_score = min(f.sentence_length / 25.0, 1.0)
        components.append(("length", len_score, 0.15))

        # Average word length: short words = easy
        wl_score = min((f.avg_word_length - 2) / 8.0, 1.0)
        wl_score = max(wl_score, 0.0)
        components.append(("word_length", wl_score, 0.10))

        # Tree depth: deeper = more embedded clauses
        depth_score = min((f.tree_depth - 1) / 6.0, 1.0)
        depth_score = max(depth_score, 0.0)
        components.append(("tree_depth", depth_score, 0.20))

        # Subordinate clauses: 0 = simple, 3+ = very complex
        sub_score = min(f.subordinate_clause_count / 3.0, 1.0)
        components.append(("subordination", sub_score, 0.20))

        # Morphological complexity
        morph_score = min(f.avg_morphological_complexity / 5.0, 1.0)
        components.append(("morphology", morph_score, 0.10))

        # Type-token ratio: higher = more diverse vocabulary
        ttr_score = f.type_token_ratio
        components.append(("ttr", ttr_score, 0.10))

        # Rare words
        rare_score = min(f.rare_word_proportion / 0.5, 1.0)
        components.append(("rare_words", rare_score, 0.10))

        # Lexical density
        ld_score = f.lexical_density
        components.append(("lexical_density", ld_score, 0.05))

        total = sum(score * weight for _, score, weight in components)
        return min(max(total, 0.0), 1.0)

    @staticmethod
    def _score_to_cefr(score: float) -> str:
        if score < 0.15:
            return "A1"
        elif score < 0.30:
            return "A2"
        elif score < 0.45:
            return "B1"
        elif score < 0.60:
            return "B2"
        elif score < 0.78:
            return "C1"
        else:
            return "C2"


difficulty_scorer = DifficultyScorer()
