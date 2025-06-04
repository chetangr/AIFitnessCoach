"""
Real Workout Service for OpenAI Agent SDK
Handles workout timeline data and fitness action integration
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from dataclasses import dataclass

@dataclass
class WorkoutSession:
    id: str
    user_id: str
    workout_id: str
    date: datetime
    duration_minutes: int
    exercises_completed: List[Dict[str, Any]]
    notes: Optional[str] = None
    completed: bool = False

class WorkoutService:
    """
    Real workout service that integrates with OpenAI Agent SDK
    Provides workout timeline data and handles fitness actions
    """
    
    def __init__(self):
        self.logger = self._setup_logger()
        # In a real implementation, this would connect to a database
        self._workouts_cache = {}
        self._user_schedules = {}
    
    def _setup_logger(self):
        import logging
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.INFO)
        return logger
    
    def get_workout_timeline(self, user_id: str = "demo-user") -> Dict[str, Any]:
        """
        Get current workout timeline for agent context
        This is used by the fitness action agent for workout modifications
        """
        try:
            current_date = datetime.now()
            week_start = current_date - timedelta(days=current_date.weekday())
            
            # Generate realistic workout timeline
            timeline = {
                "user_id": user_id,
                "current_week_start": week_start.isoformat(),
                "current_date": current_date.isoformat(),
                "workouts": self._generate_week_workouts(week_start),
                "total_workouts_this_week": 0,
                "completed_workouts": 0,
                "upcoming_workouts": 0,
                "rest_days": []
            }
            
            # Calculate stats - handle workouts as a list or dict
            workouts = timeline["workouts"]
            if isinstance(workouts, dict):
                # Original dict format
                for day, workout in workouts.items():
                    if workout["type"] != "rest":
                        timeline["total_workouts_this_week"] += 1
                        if workout["completed"]:
                            timeline["completed_workouts"] += 1
                        elif datetime.fromisoformat(workout["date"]) > current_date:
                            timeline["upcoming_workouts"] += 1
                    else:
                        timeline["rest_days"].append(day)
            elif isinstance(workouts, list):
                # List format from fitness_action_agent
                for workout in workouts:
                    if workout.get("title"):  # Has a workout title (not a rest day)
                        timeline["total_workouts_this_week"] += 1
                        if workout.get("completed"):
                            timeline["completed_workouts"] += 1
                        elif datetime.fromisoformat(workout["date"]) > current_date:
                            timeline["upcoming_workouts"] += 1
                    else:
                        timeline["rest_days"].append(workout.get("day", "Unknown"))
            
            self.logger.info(f"Generated workout timeline for user {user_id}: {timeline['total_workouts_this_week']} workouts this week")
            return timeline
            
        except Exception as e:
            self.logger.error(f"Error generating workout timeline: {e}")
            return {
                "user_id": user_id,
                "error": "Unable to fetch workout timeline",
                "current_date": datetime.now().isoformat()
            }
    
    def _generate_week_workouts(self, week_start: datetime) -> Dict[str, Dict[str, Any]]:
        """Generate a realistic week of workouts"""
        workouts = {}
        
        workout_templates = [
            {
                "title": "Push Day - Chest & Triceps",
                "type": "strength",
                "duration": 75,
                "difficulty": "intermediate",
                "exercises": [
                    {"name": "Bench Press", "sets": 4, "reps": "8-10", "muscle_groups": ["chest", "triceps"]},
                    {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "muscle_groups": ["chest"]},
                    {"name": "Dips", "sets": 3, "reps": "10-15", "muscle_groups": ["triceps", "chest"]},
                    {"name": "Overhead Press", "sets": 4, "reps": "8-10", "muscle_groups": ["shoulders", "triceps"]}
                ],
                "calories": 420
            },
            {
                "title": "Pull Day - Back & Biceps", 
                "type": "strength",
                "duration": 70,
                "difficulty": "intermediate",
                "exercises": [
                    {"name": "Deadlifts", "sets": 4, "reps": "6-8", "muscle_groups": ["back", "hamstrings"]},
                    {"name": "Pull-ups", "sets": 3, "reps": "8-12", "muscle_groups": ["back", "biceps"]},
                    {"name": "Barbell Rows", "sets": 4, "reps": "8-10", "muscle_groups": ["back"]},
                    {"name": "Bicep Curls", "sets": 3, "reps": "12-15", "muscle_groups": ["biceps"]}
                ],
                "calories": 390
            },
            {
                "title": "Leg Day - Quads & Glutes",
                "type": "strength", 
                "duration": 80,
                "difficulty": "advanced",
                "exercises": [
                    {"name": "Squats", "sets": 4, "reps": "8-10", "muscle_groups": ["quads", "glutes"]},
                    {"name": "Romanian Deadlifts", "sets": 3, "reps": "10-12", "muscle_groups": ["hamstrings", "glutes"]},
                    {"name": "Leg Press", "sets": 4, "reps": "12-15", "muscle_groups": ["quads"]},
                    {"name": "Calf Raises", "sets": 4, "reps": "15-20", "muscle_groups": ["calves"]}
                ],
                "calories": 450
            },
            {
                "title": "HIIT Cardio",
                "type": "hiit",
                "duration": 30,
                "difficulty": "intermediate", 
                "exercises": [
                    {"name": "Burpees", "sets": 4, "reps": "30s work, 15s rest", "muscle_groups": ["full_body"]},
                    {"name": "Mountain Climbers", "sets": 4, "reps": "30s work, 15s rest", "muscle_groups": ["core", "cardio"]},
                    {"name": "Jump Squats", "sets": 4, "reps": "30s work, 15s rest", "muscle_groups": ["legs", "cardio"]}
                ],
                "calories": 350
            }
        ]
        
        # Assign workouts to days (Monday, Wednesday, Friday = workouts, others = rest)
        workout_days = [0, 2, 4]  # Monday, Wednesday, Friday
        template_index = 0
        
        for i in range(7):  # 7 days of the week
            day_date = week_start + timedelta(days=i)
            day_name = day_date.strftime('%A')
            
            if i in workout_days and template_index < len(workout_templates):
                workout = workout_templates[template_index].copy()
                workout.update({
                    "id": f"workout_{day_date.strftime('%Y%m%d')}",
                    "date": day_date.isoformat(),
                    "day": day_name,
                    "completed": day_date < datetime.now() - timedelta(hours=12),  # Past workouts are completed
                    "scheduled_time": "09:00"
                })
                workouts[day_name.lower()] = workout
                template_index += 1
            else:
                # Rest day
                workouts[day_name.lower()] = {
                    "id": f"rest_{day_date.strftime('%Y%m%d')}",
                    "title": "Rest Day",
                    "type": "rest",
                    "date": day_date.isoformat(),
                    "day": day_name,
                    "duration": 0,
                    "completed": True,
                    "description": "Active recovery and rest"
                }
        
        return workouts
    
    def get_user_workouts(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all workouts for a specific user"""
        timeline = self.get_workout_timeline(user_id)
        workouts = []
        
        timeline_workouts = timeline.get("workouts", {})
        
        if isinstance(timeline_workouts, dict):
            # Original dict format
            for day, workout_data in timeline_workouts.items():
                if workout_data["type"] != "rest":
                    workout = {
                        "id": workout_data["id"],
                        "title": workout_data["title"],
                        "description": f"Scheduled for {workout_data['day']}",
                        "duration_minutes": workout_data["duration"],
                        "difficulty": workout_data["difficulty"],
                        "workout_type": workout_data["type"],
                        "exercises": [],  # Would be populated from exercise service
                        "calories_burned": workout_data["calories"],
                        "created_at": datetime.now().isoformat(),
                        "user_id": user_id
                    }
                    workouts.append(workout)
        elif isinstance(timeline_workouts, list):
            # List format from fitness_action_agent
            for workout_data in timeline_workouts:
                if workout_data.get("title"):  # Has a workout title (not a rest day)
                    workout = {
                        "id": workout_data.get("id", f"workout_{workout_data.get('date', '')}"),
                        "title": workout_data["title"],
                        "description": f"Scheduled for {workout_data.get('day', 'Unknown')}",
                        "duration_minutes": workout_data.get("duration", 60),
                        "difficulty": workout_data.get("difficulty", "intermediate"),
                        "workout_type": workout_data.get("type", "strength"),
                        "exercises": workout_data.get("exercises", []),
                        "calories_burned": workout_data.get("calories", 0),
                        "created_at": datetime.now().isoformat(),
                        "user_id": user_id
                    }
                    workouts.append(workout)
        
        return workouts
    
    def create_workout(self, workout_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new workout"""
        workout_id = f"workout_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        workout = {
            "id": workout_id,
            "status": "created",
            "created_at": datetime.now().isoformat(),
            **workout_data
        }
        
        self.logger.info(f"Created new workout: {workout_id}")
        return workout
    
    def modify_workout(self, workout_id: str, modifications: Dict[str, Any]) -> Dict[str, Any]:
        """
        Modify an existing workout - used by fitness action agent
        """
        try:
            self.logger.info(f"Modifying workout {workout_id} with: {modifications}")
            
            # In a real implementation, this would update the database
            result = {
                "workout_id": workout_id,
                "modifications_applied": modifications,
                "status": "modified",
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error modifying workout {workout_id}: {e}")
            return {"error": f"Failed to modify workout: {str(e)}"}
    
    def reschedule_workout(self, workout_id: str, new_date: str) -> Dict[str, Any]:
        """
        Reschedule a workout to a different date - used by fitness action agent
        """
        try:
            self.logger.info(f"Rescheduling workout {workout_id} to {new_date}")
            
            result = {
                "workout_id": workout_id,
                "old_date": "previous_date",  # Would be fetched from database
                "new_date": new_date,
                "status": "rescheduled",
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error rescheduling workout {workout_id}: {e}")
            return {"error": f"Failed to reschedule workout: {str(e)}"}
    
    def get_workout_for_date(self, user_id: str, date_str: str) -> Dict[str, Any]:
        """Get workout for a specific date"""
        try:
            target_date = datetime.fromisoformat(date_str).date()
            # For demo, generate a workout based on the day of week
            day_of_week = target_date.weekday()  # 0 = Monday, 6 = Sunday
            
            workout_map = {
                0: {"type": "push", "name": "Push Day - Chest & Triceps"},
                1: {"type": "pull", "name": "Pull Day - Back & Biceps"},
                2: {"type": "legs", "name": "Leg Day - Quads & Glutes"},
                3: {"type": "cardio", "name": "Active Recovery - Cardio"},
                4: {"type": "push", "name": "Push Day - Shoulders & Abs"},
                5: {"type": "full_body", "name": "Full Body HIIT"},
                6: {"type": "rest", "name": "Rest Day"}
            }
            
            workout_info = workout_map.get(day_of_week, {"type": "rest", "name": "Rest Day"})
            
            if workout_info["type"] == "rest":
                return {
                    "date": date_str,
                    "type": "rest",
                    "name": "Rest Day",
                    "description": "Recovery day - light stretching recommended"
                }
            
            # Generate a full workout
            return {
                "date": date_str,
                "type": workout_info["type"],
                "name": workout_info["name"],
                "duration": 60,
                "exercises": self._get_exercises_for_type(workout_info["type"]),
                "completed": False
            }
            
        except Exception as e:
            self.logger.error(f"Error getting workout for date: {e}")
            return {"error": str(e)}
    
    def get_workouts_range(self, user_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Get workouts for a date range"""
        try:
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
            workouts = []
            
            current = start
            while current <= end:
                workout = self.get_workout_for_date(user_id, current.isoformat())
                workouts.append(workout)
                current += timedelta(days=1)
            
            return workouts
            
        except Exception as e:
            self.logger.error(f"Error getting workouts range: {e}")
            return []
    
    def _get_exercises_for_type(self, workout_type: str) -> List[Dict[str, Any]]:
        """Get exercises based on workout type"""
        exercise_map = {
            "push": [
                {"name": "Bench Press", "sets": 4, "reps": "8-10"},
                {"name": "Shoulder Press", "sets": 3, "reps": "10-12"},
                {"name": "Tricep Dips", "sets": 3, "reps": "10-15"}
            ],
            "pull": [
                {"name": "Deadlifts", "sets": 4, "reps": "6-8"},
                {"name": "Pull-ups", "sets": 3, "reps": "8-12"},
                {"name": "Barbell Rows", "sets": 3, "reps": "10-12"}
            ],
            "legs": [
                {"name": "Squats", "sets": 4, "reps": "8-10"},
                {"name": "Leg Press", "sets": 3, "reps": "12-15"},
                {"name": "Lunges", "sets": 3, "reps": "10 each leg"}
            ],
            "cardio": [
                {"name": "Treadmill Run", "duration": "20 minutes"},
                {"name": "Bike Intervals", "duration": "15 minutes"},
                {"name": "Row Machine", "duration": "10 minutes"}
            ],
            "full_body": [
                {"name": "Burpees", "sets": 4, "reps": "10"},
                {"name": "Mountain Climbers", "sets": 3, "reps": "20"},
                {"name": "Kettlebell Swings", "sets": 3, "reps": "15"}
            ]
        }
        
        return exercise_map.get(workout_type, [])