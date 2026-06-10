from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    document_country: Optional[str] = None
    document_type: Optional[str] = None
    document_number: Optional[str] = None


class UserOut(UserBase):
    id: int
    role: str
    is_verified: bool
    registered_at: datetime

    class Config:
        orm_mode = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
