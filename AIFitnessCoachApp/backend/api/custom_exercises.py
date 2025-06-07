"""Custom exercises API endpoints."""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_

from services.async_database import get_db
from services.auth_service import get_current_user_id
from models.custom_content import CustomExercise
from schemas.workout_sessions import (
    CustomExerciseCreate,
    CustomExerciseUpdate,
    CustomExerciseResponse
)

router = APIRouter(tags=["custom-exercises"])

@router.post("", response_model=CustomExerciseResponse)
async def create_custom_exercise(
    exercise: CustomExerciseCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new custom exercise."""
    # Handle demo user
    if user_id == "demo-user-001":
        import uuid
        return CustomExerciseResponse(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=exercise.name,
            category=exercise.category,
            muscle_groups=exercise.muscle_groups,
            equipment_needed=exercise.equipment_needed,  # Changed from equipment
            instructions=exercise.instructions,
            video_url=exercise.video_url if hasattr(exercise, 'video_url') else None,
            is_public=exercise.is_public if hasattr(exercise, 'is_public') else False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    # Check if exercise with same name already exists for user
    existing_query = select(CustomExercise).where(
        and_(
            CustomExercise.user_id == user_id,
            CustomExercise.name == exercise.name
        )
    )
    result = await db.execute(existing_query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Exercise with this name already exists")
    
    db_exercise = CustomExercise(
        user_id=user_id,
        **exercise.dict()
    )
    db.add(db_exercise)
    await db.commit()
    await db.refresh(db_exercise)
    
    return db_exercise

@router.get("", response_model=List[CustomExerciseResponse])
async def get_custom_exercises(
    include_public: bool = False,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's custom exercises."""
    if include_public:
        # Get user's exercises and public exercises
        query = select(CustomExercise).where(
            (CustomExercise.user_id == user_id) | (CustomExercise.is_public == True)
        ).order_by(desc(CustomExercise.created_at)).limit(limit).offset(offset)
    else:
        # Get only user's exercises
        query = select(CustomExercise).where(
            CustomExercise.user_id == user_id
        ).order_by(desc(CustomExercise.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    exercises = result.scalars().all()
    
    return exercises

@router.get("/{exercise_id}", response_model=CustomExerciseResponse)
async def get_custom_exercise(
    exercise_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific custom exercise."""
    query = select(CustomExercise).where(
        and_(
            CustomExercise.id == exercise_id,
            (CustomExercise.user_id == user_id) | (CustomExercise.is_public == True)
        )
    )
    result = await db.execute(query)
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    return exercise

@router.put("/{exercise_id}", response_model=CustomExerciseResponse)
async def update_custom_exercise(
    exercise_id: str,
    exercise_update: CustomExerciseUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update a custom exercise."""
    query = select(CustomExercise).where(
        and_(
            CustomExercise.id == exercise_id,
            CustomExercise.user_id == user_id
        )
    )
    result = await db.execute(query)
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found or you don't have permission to update it")
    
    # Update fields
    update_data = exercise_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exercise, field, value)
    
    await db.commit()
    await db.refresh(exercise)
    
    return exercise

@router.delete("/{exercise_id}")
async def delete_custom_exercise(
    exercise_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a custom exercise."""
    query = select(CustomExercise).where(
        and_(
            CustomExercise.id == exercise_id,
            CustomExercise.user_id == user_id
        )
    )
    result = await db.execute(query)
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found or you don't have permission to delete it")
    
    await db.delete(exercise)
    await db.commit()
    
    return {"message": "Exercise deleted successfully"}

@router.post("/{exercise_id}/share", response_model=CustomExerciseResponse)
async def share_custom_exercise(
    exercise_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Make a custom exercise public."""
    query = select(CustomExercise).where(
        and_(
            CustomExercise.id == exercise_id,
            CustomExercise.user_id == user_id
        )
    )
    result = await db.execute(query)
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found or you don't have permission to share it")
    
    exercise.is_public = True
    await db.commit()
    await db.refresh(exercise)
    
    return exercise