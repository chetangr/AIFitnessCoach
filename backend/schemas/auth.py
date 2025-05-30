from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    fitness_level: Optional[str] = "beginner"
    
    @validator('username')
    def username_alphanumeric(cls, v):
        assert v.replace('_', '').isalnum(), 'Username must be alphanumeric with underscores only'
        return v

class UserLogin(BaseModel):
    username: str  # Can be email or username
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    first_name: Optional[str]
    last_name: Optional[str]
    display_name: Optional[str]
    fitness_level: str
    onboarding_completed: bool
    preferred_coach_id: Optional[str] = None
    goals: Optional[List[str]] = []
    current_weight: Optional[float] = None
    target_weight: Optional[float] = None
    height: Optional[int] = None
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
    
class PasswordReset(BaseModel):
    email: EmailStr
    
class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)