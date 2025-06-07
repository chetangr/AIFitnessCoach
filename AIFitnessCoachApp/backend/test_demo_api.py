"""Quick demo API test to verify endpoints are working"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_demo_flow():
    print("🚀 Testing AI Fitness Coach API with Demo User")
    print("="*50)
    
    # 1. Demo Login
    print("\n1. Testing Demo Login...")
    resp = requests.post(f"{BASE_URL}/api/auth/demo-login")
    if resp.status_code == 200:
        data = resp.json()
        token = data['access_token']
        print("✅ Demo login successful")
        print(f"   Token: {token[:20]}...")
    else:
        print(f"❌ Demo login failed: {resp.status_code}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Test Measurements
    print("\n2. Testing Measurements API...")
    measurement = {
        "weight": 75.5,
        "body_fat_percentage": 18.5,
        "notes": "Morning measurement"
    }
    resp = requests.post(f"{BASE_URL}/api/measurements", json=measurement, headers=headers)
    if resp.status_code == 200:
        print("✅ Created measurement")
    else:
        print(f"❌ Failed to create measurement: {resp.status_code} - {resp.text}")
    
    # Get measurements
    resp = requests.get(f"{BASE_URL}/api/measurements", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Retrieved {len(data)} measurements")
    else:
        print(f"❌ Failed to get measurements: {resp.status_code}")
    
    # 3. Test Fasting
    print("\n3. Testing Fasting API...")
    fasting = {
        "fasting_type": "16:8",
        "planned_duration_hours": 16,
        "notes": "Starting intermittent fasting"
    }
    resp = requests.post(f"{BASE_URL}/api/fasting/start", json=fasting, headers=headers)
    if resp.status_code == 200:
        print("✅ Started fasting session")
    else:
        print(f"❌ Failed to start fasting: {resp.status_code} - {resp.text}")
    
    # Get current fasting
    resp = requests.get(f"{BASE_URL}/api/fasting/current", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        if data:
            print("✅ Retrieved current fasting session")
        else:
            print("✅ No active fasting session")
    else:
        print(f"❌ Failed to get current fasting: {resp.status_code}")
    
    # Stop fasting
    resp = requests.post(f"{BASE_URL}/api/fasting/stop", headers=headers)
    if resp.status_code == 200:
        print("✅ Stopped fasting session")
    else:
        print(f"❌ Failed to stop fasting: {resp.status_code}")
    
    # 4. Test Workout Session
    print("\n4. Testing Workout Session API...")
    workout = {
        "workout_name": "Upper Body Day",
        "notes": "Testing workout tracking"
    }
    resp = requests.post(f"{BASE_URL}/api/workout-sessions/start", json=workout, headers=headers)
    if resp.status_code == 200:
        session_data = resp.json()
        session_id = session_data['id']
        print("✅ Started workout session")
        
        # Add exercise
        exercise = {
            "exercise_id": "bench-press",
            "order_in_workout": 1,
            "notes": "Chest day"
        }
        resp = requests.post(f"{BASE_URL}/api/workout-sessions/{session_id}/exercise", 
                           json=exercise, headers=headers)
        if resp.status_code == 200:
            exercise_data = resp.json()
            perf_id = exercise_data['id']
            print("✅ Added exercise to session")
            
            # Record set
            set_data = {
                "exercise_performance_id": perf_id,
                "set_number": 1,
                "target_reps": 10,
                "actual_reps": 10,
                "weight": 80.0,
                "rpe": 7
            }
            resp = requests.post(f"{BASE_URL}/api/workout-sessions/{session_id}/set", 
                               json=set_data, headers=headers)
            if resp.status_code == 200:
                print("✅ Recorded set")
            else:
                print(f"❌ Failed to record set: {resp.status_code}")
        else:
            print(f"❌ Failed to add exercise: {resp.status_code}")
        
        # Complete workout
        completion = {"rating": 4, "notes": "Great workout!"}
        resp = requests.post(f"{BASE_URL}/api/workout-sessions/{session_id}/complete", 
                           json=completion, headers=headers)
        if resp.status_code == 200:
            print("✅ Completed workout session")
        else:
            print(f"❌ Failed to complete workout: {resp.status_code}")
    else:
        print(f"❌ Failed to start workout: {resp.status_code} - {resp.text}")
    
    # 5. Test Settings
    print("\n5. Testing Settings API...")
    resp = requests.get(f"{BASE_URL}/api/settings", headers=headers)
    if resp.status_code == 200:
        print("✅ Retrieved user settings")
    else:
        print(f"❌ Failed to get settings: {resp.status_code}")
    
    # Update settings
    settings = {
        "unit_system": "imperial",
        "theme_preference": "dark",
        "rest_timer_duration": 120
    }
    resp = requests.put(f"{BASE_URL}/api/settings", json=settings, headers=headers)
    if resp.status_code == 200:
        print("✅ Updated user settings")
    else:
        print(f"❌ Failed to update settings: {resp.status_code}")
    
    print("\n" + "="*50)
    print("✅ Demo API test completed!")

if __name__ == "__main__":
    test_demo_flow()