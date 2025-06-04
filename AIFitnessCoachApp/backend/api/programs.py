from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.custom_content import TrainingProgram, WorkoutTemplate, CustomExercise
from ..models.user import User
from ..services.async_database import get_async_db
from ..services.auth_service import get_current_user_id
from ..schemas.auth import UserResponse
from ..utils.logger import logger

router = APIRouter()

# Pydantic models for request/response
class ProgramBase(BaseModel):
    name: str
    description: str
    difficulty_level: str
    duration_weeks: int
    category: str = 'general'
    target_goals: List[str] = []
    equipment_needed: List[str] = []
    workouts_per_week: int = 3
    weekly_schedule: Dict[str, Any] = {}
    is_public: bool = False

class ProgramCreate(ProgramBase):
    pass

class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    difficulty_level: Optional[str] = None
    duration_weeks: Optional[int] = None
    category: Optional[str] = None
    target_goals: Optional[List[str]] = None
    equipment_needed: Optional[List[str]] = None
    workouts_per_week: Optional[int] = None
    weekly_schedule: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None

class ProgramResponse(ProgramBase):
    id: int
    created_by: int
    is_mine: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkoutTemplateBase(BaseModel):
    name: str
    description: str = ''
    category: str
    difficulty_level: str = 'intermediate'
    duration_minutes: int = 60
    equipment_needed: List[str] = []
    exercises: List[Dict[str, Any]]
    is_public: bool = False

class WorkoutTemplateCreate(WorkoutTemplateBase):
    pass

class WorkoutTemplateResponse(WorkoutTemplateBase):
    id: int
    created_by: int
    is_mine: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=Dict[str, Any])
