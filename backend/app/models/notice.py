from sqlalchemy import Column, String, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class ImprovementNotice(Base):
    __tablename__ = "improvement_notices"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(String, ForeignKey("inspections.id"))
    manufacturer_id = Column(UUID(as_uuid=True), nullable=True) # Linked if configured
    status = Column(String, default="ISSUED") # ISSUED, RECTIFICATION_SUBMITTED, CLOSED
    violations = Column(String, nullable=True) # JSON dump of violations
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

