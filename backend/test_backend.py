#!/usr/bin/env python3
"""
Simple backend test script
Run this to verify the backend can start
"""

import sys
import os
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test that all imports work correctly"""
    try:
        print("Testing imports...")
        
        # Test FastAPI import
        from fastapi import FastAPI
        print("✅ FastAPI imported successfully")
        
        # Test SQLAlchemy import
        from sqlalchemy.ext.asyncio import create_async_engine
        print("✅ SQLAlchemy imported successfully")
        
        # Test models
        from models.base import BaseModel
        print("✅ Base model imported successfully")
        
        from models.user import User
        print("✅ User model imported successfully")
        
        # Test services
        from services.auth_service import AuthService
        print("✅ Auth service imported successfully")
        
        # Test API routes
        from api.auth import router as auth_router
        print("✅ Auth API imported successfully")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_app_creation():
    """Test that the FastAPI app can be created"""
    try:
        print("\nTesting app creation...")
        from app import app
        print("✅ FastAPI app created successfully")
        print(f"✅ App title: {app.title}")
        return True
    except Exception as e:
        print(f"❌ App creation error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Running Backend Tests...")
    print("=" * 50)
    
    success = True
    
    # Test imports
    if not test_imports():
        success = False
    
    # Test app creation
    if not test_app_creation():
        success = False
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! Backend is ready.")
        print("\nTo start the backend:")
        print("  python app.py")
        print("\nAPI docs will be available at:")
        print("  http://localhost:8000/docs")
    else:
        print("❌ Some tests failed. Check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())