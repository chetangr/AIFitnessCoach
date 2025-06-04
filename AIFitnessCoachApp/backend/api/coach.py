from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import json
from datetime import datetime

from models.user import User
from models.coach import CoachingSession, CoachingMessage
from services.async_database import get_db
from services.auth_service import AuthService
from services.agent_service import agent_service
from agents.openai_fitness_coach_agent import CoachPersonality
from schemas.coach import (
    ChatRequest,
    ChatResponse,
    CoachingSessionResponse,
    CoachingMessageResponse,
    WorkoutModificationRequest,
    MotivationRequest
)

router = APIRouter()
auth_service = AuthService()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_coach(
    request: ChatRequest,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Chat with AI coach using OpenAI Agents SDK"""
    try:
        # Validate personality
        personality = request.personality or CoachPersonality.SUPPORTIVE
        if personality not in [CoachPersonality.SUPPORTIVE, CoachPersonality.AGGRESSIVE, CoachPersonality.STEADY_PACE]:
            personality = CoachPersonality.SUPPORTIVE
        
        # Chat with agent
        agent_response = await agent_service.chat_with_agent(
            user=current_user,
            message=request.message,
            personality=personality,
            context=request.context
        )
        
        if agent_response['status'] == 'error':
            return ChatResponse(
                message=agent_response.get('fallback_response', 'Sorry, I encountered an error.'),
                session_id=request.session_id,
                personality=personality,
                timestamp=datetime.utcnow(),
                actions=[],
                requires_confirmation=False
            )
        
        # Parse agent response
        response_text = agent_response['response']
        
        # Save messages to database
        # Create session if needed
        session = await get_or_create_coaching_session(
            db, current_user.id, personality, request.session_id
        )
        
        # Save user message
        user_message = CoachingMessage(
            session_id=session.id,
            role="user",
            content=request.message,
            timestamp=datetime.utcnow()
        )
        db.add(user_message)
        
        # Save AI response
        ai_message = CoachingMessage(
            session_id=session.id,
            role="assistant",
            content=response_text,
            timestamp=datetime.utcnow(),
            metadata={"agent_response": agent_response}
        )
        db.add(ai_message)
        
        await db.commit()
        
        return ChatResponse(
            message=response_text,
            session_id=session.id,
            personality=personality,
            timestamp=datetime.utcnow(),
            actions=[],  # Actions are handled by the agent internally
            requires_confirmation=False,
            agent_info={
                "agent_id": agent_response.get('agent_id'),
                "session_stats": agent_response.get('session_info', {})
            }
        )
        
        ai_message = await ai_coach_service.save_message(
            db,
            session_id=session.id,
            role="assistant",
            content=response["message"],
            message_metadata=response.get("metadata")
        )
        
        return ChatResponse(
            message=response["message"],
            workout_suggestion=response.get("workout_suggestion"),
            metadata=response.get("metadata")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )

@router.get("/messages", response_model=List[CoachingMessageResponse])
async def get_coaching_messages(
    session_id: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get coaching message history"""
    messages = await ai_coach_service.get_user_messages(
        db,
        user_id=current_user.id,
        session_id=session_id,
        limit=limit
    )
    
    return [
        CoachingMessageResponse(
            id=str(msg.id),
            session_id=str(msg.session_id),
            role=msg.role,
            content=msg.content,
            message_metadata=msg.message_metadata,
            created_at=msg.created_at
        )
        for msg in messages
    ]

@router.post("/sessions", response_model=dict)
async def start_coaching_session(
    personality_type: str,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Start a new coaching session"""
    session = await ai_coach_service.create_session(
        db,
        user_id=current_user.id,
        personality_type=personality_type
    )
    
    return {"session_id": str(session.id)}

@router.post("/sessions/{session_id}/end")
async def end_coaching_session(
    session_id: str,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """End a coaching session"""
    session = await ai_coach_service.get_session(db, session_id, current_user.id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    await ai_coach_service.end_session(db, session)
    
    return {"message": "Session ended successfully"}

@router.post("/modify-workout", response_model=dict)
async def modify_workout(
    request: WorkoutModificationRequest,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Request AI to modify a workout"""
    try:
        modified_workout = await ai_coach_service.modify_workout(
            db,
            user=current_user,
            workout_id=request.workout_id,
            modification_request=request.modification_request,
            personality=request.personality
        )
        
        return {
            "workout": modified_workout,
            "message": "Workout modified successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to modify workout: {str(e)}"
        )

@router.post("/motivate", response_model=dict)
async def get_motivation(
    request: MotivationRequest,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get motivational message from AI coach"""
    try:
        message = await ai_coach_service.generate_motivational_message(
            user=current_user,
            context=request.context,
            personality=request.personality
        )
        
        return {"message": message}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate motivation: {str(e)}"
        )

@router.get("/personality/{personality_type}", response_model=dict)
async def get_coach_personality(
    personality_type: str,
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get coach personality configuration"""
    personalities = {
        "emma": {
            "name": "Emma Encourage",
            "avatar": "🤗",
            "description": "Supportive and understanding coach",
            "tone": "warm and encouraging",
            "motivation_style": "positive reinforcement"
        },
        "max": {
            "name": "Max Power",
            "avatar": "💪",
            "description": "High-energy motivational coach",
            "tone": "intense and challenging",
            "motivation_style": "aggressive motivation"
        },
        "dr_progress": {
            "name": "Dr. Progress",
            "avatar": "📊",
            "description": "Data-driven analytical coach",
            "tone": "analytical and steady",
            "motivation_style": "data-driven encouragement"
        }
    }
    
    if personality_type not in personalities:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personality type not found"
        )
    
    return personalities[personality_type]