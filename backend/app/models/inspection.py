from sqlalchemy import Column, String, ForeignKey, DateTime, func, Boolean
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
    result = Column(String, nullable=True) # PASS, FAIL, PENDING_RULES
    evidence_payload = Column(String, nullable=True) # JSON store for Analytics stage
    is_reinspection = Column(Boolean, default=False)
    parent_inspection_id = Column(String, nullable=True) # Points to older inspection
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())