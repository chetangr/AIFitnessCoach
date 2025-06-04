"""
Models for user-created content: custom exercises, workout templates, and programs
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from .base import Base

class CustomExercise(Base):
    __tablename__ = "custom_exercises"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Exercise details
    name = Column(String(200), nullable=False)
    description = Column(Text)
    muscle_groups = Column(JSON, default=list)  # ["chest", "triceps"]
    equipment_required = Column(JSON, default=list)  # ["barbell", "bench"]
    
    # Instructions
    instructions = Column(JSON, default=list)  # List of steps
    tips = Column(JSON, default=list)
    common_mistakes = Column(JSON, default=list)
    
    # Media
    video_url = Column(String(500))
    image_urls = Column(JSON, default=list)
    
    # Categorization
    exercise_type = Column(String(50))  # strength, cardio, flexibility
    difficulty_level = Column(String(20))  # beginner, intermediate, advanced
    
    # Sharing
    is_public = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", back_populates="custom_exercises")

class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Template details
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Workout structure
    exercises = Column(JSON, nullable=False)  # Ordered list of exercise configs
    """
    Example structure:
    [
        {
            "exercise_id": "uuid",
            "exercise_name": "Bench Press",
            "sets": 4,
            "reps": "8-10",
            "rest_seconds": 90,
            "notes": "Control the descent"
        }
    ]
    """
    
    # Metadata
    duration_minutes = Column(Integer)
    difficulty_level = Column(String(20))
    equipment_needed = Column(JSON, default=list)
    target_muscle_groups = Column(JSON, default=list)
    
    # Usage tracking
    times_used = Column(Integer, default=0)
    last_used_at = Column(DateTime)
    
    # Sharing
    is_public = Column(Boolean, default=False)
    likes_count = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", back_populates="workout_templates")

class TrainingProgram(Base):
    __tablename__ = "training_programs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Program details
    name = Column(String(200), nullable=False)
    description = Column(Text)
    goal = Column(String(100))  # muscle_gain, strength, endurance, etc.
    
    # Program structure
    duration_weeks = Column(Integer, nullable=False)
    workouts_per_week = Column(Integer, nullable=False)
    
    # Weekly schedule
    weekly_schedule = Column(JSON, nullable=False)
    """
    Example structure:
    {
        "monday": "workout_template_id_1",
        "tuesday": "rest",
        "wednesday": "workout_template_id_2",
        ...
    }
    """
    
    # Progress tracking
    progression_scheme = Column(JSON)  # How to progress (add weight, reps, etc.)
    
    # Metadata
    difficulty_level = Column(String(20))
    target_audience = Column(String(100))  # beginners, intermediates, advanced
    equipment_needed = Column(JSON, default=list)
    
    # Sharing
    is_public = Column(Boolean, default=False)
    subscribers_count = Column(Integer, default=0)
    rating = Column(Float)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", back_populates="training_programs")

class ExerciseHistory(Base):
    __tablename__ = "exercise_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False)
    
    # Performance tracking
    last_performed_at = Column(DateTime)
    times_performed = Column(Integer, default=0)
    
    # Best performances
    max_weight = Column(Float)
    max_weight_date = Column(DateTime)
    max_reps = Column(Integer)
    max_reps_date = Column(DateTime)
    max_volume = Column(Float)  # weight x reps
    max_volume_date = Column(DateTime)
    
    # Recent performance (last 5 sessions)
    recent_performances = Column(JSON, default=list)
    
    # User preferences
    preferred_weight = Column(Float)
    preferred_reps = Column(Integer)
    preferred_rest_seconds = Column(Integer)
    notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)