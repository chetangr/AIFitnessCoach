#!/usr/bin/env python3
"""
Test script for OpenAI Agents SDK implementation
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from agents.openai_fitness_coach_agent import OpenAIFitnessCoachAgent, CoachPersonality
from services.agent_service import AgentService
from models.user import User

async def test_direct_agent():
    """Test the OpenAI agent directly"""
    print("\n=== Testing Direct OpenAI Agent ===")
    
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment")
        return
    
    # Create agent
    agent = OpenAIFitnessCoachAgent(
        api_key=api_key,
        user_id="test_user_123",
        personality=CoachPersonality.SUPPORTIVE
    )
    
    try:
        # Test basic conversation
        print("\n1. Testing basic conversation...")
        response = await agent.send_message("Hello, I'd like to start working out. What do you recommend?")
        print(f"✅ Response: {response[:200]}...")
        
        # Test tool calling - get workout
        print("\n2. Testing get workout for today...")
        response = await agent.send_message("What's my workout for today?")
        print(f"✅ Response: {response[:200]}...")
        
        # Test tool calling - create custom workout
        print("\n3. Testing custom workout creation...")
        response = await agent.send_message("Can you create a 30-minute HIIT workout for me?")
        print(f"✅ Response: {response[:200]}...")
        
        # Test injury assessment
        print("\n4. Testing injury assessment...")
        response = await agent.send_message("I have a sore lower back. Should I still work out?")
        print(f"✅ Response: {response[:200]}...")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Cleanup
        agent.cleanup()
        print("\n✅ Agent cleaned up")

async def test_agent_service():
    """Test the agent service"""
    print("\n=== Testing Agent Service ===")
    
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment")
        return
    
    # Create service
    service = AgentService(api_key)
    
    # Create mock user
    class MockUser:
        def __init__(self):
            self.id = "test_user_456"
            self.email = "test@example.com"
            self.display_name = "Test User"
            self.fitness_level = "intermediate"
            self.fitness_goals = ["strength", "endurance"]
            self.physical_limitations = []
            self.available_equipment = ["dumbbells", "resistance_bands"]
            self.schedule_preferences = {}
            self.injury_history = []
            self.created_at = None
            self.timezone = "UTC"
    
    user = MockUser()
    
    try:
        # Test chat
        print("\n1. Testing agent service chat...")
        response = await service.chat_with_agent(
            user=user,
            message="Hello! I want to get stronger. What should I focus on?",
            personality=CoachPersonality.SUPPORTIVE
        )
        print(f"✅ Status: {response['status']}")
        print(f"✅ Response: {response['response'][:200]}...")
        
        # Test state retrieval
        print("\n2. Testing agent state retrieval...")
        state = await service.get_agent_state(user.id)
        if state:
            print(f"✅ Agent ID: {state.get('agent_id', 'N/A')}")
            print(f"✅ Thread ID: {state.get('thread_id', 'N/A')}")
        
        # Test preferences update
        print("\n3. Testing preferences update...")
        success = await service.update_user_preferences(
            user.id,
            {"preferred_workout_time": "morning", "intensity": "high"}
        )
        print(f"✅ Preferences updated: {success}")
        
        # Test stats
        print("\n4. Testing session stats...")
        stats = service.get_session_stats()
        print(f"✅ Stats: {stats}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Cleanup all agents
        for user_id, agent in service._active_agents.items():
            agent.cleanup()
        print("\n✅ All agents cleaned up")

async def main():
    """Run all tests"""
    print("🏋️ AI Fitness Coach - OpenAI Agents SDK Test Suite 🏋️")
    
    # Test direct agent
    await test_direct_agent()
    
    # Test agent service
    await test_agent_service()
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    asyncio.run(main())