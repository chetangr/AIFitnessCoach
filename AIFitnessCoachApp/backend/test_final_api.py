#!/usr/bin/env python3
"""Final API test for new endpoints"""
import requests
import json

BASE_URL = "http://localhost:8000"  # Update this with your current Cloudflare tunnel URL

def test_endpoints():
    print("🚀 Testing AI Fitness Coach API - Final Test")
    print("="*50)
    
    # First, use the working demo-login endpoint
    print("\n1. Demo Login...")
    resp = requests.post(f"{BASE_URL}/api/auth/demo-login", json={})
    if resp.status_code != 200:
        print(f"❌ Demo login failed: {resp.status_code}")
        return
    
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Login successful")
    print(f"   Token: {token[:30]}...")
    
    # Test endpoints
    print("\n2. Testing New API Endpoints...")
    
    test_cases = [
        # Settings
        ("GET", "/api/settings", None, "Get Settings"),
        
        # Measurements  
        ("GET", "/api/measurements", None, "Get Measurements"),
        
        # Fasting
        ("GET", "/api/fasting/history", None, "Get Fasting History"),
        
        # Workout Schedule
        ("GET", "/api/workout-schedule", None, "Get Workout Schedule"),
        
        # Personal Records
        ("GET", "/api/personal-records", None, "Get Personal Records"),
        
        # Workout Sessions
        ("POST", "/api/workout-sessions/start", {
            "workout_plan_id": "demo-plan-1",
            "workout_name": "Demo Workout",
            "notes": "Testing workout session"
        }, "Start Workout Session"),
        
        # Custom Exercises
        ("POST", "/api/custom-exercises", {
            "name": "Demo Exercise",
            "category": "strength",
            "muscle_groups": ["chest", "triceps"],
            "equipment_needed": "barbell",  # Changed from equipment to equipment_needed
            "instructions": "Step 1: Position yourself. Step 2: Perform the movement."
        }, "Create Custom Exercise"),
    ]
    
    for method, endpoint, data, name in test_cases:
        try:
            if method == "GET":
                resp = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            else:
                resp = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json=data)
            
            if resp.status_code == 200:
                print(f"   ✅ {name}: Success")
                # Show sample of response
                response_data = resp.json()
                if isinstance(response_data, list):
                    print(f"      Returned {len(response_data)} items")
                elif isinstance(response_data, dict):
                    keys = list(response_data.keys())[:5]
                    print(f"      Fields: {', '.join(keys)}")
            else:
                print(f"   ❌ {name}: Failed ({resp.status_code})")
                print(f"      {resp.text[:100]}")
        except Exception as e:
            print(f"   ❌ {name}: Exception - {str(e)}")
    
    print("\n" + "="*50)
    print("✅ Test completed!")

if __name__ == "__main__":
    test_endpoints()