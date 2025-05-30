from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    display_name: Optional[str] = Field(None, max_length=200)
    age: Optional[int] = Field(None, ge=13, le=120)
    current_weight: Optional[float] = Field(None, ge=20, le=500)
    target_weight: Optional[float] = Field(None, ge=20, le=500)
    height: Optional[int] = Field(None, ge=50, le=300)

class UserPreferencesUpdate(BaseModel):
    fitness_level: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced|expert)$")
    goals: Optional[List[str]] = None
    preferred_coach_id: Optional[str] = Field(None, pattern="^(emma|max|dr_progress)$")
    training_equipment: Optional[List[str]] = None
    diet_preference: Optional[str] = None
    mindset_activities: Optional[List[str]] = None