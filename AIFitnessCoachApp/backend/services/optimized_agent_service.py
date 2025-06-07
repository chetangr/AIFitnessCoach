"""
Optimized Agent Service with caching and performance improvements
"""
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
import time

from utils.logger import setup_logger
from utils.cache_manager import response_cache
from agents.openai_fitness_coach_agent import OpenAIFitnessCoachAgent, CoachPersonality
from agents.multi_agent_coordinator import MultiAgentCoordinator

logger = setup_logger(__name__)

class AgentCache:
    """Global cache for agent instances to avoid re-initialization"""
    _instances: Dict[str, Any] = {}
    _coordinators: Dict[str, MultiAgentCoordinator] = {}
    
    @classmethod
    def get_agent(cls, agent_key: str, create_func, *args, **kwargs):
        """Get or create an agent instance"""
        if agent_key not in cls._instances:
            logger.info(f"Creating new agent instance: {agent_key}")
            cls._instances[agent_key] = create_func(*args, **kwargs)
        return cls._instances[agent_key]
    
    @classmethod
    def get_coordinator(cls, user_id: str, api_key: str, personality: str = CoachPersonality.SUPPORTIVE):
        """Get or create a coordinator instance"""
        coord_key = f"{user_id}_{personality}"
        if coord_key not in cls._coordinators:
            logger.info(f"Creating new coordinator instance for user: {user_id}")
            cls._coordinators[coord_key] = MultiAgentCoordinator(api_key, user_id, personality)
        return cls._coordinators[coord_key]
    
    @classmethod
    def clear_user_cache(cls, user_id: str):
        """Clear cache for a specific user"""
        # Remove agent instances for this user
        keys_to_remove = [k for k in cls._instances.keys() if user_id in k]
        for key in keys_to_remove:
            del cls._instances[key]
        
        # Remove coordinators for this user
        coord_keys_to_remove = [k for k in cls._coordinators.keys() if k.startswith(user_id)]
        for key in coord_keys_to_remove:
            del cls._coordinators[key]

class OptimizedAgentService:
    """
    Optimized service for fast agent responses
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.timeout_seconds = 30  # Max time for agent response (increased from 10)
        self.use_streaming = True
        
    async def get_quick_response(self, user_id: str, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Get a quick response from the primary coach with caching
        """
        start_time = time.time()
        
        # Check cache first
        cached_response = response_cache.get("primary_coach", message, context)
        if cached_response:
            logger.info(f"Cache hit for message: {message[:50]}...")
            return {
                "response": cached_response,
                "cached": True,
                "response_time": 0.001,
                "responding_agents": [{"name": "primary_coach", "role": "Primary Coach"}]
            }
        
        try:
            # Get or create agent instance
            agent_key = f"primary_{user_id}_{CoachPersonality.SUPPORTIVE}"
            agent = AgentCache.get_agent(
                agent_key,
                OpenAIFitnessCoachAgent,
                self.api_key,
                user_id,
                CoachPersonality.SUPPORTIVE
            )
            
            # Get response with timeout
            response = await asyncio.wait_for(
                agent.send_message(message, context),
                timeout=self.timeout_seconds
            )
            
            # Cache the response
            response_cache.set("primary_coach", message, response, context, ttl=600)  # 10 min cache
            
            response_time = time.time() - start_time
            logger.info(f"Agent response time: {response_time:.2f}s")
            
            return {
                "response": response,
                "cached": False,
                "response_time": response_time,
                "responding_agents": [{"name": "primary_coach", "role": "Primary Coach"}]
            }
            
        except asyncio.TimeoutError:
            logger.error(f"Agent response timeout after {self.timeout_seconds}s")
            # Return a fallback response
            return {
                "response": "I'm taking a bit longer to process your request. Let me provide a quick response: Based on your message, I'd suggest focusing on maintaining consistent progress with your current routine. Would you like me to provide more specific guidance?",
                "cached": False,
                "response_time": self.timeout_seconds,
                "error": "timeout",
                "responding_agents": [{"name": "primary_coach", "role": "Primary Coach"}]
            }
        except Exception as e:
            logger.error(f"Error getting agent response: {e}")
            return {
                "response": "I encountered an issue processing your request. Could you please rephrase your question?",
                "cached": False,
                "response_time": time.time() - start_time,
                "error": str(e),
                "responding_agents": [{"name": "primary_coach", "role": "Primary Coach"}]
            }
    
    async def get_multi_agent_response(self, user_id: str, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Get response from multiple agents with optimization
        """
        start_time = time.time()
        
        # Check cache for multi-agent response
        cached_response = response_cache.get("multi_agent", message, context)
        if cached_response:
            logger.info(f"Multi-agent cache hit for message: {message[:50]}...")
            return cached_response
        
        try:
            # Get or create coordinator
            coordinator = AgentCache.get_coordinator(user_id, self.api_key)
            
            # Determine which agents to consult based on message content
            agents_to_consult = self._determine_relevant_agents(message)
            
            # Get response with timeout
            response = await asyncio.wait_for(
                coordinator.process_message(message, context, agents_to_consult),
                timeout=self.timeout_seconds * 1.5  # Give more time for multi-agent
            )
            
            # Cache the response
            response_cache.set("multi_agent", message, response, context, ttl=600)
            
            response["response_time"] = time.time() - start_time
            logger.info(f"Multi-agent response time: {response['response_time']:.2f}s")
            
            return response
            
        except asyncio.TimeoutError:
            logger.error(f"Multi-agent timeout after {self.timeout_seconds * 1.5}s")
            # Fall back to quick response
            return await self.get_quick_response(user_id, message, context)
        except Exception as e:
            logger.error(f"Error in multi-agent response: {e}")
            # Fall back to quick response
            return await self.get_quick_response(user_id, message, context)
    
    def _determine_relevant_agents(self, message: str) -> List[str]:
        """
        Determine which agents are relevant based on message content
        """
        message_lower = message.lower()
        agents = ["primary_coach"]  # Always include primary coach
        
        # Add relevant specialists based on keywords
        if any(word in message_lower for word in ["eat", "food", "diet", "nutrition", "calorie", "meal"]):
            agents.append("nutrition")
        
        if any(word in message_lower for word in ["rest", "recovery", "sore", "pain", "injury", "sleep"]):
            agents.append("recovery")
        
        if any(word in message_lower for word in ["goal", "progress", "achieve", "target", "milestone"]):
            agents.append("goal")
        
        if any(word in message_lower for word in ["form", "technique", "safety", "correct", "proper"]):
            agents.append("form_safety")
        
        # Limit to 3 agents max for speed
        if len(agents) > 3:
            agents = agents[:3]
        
        logger.info(f"Consulting agents: {agents}")
        return agents
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return response_cache.get_stats()
    
    def clear_cache(self):
        """Clear response cache"""
        response_cache.clear()

# Global optimized service instance
optimized_agent_service = OptimizedAgentService(api_key="")  # API key will be set at runtime