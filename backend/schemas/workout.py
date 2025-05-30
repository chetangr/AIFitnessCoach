from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID

class ExerciseInWorkout(BaseModel):
    id: str
    exercise_id: str
    name: str
    sets: int
    reps: Optional[int] = None
    duration: Optional[int] = None  # seconds
    rest_time: int  # seconds
    weight: Optional[float] = None  # kg
    notes: Optional[str] = None
    order_index: int

class WorkoutPlanBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    difficulty: str = Field(..., pattern="^(easy|medium|hard|expert)$")
    duration_minutes: int = Field(..., ge=5, le=240)
    exercises: List[Dict[str, Any]]
    equipment_required: List[str] = []
    muscle_groups: List[str] = []
    scheduled_for: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class WorkoutPlanCreate(WorkoutPlanBase):
    pass

class WorkoutPlanUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    difficulty: Optional[str] = Field(None, pattern="^(easy|medium|hard|expert)$")
    duration_minutes: Optional[int] = Field(None, ge=5, le=240)
    exercises: Optional[List[Dict[str, Any]]] = None
    equipment_required: Optional[List[str]] = None
    muscle_groups: Optional[List[str]] = None
    scheduled_for: Optional[datetime] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[datetime] = None
    original_scheduled_date: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class WorkoutPlanResponse(WorkoutPlanBase):
    id: UUID
    user_id: UUID
    is_completed: bool
    completed_at: Optional[datetime]
    original_scheduled_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class WorkoutSessionCreate(BaseModel):
    workout_id: UUID

class WorkoutSessionComplete(BaseModel):
    duration: int  # minutes
    exercises_completed: List[Dict[str, Any]]
    notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)

class WorkoutStats(BaseModel):
    total_workouts: int
    completed_workouts: int
    total_duration: int  # minutes
    total_calories_burned: int
    current_streak: int
    longest_streak: int