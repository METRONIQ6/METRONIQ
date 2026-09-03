from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID

class PaginatedResponse(BaseModel):
    items: List[Any]
    page: int
    page_size: int
    total: int