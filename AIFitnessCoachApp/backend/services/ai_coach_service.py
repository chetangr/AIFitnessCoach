import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from openai import AsyncOpenAI

from models.user import User
from models.coach import CoachingSession, CoachingMessage
from models.workout import WorkoutPlan
from utils.logger import setup_logger

logger = setup_logger(__name__)

class AICoachService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "500"))
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
        
    def get_personality_prompt(self, personality: str) -> str:
        """Get system prompt for coach personality"""
        prompts = {
            "emma": """You are Emma Encourage, a supportive and understanding fitness coach. 
            Your personality traits:
            - Warm, encouraging, and empathetic
            - Celebrates every achievement, no matter how small
            - Uses positive reinforcement and gentle motivation
            - Offers comfort during struggles
            - Uses emojis occasionally (🌟, 💪, 🎉, ❤️)
            - Speaks in a friendly, conversational tone
            
            Always maintain this personality while providing expert fitness guidance.""",
            
            "max": """You are Max Power, an intense and high-energy fitness coach.
            Your personality traits:
            - Aggressive, motivating, and challenging
            - Pushes people to their limits
            - Uses ALL CAPS for emphasis sometimes
            - Military-style motivation
            - No excuses attitude
            - Uses intense language and power words
            - Occasional use of 🔥, 💪, 💥 emojis
            
            Always maintain this personality while providing expert fitness guidance.""",
            
            "dr_progress": """You are Dr. Progress, a methodical and analytical fitness coach.
            Your personality traits:
            - Data-driven and scientific approach
            - Focuses on measurable progress
            - Uses statistics and percentages
            - Explains the science behind recommendations
            - Calm, steady, and consistent tone
            - Professional but approachable
            - Uses 📊, 📈, 🎯 emojis sparingly
            
            Always maintain this personality while providing expert fitness guidance."""
        }
        
        return prompts.get(personality, prompts["emma"])
    
    async def generate_response(
        self,
        user: User,
        message: str,
        personality: str,
        context: Optional[Dict[str, Any]] = None,
        image_data: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate AI coach response using OpenAI API"""
        try:
            # Build context
            user_context = f"""
            User Profile:
            - Fitness Level: {user.fitness_level}
            - Goals: {', '.join(user.goals) if user.goals else 'Not specified'}
            - Current Weight: {user.current_weight}kg
            - Target Weight: {user.target_weight}kg
            - Equipment: {', '.join(user.training_equipment) if user.training_equipment else 'None specified'}
            """
            
            system_prompt = self.get_personality_prompt(personality)
            
            # Parse for workout-related requests
            workout_request = self._detect_workout_request(message)
            
            # Build messages with optional image
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "system", "content": f"User Context: {user_context}"},
            ]
            
            if image_data:
                # For GPT-4 Vision
                messages.append({
                    "role": "user",
                    "content": [
                        {"type": "text", "text": message},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                    ]
                })
            else:
                messages.append({"role": "user", "content": message})
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            ai_message = response.choices[0].message.content
            
            result = {
                "message": ai_message,
                "metadata": {
                    "personality": personality,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
            
            # Add workout suggestion if detected
            if workout_request:
                # TODO: Generate actual workout based on request
                result["workout_suggestion"] = await self._generate_workout_suggestion(
                    user, workout_request
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            raise
    
    def _detect_workout_request(self, message: str) -> Optional[str]:
        """Detect if message contains workout request"""
        workout_keywords = [
            "workout", "exercise", "routine", "plan", "suggest",
            "create", "make", "build", "design", "today",
            "tomorrow", "week", "quick", "hiit", "strength"
        ]
        
        message_lower = message.lower()
        for keyword in workout_keywords:
            if keyword in message_lower:
                return message
        
        return None
    
    async def _generate_workout_suggestion(
        self,
        user: User,
        request: str
    ) -> Optional[Dict[str, Any]]:
        """Generate workout suggestion based on request"""
        # TODO: Implement actual workout generation logic
        # This is a placeholder
        return {
            "name": "AI Suggested Workout",
            "description": "Custom workout based on your request",
            "duration_minutes": 30,
            "difficulty": user.fitness_level,
            "exercises": []
        }
    
    async def modify_workout(
        self,
        db: AsyncSession,
        user: User,
        workout_id: str,
        modification_request: str,
        personality: str
    ) -> Dict[str, Any]:
        """Modify existing workout based on user request"""
        # TODO: Implement workout modification logic
        pass
    
    async def generate_motivational_message(
        self,
        user: User,
        context: str,
        personality: str
    ) -> str:
        """Generate motivational message using OpenAI API"""
        try:
            system_prompt = self.get_personality_prompt(personality)
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Give me a motivational message for: {context}"}
            ]
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.8,
                max_tokens=200
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating motivational message: {str(e)}")
            raise
    
    async def get_or_create_session(
        self,
        db: AsyncSession,
        user_id: str,
        personality_type: str,
        session_id: Optional[str] = None
    ) -> CoachingSession:
        """Get existing session or create new one"""
        if session_id:
            stmt = select(CoachingSession).where(
                CoachingSession.id == session_id,
                CoachingSession.user_id == user_id
            )
            result = await db.execute(stmt)
            session = result.scalar_one_or_none()
            if session:
                return session
        
        return await self.create_session(db, user_id, personality_type)
    
    async def create_session(
        self,
        db: AsyncSession,
        user_id: str,
        personality_type: str
    ) -> CoachingSession:
        """Create new coaching session"""
        session = CoachingSession(
            user_id=user_id,
            personality_type=personality_type,
            conversation_context={},
            session_start=datetime.utcnow()
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        return session
    
    async def get_session(
        self,
        db: AsyncSession,
        session_id: str,
        user_id: str
    ) -> Optional[CoachingSession]:
        """Get coaching session"""
        stmt = select(CoachingSession).where(
            CoachingSession.id == session_id,
            CoachingSession.user_id == user_id
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def end_session(
        self,
        db: AsyncSession,
        session: CoachingSession
    ) -> None:
        """End coaching session"""
        session.session_end = datetime.utcnow()
        await db.commit()
    
    async def save_message(
        self,
        db: AsyncSession,
        session_id: str,
        role: str,
        content: str,
        message_metadata: Optional[Dict[str, Any]] = None
    ) -> CoachingMessage:
        """Save coaching message"""
        message = CoachingMessage(
            session_id=session_id,
            role=role,
            content=content,
            message_metadata=message_metadata or {}
        )
        db.add(message)
        
        # Update session message count
        stmt = select(CoachingSession).where(CoachingSession.id == session_id)
        result = await db.execute(stmt)
        session = result.scalar_one()
        session.message_count += 1
        
        await db.commit()
        await db.refresh(message)
        return message
    
    async def get_user_messages(
        self,
        db: AsyncSession,
        user_id: str,
        session_id: Optional[str] = None,
        limit: int = 50
    ) -> List[CoachingMessage]:
        """Get user's coaching messages"""
        if session_id:
            stmt = (
                select(CoachingMessage)
                .where(CoachingMessage.session_id == session_id)
                .order_by(desc(CoachingMessage.created_at))
                .limit(limit)
            )
        else:
            # Get messages from all user's sessions
            stmt = (
                select(CoachingMessage)
                .join(CoachingSession)
                .where(CoachingSession.user_id == user_id)
                .order_by(desc(CoachingMessage.created_at))
                .limit(limit)
            )
        
        result = await db.execute(stmt)
        messages = result.scalars().all()
        
        # Return in chronological order
        return list(reversed(messages))