#!/usr/bin/env python3
"""Direct API testing to see actual errors"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import asyncio
from datetime import datetime
from api.auth import login_json, LoginRequest
from schemas.auth import UserResponse

async def test_login():
    """Test the login directly"""
    print("Testing login directly...")
    
    try:
        # Create login request
        login_req = LoginRequest(
            username="demo@fitness.com",
            password="demo123"
        )
        
        # Call the login function directly
        result = await login_json(login_req, db=None)
        print(f"✅ Login successful!")
        print(f"   Token: {result.access_token[:50]}...")
        print(f"   User: {result.user.display_name}")
        
    except Exception as e:
        print(f"❌ Login failed with error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_login())