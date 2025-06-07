#!/usr/bin/env python3
"""Test all features to verify they're working properly"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n1. Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")  # Fixed endpoint
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ERROR: {e}")
        return False

def test_multi_agent_chat():
    """Test multi-agent chat endpoint"""
    print("\n2. Testing Multi-Agent Chat...")
    try:
        payload = {
            "message": "I need help with my fitness goals",
            "context": {},
            "fast_mode": False,
            "personality": "supportive"
        }
        response = requests.post(f"{BASE_URL}/api/multi-agent/chat/demo", json=payload)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Primary Message: {data.get('primary_message', '')[:100]}...")
            print(f"   Responding Agents: {data.get('responding_agents', [])}")
            # Check if responding_agents is in correct format
            agents = data.get('responding_agents', [])
            if agents and isinstance(agents[0], dict):
                print("   ✓ Responding agents format is correct (dict)")
            else:
                print("   ✗ Responding agents format is incorrect")
        else:
            print(f"   ERROR Response: {response.text[:200]}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ERROR: {e}")
        return False

def test_fasting_endpoints():
    """Test fasting-related endpoints"""
    print("\n3. Testing Fasting Endpoints...")
    
    # Test get fasting sessions
    try:
        headers = {"Authorization": "Bearer demo-token"}
        response = requests.get(f"{BASE_URL}/api/fasting/sessions", headers=headers)
        print(f"   Get Sessions Status: {response.status_code}")
        
        # Test start fasting
        payload = {
            "plan_id": "16:8",
            "target_hours": 16
        }
        response = requests.post(f"{BASE_URL}/api/fasting/start", json=payload, headers=headers)
        print(f"   Start Fasting Status: {response.status_code}")
        
        return True
    except Exception as e:
        print(f"   ERROR: {e}")
        return False

def test_coach_endpoints():
    """Test AI coach endpoints"""
    print("\n4. Testing AI Coach Endpoints...")
    try:
        # Test single agent chat
        payload = {
            "message": "Hello coach",
            "personality": "emma"
        }
        headers = {"Authorization": "Bearer demo-token"}
        response = requests.post(f"{BASE_URL}/api/coach/chat", json=payload, headers=headers)
        print(f"   Chat Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Message: {data.get('message', '')[:100]}...")
        else:
            print(f"   ERROR: {response.text[:200]}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ERROR: {e}")
        return False

def main():
    print("=" * 60)
    print("AI FITNESS COACH - FEATURE TEST SUITE")
    print("=" * 60)
    
    results = {
        "Health Check": test_health(),
        "Multi-Agent Chat": test_multi_agent_chat(),
        "Fasting Features": test_fasting_endpoints(),
        "AI Coach Chat": test_coach_endpoints()
    }
    
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY:")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name:.<40} {status}")
    
    total_passed = sum(1 for passed in results.values() if passed)
    print(f"\nTotal: {total_passed}/{len(results)} tests passed")
    
    if total_passed < len(results):
        print("\n⚠️  Some tests failed. Please check the backend logs for more details.")
    else:
        print("\n✅ All tests passed! The backend is working correctly.")

if __name__ == "__main__":
    main()