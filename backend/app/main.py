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
    
    # Pre-load Stanza models if PRELOAD_MODELS is set
    if os.environ.get("PRELOAD_MODELS", "false").lower() == "true":
        logger.info("Pre-loading Stanza models at startup...")
        from app.services.stanza_manager import stanza_manager
        for lang in stanza_manager.SUPPORTED_LANGUAGES:
            try:
                logger.info(f"Loading model: {lang}")
                stanza_manager.get_pipeline(lang)
            except Exception as e:
                logger.error(f"Failed to pre-load {lang}: {e}")
        logger.info(f"Models loaded: {stanza_manager.get_loaded_models()}")
    
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
    """Detailed health check endpoint."""
    from app.services.stanza_manager import stanza_manager
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "services": {
            "llm": bool(settings.OPENROUTER_KEY or settings.OPENAI_API_KEY),
        },
        "models": {
            "loaded": stanza_manager.get_loaded_models(),
            "max_loaded": stanza_manager.MAX_LOADED_MODELS,
            "supported": stanza_manager.SUPPORTED_LANGUAGES,
        }
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
