"""
User Service for managing user data and preferences
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from models.user import User
from services.async_database import get_db
from utils.logger import setup_logger

logger = setup_logger(__name__)

class UserService:
    """Service for managing user data"""
    
    def __init__(self):
        self.db = None
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            db = next(get_db())
            user = db.query(User).filter(User.id == user_id).first()
            
            if user:
                return {
                    "id": str(user.id),
                    "username": user.username,
                    "email": user.email,
                    "fitness_level": user.fitness_level.value if user.fitness_level else "beginner",
                    "goals": user.goals or [],
                    "current_weight": user.current_weight,
                    "target_weight": user.target_weight,
                    "height": user.height,
                    "age": user.age,
                    "diet_preference": user.diet_preference,
                    "training_equipment": user.training_equipment or [],
                    "preferred_coach_id": user.preferred_coach_id
                }
            return None
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
        finally:
            if db:
                db.close()
    
    async def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences"""
        user = await self.get_user(user_id)
        if user:
            return {
                "diet_preference": user.get("diet_preference"),
                "training_equipment": user.get("training_equipment", []),
                "fitness_level": user.get("fitness_level", "beginner"),
                "goals": user.get("goals", [])
            }
        return {
            "diet_preference": None,
            "training_equipment": [],
            "fitness_level": "beginner",
            "goals": []
        }
    
    async def get_user_metrics(self, user_id: str) -> Dict[str, Any]:
        """Get user physical metrics"""
        user = await self.get_user(user_id)
        if user:
            return {
                "weight_kg": user.get("current_weight"),
                "height_cm": user.get("height"),
                "age": user.get("age"),
                "target_weight_kg": user.get("target_weight")
            }
        return {
            "weight_kg": None,
            "height_cm": None,
            "age": None,
            "target_weight_kg": None
        }