async def get_programs(
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get all training programs (user's custom + public)"""
    try:
        # Get user's custom programs
        user_programs_query = select(TrainingProgram).where(
            TrainingProgram.created_by == current_user_id
        )
        user_programs_result = await db.execute(user_programs_query)
        user_programs = user_programs_result.scalars().all()
        
        # Get public programs
        public_programs_query = select(TrainingProgram).where(
            and_(
                TrainingProgram.is_public == True,
                TrainingProgram.created_by != current_user_id
            )
        )
        public_programs_result = await db.execute(public_programs_query)
        public_programs = public_programs_result.scalars().all()
        
        programs_data = []
        for program in user_programs + public_programs:
            program_dict = {
                'id': program.id,
                'name': program.name,
                'description': program.description,
                'difficulty_level': program.difficulty_level,
                'duration_weeks': program.duration_weeks,
                'category': program.category,
                'target_goals': program.target_goals,
                'equipment_needed': program.equipment_needed,
                'workouts_per_week': program.workouts_per_week,
                'is_public': program.is_public,
                'is_mine': program.created_by == current_user_id,
                'created_at': program.created_at.isoformat() if program.created_at else None
            }
            programs_data.append(program_dict)
        
        return {
            'programs': programs_data,
            'total': len(programs_data)
        }
        
    except Exception as e:
        logger.error(f"Error fetching programs: {str(e)}")
        raise HTTPException(status_code=500, detail='Failed to fetch programs')

@router.get("/{program_id}", response_model=Dict[str, Any])
async def get_program(
    program_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get detailed program information"""
    try:
        # Get program
        program_query = select(TrainingProgram).where(
            TrainingProgram.id == program_id
        )
        result = await db.execute(program_query)
        program = result.scalar_one_or_none()
        
        if not program:
            raise HTTPException(status_code=404, detail='Program not found')
        
        # Check access permissions
        if not program.is_public and program.created_by != current_user_id:
            raise HTTPException(status_code=403, detail='Access denied')
        
        # Get associated workout templates
        workout_ids = program.weekly_schedule.get('workout_ids', [])
        if workout_ids:
            workouts_query = select(WorkoutTemplate).where(
                WorkoutTemplate.id.in_(workout_ids)
            )
            workouts_result = await db.execute(workouts_query)
            workouts = workouts_result.scalars().all()
        else:
            workouts = []
        
        program_data = {
            'id': program.id,
            'name': program.name,
            'description': program.description,
            'difficulty_level': program.difficulty_level,
            'duration_weeks': program.duration_weeks,
            'category': program.category,
            'target_goals': program.target_goals,
            'equipment_needed': program.equipment_needed,
            'workouts_per_week': program.workouts_per_week,
            'weekly_schedule': program.weekly_schedule,
            'is_public': program.is_public,
            'is_mine': program.created_by == current_user_id,
            'workouts': [{
                'id': w.id,
                'name': w.name,
                'description': w.description,
                'category': w.category,
                'duration_minutes': w.duration_minutes,
                'difficulty_level': w.difficulty_level,
                'exercises': w.exercises
            } for w in workouts]
        }
        
        return program_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching program {program_id}: {str(e)}")
        raise HTTPException(status_code=500, detail='Failed to fetch program')

@router.post("/", response_model=Dict[str, Any])
async def create_program(
    program: ProgramCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create a new training program"""
    try:
        # Create new program
        new_program = TrainingProgram(
            name=program.name,
            description=program.description,
            difficulty_level=program.difficulty_level,
            duration_weeks=program.duration_weeks,
            category=program.category,
            target_goals=program.target_goals,
            equipment_needed=program.equipment_needed,
            workouts_per_week=program.workouts_per_week,
            weekly_schedule=program.weekly_schedule,
            is_public=program.is_public,
            created_by=current_user_id,
            created_at=datetime.utcnow()
        )
        
        db.add(new_program)
        await db.commit()
        await db.refresh(new_program)
        
        return {
            'id': new_program.id,
            'name': new_program.name,
            'message': 'Program created successfully'
        }
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating program: {str(e)}")
        raise HTTPException(status_code=500, detail='Failed to create program')

@router.put("/{program_id}", response_model=Dict[str, Any])
async def update_program(
    program_id: int,
    program_update: ProgramUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Update a training program"""
    try:
        # Get program
        program_query = select(TrainingProgram).where(
            and_(
                TrainingProgram.id == program_id,
                TrainingProgram.created_by == current_user_id
            )
        )
        result = await db.execute(program_query)
        program = result.scalar_one_or_none()
        
        if not program:
            raise HTTPException(status_code=404, detail='Program not found or access denied')
        
        # Update fields
        update_data = program_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(program, field, value)
        
        program.updated_at = datetime.utcnow()
        await db.commit()
        
        return {
            'id': program.id,
            'message': 'Program updated successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating program {program_id}: {str(e)}")
        raise HTTPException(status_code=500, detail='Failed to update program')

@router.delete("/{program_id}")
async def delete_program(
    program_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Delete a training program"""
    try:
        # Get program
        program_query = select(TrainingProgram).where(
            and_(
                TrainingProgram.id == program_id,
                TrainingProgram.created_by == current_user_id
            )
        )
        result = await db.execute(program_query)
        program = result.scalar_one_or_none()
        
        if not program:
            raise HTTPException(status_code=404, detail='Program not found or access denied')
        
        await db.delete(program)
        await db.commit()
        
        return {'message': 'Program deleted successfully'}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting program {program_id}: {str(e)}")
        raise HTTPException(status_code=500, detail='Failed to delete program')

@router.post("/{program_id}/subscribe")
async def subscribe_to_program(
    program_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Subscribe to a training program"""
    try:
        # Get program
        program_query = select(TrainingProgram).where(
            TrainingProgram.id == program_id
        )
        result = await db.execute(program_query)
        program = result.scalar_one_or_none()
        
        if not program:
            raise HTTPException(status_code=404, detail='Program not found')
        
        # Check access
        if not program.is_public and program.created_by != current_user_id:
            raise HTTPException(status_code=403, detail='Access denied')
        
        # Update user's active program
        user_query = select(User).where(User.id == current_user_id)
        user_result = await db.execute(user_query)
        user = user_result.scalar_one_or_none()
        
        if user:
            # Store the active program ID in user preferences
            if not user.preferences:
                user.preferences = {}
            user.preferences['active_program_id'] = program_id
            user.preferences['program_start_date'] = datetime.utcnow().isoformat()
            await db.commit()
        
        return {
            'message': 'Successfully subscribed to program',
            'program_id': program_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error subscribing to program {program_id}: {str(e)}")
        raise HTTPException(status_code=500, detail='Failed to subscribe to program')

@router.post("/{program_id}/duplicate", response_model=Dict[str, Any])
async def duplicate_program(
    program_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Duplicate a program as a custom program"""
    try:
        # Get original program
        program_query = select(TrainingProgram).where(
            TrainingProgram.id == program_id
        )
        result = await db.execute(program_query)
        original = result.scalar_one_or_none()
        
        if not original:
            raise HTTPException(status_code=404, detail='Program not found')
        
        # Check access
        if not original.is_public and original.created_by != current_user_id:
            raise HTTPException(status_code=403, detail='Access denied')
        
        # Create duplicate
        duplicate = TrainingProgram(
            name=f"{original.name} (Copy)",
            description=original.description,
            difficulty_level=original.difficulty_level,
            duration_weeks=original.duration_weeks,
            category=original.category,
            target_goals=original.target_goals,
            equipment_needed=original.equipment_needed,
            workouts_per_week=original.workouts_per_week,
            weekly_schedule=original.weekly_schedule,
            is_public=False,  # User's copy is private by default
            created_by=current_user_id,
            created_at=datetime.utcnow()
        )
        
        db.add(duplicate)
        await db.commit()
        await db.refresh(duplicate)
        
        return {
            'id': duplicate.id,
            'name': duplicate.name,
            'message': 'Program duplicated successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error duplicating program {program_id}: {str(e)}")
        raise HTTPException(status_code=500, detail='Failed to duplicate program')

# Workout Template endpoints

@router.post("/workouts", response_model=Dict[str, Any])
async def create_workout_template(
    workout: WorkoutTemplateCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create a new workout template"""
    try:
        # Create workout template
        new_workout = WorkoutTemplate(
            name=workout.name,
            description=workout.description,
            category=workout.category,
            difficulty_level=workout.difficulty_level,
            duration_minutes=workout.duration_minutes,
            equipment_needed=workout.equipment_needed,
            exercises=workout.exercises,
            created_by=current_user_id,
            is_public=workout.is_public,
            created_at=datetime.utcnow()
        )
        
        db.add(new_workout)
        await db.commit()
        await db.refresh(new_workout)
        
        return {
            'id': new_workout.id,
            'name': new_workout.name,
            'message': 'Workout template created successfully'
        }
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating workout template: {str(e)}")
        raise HTTPException(status_code=500, detail='Failed to create workout template')

@router.get("/workouts/{workout_id}", response_model=WorkoutTemplateResponse)
async def get_workout_template(
    workout_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get a specific workout template"""
    try:
        # Get workout
        workout_query = select(WorkoutTemplate).where(
            WorkoutTemplate.id == workout_id
        )
        result = await db.execute(workout_query)
        workout = result.scalar_one_or_none()
        
        if not workout:
            raise HTTPException(status_code=404, detail='Workout not found')
        
        # Check access
        if not workout.is_public and workout.created_by != current_user_id:
            raise HTTPException(status_code=403, detail='Access denied')
        
        # Convert to response model
        workout_response = WorkoutTemplateResponse(
            id=workout.id,
            name=workout.name,
            description=workout.description,
            category=workout.category,
            difficulty_level=workout.difficulty_level,
            duration_minutes=workout.duration_minutes,
            equipment_needed=workout.equipment_needed,
            exercises=workout.exercises,
            is_public=workout.is_public,
            created_by=workout.created_by,
            is_mine=workout.created_by == current_user_id,
            created_at=workout.created_at
        )
        
        return workout_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching workout {workout_id}: {str(e)}")
        raise HTTPException(status_code=500, detail='Failed to fetch workout')