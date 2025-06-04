"""
Tracking models for workout sessions, sets, and performance data
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from .base import Base

class ExerciseType(str, enum.Enum):
    STRENGTH = "strength"
    CARDIO = "cardio"
    FLEXIBILITY = "flexibility"
    BALANCE = "balance"
    SPORTS = "sports"

class SetType(str, enum.Enum):
    NORMAL = "normal"
    WARMUP = "warmup"
    DROP = "drop"
    FAILURE = "failure"
    REST_PAUSE = "rest_pause"

class RPE(int, enum.Enum):
    VERY_EASY = 1
    EASY = 2
    MODERATE = 3
    SOMEWHAT_HARD = 4
    HARD = 5
    VERY_HARD = 6
    EXTREMELY_HARD = 7
    MAXIMAL = 8
    FAILURE = 9
    ABSOLUTE_MAX = 10

class WorkoutSessionV2(Base):
    __tablename__ = "workout_sessions_v2"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    workout_plan_id = Column(UUID(as_uuid=True), ForeignKey("workout_plans.id"))
    
    # Session details
    name = Column(String(200), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)
    duration_minutes = Column(Integer)
    
    # Performance metrics
    total_volume = Column(Float, default=0)  # Total weight lifted
    total_sets = Column(Integer, default=0)
    total_reps = Column(Integer, default=0)
    calories_burned = Column(Integer)
    average_rpe = Column(Float)
    
    # Session notes
    notes = Column(Text)
    mood_before = Column(Integer)  # 1-5 scale
    mood_after = Column(Integer)   # 1-5 scale
    energy_level = Column(Integer) # 1-5 scale
    
    # Relationships
    exercises = relationship("ExercisePerformance", back_populates="session", cascade="all, delete-orphan")
    user = relationship("User", back_populates="workout_sessions_v2")

class ExercisePerformance(Base):
    __tablename__ = "exercise_performances"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("workout_sessions_v2.id"), nullable=False)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False)
    
    # Exercise details
    order_in_workout = Column(Integer, nullable=False)
    exercise_name = Column(String(200), nullable=False)  # Denormalized for history
    
    # Performance summary
    total_sets = Column(Integer, default=0)
    total_reps = Column(Integer, default=0)
    total_volume = Column(Float, default=0)
    
    # Personal records
    max_weight = Column(Float)
    max_reps = Column(Integer)
    is_pr = Column(Boolean, default=False)
    
    # Relationships
    session = relationship("WorkoutSessionV2", back_populates="exercises")
    sets = relationship("SetPerformance", back_populates="exercise", cascade="all, delete-orphan")

class SetPerformance(Base):
    __tablename__ = "set_performances"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exercise_performance_id = Column(UUID(as_uuid=True), ForeignKey("exercise_performances.id"), nullable=False)
    
    # Set details
    set_number = Column(Integer, nullable=False)
    set_type = Column(Enum(SetType), default=SetType.NORMAL)
    
    # Performance data
    weight = Column(Float)  # in kg or lbs based on user preference
    reps = Column(Integer)
    duration_seconds = Column(Integer)  # For time-based exercises
    distance = Column(Float)  # For cardio
    
    # Subjective measures
    rpe = Column(Integer)  # 1-10 scale
    
    # Timing
    rest_after_seconds = Column(Integer)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    exercise = relationship("ExercisePerformance", back_populates="sets")

class PersonalRecord(Base):
    __tablename__ = "personal_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False)
    
    # Record details
    record_type = Column(String(50), nullable=False)  # "1RM", "Max Reps", "Max Volume", etc.
    value = Column(Float, nullable=False)
    unit = Column(String(20))
    
    # Context
    weight_used = Column(Float)
    reps_performed = Column(Integer)
    set_performance_id = Column(UUID(as_uuid=True), ForeignKey("set_performances.id"))
    
    # Metadata
    achieved_at = Column(DateTime, default=datetime.utcnow)
    previous_value = Column(Float)
    improvement_percentage = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)