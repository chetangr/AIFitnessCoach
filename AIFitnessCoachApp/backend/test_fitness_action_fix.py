#!/usr/bin/env python3
"""Test script to verify fitness action agent fixes"""
import asyncio
from agents.fitness_action_agent import FitnessActionAgent
from services.workout_service import WorkoutService

async def test_fitness_action_agent():
    """Test the fitness action agent after our fixes"""
    print("Testing Fitness Action Agent...")
    
    # Test with a dummy API key (not actually used for this test)
    agent = FitnessActionAgent(api_key="test_key", user_id="test_user")
    
    try:
        # Test get_workout_timeline
        print("\n1. Testing get_workout_timeline...")
        timeline = await agent.get_workout_timeline()
        print(f"✓ Timeline retrieved successfully")
        print(f"  - Current week schedule: {timeline.get('current_week_schedule', {}).get('view_type')}")
        print(f"  - Today: {timeline.get('today')}")
        print(f"  - Next workout: {timeline.get('next_workout', {}).get('title', 'None scheduled')}")
        
        # Test _view_workout_schedule
        print("\n2. Testing _view_workout_schedule...")
        schedule = agent._view_workout_schedule(view_type="week")
        print(f"✓ Schedule retrieved successfully")
        print(f"  - Number of workouts: {len(schedule.get('workouts', []))}")
        print(f"  - Summary: {schedule.get('summary')}")
        
        # Verify workouts is a list
        workouts = schedule.get('workouts', [])
        if isinstance(workouts, list):
            print("✓ Workouts is correctly formatted as a list")
        else:
            print("✗ ERROR: Workouts is not a list!")
            
    except Exception as e:
        print(f"✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

def test_workout_service():
    """Test the workout service after our fixes"""
    print("\n\nTesting Workout Service...")
    
    service = WorkoutService()
    
    try:
        # Test get_workout_timeline
        print("\n1. Testing get_workout_timeline...")
        timeline = service.get_workout_timeline("test_user")
        print(f"✓ Timeline retrieved successfully")
        
        # Check if workouts can be either dict or list
        workouts = timeline.get("workouts")
        if workouts:
            if isinstance(workouts, dict):
                print("✓ Workouts is in dict format")
                print(f"  - Number of days: {len(workouts)}")
            elif isinstance(workouts, list):
                print("✓ Workouts is in list format")
                print(f"  - Number of workouts: {len(workouts)}")
            else:
                print(f"✗ ERROR: Unexpected workouts format: {type(workouts)}")
                
        # Test get_user_workouts
        print("\n2. Testing get_user_workouts...")
        user_workouts = service.get_user_workouts("test_user")
        print(f"✓ User workouts retrieved successfully")
        print(f"  - Number of workouts: {len(user_workouts)}")
        
    except Exception as e:
        print(f"✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("FITNESS ACTION AGENT FIX VERIFICATION")
    print("=" * 60)
    
    # Run async test
    asyncio.run(test_fitness_action_agent())
    
    # Run sync test
    test_workout_service()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)