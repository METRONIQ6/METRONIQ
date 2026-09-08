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
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if os.getenv("ENVIRONMENT") == "production" and self.SECRET_KEY == "LOCAL_DEV_UNSAFE_SECRET_KEY":
            raise ValueError("FATAL SECURITY ERROR: JWT_SECRET_KEY must be set in production environment variables!")
    
    # DATABASE
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./metroniq-dev.db")
    
    # STORAGE
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    
    class Config:
        env_file = ".env"

settings = Settings()
