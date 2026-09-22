"""
Application Configuration Module.

WHAT IT IS:
    This module centralizes all environment variables and configuration settings
    using Pydantic's BaseSettings.

WHY WE USE IT:
    Hardcoding configuration credentials (database passwords, API keys, endpoints)
    leads to security vulnerabilities and deployment failures. Centralizing settings
    ensures validation at startup and allows seamless transitions between local
    development, testing, and production (Render).

HOW IT CONNECTS:
    Other modules import the singleton `settings` object to obtain verified configuration
    values (e.g. database connection string, Supabase URL, Gemini API key).
"""

import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class ApplicationSettings(BaseSettings):
    """
    Manages typed application configuration loaded from environment variables and .env files.
    """

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # General Application Settings
    PROJECT_NAME: str = "Cognitio Libera"
    PROJECT_TAGLINE: str = "Practice. Understand. Improve."
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", description="Current environment: development or production")
    PORT: int = Field(default=8000, description="Port the FastAPI server binds to")

    # Security & CORS
    FRONTEND_URL: str = Field(
        default="http://localhost:5173",
        description="Public URL of the frontend application for CORS authorization"
    )
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://*.onrender.com"
    ]

    # Database Configuration (Supabase PostgreSQL / SQLite local fallback)
    DATABASE_URL: str = Field(
        default="sqlite:///./cognitio_libera.db",
        description="SQLAlchemy database connection string. Supports Supabase PostgreSQL and SQLite"
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, raw_url: Union[str, None]) -> str:
        """
        Normalizes database URLs for SQLAlchemy compatibility.

        Args:
            raw_url: Raw database URL provided by environment or Supabase.

        Returns:
            Normalized database URL with 'postgresql://' scheme.

        Explanation:
            Supabase and Render often provide connection strings starting with 'postgres://',
            which causes errors in SQLAlchemy 2.0. This validator ensures it uses 'postgresql://'.
        """
        if not raw_url:
            return "sqlite:///./cognitio_libera.db"
        if raw_url.startswith("postgres://"):
            return raw_url.replace("postgres://", "postgresql://", 1)
        return raw_url

    # Supabase Configuration
    SUPABASE_URL: str = Field(
        default="https://demo-cognitio.supabase.co",
        description="The REST endpoint URL of the Supabase project"
    )
    SUPABASE_ANON_KEY: str = Field(
        default="demo-anon-key",
        description="Public anonymous API key for client-safe Supabase calls"
    )
    SUPABASE_SERVICE_ROLE_KEY: str = Field(
        default="demo-service-role-key",
        description="Privileged service role key for administrative backend actions. NEVER exposed to frontend."
    )
    SUPABASE_JWT_SECRET: str = Field(
        default="super-secret-jwt-key-for-local-development-mode-12345",
        description="JWT secret used to verify Supabase access tokens on the backend"
    )

    # Google Gemini AI Configuration
    GEMINI_API_KEY: str = Field(
        default="",
        description="API key for Google Gemini model access (aistudio.google.com)"
    )
    GEMINI_MODEL_NAME: str = Field(
        default="gemini-3.5-flash-lite",
        description="Target Gemini model identifier for generation, verification, code evaluation, and mentoring"
    )


def get_application_settings() -> ApplicationSettings:
    """
    Instantiates and returns the validated application settings.

    Returns:
        ApplicationSettings: Initialized settings instance.
    """
    return ApplicationSettings()


# Export singleton instance for dependency injection
settings = get_application_settings()
