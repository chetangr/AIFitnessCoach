"""End-to-End API Test Suite for AI Fitness Coach Backend"""
import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Test configuration
BASE_URL = "https://quotations-images-lasting-companion.trycloudflare.com"
TEST_USER = {
    "username": "testuser123",
    "email": "test@aifit.com",
    "password": "Test123!@#"
}

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ {test_name}")
    
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append((test_name, error))
        print(f"❌ {test_name}: {error}")
    
    def print_summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*50}")
        print(f"Test Results: {self.passed}/{total} passed")
        if self.errors:
            print("\nFailed Tests:")
            for test, error in self.errors:
                print(f"  - {test}: {error}")
        print(f"{'='*50}\n")

results = TestResults()

async def test_auth_flow(session):
    """Test authentication flow"""
    print("\n🔐 Testing Authentication Flow...")
    
    # Test registration
    try:
        async with session.post(f"{BASE_URL}/api/auth/register", json={
            "username": TEST_USER["username"],
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }) as resp:
            if resp.status in [200, 409]:  # 409 if user already exists
                results.add_pass("User registration")
            else:
                text = await resp.text()
                results.add_fail("User registration", f"Status {resp.status}: {text}")
                return None
    except Exception as e:
        results.add_fail("User registration", str(e))
        return None
    
    # Test login
    try:
        login_data = aiohttp.FormData()
        login_data.add_field('username', TEST_USER["username"])
        login_data.add_field('password', TEST_USER["password"])
        
        async with session.post(f"{BASE_URL}/api/auth/login", data=login_data) as resp:
            if resp.status == 200:
                data = await resp.json()
                token = data.get("access_token")
                results.add_pass("User login")
                return token
            else:
                text = await resp.text()
                results.add_fail("User login", f"Status {resp.status}: {text}")
                return None
    except Exception as e:
        results.add_fail("User login", str(e))
        return None

