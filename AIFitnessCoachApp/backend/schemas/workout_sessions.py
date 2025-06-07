"""Schemas for workout session tracking."""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# Workout Session Schemas

class WorkoutSessionCreate(BaseModel):
    """Schema for creating a workout session."""
    workout_plan_id: Optional[str] = None
    workout_name: str = Field(..., description="Name of the workout")
    notes: Optional[str] = None

class WorkoutSessionComplete(BaseModel):
    """Schema for completing a workout session."""
    rating: Optional[int] = Field(None, ge=1, le=5, description="Workout rating 1-5")
    notes: Optional[str] = None

class WorkoutSessionResponse(BaseModel):
    """Schema for workout session response."""
    id: str
    user_id: str
    workout_plan_id: Optional[str]
    workout_name: str
    started_at: datetime
    ended_at: Optional[datetime]
    total_duration_minutes: Optional[int]
    total_sets: int = 0
    total_reps: int = 0
    total_volume: float = 0
    rating: Optional[int]
    notes: Optional[str]
    
    class Config:
        from_attributes = True

# Exercise Performance Schemas

class ExercisePerformanceCreate(BaseModel):
    """Schema for adding an exercise to a session."""
    exercise_id: str
    order_in_workout: int = Field(..., ge=1)
    notes: Optional[str] = None

class ExercisePerformanceResponse(BaseModel):
    """Schema for exercise performance response."""
    id: str
    workout_session_id: str
    exercise_id: str
    exercise_name: str
    order_in_workout: int
    total_sets: int = 0
    total_reps: int = 0
    total_volume: float = 0
    average_rpe: Optional[float]
    max_weight: Optional[float]
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Set Performance Schemas

class SetPerformanceCreate(BaseModel):
    """Schema for recording a set."""
    exercise_performance_id: str
    set_number: int = Field(..., ge=1)
    target_reps: Optional[int] = Field(None, ge=0)
    actual_reps: int = Field(..., ge=0)
    weight: Optional[float] = Field(None, ge=0)
    rpe: Optional[int] = Field(None, ge=1, le=10, description="Rate of Perceived Exertion 1-10")
    is_warmup: bool = False
    is_drop_set: bool = False
    notes: Optional[str] = None

class SetPerformanceUpdate(BaseModel):
    """Schema for updating a set."""
    actual_reps: Optional[int] = Field(None, ge=0)
    weight: Optional[float] = Field(None, ge=0)
    rpe: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None

class SetPerformanceResponse(BaseModel):
    """Schema for set performance response."""
    id: str
    exercise_performance_id: str
    set_number: int
    target_reps: Optional[int]
    actual_reps: int
    weight: Optional[float]
    rpe: Optional[int]
    is_warmup: bool
    is_drop_set: bool
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Personal Record Schemas

class PersonalRecordResponse(BaseModel):
    """Schema for personal record response."""
    id: str
    user_id: str
    exercise_id: str
    exercise_name: str
    pr_type: str
    value: float
    workout_session_id: Optional[str]
    achieved_at: datetime
    
    class Config:
        from_attributes = True

# Custom Exercise Schemas

class CustomExerciseBase(BaseModel):
    """Base schema for custom exercises."""
    name: str = Field(..., min_length=1, max_length=255)
    category: str
    muscle_groups: List[str]
    equipment_needed: Optional[str] = None
    instructions: Optional[str] = None
    video_url: Optional[str] = None
    is_public: bool = False

class CustomExerciseCreate(CustomExerciseBase):
    """Schema for creating a custom exercise."""
    pass

class CustomExerciseUpdate(CustomExerciseBase):
    """Schema for updating a custom exercise."""
    name: Optional[str] = None
    category: Optional[str] = None
    muscle_groups: Optional[List[str]] = None

class CustomExerciseResponse(CustomExerciseBase):
    """Schema for custom exercise response."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Workout Template Schemas

class WorkoutTemplateBase(BaseModel):
    """Base schema for workout templates."""
    name: str
    description: Optional[str] = None
    exercises: List[dict]  # List of exercise configurations
    is_public: bool = False
    tags: Optional[List[str]] = None

class WorkoutTemplateCreate(WorkoutTemplateBase):
    """Schema for creating a workout template."""
    pass

class WorkoutTemplateResponse(WorkoutTemplateBase):
    """Schema for workout template response."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    times_used: int = 0
    
    class Config:
        from_attributes = True

# Exercise History Schemas

class ExerciseHistoryResponse(BaseModel):
    """Schema for exercise history response."""
    exercise_id: str
    exercise_name: str
    last_performed: datetime
    times_performed: int
    personal_records: List[PersonalRecordResponse]
    recent_performances: List[dict]  # Recent sets/reps/weight data
    
    class Config:
        from_attributes = True

# Workout Schedule Schemas

class WorkoutScheduleBase(BaseModel):
    """Base schema for workout schedule."""
    monday: Optional[str] = Field(None, description="Workout plan ID or 'rest'")
    tuesday: Optional[str] = Field(None, description="Workout plan ID or 'rest'")
    wednesday: Optional[str] = Field(None, description="Workout plan ID or 'rest'")
    thursday: Optional[str] = Field(None, description="Workout plan ID or 'rest'")
    friday: Optional[str] = Field(None, description="Workout plan ID or 'rest'")
    saturday: Optional[str] = Field(None, description="Workout plan ID or 'rest'")
    sunday: Optional[str] = Field(None, description="Workout plan ID or 'rest'")

class WorkoutScheduleCreate(WorkoutScheduleBase):
    """Schema for creating/updating workout schedule."""
    pass

class WorkoutScheduleResponse(WorkoutScheduleBase):
    """Schema for workout schedule response."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class WorkoutScheduleMove(BaseModel):
    """Schema for moving a workout to a different day."""
    from_day: str = Field(..., description="Day to move from (monday-sunday)")
    to_day: str = Field(..., description="Day to move to (monday-sunday)")
    swap: bool = Field(False, description="Whether to swap workouts or just move")