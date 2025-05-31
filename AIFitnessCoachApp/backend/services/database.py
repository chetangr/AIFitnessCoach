import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from contextlib import asynccontextmanager

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/ai_fitness_coach")

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True if os.getenv("ENV") == "development" else False,
    pool_size=int(os.getenv("DATABASE_POOL_SIZE", "20")),
    max_overflow=int(os.getenv("DATABASE_MAX_OVERFLOW", "40")),
)

# Create async session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def init_db():
    """Initialize database - create tables"""
    async with engine.begin() as conn:
        # Import all models to ensure they're registered
        from models.base import Base
        from models import user, workout, coach, progress
        await conn.run_sync(Base.metadata.create_all)

async def close_db():
    """Close database connections"""
    await engine.dispose()

async def get_db():
    """Dependency to get database session"""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()