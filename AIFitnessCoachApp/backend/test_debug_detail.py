#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

print("🔍 Debugging API Endpoints")
print("=" * 50)

# Login first
login_data = {
    "username": "demo@fitness.com",
    "password": "demo123"
}

print("1. Login...")
login_resp = requests.post(f"{BASE_URL}/api/auth/login-json", json=login_data)
print(f"   Status: {login_resp.status_code}")

if login_resp.status_code == 200:
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   ✅ Login successful")
    
    # Test settings endpoint with detailed error info
    print("\n2. Testing Settings API...")
    resp = requests.get(f"{BASE_URL}/api/settings", headers=headers)
    print(f"   Status: {resp.status_code}")
    
    if resp.status_code != 200:
        print(f"   Response Headers: {dict(resp.headers)}")
        print(f"   Response Body: {resp.text}")
        
        # Try to parse JSON error if available
        try:
            error_detail = resp.json()
            print(f"   Error Detail: {json.dumps(error_detail, indent=2)}")
        except:
            print(f"   Raw Response: {resp.text[:500]}")
else:
    print(f"   ❌ Login failed: {login_resp.text}")