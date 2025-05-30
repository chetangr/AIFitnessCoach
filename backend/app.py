from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from api import auth, users, workouts, coach, exercises
from services.database import init_db, close_db
from utils.logger import setup_logger

# Load environment variables
load_dotenv()

# Setup logger
logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up AI Fitness Coach Backend...")
    await init_db()
    yield
    # Shutdown
    logger.info("Shutting down AI Fitness Coach Backend...")
    await close_db()

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
app.include_router(coach.router, prefix="/api/coach", tags=["AI Coach"])
app.include_router(exercises.router, prefix="/api/exercises", tags=["Exercises"])

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