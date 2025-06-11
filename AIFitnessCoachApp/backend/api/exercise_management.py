"""
Exercise Management API Endpoints
Handles exercise swapping, superset creation, and workout modifications
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

from services.auth_service import auth_service
from services.workout_service import WorkoutService
from services.exercise_service import ExerciseService
from utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()
security = HTTPBearer()

# Pydantic models
class ExerciseUpdate(BaseModel):
    id: str
    name: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[str] = None
    rest: Optional[int] = None
    weight: Optional[str] = None
    duration: Optional[str] = None
    supersetWith: Optional[str] = None
    isSuperset: Optional[bool] = None

class ExerciseSwap(BaseModel):
    workout_id: str
    exercise_id: str
    new_exercise_id: str
    maintain_sets_reps: bool = True

class SupersetCreate(BaseModel):
    workout_id: str
    exercise_id_1: str
    exercise_id_2: str

class ExerciseAdd(BaseModel):
    workout_id: str
    exercise_id: str
    position: Optional[int] = None  # Position in the workout, defaults to end
    sets: int = 3
    reps: str = "10-12"
    rest: int = 60

class WorkoutUpdate(BaseModel):
    exercises: List[ExerciseUpdate]
    duration: Optional[str] = None
    calories: Optional[int] = None

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user_id"""
    try:
        token = credentials.credentials
        payload = auth_service.decode_token(token)
        return payload.get('sub', 'demo-user')
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

