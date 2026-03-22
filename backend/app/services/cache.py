import os
import json
import hashlib
import logging
import time
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("redis package not installed, caching disabled")


class CacheService:
    """Redis-backed cache for analysis results with TTL and hit-rate tracking."""

    DEFAULT_TTL = 86400  # 24 hours

    def __init__(self):
        self._client: Optional["redis.Redis"] = None
        self._hits = 0
        self._misses = 0

        if not REDIS_AVAILABLE:
            return

        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self._client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
                retry_on_timeout=True,
            )
            self._client.ping()
            logger.info(f"Redis cache connected: {redis_url}")
        except Exception as e:
            logger.warning(f"Redis not available, caching disabled: {e}")
            self._client = None

    @property
    def available(self) -> bool:
        return self._client is not None

    @property
    def hit_rate(self) -> float:
        total = self._hits + self._misses
        return self._hits / total if total > 0 else 0.0

    @property
    def stats(self) -> dict:
        return {
            "available": self.available,
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": round(self.hit_rate, 3),
        }

    @staticmethod
    def _cache_key(text: str, language: str) -> str:
        content = f"{language}:{text.strip().lower()}"
        digest = hashlib.sha256(content.encode()).hexdigest()[:16]
        return f"grammario:analysis:{digest}"

    def get(self, text: str, language: str) -> Optional[dict]:
        if not self._client:
            return None
        key = self._cache_key(text, language)
        try:
            raw = self._client.get(key)
            if raw:
                self._hits += 1
                logger.info(f"Cache HIT for key={key}")
                return json.loads(raw)
            self._misses += 1
            return None
        except Exception as e:
            logger.warning(f"Cache get failed: {e}")
            self._misses += 1
            return None

    def set(self, text: str, language: str, data: dict, ttl: int = DEFAULT_TTL) -> None:
        if not self._client:
            return
        key = self._cache_key(text, language)
        try:
            self._client.setex(key, ttl, json.dumps(data))
            logger.info(f"Cache SET key={key} ttl={ttl}s")
        except Exception as e:
            logger.warning(f"Cache set failed: {e}")

    def flush(self) -> int:
        """Flush all grammario cache keys. Returns count deleted."""
        if not self._client:
            return 0
        try:
            keys = list(self._client.scan_iter("grammario:*"))
            if keys:
                return self._client.delete(*keys)
            return 0
        except Exception as e:
            logger.warning(f"Cache flush failed: {e}")
            return 0


cache_service = CacheService()
