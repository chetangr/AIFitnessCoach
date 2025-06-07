"""
Models for body measurements, progress photos, and fasting tracking
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text, Enum
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from .base import Base
from .database_types import UUID

class MeasurementType(str, enum.Enum):
    WEIGHT = "weight"
    BODY_FAT = "body_fat"
    MUSCLE_MASS = "muscle_mass"
    WAIST = "waist"
    CHEST = "chest"
    ARMS = "arms"
    THIGHS = "thighs"
    CALVES = "calves"
    NECK = "neck"
    HIPS = "hips"
    SHOULDERS = "shoulders"

class FastingPlan(str, enum.Enum):
    TWELVE_TWELVE = "12:12"
    SIXTEEN_EIGHT = "16:8"
    EIGHTEEN_SIX = "18:6"
    TWENTY_FOUR = "20:4"
    OMAD = "OMAD"
    CUSTOM = "custom"

class BodyMeasurement(Base):
    __tablename__ = "body_measurements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Measurement details
    measurement_type = Column(Enum(MeasurementType), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)  # kg, lbs, cm, inches, %
    
    # Body parts (for circumference measurements)
    side = Column(String(10))  # left, right, or null for bilateral
    
    # Context
    notes = Column(Text)
    measured_by = Column(String(100))  # self, trainer, DEXA, etc.
    
    # Metadata
    measured_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="measurements")

class ProgressPhoto(Base):
    __tablename__ = "progress_photos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Photo details
    photo_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500))
    angle = Column(String(50))  # front, back, side, etc.
    
    # Metadata
    weight_at_time = Column(Float)
    body_fat_at_time = Column(Float)
    notes = Column(Text)
    is_private = Column(Boolean, default=True)
    
    # Timestamps
    taken_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="progress_photos")

class FastingSession(Base):
    __tablename__ = "fasting_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Fasting details
    plan_type = Column(Enum(FastingPlan), nullable=False)
    target_hours = Column(Integer, nullable=False)
    
    # Session timing
    started_at = Column(DateTime, nullable=False)
    target_end_at = Column(DateTime, nullable=False)
    actual_end_at = Column(DateTime)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_completed = Column(Boolean, default=False)
    completion_percentage = Column(Float, default=0)
    
    # User experience
    difficulty_rating = Column(Integer)  # 1-5 scale
    energy_level = Column(Integer)  # 1-5 scale
    notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="fasting_sessions")

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    
    # Display preferences
    unit_system = Column(String(20), default="metric")  # metric or imperial
    theme_preference = Column(String(20), default="dark")  # light, dark, auto
    language = Column(String(10), default="en")
    
    # Notification settings
    workout_reminders = Column(Boolean, default=True)
    meal_reminders = Column(Boolean, default=False)
    progress_reminders = Column(Boolean, default=True)
    notification_time = Column(String(10))  # HH:MM format
    
    # Privacy settings
    profile_visibility = Column(String(20), default="private")  # public, friends, private
    share_progress = Column(Boolean, default=False)
    allow_friend_requests = Column(Boolean, default=True)
    
    # Workout preferences
    rest_timer_duration = Column(Integer, default=60)  # seconds
    auto_start_rest_timer = Column(Boolean, default=True)
    default_weight_increment = Column(Float, default=2.5)
    
    # Data export preferences
    export_format = Column(String(20), default="csv")  # csv, json, hevy
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="settings", uselist=False)

class WorkoutSchedule(Base):
    __tablename__ = "workout_schedules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    workout_plan_id = Column(UUID(as_uuid=True), ForeignKey("workout_plans.id"))
    
    # Schedule details
    scheduled_date = Column(DateTime, nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0-6 (Monday-Sunday)
    
    # Workout info
    workout_name = Column(String(200), nullable=False)
    workout_type = Column(String(50))  # strength, cardio, flexibility, etc.
    duration_minutes = Column(Integer)
    
    # Status
    is_completed = Column(Boolean, default=False)
    completed_session_id = Column(UUID(as_uuid=True), ForeignKey("workout_sessions_v2.id"))
    is_rest_day = Column(Boolean, default=False)
    
    # Modifications
    original_date = Column(DateTime)  # If workout was moved
    moved_reason = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="workout_schedules")