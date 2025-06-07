#!/usr/bin/env python3
"""Test API endpoints using demo user"""
import requests
import json

BASE_URL = "https://quotations-images-lasting-companion.trycloudflare.com"

def test_demo_flow():
    print("🚀 Testing AI Fitness Coach API with Demo User")
    print("="*50)
    
    # Login with demo credentials
    print("\n1. Logging in with demo user...")
    login_data = {
        "username": "demo@fitness.com",
        "password": "demo123"
    }
    
    resp = requests.post(f"{BASE_URL}/api/auth/login-json", json=login_data)
    if resp.status_code == 200:
        data = resp.json()
        token = data['access_token']
        print("✅ Login successful")
        print(f"   Token: {token[:30]}...")
        print(f"   User: {data['user']['display_name']}")
    else:
        print(f"❌ Login failed: {resp.status_code} - {resp.text}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test all endpoints
    print("\n2. Testing Core APIs...")
    
    endpoints = [
        ("/api/settings", "Settings"),
        ("/api/measurements", "Measurements"),
        ("/api/fasting/history", "Fasting History"),
        ("/api/workout-schedule", "Workout Schedule"),
    ]
    
    for endpoint, name in endpoints:
        try:
            resp = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            if resp.status_code == 200:
                print(f"   ✅ {name}: Success")
                data = resp.json()
                # Show a sample of the response
                if isinstance(data, list) and len(data) > 0:
                    print(f"      - Returned {len(data)} items")
                elif isinstance(data, dict):
                    print(f"      - Fields: {', '.join(list(data.keys())[:5])}")
            else:
                print(f"   ❌ {name}: Failed ({resp.status_code})")
                if resp.text:
                    try:
                        error = resp.json()
                        print(f"      - Error: {error.get('detail', resp.text[:100])}")
                    except:
                        print(f"      - Error: {resp.text[:100]}")
        except Exception as e:
            print(f"   ❌ {name}: Exception - {str(e)}")
    
    print("\n" + "="*50)
    print("✅ Demo API test completed!")

if __name__ == "__main__":
    test_demo_flow()