from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from typing import Optional
import os

from models.user import User
from services.async_database import get_db
from services.auth_service import AuthService
from utils.validators import validate_email, validate_password
from schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

auth_service = AuthService()

@router.post("/demo-login", response_model=TokenResponse)
async def demo_login():
    """Demo login endpoint for development - provides real JWT token"""
    # Create a demo user object
    demo_user = User(
        id="demo-user-001",
        email="demo@fitness.com",
        display_name="Demo User",
        created_at=datetime.utcnow()
    )
    
    # Generate real JWT token for demo user
    access_token = auth_service.create_access_token(
        data={"sub": demo_user.email, "user_id": demo_user.id}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=demo_user.id,
            email=demo_user.email,
            display_name=demo_user.display_name,
            created_at=demo_user.created_at
        )
    )

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    # Validate email and password
    if not validate_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    if not validate_password(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
        )
    
    # Check if user already exists
    existing_user = await auth_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    existing_username = await auth_service.get_user_by_username(db, user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken"
        )
    
    # Create new user
    user = await auth_service.create_user(db, user_data)
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        display_name=user.display_name,
        fitness_level=user.fitness_level,
        onboarding_completed=user.onboarding_completed
    )

@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login with username/email and password (form data)"""
    # Try to authenticate with email or username
    user = await auth_service.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            display_name=user.display_name,
            fitness_level=user.fitness_level,
            onboarding_completed=user.onboarding_completed
        )
    )

from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login-json", response_model=TokenResponse)
async def login_json(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login with username/email and password (JSON body)"""
    # Handle demo credentials
    if login_data.username == "demo@fitness.com" and login_data.password == "demo123":
        # Generate real JWT token for demo user
        access_token = auth_service.create_access_token(
            data={"sub": "demo@fitness.com", "user_id": "demo-user-001"}
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id="demo-user-001",
                email="demo@fitness.com",
                display_name="Demo User",
                username="demo",
                created_at=datetime.utcnow()
            )
        )
    
    # Try to authenticate with email or username
    user = await auth_service.authenticate_user(db, login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            display_name=user.display_name,
            fitness_level=user.fitness_level,
            onboarding_completed=user.onboarding_completed
        )
    )

@router.post("/token", response_model=TokenResponse)
async def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """OAuth2 compatible token endpoint"""
    return await login(form_data, db)

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get current authenticated user"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        display_name=current_user.display_name,
        fitness_level=current_user.fitness_level,
        onboarding_completed=current_user.onboarding_completed,
        preferred_coach_id=current_user.preferred_coach_id,
        goals=current_user.goals,
        current_weight=current_user.current_weight,
        target_weight=current_user.target_weight,
        height=current_user.height
    )

@router.post("/logout")
async def logout(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Logout current user (client should remove token)"""
    # In a JWT-based system, logout is handled client-side
    # Here we can add token to a blacklist if needed
    return {"message": "Successfully logged out"}

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Refresh access token"""
    access_token = auth_service.create_access_token(
        data={"sub": str(current_user.id), "email": current_user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(current_user.id),
            email=current_user.email,
            username=current_user.username,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            display_name=current_user.display_name,
            fitness_level=current_user.fitness_level,
            onboarding_completed=current_user.onboarding_completed
        )
    )

@router.post("/demo")
async def create_demo_user(db: AsyncSession = Depends(get_db)):
    """Create or get demo user for testing"""
    demo_email = "demo@fitness.com"
    demo_username = "demo_user"
    
    # Check if demo user exists
    existing_user = await auth_service.get_user_by_email(db, demo_email)
    if existing_user:
        # Login demo user
        access_token = auth_service.create_access_token(
            data={"sub": str(existing_user.id), "email": existing_user.email}
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=str(existing_user.id),
                email=existing_user.email,
                username=existing_user.username,
                first_name=existing_user.first_name,
                last_name=existing_user.last_name,
                display_name=existing_user.display_name,
                fitness_level=existing_user.fitness_level,
                onboarding_completed=existing_user.onboarding_completed
            )
        )
    
    # Create demo user
    demo_data = UserRegister(
        email=demo_email,
        username=demo_username,
        password="demo123",
        first_name="Demo",
        last_name="User",
        fitness_level="intermediate"
    )
    
    user = await auth_service.create_user(db, demo_data, is_demo=True)
    
    # Create access token
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            display_name=user.display_name,
            fitness_level=user.fitness_level,
            onboarding_completed=user.onboarding_completed
        )
    )