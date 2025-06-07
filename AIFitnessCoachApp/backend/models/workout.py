from sqlalchemy import Column, String, Integer, Boolean, JSON, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database_types import UUID
from .base import BaseModel

class WorkoutPlan(BaseModel):
    __tablename__ = "workout_plans"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    difficulty = Column(String(50), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    exercises = Column(JSON, nullable=False)
    equipment_required = Column(JSON, default=list)
    muscle_groups = Column(JSON, default=list)
    scheduled_for = Column(DateTime(timezone=True))
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    original_scheduled_date = Column(DateTime(timezone=True))
    workout_metadata = Column(JSON, default=dict)
    
    # Relationships
    user = relationship("User", back_populates="workout_plans")
    versions = relationship("WorkoutPlanVersion", back_populates="plan", cascade="all, delete-orphan")
    sessions = relationship("WorkoutSession", back_populates="plan", cascade="all, delete-orphan")

class WorkoutPlanVersion(BaseModel):
    __tablename__ = "workout_plan_versions"
    
    plan_id = Column(UUID(as_uuid=True), ForeignKey("workout_plans.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    changes_description = Column(Text)
    changeset = Column(JSON)
    exercises = Column(JSON, nullable=False)
    created_by = Column(String(50), nullable=False)  # 'user' or 'ai'
    
    # Relationships
    plan = relationship("WorkoutPlan", back_populates="versions")

class WorkoutSession(BaseModel):
    __tablename__ = "workout_sessions"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("workout_plans.id"))
    started_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)
    exercises_completed = Column(JSON)
    notes = Column(Text)
    rating = Column(Integer)
    calories_burned = Column(Integer)
    
    # Relationships
    user = relationship("User", back_populates="workout_sessions")
    plan = relationship("WorkoutPlan", back_populates="sessions")

class Exercise(BaseModel):
    __tablename__ = "exercises"
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    muscle_groups = Column(JSON, default=list)
    equipment_required = Column(JSON, default=list)
    difficulty_level = Column(String(50))
    instructions = Column(JSON)
    video_url = Column(String(500))
    image_url = Column(String(500))
    safety_notes = Column(JSON)
    variations = Column(JSON)
    category = Column(String(50))