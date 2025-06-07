"""Simple API test to verify core endpoints"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_basic_flow():
    print("🚀 Testing AI Fitness Coach API")
    print("="*50)
    
    # Register a test user
    print("\n1. Registering test user...")
    user_data = {
        "username": "apitest123",
        "email": "apitest@fitness.com", 
        "password": "Test123!",
        "first_name": "API",
        "last_name": "Test"
    }
    
    resp = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
    if resp.status_code in [200, 409]:
        print("✅ User registration successful (or already exists)")
    else:
        print(f"❌ Registration failed: {resp.status_code} - {resp.text}")
        return
    
    # Login with form data
    print("\n2. Logging in...")
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    resp = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
    if resp.status_code == 200:
        data = resp.json()
        token = data['access_token']
        print("✅ Login successful")
        print(f"   Token: {token[:30]}...")
    else:
        print(f"❌ Login failed: {resp.status_code} - {resp.text}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test basic endpoints
    print("\n3. Testing Core APIs...")
    
    # Settings
    resp = requests.get(f"{BASE_URL}/api/settings", headers=headers)
    print(f"   Settings API: {'✅' if resp.status_code == 200 else '❌'} ({resp.status_code})")
    
    # Measurements
    measurement = {"weight": 80.5, "notes": "Test measurement"}
    resp = requests.post(f"{BASE_URL}/api/measurements/measurements", json=measurement, headers=headers)
    print(f"   Measurements API: {'✅' if resp.status_code in [200, 201] else '❌'} ({resp.status_code})")
    if resp.status_code not in [200, 201]:
        print(f"      Error: {resp.text}")
    
    # Fasting
    fasting = {"fasting_type": "16:8", "planned_duration_hours": 16}
    resp = requests.post(f"{BASE_URL}/api/fasting/start", json=fasting, headers=headers)
    if resp.status_code in [200, 201]:
        print(f"   Fasting API: ✅ ({resp.status_code})")
        # Stop it
        requests.post(f"{BASE_URL}/api/fasting/stop", headers=headers)
    else:
        print(f"   Fasting API: {'✅' if resp.status_code == 400 else '❌'} ({resp.status_code})")
    
    # Workout Schedule
    resp = requests.get(f"{BASE_URL}/api/workout-schedule", headers=headers)
    print(f"   Schedule API: {'✅' if resp.status_code == 200 else '❌'} ({resp.status_code})")
    
    print("\n" + "="*50)
    print("✅ API test completed!")

if __name__ == "__main__":
    test_basic_flow()