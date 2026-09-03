from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON
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
    logic_payload = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    rule = relationship("Rule", back_populates="versions")
