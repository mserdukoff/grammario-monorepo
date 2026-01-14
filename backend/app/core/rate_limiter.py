"""
In-memory rate limiter with sliding window algorithm.
For production, this should be replaced with Redis-backed rate limiting.
"""
import time
from typing import Dict, Tuple, Optional
from collections import defaultdict
import threading
from app.core.config import settings


class RateLimiter:
    """
    Simple in-memory rate limiter using sliding window.
    Thread-safe for concurrent requests.
    
    For production scale, replace with Redis:
    - Use INCR with EXPIRE for atomic counting
    - Supports distributed rate limiting across instances
    """
    
    def __init__(self):
        # user_id -> (count, window_start_timestamp)
        self._requests: Dict[str, Tuple[int, float]] = defaultdict(lambda: (0, time.time()))
        self._lock = threading.Lock()
        
    def _get_limit_for_tier(self, is_pro: bool) -> int:
        """Get the rate limit based on subscription tier."""
        return settings.RATE_LIMIT_PRO_PER_DAY if is_pro else settings.RATE_LIMIT_FREE_PER_DAY
    
    def check_rate_limit(self, user_id: str, is_pro: bool = False) -> Tuple[bool, Dict]:
        """
        Check if a user is within their rate limit.
        
        Returns:
            Tuple of (allowed: bool, info: dict)
            info contains: limit, remaining, reset_at
        """
        limit = self._get_limit_for_tier(is_pro)
        window = settings.RATE_LIMIT_WINDOW_SECONDS
        now = time.time()
        
        with self._lock:
            count, window_start = self._requests[user_id]
            
            # Check if we need to reset the window
            if now - window_start >= window:
                # New window
                self._requests[user_id] = (1, now)
                return True, {
                    "limit": limit,
                    "remaining": limit - 1,
                    "reset_at": int(now + window),
                    "used_today": 1
                }
            
            # Within current window
            if count >= limit:
                return False, {
                    "limit": limit,
                    "remaining": 0,
                    "reset_at": int(window_start + window),
                    "used_today": count
                }
            
            # Increment counter
            self._requests[user_id] = (count + 1, window_start)
            return True, {
                "limit": limit,
                "remaining": limit - count - 1,
                "reset_at": int(window_start + window),
                "used_today": count + 1
            }
    
    def get_usage(self, user_id: str, is_pro: bool = False) -> Dict:
        """Get current usage stats for a user without incrementing."""
        limit = self._get_limit_for_tier(is_pro)
        window = settings.RATE_LIMIT_WINDOW_SECONDS
        now = time.time()
        
        with self._lock:
            count, window_start = self._requests.get(user_id, (0, now))
            
            # Check if window has expired
            if now - window_start >= window:
                return {
                    "limit": limit,
                    "remaining": limit,
                    "reset_at": int(now + window),
                    "used_today": 0
                }
            
            return {
                "limit": limit,
                "remaining": max(0, limit - count),
                "reset_at": int(window_start + window),
                "used_today": count
            }
    
    def cleanup_old_entries(self, max_age: int = 172800):
        """
        Remove entries older than max_age seconds.
        Call periodically to prevent memory bloat.
        """
        now = time.time()
        window = settings.RATE_LIMIT_WINDOW_SECONDS
        
        with self._lock:
            expired = [
                uid for uid, (_, start) in self._requests.items()
                if now - start > max_age
            ]
            for uid in expired:
                del self._requests[uid]


# Global rate limiter instance
rate_limiter = RateLimiter()
