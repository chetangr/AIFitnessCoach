"""
Streaming Multi-Agent Coordinator for faster responses
"""
from typing import Dict, Any, Optional, AsyncIterator
import asyncio
import json
from datetime import datetime

from agents.openai_fitness_coach_agent import OpenAIFitnessCoachAgent, CoachPersonality
from agents.multi_agent_coordinator import AgentType, AgentResponse
from utils.logger import setup_logger

logger = setup_logger(__name__)

class StreamingCoordinator:
    """
    A simplified coordinator that streams responses for faster perceived speed
    """
    
    def __init__(self, api_key: str, user_id: str, personality: str = CoachPersonality.SUPPORTIVE):
        self.api_key = api_key
        self.user_id = user_id
        self.personality = personality
        
        # Only initialize primary coach for fast responses
        self.primary_coach = OpenAIFitnessCoachAgent(
            api_key=api_key,
            user_id=user_id,
            personality=personality
        )
    
    async def stream_response(
        self, 
        query: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Stream responses chunk by chunk for faster perceived response
        """
        try:
            # First, yield that we're starting
            yield {
                "type": "start",
                "timestamp": datetime.now().isoformat(),
                "message": "Processing your request..."
            }
            
            # Get primary coach response quickly
            primary_response = await self.primary_coach.send_message(query, context)
            
            # Yield the main response immediately
            yield {
                "type": "primary_response",
                "message": primary_response,
                "agent": "primary_coach",
                "confidence": 0.9
            }
            
            # Generate quick action items based on keywords
            action_items = self._generate_quick_actions(query, primary_response)
            
            yield {
                "type": "actions",
                "action_items": action_items
            }
            
            # Complete
            yield {
                "type": "complete",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in stream_response: {str(e)}")
            yield {
                "type": "error",
                "message": f"Error processing request: {str(e)}"
            }
    
    def _generate_quick_actions(self, query: str, response: str) -> list:
        """Generate quick action items based on query and response"""
        actions = []
        query_lower = query.lower()
        response_lower = response.lower()
        
        # Workout-related actions
        if any(word in query_lower for word in ["workout", "exercise", "training"]):
            if "today" in query_lower:
                actions.append({
                    "id": f"start_workout_{datetime.now().timestamp()}",
                    "type": "start_workout",
                    "label": "Start Today's Workout",
                    "icon": "play-circle",
                    "color": "#4CAF50"
                })
            
            actions.append({
                "id": f"view_schedule_{datetime.now().timestamp()}",
                "type": "view_schedule",
                "label": "View Schedule",
                "icon": "calendar",
                "color": "#2196F3"
            })
        
        # Pain/injury actions
        if any(word in query_lower for word in ["pain", "hurt", "injury", "sore"]):
            actions.append({
                "id": f"modify_workout_{datetime.now().timestamp()}",
                "type": "modify_workout",
                "label": "Modify Workout",
                "icon": "build",
                "color": "#FF5722"
            })
            
            actions.append({
                "id": f"rest_day_{datetime.now().timestamp()}",
                "type": "rest_day",
                "label": "Take Rest Day",
                "icon": "bed",
                "color": "#FF9800"
            })
        
        # Nutrition actions
        if any(word in query_lower for word in ["eat", "meal", "nutrition", "diet"]):
            actions.append({
                "id": f"meal_plan_{datetime.now().timestamp()}",
                "type": "meal_plan",
                "label": "View Meal Plan",
                "icon": "restaurant",
                "color": "#4CAF50"
            })
        
        return actions