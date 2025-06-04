import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from utils.logger import setup_logger

logger = setup_logger(__name__)

# Use SQLite for development - no external database required
# The database file will be created in the backend directory
sqlite_db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ai_fitness_coach.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{sqlite_db_path}")

# Handle async SQLite URLs
if DATABASE_URL.startswith("sqlite+aiosqlite://"):
    DATABASE_URL = DATABASE_URL.replace("sqlite+aiosqlite://", "sqlite:///")

# Create engine with error handling
try:
    # SQLite doesn't support pool_size and max_overflow
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL,
            echo=True if os.getenv("ENV") == "development" else False,
            connect_args={"check_same_thread": False}  # Needed for SQLite
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            echo=True if os.getenv("ENV") == "development" else False,
            pool_size=int(os.getenv("DATABASE_POOL_SIZE", "20")),
            max_overflow=int(os.getenv("DATABASE_MAX_OVERFLOW", "40")),
        )
    
    # Create session factory
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db_available = True
except Exception as e:
    logger.warning(f"Database connection failed: {e}. Running without database.")
    engine = None
    SessionLocal = None
    db_available = False

async def init_db():
    """Initialize database - create tables"""
    if not db_available:
        logger.warning("Database not available, skipping initialization")
        return
        
    try:
        # Import all models to ensure they're registered
        from models.base import Base
        from models import user, workout, coach, progress
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")

async def close_db():
    """Close database connections"""
    if engine:
        engine.dispose()

def get_db():
    """Dependency to get database session"""
    if not db_available:
        yield None
        return
        
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()