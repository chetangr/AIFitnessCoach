"""
Workout Suggestion Service
Intelligently suggests workouts based on user stats, history, and current schedule
"""
from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json

from services.database import get_db
from services.workout_service import WorkoutService
from services.user_service import UserService
from utils.logger import setup_logger

logger = setup_logger(__name__)

class WorkoutPriority(Enum):
    RECOVERY = "recovery"
    MAINTENANCE = "maintenance"
    PROGRESSIVE = "progressive"
    DELOAD = "deload"

class MuscleGroup(Enum):
    CHEST = "chest"
    BACK = "back"
    SHOULDERS = "shoulders"
    ARMS = "arms"
    LEGS = "legs"
    CORE = "core"
    CARDIO = "cardio"
    FULL_BODY = "full_body"

@dataclass
class WorkoutSuggestion:
    id: str
    title: str
    description: str
    workout_type: str
    duration_minutes: int
    difficulty: str
    muscle_groups: List[str]
    exercises: List[Dict[str, Any]]
    rationale: str
    priority: int
    can_replace_date: Optional[date] = None
    suggested_date: Optional[date] = None

class WorkoutSuggestionService:
    """
    Service for generating intelligent workout suggestions based on user data
    """
    
    def __init__(self):
        self.workout_service = WorkoutService()
        self.user_service = UserService()
        
    def get_suggestions_for_user(
        self, 
        user_id: str,
        days_ahead: int = 7,
        include_rationale: bool = True
    ) -> Dict[str, Any]:
        """
        Get workout suggestions based on user's current stats and schedule
        """
        try:
            # Get user data
            user_data = self._get_user_stats(user_id)
            current_schedule = self._get_current_schedule(user_id, days_ahead)
            workout_history = self._get_workout_history(user_id, days=30)
            
            # Analyze current state
            analysis = self._analyze_user_state(user_data, workout_history, current_schedule)
            
            # Generate suggestions
            suggestions = self._generate_suggestions(
                user_data, 
                analysis, 
                current_schedule,
                include_rationale
            )
            
            return {
                "user_id": user_id,
                "analysis": analysis,
                "suggestions": suggestions,
                "current_schedule": current_schedule,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating workout suggestions: {e}")
            return {
                "user_id": user_id,
                "error": str(e),
                "suggestions": []
            }
    
    def _get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user stats including fitness level, goals, and progress"""
        db = next(get_db())
        try:
            # Get user profile
            user = db.execute(
                "SELECT * FROM users WHERE id = ?", (user_id,)
            ).fetchone()
            
            if not user:
                return self._get_default_user_stats()
            
            # Get recent measurements
            measurements = db.execute(
                """SELECT * FROM measurements 
                   WHERE user_id = ? 
                   ORDER BY date DESC 
                   LIMIT 10""",
                (user_id,)
            ).fetchall()
            
            # Get personal records
            prs = db.execute(
                """SELECT * FROM personal_records 
                   WHERE user_id = ? 
                   ORDER BY date DESC""",
                (user_id,)
            ).fetchall()
            
            return {
                "fitness_level": user["fitness_level"] if user else "intermediate",
                "goals": json.loads(user["goals"]) if user and user["goals"] else ["general_fitness"],
                "preferences": json.loads(user["preferences"]) if user and user["preferences"] else {},
                "recent_measurements": [dict(m) for m in measurements],
                "personal_records": [dict(pr) for pr in prs],
                "workout_frequency": self._calculate_workout_frequency(user_id),
                "recovery_needs": self._assess_recovery_needs(user_id)
            }
            
        finally:
            db.close()
    
    def _get_default_user_stats(self) -> Dict[str, Any]:
        """Get default stats for demo user"""
        return {
            "fitness_level": "intermediate",
            "goals": ["muscle_gain", "strength"],
            "preferences": {
                "workout_duration": 60,
                "equipment": ["barbell", "dumbbells", "cables"],
                "avoid_exercises": []
            },
            "recent_measurements": [],
            "personal_records": [],
            "workout_frequency": 4,
            "recovery_needs": "normal"
        }
    
    def _get_current_schedule(self, user_id: str, days: int) -> List[Dict[str, Any]]:
        """Get current workout schedule"""
        today = date.today()
        end_date = today + timedelta(days=days)
        
        # Get workouts from workout service
        workouts = self.workout_service.get_workouts_range(
            user_id,
            today.isoformat(),
            end_date.isoformat()
        )
        
        return workouts
    
    def _get_workout_history(self, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get workout history for analysis"""
        db = next(get_db())
        try:
            history = db.execute(
                """SELECT * FROM workout_sessions 
                   WHERE user_id = ? 
                   AND date >= date('now', '-? days')
                   ORDER BY date DESC""",
                (user_id, days)
            ).fetchall()
            
            return [dict(h) for h in history]
            
        finally:
            db.close()
    
    def _analyze_user_state(
        self, 
        user_data: Dict[str, Any],
        workout_history: List[Dict[str, Any]],
        current_schedule: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze user's current training state"""
        
        # Calculate training metrics
        total_workouts = len(workout_history)
        avg_workouts_per_week = (total_workouts / 4.3) if total_workouts > 0 else 0
        
        # Analyze muscle group frequency
        muscle_group_frequency = self._analyze_muscle_group_frequency(workout_history)
        
        # Identify gaps in training
        undertrained_muscles = self._identify_undertrained_muscles(muscle_group_frequency)
        
        # Check for overtraining signs
        consecutive_days = self._count_consecutive_workout_days(workout_history)
        needs_rest = consecutive_days >= 4
        
        # Analyze current week load
        current_week_load = self._calculate_weekly_load(current_schedule)
        
        return {
            "avg_workouts_per_week": round(avg_workouts_per_week, 1),
            "muscle_group_frequency": muscle_group_frequency,
            "undertrained_muscles": undertrained_muscles,
            "consecutive_workout_days": consecutive_days,
            "needs_rest": needs_rest,
            "current_week_load": current_week_load,
            "training_phase": self._determine_training_phase(workout_history),
            "recovery_status": user_data.get("recovery_needs", "normal")
        }
    
    def _generate_suggestions(
        self,
        user_data: Dict[str, Any],
        analysis: Dict[str, Any],
        current_schedule: List[Dict[str, Any]],
        include_rationale: bool
    ) -> List[WorkoutSuggestion]:
        """Generate workout suggestions based on analysis"""
        suggestions = []
        
        # Priority 1: Rest day if needed
        if analysis["needs_rest"]:
            suggestions.append(self._create_rest_day_suggestion(analysis))
        
        # Priority 2: Address undertrained muscles
        for muscle in analysis["undertrained_muscles"][:2]:  # Top 2 undertrained
            suggestion = self._create_muscle_group_workout(
                muscle,
                user_data,
                analysis,
                include_rationale
            )
            suggestions.append(suggestion)
        
        # Priority 3: Progressive overload suggestions
        if user_data["goals"] and "strength" in user_data["goals"]:
            progressive_suggestion = self._create_progressive_workout(
                user_data,
                analysis,
                include_rationale
            )
            if progressive_suggestion:
                suggestions.append(progressive_suggestion)
        
        # Priority 4: Cardio/conditioning if lacking
        if self._needs_cardio(analysis, user_data["goals"]):
            cardio_suggestion = self._create_cardio_workout(
                user_data,
                include_rationale
            )
            suggestions.append(cardio_suggestion)
        
        # Find optimal dates for suggestions
        self._assign_optimal_dates(suggestions, current_schedule)
        
        # Sort by priority
        suggestions.sort(key=lambda x: x.priority)
        
        return suggestions[:5]  # Return top 5 suggestions
    
    def _create_rest_day_suggestion(self, analysis: Dict[str, Any]) -> WorkoutSuggestion:
        """Create a rest day suggestion"""
        return WorkoutSuggestion(
            id=f"rest_{datetime.now().timestamp()}",
            title="Active Recovery Day",
            description="Light stretching, walking, or yoga",
            workout_type="recovery",
            duration_minutes=30,
            difficulty="easy",
            muscle_groups=["full_body"],
            exercises=[
                {
                    "name": "Light Walking",
                    "duration": "20 minutes",
                    "intensity": "low"
                },
                {
                    "name": "Full Body Stretching",
                    "duration": "10 minutes",
                    "intensity": "low"
                }
            ],
            rationale=f"You've trained {analysis['consecutive_workout_days']} days in a row. Recovery is essential for progress.",
            priority=0,
            suggested_date=date.today() + timedelta(days=1)
        )
    
    def _create_muscle_group_workout(
        self,
        muscle_group: str,
        user_data: Dict[str, Any],
        analysis: Dict[str, Any],
        include_rationale: bool
    ) -> WorkoutSuggestion:
        """Create a workout targeting specific muscle group"""
        
        # Define workout templates by muscle group
        workout_templates = {
            "chest": {
                "title": "Chest & Triceps Power",
                "exercises": [
                    {"name": "Barbell Bench Press", "sets": 4, "reps": "6-8"},
                    {"name": "Incline Dumbbell Press", "sets": 3, "reps": "8-10"},
                    {"name": "Cable Flyes", "sets": 3, "reps": "12-15"},
                    {"name": "Dips", "sets": 3, "reps": "8-12"},
                    {"name": "Overhead Tricep Extension", "sets": 3, "reps": "12-15"}
                ]
            },
            "back": {
                "title": "Back & Biceps Builder",
                "exercises": [
                    {"name": "Deadlifts", "sets": 4, "reps": "5-6"},
                    {"name": "Pull-ups", "sets": 3, "reps": "8-12"},
                    {"name": "Barbell Rows", "sets": 4, "reps": "8-10"},
                    {"name": "Face Pulls", "sets": 3, "reps": "15-20"},
                    {"name": "Hammer Curls", "sets": 3, "reps": "12-15"}
                ]
            },
            "legs": {
                "title": "Leg Day Intensity",
                "exercises": [
                    {"name": "Back Squats", "sets": 4, "reps": "6-8"},
                    {"name": "Romanian Deadlifts", "sets": 3, "reps": "8-10"},
                    {"name": "Leg Press", "sets": 3, "reps": "12-15"},
                    {"name": "Walking Lunges", "sets": 3, "reps": "10 each"},
                    {"name": "Calf Raises", "sets": 4, "reps": "15-20"}
                ]
            },
            "shoulders": {
                "title": "Shoulder Sculptor",
                "exercises": [
                    {"name": "Military Press", "sets": 4, "reps": "6-8"},
                    {"name": "Lateral Raises", "sets": 4, "reps": "12-15"},
                    {"name": "Rear Delt Flyes", "sets": 3, "reps": "15-20"},
                    {"name": "Upright Rows", "sets": 3, "reps": "10-12"},
                    {"name": "Shrugs", "sets": 3, "reps": "12-15"}
                ]
            }
        }
        
        template = workout_templates.get(muscle_group, workout_templates["chest"])
        
        # Adjust based on fitness level
        if user_data["fitness_level"] == "beginner":
            # Reduce sets and simplify exercises
            for exercise in template["exercises"]:
                exercise["sets"] = max(2, exercise["sets"] - 1)
        
        rationale = ""
        if include_rationale:
            frequency = analysis["muscle_group_frequency"].get(muscle_group, 0)
            rationale = f"Your {muscle_group} training frequency is low ({frequency} times in last 30 days). This workout will help balance your program."
        
        return WorkoutSuggestion(
            id=f"workout_{muscle_group}_{datetime.now().timestamp()}",
            title=template["title"],
            description=f"Focused {muscle_group} development workout",
            workout_type="strength",
            duration_minutes=60,
            difficulty=user_data["fitness_level"],
            muscle_groups=[muscle_group],
            exercises=template["exercises"],
            rationale=rationale,
            priority=1
        )
    
    def _create_progressive_workout(
        self,
        user_data: Dict[str, Any],
        analysis: Dict[str, Any],
        include_rationale: bool
    ) -> Optional[WorkoutSuggestion]:
        """Create a progressive overload workout"""
        
        # Check if user has recent PRs to beat
        if not user_data["personal_records"]:
            return None
        
        # Create a workout focused on beating PRs
        return WorkoutSuggestion(
            id=f"progressive_{datetime.now().timestamp()}",
            title="PR Challenge Workout",
            description="Push your limits and set new personal records",
            workout_type="strength",
            duration_minutes=75,
            difficulty="advanced",
            muscle_groups=["full_body"],
            exercises=[
                {"name": "Squat PR Attempt", "sets": 5, "reps": "3-5", "note": "Work up to 90%+ 1RM"},
                {"name": "Bench Press PR Attempt", "sets": 5, "reps": "3-5", "note": "Work up to 90%+ 1RM"},
                {"name": "Deadlift PR Attempt", "sets": 5, "reps": "1-3", "note": "Work up to 95%+ 1RM"},
                {"name": "Accessory Work", "sets": 3, "reps": "8-12", "note": "Light pump work"}
            ],
            rationale="It's been 2 weeks since your last PR attempt. Time to test your strength gains!" if include_rationale else "",
            priority=2
        )
    
    def _create_cardio_workout(
        self,
        user_data: Dict[str, Any],
        include_rationale: bool
    ) -> WorkoutSuggestion:
        """Create a cardio/conditioning workout"""
        
        if user_data["fitness_level"] == "beginner":
            exercises = [
                {"name": "Treadmill Walk/Jog", "duration": "20 minutes", "intensity": "moderate"},
                {"name": "Bike", "duration": "15 minutes", "intensity": "moderate"},
                {"name": "Rowing", "duration": "10 minutes", "intensity": "light"}
            ]
            duration = 45
        else:
            exercises = [
                {"name": "HIIT Sprints", "sets": 8, "duration": "30s on, 30s off"},
                {"name": "Battle Ropes", "sets": 4, "duration": "45s on, 15s off"},
                {"name": "Box Jumps", "sets": 4, "reps": "10"},
                {"name": "Burpees", "sets": 3, "reps": "15"}
            ]
            duration = 30
        
        return WorkoutSuggestion(
            id=f"cardio_{datetime.now().timestamp()}",
            title="Cardio Conditioning",
            description="Improve your cardiovascular fitness and endurance",
            workout_type="cardio",
            duration_minutes=duration,
            difficulty=user_data["fitness_level"],
            muscle_groups=["cardio"],
            exercises=exercises,
            rationale="Cardio training supports recovery and improves overall fitness" if include_rationale else "",
            priority=3
        )
    
    def _analyze_muscle_group_frequency(self, workout_history: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyze how often each muscle group has been trained"""
        frequency = {
            "chest": 0,
            "back": 0,
            "shoulders": 0,
            "arms": 0,
            "legs": 0,
            "core": 0,
            "cardio": 0
        }
        
        for workout in workout_history:
            # Parse workout type or exercises to determine muscle groups
            workout_type = workout.get("type", "").lower()
            
            if "chest" in workout_type or "push" in workout_type:
                frequency["chest"] += 1
                frequency["shoulders"] += 0.5
                frequency["arms"] += 0.5
            elif "back" in workout_type or "pull" in workout_type:
                frequency["back"] += 1
                frequency["arms"] += 0.5
            elif "leg" in workout_type:
                frequency["legs"] += 1
            elif "cardio" in workout_type or "hiit" in workout_type:
                frequency["cardio"] += 1
            elif "full" in workout_type:
                for muscle in frequency:
                    if muscle != "cardio":
                        frequency[muscle] += 0.5
        
        return frequency
    
    def _identify_undertrained_muscles(self, frequency: Dict[str, int]) -> List[str]:
        """Identify muscle groups that need more attention"""
        avg_frequency = sum(frequency.values()) / len(frequency)
        
        undertrained = []
        for muscle, freq in frequency.items():
            if freq < avg_frequency * 0.7:  # 30% below average
                undertrained.append(muscle)
        
        return sorted(undertrained, key=lambda x: frequency[x])
    
    def _count_consecutive_workout_days(self, workout_history: List[Dict[str, Any]]) -> int:
        """Count consecutive workout days"""
        if not workout_history:
            return 0
        
        consecutive = 1
        last_date = datetime.fromisoformat(workout_history[0]["date"]).date()
        
        for workout in workout_history[1:]:
            workout_date = datetime.fromisoformat(workout["date"]).date()
            if (last_date - workout_date).days == 1:
                consecutive += 1
                last_date = workout_date
            else:
                break
        
        return consecutive
    
    def _calculate_weekly_load(self, schedule: List[Dict[str, Any]]) -> str:
        """Calculate training load for current week"""
        workout_count = sum(1 for day in schedule[:7] if day.get("type") != "rest")
        
        if workout_count >= 5:
            return "high"
        elif workout_count >= 3:
            return "moderate"
        else:
            return "low"
    
    def _determine_training_phase(self, workout_history: List[Dict[str, Any]]) -> str:
        """Determine current training phase"""
        if len(workout_history) < 7:
            return "building"
        
        # Simple heuristic based on recent volume
        recent_workouts = workout_history[:7]
        intense_workouts = sum(1 for w in recent_workouts if w.get("difficulty") == "hard")
        
        if intense_workouts >= 5:
            return "peak"
        elif intense_workouts <= 1:
            return "deload"
        else:
            return "maintenance"
    
    def _needs_cardio(self, analysis: Dict[str, Any], goals: List[str]) -> bool:
        """Check if user needs more cardio"""
        cardio_frequency = analysis["muscle_group_frequency"].get("cardio", 0)
        
        # Everyone needs some cardio
        if cardio_frequency < 1:
            return True
        
        # Weight loss goals need more cardio
        if "weight_loss" in goals and cardio_frequency < 3:
            return True
        
        return False
    
    def _assign_optimal_dates(
        self, 
        suggestions: List[WorkoutSuggestion], 
        current_schedule: List[Dict[str, Any]]
    ):
        """Assign optimal dates for workout suggestions"""
        # Find rest days or light days in the schedule
        available_dates = []
        
        for i, day in enumerate(current_schedule[:7]):  # Next 7 days
            if day.get("type") == "rest" or not day.get("title"):
                available_dates.append(date.today() + timedelta(days=i))
        
        # Assign dates to suggestions
        for i, suggestion in enumerate(suggestions):
            if i < len(available_dates):
                suggestion.suggested_date = available_dates[i]
                
                # Find workout that could be replaced
                for j, day in enumerate(current_schedule[:7]):
                    if day.get("type") != "rest" and day.get("difficulty") == "easy":
                        suggestion.can_replace_date = date.today() + timedelta(days=j)
                        break

# Global instance
workout_suggestion_service = WorkoutSuggestionService()