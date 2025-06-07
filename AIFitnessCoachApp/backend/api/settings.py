"""User settings API endpoints."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from services.async_database import get_db
from services.auth_service import get_current_user_id
from models.measurements import UserSettings
from schemas.measurements import (
    UserSettingsUpdate,
    UserSettingsResponse
)

router = APIRouter(tags=["settings"])

async def get_or_create_settings(user_id: str, db: AsyncSession) -> UserSettings:
    """Get user settings or create default ones."""
    query = select(UserSettings).where(UserSettings.user_id == user_id)
    result = await db.execute(query)
    settings = result.scalar_one_or_none()
    
    if not settings:
        # Create default settings
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return settings

@router.get("", response_model=UserSettingsResponse)
async def get_user_settings(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get user settings."""
    # Handle demo user
    if user_id == "demo-user-001":
        import uuid
        from datetime import datetime
        now = datetime.utcnow()
        return UserSettingsResponse(
            id=str(uuid.uuid4()),
            user_id=user_id,
            notification_preferences={
                "workout_reminders": True,
                "daily_checkins": True,
                "weekly_reports": True
            },
            privacy_settings={
                "profile_visibility": "private",
                "share_progress": False
            },
            measurement_units={
                "weight": "kg",
                "height": "cm",
                "distance": "km"
            },
            language="en",
            timezone="UTC",
            theme="dark",
            created_at=now,
            updated_at=now
        )
    
    settings = await get_or_create_settings(user_id, db)
    return settings

@router.put("", response_model=UserSettingsResponse)
async def update_user_settings(
    settings_update: UserSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update user settings."""
    settings = await get_or_create_settings(user_id, db)
    
    # Update only provided fields
    update_data = settings_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    await db.commit()
    await db.refresh(settings)
    
    return settings

@router.put("/units", response_model=UserSettingsResponse)
async def update_unit_preferences(
    unit_system: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update unit system preference."""
    if unit_system not in ["metric", "imperial"]:
        raise HTTPException(status_code=400, detail="Invalid unit system. Must be 'metric' or 'imperial'")
    
    settings = await get_or_create_settings(user_id, db)
    settings.unit_system = unit_system
    
    await db.commit()
    await db.refresh(settings)
    
    return settings

@router.put("/notifications", response_model=UserSettingsResponse)
async def update_notification_preferences(
    notifications_enabled: bool,
    workout_reminder_time: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update notification preferences."""
    settings = await get_or_create_settings(user_id, db)
    settings.notifications_enabled = notifications_enabled
    
    if workout_reminder_time is not None:
        settings.workout_reminder_time = workout_reminder_time
    
    await db.commit()
    await db.refresh(settings)
    
    return settings

@router.put("/workout-preferences", response_model=UserSettingsResponse)
async def update_workout_preferences(
    rest_timer_duration: Optional[int] = None,
    auto_start_rest_timer: Optional[bool] = None,
    weight_increment: Optional[float] = None,
    default_workout_duration: Optional[int] = None,
    show_warmup_sets: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update workout-specific preferences."""
    settings = await get_or_create_settings(user_id, db)
    
    if rest_timer_duration is not None:
        settings.rest_timer_duration = rest_timer_duration
    if auto_start_rest_timer is not None:
        settings.auto_start_rest_timer = auto_start_rest_timer
    if weight_increment is not None:
        settings.weight_increment = weight_increment
    if default_workout_duration is not None:
        settings.default_workout_duration = default_workout_duration
    if show_warmup_sets is not None:
        settings.show_warmup_sets = show_warmup_sets
    
    await db.commit()
    await db.refresh(settings)
    
    return settings