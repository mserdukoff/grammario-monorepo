# Load environment variables BEFORE importing other modules
from dotenv import load_dotenv
load_dotenv()

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import router as api_router
from app.api.billing import router as billing_router
from app.core.config import settings
from app.core.security import (
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware,
    RateLimitMiddleware,
)

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
    description="A deep-dive linguistic deconstruction tool for language learners.",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,  # Disable docs in production
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


# Security middlewares (order matters - first added = last executed)

# 1. CORS - must be first (last to execute on response)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Restricted methods
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "X-Request-ID"],
)

# 2. Trusted host validation (prevent host header attacks) - only in production
if not settings.DEBUG:
    allowed_hosts = ["localhost", "127.0.0.1", "*"]  # Allow all hosts since nginx handles this
    # Note: We allow "*" because nginx is the public-facing proxy and handles host validation
    # The backend only receives requests from nginx within the Docker network
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

# 3. Security headers
app.add_middleware(SecurityHeadersMiddleware)

# 4. Request logging with unique IDs
app.add_middleware(RequestLoggingMiddleware)

# 5. Global rate limiting (60 requests/minute per IP)
if not settings.DEBUG:
    app.add_middleware(RateLimitMiddleware, requests_per_minute=60)


# Include routers
app.include_router(api_router, prefix="/api/v1")
app.include_router(billing_router, prefix="/api/v1/billing")


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
            "stripe": bool(settings.STRIPE_SECRET_KEY),
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
