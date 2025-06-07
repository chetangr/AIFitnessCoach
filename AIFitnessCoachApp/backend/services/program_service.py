"""
Service for managing user training programs
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
import uuid

from models.user import User
from models.custom_content import TrainingProgram, WorkoutTemplate
from models.user_program import (
    UserProgramEnrollment, 
    VacationPeriod, 
    ProgramWeekDetail,
    ProgramChangeHistory
)
from utils.logger import setup_logger

logger = setup_logger(__name__)

class ProgramService:
    """Service for managing user training programs"""
    
    async def enroll_user_in_program(
        self,
        db: AsyncSession,
        user_id: str,
        program_id: str,
        start_date: Optional[datetime] = None
    ) -> UserProgramEnrollment:
        """Enroll a user in a training program"""
        try:
            # Check if user has an active program
            current_enrollment = await self.get_active_enrollment(db, user_id)
            if current_enrollment:
                # End the current program
                await self.end_program_enrollment(
                    db, 
                    user_id, 
                    reason="Switched to new program"
                )
            
            # Get the program details
            program = await db.get(TrainingProgram, program_id)
            if not program:
                raise ValueError(f"Program {program_id} not found")
            
            # Create new enrollment
            enrollment = UserProgramEnrollment(
                user_id=user_id,
                program_id=program_id,
                enrolled_at=datetime.utcnow(),
                started_at=start_date or datetime.utcnow(),
                target_end_date=(start_date or datetime.utcnow()) + timedelta(weeks=program.duration_weeks),
                total_workouts=program.workouts_per_week * program.duration_weeks,
                is_active=True
            )
            
            db.add(enrollment)
            
            # Record program change if applicable
            if current_enrollment:
                change_history = ProgramChangeHistory(
                    user_id=user_id,
                    from_program_id=current_enrollment.program_id,
                    to_program_id=program_id,
                    changed_at=datetime.utcnow(),
                    weeks_completed_in_previous=current_enrollment.current_week,
                    completion_percentage=current_enrollment.completion_percentage
                )
                db.add(change_history)
            
            await db.commit()
            await db.refresh(enrollment)
            
            logger.info(f"User {user_id} enrolled in program {program_id}")
            return enrollment
            
        except Exception as e:
            logger.error(f"Error enrolling user in program: {e}")
            await db.rollback()
            raise
    
    async def get_active_enrollment(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Optional[UserProgramEnrollment]:
        """Get user's active program enrollment"""
        result = await db.execute(
            select(UserProgramEnrollment)
            .where(
                and_(
                    UserProgramEnrollment.user_id == user_id,
                    UserProgramEnrollment.is_active == True
                )
            )
            .options(selectinload(UserProgramEnrollment.program))
        )
        return result.scalar_one_or_none()
    
    async def pause_program(
        self,
        db: AsyncSession,
        user_id: str,
        reason: Optional[str] = None
    ) -> UserProgramEnrollment:
        """Pause user's current program"""
        enrollment = await self.get_active_enrollment(db, user_id)
        if not enrollment:
            raise ValueError("No active program to pause")
        
        enrollment.is_paused = True
        enrollment.paused_at = datetime.utcnow()
        enrollment.pause_reason = reason
        
        await db.commit()
        await db.refresh(enrollment)
        
        logger.info(f"Paused program for user {user_id}")
        return enrollment
    
    async def resume_program(
        self,
        db: AsyncSession,
        user_id: str
    ) -> UserProgramEnrollment:
        """Resume user's paused program"""
        enrollment = await self.get_active_enrollment(db, user_id)
        if not enrollment or not enrollment.is_paused:
            raise ValueError("No paused program to resume")
        
        enrollment.is_paused = False
        enrollment.resumed_at = datetime.utcnow()
        
        # Extend target end date by pause duration
        if enrollment.paused_at:
            pause_duration = datetime.utcnow() - enrollment.paused_at
            enrollment.target_end_date += pause_duration
        
        await db.commit()
        await db.refresh(enrollment)
        
        logger.info(f"Resumed program for user {user_id}")
        return enrollment
    
    async def add_vacation(
        self,
        db: AsyncSession,
        user_id: str,
        start_date: datetime,
        end_date: datetime,
        reason: Optional[str] = None
    ) -> VacationPeriod:
        """Add a vacation period for user"""
        enrollment = await self.get_active_enrollment(db, user_id)
        
        vacation = VacationPeriod(
            user_id=user_id,
            enrollment_id=enrollment.id if enrollment else None,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
            is_active=True
        )
        
        # Calculate workouts missed and extend program
        if enrollment:
            days_off = (end_date - start_date).days + 1
            vacation.workouts_missed = (days_off * enrollment.program.workouts_per_week) // 7
            vacation.program_extended_by_days = days_off
            
            # Extend program end date
            enrollment.target_end_date += timedelta(days=days_off)
        
        db.add(vacation)
        await db.commit()
        await db.refresh(vacation)
        
        logger.info(f"Added vacation for user {user_id}: {start_date} to {end_date}")
        return vacation
    
    async def get_program_details_with_weeks(
        self,
        db: AsyncSession,
        program_id: str
    ) -> Dict[str, Any]:
        """Get complete program details including week-by-week breakdown"""
        # Get program with week details
        result = await db.execute(
            select(TrainingProgram)
            .where(TrainingProgram.id == program_id)
            .options(
                selectinload(TrainingProgram.week_details),
                selectinload(TrainingProgram.creator)
            )
        )
        program = result.scalar_one_or_none()
        
        if not program:
            return None
        
        # Build response
        program_data = {
            "id": str(program.id),
            "name": program.name,
            "description": program.description,
            "duration_weeks": program.duration_weeks,
            "workouts_per_week": program.workouts_per_week,
            "difficulty_level": program.difficulty_level,
            "equipment_needed": program.equipment_needed,
            "target_audience": program.target_audience,
            "goal": program.goal,
            "total_workouts": program.duration_weeks * program.workouts_per_week,
            "estimated_total_hours": 0,  # Will calculate from week details
            "creator": {
                "name": program.creator.display_name or program.creator.username,
                "id": str(program.creator.id)
            } if program.creator else None,
            "weeks": []
        }
        
        # Add week details
        total_minutes = 0
        for week in sorted(program.week_details, key=lambda w: w.week_number):
            week_data = {
                "week_number": week.week_number,
                "week_name": week.week_name or f"Week {week.week_number}",
                "description": week.week_description,
                "total_workouts": week.total_workouts,
                "total_duration_minutes": week.total_duration_minutes,
                "intensity_level": week.intensity_level,
                "focus_muscle_groups": week.focus_muscle_groups,
                "progression_notes": week.progression_notes,
                "schedule": week.weekly_schedule
            }
            program_data["weeks"].append(week_data)
            total_minutes += week.total_duration_minutes or 0
        
        program_data["estimated_total_hours"] = round(total_minutes / 60, 1)
        
        # If no week details exist, create a basic structure from weekly_schedule
        if not program_data["weeks"] and program.weekly_schedule:
            # Generate basic week structure
            for week_num in range(1, program.duration_weeks + 1):
                week_data = {
                    "week_number": week_num,
                    "week_name": f"Week {week_num}",
                    "description": f"Training week {week_num} of {program.duration_weeks}",
                    "schedule": program.weekly_schedule,
                    "total_workouts": len([d for d in program.weekly_schedule.values() if d != "rest"]),
                    "estimated_duration_minutes": 60 * len([d for d in program.weekly_schedule.values() if d != "rest"])
                }
                program_data["weeks"].append(week_data)
        
        return program_data
    
    async def update_progress(
        self,
        db: AsyncSession,
        user_id: str,
        completed_workout_id: str
    ):
        """Update user's progress in their current program"""
        enrollment = await self.get_active_enrollment(db, user_id)
        if not enrollment:
            return
        
        enrollment.completed_workouts += 1
        enrollment.completion_percentage = (
            enrollment.completed_workouts / enrollment.total_workouts * 100
        )
        
        # Update current week based on progress
        workouts_per_week = enrollment.program.workouts_per_week
        if workouts_per_week > 0:
            enrollment.current_week = min(
                (enrollment.completed_workouts // workouts_per_week) + 1,
                enrollment.program.duration_weeks
            )
        
        await db.commit()
        logger.info(f"Updated progress for user {user_id}: {enrollment.completion_percentage}% complete")
    
    async def end_program_enrollment(
        self,
        db: AsyncSession,
        user_id: str,
        reason: Optional[str] = None
    ):
        """End user's current program enrollment"""
        enrollment = await self.get_active_enrollment(db, user_id)
        if not enrollment:
            return
        
        enrollment.is_active = False
        enrollment.actual_end_date = datetime.utcnow()
        
        await db.commit()
        logger.info(f"Ended program enrollment for user {user_id}")

# Create global instance
program_service = ProgramService()