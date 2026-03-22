"""
Sentence Embedding Service

Uses sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2) to encode
sentences into 384-dimensional vectors. Supports all 5 target languages.

Embeddings enable:
  - Semantic similarity search ("find sentences like this one")
  - Clustering of analyzed sentences by topic
  - Retrieval-augmented learning recommendations
"""
import os
import time
import logging
from typing import List, Optional

import numpy as np

logger = logging.getLogger(__name__)

MODEL_NAME = os.getenv("EMBEDDING_MODEL", "paraphrase-multilingual-MiniLM-L12-v2")
EMBEDDING_DIM = 384

_model = None


def _get_model():
    """Lazy-load the sentence transformer model."""
    global _model
    if _model is None:
        t0 = time.perf_counter()
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer(MODEL_NAME)
            elapsed = (time.perf_counter() - t0) * 1000
            logger.info(f"Loaded embedding model '{MODEL_NAME}' in {elapsed:.0f}ms")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    return _model


class EmbeddingService:
    """Encodes sentences into dense vector embeddings for similarity search."""

    @property
    def available(self) -> bool:
        try:
            _get_model()
            return True
        except Exception:
            return False

    @property
    def dimension(self) -> int:
        return EMBEDDING_DIM

    def encode(self, text: str) -> Optional[List[float]]:
        """Encode a single sentence into a vector."""
        try:
            model = _get_model()
            t0 = time.perf_counter()
            embedding = model.encode(text, normalize_embeddings=True)
            elapsed = (time.perf_counter() - t0) * 1000
            logger.info(f"Encoded sentence in {elapsed:.0f}ms (dim={len(embedding)})")
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Embedding encode failed: {e}")
            return None

    def encode_batch(self, texts: List[str]) -> Optional[List[List[float]]]:
        """Encode multiple sentences in a single batch for efficiency."""
        if not texts:
            return []
        try:
            model = _get_model()
            t0 = time.perf_counter()
            embeddings = model.encode(texts, normalize_embeddings=True, batch_size=32)
            elapsed = (time.perf_counter() - t0) * 1000
            logger.info(f"Batch-encoded {len(texts)} sentences in {elapsed:.0f}ms")
            return [e.tolist() for e in embeddings]
        except Exception as e:
            logger.error(f"Batch embedding failed: {e}")
            return None

    @staticmethod
    def cosine_similarity(a: List[float], b: List[float]) -> float:
        """Compute cosine similarity between two normalized vectors."""
        arr_a = np.array(a)
        arr_b = np.array(b)
        return float(np.dot(arr_a, arr_b))

    def find_similar(
        self,
        query_embedding: List[float],
        candidate_embeddings: List[dict],
        top_k: int = 5,
    ) -> List[dict]:
        """
        Find the top-k most similar sentences from a list of candidates.

        Each candidate is a dict with at least 'embedding' and 'text' keys.
        Returns candidates sorted by similarity (descending), with 'similarity' added.
        """
        if not candidate_embeddings or not query_embedding:
            return []

        results = []
        for candidate in candidate_embeddings:
            emb = candidate.get("embedding")
            if emb:
                sim = self.cosine_similarity(query_embedding, emb)
                results.append({**candidate, "similarity": round(sim, 4)})

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]


embedding_service = EmbeddingService()
