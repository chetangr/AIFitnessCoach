#!/usr/bin/env python3
"""Test multi-agent API functionality"""
import requests
import json
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def test_multi_agent_api():
    """Test the multi-agent chat demo endpoint"""
    
    print("Testing Multi-Agent API...")
    print(f"OPENAI_API_KEY exists: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
    
    url = "http://localhost:8000/api/multi-agent/chat/demo"
    
    # Test case: User with neck pain
    payload = {
        "message": "can you suggest me some workouts since I have neck pain?",
        "context": {
            "user_id": "demo-user",
            "pain_reported": True,
            "injury_concern": True
        },
        "personality": "supportive"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"\nSending request to: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✓ Response received successfully!")
            print(f"\nPrimary Message: {data.get('primary_message', 'N/A')[:200]}...")
            print(f"\nResponding Agents: {len(data.get('responding_agents', []))}")
            for agent in data.get('responding_agents', []):
                print(f"  - {agent.get('emoji', '')} {agent.get('name', 'Unknown')}")
            
            print(f"\nAction Items: {len(data.get('action_items', []))}")
            for action in data.get('action_items', []):
                print(f"  - {action.get('label', 'Unknown action')} ({action.get('type', 'unknown')})")
                
            print(f"\nConsensus Recommendations: {len(data.get('consensus_recommendations', []))}")
            for rec in data.get('consensus_recommendations', [])[:3]:
                print(f"  - {rec}")
                
        else:
            print(f"\n✗ Error response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("\n✗ Request timed out (30 seconds)")
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")

if __name__ == "__main__":
    test_multi_agent_api()