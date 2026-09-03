from sqlalchemy import Column, String, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON
import uuid
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False) # e.g. RULE_ACTIVATED
    entity = Column(String, nullable=False) # e.g. RULE_VERSION
    entity_id = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
