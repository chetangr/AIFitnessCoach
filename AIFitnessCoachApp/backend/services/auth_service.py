import os
import jwt
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

from models.user import User
from schemas.auth import UserRegister
from services.async_database import get_db

# Load environment variables
load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

JWT_SECRET = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET:
    # Generate a random secret for development, but warn the user
    import secrets
    JWT_SECRET = secrets.token_urlsafe(32)
    print("⚠️  WARNING: No JWT_SECRET_KEY found in environment. Generated temporary key for development.")
    print("⚠️  Set JWT_SECRET_KEY environment variable for production!")

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "10080"))  # 7 days

class AuthService:
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: dict) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt
    
    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email"""
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_user_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        """Get user by username"""
        stmt = select(User).where(User.username == username)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def authenticate_user(self, db: AsyncSession, username_or_email: str, password: str) -> Optional[User]:
        """Authenticate user with username/email and password"""
        # Try email first
        user = await self.get_user_by_email(db, username_or_email)
        if not user:
            # Try username
            user = await self.get_user_by_username(db, username_or_email)
        
        if not user:
            return None
        
        if not self.verify_password(password, user.password_hash):
            return None
        
        return user
    
    async def create_user(self, db: AsyncSession, user_data: UserRegister, is_demo: bool = False) -> User:
        """Create new user"""
        user = User(
            email=user_data.email,
            username=user_data.username,
            password_hash=self.get_password_hash(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            fitness_level=user_data.fitness_level,
            display_name=f"{user_data.first_name} {user_data.last_name}".strip() or user_data.username,
            is_verified=is_demo,  # Auto-verify demo users
            onboarding_completed=is_demo  # Demo users have completed onboarding
        )
        
        if is_demo:
            # Set demo user preferences
            user.goals = ["muscle_gain", "endurance", "general_fitness"]
            user.preferred_coach_id = "emma"
            user.training_equipment = ["dumbbells", "resistance_bands", "yoga_mat"]
            user.current_weight = 75.0
            user.target_weight = 70.0
            user.height = 175
            user.age = 28
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    
    async def get_current_user(
        self,
        token: str = Depends(oauth2_scheme),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        """Get current authenticated user from JWT token"""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        # Handle demo tokens
        if token.startswith('demo-token-'):
            from types import SimpleNamespace
            return SimpleNamespace(
                id="demo-user-001",
                email="demo@fitness.com",
                display_name="Demo User",
                username="demo",
                created_at=datetime.utcnow(),
                is_verified=True,
                onboarding_completed=True,
                fitness_level="intermediate"
            )
        
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            # Handle both formats for backwards compatibility
            user_id: str = payload.get("sub")  # New format uses sub for user_id
            email: str = payload.get("email")
            
            # For older tokens that use the old format
            if user_id is None:
                user_id = payload.get("user_id")
                email = payload.get("sub")
            
            if user_id is None:
                raise credentials_exception
        except jwt.PyJWTError:
            raise credentials_exception
        
        # Handle demo user without database
        if user_id == "demo-user-001" and email == "demo@fitness.com":
            # Create a mock user object for demo
            from types import SimpleNamespace
            demo_user = SimpleNamespace(
                id="demo-user-001",
                email="demo@fitness.com",
                display_name="Demo User",
                username="demo",
                first_name="Demo",
                last_name="User",
                created_at=datetime.utcnow(),
                is_verified=True,
                onboarding_completed=True,
                fitness_level="intermediate",
                password_hash="",
                goals=["muscle_gain", "strength"],
                current_weight=75.0,
                target_weight=80.0,
                height=180,
                age=30,
                preferred_coach_id="coach-maya",
                is_active=True
            )
            return demo_user
        
        # For real users, query database
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user is None:
            raise credentials_exception
        
        return user
    
    async def get_optional_current_user(
        self,
        token: Optional[str] = Depends(oauth2_scheme),
        db: AsyncSession = Depends(get_db)
    ) -> Optional[User]:
        """Get current user if authenticated, return None if not"""
        if not token:
            return None
        
        try:
            return await self.get_current_user(token, db)
        except HTTPException:
            return None

# Create global instance
auth_service = AuthService()

# Helper function for getting current user ID
async def get_current_user_id(
    current_user: User = Depends(auth_service.get_current_user)
) -> str:
    """Get the current user's ID"""
    return str(current_user.id)