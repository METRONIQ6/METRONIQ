from typing import Optional
import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "MetronIQ API"
    API_V1_STR: str = "/api/v1"
    
    # SECURITY 
    SECRET_KEY: str = (os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY") or "LOCAL_DEV_UNSAFE_SECRET_KEY").strip().strip('"').strip("'")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # DATABASE
    DATABASE_URL: str = Field(
        default_factory=lambda: (os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("NEON_POSTGRES_URL", "")).strip().strip('"').strip("'")
    )
    
    # STORAGE
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    
    # AI PROVIDER
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
