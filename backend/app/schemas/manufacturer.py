
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class ProductCreate(BaseModel):
    name: str
    category: Optional[str] = None
    sku: Optional[str] = None
    net_quantity: Optional[str] = None
    mrp: Optional[str] = None
    generic_name: Optional[str] = None
    manufacturer_name: Optional[str] = None
    country_of_origin: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    net_quantity: Optional[str] = None
    mrp: Optional[str] = None
    generic_name: Optional[str] = None
    manufacturer_name: Optional[str] = None
    country_of_origin: Optional[str] = None
    status: Optional[str] = None

class ProductResponse(ProductCreate):
    id: UUID
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        orm_mode = True

class ManufacturerStats(BaseModel):
    total_products: int
    draft_products: int
    under_review: int
    changes_required: int
    approved_products: int
    recent_activity: List[Dict[str, Any]]
