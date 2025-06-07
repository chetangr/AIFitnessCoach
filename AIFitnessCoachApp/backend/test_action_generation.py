#!/usr/bin/env python3
"""
Test script to verify multi-agent action generation
"""
import asyncio
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.multi_agent_coordinator import MultiAgentCoordinator, AgentType, CoachPersonality
from utils.logger import setup_logger

logger = setup_logger(__name__)
load_dotenv()

async def test_action_generation():
    """Test various queries to ensure proper action generation"""
    
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        logger.error("OPENAI_API_KEY not found in environment")
        return
    
    # Initialize coordinator
    coordinator = MultiAgentCoordinator(
        api_key=api_key,
        user_id="test-user-001",
        primary_personality=CoachPersonality.SUPPORTIVE
    )
    
    # Test queries that should generate actions
    test_queries = [
        {
            "query": "Add push ups to my workout today",
            "expected_actions": ["add_exercise", "workout_modified"],
            "description": "Adding specific exercise"
        },
        {
            "query": "I want to create a leg day workout for tomorrow",
            "expected_actions": ["schedule_workout", "create_workout"],
            "description": "Creating new workout"
        },
        {
            "query": "My knee hurts, what should I do?",
            "expected_actions": ["modify_workout", "substitute_exercises"],
            "description": "Pain/injury response"
        },
        {
            "query": "Schedule a rest day for tomorrow",
            "expected_actions": ["schedule_rest"],
            "description": "Rest day scheduling"
        },
        {
            "query": "What's my workout for today?",
            "expected_actions": ["view_workout"],
            "description": "Viewing workout"
        }
    ]
    
    for test in test_queries:
        print(f"\n{'='*60}")
        print(f"Test: {test['description']}")
        print(f"Query: {test['query']}")
        print(f"Expected actions: {test['expected_actions']}")
        print('-'*60)
        
        try:
            # Process query
            response = await coordinator.process_user_query(
                query=test['query'],
                context={"test_mode": True}
            )
            
            # Display results
            print(f"\nPrimary Message:")
            print(f"{response.primary_message[:200]}...")
            
            print(f"\nResponding Agents:")
            for agent in response.responding_agents:
                print(f"  - {agent['emoji']} {agent['name']} ({agent['confidence']})")
            
            print(f"\nGenerated Actions ({len(response.action_items)}):")
            if response.action_items:
                for action in response.action_items:
                    print(f"  - Type: {action['type']}")
                    print(f"    Label: {action['label']}")
                    print(f"    Icon: {action['icon']}")
                    print(f"    Color: {action['color']}")
                    print(f"    Source: {action['source']}")
                    if 'metadata' in action:
                        print(f"    Metadata: {action['metadata']}")
                    print()
            else:
                print("  No actions generated!")
            
            # Check if expected actions were generated
            generated_types = [action['type'] for action in response.action_items]
            missing_actions = [exp for exp in test['expected_actions'] 
                             if not any(exp in gen_type for gen_type in generated_types)]
            
            if missing_actions:
                print(f"\n⚠️  Missing expected actions: {missing_actions}")
            else:
                print(f"\n✅ All expected actions generated!")
                
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            logger.error(f"Test failed: {str(e)}", exc_info=True)
    
    # Cleanup
    coordinator.cleanup()
    print(f"\n{'='*60}")
    print("Test completed!")

if __name__ == "__main__":
    asyncio.run(test_action_generation())