#!/usr/bin/env python3
"""
Test script to verify multi-agent system with timeline integration
"""
import asyncio
import json
from datetime import datetime
import os
from dotenv import load_dotenv

# Add parent directory to path
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.multi_agent_coordinator import MultiAgentCoordinator, AgentType, CoachPersonality

# Load environment variables
load_dotenv()

async def test_multi_agent_with_timeline():
    """Test multi-agent system with workout timeline context"""
    
    # Get API key from environment
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found in environment")
        return
    
    # Initialize coordinator
    print("🚀 Initializing Multi-Agent Coordinator...")
    coordinator = MultiAgentCoordinator(
        api_key=api_key,
        user_id="test_user_123",
        primary_personality=CoachPersonality.SUPPORTIVE
    )
    
    # Test queries
    test_queries = [
        {
            "query": "What's my workout schedule for this week? I'm feeling a bit tired.",
            "description": "Query about workout schedule with recovery concern"
        },
        {
            "query": "I need to rest tomorrow but don't want to miss my leg day. What should I do?",
            "description": "Workout modification request"
        },
        {
            "query": "Can you suggest a high-protein meal plan that supports my current training?",
            "description": "Nutrition query related to training"
        },
        {
            "query": "My lower back is sore from yesterday's deadlifts. Should I skip today's workout?",
            "description": "Injury concern with workout decision"
        }
    ]
    
    print("\n" + "="*80 + "\n")
    
    for test in test_queries:
        print(f"📝 Test: {test['description']}")
        print(f"💬 Query: {test['query']}")
        print("-" * 40)
        
        try:
            # Process query through multi-agent system
            response = await coordinator.process_user_query(
                query=test['query'],
                context={"test_mode": True}
            )
            
            # Display results
            print(f"\n🤖 Primary Response:")
            print(f"{response.primary_message[:200]}...")
            
            print(f"\n👥 Responding Agents ({len(response.responding_agents)}):")
            for agent in response.responding_agents:
                print(f"  {agent['emoji']} {agent['name']} - Confidence: {agent['confidence']}")
            
            print(f"\n📊 Overall Confidence: {response.confidence_score}")
            
            if response.consensus_recommendations:
                print(f"\n✅ Consensus Recommendations:")
                for rec in response.consensus_recommendations[:3]:
                    print(f"  - {rec}")
            
            if response.action_items:
                print(f"\n📋 Action Items:")
                for item in response.action_items[:3]:
                    print(f"  - [{item['source']}] {item['action']}")
            
            # Check if timeline was included in context
            print(f"\n📅 Timeline Integration:")
            timeline_found = False
            for agent_response in response.agent_insights:
                if 'workout_timeline' in str(agent_response.data):
                    timeline_found = True
                    break
            print(f"  Timeline data {'✅ included' if timeline_found else '❌ not found'} in agent context")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print("\n" + "="*80 + "\n")
        
        # Small delay between queries
        await asyncio.sleep(1)
    
    # Test emergency situation
    print("🚨 Testing Emergency Response...")
    emergency_response = await coordinator.handle_emergency_situation(
        "I pulled my hamstring during squats and it's really painful",
        severity="moderate"
    )
    
    print(f"Emergency Actions:")
    for action in emergency_response['immediate_actions']:
        print(f"  - {action['action']} (Priority: {action['priority']})")
    
    # Cleanup
    coordinator.cleanup()
    print("\n✅ Test completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_multi_agent_with_timeline())