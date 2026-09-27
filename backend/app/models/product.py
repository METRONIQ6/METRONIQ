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
    manufacturer_id = Column(UUID(as_uuid=True), ForeignKey("manufacturers.id"), nullable=True) # Old
    
    sku = Column(String)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String, default="DRAFT") # DRAFT, UNDER_REVIEW, CHANGES_REQUIRED, APPROVED, REJECTED
    net_quantity = Column(String)
    mrp = Column(String)
    generic_name = Column(String)
    manufacturer_name = Column(String)
    country_of_origin = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner = relationship("User", foreign_keys=[owner_id])