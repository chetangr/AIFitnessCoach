"""Workout schedule API endpoints."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from services.async_database import get_db
from services.auth_service import get_current_user_id
from models.measurements import WorkoutSchedule
from schemas.measurements import (
    WorkoutScheduleCreate,
    WorkoutScheduleResponse,
    WorkoutScheduleMove
)

router = APIRouter(tags=["workout-schedule"])

async def get_or_create_schedule(user_id: str, db: AsyncSession) -> WorkoutSchedule:
    """Get user's workout schedule or create a new one."""
    query = select(WorkoutSchedule).where(WorkoutSchedule.user_id == user_id)
    result = await db.execute(query)
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        # Create default schedule
        schedule = WorkoutSchedule(user_id=user_id)
        db.add(schedule)
        await db.commit()
        await db.refresh(schedule)
    
    return schedule

@router.get("", response_model=WorkoutScheduleResponse)
async def get_workout_schedule(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get the current workout schedule."""
    # Handle demo user
    if user_id == "demo-user-001":
        import uuid
        now = datetime.utcnow()
        return WorkoutScheduleResponse(
            id=str(uuid.uuid4()),
            user_id=user_id,
            schedule_data={
                "monday": {"workout_id": "upper-body-1", "name": "Upper Body Strength"},
                "tuesday": {"workout_id": "cardio-1", "name": "HIIT Cardio"},
                "wednesday": {"workout_id": "lower-body-1", "name": "Lower Body Power"},
                "thursday": {"workout_id": "active-recovery", "name": "Active Recovery"},
                "friday": {"workout_id": "full-body-1", "name": "Full Body Circuit"},
                "saturday": {"workout_id": "cardio-2", "name": "Long Run"},
                "sunday": {"rest": True, "name": "Rest Day"}
            },
            created_at=now,
            updated_at=now
        )
    
    schedule = await get_or_create_schedule(user_id, db)
    return schedule

@router.post("", response_model=WorkoutScheduleResponse)
async def update_workout_schedule(
    schedule_data: WorkoutScheduleCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Create or update the workout schedule."""
    schedule = await get_or_create_schedule(user_id, db)
    
    # Update schedule fields
    update_data = schedule_data.dict()
    for day, workout_id in update_data.items():
        if workout_id is not None:
            setattr(schedule, day, workout_id)
    
    schedule.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(schedule)
    
    return schedule

@router.put("/move", response_model=dict)
async def move_workout(
    move_data: WorkoutScheduleMove,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Move a workout from one day to another."""
    valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    if move_data.from_day not in valid_days or move_data.to_day not in valid_days:
        raise HTTPException(status_code=400, detail="Invalid day specified")
    
    if move_data.from_day == move_data.to_day:
        raise HTTPException(status_code=400, detail="Source and destination days are the same")
    
    schedule = await get_or_create_schedule(user_id, db)
    
    # Get workout IDs
    from_workout = getattr(schedule, move_data.from_day)
    to_workout = getattr(schedule, move_data.to_day)
    
    if not from_workout or from_workout == 'rest':
        raise HTTPException(status_code=400, detail=f"No workout scheduled on {move_data.from_day}")
    
    # Perform the move
    if move_data.swap:
        # Swap workouts between days
        setattr(schedule, move_data.from_day, to_workout)
        setattr(schedule, move_data.to_day, from_workout)
        message = f"Swapped workouts between {move_data.from_day} and {move_data.to_day}"
    else:
        # Move workout (overwrite destination)
        setattr(schedule, move_data.from_day, 'rest')
        setattr(schedule, move_data.to_day, from_workout)
        message = f"Moved workout from {move_data.from_day} to {move_data.to_day}"
    
    schedule.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(schedule)
    
    return {"message": message, "schedule": schedule}

@router.post("/rest-day", response_model=dict)
async def mark_rest_day(
    day: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Mark a specific day as a rest day."""
    valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    if day not in valid_days:
        raise HTTPException(status_code=400, detail="Invalid day specified")
    
    schedule = await get_or_create_schedule(user_id, db)
    
    setattr(schedule, day, 'rest')
    schedule.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(schedule)
    
    return {"message": f"{day.capitalize()} marked as rest day", "schedule": schedule}

@router.delete("")
async def clear_workout_schedule(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Clear the entire workout schedule."""
    schedule = await get_or_create_schedule(user_id, db)
    
    # Set all days to None
    for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
        setattr(schedule, day, None)
    
    schedule.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": "Workout schedule cleared successfully"}