#!/usr/bin/env python3
"""Test basic API response without multi-agent complexity"""
import requests
import json

def test_basic_endpoints():
    """Test basic API endpoints"""
    
    print("Testing Basic API Endpoints...")
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")
    
    # Test 2: Try the coach agents endpoint directly
    print("\n2. Testing coach agents endpoint...")
    try:
        response = requests.get("http://localhost:8000/api/coach-agents/agents", timeout=5)
        print(f"Coach agents: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Available agents: {len(data.get('agents', []))}")
    except Exception as e:
        print(f"Coach agents failed: {e}")
    
    # Test 3: Try a simple chat endpoint (non multi-agent)
    print("\n3. Testing simple chat endpoint...")
    try:
        response = requests.post(
            "http://localhost:8000/api/coach/chat",
            json={
                "message": "Hello",
                "coach_id": "coach_maya"
            },
            headers={"Authorization": "Bearer demo-token"},
            timeout=10
        )
        print(f"Simple chat: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()['response'][:100]}...")
    except Exception as e:
        print(f"Simple chat failed: {e}")

if __name__ == "__main__":
    test_basic_endpoints()