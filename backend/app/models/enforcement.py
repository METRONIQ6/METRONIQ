from sqlalchemy import Column, String, ForeignKey, DateTime, func, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class EnforcementCase(Base):
    __tablename__ = "enforcement_cases"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reinspection_id = Column(UUID(as_uuid=True), ForeignKey("reinspections.id"), unique=True)
    original_inspection_id = Column(String, ForeignKey("inspections.id"))
    manufacturer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # if we tracked it in notice
    assigned_officer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(String, default="OPEN") # OPEN, UNDER_REVIEW, PENALTY_PENDING, PENALTY_ISSUED, RESOLVED
    penalty_amount = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
