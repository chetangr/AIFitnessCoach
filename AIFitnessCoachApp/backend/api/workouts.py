from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from datetime import datetime, date
from uuid import UUID

from models.user import User
from models.workout import WorkoutPlan, WorkoutPlanVersion
from services.async_database import get_db
from services.auth_service import AuthService
from schemas.workout import (
    WorkoutPlanCreate,
    WorkoutPlanUpdate,
    WorkoutPlanResponse,
    WorkoutSessionCreate,
    WorkoutStats
)

router = APIRouter()
auth_service = AuthService()

@router.get("/plans", response_model=dict)
async def get_user_workouts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's workout plans with pagination"""
    # Count total workouts
    count_stmt = select(WorkoutPlan).where(WorkoutPlan.user_id == current_user.id)
    total_result = await db.execute(count_stmt)
    total = len(total_result.all())
    
    # Get paginated workouts
    offset = (page - 1) * page_size
    stmt = (
        select(WorkoutPlan)
        .where(WorkoutPlan.user_id == current_user.id)
        .order_by(WorkoutPlan.scheduled_for.desc())
        .offset(offset)
        .limit(page_size)
    )
    
    result = await db.execute(stmt)
    workouts = result.scalars().all()
    
    return {
        "items": [
            WorkoutPlanResponse.from_orm(workout) for workout in workouts
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_more": offset + page_size < total
    }

@router.get("/plans/{plan_id}", response_model=WorkoutPlanResponse)
async def get_workout_plan(
    plan_id: UUID,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific workout plan"""
    stmt = select(WorkoutPlan).where(
        and_(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == current_user.id
        )
    )
    
    result = await db.execute(stmt)
    workout = result.scalar_one_or_none()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found"
        )
    
    return WorkoutPlanResponse.from_orm(workout)

@router.post("/plans", response_model=WorkoutPlanResponse)
async def create_workout_plan(
    workout_data: WorkoutPlanCreate,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new workout plan"""
    workout = WorkoutPlan(
        user_id=current_user.id,
        name=workout_data.name,
        description=workout_data.description,
        difficulty=workout_data.difficulty,
        duration_minutes=workout_data.duration_minutes,
        exercises=workout_data.exercises,
        equipment_required=workout_data.equipment_required,
        muscle_groups=workout_data.muscle_groups,
        scheduled_for=workout_data.scheduled_for,
        metadata=workout_data.metadata or {}
    )
    
    db.add(workout)
    await db.commit()
    await db.refresh(workout)
    
    # Create initial version
    version = WorkoutPlanVersion(
        plan_id=workout.id,
        version_number=1,
        changes_description="Initial creation",
        exercises=workout.exercises,
        created_by="user"
    )
    db.add(version)
    await db.commit()
    
    return WorkoutPlanResponse.from_orm(workout)

@router.put("/plans/{plan_id}", response_model=WorkoutPlanResponse)
async def update_workout_plan(
    plan_id: UUID,
    updates: WorkoutPlanUpdate,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update workout plan"""
    stmt = select(WorkoutPlan).where(
        and_(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == current_user.id
        )
    )
    
    result = await db.execute(stmt)
    workout = result.scalar_one_or_none()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found"
        )
    
    # Track changes for versioning
    changes = []
    
    # Update fields
    for field, value in updates.dict(exclude_unset=True).items():
        if hasattr(workout, field) and value is not None:
            old_value = getattr(workout, field)
            setattr(workout, field, value)
            if old_value != value:
                changes.append(f"{field}: {old_value} -> {value}")
    
    # Create new version if exercises changed
    if updates.exercises and updates.exercises != workout.exercises:
        # Get latest version number
        version_stmt = select(WorkoutPlanVersion).where(
            WorkoutPlanVersion.plan_id == plan_id
        ).order_by(WorkoutPlanVersion.version_number.desc())
        version_result = await db.execute(version_stmt)
        latest_version = version_result.first()
        
        new_version = WorkoutPlanVersion(
            plan_id=workout.id,
            version_number=(latest_version.version_number + 1) if latest_version else 1,
            changes_description="; ".join(changes) if changes else "Manual update",
            exercises=updates.exercises,
            created_by="user"
        )
        db.add(new_version)
    
    await db.commit()
    await db.refresh(workout)
    
    return WorkoutPlanResponse.from_orm(workout)

@router.delete("/plans/{plan_id}")
async def delete_workout_plan(
    plan_id: UUID,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete workout plan"""
    stmt = select(WorkoutPlan).where(
        and_(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == current_user.id
        )
    )
    
    result = await db.execute(stmt)
    workout = result.scalar_one_or_none()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found"
        )
    
    await db.delete(workout)
    await db.commit()
    
    return {"message": "Workout plan deleted successfully"}

@router.get("/scheduled")
async def get_scheduled_workouts(
    start_date: date,
    end_date: date,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get workouts scheduled between dates"""
    stmt = select(WorkoutPlan).where(
        and_(
            WorkoutPlan.user_id == current_user.id,
            WorkoutPlan.scheduled_for >= start_date,
            WorkoutPlan.scheduled_for <= end_date
        )
    ).order_by(WorkoutPlan.scheduled_for)
    
    result = await db.execute(stmt)
    workouts = result.scalars().all()
    
    return [WorkoutPlanResponse.from_orm(workout) for workout in workouts]

@router.get("/stats", response_model=WorkoutStats)
async def get_workout_stats(
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user workout statistics"""
    # Get all user workouts
    stmt = select(WorkoutPlan).where(WorkoutPlan.user_id == current_user.id)
    result = await db.execute(stmt)
    workouts = result.scalars().all()
    
    total_workouts = len(workouts)
    completed_workouts = len([w for w in workouts if w.is_completed])
    total_duration = sum(w.duration_minutes for w in workouts if w.is_completed)
    
    # Calculate calories (rough estimate: 7 cal/min for moderate intensity)
    total_calories = total_duration * 7
    
    return WorkoutStats(
        total_workouts=total_workouts,
        completed_workouts=completed_workouts,
        total_duration=total_duration,
        total_calories_burned=total_calories,
        current_streak=current_user.current_streak,
        longest_streak=current_user.current_streak  # TODO: Track longest streak
    )