#!/usr/bin/env python3
"""
Test suite for Multi-Agent System
"""
import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

from agents.multi_agent_coordinator import (
    MultiAgentCoordinator, 
    AgentType, 
    CoachPersonality,
    CoordinatedResponse
)

# Test configuration
TEST_USER_ID = "test_user_multi_agent"
API_KEY = os.getenv('OPENAI_API_KEY')

async def test_multi_agent_initialization():
    """Test initialization of multi-agent system"""
    print("\n=== Testing Multi-Agent System Initialization ===")
    
    try:
        coordinator = MultiAgentCoordinator(
            api_key=API_KEY,
            user_id=TEST_USER_ID,
            primary_personality=CoachPersonality.SUPPORTIVE
        )
        
        print("✅ Coordinator initialized successfully")
        print(f"✅ Primary personality: {coordinator.primary_personality}")
        print(f"✅ Agents initialized: {len(coordinator.agents)}")
        
        # Check each agent
        for agent_type, agent in coordinator.agents.items():
            print(f"  - {agent_type.value}: {agent.agent_name}")
        
        return coordinator
        
    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        return None

async def test_nutrition_query(coordinator: MultiAgentCoordinator):
    """Test nutrition-focused query"""
    print("\n=== Testing Nutrition Query ===")
    
    query = "I want to build muscle. What should I eat before and after my workout?"
    
    try:
        response = await coordinator.process_user_query(query)
        
        print(f"✅ Query processed successfully")
        print(f"Primary response: {response.primary_message[:200]}...")
        print(f"Agents consulted: {len(response.agent_insights)}")
        print(f"Consensus recommendations: {len(response.consensus_recommendations)}")
        print(f"Confidence score: {response.confidence_score}")
        
        # Check if nutrition agent was consulted
        nutrition_involved = any(
            insight.agent_type == AgentType.NUTRITION 
            for insight in response.agent_insights
        )
        print(f"✅ Nutrition agent involved: {nutrition_involved}")
        
    except Exception as e:
        print(f"❌ Nutrition query failed: {e}")

async def test_injury_emergency(coordinator: MultiAgentCoordinator):
    """Test emergency injury situation"""
    print("\n=== Testing Emergency Injury Response ===")
    
    try:
        response = await coordinator.handle_emergency_situation(
            situation="Sharp pain in lower back during deadlifts",
            severity="severe"
        )
        
        print(f"✅ Emergency handled successfully")
        print(f"Status: {response['status']}")
        print(f"Immediate actions: {len(response['immediate_actions'])}")
        
        for i, action in enumerate(response['immediate_actions'][:3], 1):
            print(f"  {i}. {action['action']}")
        
        print(f"Follow-up required: {response['follow_up_required']}")
        
    except Exception as e:
        print(f"❌ Emergency handling failed: {e}")

async def test_comprehensive_assessment(coordinator: MultiAgentCoordinator):
    """Test comprehensive fitness assessment"""
    print("\n=== Testing Comprehensive Assessment ===")
    
    user_data = {
        "fitness_level": "intermediate",
        "goals": ["muscle_gain", "strength"],
        "current_stats": {
            "weight": 75,
            "body_fat": 18,
            "workouts_per_week": 4
        },
        "challenges": ["plateau in bench press", "occasional lower back pain"]
    }
    
    try:
        assessment = await coordinator.perform_comprehensive_assessment(user_data)
        
        print(f"✅ Assessment completed successfully")
        print(f"Timestamp: {assessment['timestamp']}")
        print(f"Confidence level: {assessment['confidence_level']}")
        
        print("\nSpecialist insights:")
        for specialist, insight in assessment['specialist_insights'].items():
            print(f"  - {specialist}: {insight['confidence']} confidence")
        
        print(f"\nKey recommendations: {len(assessment['key_recommendations'])}")
        for i, rec in enumerate(assessment['key_recommendations'][:3], 1):
            print(f"  {i}. {rec}")
        
    except Exception as e:
        print(f"❌ Comprehensive assessment failed: {e}")

async def test_goal_progress_query(coordinator: MultiAgentCoordinator):
    """Test goal progress analysis"""
    print("\n=== Testing Goal Progress Query ===")
    
    query = "I've been training for 3 months but my weight loss has plateaued. What should I do?"
    context = {
        "current_weight": 85,
        "start_weight": 92,
        "goal_weight": 80,
        "time_elapsed_days": 90
    }
    
    try:
        response = await coordinator.process_user_query(query, context)
        
        print(f"✅ Goal analysis completed")
        print(f"Agents involved: {[i.agent_type.value for i in response.agent_insights]}")
        print(f"Action items: {len(response.action_items)}")
        
        # Show top action items
        print("\nTop action items:")
        for item in response.action_items[:3]:
            print(f"  - [{item['source']}] {item['action']}")
        
    except Exception as e:
        print(f"❌ Goal progress query failed: {e}")

