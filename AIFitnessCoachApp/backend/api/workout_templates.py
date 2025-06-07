"""Workout templates API endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from datetime import datetime
import uuid

from services.async_database import get_db
from services.auth_service import get_current_user_id
from models.custom_content import WorkoutTemplate
from models.workout import WorkoutPlan
from schemas.workout_sessions import (
    WorkoutTemplateCreate,
    WorkoutTemplateResponse
)

router = APIRouter(tags=["workout-templates"])

@router.post("", response_model=WorkoutTemplateResponse)
async def create_workout_template(
    template: WorkoutTemplateCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new workout template."""
    # Check if template with same name already exists for user
    existing_query = select(WorkoutTemplate).where(
        and_(
            WorkoutTemplate.user_id == user_id,
            WorkoutTemplate.name == template.name
        )
    )
    result = await db.execute(existing_query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Template with this name already exists")
    
    db_template = WorkoutTemplate(
        user_id=user_id,
        **template.dict()
    )
    db.add(db_template)
    await db.commit()
    await db.refresh(db_template)
    
    return db_template

@router.get("", response_model=List[WorkoutTemplateResponse])
async def get_workout_templates(
    include_public: bool = False,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user's workout templates."""
    if include_public:
        # Get user's templates and public templates
        query = select(WorkoutTemplate).where(
            (WorkoutTemplate.user_id == user_id) | (WorkoutTemplate.is_public == True)
        ).order_by(desc(WorkoutTemplate.created_at)).limit(limit).offset(offset)
    else:
        # Get only user's templates
        query = select(WorkoutTemplate).where(
            WorkoutTemplate.user_id == user_id
        ).order_by(desc(WorkoutTemplate.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    templates = result.scalars().all()
    
    return templates

@router.get("/{template_id}", response_model=WorkoutTemplateResponse)
async def get_workout_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific workout template."""
    query = select(WorkoutTemplate).where(
        and_(
            WorkoutTemplate.id == template_id,
            (WorkoutTemplate.user_id == user_id) | (WorkoutTemplate.is_public == True)
        )
    )
    result = await db.execute(query)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template

@router.put("/{template_id}", response_model=WorkoutTemplateResponse)
async def update_workout_template(
    template_id: str,
    template_update: WorkoutTemplateCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update a workout template."""
    query = select(WorkoutTemplate).where(
        and_(
            WorkoutTemplate.id == template_id,
            WorkoutTemplate.user_id == user_id
        )
    )
    result = await db.execute(query)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found or you don't have permission to update it")
    
    # Update fields
    update_data = template_update.dict()
    for field, value in update_data.items():
        setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(template)
    
    return template

@router.delete("/{template_id}")
async def delete_workout_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a workout template."""
    query = select(WorkoutTemplate).where(
        and_(
            WorkoutTemplate.id == template_id,
            WorkoutTemplate.user_id == user_id
        )
    )
    result = await db.execute(query)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found or you don't have permission to delete it")
    
    await db.delete(template)
    await db.commit()
    
    return {"message": "Template deleted successfully"}

@router.post("/{template_id}/use", response_model=dict)
async def use_workout_template(
    template_id: str,
    workout_name: str = None,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Create a workout plan from a template."""
    query = select(WorkoutTemplate).where(
        and_(
            WorkoutTemplate.id == template_id,
            (WorkoutTemplate.user_id == user_id) | (WorkoutTemplate.is_public == True)
        )
    )
    result = await db.execute(query)
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Update times used
    template.times_used = (template.times_used or 0) + 1
    
    # Create workout plan from template
    workout_plan = WorkoutPlan(
        id=str(uuid.uuid4()),
        user_id=user_id,
        name=workout_name or f"{template.name} - {datetime.now().strftime('%Y-%m-%d')}",
        description=template.description,
        exercises=template.exercises,
        duration_minutes=60,  # Default duration
        difficulty_level="intermediate",  # Default difficulty
        created_by=user_id
    )
    
    db.add(workout_plan)
    await db.commit()
    await db.refresh(workout_plan)
    
    return {
        "message": "Workout plan created from template",
        "workout_plan_id": workout_plan.id,
        "workout_plan_name": workout_plan.name
    }