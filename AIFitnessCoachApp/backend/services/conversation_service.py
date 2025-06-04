"""
Conversation Service - Manages conversation context and history
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
from collections import defaultdict

from utils.logger import setup_logger

logger = setup_logger(__name__)

class ConversationService:
    """
    Service to manage conversation context across sessions
    """
    
    def __init__(self):
        # In-memory storage for now, should be replaced with database
        self.conversations: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.user_context: Dict[str, Dict[str, Any]] = {}
        self.max_history_length = 20  # Keep last 20 messages per user
        
    def add_message(self, user_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        """Add a message to conversation history"""
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        self.conversations[user_id].append(message)
        
        # Trim history if too long
        if len(self.conversations[user_id]) > self.max_history_length * 2:
            self.conversations[user_id] = self.conversations[user_id][-self.max_history_length:]
            
        logger.info(f"Added {role} message for user {user_id}")
        
    def get_conversation_history(self, user_id: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get conversation history for a user"""
        history = self.conversations.get(user_id, [])
        
        if limit:
            return history[-limit:]
        return history
        
    def get_context_summary(self, user_id: str) -> Dict[str, Any]:
        """Get a summary of conversation context"""
        history = self.get_conversation_history(user_id, limit=10)
        
        context = {
            "message_count": len(history),
            "last_message_time": history[-1]["timestamp"] if history else None,
            "recent_topics": self._extract_topics(history),
            "user_preferences": self.user_context.get(user_id, {})
        }
        
        return context
        
    def update_user_context(self, user_id: str, context_updates: Dict[str, Any]):
        """Update persistent user context"""
        if user_id not in self.user_context:
            self.user_context[user_id] = {}
            
        self.user_context[user_id].update(context_updates)
        logger.info(f"Updated context for user {user_id}: {list(context_updates.keys())}")
        
    def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """Get user context including workout info, preferences, etc."""
        base_context = self.user_context.get(user_id, {})
        
        # Add dynamic context
        from services.workout_service import WorkoutService
        workout_service = WorkoutService()
        
        try:
            # Get current workout timeline
            timeline = workout_service.get_workout_timeline(user_id)
            base_context["workout_timeline"] = timeline
            
            # Get user's current program
            base_context["current_program"] = timeline.get("current_program", "No active program")
            
            # Add other relevant info
            base_context["conversation_history_summary"] = self.get_context_summary(user_id)
            
        except Exception as e:
            logger.error(f"Error getting workout context: {e}")
            
        return base_context
        
    def _extract_topics(self, history: List[Dict[str, Any]]) -> List[str]:
        """Extract main topics from recent conversation"""
        topics = []
        keywords = {
            "workout": ["workout", "exercise", "training", "gym"],
            "nutrition": ["eat", "food", "diet", "meal", "nutrition"],
            "pain": ["pain", "hurt", "sore", "injury"],
            "progress": ["progress", "goal", "achievement", "improve"],
            "schedule": ["today", "tomorrow", "week", "schedule", "plan"]
        }
        
        for message in history[-5:]:  # Check last 5 messages
            content_lower = message["content"].lower()
            for topic, words in keywords.items():
                if any(word in content_lower for word in words):
                    if topic not in topics:
                        topics.append(topic)
                        
        return topics
        
    def clear_conversation(self, user_id: str):
        """Clear conversation history for a user"""
        if user_id in self.conversations:
            del self.conversations[user_id]
        logger.info(f"Cleared conversation for user {user_id}")

# Global instance
conversation_service = ConversationService()