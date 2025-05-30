from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from models.user import User
from services.database import get_db
from services.auth_service import AuthService
from schemas.auth import UserResponse
from schemas.user import UserUpdate, UserPreferencesUpdate

router = APIRouter()
auth_service = AuthService()

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get current user profile"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        display_name=current_user.display_name,
        fitness_level=current_user.fitness_level,
        onboarding_completed=current_user.onboarding_completed,
        preferred_coach_id=current_user.preferred_coach_id,
        goals=current_user.goals or [],
        current_weight=current_user.current_weight,
        target_weight=current_user.target_weight,
        height=current_user.height
    )

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    updates: UserUpdate,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    # Update allowed fields
    if updates.first_name is not None:
        current_user.first_name = updates.first_name
    if updates.last_name is not None:
        current_user.last_name = updates.last_name
    if updates.display_name is not None:
        current_user.display_name = updates.display_name
    if updates.age is not None:
        current_user.age = updates.age
    if updates.current_weight is not None:
        current_user.current_weight = updates.current_weight
    if updates.target_weight is not None:
        current_user.target_weight = updates.target_weight
    if updates.height is not None:
        current_user.height = updates.height
    
    # Update display name if first/last name changed
    if updates.first_name or updates.last_name:
        current_user.display_name = f"{current_user.first_name} {current_user.last_name}".strip()
    
    await db.commit()
    await db.refresh(current_user)
    
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        display_name=current_user.display_name,
        fitness_level=current_user.fitness_level,
        onboarding_completed=current_user.onboarding_completed,
        preferred_coach_id=current_user.preferred_coach_id,
        goals=current_user.goals or [],
        current_weight=current_user.current_weight,
        target_weight=current_user.target_weight,
        height=current_user.height
    )

@router.put("/preferences", response_model=dict)
async def update_user_preferences(
    preferences: UserPreferencesUpdate,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user preferences"""
    if preferences.fitness_level is not None:
        current_user.fitness_level = preferences.fitness_level
    if preferences.goals is not None:
        current_user.goals = preferences.goals
    if preferences.preferred_coach_id is not None:
        current_user.preferred_coach_id = preferences.preferred_coach_id
    if preferences.training_equipment is not None:
        current_user.training_equipment = preferences.training_equipment
    if preferences.diet_preference is not None:
        current_user.diet_preference = preferences.diet_preference
    if preferences.mindset_activities is not None:
        current_user.mindset_activities = preferences.mindset_activities
    
    await db.commit()
    
    return {"message": "Preferences updated successfully"}

@router.post("/onboarding/complete", response_model=dict)
async def complete_onboarding(
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark onboarding as completed"""
    current_user.onboarding_completed = True
    await db.commit()
    
    return {"message": "Onboarding completed successfully"}

@router.get("/stats", response_model=dict)
async def get_user_stats(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get user statistics"""
    return {
        "total_workouts_completed": current_user.total_workouts_completed,
        "current_streak": current_user.current_streak,
        "total_calories_burned": current_user.total_calories_burned,
        "total_minutes_trained": current_user.total_minutes_trained,
        "member_since": current_user.created_at.isoformat()
    }