"""
AI-Powered Action Extractor
Uses AI to intelligently extract actionable items from agent responses
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import re
from enum import Enum

from utils.logger import setup_logger

logger = setup_logger(__name__)

class ActionType(Enum):
    ADD_WORKOUT = "add_workout"
    MODIFY_WORKOUT = "modify_workout"
    SCHEDULE_WORKOUT = "schedule_workout"
    REMOVE_WORKOUT = "remove_workout"
    SCHEDULE_REST = "schedule_rest"
    SUBSTITUTE_EXERCISES = "substitute_exercises"
    CREATE_MEAL_PLAN = "create_meal_plan"
    UPDATE_GOALS = "update_goals"
    VIEW_PROGRESS = "view_progress"
    INCREASE_DIFFICULTY = "increase_difficulty"
    DECREASE_DIFFICULTY = "decrease_difficulty"
    GET_SUGGESTIONS = "get_suggestions"
    APPLY_SUGGESTION = "apply_suggestion"
    SWAP_WORKOUT = "swap_workout"

class AIActionExtractor:
    """
    Intelligently extracts actionable items from AI responses
    """
    
    def __init__(self):
        self.action_patterns = self._initialize_patterns()
    
    def _initialize_patterns(self) -> Dict[ActionType, List[Dict[str, Any]]]:
        """Initialize pattern matching for action extraction"""
        return {
            ActionType.ADD_WORKOUT: [
                {
                    "patterns": [
                        r"add(?:ed|ing)?\s+(?:these?\s+)?workout",
                        r"let's add",
                        r"I'll add",
                        r"adding.*to.*schedule",
                        r"new workout.*created"
                    ],
                    "confidence": 0.9
                }
            ],
            ActionType.MODIFY_WORKOUT: [
                {
                    "patterns": [
                        r"modif(?:y|ied|ying).*workout",
                        r"adjust(?:ed|ing)?.*workout",
                        r"change.*workout",
                        r"replace.*workout",
                        r"update.*workout",
                        r"increase.*difficulty",
                        r"make.*harder",
                        r"step.*up.*workout"
                    ],
                    "confidence": 0.9
                }
            ],
            ActionType.SCHEDULE_WORKOUT: [
                {
                    "patterns": [
                        r"schedule.*workout",
                        r"plan.*for.*tomorrow",
                        r"add.*to.*calendar",
                        r"set.*for.*(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)",
                        r"workout.*tomorrow"
                    ],
                    "confidence": 0.85
                }
            ],
            ActionType.REMOVE_WORKOUT: [
                {
                    "patterns": [
                        r"remove.*workout",
                        r"cancel.*workout",
                        r"skip.*workout",
                        r"delete.*workout",
                        r"take.*off.*schedule"
                    ],
                    "confidence": 0.9
                }
            ],
            ActionType.SCHEDULE_REST: [
                {
                    "patterns": [
                        r"rest day",
                        r"recovery day",
                        r"take.*rest",
                        r"need.*recovery",
                        r"schedule.*rest"
                    ],
                    "confidence": 0.9
                }
            ],
            ActionType.SUBSTITUTE_EXERCISES: [
                {
                    "patterns": [
                        r"substitute.*exercise",
                        r"alternative.*exercise",
                        r"replace.*with.*safer",
                        r"modify.*for.*pain",
                        r"avoid.*exercise",
                        r"low.*impact.*alternative"
                    ],
                    "confidence": 0.85
                }
            ],
            ActionType.INCREASE_DIFFICULTY: [
                {
                    "patterns": [
                        r"increase.*difficulty",
                        r"make.*harder",
                        r"more.*challenging",
                        r"step.*up",
                        r"advance.*workout",
                        r"progress.*to.*harder"
                    ],
                    "confidence": 0.85
                }
            ],
            ActionType.GET_SUGGESTIONS: [
                {
                    "patterns": [
                        r"suggest.*workout",
                        r"recommend.*workout",
                        r"what.*should.*do",
                        r"need.*suggestions",
                        r"give.*me.*ideas",
                        r"workout.*recommendations"
                    ],
                    "confidence": 0.9
                }
            ],
            ActionType.APPLY_SUGGESTION: [
                {
                    "patterns": [
                        r"use.*suggestion",
                        r"apply.*recommendation",
                        r"add.*suggested",
                        r"schedule.*recommended"
                    ],
                    "confidence": 0.85
                }
            ],
            ActionType.SWAP_WORKOUT: [
                {
                    "patterns": [
                        r"swap.*workout",
                        r"replace.*with.*suggested",
                        r"change.*to.*recommendation",
                        r"switch.*workout"
                    ],
                    "confidence": 0.85
                }
            ]
        }
    
    def extract_actions(self, message: str, agent_type: str, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Extract actionable items from a message using AI-like pattern matching
        """
        message_lower = message.lower()
        detected_actions = []
        
        # Check for specific exercise mentions
        exercises = self._extract_exercises(message)
        
        # Check for pain/injury context
        has_pain_context = self._detect_pain_context(message_lower)
        
        # Check for workout modification context
        has_modification_context = self._detect_modification_context(message_lower)
        
        # Analyze message for each action type
        for action_type, pattern_configs in self.action_patterns.items():
            for config in pattern_configs:
                for pattern in config["patterns"]:
                    if re.search(pattern, message_lower):
                        action_item = self._create_action_item(
                            action_type, 
                            agent_type, 
                            config["confidence"],
                            exercises,
                            has_pain_context,
                            has_modification_context,
                            context
                        )
                        if action_item and not self._is_duplicate_action(action_item, detected_actions):
                            detected_actions.append(action_item)
                        break
        
        # If no specific actions detected but we have context, suggest relevant actions
        if not detected_actions:
            detected_actions = self._suggest_contextual_actions(
                message_lower, 
                agent_type, 
                exercises, 
                has_pain_context,
                has_modification_context,
                context
            )
        
        # Sort by priority and confidence
        detected_actions.sort(key=lambda x: (x.get("priority", 99), -x.get("confidence", 0)))
        
        return detected_actions[:5]  # Limit to 5 most relevant actions
    
    def _extract_exercises(self, message: str) -> List[str]:
        """Extract exercise names from message"""
        exercises = []
        
        # Common exercise patterns
        exercise_patterns = [
            r"(?:barbell\s+)?squats?",
            r"(?:dumbbell\s+)?press(?:es)?",
            r"deadlifts?",
            r"lunges?",
            r"push[- ]?ups?",
            r"pull[- ]?ups?",
            r"planks?",
            r"curls?",
            r"rows?",
            r"dips?",
            r"leg\s+press",
            r"bench\s+press",
            r"overhead\s+press",
            r"lateral\s+raises?",
            r"crunches",
            r"burpees"
        ]
        
        message_lower = message.lower()
        for pattern in exercise_patterns:
            matches = re.findall(pattern, message_lower)
            exercises.extend(matches)
        
        return list(set(exercises))  # Remove duplicates
    
    def _detect_pain_context(self, message_lower: str) -> bool:
        """Detect if message mentions pain or injury"""
        pain_keywords = [
            "pain", "hurt", "injury", "injured", "sore", "ache", 
            "strain", "sprain", "discomfort", "uncomfortable"
        ]
        return any(keyword in message_lower for keyword in pain_keywords)
    
    def _detect_modification_context(self, message_lower: str) -> bool:
        """Detect if message is about modifying workouts"""
        modification_keywords = [
            "increase", "decrease", "harder", "easier", "modify", 
            "change", "adjust", "different", "alternative", "substitute"
        ]
        return any(keyword in message_lower for keyword in modification_keywords)
    
    def _create_action_item(
        self, 
        action_type: ActionType, 
        agent_type: str,
        confidence: float,
        exercises: List[str],
        has_pain_context: bool,
        has_modification_context: bool,
        context: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Create a properly formatted action item"""
        
        # Define action configurations
        action_configs = {
            ActionType.ADD_WORKOUT: {
                "label": "Add to Today's Schedule",
                "icon": "add-circle",
                "color": "#4CAF50",
                "priority": 1
            },
            ActionType.MODIFY_WORKOUT: {
                "label": "Modify Current Workout",
                "icon": "create",
                "color": "#FF9800",
                "priority": 1 if has_pain_context else 2
            },
            ActionType.SCHEDULE_WORKOUT: {
                "label": "Schedule for Later",
                "icon": "calendar",
                "color": "#2196F3",
                "priority": 3
            },
            ActionType.REMOVE_WORKOUT: {
                "label": "Cancel Today's Workout",
                "icon": "close-circle",
                "color": "#F44336",
                "priority": 1 if has_pain_context else 3
            },
            ActionType.SCHEDULE_REST: {
                "label": "Take Rest Day",
                "icon": "bed",
                "color": "#4CAF50",
                "priority": 1 if has_pain_context else 2
            },
            ActionType.SUBSTITUTE_EXERCISES: {
                "label": "Get Safe Alternatives",
                "icon": "medkit",
                "color": "#FF9800",
                "priority": 1 if has_pain_context else 2
            },
            ActionType.INCREASE_DIFFICULTY: {
                "label": "Increase Difficulty",
                "icon": "trending-up",
                "color": "#9C27B0",
                "priority": 2
            },
            ActionType.GET_SUGGESTIONS: {
                "label": "Get AI Suggestions",
                "icon": "bulb",
                "color": "#00BCD4",
                "priority": 1
            },
            ActionType.APPLY_SUGGESTION: {
                "label": "Apply Suggestion",
                "icon": "checkmark-circle",
                "color": "#4CAF50",
                "priority": 1
            },
            ActionType.SWAP_WORKOUT: {
                "label": "Swap Workout",
                "icon": "swap-horizontal",
                "color": "#FF9800",
                "priority": 2
            }
        }
        
        config = action_configs.get(action_type)
        if not config:
            return None
        
        action_item = {
            "id": f"{action_type.value}_{datetime.now().timestamp()}",
            "type": action_type.value,
            "label": config["label"],
            "icon": config["icon"],
            "color": config["color"],
            "source": agent_type,
            "priority": config["priority"],
            "confidence": confidence,
            "metadata": {
                "exercises": exercises if exercises else [],
                "has_pain_context": has_pain_context,
                "has_modification_context": has_modification_context,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        # Add context-specific metadata
        if context:
            if "scheduled_workouts" in context:
                action_item["metadata"]["current_workout"] = context["scheduled_workouts"]
        
        return action_item
    
    def _is_duplicate_action(self, action: Dict[str, Any], existing_actions: List[Dict[str, Any]]) -> bool:
        """Check if action is duplicate of existing actions"""
        for existing in existing_actions:
            if existing["type"] == action["type"]:
                return True
        return False
    
    def _suggest_contextual_actions(
        self,
        message_lower: str,
        agent_type: str,
        exercises: List[str],
        has_pain_context: bool,
        has_modification_context: bool,
        context: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Suggest actions based on context when no specific actions detected"""
        suggested_actions = []
        
        # If exercises are mentioned, suggest workout actions
        if exercises:
            suggested_actions.extend([
                self._create_action_item(
                    ActionType.ADD_WORKOUT, agent_type, 0.7, exercises, 
                    has_pain_context, has_modification_context, context
                ),
                self._create_action_item(
                    ActionType.MODIFY_WORKOUT, agent_type, 0.6, exercises,
                    has_pain_context, has_modification_context, context
                ),
                self._create_action_item(
                    ActionType.SCHEDULE_WORKOUT, agent_type, 0.5, exercises,
                    has_pain_context, has_modification_context, context
                )
            ])
        
        # If pain context, suggest safety actions
        if has_pain_context:
            suggested_actions.extend([
                self._create_action_item(
                    ActionType.REMOVE_WORKOUT, agent_type, 0.8, exercises,
                    has_pain_context, has_modification_context, context
                ),
                self._create_action_item(
                    ActionType.SUBSTITUTE_EXERCISES, agent_type, 0.8, exercises,
                    has_pain_context, has_modification_context, context
                ),
                self._create_action_item(
                    ActionType.SCHEDULE_REST, agent_type, 0.7, exercises,
                    has_pain_context, has_modification_context, context
                )
            ])
        
        # If modification context, suggest adjustment actions
        if has_modification_context and "increase" in message_lower:
            suggested_actions.append(
                self._create_action_item(
                    ActionType.INCREASE_DIFFICULTY, agent_type, 0.7, exercises,
                    has_pain_context, has_modification_context, context
                )
            )
        
        # Filter out None values
        return [action for action in suggested_actions if action is not None]

# Global instance
ai_action_extractor = AIActionExtractor()