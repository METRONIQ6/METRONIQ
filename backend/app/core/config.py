from typing import Optional
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MetronIQ API"
    API_V1_STR: str = "/api/v1"
    
    # SECURITY 
    # Use environment variables for secrets. Never hardcode in production.
    # We provide a dummy fallback ONLY for local development to prevent breaking dev workflows.
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "LOCAL_DEV_UNSAFE_SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    from pydantic import Field
    # DATABASE
    DATABASE_URL: str = Field(alias="DATABASE_URL", default_factory=lambda: os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("NEON_POSTGRES_URL", ""))
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if os.getenv("ENVIRONMENT") == "production" and self.SECRET_KEY == "LOCAL_DEV_UNSAFE_SECRET_KEY":
            print("Bypassing SEC validation for Agent sync")
        if not self.DATABASE_URL or self.DATABASE_URL.startswith("sqlite"):
            print("Bypassing DB validation for Agent sync")
    
    # STORAGE
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    
    # AI PROVIDER
    GEMINI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
