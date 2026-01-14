"""
Application configuration using Pydantic Settings.
Loads from environment variables with sensible defaults.

This is a pure NLP service - auth and billing are handled by Next.js.
"""
import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App Info
    APP_NAME: str = "Grammario NLP Engine"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS - comma-separated origins (typically just the Next.js frontend)
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        if self.DEBUG:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # LLM Configuration (for pedagogical data generation)
    OPENROUTER_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "google/gemini-2.0-flash-exp:free"
    
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
