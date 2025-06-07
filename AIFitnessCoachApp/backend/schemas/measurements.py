"""Schemas for body measurements and progress photos."""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Body Measurement Schemas

class BodyMeasurementBase(BaseModel):
    """Base schema for body measurements."""
    weight: Optional[float] = Field(None, description="Weight in user's preferred unit")
    body_fat_percentage: Optional[float] = Field(None, ge=0, le=100)
    muscle_mass: Optional[float] = Field(None, description="Muscle mass in user's preferred unit")
    waist_circumference: Optional[float] = Field(None, description="Waist measurement")
    chest_circumference: Optional[float] = Field(None, description="Chest measurement")
    arm_circumference: Optional[float] = Field(None, description="Arm measurement")
    thigh_circumference: Optional[float] = Field(None, description="Thigh measurement")
    hip_circumference: Optional[float] = Field(None, description="Hip measurement")
    neck_circumference: Optional[float] = Field(None, description="Neck measurement")
    notes: Optional[str] = Field(None, description="Additional notes")

class BodyMeasurementCreate(BodyMeasurementBase):
    """Schema for creating a body measurement."""
    pass

class BodyMeasurementUpdate(BodyMeasurementBase):
    """Schema for updating a body measurement."""
    pass

class BodyMeasurementResponse(BodyMeasurementBase):
    """Schema for body measurement response."""
    id: str
    user_id: str
    recorded_at: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Progress Photo Schemas

class ProgressPhotoBase(BaseModel):
    """Base schema for progress photos."""
    angle: str = Field(..., description="Photo angle: front, side, back")
    notes: Optional[str] = Field(None, description="Notes about the photo")
    is_private: bool = Field(True, description="Whether photo is private")

class ProgressPhotoResponse(ProgressPhotoBase):
    """Schema for progress photo response."""
    id: str
    user_id: str
    photo_url: str
    taken_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Trend Analysis Schemas

class TrendDataPoint(BaseModel):
    """Single data point in a trend."""
    date: datetime
    value: float

class MeasurementTrends(BaseModel):
    """Schema for measurement trends and analytics."""
    weight_trend: List[TrendDataPoint]
    body_fat_trend: List[TrendDataPoint]
    measurements_trend: Dict[str, List[TrendDataPoint]]
    total_weight_change: float
    total_body_fat_change: float
    average_weekly_change: float

# Fasting Schemas

class FastingSessionBase(BaseModel):
    """Base schema for fasting sessions."""
    fasting_type: str = Field(..., description="Type of fast: 16:8, 18:6, 20:4, custom")
    planned_duration_hours: int = Field(..., ge=1, le=168)
    notes: Optional[str] = None

class FastingSessionCreate(FastingSessionBase):
    """Schema for creating a fasting session."""
    pass

class FastingSessionResponse(FastingSessionBase):
    """Schema for fasting session response."""
    id: str
    user_id: str
    started_at: datetime
    ended_at: Optional[datetime]
    actual_duration_hours: Optional[float]
    completed_successfully: bool
    
    class Config:
        from_attributes = True

class FastingStats(BaseModel):
    """Schema for fasting statistics."""
    total_sessions: int
    completed_sessions: int
    current_streak: int
    longest_streak: int
    average_duration_hours: float
    total_fasting_hours: float
    favorite_fasting_type: Optional[str]

# User Settings Schemas

class UserSettingsBase(BaseModel):
    """Base schema for user settings."""
    unit_system: str = Field("metric", description="metric or imperial")
    theme_preference: str = Field("auto", description="light, dark, or auto")
    notifications_enabled: bool = True
    workout_reminder_time: Optional[str] = None
    rest_timer_duration: int = Field(90, description="Rest timer in seconds")
    auto_start_rest_timer: bool = True
    weight_increment: float = Field(2.5, description="Weight increment for plates")
    default_workout_duration: int = Field(60, description="Default workout duration in minutes")
    show_warmup_sets: bool = True
    export_format: str = Field("csv", description="csv or json")

class UserSettingsUpdate(UserSettingsBase):
    """Schema for updating user settings."""
    unit_system: Optional[str] = None
    theme_preference: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    workout_reminder_time: Optional[str] = None
    rest_timer_duration: Optional[int] = None
    auto_start_rest_timer: Optional[bool] = None
    weight_increment: Optional[float] = None
    default_workout_duration: Optional[int] = None
    show_warmup_sets: Optional[bool] = None
    export_format: Optional[str] = None

class UserSettingsResponse(UserSettingsBase):
    """Schema for user settings response."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
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