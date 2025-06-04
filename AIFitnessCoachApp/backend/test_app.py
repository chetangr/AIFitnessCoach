"""
Minimal test app to verify backend services work
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Test essential services
from services.workout_service import WorkoutService  
from services.exercise_service import ExerciseService
from utils.logger import setup_logger

# Load environment variables
load_dotenv()

# Setup logger
logger = setup_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Fitness Coach API - Test",
    description="Test backend for AI-powered fitness coaching app",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services for testing
workout_service = WorkoutService()
exercise_service = ExerciseService()

@app.get("/")
async def root():
    return {"message": "AI Fitness Coach Backend - Real Services Test"}

@app.get("/test/services")
async def test_services():
    """Test that all services are working"""
    try:
        # Test workout service
        timeline = workout_service.get_workout_timeline("demo-user")
        
        # Test exercise service  
        exercises = exercise_service.get_exercises()
        push_exercises = exercise_service.get_exercises_by_category("strength")
        
        return {
            "status": "success",
            "workout_service": {
                "timeline_days": len(timeline.get("weekly_schedule", {})),
                "total_workouts": timeline.get("total_workouts", 0)
            },
            "exercise_service": {
                "total_exercises": len(exercises),
                "strength_exercises": len(push_exercises),
                "exercise_stats": exercise_service.get_exercise_statistics()
            }
        }
    except Exception as e:
        logger.error(f"Service test failed: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/test/workout-timeline")
async def test_workout_timeline():
    """Test workout timeline data for agent context"""
    timeline = workout_service.get_workout_timeline("demo-user")
    return timeline

@app.get("/test/exercises/{category}")
async def test_exercises_by_category(category: str):
    """Test exercise filtering by category"""
    exercises = exercise_service.get_exercises_by_category(category)
    return {
        "category": category,
        "count": len(exercises),
        "exercises": exercises[:3]  # Return first 3 for brevity
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting AI Fitness Coach Backend Test Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")