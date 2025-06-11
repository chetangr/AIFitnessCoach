#!/usr/bin/env python3
"""
Test the context fix for the multi-agent chat system
"""
import asyncio
import os
from dotenv import load_dotenv
from datetime import date

# Load environment variables
load_dotenv()

# Import the coordinator
from agents.multi_agent_coordinator import MultiAgentCoordinator, CoachPersonality

async def test_context_handling():
    """Test that context is properly passed to agents"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ No OpenAI API key found in .env file")
        return
    
    # Create coordinator
    coordinator = MultiAgentCoordinator(
        api_key=api_key,
        user_id="test-user-001",
        primary_personality=CoachPersonality.SUPPORTIVE
    )
    
    # Test 1: Simple query without context
    print("\n🧪 Test 1: Simple query without context")
    response1 = await coordinator.process_user_query(
        query="What should I focus on today?",
        context=None
    )
    print(f"Response: {response1.primary_message[:200]}...")
    
    # Test 2: Query with workout context
    print("\n🧪 Test 2: Query with workout context")
    context_with_workout = {
        "workout_timeline": {
            "current_week_schedule": {
                "workouts": [
                    {
                        "date": date.today().isoformat(),
                        "title": "Shoulders & Core",
                        "focus_areas": ["shoulders", "core", "abs"],
                        "exercises": 6
                    }
                ]
            },
            "today": date.today().isoformat()
        },
        "weekly_stats": {
            "total_workouts": 3,
            "total_calories": 1200
        }
    }
    
    response2 = await coordinator.process_user_query(
        query="What's my workout for today?",
        context=context_with_workout
    )
    print(f"Response: {response2.primary_message[:200]}...")
    
    # Check if the response mentions "Shoulders & Core"
    if "shoulders" in response2.primary_message.lower() or "core" in response2.primary_message.lower():
        print("✅ Context properly included - workout mentioned correctly!")
    else:
        print("❌ Context not properly included - workout not mentioned")
        print(f"Full response: {response2.primary_message}")
    
    # Cleanup
    coordinator.cleanup()

if __name__ == "__main__":
    asyncio.run(test_context_handling())