from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional

from models.user import User
from services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()

# Mock exercise data for MVP
MOCK_EXERCISES = [
    {
        "id": "1",
        "name": "Push-ups",
        "description": "Classic bodyweight exercise for chest, shoulders, and triceps",
        "muscle_groups": ["chest", "shoulders", "triceps"],
        "equipment_required": ["none"],
        "difficulty": "beginner",
        "category": "bodyweight",
        "instructions": [
            "Start in a plank position with hands shoulder-width apart",
            "Lower your body until chest nearly touches the floor",
            "Push back up to starting position",
            "Keep core engaged throughout"
        ]
    },
    {
        "id": "2",
        "name": "Squats",
        "description": "Fundamental lower body exercise",
        "muscle_groups": ["quads", "glutes", "hamstrings"],
        "equipment_required": ["none"],
        "difficulty": "beginner",
        "category": "bodyweight",
        "instructions": [
            "Stand with feet shoulder-width apart",
            "Lower hips back and down as if sitting in a chair",
            "Keep chest up and knees behind toes",
            "Drive through heels to return to standing"
        ]
    },
    {
        "id": "3",
        "name": "Dumbbell Bench Press",
        "description": "Chest exercise using dumbbells",
        "muscle_groups": ["chest", "shoulders", "triceps"],
        "equipment_required": ["dumbbells", "bench"],
        "difficulty": "intermediate",
        "category": "strength",
        "instructions": [
            "Lie on bench with dumbbells at chest level",
            "Press weights up until arms are extended",
            "Lower weights with control",
            "Keep core engaged"
        ]
    },
    # Add more exercises as needed
]

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
    """Get exercise library with filters"""
    exercises = MOCK_EXERCISES.copy()
    
    # Apply filters
    if search:
        search_lower = search.lower()
        exercises = [e for e in exercises if search_lower in e["name"].lower() or search_lower in e["description"].lower()]
    
    if muscle_group:
        exercises = [e for e in exercises if muscle_group in e["muscle_groups"]]
    
    if equipment:
        exercises = [e for e in exercises if equipment in e["equipment_required"]]
    
    if difficulty:
        exercises = [e for e in exercises if e["difficulty"] == difficulty]
    
    if category:
        exercises = [e for e in exercises if e["category"] == category]
    
    # Pagination
    total = len(exercises)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_exercises = exercises[start:end]
    
    return {
        "items": paginated_exercises,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_more": end < total
    }

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
    """Get detailed exercise information"""
    exercise = next((e for e in MOCK_EXERCISES if e["id"] == exercise_id), None)
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    # Add additional details
    exercise["video_url"] = f"https://example.com/videos/{exercise_id}.mp4"
    exercise["image_url"] = f"https://example.com/images/{exercise_id}.jpg"
    exercise["safety_notes"] = ["Keep proper form", "Don't rush the movement"]
    exercise["variations"] = [
        {
            "name": f"Modified {exercise['name']}",
            "difficulty": "beginner",
            "description": "Easier variation for beginners"
        }
    ]
    
    return exercise