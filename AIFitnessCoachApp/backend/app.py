from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import uvicorn
import os
from dotenv import load_dotenv

from api import auth, users, workouts, coach, exercises, programs, program_management
from api import measurements, fasting, settings, workout_sessions, personal_records
from api import custom_exercises, workout_templates, exercise_history, workout_schedule
from api import theme
from services.async_database import engine, db_available, sync_engine
from services.agent_service import AgentService
from utils.logger import setup_logger

# Load environment variables
load_dotenv()

# Setup logger
logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up AI Fitness Coach Backend...")
    
    # Initialize database tables
    if db_available and sync_engine:
        try:
            # Import all models to ensure they're registered
            from models.base import Base
            from models import user, workout, coach, progress, tracking, measurements, custom_content, user_program
            
            # Create all tables
            Base.metadata.create_all(bind=sync_engine)
            logger.info("Database tables created successfully")
            
            # Seed database with initial data
            from seed_database import seed_database
            logger.info("Checking database seed data...")
            asyncio.create_task(seed_database())
            
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")
    else:
        logger.warning("Database not available, skipping table creation")
    
    # Initialize agent service
    openai_api_key = os.getenv('OPENAI_API_KEY')
    if openai_api_key:
        app.state.agent_service = AgentService(openai_api_key)
        logger.info("Agent service initialized")
        
        # Pre-initialize the multi-agent coordinator for faster first response
        try:
            from api.multi_agent import get_or_create_coordinator
            from agents.multi_agent_coordinator import CoachPersonality
            logger.info("Pre-initializing multi-agent coordinator...")
            demo_coordinator = get_or_create_coordinator(
                "demo-user-001", 
                openai_api_key, 
                CoachPersonality.SUPPORTIVE
            )
            logger.info("Multi-agent coordinator pre-initialized successfully")
        except Exception as e:
            logger.error(f"Failed to pre-initialize coordinator: {e}")
    else:
        logger.warning("OPENAI_API_KEY not found, agent service not initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Fitness Coach Backend...")
    
    # Cleanup agents
    if hasattr(app.state, 'agent_service'):
        for user_id, agent in app.state.agent_service._active_agents.items():
            try:
                agent.cleanup()
            except Exception as e:
                logger.error(f"Error cleaning up agent for user {user_id}: {e}")
    
    # Close database connections
    if engine:
        await engine.dispose()

# Create FastAPI app
app = FastAPI(
    title="AI Fitness Coach API",
    description="Backend API for AI-powered fitness coaching app",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8081",
        "exp://localhost:8081",
        "*"  # Allow all origins in development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(workouts.router, prefix="/api/workouts", tags=["Workouts"])
app.include_router(coach.router, prefix="/api/coach", tags=["AI Coach (Legacy)"])

# Import and include the new agents router
from api import coach_agents, multi_agent
app.include_router(coach_agents.router, prefix="/api/agent", tags=["AI Coach Agents"])
app.include_router(multi_agent.router, prefix="/api/multi-agent", tags=["Multi-Agent System"])

app.include_router(exercises.router, prefix="/api/exercises", tags=["Exercises"])
app.include_router(programs.router, prefix="/api/programs", tags=["Training Programs"])
app.include_router(program_management.router, prefix="/api/program-management", tags=["Program Management"])

# Include new API routers
app.include_router(measurements.router, prefix="/api/measurements", tags=["Measurements"])
app.include_router(fasting.router, prefix="/api/fasting", tags=["Fasting"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(workout_sessions.router, prefix="/api/workout-sessions", tags=["Workout Sessions"])
app.include_router(personal_records.router, prefix="/api/personal-records", tags=["Personal Records"])
app.include_router(custom_exercises.router, prefix="/api/custom-exercises", tags=["Custom Exercises"])
app.include_router(workout_templates.router, prefix="/api/workout-templates", tags=["Workout Templates"])
app.include_router(exercise_history.router, prefix="/api/exercise-history", tags=["Exercise History"])
app.include_router(workout_schedule.router, prefix="/api/workout-schedule", tags=["Workout Schedule"])
app.include_router(theme.router, tags=["Dynamic Themes"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Fitness Coach Backend",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to AI Fitness Coach API",
        "documentation": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("ENV") == "development" else False
    )