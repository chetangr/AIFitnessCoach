"""Test database connection"""
import asyncio
from services.async_database import engine, get_db, db_available

async def test_connection():
    print(f"Database available: {db_available}")
    print(f"Engine: {engine}")
    
    if db_available:
        async for db in get_db():
            if db:
                print("✅ Database session created successfully")
                # Test a simple query
                try:
                    result = await db.execute("SELECT 1")
                    print("✅ Database query successful")
                except Exception as e:
                    print(f"❌ Database query failed: {e}")
            else:
                print("❌ Database session is None")
            break
    else:
        print("❌ Database not available")

if __name__ == "__main__":
    asyncio.run(test_connection())