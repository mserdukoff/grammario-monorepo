"""
NLP API routes for Grammario.
Pure linguistic analysis service - auth and rate limiting handled by Next.js.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.models.schemas import AnalysisRequest, SentenceAnalysis
from app.services.nlp import nlp_service
from app.services.embeddings import embedding_service
from app.services.cache import cache_service
from app.core.security import sanitize_input
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_SENTENCE_LENGTH = 1000


@router.post("/analyze", response_model=SentenceAnalysis)
async def analyze_sentence(request: AnalysisRequest):
    """Analyze a sentence using spaCy/Stanza + LLM in parallel."""
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
        analysis = await nlp_service.analyze_text_async(text, request.language)
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


class EmbeddingRequest(BaseModel):
    text: str
    language: Optional[str] = None


@router.post("/embed")
async def embed_sentence(request: EmbeddingRequest):
    """Generate a sentence embedding vector for similarity search."""
    if not embedding_service.available:
        raise HTTPException(status_code=503, detail="Embedding service not available")

    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    embedding = embedding_service.encode(text)
    if embedding is None:
        raise HTTPException(status_code=500, detail="Failed to generate embedding")

    return {
        "text": text,
        "embedding": embedding,
        "dimension": len(embedding),
    }


@router.get("/cache/stats")
async def cache_stats():
    """Return cache statistics."""
    return cache_service.stats


@router.post("/cache/flush")
async def cache_flush():
    """Flush all cached analysis results."""
    deleted = cache_service.flush()
    return {"flushed": deleted}


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
