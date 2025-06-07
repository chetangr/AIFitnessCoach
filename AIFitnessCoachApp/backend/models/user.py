from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, Enum
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel

class FitnessLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class User(BaseModel):
    __tablename__ = "users"
    
    # Authentication
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Profile
    first_name = Column(String(100))
    last_name = Column(String(100))
    display_name = Column(String(200))
    profile_image_url = Column(String(500))
    
    # Fitness Data
    fitness_level = Column(Enum(FitnessLevel), default=FitnessLevel.BEGINNER)
    goals = Column(JSON, default=list)  # ["weight_loss", "muscle_gain", "endurance", etc.]
    current_weight = Column(Float)  # in kg
    target_weight = Column(Float)  # in kg
    height = Column(Integer)  # in cm
    age = Column(Integer)
    
    # Preferences
    preferred_coach_id = Column(String(50), default="emma")  # emma, max, dr_progress
    training_equipment = Column(JSON, default=list)  # ["dumbbells", "resistance_bands", etc.]
    diet_preference = Column(String(50))  # "vegetarian", "vegan", "keto", etc.
    mindset_activities = Column(JSON, default=list)  # ["meditation", "journaling", etc.]
    
    # Stats
    total_workouts_completed = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    total_calories_burned = Column(Integer, default=0)
    total_minutes_trained = Column(Integer, default=0)
    
    # Account Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    onboarding_completed = Column(Boolean, default=False)
    
    # Relationships
    workout_plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    coaching_sessions = relationship("CoachingSession", back_populates="user", cascade="all, delete-orphan")
    workout_sessions = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")
    workout_sessions_v2 = relationship("WorkoutSessionV2", back_populates="user", cascade="all, delete-orphan")
    progress_records = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    measurements = relationship("BodyMeasurement", back_populates="user", cascade="all, delete-orphan")
    progress_photos = relationship("ProgressPhoto", back_populates="user", cascade="all, delete-orphan")
    fasting_sessions = relationship("FastingSession", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    workout_schedules = relationship("WorkoutSchedule", back_populates="user", cascade="all, delete-orphan")
    custom_exercises = relationship("CustomExercise", back_populates="creator", cascade="all, delete-orphan")
    workout_templates = relationship("WorkoutTemplate", back_populates="creator", cascade="all, delete-orphan")
    training_programs = relationship("TrainingProgram", back_populates="creator", cascade="all, delete-orphan")
    
    # Program tracking
    program_enrollments = relationship("UserProgramEnrollment", back_populates="user", cascade="all, delete-orphan")
    vacation_periods = relationship("VacationPeriod", back_populates="user", cascade="all, delete-orphan")
    program_change_history = relationship("ProgramChangeHistory", back_populates="user", cascade="all, delete-orphan")
    
    @property
    def current_program(self):
        """Get the user's currently active program enrollment"""
        return next((e for e in self.program_enrollments if e.is_active and not e.is_paused), None)