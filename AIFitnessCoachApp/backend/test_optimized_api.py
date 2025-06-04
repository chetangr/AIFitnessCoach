#!/usr/bin/env python3
"""Test optimized multi-agent API with fast mode"""
import requests
import json
import time
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def test_performance_comparison():
    """Compare performance between normal and fast mode"""
    
    print("Testing Multi-Agent API Performance...")
    print(f"OPENAI_API_KEY exists: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
    
    url = "http://localhost:8000/api/multi-agent/chat/demo"
    
    # Test case: User with neck pain
    base_payload = {
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
    
    # Test 1: Fast mode (primary coach only)
    print("\n1. Testing FAST MODE (primary coach only)...")
    fast_payload = {**base_payload, "fast_mode": True}
    
    start_time = time.time()
    try:
        response = requests.post(url, json=fast_payload, headers=headers, timeout=30)
        fast_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Fast mode completed in {fast_time:.2f} seconds")
            print(f"  - Responding agents: {len(data.get('responding_agents', []))}")
            print(f"  - Action items: {len(data.get('action_items', []))}")
            print(f"  - Message preview: {data.get('primary_message', '')[:100]}...")
        else:
            print(f"✗ Fast mode failed: {response.status_code}")
    except Exception as e:
        fast_time = time.time() - start_time
        print(f"✗ Fast mode error after {fast_time:.2f}s: {str(e)}")
    
    # Wait a bit between tests
    print("\nWaiting 3 seconds before next test...")
    time.sleep(3)
    
    # Test 2: Normal mode (multiple agents)
    print("\n2. Testing NORMAL MODE (multiple agents)...")
    normal_payload = {**base_payload, "fast_mode": False}
    
    start_time = time.time()
    try:
        response = requests.post(url, json=normal_payload, headers=headers, timeout=60)
        normal_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Normal mode completed in {normal_time:.2f} seconds")
            print(f"  - Responding agents: {len(data.get('responding_agents', []))}")
            for agent in data.get('responding_agents', []):
                print(f"    • {agent.get('emoji', '')} {agent.get('name', 'Unknown')}")
            print(f"  - Action items: {len(data.get('action_items', []))}")
        else:
            print(f"✗ Normal mode failed: {response.status_code}")
    except Exception as e:
        normal_time = time.time() - start_time
        print(f"✗ Normal mode error after {normal_time:.2f}s: {str(e)}")
    
    # Summary
    print("\n" + "="*50)
    print("PERFORMANCE SUMMARY")
    print("="*50)
    if 'fast_time' in locals():
        print(f"Fast mode: {fast_time:.2f} seconds")
    if 'normal_time' in locals():
        print(f"Normal mode: {normal_time:.2f} seconds")
    if 'fast_time' in locals() and 'normal_time' in locals():
        speedup = normal_time / fast_time
        print(f"Speed improvement: {speedup:.1f}x faster in fast mode")

def test_cache_performance():
    """Test cache effectiveness"""
    print("\n\nTesting Cache Performance...")
    
    url = "http://localhost:8000/api/multi-agent/chat/demo"
    
    # Simple query to test caching
    payload = {
        "message": "What should I eat after workout?",
        "personality": "supportive",
        "fast_mode": True
    }
    
    headers = {"Content-Type": "application/json"}
    
    # First request (cache miss)
    print("\n1. First request (cache miss)...")
    start_time = time.time()
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        first_time = time.time() - start_time
        print(f"✓ First request: {first_time:.2f} seconds")
    except Exception as e:
        print(f"✗ First request failed: {e}")
        return
    
    # Second request (should be cached)
    print("\n2. Second request (should hit cache)...")
    start_time = time.time()
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        second_time = time.time() - start_time
        print(f"✓ Second request: {second_time:.2f} seconds")
        
        if second_time < first_time * 0.5:
            print("✓ Cache is working! Second request was significantly faster.")
        else:
            print("⚠️  Cache might not be working as expected.")
    except Exception as e:
        print(f"✗ Second request failed: {e}")

if __name__ == "__main__":
    test_performance_comparison()
    test_cache_performance()