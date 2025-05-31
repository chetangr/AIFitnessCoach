from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional

from models.user import User
from services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()

import httpx

async def fetch_exercises_from_wger(
    search: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
) -> dict:
    """Fetch exercises from WGER API"""
    base_url = "https://wger.de/api/v2/exercise/"
    params = {
        "limit": limit,
        "offset": offset,
        "language": 2,  # English
        "status": 2     # Accepted exercises only
    }
    
    if search:
        params["search"] = search
    
    async with httpx.AsyncClient() as client:
        response = await client.get(base_url, params=params)
        response.raise_for_status()
        return response.json()

def format_wger_exercise(exercise_data: dict) -> dict:
    """Format WGER exercise data to our format"""
    return {
        "id": str(exercise_data["id"]),
        "name": exercise_data["name"],
        "description": exercise_data.get("description", ""),
        "muscle_groups": [muscle["name"] for muscle in exercise_data.get("muscles", [])],
        "equipment_required": [eq["name"] for eq in exercise_data.get("equipment", [])],
        "difficulty": "intermediate",  # WGER doesn't provide difficulty
        "category": exercise_data.get("category", {}).get("name", "general"),
        "instructions": exercise_data.get("description", "").split(". ") if exercise_data.get("description") else []
    }

@router.get("/", response_model=dict)
async def get_exercises(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    muscle_group: Optional[str] = None,
    equipment: Optional[str] = None,
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get exercise library from WGER API with filters"""
    try:
        offset = (page - 1) * page_size
        
        # Fetch exercises from WGER API
        wger_data = await fetch_exercises_from_wger(
            search=search,
            limit=page_size,
            offset=offset
        )
        
        # Format exercises
        exercises = [format_wger_exercise(ex) for ex in wger_data["results"]]
        
        # Apply additional filters (WGER doesn't support all our filters)
        if muscle_group:
            exercises = [e for e in exercises if muscle_group.lower() in [mg.lower() for mg in e["muscle_groups"]]]
        
        if equipment:
            exercises = [e for e in exercises if equipment.lower() in [eq.lower() for eq in e["equipment_required"]]]
        
        if difficulty:
            exercises = [e for e in exercises if e["difficulty"] == difficulty]
        
        if category:
            exercises = [e for e in exercises if category.lower() in e["category"].lower()]
        
        return {
            "items": exercises,
            "total": wger_data["count"],
            "page": page,
            "page_size": page_size,
            "has_more": wger_data["next"] is not None
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch exercises: {str(e)}"
        )

@router.get("/categories", response_model=List[dict])
async def get_exercise_categories(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get available exercise categories"""
    return [
        {"id": "strength", "name": "Strength Training", "icon": "dumbbell"},
        {"id": "cardio", "name": "Cardio", "icon": "run"},
        {"id": "flexibility", "name": "Flexibility", "icon": "yoga"},
        {"id": "balance", "name": "Balance", "icon": "scale-balance"},
        {"id": "plyometric", "name": "Plyometric", "icon": "jump-rope"},
        {"id": "bodyweight", "name": "Bodyweight", "icon": "human"},
    ]

@router.get("/muscle-groups", response_model=List[str])
async def get_muscle_groups(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get available muscle groups"""
    return [
        "chest", "back", "shoulders", "biceps", "triceps",
        "core", "quads", "hamstrings", "glutes", "calves",
        "full_body"
    ]

@router.get("/equipment", response_model=List[dict])
async def get_equipment_list(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get available equipment types"""
    return [
        {"id": "none", "name": "No Equipment", "icon": "close-circle"},
        {"id": "dumbbells", "name": "Dumbbells", "icon": "dumbbell"},
        {"id": "barbell", "name": "Barbell", "icon": "weight"},
        {"id": "resistance_bands", "name": "Resistance Bands", "icon": "rubber-band"},
        {"id": "kettlebell", "name": "Kettlebell", "icon": "kettle"},
        {"id": "pull_up_bar", "name": "Pull-up Bar", "icon": "hanger"},
        {"id": "bench", "name": "Bench", "icon": "seat"},
        {"id": "cables", "name": "Cable Machine", "icon": "cable"},
    ]

@router.get("/{exercise_id}", response_model=dict)
async def get_exercise_details(
    exercise_id: str,
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get detailed exercise information from WGER API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://wger.de/api/v2/exercise/{exercise_id}/")
            response.raise_for_status()
            exercise_data = response.json()
        
        # Format the exercise
        exercise = format_wger_exercise(exercise_data)
        
        # Add additional WGER data if available
        if exercise_data.get("images"):
            exercise["image_url"] = exercise_data["images"][0]["image"]
        
        if exercise_data.get("videos"):
            exercise["video_url"] = exercise_data["videos"][0]["video"]
        
        # Get variations from WGER
        if exercise_data.get("variations"):
            exercise["variations"] = [
                {
                    "name": var["name"],
                    "difficulty": "intermediate",
                    "description": var.get("description", "")
                }
                for var in exercise_data["variations"]
            ]
        
        return exercise
        
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch exercise details: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch exercise details: {str(e)}"
        )