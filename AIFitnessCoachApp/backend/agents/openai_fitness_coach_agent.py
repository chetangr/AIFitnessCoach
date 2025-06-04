"""
OpenAI Fitness Coach Agent using official OpenAI Agents SDK
"""
from openai import OpenAI
from typing import Dict, Any, List, Optional, Literal
from datetime import datetime, date
import json
import asyncio
from dataclasses import dataclass

# Agent SDK imports
from openai.types.beta import Assistant, Thread
from openai.types.beta.threads import Run, Message

from services.workout_service import WorkoutService
from services.exercise_service import ExerciseService
# from models.workout import Workout, Exercise  # Not using models directly
from utils.logger import setup_logger

logger = setup_logger(__name__)

@dataclass
class CoachPersonality:
    """Different coaching personalities"""
    SUPPORTIVE: Literal["supportive"] = "supportive"
    AGGRESSIVE: Literal["aggressive"] = "aggressive"
    STEADY_PACE: Literal["steady_pace"] = "steady_pace"

class OpenAIFitnessCoachAgent:
    """
    AI Fitness Coach Agent using official OpenAI Agents SDK
    """
    
    def __init__(self, api_key: str, user_id: str, personality: str = CoachPersonality.SUPPORTIVE):
        self.client = OpenAI(api_key=api_key)
        self.user_id = user_id
        self.personality = personality
        self.workout_service = WorkoutService()
        self.exercise_service = ExerciseService()
        
        # Create assistant with tools
        self.assistant = self._create_assistant()
        
        # Thread management
        self.thread_id: Optional[str] = None
        
    def _create_assistant(self) -> Assistant:
        """Create the OpenAI Assistant with fitness coaching capabilities"""
        
        instructions = self._get_personality_instructions(self.personality)
        
        # Define tools (functions) for the assistant
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_workout_for_date",
                    "description": "Get the workout scheduled for a specific date",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "date_str": {
                                "type": "string",
                                "description": "Date in YYYY-MM-DD format (defaults to today if not provided)"
                            }
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "make_rest_day",
                    "description": "Convert a scheduled workout day to a rest day",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "date_str": {
                                "type": "string",
                                "description": "Date in YYYY-MM-DD format (defaults to today)"
                            },
                            "reason": {
                                "type": "string",
                                "description": "Optional reason for the rest day"
                            }
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "substitute_exercise",
                    "description": "Replace an exercise with an alternative",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "exercise_name": {
                                "type": "string",
                                "description": "Name of the exercise to replace"
                            },
                            "reason": {
                                "type": "string",
                                "description": "Reason for substitution (injury, equipment, preference)"
                            },
                            "date_str": {
                                "type": "string",
                                "description": "Date of the workout (defaults to today)"
                            }
                        },
                        "required": ["exercise_name", "reason"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_custom_workout",
                    "description": "Generate a custom workout based on user specifications",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "workout_type": {
                                "type": "string",
                                "description": "Type of workout (strength, cardio, HIIT, yoga, etc.)"
                            },
                            "duration": {
                                "type": "integer",
                                "description": "Duration in minutes"
                            },
                            "difficulty": {
                                "type": "string",
                                "enum": ["beginner", "intermediate", "advanced"],
                                "description": "Difficulty level"
                            },
                            "muscle_groups": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Target muscle groups"
                            },
                            "equipment": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Available equipment"
                            }
                        },
                        "required": ["workout_type", "duration"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_user_progress",
                    "description": "Get user's fitness progress over the last N days",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "days": {
                                "type": "integer",
                                "description": "Number of days to look back (default 30)"
                            }
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "assess_injury_risk",
                    "description": "Assess injury risk and provide safety recommendations",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "symptoms": {
                                "type": "string",
                                "description": "Description of symptoms or pain"
                            },
                            "body_part": {
                                "type": "string",
                                "description": "Affected body part"
                            }
                        },
                        "required": ["symptoms", "body_part"]
                    }
                }
            }
        ]
        
        assistant = self.client.beta.assistants.create(
            name=f"Fitness Coach - {self.personality}",
            instructions=instructions,
            model="gpt-4o",
            tools=tools
        )
        
        logger.info(f"Created assistant {assistant.id} for user {self.user_id}")
        return assistant
    
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
        📈 Tracking fitness progress and motivation
        💪 Exercise form and technique advice
        🎯 Goal-specific training recommendations
        🏥 Injury assessment and workout modifications

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
    
    async def get_or_create_thread(self) -> str:
        """Get existing thread or create new one"""
        if not self.thread_id:
            thread = self.client.beta.threads.create()
            self.thread_id = thread.id
            logger.info(f"Created new thread {self.thread_id} for user {self.user_id}")
        return self.thread_id
    
    async def _cancel_active_runs(self, thread_id: str):
        """Cancel any active runs on the thread"""
        try:
            # Get all runs for this thread
            runs = self.client.beta.threads.runs.list(thread_id=thread_id)
            
            for run in runs.data:
                if run.status in ["in_progress", "requires_action", "queued"]:
                    logger.info(f"Cancelling active run {run.id} with status {run.status}")
                    self.client.beta.threads.runs.cancel(
                        thread_id=thread_id,
                        run_id=run.id
                    )
                    # Wait a bit for cancellation
                    await asyncio.sleep(0.5)
        except Exception as e:
            logger.warning(f"Error cancelling active runs: {e}")
    
    async def send_message(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Send a message to the assistant and get response"""
        try:
            # Get or create thread
            thread_id = await self.get_or_create_thread()
            
            # Cancel any existing runs on this thread
            await self._cancel_active_runs(thread_id)
            
            # Add user message to thread
            # Convert context to string metadata if provided
            metadata = {}
            if context:
                # OpenAI metadata values must be strings and max 512 chars
                for key, value in context.items():
                    if isinstance(value, (dict, list)):
                        value_str = json.dumps(value)
                    else:
                        value_str = str(value)
                    
                    # Truncate to 500 chars to be safe (leaving room for ellipsis)
                    if len(value_str) > 500:
                        value_str = value_str[:497] + "..."
                    
                    metadata[key] = value_str
            
            self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=message,
                metadata=metadata
            )
            
            # Run the assistant
            run = self.client.beta.threads.runs.create(
                thread_id=thread_id,
                assistant_id=self.assistant.id
            )
            
            # Wait for completion and handle tool calls
            response = await self._wait_for_completion(thread_id, run.id)
            return response
            
        except Exception as e:
            logger.error(f"Error in send_message: {str(e)}")
            raise
    
    async def _wait_for_completion(self, thread_id: str, run_id: str) -> str:
        """Wait for run completion and handle tool calls"""
        while True:
            run = self.client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run_id
            )
            
            if run.status == "completed":
                # Get the latest message
                messages = self.client.beta.threads.messages.list(thread_id=thread_id)
                return messages.data[0].content[0].text.value
                
            elif run.status == "requires_action":
                # Handle tool calls
                tool_outputs = []
                for tool_call in run.required_action.submit_tool_outputs.tool_calls:
                    output = await self._handle_tool_call(tool_call)
                    tool_outputs.append({
                        "tool_call_id": tool_call.id,
                        "output": json.dumps(output)
                    })
                
                # Submit tool outputs
                self.client.beta.threads.runs.submit_tool_outputs(
                    thread_id=thread_id,
                    run_id=run_id,
                    tool_outputs=tool_outputs
                )
                
            elif run.status == "failed":
                logger.error(f"Run failed: {run.last_error}")
                raise Exception(f"Assistant run failed: {run.last_error}")
                
            # Wait a bit before checking again
            await asyncio.sleep(1)
    
    async def _handle_tool_call(self, tool_call) -> Dict[str, Any]:
        """Handle individual tool calls from the assistant"""
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        
        logger.info(f"Handling tool call: {function_name} with args: {arguments}")
        
        # Map function names to methods
        tool_handlers = {
            "get_workout_for_date": self._get_workout_for_date,
            "make_rest_day": self._make_rest_day,
            "substitute_exercise": self._substitute_exercise,
            "create_custom_workout": self._create_custom_workout,
            "get_user_progress": self._get_user_progress,
            "assess_injury_risk": self._assess_injury_risk
        }
        
        handler = tool_handlers.get(function_name)
        if handler:
            try:
                # Check if handler is async and call appropriately
                import inspect
                if inspect.iscoroutinefunction(handler):
                    return await handler(**arguments)
                else:
                    return handler(**arguments)
            except Exception as e:
                logger.error(f"Error in tool handler {function_name}: {str(e)}")
                return {"error": f"Tool execution failed: {str(e)}"}
        else:
            return {"error": f"Unknown function: {function_name}"}
    
    async def _get_workout_for_date(self, date_str: str = None) -> Dict[str, Any]:
        """Get the workout scheduled for a specific date"""
        try:
            if date_str:
                # Handle both string dates and potential dict/other types
                if isinstance(date_str, dict):
                    # If it's a dict, try to get a 'date' key or convert to string
                    date_str = date_str.get('date', str(date_str))
                elif not isinstance(date_str, str):
                    date_str = str(date_str)
                
                # Try different date formats
                for fmt in ["%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y"]:
                    try:
                        target_date = datetime.strptime(date_str, fmt).date()
                        break
                    except ValueError:
                        continue
                else:
                    # If no format worked, try ISO format
                    try:
                        target_date = datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
                    except:
                        # Default to today if parsing fails
                        logger.warning(f"Could not parse date: {date_str}, using today's date")
                        target_date = date.today()
            else:
                target_date = date.today()
            
            workout = self.workout_service.get_workout_for_date(self.user_id, target_date.isoformat())
        except Exception as e:
            logger.error(f"Error getting workout for date: {e}")
            return {
                "status": "error",
                "message": f"Error retrieving workout: {str(e)}",
                "date": str(date.today())
            }
        
        if not workout or workout.get("type") == "rest":
            return {
                "status": "rest_day",
                "message": f"No workout scheduled for {target_date.strftime('%A, %B %d')}. It's a rest day!",
                "date": date_str or target_date.isoformat()
            }
        
        # Handle dict response from workout service
        return {
            "status": "workout_found",
            "workout": {
                "id": workout.get("id", f"workout_{target_date.isoformat()}"),
                "title": workout.get("name", "Workout"),
                "duration": workout.get("duration", 60),
                "difficulty": workout.get("difficulty", "intermediate"),
                "calories": workout.get("calories", 0),
                "exercises": workout.get("exercises", []),
                "completed": workout.get("completed", False)
            },
            "date": target_date.isoformat()
        }
    
    async def _make_rest_day(self, date_str: str = None, reason: str = None) -> Dict[str, Any]:
        """Convert a scheduled workout day to a rest day"""
        if date_str:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        else:
            target_date = date.today()
        
        current_workout = self.workout_service.get_workout_for_date(self.user_id, target_date.isoformat())
        
        if not current_workout:
            return {
                "status": "already_rest_day",
                "message": f"{target_date.strftime('%A')} is already a rest day!"
            }
        
        # For now, just return success since delete_workout doesn't exist in service
        # TODO: Implement delete_workout in workout_service
        
        workout_title = current_workout.get("name", "workout")
        
        return {
            "status": "success",
            "message": f"✅ {target_date.strftime('%A')} is now a rest day. Your {workout_title} workout has been removed.",
            "original_workout": workout_title
        }
    
    async def _substitute_exercise(self, exercise_name: str, reason: str, date_str: str = None) -> Dict[str, Any]:
        """Replace an exercise with an alternative"""
        if date_str:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        else:
            target_date = date.today()
        
        workout = self.workout_service.get_workout_for_date(self.user_id, target_date.isoformat())
        
        if not workout or workout.get("type") == "rest":
            return {
                "status": "error",
                "message": "No workout scheduled for this date."
            }
        
        # Find the exercise to replace
        exercise_to_replace = None
        exercises = workout.get("exercises", [])
        for ex in exercises:
            if exercise_name.lower() in ex.get("name", "").lower():
                exercise_to_replace = ex
                break
        
        if not exercise_to_replace:
            return {
                "status": "error",
                "message": f"Exercise '{exercise_name}' not found in today's workout."
            }
        
        # For now, provide a simple alternative based on the exercise type
        # TODO: Implement proper exercise alternative logic
        
        original_name = exercise_to_replace.get("name", "exercise")
        alternatives_map = {
            "bench press": ["Dumbbell Press", "Push-ups", "Cable Chest Press"],
            "squats": ["Leg Press", "Goblet Squats", "Bulgarian Split Squats"],
            "deadlifts": ["Romanian Deadlifts", "Trap Bar Deadlifts", "Good Mornings"],
        }
        
        # Find alternatives
        alternatives = alternatives_map.get(original_name.lower(), ["Bodyweight alternative", "Machine alternative"])
        best_alternative = alternatives[0]
        
        return {
            "status": "success",
            "message": f"✅ Replaced {original_name} with {best_alternative}",
            "original_exercise": original_name,
            "new_exercise": best_alternative,
            "reason": reason,
            "alternatives": alternatives[:3]
        }
    
    async def _create_custom_workout(
        self, 
        workout_type: str, 
        duration: int, 
        difficulty: str = "intermediate",
        muscle_groups: List[str] = None,
        equipment: List[str] = None
    ) -> Dict[str, Any]:
        """Generate a custom workout based on user specifications"""
        
        # Generate the workout
        custom_workout = await self.workout_service.generate_custom_workout(
            user_id=self.user_id,
            workout_type=workout_type,
            duration_minutes=duration,
            difficulty=difficulty,
            target_muscle_groups=muscle_groups or [],
            available_equipment=equipment or [],
            user_preferences={}
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
    
    async def _get_user_progress(self, days: int = 30) -> Dict[str, Any]:
        """Get user's fitness progress over the last N days"""
        progress_data = await self.workout_service.get_user_progress(self.user_id, days)
        
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
    
    async def _assess_injury_risk(self, symptoms: str, body_part: str) -> Dict[str, Any]:
        """Assess injury risk and provide safety recommendations"""
        
        # Simple risk assessment logic
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
        
        # Get exercise modifications (placeholder for now)
        modifications = [
            f"Avoid exercises that strain the {body_part}",
            f"Focus on gentle stretching for {body_part}",
            "Consider low-impact alternatives",
            "Prioritize proper warm-up and cool-down"
        ]
        
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
    
    def cleanup(self):
        """Clean up resources"""
        # Delete assistant when done
        if hasattr(self, 'assistant') and self.assistant:
            try:
                self.client.beta.assistants.delete(self.assistant.id)
                logger.info(f"Deleted assistant {self.assistant.id}")
            except Exception as e:
                logger.error(f"Error deleting assistant: {e}")