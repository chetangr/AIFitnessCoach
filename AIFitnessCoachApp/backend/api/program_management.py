"""
API endpoints for program management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from services.async_database import get_db
from services.auth_service import get_current_user_id
from services.program_service import program_service
from utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()

# Request/Response models
class ProgramEnrollmentRequest(BaseModel):
    program_id: str
    start_date: Optional[datetime] = None

class VacationRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    reason: Optional[str] = None

class ProgramEnrollmentResponse(BaseModel):
    enrollment_id: str
    program_id: str
    program_name: str
    started_at: datetime
    target_end_date: datetime
    current_week: int
    completion_percentage: float
    is_paused: bool
    is_active: bool

@router.post("/enroll", response_model=ProgramEnrollmentResponse)
async def enroll_in_program(
    request: ProgramEnrollmentRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Enroll user in a training program"""
    try:
        enrollment = await program_service.enroll_user_in_program(
            db=db,
            user_id=str(current_user_id),
            program_id=request.program_id,
            start_date=request.start_date
        )
        
        await db.refresh(enrollment, ["program"])
        
        return ProgramEnrollmentResponse(
            enrollment_id=str(enrollment.id),
            program_id=str(enrollment.program_id),
            program_name=enrollment.program.name,
            started_at=enrollment.started_at,
            target_end_date=enrollment.target_end_date,
            current_week=enrollment.current_week,
            completion_percentage=enrollment.completion_percentage,
            is_paused=enrollment.is_paused,
            is_active=enrollment.is_active
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error enrolling in program: {e}")
        raise HTTPException(status_code=500, detail="Failed to enroll in program")

@router.get("/current", response_model=Optional[ProgramEnrollmentResponse])
async def get_current_program(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get user's current program enrollment"""
    enrollment = await program_service.get_active_enrollment(db, str(current_user_id))
    
    if not enrollment:
        return None
    
    return ProgramEnrollmentResponse(
        enrollment_id=str(enrollment.id),
        program_id=str(enrollment.program_id),
        program_name=enrollment.program.name,
        started_at=enrollment.started_at,
        target_end_date=enrollment.target_end_date,
        current_week=enrollment.current_week,
        completion_percentage=enrollment.completion_percentage,
        is_paused=enrollment.is_paused,
        is_active=enrollment.is_active
    )

@router.post("/pause")
async def pause_program(
    reason: Optional[str] = None,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Pause current program"""
    try:
        enrollment = await program_service.pause_program(
            db=db,
            user_id=str(current_user_id),
            reason=reason
        )
        return {"message": "Program paused successfully", "paused_at": enrollment.paused_at}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/resume")
async def resume_program(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Resume paused program"""
    try:
        enrollment = await program_service.resume_program(
            db=db,
            user_id=str(current_user_id)
        )
        return {
            "message": "Program resumed successfully", 
            "resumed_at": enrollment.resumed_at,
            "new_end_date": enrollment.target_end_date
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/vacation")
async def add_vacation(
    request: VacationRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Add vacation period"""
    try:
        if request.end_date < request.start_date:
            raise ValueError("End date must be after start date")
        
        vacation = await program_service.add_vacation(
            db=db,
            user_id=str(current_user_id),
            start_date=request.start_date,
            end_date=request.end_date,
            reason=request.reason
        )
        
        return {
            "message": "Vacation added successfully",
            "vacation_id": str(vacation.id),
            "workouts_missed": vacation.workouts_missed,
            "program_extended_by_days": vacation.program_extended_by_days
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/details/{program_id}")
async def get_program_details(
    program_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed program information including week-by-week breakdown"""
    program_data = await program_service.get_program_details_with_weeks(
        db=db,
        program_id=program_id
    )
    
    if not program_data:
        raise HTTPException(status_code=404, detail="Program not found")
    
    return program_data

@router.post("/complete-workout/{workout_id}")
async def mark_workout_complete(
    workout_id: str,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Mark a workout as complete and update program progress"""
    await program_service.update_progress(
        db=db,
        user_id=str(current_user_id),
        completed_workout_id=workout_id
    )
    
    return {"message": "Workout completed and progress updated"}