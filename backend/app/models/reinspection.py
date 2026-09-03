from sqlalchemy import Column, String, ForeignKey, DateTime, func, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Reinspection(Base):
    __tablename__ = "reinspections"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_inspection_id = Column(String, ForeignKey("inspections.id"))
    notice_id = Column(UUID(as_uuid=True), ForeignKey("improvement_notices.id"), nullable=True)
    assigned_officer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(String, default="SCHEDULED") # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELED
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    new_inspection_id = Column(String, ForeignKey("inspections.id"), nullable=True) # Resulting inspection
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
