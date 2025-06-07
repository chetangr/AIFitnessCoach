#!/usr/bin/env python3
"""Test API with standard user registration and login"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8000"

def test_with_real_user():
    print("🚀 Testing AI Fitness Coach API with Real User")
    print("="*50)
    
    # Create a unique test user
    test_id = str(uuid.uuid4())[:8]
    user_data = {
        "username": f"testuser_{test_id}",
        "email": f"test_{test_id}@example.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    # Register
    print("\n1. Registering test user...")
    resp = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
    if resp.status_code not in [200, 201]:
        print(f"❌ Registration failed: {resp.status_code} - {resp.text}")
        return
    print("✅ User registered successfully")
    
    # Login
    print("\n2. Logging in...")
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    resp = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
    if resp.status_code != 200:
        print(f"❌ Login failed: {resp.status_code} - {resp.text}")
        return
    
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # Test endpoints
    print("\n3. Testing API Endpoints...")
    
    endpoints = [
        ("GET", "/api/settings", None, "Settings"),
        ("GET", "/api/measurements", None, "Measurements"),
        ("GET", "/api/fasting/history", None, "Fasting History"),
        ("GET", "/api/workout-schedule", None, "Workout Schedule"),
        ("GET", "/api/personal-records", None, "Personal Records"),
    ]
    
    for method, endpoint, data, name in endpoints:
        try:
            if method == "GET":
                resp = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            else:
                resp = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json=data)
            
            if resp.status_code == 200:
                print(f"   ✅ {name}: Success")
            else:
                print(f"   ❌ {name}: Failed ({resp.status_code})")
                if resp.text:
                    print(f"      {resp.text[:100]}")
        except Exception as e:
            print(f"   ❌ {name}: Exception - {str(e)}")
    
    print("\n" + "="*50)
    print("✅ Test completed!")

if __name__ == "__main__":
    test_with_real_user()