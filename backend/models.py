from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String) # ADMIN, OFFICER, MANUFACTURER

class Inspection(Base):
    __tablename__ = "inspections"
    id = Column(String, primary_key=True, default=generate_uuid)
    product_name = Column(String)
    manufacturer_name = Column(String)
    district = Column(String)
    status = Column(String) # PENDING, REVIEW, COMPLETED
    risk_score = Column(Integer)
    risk_level = Column(String) # LOW, MEDIUM, HIGH
    violation_status = Column(String) # PASS, FAIL, WARNING
    created_at = Column(DateTime, default=datetime.utcnow)

class Rule(Base):
    __tablename__ = "rules"
    id = Column(String, primary_key=True) # e.g. LM-PKG-001
    requirement = Column(String)
    category = Column(String)
    version = Column(String)
    status = Column(String) # ACTIVE, ARCHIVED

class RuleVersion(Base):
    __tablename__ = "rule_versions"
    id = Column(String, primary_key=True, default=generate_uuid)
    rule_id = Column(String, ForeignKey("rules.id"))
    version = Column(String)
    status = Column(String)
    validation_logic = Column(String)
