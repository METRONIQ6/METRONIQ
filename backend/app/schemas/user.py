from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class UserBase(BaseModel):
    email: str
    role: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: UUID
    is_active: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
