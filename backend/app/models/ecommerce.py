from sqlalchemy import Column, String, ForeignKey, DateTime, func, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class ECommerceMonitor(Base):
    __tablename__ = "ecommerce_monitors"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    target_url = Column(String, nullable=False)
    status = Column(String, default="ACTIVE") # ACTIVE, DISABLED
    monitoring_frequency = Column(String, default="DAILY") # HOURLY, DAILY, WEEKLY
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    next_run_at = Column(DateTime(timezone=True), nullable=True)
    last_scan_result = Column(String, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
