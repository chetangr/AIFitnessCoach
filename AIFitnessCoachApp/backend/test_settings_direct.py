#!/usr/bin/env python3
"""Direct settings API testing"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import asyncio
from api.settings import get_user_settings
from services.auth_service import AuthService

async def test_settings():
    """Test settings endpoint directly"""
    print("Testing settings API directly...")
    
    try:
        # Mock the dependency injection
        user_id = "demo-user-001"
        
        # Call the settings function directly
        result = await get_user_settings(user_id=user_id, db=None)
        print(f"✅ Settings retrieved!")
        print(f"   Result: {result}")
        
    except Exception as e:
        print(f"❌ Settings failed with error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_settings())