"""
AI Fitness Coach Agent using OpenAI Agents SDK
"""
from openai_agents import Agent, tool
from typing import Dict, Any, List, Optional
from datetime import datetime, date
import json
from dataclasses import dataclass

from services.workout_service import WorkoutService
from services.exercise_service import ExerciseService
from models.workout import Workout, Exercise

@dataclass
class CoachPersonality:
    """Different coaching personalities"""
    SUPPORTIVE = "supportive"
    AGGRESSIVE = "aggressive"
    STEADY_PACE = "steady_pace"

class FitnessCoachAgent(Agent):
    """
    AI Fitness Coach Agent with persistent state and tool calling capabilities
    """
    
    def __init__(self, user_id: str, personality: str = CoachPersonality.SUPPORTIVE):
        # Initialize the agent with fitness coaching instructions
        instructions = self._get_personality_instructions(personality)
        
        super().__init__(
            name=f"fitness_coach_{user_id}",
            instructions=instructions,
            model="gpt-4-turbo-preview",
            tools=[
                self.get_workout_for_date,
                self.make_rest_day,
                self.substitute_exercise,
                self.create_custom_workout,
                self.reschedule_workout,
                self.get_user_progress,
                self.log_workout_completion,
                self.find_exercise_alternatives,
                self.calculate_calories_burned,
                self.assess_injury_risk
            ]
        )
        
        self.user_id = user_id
        self.personality = personality
        self.workout_service = WorkoutService()
        self.exercise_service = ExerciseService()
        
        # Agent state - persisted automatically by OpenAI Agents
        self.user_preferences = {}
        self.conversation_context = {}
        self.fitness_goals = []
        self.injury_history = []
    
    def _get_personality_instructions(self, personality: str) -> str:
        """Get personality-specific coaching instructions"""
        base_instructions = """
        You are Alex, an expert AI fitness coach with complete access to the user's workout schedule, 
        progress tracking, and fitness goals. You provide REAL-TIME, personalized fitness coaching 
        through natural conversation.

        CORE CAPABILITIES:
        🏋️ Managing personalized workout schedules
        🔄 Modifying workouts based on user needs  
        📅 Accessing current training plans and progress
        🥗 Providing nutrition guidance
        📈 Tracking fitness progress and statistics
        📊 Analyzing workout data and calories burned
        💪 Exercise form and technique advice
        🎯 Goal-specific training recommendations
        🏥 Injury assessment and workout modifications
        
        IMPORTANT: When users ask about stats, calories burned, or progress:
        1. Use the comprehensive context data provided
        2. Reference actual numbers from their weekly_stats, monthly_stats, etc.
        3. Provide specific insights about their performance
        4. Make recommendations based on their actual data

        SAFETY PROTOCOLS:
        - Always prioritize user safety and wellbeing
        - Never recommend exercises beyond user capability
        - Recognize signs of overexertion or injury
        - Suggest medical consultation when appropriate
        - Provide proper form instructions for all exercises

        RESPONSE STYLE:
        - Use relevant emojis to enhance readability
        - Provide specific, actionable advice
        - Keep responses helpful but concise
        - Reference user's actual workout data
        """
        
        personality_styles = {
            CoachPersonality.SUPPORTIVE: """
            PERSONALITY: Supportive & Encouraging
            - Be warm, understanding, and motivational
            - Focus on progress celebration and positive reinforcement
            - Use phrases like "You've got this!", "I'm proud of your progress"
            - Provide gentle guidance when users struggle
            - Emphasize self-care and listening to your body
            """,
            
            CoachPersonality.AGGRESSIVE: """
            PERSONALITY: High-Energy & Challenging
            - Be direct, intense, and results-focused
            - Push users to exceed their comfort zones
            - Use phrases like "Let's crush this workout!", "No excuses!"
            - Challenge users to reach higher goals
            - Focus on discipline and mental toughness
            """,
            
            CoachPersonality.STEADY_PACE: """
            PERSONALITY: Consistent & Methodical
            - Be calm, systematic, and progress-oriented
            - Focus on sustainable, long-term improvements
            - Use phrases like "Steady progress wins", "One step at a time"
            - Emphasize consistency over intensity
            - Provide detailed, structured guidance
            """
        }
        
        return base_instructions + personality_styles.get(personality, personality_styles[CoachPersonality.SUPPORTIVE])

    @tool
    def get_workout_for_date(self, date_str: str = None) -> Dict[str, Any]:
        """
        Get the workout scheduled for a specific date
        
        Args:
            date_str: Date in YYYY-MM-DD format (defaults to today)
        """
        if date_str:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        else:
            target_date = date.today()
        
        workout = self.workout_service.get_workout_for_date(self.user_id, target_date)
        
        if not workout:
            return {
                "status": "rest_day",
                "message": f"No workout scheduled for {target_date.strftime('%A, %B %d')}. It's a rest day!",
                "date": date_str or target_date.isoformat()
            }
        
        return {
            "status": "workout_found",
            "workout": {
                "id": workout.id,
                "title": workout.title,
                "duration": workout.duration_minutes,
                "difficulty": workout.difficulty,
                "calories": workout.estimated_calories,
                "exercises": [
                    {
                        "name": ex.name,
                        "sets": ex.sets,
                        "reps": ex.reps,
                        "weight": ex.weight,
                        "muscle_groups": ex.muscle_groups
                    }
                    for ex in workout.exercises
                ],
                "completed": workout.completed
            },
            "date": target_date.isoformat()
        }

    @tool
    def make_rest_day(self, date_str: str = None, reason: str = None) -> Dict[str, Any]:
        """
        Convert a scheduled workout day to a rest day
        
        Args:
            date_str: Date in YYYY-MM-DD format (defaults to today)
            reason: Optional reason for the rest day
        """
        if date_str:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        else:
            target_date = date.today()
        
        current_workout = self.workout_service.get_workout_for_date(self.user_id, target_date)
        
        if not current_workout:
            return {
                "status": "already_rest_day",
                "message": f"{target_date.strftime('%A')} is already a rest day!"
            }
        
        # Delete the workout
        success = self.workout_service.delete_workout(self.user_id, target_date)
        
        if success:
            # Log the change
            self.workout_service.log_workout_modification(
                user_id=self.user_id,
                action="rest_day_conversion",
                details={
                    "original_workout": current_workout.title,
                    "date": target_date.isoformat(),
                    "reason": reason
                }
            )
            
            return {
                "status": "success",
                "message": f"✅ {target_date.strftime('%A')} is now a rest day. Your {current_workout.title} workout has been removed.",
                "original_workout": current_workout.title
            }
        
        return {
            "status": "error",
            "message": "Failed to convert to rest day. Please try again."
        }

    @tool
    def substitute_exercise(self, exercise_name: str, reason: str, date_str: str = None) -> Dict[str, Any]:
        """
        Replace an exercise with an alternative
        
        Args:
            exercise_name: Name of the exercise to replace
            reason: Reason for substitution (injury, equipment, preference)
            date_str: Date of the workout (defaults to today)
        """
        if date_str:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        else:
            target_date = date.today()
        
        workout = self.workout_service.get_workout_for_date(self.user_id, target_date)
        
        if not workout:
            return {
                "status": "error",
                "message": "No workout scheduled for this date."
            }
        
        # Find the exercise to replace
        exercise_to_replace = None
        for ex in workout.exercises:
            if exercise_name.lower() in ex.name.lower():
                exercise_to_replace = ex
                break
        
        if not exercise_to_replace:
            return {
                "status": "error",
                "message": f"Exercise '{exercise_name}' not found in today's workout."
            }
        
        # Find alternatives
        alternatives = self.exercise_service.find_alternatives(
            exercise=exercise_to_replace,
            reason=reason,
            user_limitations=self.user_preferences.get('limitations', [])
        )
        
        if not alternatives:
            return {
                "status": "error",
                "message": f"No suitable alternatives found for {exercise_name}."
            }
        
        # Use the best alternative
        best_alternative = alternatives[0]
        
        # Replace the exercise
        success = self.workout_service.replace_exercise(
            user_id=self.user_id,
            workout_date=target_date,
            old_exercise_id=exercise_to_replace.id,
            new_exercise=best_alternative
        )
        
        if success:
            return {
                "status": "success",
                "message": f"✅ Replaced {exercise_to_replace.name} with {best_alternative.name}",
                "original_exercise": exercise_to_replace.name,
                "new_exercise": best_alternative.name,
                "reason": reason,
                "alternatives": [alt.name for alt in alternatives[:3]]  # Show top 3
            }
        
        return {
            "status": "error",
            "message": "Failed to replace exercise. Please try again."
        }

    @tool
    def create_custom_workout(
        self, 
        workout_type: str, 
        duration: int, 
        difficulty: str = "intermediate",
        muscle_groups: List[str] = None,
        equipment: List[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a custom workout based on user specifications
        
        Args:
            workout_type: Type of workout (strength, cardio, HIIT, yoga, etc.)
            duration: Duration in minutes
            difficulty: beginner, intermediate, or advanced
            muscle_groups: Target muscle groups
            equipment: Available equipment
        """
        
        # Generate the workout
        custom_workout = self.workout_service.generate_custom_workout(
            user_id=self.user_id,
            workout_type=workout_type,
            duration_minutes=duration,
            difficulty=difficulty,
            target_muscle_groups=muscle_groups or [],
            available_equipment=equipment or [],
            user_preferences=self.user_preferences
        )
        
        if not custom_workout:
            return {
                "status": "error",
                "message": "Failed to generate custom workout. Please try different parameters."
            }
        
        return {
            "status": "success",
            "workout": {
                "title": custom_workout.title,
                "duration": custom_workout.duration_minutes,
                "difficulty": custom_workout.difficulty,
                "estimated_calories": custom_workout.estimated_calories,
                "exercises": [
                    {
                        "name": ex.name,
                        "sets": ex.sets,
                        "reps": ex.reps,
                        "instructions": ex.instructions,
                        "muscle_groups": ex.muscle_groups
                    }
                    for ex in custom_workout.exercises
                ]
            },
            "message": f"✅ Created a {duration}-minute {workout_type} workout at {difficulty} level!"
        }

    @tool
    def reschedule_workout(self, from_date: str, to_date: str) -> Dict[str, Any]:
        """
        Move a workout from one date to another
        
        Args:
            from_date: Current workout date (YYYY-MM-DD)
            to_date: New workout date (YYYY-MM-DD)
        """
        from_date_obj = datetime.strptime(from_date, "%Y-%m-%d").date()
        to_date_obj = datetime.strptime(to_date, "%Y-%m-%d").date()
        
        workout = self.workout_service.get_workout_for_date(self.user_id, from_date_obj)
        
        if not workout:
            return {
                "status": "error",
                "message": f"No workout found on {from_date_obj.strftime('%A, %B %d')}"
            }
        
        # Check if target date already has a workout
        existing_workout = self.workout_service.get_workout_for_date(self.user_id, to_date_obj)
        if existing_workout:
            return {
                "status": "error",
                "message": f"{to_date_obj.strftime('%A, %B %d')} already has a workout scheduled: {existing_workout.title}"
            }
        
        # Move the workout
        success = self.workout_service.reschedule_workout(
            user_id=self.user_id,
            from_date=from_date_obj,
            to_date=to_date_obj
        )
        
        if success:
            return {
                "status": "success",
                "message": f"✅ Moved {workout.title} from {from_date_obj.strftime('%A, %B %d')} to {to_date_obj.strftime('%A, %B %d')}",
                "workout_title": workout.title
            }
        
        return {
            "status": "error",
            "message": "Failed to reschedule workout. Please try again."
        }

    @tool
    def get_user_progress(self, days: int = 30) -> Dict[str, Any]:
        """
        Get user's fitness progress over the last N days
        
        Args:
            days: Number of days to look back (default 30)
        """
        progress_data = self.workout_service.get_user_progress(self.user_id, days)
        
        return {
            "status": "success",
            "progress": {
                "total_workouts": progress_data["total_workouts"],
                "completed_workouts": progress_data["completed_workouts"],
                "completion_rate": progress_data["completion_rate"],
                "total_calories": progress_data["total_calories"],
                "average_duration": progress_data["average_duration"],
                "favorite_exercises": progress_data["top_exercises"],
                "consistency_streak": progress_data["current_streak"],
                "improvements": progress_data["improvements"]
            },
            "message": f"Here's your fitness progress over the last {days} days! 📊"
        }

    @tool
    def assess_injury_risk(self, symptoms: str, body_part: str) -> Dict[str, Any]:
        """
        Assess injury risk and provide safety recommendations
        
        Args:
            symptoms: Description of symptoms or pain
            body_part: Affected body part
        """
        
        # Simple risk assessment logic (in a real app, this would be more sophisticated)
        high_risk_keywords = ["sharp pain", "severe", "can't move", "swelling", "numbness"]
        moderate_risk_keywords = ["ache", "sore", "tight", "stiff", "uncomfortable"]
        
        symptoms_lower = symptoms.lower()
        
        if any(keyword in symptoms_lower for keyword in high_risk_keywords):
            risk_level = "high"
            recommendation = "⚠️ STOP exercising immediately. Consider consulting a healthcare professional."
        elif any(keyword in symptoms_lower for keyword in moderate_risk_keywords):
            risk_level = "moderate"
            recommendation = "⚠️ Modify or avoid exercises targeting this area. Focus on gentle movement."
        else:
            risk_level = "low"
            recommendation = "✅ Monitor symptoms. Warm up properly and listen to your body."
        
        # Get exercise modifications
        modifications = self.exercise_service.get_injury_modifications(body_part, symptoms)
        
        return {
            "status": "success",
            "assessment": {
                "risk_level": risk_level,
                "recommendation": recommendation,
                "affected_area": body_part,
                "symptoms": symptoms,
                "exercise_modifications": modifications,
                "follow_up": "Monitor symptoms and seek medical advice if they worsen."
            }
        }

    def update_user_context(self, context: Dict[str, Any]):
        """Update user context and preferences"""
        self.user_preferences.update(context.get('preferences', {}))
        self.fitness_goals = context.get('goals', [])
        self.injury_history = context.get('injuries', [])
        self.conversation_context.update(context.get('conversation', {}))

    def get_agent_state(self) -> Dict[str, Any]:
        """Get current agent state for debugging"""
        return {
            "user_id": self.user_id,
            "personality": self.personality,
            "user_preferences": self.user_preferences,
            "fitness_goals": self.fitness_goals,
            "conversation_context": self.conversation_context
        }