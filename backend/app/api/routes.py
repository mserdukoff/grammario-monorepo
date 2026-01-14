"""
NLP API routes for Grammario.
Pure linguistic analysis service - auth and rate limiting handled by Next.js.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalysisRequest, SentenceAnalysis
from app.services.nlp import nlp_service
from app.core.security import sanitize_input
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Maximum sentence length to prevent abuse
MAX_SENTENCE_LENGTH = 1000


@router.post("/analyze", response_model=SentenceAnalysis)
async def analyze_sentence(request: AnalysisRequest):
    """
    Analyze a sentence using Stanza with language-specific strategies.
    
    This is a pure NLP endpoint - authentication and rate limiting
    are handled by the Next.js frontend.
    """
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
