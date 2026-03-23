# Load environment variables BEFORE importing other modules
from dotenv import load_dotenv
load_dotenv()

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import router as api_router
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    import os
    
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"CORS origins: {settings.cors_origins_list}")
    
    # Pre-load NLP models at startup
    if os.environ.get("PRELOAD_MODELS", "false").lower() == "true":
        preferred_engine = os.environ.get("PREFERRED_ENGINE", "spacy")

        if preferred_engine == "spacy":
            logger.info("Pre-loading spaCy models at startup...")
            from app.services.spacy_manager import spacy_manager
            if spacy_manager.available:
                for lang in spacy_manager.SUPPORTED_LANGUAGES:
                    try:
                        logger.info(f"Loading spaCy model: {lang}")
                        spacy_manager.get_pipeline(lang)
                    except Exception as e:
                        logger.error(f"Failed to pre-load spaCy {lang}: {e}")
                logger.info(f"spaCy models loaded: {spacy_manager.get_loaded_models()}")

        logger.info("Pre-loading Stanza models at startup...")
        from app.services.stanza_manager import stanza_manager
        # Always load Turkish with Stanza (no spaCy support)
        stanza_langs = stanza_manager.SUPPORTED_LANGUAGES if preferred_engine != "spacy" else ["tr"]
        for lang in stanza_langs:
            try:
                logger.info(f"Loading Stanza model: {lang}")
                stanza_manager.get_pipeline(lang)
            except Exception as e:
                logger.error(f"Failed to pre-load Stanza {lang}: {e}")
        logger.info(f"Stanza models loaded: {stanza_manager.get_loaded_models()}")

        # Pre-load embedding model
        logger.info("Pre-loading embedding model...")
        try:
            from app.services.embeddings import embedding_service
            embedding_service.encode("warmup")
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.warning(f"Failed to pre-load embedding model: {e}")
    
    yield
    # Shutdown
    logger.info("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="A deep-dive linguistic analysis engine for language learners.",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions gracefully."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An unexpected error occurred. Please try again later.",
        }
    )


# CORS middleware - allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/health")
async def health_check():
    """Detailed health check with model status, cache metrics, and engine info."""
    from app.services.stanza_manager import stanza_manager
    from app.services.spacy_manager import spacy_manager
    from app.services.cache import cache_service
    from app.services.embeddings import embedding_service
    import psutil
    import os

    process = psutil.Process(os.getpid())
    mem_info = process.memory_info()

    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "services": {
            "llm": bool(settings.OPENROUTER_KEY or settings.OPENAI_API_KEY),
            "cache": cache_service.stats,
            "embeddings": embedding_service.available,
        },
        "engines": {
            "preferred": os.getenv("PREFERRED_ENGINE", "spacy"),
            "spacy": {
                "available": spacy_manager.available,
                "loaded": spacy_manager.get_loaded_models() if spacy_manager.available else [],
                "supported": spacy_manager.SUPPORTED_LANGUAGES if spacy_manager.available else [],
            },
            "stanza": {
                "loaded": stanza_manager.get_loaded_models(),
                "max_loaded": stanza_manager.MAX_LOADED_MODELS,
                "supported": stanza_manager.SUPPORTED_LANGUAGES,
            },
        },
        "features": {
            "difficulty_scoring": True,
            "error_detection": True,
            "sentence_embeddings": embedding_service.available,
        },
        "memory": {
            "rss_mb": round(mem_info.rss / 1024 / 1024, 1),
            "vms_mb": round(mem_info.vms / 1024 / 1024, 1),
        },
    }


@app.post("/warmup/{language}")
async def warmup_model(language: str):
    """
    Pre-load a Stanza model for a specific language.
    This can take 1-3 minutes if the model needs to download.
    """
    from app.services.stanza_manager import stanza_manager
    
    if language not in stanza_manager.SUPPORTED_LANGUAGES:
        return {"error": f"Unsupported language: {language}"}
    
    try:
        # This will download and load the model if not already loaded
        stanza_manager.get_pipeline(language)
        return {
            "status": "success",
            "language": language,
            "loaded_models": stanza_manager.get_loaded_models()
        }
    except Exception as e:
        logger.error(f"Failed to warm up model {language}: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
