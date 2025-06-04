"""
Agent Service for managing OpenAI Agents SDK instances
"""
from typing import Dict, Optional, Any
import asyncio
from datetime import datetime
import json
import os

from agents.openai_fitness_coach_agent import OpenAIFitnessCoachAgent, CoachPersonality
from models.user import User
from utils.logger import setup_logger

logger = setup_logger(__name__)

class AgentService:
    """
    Service for managing fitness coach agents using OpenAI Agents SDK
    """
    
    def __init__(self, openai_api_key: str = None):
        # Cache of active agents {user_id: agent_instance}
        self._active_agents: Dict[str, OpenAIFitnessCoachAgent] = {}
        self._agent_sessions: Dict[str, Dict[str, Any]] = {}
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
    
    async def get_or_create_agent(
        self, 
        user: User, 
        personality: str = CoachPersonality.SUPPORTIVE
    ) -> OpenAIFitnessCoachAgent:
        """
        Get existing agent or create new one for user
        
        Args:
            user: User object
            personality: Coach personality type
            
        Returns:
            FitnessCoachAgent instance
        """
        user_id = str(user.id)
        
        # Check if agent already exists
        if user_id in self._active_agents:
            existing_agent = self._active_agents[user_id]
            # Update personality if changed
            if existing_agent.personality != personality:
                logger.info(f"Switching agent personality for user {user_id}: {existing_agent.personality} -> {personality}")
                # Create new agent with new personality
                del self._active_agents[user_id]
            else:
                return existing_agent
        
        logger.info(f"Creating new agent for user {user_id} with personality: {personality}")
        
        # Create new agent
        agent = OpenAIFitnessCoachAgent(
            api_key=self.openai_api_key,
            user_id=user_id, 
            personality=personality
        )
        
        # Update agent with user context
        user_context = {
            'preferences': {
                'fitness_level': user.fitness_level,
                'goals': user.fitness_goals or [],
                'limitations': user.physical_limitations or [],
                'equipment': user.available_equipment or [],
                'schedule_preferences': user.schedule_preferences or {}
            },
            'goals': user.fitness_goals or [],
            'injuries': user.injury_history or [],
            'conversation': {
                'name': user.display_name or user.email.split('@')[0],
                'join_date': user.created_at.isoformat() if user.created_at else None,
                'timezone': user.timezone or 'UTC'
            }
        }
        
        agent.update_user_context(user_context)
        
        # Cache the agent
        self._active_agents[user_id] = agent
        
        # Initialize session tracking
        self._agent_sessions[user_id] = {
            'created_at': datetime.now().isoformat(),
            'personality': personality,
            'message_count': 0,
            'last_activity': datetime.now().isoformat()
        }
        
        return agent
    
    async def chat_with_agent(
        self, 
        user: User, 
        message: str, 
        personality: str = CoachPersonality.SUPPORTIVE,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send a message to the user's fitness coach agent
        
        Args:
            user: User object
            message: User's message
            personality: Coach personality
            context: Additional context (images, etc.)
            
        Returns:
            Agent's response
        """
        try:
            # Get or create agent
            agent = await self.get_or_create_agent(user, personality)
            
            # Update session
            user_id = str(user.id)
            if user_id in self._agent_sessions:
                self._agent_sessions[user_id]['message_count'] += 1
                self._agent_sessions[user_id]['last_activity'] = datetime.now().isoformat()
            
            logger.info(f"Processing message for user {user_id}: {message[:50]}...")
            
            # Send message to agent using the new async method
            response = await agent.send_message(message, context)
            
            logger.info(f"Agent response for user {user_id}: {len(response) if response else 0} characters")
            
            return {
                'status': 'success',
                'response': response,
                'agent_id': agent.assistant.id if hasattr(agent, 'assistant') else 'unknown',
                'personality': personality,
                'session_info': self._agent_sessions.get(user_id, {})
            }
            
        except Exception as e:
            logger.error(f"Error in chat with agent for user {user.id}: {str(e)}")
            return {
                'status': 'error',
                'error': str(e),
                'fallback_response': "I apologize, but I'm experiencing technical difficulties. Please try again in a moment."
            }
    
    async def get_agent_state(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get current state of user's agent
        
        Args:
            user_id: User ID
            
        Returns:
            Agent state or None if no agent exists
        """
        if user_id not in self._active_agents:
            return None
        
        agent = self._active_agents[user_id]
        
        return {
            'agent_id': agent.assistant.id if hasattr(agent, 'assistant') else 'unknown',
            'thread_id': agent.thread_id,
            'personality': agent.personality,
            'session_info': self._agent_sessions.get(user_id, {})
        }
    
    async def clear_agent_conversation(self, user_id: str) -> bool:
        """
        Clear conversation history for user's agent
        
        Args:
            user_id: User ID
            
        Returns:
            Success status
        """
        if user_id not in self._active_agents:
            return False
        
        try:
            agent = self._active_agents[user_id]
            # Clear conversation history (if agent supports it)
            if hasattr(agent, 'clear_conversation'):
                agent.clear_conversation()
            
            # Reset session
            if user_id in self._agent_sessions:
                self._agent_sessions[user_id]['message_count'] = 0
                self._agent_sessions[user_id]['last_activity'] = datetime.now().isoformat()
            
            logger.info(f"Cleared conversation for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error clearing conversation for user {user_id}: {str(e)}")
            return False
    
    async def update_user_preferences(
        self, 
        user_id: str, 
        preferences: Dict[str, Any]
    ) -> bool:
        """
        Update user preferences in their agent
        
        Args:
            user_id: User ID
            preferences: Updated preferences
            
        Returns:
            Success status
        """
        if user_id not in self._active_agents:
            return False
        
        try:
            agent = self._active_agents[user_id]
            agent.update_user_context({'preferences': preferences})
            
            logger.info(f"Updated preferences for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating preferences for user {user_id}: {str(e)}")
            return False
    
    async def cleanup_inactive_agents(self, max_inactive_hours: int = 24):
        """
        Clean up agents that have been inactive for too long
        
        Args:
            max_inactive_hours: Maximum hours of inactivity before cleanup
        """
        current_time = datetime.now()
        inactive_agents = []
        
        for user_id, session in self._agent_sessions.items():
            last_activity = datetime.fromisoformat(session['last_activity'])
            hours_inactive = (current_time - last_activity).total_seconds() / 3600
            
            if hours_inactive > max_inactive_hours:
                inactive_agents.append(user_id)
        
        for user_id in inactive_agents:
            if user_id in self._active_agents:
                del self._active_agents[user_id]
            if user_id in self._agent_sessions:
                del self._agent_sessions[user_id]
            
            logger.info(f"Cleaned up inactive agent for user {user_id}")
        
        if inactive_agents:
            logger.info(f"Cleaned up {len(inactive_agents)} inactive agents")
    
    def get_active_agent_count(self) -> int:
        """Get number of currently active agents"""
        return len(self._active_agents)
    
    def get_session_stats(self) -> Dict[str, Any]:
        """Get overall session statistics"""
        if not self._agent_sessions:
            return {'total_sessions': 0, 'total_messages': 0}
        
        total_messages = sum(session['message_count'] for session in self._agent_sessions.values())
        
        return {
            'total_sessions': len(self._agent_sessions),
            'total_messages': total_messages,
            'active_agents': len(self._active_agents),
            'personalities_in_use': list(set(session['personality'] for session in self._agent_sessions.values()))
        }

# Singleton instance for use throughout the application
agent_service = AgentService()