from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
     from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None