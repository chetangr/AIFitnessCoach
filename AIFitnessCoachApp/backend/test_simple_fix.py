#!/usr/bin/env python3
"""Simple test to verify workout timeline structure fixes"""
from datetime import datetime, date, timedelta
from services.workout_service import WorkoutService

def test_workout_service_only():
    """Test only the workout service without API calls"""
    print("Testing Workout Service Fix...")
    
    service = WorkoutService()
    
    try:
        # Test 1: get_workout_timeline returns a dict format
        print("\n1. Testing get_workout_timeline...")
        timeline = service.get_workout_timeline("test_user")
        print(f"✓ Timeline retrieved successfully")
        
        # Check workouts structure
        workouts = timeline.get("workouts")
        if isinstance(workouts, dict):
            print(f"✓ Workouts is in dict format with {len(workouts)} days")
            # Show sample data
            for i, (day, workout) in enumerate(workouts.items()):
                if i < 2:  # Show first 2 days
                    print(f"  - {day}: {workout.get('title', workout.get('type', 'Unknown'))}")
        else:
            print(f"✗ ERROR: Workouts is not a dict: {type(workouts)}")
            
        # Test 2: get_user_workouts can handle both formats
        print("\n2. Testing get_user_workouts...")
        user_workouts = service.get_user_workouts("test_user")
        print(f"✓ User workouts retrieved: {len(user_workouts)} workouts")
        for i, workout in enumerate(user_workouts[:2]):
            print(f"  - {workout['title']}")
            
        # Test 3: get_workouts_range returns list format
        print("\n3. Testing get_workouts_range...")
        start_date = date.today().isoformat()
        end_date = (date.today() + timedelta(days=6)).isoformat()
        range_workouts = service.get_workouts_range("test_user", start_date, end_date)
        print(f"✓ Range workouts retrieved: {len(range_workouts)} items")
        print(f"✓ Returns list format: {isinstance(range_workouts, list)}")
        
        # Show what fitness_action_agent will receive
        print("\n4. Sample data structure that fitness_action_agent receives:")
        for i, workout in enumerate(range_workouts[:2]):
            print(f"  Day {i+1}: {workout}")
            
    except Exception as e:
        print(f"✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

def test_direct_timeline_access():
    """Test accessing timeline data in different ways"""
    print("\n\nTesting Timeline Data Access...")
    
    # Simulate what multi_agent_coordinator does
    service = WorkoutService()
    timeline = service.get_workout_timeline("test_user")
    
    # Test the problematic line that was causing .items() error
    workouts = timeline.get("workouts", {})
    
    print(f"Timeline workouts type: {type(workouts)}")
    
    if isinstance(workouts, dict):
        print("✓ Can safely use .items() on workouts")
        try:
            for day, workout in workouts.items():
                print(f"  - Accessing {day}: Success")
                break  # Just test one
        except AttributeError as e:
            print(f"✗ ERROR with .items(): {e}")
    else:
        print("✗ Workouts is not a dict, cannot use .items()")

if __name__ == "__main__":
    print("=" * 60)
    print("WORKOUT SERVICE FIX VERIFICATION")
    print("=" * 60)
    
    test_workout_service_only()
    test_direct_timeline_access()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)