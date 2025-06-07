#!/usr/bin/env python3
"""Test server health and basic endpoints"""
import requests

BASE_URL = "http://localhost:8000"

print("Testing server health...")

# Test root endpoint
try:
    resp = requests.get(f"{BASE_URL}/")
    print(f"Root endpoint: {resp.status_code}")
    if resp.status_code == 200:
        print(f"Response: {resp.json()}")
except Exception as e:
    print(f"Root endpoint error: {e}")

# Test health endpoint
try:
    resp = requests.get(f"{BASE_URL}/health")
    print(f"\nHealth endpoint: {resp.status_code}")
    if resp.status_code == 200:
        print(f"Response: {resp.json()}")
except Exception as e:
    print(f"Health endpoint error: {e}")

# Test OpenAPI docs
try:
    resp = requests.get(f"{BASE_URL}/docs")
    print(f"\nOpenAPI docs: {resp.status_code}")
except Exception as e:
    print(f"OpenAPI docs error: {e}")

# Test demo login endpoint directly
print("\n\nTesting demo login...")
try:
    resp = requests.post(
        f"{BASE_URL}/api/auth/demo-login",
        headers={"Content-Type": "application/json"}
    )
    print(f"Demo login: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Token: {data.get('access_token', 'N/A')[:30]}...")
    else:
        print(f"Response: {resp.text}")
except Exception as e:
    print(f"Demo login error: {e}")