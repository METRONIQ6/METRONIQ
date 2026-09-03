from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class RuleVersionBase(BaseModel):
    version_number: int
    status: str
    logic_payload: Dict[str, Any]

class RuleVersionResponse(RuleVersionBase):
    id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

class RuleBase(BaseModel):
    id: str
    name: str
    category: Optional[str] = None

class RuleResponse(RuleBase):
    created_at: datetime
    versions: list[RuleVersionResponse] = []
    class Config:
        from_attributes = True
        
class RuleCreate(BaseModel):
    id: str
    name: str
    category: str
    initial_logic: Dict[str, Any]