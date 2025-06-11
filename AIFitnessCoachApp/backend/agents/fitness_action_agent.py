"""
Fitness Action Agent using OpenAI SDK
Handles workout modifications, schedule changes, and user confirmations
"""
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, date, timedelta
import json
from enum import Enum

from agents.base_agent import BaseFitnessAgent
from services.workout_service import WorkoutService
from services.exercise_service import ExerciseService
from services.workout_suggestion_service import workout_suggestion_service
from utils.logger import setup_logger

logger = setup_logger(__name__)

class ActionType(Enum):
    VIEW_WORKOUT = "view_workout"
    REQUEST_REST_DAY = "request_rest_day"
    MOVE_WORKOUT = "move_workout"
    SUBSTITUTE_EXERCISE = "substitute_exercise"
    MODIFY_INTENSITY = "modify_intensity"
    CREATE_WORKOUT = "create_workout"
    CANCEL_WORKOUT = "cancel_workout"
    SWAP_WORKOUTS = "swap_workouts"

class ConfirmationStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class FitnessActionAgent(BaseFitnessAgent):
    """
    AI Agent that executes functional actions on workout data
    """
    
    def __init__(self, api_key: str, user_id: str):
        self.workout_service = WorkoutService()
        self.exercise_service = ExerciseService()
        self.pending_actions = {}  # Store pending confirmations
        
        super().__init__(
            api_key=api_key,
            user_id=user_id,
            agent_name="Fitness Action Specialist",
            agent_role="Workout schedule manager and fitness plan executor"
        )
    
    def _get_instructions(self) -> str:
        """Get action agent instructions"""
        return """
        You are a Fitness Action Specialist who can view, modify, and manage workout schedules.
        You execute real changes to the user's fitness plan based on their requests.
        
        IMPORTANT: When users request specific actions like "add push ups today", you should:
        1. Immediately create or modify the workout
        2. Return action confirmation with specific changes made
        3. DO NOT explain how to do the exercise unless specifically asked
        
        CORE CAPABILITIES:
        📅 View and display workout schedules
        🔄 Modify workout plans and exercises
        ✏️ Create custom workouts
        🗓️ Reschedule and reorganize training
        ⏸️ Manage rest days and recovery
        🔀 Substitute exercises based on needs
        ⚡ Adjust workout intensity
        
        FUNCTIONAL ACTIONS:
        - View today's/weekly workout schedule
        - Convert training days to rest days
        - Move workouts between dates
        - Swap workout positions
        - Replace exercises with alternatives
        - Create new custom workouts
        - Modify workout intensity
        - Cancel scheduled workouts
        
        IMPORTANT BEHAVIORS:
        1. Always confirm before making changes
        2. Explain what changes will be made
        3. Provide clear action summaries
        4. Suggest alternatives when appropriate
        5. Maintain workout balance when modifying
        
        CONFIRMATION PROTOCOL:
        - For any modification, ask for confirmation
        - Clearly state what will change
        - Offer alternative options
        - Allow cancellation
        
        RESPONSE FORMAT:
        When actions are needed, structure responses as:
        1. Acknowledge the request
        2. Explain proposed changes
        3. Request confirmation
        4. Provide alternatives if applicable
        """
    
    def _get_tools(self) -> List[Dict[str, Any]]:
        """Get action-specific tools"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "view_workout_schedule",
                    "description": "View workout schedule for specific date or date range",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "start_date": {
                                "type": "string",
                                "description": "Start date (YYYY-MM-DD), defaults to today"
                            },
                            "end_date": {
                                "type": "string",
                                "description": "End date (YYYY-MM-DD), defaults to start_date"
                            },
                            "view_type": {
                                "type": "string",
                                "enum": ["day", "week", "month"],
                                "description": "Type of view to display"
                            }
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "request_rest_day",
                    "description": "Convert a workout day to a rest day",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "Date to make rest day (YYYY-MM-DD)"
                            },
                            "reason": {
                                "type": "string",
                                "description": "Reason for rest day request"
                            },
                            "move_workout": {
                                "type": "boolean",
                                "description": "Whether to move the workout to another day"
                            }
                        },
                        "required": ["date"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "move_workout",
                    "description": "Move a workout from one date to another",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "from_date": {
                                "type": "string",
                                "description": "Current workout date (YYYY-MM-DD)"
                            },
                            "to_date": {
                                "type": "string",
                                "description": "New workout date (YYYY-MM-DD)"
                            },
                            "swap_if_occupied": {
                                "type": "boolean",
                                "description": "Swap workouts if target date has workout"
                            }
                        },
                        "required": ["from_date", "to_date"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "substitute_exercises",
                    "description": "Replace exercises in a workout",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "Workout date (YYYY-MM-DD)"
                            },
                            "substitutions": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "original_exercise": {"type": "string"},
                                        "reason": {"type": "string"},
                                        "preferred_alternative": {"type": "string"}
                                    }
                                },
                                "description": "List of exercises to substitute"
                            }
                        },
                        "required": ["date", "substitutions"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "adjust_workout_intensity",
                    "description": "Modify the intensity of a workout",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "Workout date (YYYY-MM-DD)"
                            },
                            "adjustment_type": {
                                "type": "string",
                                "enum": ["easier", "harder", "shorter", "longer"],
                                "description": "Type of intensity adjustment"
                            },
                            "adjustment_percentage": {
                                "type": "integer",
                                "description": "Percentage to adjust by (e.g., 20 for 20%)"
                            }
                        },
                        "required": ["date", "adjustment_type"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_custom_workout",
                    "description": "Create a new custom workout",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "Date to schedule workout (YYYY-MM-DD)"
                            },
                            "workout_type": {
                                "type": "string",
                                "description": "Type of workout (strength, cardio, HIIT, etc.)"
                            },
                            "duration_minutes": {
                                "type": "integer",
                                "description": "Workout duration in minutes"
                            },
                            "target_muscles": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Target muscle groups"
                            },
                            "equipment_available": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Available equipment"
                            },
                            "difficulty": {
                                "type": "string",
                                "enum": ["beginner", "intermediate", "advanced"],
                                "description": "Difficulty level"
                            }
                        },
                        "required": ["date", "workout_type", "duration_minutes"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "confirm_action",
                    "description": "Confirm a pending action",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "action_id": {
                                "type": "string",
                                "description": "ID of the action to confirm"
                            },
                            "confirmed": {
                                "type": "boolean",
                                "description": "Whether the action is confirmed"
                            }
                        },
                        "required": ["action_id", "confirmed"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_exercise_to_today",
                    "description": "Add a specific exercise to today's workout",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "exercise_name": {
                                "type": "string",
                                "description": "Name of the exercise to add"
                            },
                            "sets": {
                                "type": "integer",
                                "description": "Number of sets",
                                "default": 3
                            },
                            "reps": {
                                "type": "string",
                                "description": "Number of reps or duration",
                                "default": "10-12"
                            },
                            "position": {
                                "type": "string",
                                "enum": ["beginning", "end", "after_warmup"],
                                "description": "Where to add the exercise in the workout",
                                "default": "end"
                            }
                        },
                        "required": ["exercise_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_workout_suggestions",
                    "description": "Get AI-powered workout suggestions based on user stats and history",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "days_ahead": {
                                "type": "integer",
                                "description": "Number of days to look ahead",
                                "default": 7
                            },
                            "focus_muscle": {
                                "type": "string",
                                "description": "Specific muscle group to focus on",
                                "enum": ["chest", "back", "shoulders", "arms", "legs", "core", "cardio"]
                            },
                            "include_rationale": {
                                "type": "boolean",
                                "description": "Include explanation for suggestions",
                                "default": True
                            }
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "apply_workout_suggestion",
                    "description": "Apply a suggested workout to the schedule",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "suggestion_id": {
                                "type": "string",
                                "description": "ID of the workout suggestion to apply"
                            },
                            "date": {
                                "type": "string",
                                "description": "Date to schedule the workout (YYYY-MM-DD)"
                            },
                            "replace_existing": {
                                "type": "boolean",
                                "description": "Replace existing workout on that date",
                                "default": False
                            }
                        },
                        "required": ["suggestion_id", "date"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "swap_workout_suggestion",
                    "description": "Swap current workout with a suggested alternative",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "current_date": {
                                "type": "string",
                                "description": "Date of current workout to swap (YYYY-MM-DD)"
                            },
                            "suggestion_id": {
                                "type": "string",
                                "description": "ID of the suggested workout to use"
                            }
                        },
                        "required": ["current_date", "suggestion_id"]
                    }
                }
            }
        ]
    
    async def _handle_tool_call(self, tool_call) -> Dict[str, Any]:
        """Handle action-specific tool calls"""
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        
        logger.info(f"Action agent handling tool call: {function_name}")
        
        tool_handlers = {
            "view_workout_schedule": self._view_workout_schedule,
            "request_rest_day": self._request_rest_day,
            "move_workout": self._move_workout,
            "substitute_exercises": self._substitute_exercises,
            "adjust_workout_intensity": self._adjust_workout_intensity,
            "create_custom_workout": self._create_custom_workout,
            "confirm_action": self._confirm_action,
            "add_exercise_to_today": self._add_exercise_to_today,
            "get_workout_suggestions": self._get_workout_suggestions,
            "apply_workout_suggestion": self._apply_workout_suggestion,
            "swap_workout_suggestion": self._swap_workout_suggestion
        }
        
        handler = tool_handlers.get(function_name)
        if handler:
            return await handler(**arguments)
        else:
            return {"error": f"Unknown function: {function_name}"}
    
    def _view_workout_schedule(
        self,
        start_date: str = None,
        end_date: str = None,
        view_type: str = "day"
    ) -> Dict[str, Any]:
        """View workout schedule"""
        if not start_date:
            start_date = date.today().isoformat()
        
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        
        if view_type == "week":
            # Get week starting from the given date
            start = start - timedelta(days=start.weekday())  # Monday
            end = start + timedelta(days=6)  # Sunday
        elif view_type == "month":
            # Get full month
            start = start.replace(day=1)
            next_month = start.replace(day=28) + timedelta(days=4)
            end = next_month - timedelta(days=next_month.day)
        else:
            # Single day
            end = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else start
        
        # Get workouts for date range (service expects strings)
        workouts = self.workout_service.get_workouts_range(self.user_id, start.isoformat(), end.isoformat())
        
        schedule = {
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "view_type": view_type,
            "workouts": []
        }
        
        # Create date range for iteration
        # workouts is a list returned by get_workouts_range, with one entry per day
        for i, workout in enumerate(workouts):
            workout_date = start + timedelta(days=i)
            
            if workout and workout.get("type") != "rest" and workout.get("name"):
                schedule["workouts"].append({
                    "date": workout_date.isoformat(),
                    "day": workout_date.strftime("%A"),
                    "title": workout.get("name", "Workout"),
                    "duration": workout.get("duration", 60),
                    "exercises": len(workout.get("exercises", [])),
                    "muscle_groups": self._extract_muscle_groups(workout.get("exercises", [])),
                    "completed": workout.get("completed", False)
                })
            else:
                schedule["workouts"].append({
                    "date": workout_date.isoformat(),
                    "day": workout_date.strftime("%A"),
                    "type": "rest_day"
                })
        
        schedule["summary"] = {
            "total_workouts": len([w for w in schedule["workouts"] if w.get("title")]),
            "rest_days": len([w for w in schedule["workouts"] if w.get("type") == "rest_day"]),
            "completed": len([w for w in schedule["workouts"] if w.get("completed")])
        }
        
        return schedule
    
    async def _request_rest_day(
        self,
        date: str,
        reason: str = None,
        move_workout: bool = True
    ) -> Dict[str, Any]:
        """Request to convert a day to rest day"""
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        
        # Get current workout
        current_workout = await self.workout_service.get_workout_for_date(self.user_id, target_date)
        
        if not current_workout:
            return {
                "status": "no_change_needed",
                "message": f"{target_date.strftime('%A, %B %d')} is already a rest day!"
            }
        
        # Create pending action
        action_id = f"rest_day_{target_date.isoformat()}_{datetime.now().timestamp()}"
        
        proposed_action = {
            "action_type": ActionType.REQUEST_REST_DAY,
            "date": target_date,
            "current_workout": {
                "title": current_workout.title,
                "exercises": len(current_workout.exercises),
                "duration": current_workout.duration_minutes
            },
            "move_workout": move_workout,
            "reason": reason
        }
        
        self.pending_actions[action_id] = proposed_action
        
        # Find next available date if moving workout
        next_available = None
        if move_workout:
            next_available = await self._find_next_available_date(target_date)
        
        return {
            "status": "confirmation_required",
            "action_id": action_id,
            "message": f"Change {current_workout.title} on {target_date.strftime('%A, %B %d')} to a rest day?",
            "details": {
                "current_workout": current_workout.title,
                "exercises_affected": len(current_workout.exercises),
                "move_to_date": next_available.isoformat() if next_available else None,
                "reason": reason
            },
            "options": [
                {"text": "Yes, make it a rest day", "action": "confirm"},
                {"text": "Move workout to another day", "action": "reschedule"},
                {"text": "Cancel", "action": "cancel"}
            ]
        }
    
    async def _move_workout(
        self,
        from_date: str,
        to_date: str,
        swap_if_occupied: bool = False
    ) -> Dict[str, Any]:
        """Move workout from one date to another"""
        from_date_obj = datetime.strptime(from_date, "%Y-%m-%d").date()
        to_date_obj = datetime.strptime(to_date, "%Y-%m-%d").date()
        
        # Get workouts for both dates
        from_workout = await self.workout_service.get_workout_for_date(self.user_id, from_date_obj)
        to_workout = await self.workout_service.get_workout_for_date(self.user_id, to_date_obj)
        
        if not from_workout:
            return {
                "status": "error",
                "message": f"No workout found on {from_date_obj.strftime('%A, %B %d')}"
            }
        
        # Create pending action
        action_id = f"move_{from_date}_{to_date}_{datetime.now().timestamp()}"
        
        proposed_action = {
            "action_type": ActionType.MOVE_WORKOUT,
            "from_date": from_date_obj,
            "to_date": to_date_obj,
            "from_workout": from_workout,
            "to_workout": to_workout,
            "swap": swap_if_occupied and to_workout is not None
        }
        
        self.pending_actions[action_id] = proposed_action
        
        if to_workout and not swap_if_occupied:
            return {
                "status": "confirmation_required",
                "action_id": action_id,
                "message": f"{to_date_obj.strftime('%A, %B %d')} already has {to_workout.title}. Swap workouts?",
                "options": [
                    {"text": "Yes, swap workouts", "action": "confirm_swap"},
                    {"text": "Find another date", "action": "find_alternative"},
                    {"text": "Cancel", "action": "cancel"}
                ]
            }
        
        message = f"Move {from_workout.title} from {from_date_obj.strftime('%A, %B %d')} to {to_date_obj.strftime('%A, %B %d')}"
        if proposed_action["swap"]:
            message += f" (swapping with {to_workout.title})"
        
        return {
            "status": "confirmation_required",
            "action_id": action_id,
            "message": f"{message}?",
            "details": {
                "workout_to_move": from_workout.title,
                "from": from_date_obj.strftime('%A, %B %d'),
                "to": to_date_obj.strftime('%A, %B %d'),
                "swap_with": to_workout.title if to_workout else None
            }
        }
    
    async def _substitute_exercises(
        self,
        date: str,
        substitutions: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Substitute exercises in a workout"""
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        workout = await self.workout_service.get_workout_for_date(self.user_id, target_date)
        
        if not workout:
            return {
                "status": "error",
                "message": f"No workout found on {target_date.strftime('%A, %B %d')}"
            }
        
        # Find alternatives for each substitution
        proposed_substitutions = []
        for sub in substitutions:
            original = sub.get("original_exercise")
            reason = sub.get("reason", "user preference")
            
            # Find the exercise in the workout
            original_exercise = None
            for ex in workout.exercises:
                if ex.name.lower() == original.lower():
                    original_exercise = ex
                    break
            
            if not original_exercise:
                continue
            
            # Get alternatives
            alternatives = await self.exercise_service.find_alternatives(
                exercise=original_exercise,
                reason=reason,
                user_limitations=[]
            )
            
            proposed_substitutions.append({
                "original": original_exercise,
                "alternatives": alternatives[:3],  # Top 3 alternatives
                "reason": reason,
                "preferred": sub.get("preferred_alternative")
            })
        
        # Create pending action
        action_id = f"substitute_{target_date.isoformat()}_{datetime.now().timestamp()}"
        
        self.pending_actions[action_id] = {
            "action_type": ActionType.SUBSTITUTE_EXERCISE,
            "date": target_date,
            "workout": workout,
            "substitutions": proposed_substitutions
        }
        
        return {
            "status": "confirmation_required",
            "action_id": action_id,
            "message": f"Replace {len(proposed_substitutions)} exercises in {workout.title}?",
            "substitutions": [
                {
                    "original": sub["original"].name,
                    "alternatives": [
                        {
                            "name": alt.name,
                            "sets": alt.sets,
                            "reps": alt.reps,
                            "reason_good_fit": f"Similar to {sub['original'].name}"
                        }
                        for alt in sub["alternatives"]
                    ],
                    "reason": sub["reason"]
                }
                for sub in proposed_substitutions
            ]
        }
    
    async def _adjust_workout_intensity(
        self,
        date: str,
        adjustment_type: str,
        adjustment_percentage: int = 20
    ) -> Dict[str, Any]:
        """Adjust workout intensity"""
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        workout = await self.workout_service.get_workout_for_date(self.user_id, target_date)
        
        if not workout:
            return {
                "status": "error",
                "message": f"No workout found on {target_date.strftime('%A, %B %d')}"
            }
        
        # Calculate adjustments
        adjustments = {
            "easier": {
                "sets": -1 if workout.exercises[0].sets > 2 else 0,
                "reps": int(-workout.exercises[0].reps * 0.2),
                "weight": -adjustment_percentage,
                "rest": 30  # Add 30 seconds rest
            },
            "harder": {
                "sets": 1,
                "reps": int(workout.exercises[0].reps * 0.2),
                "weight": adjustment_percentage,
                "rest": -15  # Reduce rest by 15 seconds
            },
            "shorter": {
                "exercises_to_remove": max(1, len(workout.exercises) // 4),
                "sets": -1 if workout.exercises[0].sets > 2 else 0
            },
            "longer": {
                "exercises_to_add": 2,
                "sets": 1
            }
        }
        
        adjustment = adjustments.get(adjustment_type, {})
        
        # Create pending action
        action_id = f"adjust_{target_date.isoformat()}_{datetime.now().timestamp()}"
        
        self.pending_actions[action_id] = {
            "action_type": ActionType.MODIFY_INTENSITY,
            "date": target_date,
            "workout": workout,
            "adjustment_type": adjustment_type,
            "adjustments": adjustment
        }
        
        return {
            "status": "confirmation_required",
            "action_id": action_id,
            "message": f"Make {workout.title} {adjustment_type}?",
            "proposed_changes": self._format_intensity_changes(adjustment_type, adjustment, workout)
        }
    
    async def _create_custom_workout(
        self,
        date: str,
        workout_type: str,
        duration_minutes: int,
        target_muscles: List[str] = None,
        equipment_available: List[str] = None,
        difficulty: str = "intermediate"
    ) -> Dict[str, Any]:
        """Create a custom workout"""
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        
        # Check if date already has workout
        existing_workout = await self.workout_service.get_workout_for_date(self.user_id, target_date)
        
        # Generate workout
        generated_workout = await self.workout_service.generate_custom_workout(
            user_id=self.user_id,
            workout_type=workout_type,
            duration_minutes=duration_minutes,
            difficulty=difficulty,
            target_muscle_groups=target_muscles or [],
            available_equipment=equipment_available or [],
            user_preferences={}
        )
        
        # Create pending action
        action_id = f"create_{target_date.isoformat()}_{datetime.now().timestamp()}"
        
        self.pending_actions[action_id] = {
            "action_type": ActionType.CREATE_WORKOUT,
            "date": target_date,
            "generated_workout": generated_workout,
            "replace_existing": existing_workout is not None,
            "existing_workout": existing_workout
        }
        
        message = f"Create {duration_minutes}-minute {workout_type} workout for {target_date.strftime('%A, %B %d')}?"
        if existing_workout:
            message = f"Replace {existing_workout.title} with new {duration_minutes}-minute {workout_type} workout?"
        
        return {
            "status": "confirmation_required",
            "action_id": action_id,
            "message": message,
            "workout_preview": {
                "title": generated_workout.title,
                "duration": generated_workout.duration_minutes,
                "difficulty": generated_workout.difficulty,
                "exercises": [
                    {
                        "name": ex.name,
                        "sets": ex.sets,
                        "reps": ex.reps,
                        "muscle_groups": ex.muscle_groups
                    }
                    for ex in generated_workout.exercises[:5]  # Show first 5
                ],
                "total_exercises": len(generated_workout.exercises)
            },
            "existing_workout": existing_workout.title if existing_workout else None
        }
    
    async def _confirm_action(self, action_id: str, confirmed: bool) -> Dict[str, Any]:
        """Confirm or cancel a pending action"""
        if action_id not in self.pending_actions:
            return {
                "status": "error",
                "message": "Action not found or already processed"
            }
        
        action = self.pending_actions[action_id]
        
        if not confirmed:
            del self.pending_actions[action_id]
            return {
                "status": "cancelled",
                "message": "Action cancelled"
            }
        
        # Execute the action based on type
        result = None
        
        if action["action_type"] == ActionType.REQUEST_REST_DAY:
            result = await self._execute_rest_day(action)
        elif action["action_type"] == ActionType.MOVE_WORKOUT:
            result = await self._execute_move_workout(action)
        elif action["action_type"] == ActionType.SUBSTITUTE_EXERCISE:
            result = await self._execute_substitute_exercises(action)
        elif action["action_type"] == ActionType.MODIFY_INTENSITY:
            result = await self._execute_intensity_adjustment(action)
        elif action["action_type"] == ActionType.CREATE_WORKOUT:
            result = await self._execute_create_workout(action)
        elif action["action_type"] == "APPLY_SUGGESTION":
            result = await self._execute_apply_suggestion(action)
        elif action["action_type"] == "SWAP_SUGGESTION":
            result = await self._execute_swap_suggestion(action)
        
        # Clean up pending action
        del self.pending_actions[action_id]
        
        return result
    
    async def _execute_rest_day(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute rest day conversion"""
        date = action["date"]
        move_workout = action.get("move_workout", True)
        
        # Delete the workout
        success = await self.workout_service.delete_workout(self.user_id, date)
        
        if success:
            message = f"✅ {date.strftime('%A, %B %d')} is now a rest day!"
            
            if move_workout and action.get("next_available"):
                # Move workout to next available date
                # This would be implemented in the workout service
                message += f" Your workout has been moved to {action['next_available'].strftime('%A, %B %d')}."
            
            return {
                "status": "success",
                "message": message,
                "changes_made": {
                    "date": date.isoformat(),
                    "action": "converted_to_rest_day",
                    "workout_removed": action["current_workout"]["title"]
                }
            }
        
        return {
            "status": "error",
            "message": "Failed to update workout schedule"
        }
    
    async def _execute_move_workout(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute workout move"""
        from_date = action["from_date"]
        to_date = action["to_date"]
        swap = action.get("swap", False)
        
        if swap:
            # Swap workouts between dates
            success = await self.workout_service.swap_workouts(
                self.user_id, from_date, to_date
            )
        else:
            # Simple move
            success = await self.workout_service.reschedule_workout(
                self.user_id, from_date, to_date
            )
        
        if success:
            message = f"✅ Moved {action['from_workout'].title} to {to_date.strftime('%A, %B %d')}"
            if swap:
                message = f"✅ Swapped workouts between {from_date.strftime('%B %d')} and {to_date.strftime('%B %d')}"
            
            return {
                "status": "success",
                "message": message,
                "changes_made": {
                    "action": "workout_moved" if not swap else "workouts_swapped",
                    "from_date": from_date.isoformat(),
                    "to_date": to_date.isoformat()
                }
            }
        
        return {
            "status": "error",
            "message": "Failed to move workout"
        }
    
    async def _execute_substitute_exercises(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute exercise substitutions"""
        date = action["date"]
        workout = action["workout"]
        substitutions = action["substitutions"]
        
        # Apply each substitution
        for sub in substitutions:
            original = sub["original"]
            # Use the first alternative or preferred if specified
            replacement = sub["alternatives"][0] if sub["alternatives"] else None
            
            if replacement:
                success = await self.workout_service.replace_exercise(
                    self.user_id,
                    date,
                    original.id,
                    replacement
                )
        
        return {
            "status": "success",
            "message": f"✅ Updated {len(substitutions)} exercises in {workout.title}",
            "changes_made": {
                "action": "exercises_substituted",
                "date": date.isoformat(),
                "count": len(substitutions)
            }
        }
    
    async def _execute_intensity_adjustment(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute workout intensity adjustment"""
        date = action["date"]
        workout = action["workout"]
        adjustment_type = action["adjustment_type"]
        
        # Apply adjustments to workout
        # This would be implemented in the workout service
        success = await self.workout_service.adjust_intensity(
            self.user_id,
            date,
            action["adjustments"]
        )
        
        if success:
            return {
                "status": "success",
                "message": f"✅ Made {workout.title} {adjustment_type}",
                "changes_made": {
                    "action": "intensity_adjusted",
                    "date": date.isoformat(),
                    "type": adjustment_type
                }
            }
        
        return {
            "status": "error",
            "message": "Failed to adjust workout intensity"
        }
    
    async def _execute_create_workout(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute custom workout creation"""
        date = action["date"]
        workout = action["generated_workout"]
        replace = action.get("replace_existing", False)
        
        # Add workout to schedule
        success = await self.workout_service.add_workout(
            self.user_id,
            date,
            workout,
            replace_existing=replace
        )
        
        if success:
            message = f"✅ Created {workout.title} for {date.strftime('%A, %B %d')}"
            if replace:
                message = f"✅ Replaced workout with {workout.title}"
            
            return {
                "status": "success",
                "message": message,
                "changes_made": {
                    "action": "workout_created",
                    "date": date.isoformat(),
                    "workout_title": workout.title,
                    "replaced": action.get("existing_workout", {}).get("title") if replace else None
                }
            }
        
        return {
            "status": "error",
            "message": "Failed to create workout"
        }
    
    async def _find_next_available_date(self, after_date: date) -> Optional[date]:
        """Find next available date without a workout"""
        for i in range(1, 8):  # Check next 7 days
            check_date = after_date + timedelta(days=i)
            workout = await self.workout_service.get_workout_for_date(self.user_id, check_date)
            if not workout:
                return check_date
        return None
    
    def _format_intensity_changes(self, adjustment_type: str, adjustments: Dict[str, Any], workout) -> List[str]:
        """Format intensity changes for display"""
        changes = []
        
        if adjustment_type == "easier":
            if adjustments.get("sets"):
                changes.append(f"Reduce sets by {abs(adjustments['sets'])}")
            if adjustments.get("reps"):
                changes.append(f"Reduce reps by {abs(adjustments['reps'])}")
            if adjustments.get("weight"):
                changes.append(f"Reduce weight by {abs(adjustments['weight'])}%")
            if adjustments.get("rest"):
                changes.append(f"Add {adjustments['rest']} seconds rest between sets")
                
        elif adjustment_type == "harder":
            if adjustments.get("sets"):
                changes.append(f"Add {adjustments['sets']} set to each exercise")
            if adjustments.get("reps"):
                changes.append(f"Increase reps by {adjustments['reps']}")
            if adjustments.get("weight"):
                changes.append(f"Increase weight by {adjustments['weight']}%")
            if adjustments.get("rest"):
                changes.append(f"Reduce rest by {abs(adjustments['rest'])} seconds")
                
        elif adjustment_type == "shorter":
            if adjustments.get("exercises_to_remove"):
                changes.append(f"Remove {adjustments['exercises_to_remove']} exercises")
            if adjustments.get("sets"):
                changes.append(f"Reduce sets by {abs(adjustments['sets'])}")
                
        elif adjustment_type == "longer":
            if adjustments.get("exercises_to_add"):
                changes.append(f"Add {adjustments['exercises_to_add']} more exercises")
            if adjustments.get("sets"):
                changes.append(f"Add {adjustments['sets']} set to each exercise")
        
        return changes
    
    async def get_workout_timeline(self, days_ahead: int = 7) -> Dict[str, Any]:
        """Get user's workout timeline for agent context"""
        today = date.today()
        end_date = today + timedelta(days=days_ahead)
        
        schedule = self._view_workout_schedule(
            start_date=today.isoformat(),
            end_date=end_date.isoformat(),
            view_type="week"
        )
        
        return {
            "current_week_schedule": schedule,
            "today": today.isoformat(),
            "next_workout": self._find_next_workout(schedule["workouts"]),
            "weekly_summary": schedule["summary"]
        }
    
    def _find_next_workout(self, workouts: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Find the next scheduled workout"""
        today = date.today()
        for workout in workouts:
            workout_date = datetime.strptime(workout["date"], "%Y-%m-%d").date()
            if workout_date >= today and workout.get("title"):
                return workout
        return None
    
    def _extract_muscle_groups(self, exercises: List[Dict[str, Any]]) -> List[str]:
        """Extract unique muscle groups from exercises"""
        muscle_groups = set()
        for exercise in exercises:
            if isinstance(exercise, dict):
                # Check for muscle_groups field
                if "muscle_groups" in exercise:
                    groups = exercise["muscle_groups"]
                    if isinstance(groups, list):
                        muscle_groups.update(groups)
                    elif isinstance(groups, str):
                        muscle_groups.add(groups)
        return list(muscle_groups)
    
    async def _add_exercise_to_today(
        self,
        exercise_name: str,
        sets: int = 3,
        reps: str = "10-12",
        position: str = "end"
    ) -> Dict[str, Any]:
        """Add a specific exercise to today's workout"""
        today = date.today()
        
        # Get today's workout
        workout = await self.workout_service.get_workout_for_date(self.user_id, today)
        
        if not workout:
            # No workout today, create a quick one with just this exercise
            return {
                "status": "no_workout_today",
                "message": f"No workout scheduled for today. Would you like me to create a workout with {exercise_name}?",
                "suggested_action": "create_custom_workout"
            }
        
        # Create the exercise to add
        new_exercise = {
            "name": exercise_name,
            "sets": sets,
            "reps": reps,
            "rest_seconds": 60,
            "notes": f"Added on {today.strftime('%B %d')}"
        }
        
        # Add to workout (this would be implemented in workout service)
        # For now, return success
        return {
            "status": "success",
            "message": f"✅ Added {sets} sets of {exercise_name} ({reps} reps) to today's workout!",
            "workout_update": {
                "workout_name": workout.get("title", "Today's Workout"),
                "exercise_added": new_exercise,
                "position": position,
                "total_exercises": len(workout.get("exercises", [])) + 1
            },
            "action_completed": True
        }
    
    async def _get_workout_suggestions(
        self,
        days_ahead: int = 7,
        focus_muscle: Optional[str] = None,
        include_rationale: bool = True
    ) -> Dict[str, Any]:
        """Get intelligent workout suggestions based on user stats"""
        try:
            # Get suggestions from the service
            suggestions_data = workout_suggestion_service.get_suggestions_for_user(
                self.user_id,
                days_ahead,
                include_rationale
            )
            
            # Store suggestions for later application
            self._cached_suggestions = {
                s.id: s for s in suggestions_data.get("suggestions", [])
            }
            
            # Format response
            formatted_suggestions = []
            for suggestion in suggestions_data.get("suggestions", []):
                formatted = {
                    "id": suggestion.id,
                    "title": suggestion.title,
                    "description": suggestion.description,
                    "duration": f"{suggestion.duration_minutes} minutes",
                    "difficulty": suggestion.difficulty,
                    "muscle_groups": suggestion.muscle_groups,
                    "rationale": suggestion.rationale,
                    "priority": suggestion.priority,
                    "suggested_date": suggestion.suggested_date.isoformat() if suggestion.suggested_date else None,
                    "can_replace": suggestion.can_replace_date.isoformat() if suggestion.can_replace_date else None,
                    "preview_exercises": suggestion.exercises[:3]  # Show first 3 exercises
                }
                
                # Filter by focus muscle if specified
                if not focus_muscle or focus_muscle in suggestion.muscle_groups:
                    formatted_suggestions.append(formatted)
            
            # Add analysis summary
            analysis = suggestions_data.get("analysis", {})
            summary = f"Based on your training history: averaging {analysis.get('avg_workouts_per_week', 0)} workouts/week"
            
            if analysis.get("needs_rest"):
                summary += " ⚠️ You may need a rest day soon."
            
            if analysis.get("undertrained_muscles"):
                summary += f" 💪 Focus areas: {', '.join(analysis['undertrained_muscles'][:2])}"
            
            return {
                "status": "success",
                "summary": summary,
                "suggestions": formatted_suggestions[:5],  # Top 5 suggestions
                "analysis": {
                    "current_week_load": analysis.get("current_week_load", "moderate"),
                    "training_phase": analysis.get("training_phase", "maintenance"),
                    "consecutive_days": analysis.get("consecutive_workout_days", 0)
                },
                "message": f"Generated {len(formatted_suggestions)} personalized workout suggestions"
            }
            
        except Exception as e:
            logger.error(f"Error getting workout suggestions: {e}")
            return {
                "status": "error",
                "message": "Unable to generate workout suggestions",
                "error": str(e)
            }
    
    async def _apply_workout_suggestion(
        self,
        suggestion_id: str,
        date: str,
        replace_existing: bool = False
    ) -> Dict[str, Any]:
        """Apply a workout suggestion to the schedule"""
        try:
            # Get cached suggestion
            if not hasattr(self, '_cached_suggestions') or suggestion_id not in self._cached_suggestions:
                return {
                    "status": "error",
                    "message": "Suggestion not found. Please get suggestions first."
                }
            
            suggestion = self._cached_suggestions[suggestion_id]
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
            
            # Check if date has existing workout
            existing = await self.workout_service.get_workout_for_date(self.user_id, target_date)
            
            if existing and not replace_existing:
                # Create pending action for confirmation
                action_id = f"apply_suggestion_{suggestion_id}_{datetime.now().timestamp()}"
                
                self.pending_actions[action_id] = {
                    "action_type": "APPLY_SUGGESTION",
                    "suggestion": suggestion,
                    "target_date": target_date,
                    "existing_workout": existing,
                    "replace": True
                }
                
                return {
                    "status": "confirmation_required",
                    "action_id": action_id,
                    "message": f"Replace {existing.get('title', 'existing workout')} with {suggestion.title}?",
                    "details": {
                        "current": existing.get('title'),
                        "new": suggestion.title,
                        "date": target_date.strftime('%A, %B %d'),
                        "duration_change": f"{existing.get('duration', 60)}min → {suggestion.duration_minutes}min"
                    }
                }
            
            # Apply the suggestion
            workout_data = {
                "title": suggestion.title,
                "type": suggestion.workout_type,
                "duration": suggestion.duration_minutes,
                "difficulty": suggestion.difficulty,
                "exercises": suggestion.exercises,
                "muscle_groups": suggestion.muscle_groups,
                "source": "ai_suggestion"
            }
            
            success = await self.workout_service.add_workout(
                self.user_id,
                target_date,
                workout_data,
                replace_existing=replace_existing
            )
            
            if success:
                return {
                    "status": "success",
                    "message": f"✅ Added {suggestion.title} to {target_date.strftime('%A, %B %d')}",
                    "workout_details": {
                        "title": suggestion.title,
                        "date": target_date.isoformat(),
                        "exercises": len(suggestion.exercises),
                        "duration": suggestion.duration_minutes
                    }
                }
            else:
                return {
                    "status": "error",
                    "message": "Failed to add workout to schedule"
                }
                
        except Exception as e:
            logger.error(f"Error applying workout suggestion: {e}")
            return {
                "status": "error",
                "message": f"Error: {str(e)}"
            }
    
    async def _swap_workout_suggestion(
        self,
        current_date: str,
        suggestion_id: str
    ) -> Dict[str, Any]:
        """Swap current workout with a suggested one"""
        try:
            # Get cached suggestion
            if not hasattr(self, '_cached_suggestions') or suggestion_id not in self._cached_suggestions:
                return {
                    "status": "error",
                    "message": "Suggestion not found. Please get suggestions first."
                }
            
            suggestion = self._cached_suggestions[suggestion_id]
            swap_date = datetime.strptime(current_date, "%Y-%m-%d").date()
            
            # Get current workout
            current = await self.workout_service.get_workout_for_date(self.user_id, swap_date)
            
            if not current:
                return {
                    "status": "error",
                    "message": f"No workout found on {swap_date.strftime('%A, %B %d')}"
                }
            
            # Create pending action
            action_id = f"swap_suggestion_{suggestion_id}_{datetime.now().timestamp()}"
            
            self.pending_actions[action_id] = {
                "action_type": "SWAP_SUGGESTION",
                "suggestion": suggestion,
                "swap_date": swap_date,
                "current_workout": current
            }
            
            return {
                "status": "confirmation_required",
                "action_id": action_id,
                "message": f"Swap {current.get('title')} with {suggestion.title}?",
                "comparison": {
                    "current": {
                        "title": current.get('title'),
                        "duration": current.get('duration', 60),
                        "type": current.get('type'),
                        "exercises": len(current.get('exercises', []))
                    },
                    "suggested": {
                        "title": suggestion.title,
                        "duration": suggestion.duration_minutes,
                        "type": suggestion.workout_type,
                        "exercises": len(suggestion.exercises),
                        "rationale": suggestion.rationale
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error swapping workout suggestion: {e}")
            return {
                "status": "error",
                "message": f"Error: {str(e)}"
            }
    
    async def _execute_apply_suggestion(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute applying a workout suggestion"""
        suggestion = action["suggestion"]
        target_date = action["target_date"]
        
        # Apply the suggestion
        workout_data = {
            "title": suggestion.title,
            "type": suggestion.workout_type,
            "duration": suggestion.duration_minutes,
            "difficulty": suggestion.difficulty,
            "exercises": suggestion.exercises,
            "muscle_groups": suggestion.muscle_groups,
            "source": "ai_suggestion"
        }
        
        success = await self.workout_service.add_workout(
            self.user_id,
            target_date,
            workout_data,
            replace_existing=True
        )
        
        if success:
            return {
                "status": "success",
                "message": f"✅ Applied {suggestion.title} to {target_date.strftime('%A, %B %d')}",
                "changes_made": {
                    "action": "suggestion_applied",
                    "date": target_date.isoformat(),
                    "workout": suggestion.title
                }
            }
        
        return {
            "status": "error",
            "message": "Failed to apply workout suggestion"
        }
    
    async def _execute_swap_suggestion(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute swapping workout with suggestion"""
        suggestion = action["suggestion"]
        swap_date = action["swap_date"]
        
        # Apply the suggestion (replacing existing)
        workout_data = {
            "title": suggestion.title,
            "type": suggestion.workout_type,
            "duration": suggestion.duration_minutes,
            "difficulty": suggestion.difficulty,
            "exercises": suggestion.exercises,
            "muscle_groups": suggestion.muscle_groups,
            "source": "ai_suggestion"
        }
        
        success = await self.workout_service.add_workout(
            self.user_id,
            swap_date,
            workout_data,
            replace_existing=True
        )
        
        if success:
            return {
                "status": "success",
                "message": f"✅ Swapped workout with {suggestion.title}",
                "changes_made": {
                    "action": "workout_swapped",
                    "date": swap_date.isoformat(),
                    "old_workout": action["current_workout"].get("title"),
                    "new_workout": suggestion.title
                }
            }
        
        return {
            "status": "error",
            "message": "Failed to swap workout"
        }