#!/usr/bin/env python3
"""Debug JWT token issues"""
import requests
import jwt
import json

BASE_URL = "http://localhost:8000"
JWT_SECRET = "dev-jwt-secret-key-change-in-production-xyz123"  # Same as in .env

# Get token from demo login
resp = requests.post(f"{BASE_URL}/api/auth/demo-login", json={})
if resp.status_code == 200:
    data = resp.json()
    token = data['access_token']
    print(f"Token obtained: {token[:50]}...")
    
    # Decode token to see contents
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        print(f"\nToken payload:")
        print(json.dumps(payload, indent=2))
    except Exception as e:
        print(f"\nError decoding token: {e}")
        # Try without verification
        payload = jwt.decode(token, options={"verify_signature": False})
        print(f"\nToken payload (unverified):")
        print(json.dumps(payload, indent=2))
    
    # Test an endpoint
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/api/settings", headers=headers)
    print(f"\nSettings endpoint response: {resp.status_code}")
    if resp.status_code != 200:
        print(f"Error: {resp.text}")
else:
    print(f"Login failed: {resp.status_code} - {resp.text}")