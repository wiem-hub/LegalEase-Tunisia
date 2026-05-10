# app/schemas/user.py
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    id:             int
    is_active:      bool
    is_admin:       bool = False
    preferred_lang: Optional[str] = "fr"

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type:   str


class TokenData(BaseModel):
    username: str | None = None


class UserUpdate(BaseModel):
    email:          Optional[EmailStr] = None
    username:       Optional[str]      = Field(None, min_length=3, max_length=50)
    preferred_lang: Optional[str]      = None   # "fr", "en", "darija"


class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)