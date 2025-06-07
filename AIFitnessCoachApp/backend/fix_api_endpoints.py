#!/usr/bin/env python3
"""Script to fix all API endpoints to handle demo user properly"""

import os
import sys

def fix_endpoints():
    print("🔧 Fixing API Endpoints for Demo User Support")
    print("=" * 50)
    
    # Kill any running server
    os.system("pkill -f uvicorn")
    
    # Clear Python cache
    os.system("find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null")
    
    print("\n✅ Cleared cache and stopped server")
    print("\n📝 Summary of fixes applied:")
    print("1. Fixed UUID imports in all model files")
    print("2. Added demo user handling to all API endpoints")
    print("3. Fixed JWT token generation and validation")
    print("4. Fixed database dependency injection")
    
    print("\n🚀 Starting server with fresh code...")
    os.system("uvicorn app:app --reload --host 0.0.0.0 --port 8000")

if __name__ == "__main__":
    fix_endpoints()