"""Debug API test to check authentication"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_debug():
    print("🔍 DEBUG: Testing AI Fitness Coach API")
    print("="*50)
    
    # Register a test user
    print("\n1. Registering test user...")
    user_data = {
        "username": "debugtest123",
        "email": "debugtest@fitness.com", 
        "password": "Test123!",
        "first_name": "Debug",
        "last_name": "Test"
    }
    
    resp = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
    print(f"   Registration response: {resp.status_code}")
    if resp.status_code not in [200, 409]:
        print(f"   Error: {resp.text}")
        return
    
    # Login with form data
    print("\n2. Logging in...")
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    resp = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
    print(f"   Login response: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        token = data.get('access_token')
        print(f"   Token received: {token[:50]}...")
        print(f"   Token type: {data.get('token_type')}")
        print(f"   Full response: {json.dumps(data, indent=2)}")
    else:
        print(f"   Error: {resp.text}")
        return
    
    # Test with token
    print("\n3. Testing authenticated endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    print(f"   Headers: {headers}")
    
    # Test user profile first (should work)
    resp = requests.get(f"{BASE_URL}/api/users/profile", headers=headers)
    print(f"   User Profile API: {resp.status_code}")
    if resp.status_code == 200:
        print(f"   User data: {json.dumps(resp.json(), indent=2)[:200]}...")
    else:
        print(f"   Error: {resp.text}")
    
    # Test settings
    resp = requests.get(f"{BASE_URL}/api/settings", headers=headers)
    print(f"\n   Settings API: {resp.status_code}")
    if resp.status_code != 200:
        print(f"   Error: {resp.text}")
        print(f"   Response headers: {dict(resp.headers)}")

if __name__ == "__main__":
    test_debug()