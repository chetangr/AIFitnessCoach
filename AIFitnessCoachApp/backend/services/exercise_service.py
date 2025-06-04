"""
Real Exercise Service for OpenAI Agent SDK Integration
Provides comprehensive exercise database with real data for fitness coaching agents.
"""

from typing import Dict, List, Any, Optional
from sqlalchemy import select, or_, and_
from ..models.workout import Exercise
from ..models.custom_content import WorkoutTemplate, TrainingProgram
from ..services.database import get_db
from ..utils.logger import logger


class ExerciseService:
    """Real exercise service with comprehensive exercise database"""
    
    def __init__(self):
        """Initialize exercise service"""
        self.muscle_groups = {
            'chest': ['pectoralis major', 'pectoralis minor'],
            'back': ['latissimus dorsi', 'rhomboids', 'middle trapezius', 'lower trapezius'],
            'shoulders': ['anterior deltoid', 'medial deltoid', 'posterior deltoid'],
            'arms': ['biceps brachii', 'triceps brachii', 'forearms'],
            'legs': ['quadriceps', 'hamstrings', 'glutes', 'calves'],
            'core': ['rectus abdominis', 'obliques', 'transverse abdominis'],
            'full_body': ['multiple muscle groups']
        }
        # Cache for exercises to avoid repeated DB calls
        self._exercises_cache = None
        self._cache_loaded = False
    
    def _load_exercises_from_db(self) -> Dict[str, Any]:
        """Load exercises from database into cache"""
        if self._cache_loaded and self._exercises_cache:
            return self._exercises_cache
        
        exercises_dict = {}
        try:
            db = next(get_db())
            result = db.query(Exercise).all()
            
            for exercise in result:
                # Convert exercise name to snake_case for ID
                exercise_id = exercise.name.lower().replace(' ', '_').replace('-', '_')
                exercises_dict[exercise_id] = {
                    "id": exercise.id,
                    "name": exercise.name,
                    "category": exercise.category,
                    "muscle_groups": exercise.target_muscles,
                    "equipment": [exercise.equipment] if exercise.equipment else ["none"],
                    "difficulty": exercise.difficulty,
                    "instructions": exercise.instructions,
                    "tips": exercise.tips,
                    "variations": exercise.variations,
                    "form_cues": exercise.tips,  # Using tips as form cues
                    "calories_per_minute": 8.5,  # Default value, can be enhanced
                    "reps_range": "8-15",  # Default, can be customized
                    "sets_range": "3-4",
                    "rest_time": "60-90 seconds"
                }
            
            self._exercises_cache = exercises_dict
            self._cache_loaded = True
            logger.info(f"Loaded {len(exercises_dict)} exercises from database")
            
        except Exception as e:
            logger.error(f"Error loading exercises from database: {e}")
            # Fallback to minimal hardcoded data if DB fails
            self._exercises_cache = self._get_fallback_exercises()
        finally:
            if db:
                db.close()
        
        return self._exercises_cache
    
    def _get_fallback_exercises(self) -> Dict[str, Any]:
        """Minimal fallback exercises if database is not available"""
        return {
            "push_ups": {
                "name": "Push-ups",
                "category": "strength",
                "muscle_groups": ["chest", "shoulders", "arms"],
                "equipment": ["none"],
                "difficulty": "beginner",
                "instructions": [
                    "Start in plank position",
                    "Lower body until chest nearly touches floor",
                    "Push back up to starting position"
                ],
                "tips": ["Keep core tight", "Maintain straight body line"],
                "variations": ["knee push-ups", "diamond push-ups"],
                "calories_per_minute": 8.5
            },
            "squats": {
                "name": "Squats",
                "category": "strength",
                "muscle_groups": ["legs", "glutes"],
                "equipment": ["none"],
                "difficulty": "beginner",
                "instructions": [
                    "Stand with feet shoulder-width apart",
                    "Lower body by bending knees and hips",
                    "Return to standing position"
                ],
                "tips": ["Keep knees aligned with toes", "Keep chest up"],
                "variations": ["jump squats", "goblet squats"],
                "calories_per_minute": 9.0
            }
        }
    
    def get_all_exercises(self) -> List[Dict[str, Any]]:
        """Get all exercises from database"""
        exercises = self._load_exercises_from_db()
        return [{"id": ex_id, **ex_data} for ex_id, ex_data in exercises.items()]
    
    def get_exercise_by_id(self, exercise_id: str) -> Optional[Dict[str, Any]]:
        """Get specific exercise by ID"""
        exercises = self._load_exercises_from_db()
        
        # Try direct lookup
        if exercise_id in exercises:
            return {"id": exercise_id, **exercises[exercise_id]}
        
        # Try to find by name
        for ex_id, ex_data in exercises.items():
            if ex_data.get("name", "").lower() == exercise_id.lower():
                return {"id": ex_id, **ex_data}
        
        return None
    
    def get_exercises_by_muscle_group(self, muscle_group: str) -> List[Dict[str, Any]]:
        """Get exercises for specific muscle group"""
        muscle_group = muscle_group.lower()
        exercises = self._load_exercises_from_db()
        results = []
        
        for ex_id, ex_data in exercises.items():
            muscle_groups = ex_data.get("muscle_groups", [])
            if any(muscle_group in mg.lower() for mg in muscle_groups):
                results.append({"id": ex_id, **ex_data})
        
        return results
    
    def get_exercises_by_equipment(self, equipment: str) -> List[Dict[str, Any]]:
        """Get exercises that use specific equipment"""
        equipment = equipment.lower()
        exercises = self._load_exercises_from_db()
        results = []
        
        for ex_id, ex_data in exercises.items():
            equipment_list = ex_data.get("equipment", [])
            if any(equipment in eq.lower() for eq in equipment_list):
                results.append({"id": ex_id, **ex_data})
        
        return results
    
    def get_exercises_by_difficulty(self, difficulty: str) -> List[Dict[str, Any]]:
        """Get exercises by difficulty level"""
        difficulty = difficulty.lower()
        exercises = self._load_exercises_from_db()
        
        return [
            {"id": ex_id, **ex_data}
            for ex_id, ex_data in exercises.items()
            if ex_data.get("difficulty", "").lower() == difficulty
        ]
    
    def search_exercises(self, query: str) -> List[Dict[str, Any]]:
        """Search exercises by name or muscle group"""
        query = query.lower()
        exercises = self._load_exercises_from_db()
        results = []
        
        for ex_id, ex_data in exercises.items():
            # Search in name
            if query in ex_data.get("name", "").lower():
                results.append({"id": ex_id, **ex_data})
                continue
            
            # Search in muscle groups
            muscle_groups = ex_data.get("muscle_groups", [])
            if any(query in mg.lower() for mg in muscle_groups):
                results.append({"id": ex_id, **ex_data})
                continue
            
            # Search in category
            if query in ex_data.get("category", "").lower():
                results.append({"id": ex_id, **ex_data})
        
        return results
    
    def get_exercise_alternatives(self, exercise_id: str, muscle_group: str = None) -> List[Dict[str, Any]]:
        """Get alternative exercises for given exercise"""
        base_exercise = self.get_exercise_by_id(exercise_id)
        if not base_exercise:
            return []
        
        target_muscle_groups = muscle_group if muscle_group else base_exercise.get("muscle_groups", [])
        if isinstance(target_muscle_groups, str):
            target_muscle_groups = [target_muscle_groups]
        
        exercises = self._load_exercises_from_db()
        alternatives = []
        
        for alt_id, alt_data in exercises.items():
            if alt_id == exercise_id:  # Skip the same exercise
                continue
            
            # Check if muscle groups overlap
            alt_muscle_groups = alt_data.get("muscle_groups", [])
            if any(mg in alt_muscle_groups for mg in target_muscle_groups):
                alternatives.append({"id": alt_id, **alt_data})
        
        return alternatives[:5]  # Return top 5 alternatives
    
    def get_workout_exercises(self, workout_type: str, difficulty: str = "intermediate") -> List[Dict[str, Any]]:
        """Get exercises for specific workout type"""
        exercises = self._load_exercises_from_db()
        
        # Define workout type to muscle group mapping
        workout_mapping = {
            "push": ["chest", "shoulders", "triceps"],
            "pull": ["back", "biceps"],
            "legs": ["legs", "glutes", "calves"],
            "upper": ["chest", "back", "shoulders", "arms"],
            "lower": ["legs", "glutes", "calves"],
            "full_body": ["full_body", "chest", "back", "legs"],
            "hiit": ["cardio", "full_body"],
            "core": ["core", "abs"],
            "cardio": ["cardio"]
        }
        
        target_muscles = workout_mapping.get(workout_type, ["full_body"])
        workout_exercises = []
        
        for ex_id, ex_data in exercises.items():
            muscle_groups = ex_data.get("muscle_groups", [])
            # Check if any target muscle is in exercise muscle groups
            if any(any(target in mg.lower() for mg in muscle_groups) for target in target_muscles):
                # Check difficulty if specified
                if difficulty == "any" or ex_data.get("difficulty", "").lower() == difficulty.lower():
                    workout_exercises.append({"id": ex_id, **ex_data})
        
        return workout_exercises
    
    def create_custom_workout(self, name: str, exercises: List[str], duration: int = 45) -> Dict[str, Any]:
        """Create a custom workout with selected exercises"""
        workout_exercises = []
        
        for exercise_id in exercises:
            exercise = self.get_exercise_by_id(exercise_id)
            if exercise:
                workout_exercises.append({
                    "exercise": exercise,
                    "sets": 3,
                    "reps": "10-12",
                    "rest": "60 seconds"
                })
        
        return {
            "name": name,
            "duration": duration,
            "exercises": workout_exercises,
            "total_exercises": len(workout_exercises),
            "difficulty": "custom"
        }
    
    def refresh_cache(self):
        """Force refresh the exercise cache from database"""
        self._cache_loaded = False
        self._exercises_cache = None
        self._load_exercises_from_db()
        logger.info("Exercise cache refreshed")
    
    def get_programs_from_db(self) -> List[Dict[str, Any]]:
        """Get training programs from database"""
        programs = []
        try:
            db = next(get_db())
            result = db.query(TrainingProgram).filter(TrainingProgram.is_public == True).all()
            
            for program in result:
                programs.append({
                    "id": program.id,
                    "name": program.name,
                    "description": program.description,
                    "difficulty_level": program.difficulty_level,
                    "duration_weeks": program.duration_weeks,
                    "category": program.category,
                    "workouts_per_week": program.workouts_per_week,
                    "equipment_needed": program.equipment_needed,
                    "target_goals": program.target_goals
                })
            
            logger.info(f"Loaded {len(programs)} training programs from database")
            
        except Exception as e:
            logger.error(f"Error loading programs from database: {e}")
        finally:
            if db:
                db.close()
        
        return programs
    
    def get_workout_templates_from_db(self) -> List[Dict[str, Any]]:
        """Get workout templates from database"""
        templates = []
        try:
            db = next(get_db())
            result = db.query(WorkoutTemplate).filter(WorkoutTemplate.is_public == True).all()
            
            for template in result:
                templates.append({
                    "id": template.id,
                    "name": template.name,
                    "description": template.description,
                    "category": template.category,
                    "difficulty_level": template.difficulty_level,
                    "duration_minutes": template.duration_minutes,
                    "equipment_needed": template.equipment_needed,
                    "exercises": template.exercises
                })
            
            logger.info(f"Loaded {len(templates)} workout templates from database")
            
        except Exception as e:
            logger.error(f"Error loading workout templates from database: {e}")
        finally:
            if db:
                db.close()
        
        return templates