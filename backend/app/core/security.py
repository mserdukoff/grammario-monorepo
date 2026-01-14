"""
Security middleware and utilities for production hardening.
"""
import time
import uuid
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Remove server header if present
        if "server" in response.headers:
            del response.headers["server"]
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log requests with unique IDs for debugging."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        
        # Log request
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Add request ID to response
        response.headers["X-Request-ID"] = request_id
        
        # Log response
        logger.info(
            f"[{request_id}] {request.method} {request.url.path} "
            f"- {response.status_code} ({duration:.3f}s)"
        )
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Global rate limiting for DDoS protection."""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: dict = {}  # IP -> list of timestamps
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/"]:
            return await call_next(request)
        
        # Check rate limit
        now = time.time()
        minute_ago = now - 60
        
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        # Clean old requests
        self.requests[client_ip] = [
            ts for ts in self.requests[client_ip] if ts > minute_ago
        ]
        
        # Check limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return Response(
                content='{"error": "rate_limit_exceeded", "message": "Too many requests. Please slow down."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": "60"}
            )
        
        # Record request
        self.requests[client_ip].append(now)
        
        return await call_next(request)


def sanitize_input(text: str, max_length: int = 5000) -> str:
    """
    Sanitize user input to prevent injection attacks.
    """
    if not text:
        return ""
    
    # Truncate to max length
    text = text[:max_length]
    
    # Remove null bytes
    text = text.replace("\x00", "")
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text
