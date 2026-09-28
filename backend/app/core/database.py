import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("MetronIQ-DB")

db_url = (settings.DATABASE_URL or "").strip().strip('"').strip("'")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

try:
    if db_url:
        engine = create_engine(db_url, pool_pre_ping=True)
    else:
        engine = None
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    engine = None

if engine:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    SessionLocal = None

Base = declarative_base()

def get_db():
    if not SessionLocal:
        raise RuntimeError("Database session factory is not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