async def test_recovery_assessment(coordinator: MultiAgentCoordinator):
    """Test recovery and wellness assessment"""
    print("\n=== Testing Recovery Assessment ===")
    
    query = "I'm feeling really tired and my HRV is low. Should I still do my planned workout?"
    context = {
        "hrv_score": 42,
        "sleep_hours": 5.5,
        "stress_level": 8,
        "planned_workout": "Heavy leg day"
    }
    
    try:
        # Force recovery and safety agents
        response = await coordinator.process_user_query(
            query, 
            context,
            [AgentType.PRIMARY_COACH, AgentType.RECOVERY, AgentType.FORM_SAFETY]
        )
        
        print(f"✅ Recovery assessment completed")
        print(f"Primary message: {response.primary_message[:200]}...")
        
        # Check for recovery-specific recommendations
        recovery_recs = [
            rec for rec in response.consensus_recommendations 
            if any(word in rec.lower() for word in ["rest", "recovery", "sleep"])
        ]
        print(f"Recovery-focused recommendations: {len(recovery_recs)}")
        
    except Exception as e:
        print(f"❌ Recovery assessment failed: {e}")

async def test_form_check_query(coordinator: MultiAgentCoordinator):
    """Test exercise form analysis"""
    print("\n=== Testing Form Check Query ===")
    
    query = "My knees cave in during squats. How can I fix this?"
    
    try:
        response = await coordinator.process_user_query(query)
        
        print(f"✅ Form analysis completed")
        
        # Check if form safety agent was involved
        form_agent_involved = any(
            insight.agent_type == AgentType.FORM_SAFETY
            for insight in response.agent_insights
        )
        print(f"Form & Safety agent involved: {form_agent_involved}")
        
        # Look for form-specific recommendations
        print("\nForm corrections suggested:")
        for rec in response.consensus_recommendations[:3]:
            if any(word in rec.lower() for word in ["form", "knee", "squat", "technique"]):
                print(f"  - {rec}")
        
    except Exception as e:
        print(f"❌ Form check query failed: {e}")

async def test_conflict_resolution(coordinator: MultiAgentCoordinator):
    """Test conflict resolution between agents"""
    print("\n=== Testing Agent Conflict Resolution ===")
    
    # Query that might create conflicts
    query = "I want to lose weight quickly but also gain muscle. What should I do?"
    
    try:
        response = await coordinator.process_user_query(query)
        
        print(f"✅ Conflict resolution completed")
        print(f"Conflicts resolved: {len(response.conflicts_resolved)}")
        
        if response.conflicts_resolved:
            print("\nResolved conflicts:")
            for conflict in response.conflicts_resolved:
                print(f"  - {conflict}")
        else:
            print("No conflicts detected - agents in consensus")
        
    except Exception as e:
        print(f"❌ Conflict resolution test failed: {e}")

async def test_weekly_summary(coordinator: MultiAgentCoordinator):
    """Test weekly summary generation"""
    print("\n=== Testing Weekly Summary Generation ===")
    
    week_data = {
        "workouts_completed": 5,
        "total_duration_minutes": 300,
        "calories_burned": 2200,
        "achievements": [
            "Completed all planned workouts",
            "New PR on bench press",
            "Improved running pace"
        ],
        "challenges": [
            "Struggled with early morning workouts",
            "Mild knee discomfort during runs"
        ],
        "nutrition_adherence": 82,
        "recovery_score": 68,
        "sleep_average": 6.8
    }
    
    try:
        summary = await coordinator.generate_weekly_summary(week_data)
        
        print(f"✅ Weekly summary generated")
        print(f"Summary sections: {len(summary['specialist_summaries'])}")
        print(f"Next week focus points: {len(summary['next_week_focus'])}")
        
        print("\nNext week focus:")
        for focus in summary['next_week_focus'][:3]:
            print(f"  - {focus}")
        
    except Exception as e:
        print(f"❌ Weekly summary generation failed: {e}")

async def stress_test_multiple_queries(coordinator: MultiAgentCoordinator):
    """Stress test with multiple rapid queries"""
    print("\n=== Stress Testing Multiple Queries ===")
    
    queries = [
        "What's a good post-workout meal?",
        "My shoulder hurts during bench press",
        "How can I improve my sleep?",
        "Am I overtraining?",
        "How do I break through a plateau?"
    ]
    
    start_time = datetime.now()
    successful = 0
    
    try:
        # Process queries in parallel
        tasks = [coordinator.process_user_query(q) for q in queries]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, response in enumerate(responses):
            if isinstance(response, Exception):
                print(f"❌ Query {i+1} failed: {response}")
            else:
                successful += 1
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n✅ Stress test completed")
        print(f"Successful queries: {successful}/{len(queries)}")
        print(f"Total time: {duration:.2f} seconds")
        print(f"Average time per query: {duration/len(queries):.2f} seconds")
        
    except Exception as e:
        print(f"❌ Stress test failed: {e}")

async def main():
    """Run all tests"""
    print("🏋️ Multi-Agent System Test Suite 🏋️")
    print("=" * 50)
    
    if not API_KEY:
        print("❌ OPENAI_API_KEY not found in environment")
        return
    
    # Initialize coordinator
    coordinator = await test_multi_agent_initialization()
    if not coordinator:
        return
    
    # Run individual tests
    tests = [
        test_nutrition_query,
        test_injury_emergency,
        test_comprehensive_assessment,
        test_goal_progress_query,
        test_recovery_assessment,
        test_form_check_query,
        test_conflict_resolution,
        test_weekly_summary,
        stress_test_multiple_queries
    ]
    
    for test in tests:
        try:
            await test(coordinator)
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with error: {e}")
    
    # Cleanup
    print("\n=== Cleaning Up ===")
    coordinator.cleanup()
    print("✅ Cleanup completed")
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    asyncio.run(main())