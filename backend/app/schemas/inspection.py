from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from uuid import UUID

class InspectionBase(BaseModel):
    product_id: Optional[Any] = None
    status: Optional[str] = "DRAFT"
    
class InspectionCreate(InspectionBase):
    pass

class InspectionResponse(InspectionBase):
    id: str
    officer_id: Optional[Any] = None
    risk_level: Optional[str] = None
    result: Optional[str] = None
    created_at: Optional[Any] = None
    evidence_payload: Optional[str] = None
    class Config:
        from_attributes = True