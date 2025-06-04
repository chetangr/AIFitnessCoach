#!/usr/bin/env python3
"""
Test API integration with OpenAI Agents SDK
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test health check endpoint"""
    print("\n=== Testing Health Check ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_agent_chat():
    """Test agent chat endpoint"""
    print("\n=== Testing Agent Chat ===")
    
    # First, we'd need to authenticate (using demo user)
    # For now, we'll assume we have a valid token
    
    headers = {
        "Content-Type": "application/json",
        # "Authorization": "Bearer YOUR_TOKEN_HERE"
    }
    
    payload = {
        "message": "Hello! I want to start a fitness routine. Can you help me?",
        "personality": "supportive"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/agent/chat",
            headers=headers,
            json=payload
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data.get('message', 'No message')[:200]}...")
            return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run integration tests"""
    print("🏋️ AI Fitness Coach - API Integration Test 🏋️")
    
    # Check if server is running
    try:
        if test_health_check():
            print("✅ Server is healthy")
        else:
            print("❌ Server health check failed")
            return
    except requests.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
        return
    
    # Test agent chat (would need authentication in real scenario)
    print("\n⚠️  Note: Agent chat test requires authentication.")
    print("To fully test, you need to:")
    print("1. Start the server: cd backend && python app.py")
    print("2. Login with demo credentials to get a token")
    print("3. Add the token to the headers in this script")
    
    # Provide curl example
    print("\n📝 Example curl command (replace TOKEN):")
    print("""
curl -X POST http://localhost:8000/api/agent/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{
    "message": "Hello! Can you help me create a workout plan?",
    "personality": "supportive"
  }'
    """)

if __name__ == "__main__":
    main()