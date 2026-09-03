import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend"
files = {}

files["requirements.txt"] = """
fastapi==0.104.1
uvicorn==0.24.0.post1
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
pydantic==2.5.2
pydantic-settings==2.1.0
passlib==1.7.4
bcrypt==4.0.1
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
"""

files["app/core/config.py"] = """
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MetronIQ API"
    API_V1_STR: str = "/api/v1"
    
    # SECURITY
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # DATABASE
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/metroniq"
    
    # STORAGE
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    
    class Config:
        env_file = ".env"

settings = Settings()
"""

files["app/core/database.py"] = """
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""

files["app/core/security.py"] = """
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
"""

files["app/models/__init__.py"] = """
from app.core.database import Base
from .user import User
from .rule import Rule, RuleVersion
from .inspection import Inspection
from .product import Product, Manufacturer
"""

files["app/models/user.py"] = """
from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="OFFICER") # OFFICER, ADMIN, MANUFACTURER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
"""

files["app/models/product.py"] = """
from sqlalchemy import Column, String, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Manufacturer(Base):
    __tablename__ = "manufacturers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, index=True, nullable=False)
    location = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Product(Base):
    __tablename__ = "products"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, index=True, nullable=False)
    category = Column(String)
    manufacturer_id = Column(UUID(as_uuid=True), ForeignKey("manufacturers.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    manufacturer = relationship("Manufacturer")
"""

files["app/models/rule.py"] = """
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Rule(Base):
    __tablename__ = "rules"
    id = Column(String, primary_key=True) # e.g. RULE-001
    name = Column(String, nullable=False)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    versions = relationship("RuleVersion", back_populates="rule")

class RuleVersion(Base):
    __tablename__ = "rule_versions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rule_id = Column(String, ForeignKey("rules.id"))
    version_number = Column(Integer, nullable=False)
    status = Column(String, default="DRAFT") # DRAFT, REVIEW, APPROVED, ACTIVE, RETIRED
    logic_payload = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    rule = relationship("Rule", back_populates="versions")
"""

files["app/models/inspection.py"] = """
from sqlalchemy import Column, String, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Inspection(Base):
    __tablename__ = "inspections"
    id = Column(String, primary_key=True) # e.g. INSP-001
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    officer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String, default="DRAFT")
    risk_level = Column(String, default="LOW")
    result = Column(String, nullable=True) # PASS, FAIL, REVIEW
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
"""

for file_path, content in files.items():
    full_path = os.path.join(base, file_path.replace("/", "\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
