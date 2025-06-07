import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from fastapi import HTTPException
from utils.logger import setup_logger

logger = setup_logger(__name__)

# Use SQLite for development
sqlite_db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ai_fitness_coach.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{sqlite_db_path}")

# For async operations with SQLite, we need aiosqlite
ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///") if DATABASE_URL.startswith("sqlite") else DATABASE_URL

# Create async engine
try:
    engine = create_async_engine(
        ASYNC_DATABASE_URL,
        echo=True if os.getenv("ENV") == "development" else False,
    )
    
    # Create async session factory
    AsyncSessionLocal = sessionmaker(
        engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    db_available = True
except Exception as e:
    logger.warning(f"Async database connection failed: {e}. Running without database.")
    engine = None
    AsyncSessionLocal = None
    db_available = False

async def get_db():
    """Async dependency to get database session"""
    if not db_available:
        raise HTTPException(
            status_code=503,
            detail="Database service is unavailable. Please check database connection."
        )
        
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# For synchronous operations (like migrations)
if DATABASE_URL.startswith("sqlite"):
    sync_engine = create_engine(
        DATABASE_URL,
        echo=True if os.getenv("ENV") == "development" else False,
        connect_args={"check_same_thread": False}
    )
else:
    sync_engine = create_engine(DATABASE_URL)