@router.put("/workouts/{workout_id}/exercises")
async def update_workout_exercises(
    workout_id: str,
    workout_update: WorkoutUpdate,
    user_id: str = Depends(verify_token)
):
    """
    Update exercises in a workout (order, sets, reps, rest, etc.)
    """
    try:
        workout_service = WorkoutService()
        
        # Verify user owns this workout
        workout = await workout_service.get_workout_by_id(user_id, workout_id)
        if not workout:
            raise HTTPException(status_code=404, detail="Workout not found")
        
        # Update the workout
        updated_workout = await workout_service.update_workout_exercises(
            user_id=user_id,
            workout_id=workout_id,
            exercises=workout_update.exercises,
            duration=workout_update.duration,
            calories=workout_update.calories
        )
        
        logger.info(f"Updated exercises for workout {workout_id}")
        
        return {
            "status": "success",
            "message": "Workout exercises updated",
            "workout": updated_workout
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating workout exercises: {e}")
        raise HTTPException(status_code=500, detail="Failed to update workout exercises")

@router.post("/workouts/{workout_id}/exercises/swap")
async def swap_exercise(
    workout_id: str,
    swap_request: ExerciseSwap,
    user_id: str = Depends(verify_token)
):
    """
    Swap one exercise for another in a workout
    """
    try:
        workout_service = WorkoutService()
        exercise_service = ExerciseService()
        
        # Get the new exercise details
        new_exercise = await exercise_service.get_exercise_by_id(swap_request.new_exercise_id)
        if not new_exercise:
            raise HTTPException(status_code=404, detail="New exercise not found")
        
        # Perform the swap
        updated_workout = await workout_service.swap_exercise(
            user_id=user_id,
            workout_id=workout_id,
            old_exercise_id=swap_request.exercise_id,
            new_exercise=new_exercise,
            maintain_sets_reps=swap_request.maintain_sets_reps
        )
        
        logger.info(f"Swapped exercise in workout {workout_id}")
        
        return {
            "status": "success",
            "message": f"Exercise swapped successfully",
            "workout": updated_workout
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error swapping exercise: {e}")
        raise HTTPException(status_code=500, detail="Failed to swap exercise")

@router.post("/workouts/{workout_id}/exercises/add")
async def add_exercise_to_workout(
    workout_id: str,
    add_request: ExerciseAdd,
    user_id: str = Depends(verify_token)
):
    """
    Add an exercise to a workout
    """
    try:
        workout_service = WorkoutService()
        exercise_service = ExerciseService()
        
        # Get the exercise details
        exercise = await exercise_service.get_exercise_by_id(add_request.exercise_id)
        if not exercise:
            raise HTTPException(status_code=404, detail="Exercise not found")
        
        # Add the exercise
        updated_workout = await workout_service.add_exercise_to_workout(
            user_id=user_id,
            workout_id=workout_id,
            exercise=exercise,
            position=add_request.position,
            sets=add_request.sets,
            reps=add_request.reps,
            rest=add_request.rest
        )
        
        logger.info(f"Added exercise to workout {workout_id}")
        
        return {
            "status": "success",
            "message": f"Exercise added successfully",
            "workout": updated_workout
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding exercise: {e}")
        raise HTTPException(status_code=500, detail="Failed to add exercise")

@router.delete("/workouts/{workout_id}/exercises/{exercise_id}")
async def remove_exercise_from_workout(
    workout_id: str,
    exercise_id: str,
    user_id: str = Depends(verify_token)
):
    """
    Remove an exercise from a workout
    """
    try:
        workout_service = WorkoutService()
        
        # Remove the exercise
        updated_workout = await workout_service.remove_exercise_from_workout(
            user_id=user_id,
            workout_id=workout_id,
            exercise_id=exercise_id
        )
        
        logger.info(f"Removed exercise from workout {workout_id}")
        
        return {
            "status": "success",
            "message": "Exercise removed successfully",
            "workout": updated_workout
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing exercise: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove exercise")

@router.post("/workouts/{workout_id}/exercises/superset")
async def create_superset(
    workout_id: str,
    superset_request: SupersetCreate,
    user_id: str = Depends(verify_token)
):
    """
    Create a superset between two exercises
    """
    try:
        workout_service = WorkoutService()
        
        # Create the superset
        updated_workout = await workout_service.create_superset(
            user_id=user_id,
            workout_id=workout_id,
            exercise_id_1=superset_request.exercise_id_1,
            exercise_id_2=superset_request.exercise_id_2
        )
        
        logger.info(f"Created superset in workout {workout_id}")
        
        return {
            "status": "success",
            "message": "Superset created successfully",
            "workout": updated_workout
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating superset: {e}")
        raise HTTPException(status_code=500, detail="Failed to create superset")

@router.delete("/workouts/{workout_id}/exercises/superset/{superset_id}")
async def remove_superset(
    workout_id: str,
    superset_id: str,
    user_id: str = Depends(verify_token)
):
    """
    Remove a superset (unlink exercises)
    """
    try:
        workout_service = WorkoutService()
        
        # Remove the superset
        updated_workout = await workout_service.remove_superset(
            user_id=user_id,
            workout_id=workout_id,
            superset_id=superset_id
        )
        
        logger.info(f"Removed superset from workout {workout_id}")
        
        return {
            "status": "success",
            "message": "Superset removed successfully",
            "workout": updated_workout
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing superset: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove superset")

@router.put("/workouts/{workout_id}/exercises/{exercise_id}/rest")
async def update_exercise_rest(
    workout_id: str,
    exercise_id: str,
    rest_seconds: int = Body(..., description="Rest time in seconds"),
    user_id: str = Depends(verify_token)
):
    """
    Update rest time for a specific exercise
    """
    try:
        workout_service = WorkoutService()
        
        # Update rest time
        updated_workout = await workout_service.update_exercise_rest(
            user_id=user_id,
            workout_id=workout_id,
            exercise_id=exercise_id,
            rest_seconds=rest_seconds
        )
        
        logger.info(f"Updated rest time for exercise in workout {workout_id}")
        
        return {
            "status": "success",
            "message": f"Rest time updated to {rest_seconds} seconds",
            "workout": updated_workout
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating rest time: {e}")
        raise HTTPException(status_code=500, detail="Failed to update rest time")

@router.get("/exercises/alternatives/{exercise_id}")
async def get_exercise_alternatives(
    exercise_id: str,
    muscle_group: Optional[str] = None,
    equipment: Optional[str] = None,
    limit: int = 10,
    user_id: str = Depends(verify_token)
):
    """
    Get alternative exercises for a given exercise
    """
    try:
        exercise_service = ExerciseService()
        
        # Get the original exercise
        original_exercise = await exercise_service.get_exercise_by_id(exercise_id)
        if not original_exercise:
            raise HTTPException(status_code=404, detail="Exercise not found")
        
        # Find alternatives
        alternatives = await exercise_service.find_alternatives(
            exercise=original_exercise,
            target_muscle_group=muscle_group,
            equipment_filter=equipment,
            limit=limit
        )
        
        return {
            "original_exercise": original_exercise,
            "alternatives": alternatives,
            "count": len(alternatives)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting exercise alternatives: {e}")
        raise HTTPException(status_code=500, detail="Failed to get alternatives")