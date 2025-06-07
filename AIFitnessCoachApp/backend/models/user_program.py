"""
Models for tracking user's current program and program history
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON, Text, Float
from .database_types import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from .base import Base

class UserProgramEnrollment(Base):
    """Track which program a user is currently following"""
    __tablename__ = "user_program_enrollments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    program_id = Column(UUID(as_uuid=True), ForeignKey("training_programs.id"), nullable=False)
    
    # Enrollment details
    enrolled_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime)
    target_end_date = Column(DateTime)
    actual_end_date = Column(DateTime)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_paused = Column(Boolean, default=False)
    paused_at = Column(DateTime)
    resumed_at = Column(DateTime)
    pause_reason = Column(Text)
    
    # Progress
    current_week = Column(Integer, default=1)
    completed_workouts = Column(Integer, default=0)
    total_workouts = Column(Integer)
    completion_percentage = Column(Float, default=0.0)
    
    # Customization
    custom_schedule = Column(JSON)  # User's modifications to the program
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="program_enrollments")
    program = relationship("TrainingProgram", back_populates="enrollments")
    vacation_periods = relationship("VacationPeriod", back_populates="enrollment", cascade="all, delete-orphan")

class VacationPeriod(Base):
    """Track vacation periods for users"""
    __tablename__ = "vacation_periods"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    enrollment_id = Column(UUID(as_uuid=True), ForeignKey("user_program_enrollments.id"))
    
    # Vacation details
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    reason = Column(Text)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Impact on program
    workouts_missed = Column(Integer, default=0)
    program_extended_by_days = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="vacation_periods")
    enrollment = relationship("UserProgramEnrollment", back_populates="vacation_periods")

class ProgramWeekDetail(Base):
    """Detailed week-by-week breakdown of training programs"""
    __tablename__ = "program_week_details"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    program_id = Column(UUID(as_uuid=True), ForeignKey("training_programs.id"), nullable=False)
    
    # Week info
    week_number = Column(Integer, nullable=False)
    week_name = Column(String(200))  # e.g., "Foundation Week", "Peak Week"
    week_description = Column(Text)
    
    # Schedule for this week
    weekly_schedule = Column(JSON, nullable=False)
    """
    {
        "monday": {
            "workout_template_id": "uuid",
            "workout_name": "Upper Body Push",
            "duration_minutes": 60,
            "exercises": [
                {
                    "exercise_id": "uuid",
                    "name": "Bench Press",
                    "sets": 4,
                    "reps": "8-10",
                    "rest_seconds": 120,
                    "duration_minutes": 15,
                    "tips": "Focus on controlled tempo"
                }
            ]
        },
        "tuesday": "rest",
        ...
    }
    """
    
    # Week metadata
    total_workouts = Column(Integer)
    total_duration_minutes = Column(Integer)
    focus_muscle_groups = Column(JSON, default=list)
    intensity_level = Column(String(20))  # light, moderate, heavy
    
    # Progression notes
    progression_notes = Column(Text)  # Instructions for progression from previous week
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    program = relationship("TrainingProgram", back_populates="week_details")

class ProgramChangeHistory(Base):
    """Track when users change programs"""
    __tablename__ = "program_change_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Program change details
    from_program_id = Column(UUID(as_uuid=True), ForeignKey("training_programs.id"))
    to_program_id = Column(UUID(as_uuid=True), ForeignKey("training_programs.id"))
    
    # Change metadata
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    change_reason = Column(Text)
    
    # Progress at time of change
    weeks_completed_in_previous = Column(Integer)
    completion_percentage = Column(Float)
    
    # Relationships
    user = relationship("User", back_populates="program_change_history")
    from_program = relationship("TrainingProgram", foreign_keys=[from_program_id])
    to_program = relationship("TrainingProgram", foreign_keys=[to_program_id])