async def test_measurements_api(session, token):
    """Test body measurements API"""
    print("\n📏 Testing Measurements API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create measurement
    measurement_data = {
        "weight": 75.5,
        "body_fat_percentage": 18.5,
        "waist_circumference": 85,
        "chest_circumference": 100,
        "arm_circumference": 35,
        "notes": "Morning measurement"
    }
    
    try:
        async with session.post(f"{BASE_URL}/api/measurements", 
                               json=measurement_data, 
                               headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Create measurement")
                measurement_id = data.get("id")
            else:
                text = await resp.text()
                results.add_fail("Create measurement", f"Status {resp.status}: {text}")
                return
    except Exception as e:
        results.add_fail("Create measurement", str(e))
        return
    
    # Get measurements
    try:
        async with session.get(f"{BASE_URL}/api/measurements", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                if len(data) > 0:
                    results.add_pass("Get measurements")
                else:
                    results.add_fail("Get measurements", "No measurements returned")
            else:
                results.add_fail("Get measurements", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get measurements", str(e))
    
    # Get latest measurement
    try:
        async with session.get(f"{BASE_URL}/api/measurements/latest", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                if data and data.get("weight") == 75.5:
                    results.add_pass("Get latest measurement")
                else:
                    results.add_fail("Get latest measurement", "Invalid data returned")
            else:
                results.add_fail("Get latest measurement", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get latest measurement", str(e))
    
    # Get trends
    try:
        async with session.get(f"{BASE_URL}/api/measurements/trends", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Get measurement trends")
            else:
                results.add_fail("Get measurement trends", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get measurement trends", str(e))

async def test_fasting_api(session, token):
    """Test fasting management API"""
    print("\n⏱️ Testing Fasting API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Start fasting
    fasting_data = {
        "fasting_type": "16:8",
        "planned_duration_hours": 16,
        "notes": "Testing fasting feature"
    }
    
    try:
        async with session.post(f"{BASE_URL}/api/fasting/start", 
                               json=fasting_data, 
                               headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Start fasting session")
                session_id = data.get("id")
            else:
                text = await resp.text()
                results.add_fail("Start fasting session", f"Status {resp.status}: {text}")
                return
    except Exception as e:
        results.add_fail("Start fasting session", str(e))
        return
    
    # Get current fasting
    try:
        async with session.get(f"{BASE_URL}/api/fasting/current", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                if data and data.get("fasting_type") == "16:8":
                    results.add_pass("Get current fasting session")
                else:
                    results.add_fail("Get current fasting session", "Invalid data")
            else:
                results.add_fail("Get current fasting session", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get current fasting session", str(e))
    
    # Stop fasting
    try:
        async with session.post(f"{BASE_URL}/api/fasting/stop", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Stop fasting session")
            else:
                results.add_fail("Stop fasting session", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Stop fasting session", str(e))
    
    # Get fasting stats
    try:
        async with session.get(f"{BASE_URL}/api/fasting/stats", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Get fasting statistics")
            else:
                results.add_fail("Get fasting statistics", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get fasting statistics", str(e))

async def test_workout_session_api(session, token):
    """Test workout session tracking API"""
    print("\n💪 Testing Workout Session API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Start workout session
    session_data = {
        "workout_name": "Upper Body Day",
        "notes": "Testing workout tracking"
    }
    
    try:
        async with session.post(f"{BASE_URL}/api/workout-sessions/start", 
                               json=session_data, 
                               headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Start workout session")
                workout_session_id = data.get("id")
            else:
                text = await resp.text()
                results.add_fail("Start workout session", f"Status {resp.status}: {text}")
                return
    except Exception as e:
        results.add_fail("Start workout session", str(e))
        return
    
    # Add exercise to session
    exercise_data = {
        "exercise_id": "bench-press",
        "order_in_workout": 1,
        "notes": "Felt strong today"
    }
    
    try:
        async with session.post(f"{BASE_URL}/api/workout-sessions/{workout_session_id}/exercise", 
                               json=exercise_data, 
                               headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Add exercise to session")
                exercise_performance_id = data.get("id")
            else:
                text = await resp.text()
                results.add_fail("Add exercise to session", f"Status {resp.status}: {text}")
                return
    except Exception as e:
        results.add_fail("Add exercise to session", str(e))
        return
    
    # Record sets
    for set_num in range(1, 4):
        set_data = {
            "exercise_performance_id": exercise_performance_id,
            "set_number": set_num,
            "target_reps": 10,
            "actual_reps": 10,
            "weight": 80.0,
            "rpe": 7,
            "is_warmup": False,
            "notes": f"Set {set_num}"
        }
        
        try:
            async with session.post(f"{BASE_URL}/api/workout-sessions/{workout_session_id}/set", 
                                   json=set_data, 
                                   headers=headers) as resp:
                if resp.status == 200:
                    results.add_pass(f"Record set {set_num}")
                else:
                    text = await resp.text()
                    results.add_fail(f"Record set {set_num}", f"Status {resp.status}: {text}")
        except Exception as e:
            results.add_fail(f"Record set {set_num}", str(e))
    
    # Complete workout
    completion_data = {
        "rating": 4,
        "notes": "Great workout!"
    }
    
    try:
        async with session.post(f"{BASE_URL}/api/workout-sessions/{workout_session_id}/complete", 
                               json=completion_data, 
                               headers=headers) as resp:
            if resp.status == 200:
                results.add_pass("Complete workout session")
            else:
                results.add_fail("Complete workout session", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Complete workout session", str(e))
    
    # Get workout sessions
    try:
        async with session.get(f"{BASE_URL}/api/workout-sessions", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                if len(data) > 0:
                    results.add_pass("Get workout sessions")
                else:
                    results.add_fail("Get workout sessions", "No sessions returned")
            else:
                results.add_fail("Get workout sessions", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get workout sessions", str(e))

async def test_personal_records_api(session, token):
    """Test personal records API"""
    print("\n🏆 Testing Personal Records API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Calculate PRs
    try:
        async with session.post(f"{BASE_URL}/api/personal-records/calculate", 
                               json={}, 
                               headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Calculate personal records")
            else:
                results.add_fail("Calculate personal records", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Calculate personal records", str(e))
    
    # Get all PRs
    try:
        async with session.get(f"{BASE_URL}/api/personal-records", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Get personal records")
            else:
                results.add_fail("Get personal records", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get personal records", str(e))
    
    # Get recent PRs
    try:
        async with session.get(f"{BASE_URL}/api/personal-records/recent", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Get recent personal records")
            else:
                results.add_fail("Get recent personal records", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get recent personal records", str(e))

async def test_settings_api(session, token):
    """Test user settings API"""
    print("\n⚙️ Testing Settings API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get settings
    try:
        async with session.get(f"{BASE_URL}/api/settings", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Get user settings")
            else:
                results.add_fail("Get user settings", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get user settings", str(e))
    
    # Update settings
    settings_data = {
        "unit_system": "imperial",
        "theme_preference": "dark",
        "notifications_enabled": True,
        "rest_timer_duration": 120,
        "weight_increment": 5.0
    }
    
    try:
        async with session.put(f"{BASE_URL}/api/settings", 
                              json=settings_data, 
                              headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                if data.get("unit_system") == "imperial":
                    results.add_pass("Update user settings")
                else:
                    results.add_fail("Update user settings", "Settings not updated correctly")
            else:
                results.add_fail("Update user settings", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Update user settings", str(e))

async def test_custom_exercises_api(session, token):
    """Test custom exercises API"""
    print("\n🏋️ Testing Custom Exercises API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create custom exercise
    exercise_data = {
        "name": "Cable Crossover",
        "category": "Chest",
        "muscle_groups": ["chest", "shoulders"],
        "equipment_needed": "Cable Machine",
        "instructions": "Cross cables in front of body",
        "is_public": False
    }
    
    try:
        async with session.post(f"{BASE_URL}/api/custom-exercises", 
                               json=exercise_data, 
                               headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Create custom exercise")
                exercise_id = data.get("id")
            else:
                text = await resp.text()
                results.add_fail("Create custom exercise", f"Status {resp.status}: {text}")
                return
    except Exception as e:
        results.add_fail("Create custom exercise", str(e))
        return
    
    # Get custom exercises
    try:
        async with session.get(f"{BASE_URL}/api/custom-exercises", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                if len(data) > 0:
                    results.add_pass("Get custom exercises")
                else:
                    results.add_fail("Get custom exercises", "No exercises returned")
            else:
                results.add_fail("Get custom exercises", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get custom exercises", str(e))

async def test_workout_schedule_api(session, token):
    """Test workout schedule API"""
    print("\n📅 Testing Workout Schedule API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get schedule
    try:
        async with session.get(f"{BASE_URL}/api/workout-schedule", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Get workout schedule")
            else:
                results.add_fail("Get workout schedule", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Get workout schedule", str(e))
    
    # Update schedule
    schedule_data = {
        "monday": "chest-day",
        "tuesday": "rest",
        "wednesday": "leg-day",
        "thursday": "rest",
        "friday": "back-day"
    }
    
    try:
        async with session.post(f"{BASE_URL}/api/workout-schedule", 
                               json=schedule_data, 
                               headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                results.add_pass("Update workout schedule")
            else:
                results.add_fail("Update workout schedule", f"Status {resp.status}")
    except Exception as e:
        results.add_fail("Update workout schedule", str(e))

async def run_all_tests():
    """Run all E2E tests"""
    print("🚀 Starting E2E API Tests for AI Fitness Coach Backend")
    print("="*60)
    
    async with aiohttp.ClientSession() as session:
        # Test authentication and get token
        token = await test_auth_flow(session)
        
        if token:
            # Run all API tests
            await test_measurements_api(session, token)
            await test_fasting_api(session, token)
            await test_settings_api(session, token)
            await test_workout_session_api(session, token)
            await test_personal_records_api(session, token)
            await test_custom_exercises_api(session, token)
            await test_workout_schedule_api(session, token)
        else:
            print("\n❌ Authentication failed - skipping remaining tests")
    
    # Print results
    results.print_summary()

async def test_integration_flow(session, token):
    """Test a complete user flow integrating multiple APIs"""
    print("\n🔄 Testing Integration Flow...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. User sets their preferences
    try:
        await session.put(f"{BASE_URL}/api/settings", 
                         json={"unit_system": "metric", "weight_increment": 2.5}, 
                         headers=headers)
        results.add_pass("Integration: Set user preferences")
    except:
        results.add_fail("Integration: Set user preferences", "Failed")
        return
    
    # 2. User records initial measurements
    try:
        await session.post(f"{BASE_URL}/api/measurements", 
                          json={"weight": 80, "body_fat_percentage": 20}, 
                          headers=headers)
        results.add_pass("Integration: Record initial measurements")
    except:
        results.add_fail("Integration: Record initial measurements", "Failed")
    
    # 3. User starts a fasting session
    try:
        await session.post(f"{BASE_URL}/api/fasting/start", 
                          json={"fasting_type": "16:8", "planned_duration_hours": 16}, 
                          headers=headers)
        results.add_pass("Integration: Start fasting")
    except:
        results.add_fail("Integration: Start fasting", "Failed")
    
    # 4. User completes a workout
    try:
        # Start session
        resp = await session.post(f"{BASE_URL}/api/workout-sessions/start", 
                                 json={"workout_name": "Full Body"}, 
                                 headers=headers)
        workout_data = await resp.json()
        workout_id = workout_data["id"]
        
        # Add exercise
        resp = await session.post(f"{BASE_URL}/api/workout-sessions/{workout_id}/exercise", 
                                 json={"exercise_id": "squat", "order_in_workout": 1}, 
                                 headers=headers)
        exercise_data = await resp.json()
        
        # Record set
        await session.post(f"{BASE_URL}/api/workout-sessions/{workout_id}/set", 
                          json={
                              "exercise_performance_id": exercise_data["id"],
                              "set_number": 1,
                              "actual_reps": 10,
                              "weight": 100
                          }, 
                          headers=headers)
        
        # Complete workout
        await session.post(f"{BASE_URL}/api/workout-sessions/{workout_id}/complete", 
                          json={"rating": 5}, 
                          headers=headers)
        
        results.add_pass("Integration: Complete workout flow")
    except:
        results.add_fail("Integration: Complete workout flow", "Failed")
    
    # 5. Check for PRs
    try:
        await session.post(f"{BASE_URL}/api/personal-records/calculate", json={}, headers=headers)
        results.add_pass("Integration: Calculate PRs")
    except:
        results.add_fail("Integration: Calculate PRs", "Failed")

if __name__ == "__main__":
    print("\n⚠️  Make sure the backend server is running on http://localhost:8000")
    print("Run with: cd backend && python app.py\n")
    
    # Run the tests
    asyncio.run(run_all_tests())