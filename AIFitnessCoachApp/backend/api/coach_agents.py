"""
Clean coach API using OpenAI Agents SDK
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import json
from datetime import datetime

from models.user import User
from models.coach import CoachingSession, CoachingMessage
from services.async_database import get_db
from services.auth_service import AuthService
# Agent service will be accessed from app state
from agents.openai_fitness_coach_agent import CoachPersonality
from schemas.coach import (
    ChatRequest,
    ChatResponse,
    CoachingSessionResponse,
    CoachingMessageResponse
)

router = APIRouter()
auth_service = AuthService()

async def get_or_create_coaching_session(
    db: AsyncSession, 
    user_id: str, 
    personality: str, 
    session_id: Optional[str] = None
) -> CoachingSession:
    """Get existing or create new coaching session"""
    
    if session_id:
        session = await db.get(CoachingSession, session_id)
        if session and session.user_id == user_id:
            return session
    
    # Create new session
    session = CoachingSession(
        user_id=user_id,
        personality=personality,
        created_at=datetime.utcnow(),
        is_active=True
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    chat_request: ChatRequest,
    request: Request,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Chat with AI fitness coach using OpenAI Agents SDK
    """
    try:
        # Get agent service from app state
        if not hasattr(request.app.state, 'agent_service'):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Agent service not available. Please check OpenAI API key configuration."
            )
        
        agent_service = request.app.state.agent_service
        
        # Validate personality
        personality = chat_request.personality or CoachPersonality.SUPPORTIVE
        if personality not in [CoachPersonality.SUPPORTIVE, CoachPersonality.AGGRESSIVE, CoachPersonality.STEADY_PACE]:
            personality = CoachPersonality.SUPPORTIVE
        
        # Chat with agent
        agent_response = await agent_service.chat_with_agent(
            user=current_user,
            message=chat_request.message,
            personality=personality,
            context=chat_request.context
        )
        
        # Handle agent errors
        if agent_response['status'] == 'error':
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=agent_response.get('error', 'Agent communication failed')
            )
        
        # Get response text
        response_text = agent_response['response']
        
        # Get or create session for database logging
        session = await get_or_create_coaching_session(
            db, 
            str(current_user.id), 
            personality, 
            chat_request.session_id
        )
        
        # Save user message
        user_message = CoachingMessage(
            session_id=session.id,
            role="user",
            content=chat_request.message,
            timestamp=datetime.utcnow(),
            metadata=chat_request.context or {}
        )
        db.add(user_message)
        
        # Save AI response
        ai_message = CoachingMessage(
            session_id=session.id,
            role="assistant",
            content=response_text,
            timestamp=datetime.utcnow(),
            metadata={
                "agent_id": agent_response.get('agent_id'),
                "personality": personality,
                "session_stats": agent_response.get('session_info', {})
            }
        )
        db.add(ai_message)
        
        await db.commit()
        
        return ChatResponse(
            message=response_text,
            session_id=str(session.id),
            personality=personality,
            timestamp=datetime.utcnow(),
            actions=[],  # Actions handled internally by agent
            requires_confirmation=False,
            agent_info={
                "agent_id": agent_response.get('agent_id'),
                "session_stats": agent_response.get('session_info', {}),
                "personality": personality
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat service error: {str(e)}"
        )

@router.get("/agent/state")
async def get_agent_state(
    request: Request,
    current_user: User = Depends(auth_service.get_current_user)
) -> Dict[str, Any]:
    """
    Get current state of user's agent
    """
    try:
        if not hasattr(request.app.state, 'agent_service'):
            return {
                "status": "no_service",
                "message": "Agent service not available"
            }
        
        agent_service = request.app.state.agent_service
        state = await agent_service.get_agent_state(str(current_user.id))
        
        if not state:
            return {
                "status": "no_agent",
                "message": "No active agent found for user"
            }
        
        return {
            "status": "success",
            "agent_state": state
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting agent state: {str(e)}"
        )

@router.post("/agent/clear")
async def clear_agent_conversation(
    request: Request,
    current_user: User = Depends(auth_service.get_current_user)
) -> Dict[str, str]:
    """
    Clear agent conversation history
    """
    try:
        if not hasattr(request.app.state, 'agent_service'):
            return {"status": "error", "message": "Agent service not available"}
        
        agent_service = request.app.state.agent_service
        success = await agent_service.clear_agent_conversation(str(current_user.id))
        
        if success:
            return {"status": "success", "message": "Conversation cleared"}
        else:
            return {"status": "error", "message": "No active agent to clear"}
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing conversation: {str(e)}"
        )

@router.post("/agent/preferences")
async def update_agent_preferences(
    preferences: Dict[str, Any],
    request: Request,
    current_user: User = Depends(auth_service.get_current_user)
) -> Dict[str, str]:
    """
    Update user preferences in agent
    """
    try:
        if not hasattr(request.app.state, 'agent_service'):
            return {"status": "error", "message": "Agent service not available"}
        
        agent_service = request.app.state.agent_service
        success = await agent_service.update_user_preferences(
            str(current_user.id), 
            preferences
        )
        
        if success:
            return {"status": "success", "message": "Preferences updated"}
        else:
            return {"status": "error", "message": "No active agent to update"}
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating preferences: {str(e)}"
        )

@router.get("/stats")
async def get_agent_stats(
    request: Request,
    current_user: User = Depends(auth_service.get_current_user)
) -> Dict[str, Any]:
    """
    Get agent service statistics (admin endpoint)
    """
    try:
        if not hasattr(request.app.state, 'agent_service'):
            return {
                "status": "error",
                "stats": {}
            }
        
        agent_service = request.app.state.agent_service
        stats = agent_service.get_session_stats()
        return {
            "status": "success",
            "stats": stats
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting stats: {str(e)}"
        )

@router.get("/messages", response_model=List[CoachingMessageResponse])
async def get_coaching_messages(
    session_id: Optional[str] = None,
    limit: int = 50,
    current_user: Optional[User] = Depends(auth_service.get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get coaching message history"""
    try:
        # For now, just return empty list since we're in demo mode
        # This avoids all the UUID/SQLite compatibility issues
        return []
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting messages: {str(e)}"
        )