from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: str
    role: str

class InspectionBase(BaseModel):
    product_name: str
    manufacturer_name: str
    district: str
    status: str
    risk_score: int
    risk_level: str
    violation_status: str

class InspectionCreate(InspectionBase):
    pass

class InspectionOut(InspectionBase):
    id: str
    created_at: datetime
    class Config:
        orm_mode = True

class ScanRequest(BaseModel):
    image_url: str

class ScanResultField(BaseModel):
    field: str
    selected_value: str
    confidence: float
    status: str # PASS, FAIL, WARNING
    evidence: str
    rule_id: str
    rule_version: str

class ScanResponse(BaseModel):
    status: str
    fields: List[ScanResultField]
    summary: str
    risk_score: int
    risk_level: str

class RuleBase(BaseModel):
    id: str
    requirement: str
    category: str
    version: str
    status: str

class RuleCreate(RuleBase):
    pass
