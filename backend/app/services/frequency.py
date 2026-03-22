"""
Word Frequency Analysis Service

Looks up word frequency bands for each token using per-language frequency lists
derived from large corpora (OpenSubtitles/Wikipedia). Band 1 = top 500 (most common),
Band 5 = beyond top 10,000 (rare).

Frequency lists are stored as JSON files at backend/data/frequency/{lang}.json
where each file maps lowercased lemma -> rank (1-based).
"""
import os
import json
import logging
from typing import Dict, List, Optional
from functools import lru_cache

from app.models.schemas import TokenNode

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "frequency")


def _band_from_rank(rank: int) -> int:
    """Convert a frequency rank to a 1-5 band."""
    if rank <= 500:
        return 1
    elif rank <= 2000:
        return 2
    elif rank <= 5000:
        return 3
    elif rank <= 10000:
        return 4
    else:
        return 5


class FrequencyService:
    """Provides word frequency band lookups per language."""

    def __init__(self):
        self._freq_maps: Dict[str, Dict[str, int]] = {}
        self._load_all()

    def _load_all(self):
        if not os.path.isdir(DATA_DIR):
            logger.warning(f"Frequency data directory not found: {DATA_DIR}")
            return

        for fname in os.listdir(DATA_DIR):
            if fname.endswith(".json"):
                lang = fname.replace(".json", "")
                path = os.path.join(DATA_DIR, fname)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self._freq_maps[lang] = data
                    logger.info(f"Loaded frequency list for '{lang}': {len(data)} entries")
                except Exception as e:
                    logger.error(f"Failed to load frequency list '{fname}': {e}")

    @property
    def supported_languages(self) -> list:
        return list(self._freq_maps.keys())

    def get_rank(self, lemma: str, language: str) -> Optional[int]:
        """Get the frequency rank of a word (1-based). None if not found."""
        freq_map = self._freq_maps.get(language)
        if not freq_map:
            return None
        return freq_map.get(lemma.lower())

    def get_band(self, lemma: str, language: str) -> Optional[int]:
        """Get frequency band (1=most common, 5=rare). None if language not loaded."""
        rank = self.get_rank(lemma, language)
        if rank is not None:
            return _band_from_rank(rank)
        freq_map = self._freq_maps.get(language)
        if freq_map is None:
            return None
        return 5  # Word not in top-N list -> rare

    def annotate_nodes(self, nodes: List[TokenNode], language: str) -> Dict[int, int]:
        """
        Annotate tokens with frequency bands.
        Returns dict mapping node.id -> frequency_band.
        """
        bands = {}
        for node in nodes:
            lemma = node.lemma if node.lemma else node.text
            band = self.get_band(lemma, language)
            if band is not None:
                bands[node.id] = band
        return bands


frequency_service = FrequencyService()
