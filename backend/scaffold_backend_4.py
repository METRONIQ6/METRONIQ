import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend"
files = {}

files["app/models/audit.py"] = """
from sqlalchemy import Column, String, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False) # e.g. RULE_ACTIVATED
    entity = Column(String, nullable=False) # e.g. RULE_VERSION
    entity_id = Column(String, nullable=False)
    metadata_payload = Column(JSONB)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
"""

for file_path, content in files.items():
    full_path = os.path.join(base, file_path.replace("/", "\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
