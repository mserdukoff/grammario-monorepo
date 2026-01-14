"""
Main API routes for Grammario.
Handles sentence analysis and user usage tracking.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Response
from app.models.schemas import AnalysisRequest, SentenceAnalysis, UsageStats
from app.services.nlp import nlp_service
from app.core.firebase_auth import get_current_user, FirebaseUser
from app.core.rate_limiter import rate_limiter
from app.core.security import sanitize_input
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Maximum sentence length to prevent abuse
MAX_SENTENCE_LENGTH = 1000


def add_rate_limit_headers(response: Response, rate_info: dict):
    """Add rate limit headers to response."""
    response.headers["X-RateLimit-Limit"] = str(rate_info["limit"])
    response.headers["X-RateLimit-Remaining"] = str(rate_info["remaining"])
    response.headers["X-RateLimit-Reset"] = str(rate_info["reset_at"])


@router.post("/analyze", response_model=SentenceAnalysis)
async def analyze_sentence(
    request: AnalysisRequest,
    response: Response,
    user: Optional[FirebaseUser] = Depends(get_current_user)
):
    """
    Analyze a sentence using Stanza with language-specific strategies.
    
    Rate limited:
    - Anonymous/Free: 10 analyses per day
    - Pro subscribers: 1000 analyses per day
    """
    # Determine user ID (use IP for anonymous users in production)
    user_id = user.uid if user else "anonymous"
    is_pro = user.is_pro if user else False
    
    # Check rate limit
    allowed, rate_info = rate_limiter.check_rate_limit(user_id, is_pro)
    add_rate_limit_headers(response, rate_info)
    
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limit_exceeded",
                "message": f"Daily limit of {rate_info['limit']} analyses reached. Upgrade to Pro for unlimited access.",
                "reset_at": rate_info["reset_at"],
                "upgrade_url": "/pricing"
            }
        )
    
    # Sanitize and validate input
    text = sanitize_input(request.text, max_length=MAX_SENTENCE_LENGTH)
    if not text:
        raise HTTPException(
            status_code=400,
            detail={"error": "invalid_input", "message": "Text cannot be empty"}
        )
    
    if len(text) > MAX_SENTENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "text_too_long",
                "message": f"Text must be {MAX_SENTENCE_LENGTH} characters or less"
            }
        )
    
    try:
        analysis = nlp_service.analyze_text(text, request.language)
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "analysis_failed",
                "message": "Failed to analyze sentence. Please try again."
            }
        )


@router.get("/usage", response_model=UsageStats)
async def get_usage(
    response: Response,
    user: Optional[FirebaseUser] = Depends(get_current_user)
):
    """
    Get current usage statistics for the user.
    Includes daily limits and remaining quota.
    """
    user_id = user.uid if user else "anonymous"
    is_pro = user.is_pro if user else False
    
    rate_info = rate_limiter.get_usage(user_id, is_pro)
    add_rate_limit_headers(response, rate_info)
    
    return UsageStats(
        used_today=rate_info["used_today"],
        limit=rate_info["limit"],
        remaining=rate_info["remaining"],
        reset_at=rate_info["reset_at"],
        is_pro=is_pro
    )


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages with metadata."""
    return {
        "languages": [
            {
                "code": "it",
                "name": "Italian",
                "native_name": "Italiano",
                "family": "Romance",
                "sample": "Il gatto mangia il pesce."
            },
            {
                "code": "es",
                "name": "Spanish",
                "native_name": "Español",
                "family": "Romance",
                "sample": "El gato come el pescado."
            },
            {
                "code": "de",
                "name": "German",
                "native_name": "Deutsch",
                "family": "Germanic",
                "sample": "Die Katze frisst den Fisch."
            },
            {
                "code": "ru",
                "name": "Russian",
                "native_name": "Русский",
                "family": "Slavic",
                "sample": "Кошка ест рыбу."
            },
            {
                "code": "tr",
                "name": "Turkish",
                "native_name": "Türkçe",
                "family": "Turkic",
                "sample": "Kedi balığı yiyor."
            },
        ]
    }
