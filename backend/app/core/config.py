"""
Application configuration using Pydantic Settings.
Loads from environment variables with sensible defaults.
"""
import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App Info
    APP_NAME: str = "Grammario API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS - comma-separated origins for production
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        if self.DEBUG:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # LLM Configuration
    OPENROUTER_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "google/gemini-2.0-flash-exp:free"
    
    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PRICE_ID: Optional[str] = None  # Price ID for $5/month subscription
    
    # Rate Limiting (generous limits during beta)
    RATE_LIMIT_FREE_PER_DAY: int = 100  # Generous for beta
    RATE_LIMIT_PRO_PER_DAY: int = 1000
    RATE_LIMIT_WINDOW_SECONDS: int = 86400  # 24 hours
    
    # Supabase (for token verification)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    
    # Stanza
    STANZA_RESOURCES_DIR: Optional[str] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
