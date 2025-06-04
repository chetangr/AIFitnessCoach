"""
Multi-Agent API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import os

from models.user import User
from services.async_database import get_db
from services.auth_service import AuthService
from agents.multi_agent_coordinator import MultiAgentCoordinator, AgentType, CoachPersonality
from schemas.coach import ChatResponse
from pydantic import BaseModel, Field
from utils.logger import setup_logger

router = APIRouter()
auth_service = AuthService()
logger = setup_logger(__name__)

# Real authentication required - no test mode

# Request/Response models
class MultiAgentChatRequest(BaseModel):
    message: str = Field(..., description="User's message or query")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    required_agents: Optional[List[str]] = Field(None, description="Specific agents to consult")
    personality: Optional[str] = Field(CoachPersonality.SUPPORTIVE, description="Primary coach personality")
    fast_mode: Optional[bool] = Field(False, description="Enable fast mode (primary coach only)")
    single_agent_mode: Optional[bool] = Field(False, description="Use only the specified agent(s) without primary coach")

class AgentInsight(BaseModel):
    agent: str
    message: str
    confidence: float
    recommendations: List[str]

class MultiAgentChatResponse(BaseModel):
    primary_message: str
    agent_insights: List[AgentInsight]
    consensus_recommendations: List[str]
    action_items: List[Dict[str, Any]]
    confidence_score: float
    timestamp: datetime
    responding_agents: List[Dict[str, str]]  # Which agents responded

class ComprehensiveAssessmentRequest(BaseModel):
    user_data: Optional[Dict[str, Any]] = Field(None, description="User fitness data")
    include_areas: Optional[List[str]] = Field(None, description="Specific areas to assess")

class EmergencyRequest(BaseModel):
    situation: str = Field(..., description="Description of emergency situation")
    severity: str = Field("moderate", description="Severity level: mild, moderate, severe")
    additional_info: Optional[Dict[str, Any]] = Field(None, description="Additional context")

# Cache for active coordinators
coordinator_cache: Dict[str, MultiAgentCoordinator] = {}

def get_or_create_coordinator(user_id: str, api_key: str, personality: str) -> MultiAgentCoordinator:
    """Get existing coordinator or create new one"""
    cache_key = f"{user_id}_{personality}"
    
    if cache_key not in coordinator_cache:
        coordinator_cache[cache_key] = MultiAgentCoordinator(
            api_key=api_key,
            user_id=user_id,
            primary_personality=personality
        )
    
    return coordinator_cache[cache_key]

@router.post("/chat/demo", response_model=MultiAgentChatResponse)
async def multi_agent_chat_demo(
    chat_request: MultiAgentChatRequest,
    request: Request
):
    """
    Demo chat endpoint that works without authentication
    """
    try:
        # Check if OpenAI API key is configured
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            # Return a fallback response if no API key
            return MultiAgentChatResponse(
                primary_message="I'm your AI fitness coach! I notice the backend isn't fully configured yet. Once the OpenAI API key is set up, I'll be able to provide personalized workout plans, form guidance, nutrition advice, and recovery strategies. For now, feel free to ask me anything about fitness!",
                agent_insights=[],
                consensus_recommendations=["Set up OpenAI API key in backend .env file", "Configure database for full functionality"],
                action_items=[],
                confidence_score=1.0,
                timestamp=datetime.now(),
                responding_agents=[{
                    "type": "fitness_coach",
                    "name": "AI Coach",
                    "emoji": "💪",
                    "confidence": "high"
                }]
            )
        
        # Use demo user ID
        demo_user_id = "demo-user-001"
        
        # Get or create coordinator
        coordinator = get_or_create_coordinator(
            demo_user_id,
            api_key,
            chat_request.personality
        )
        
        # Convert agent strings to AgentType enums if specified
        required_agents = None
        if chat_request.required_agents:
            required_agents = []
            for agent_str in chat_request.required_agents:
                try:
                    required_agents.append(AgentType(agent_str))
                except ValueError:
                    # Skip invalid agent types
                    pass
        
        # Fast mode: Only use primary coach for quick responses
        if chat_request.fast_mode:
            required_agents = [AgentType.PRIMARY_COACH]
            logger.info("Fast mode enabled - using primary coach only")
        
        # Add single agent mode flag to context if needed
        enhanced_context = chat_request.context or {}
        if chat_request.single_agent_mode:
            enhanced_context['single_agent_mode'] = True
            logger.info(f"Single agent mode enabled - using only: {required_agents}")
        
        # Process query through multi-agent system
        coordinated_response = await coordinator.process_user_query(
            query=chat_request.message,
            context=enhanced_context,
            required_agents=required_agents
        )
        
        # Convert to API response format
        agent_insights = [
            AgentInsight(
                agent=insight.agent_type.value,
                message=insight.message,
                confidence=insight.confidence,
                recommendations=insight.recommendations
            )
            for insight in coordinated_response.agent_insights
        ]
        
        return MultiAgentChatResponse(
            primary_message=coordinated_response.primary_message,
            agent_insights=agent_insights,
            consensus_recommendations=coordinated_response.consensus_recommendations,
            action_items=coordinated_response.action_items,
            confidence_score=coordinated_response.confidence_score,
            timestamp=datetime.now(),
            responding_agents=coordinated_response.responding_agents
        )
        
    except Exception as e:
        logger.error(f"Error in demo chat: {str(e)}")
        # Return friendly error message
        return MultiAgentChatResponse(
            primary_message=f"I'm having trouble connecting right now. Please make sure the backend is properly configured. Error: {str(e)}",
            agent_insights=[],
            consensus_recommendations=["Check backend logs", "Verify API configuration"],
            action_items=[],
            confidence_score=0.5,
            timestamp=datetime.now(),
            responding_agents=[]
        )

@router.post("/chat", response_model=MultiAgentChatResponse)
async def multi_agent_chat(
    chat_request: MultiAgentChatRequest,
    request: Request,
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Chat with multiple specialized AI agents
    """
    try:
        # Get API key from app state
        if not hasattr(request.app.state, 'agent_service'):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Multi-agent service not available. Please check configuration."
            )
        
        api_key = request.app.state.agent_service.openai_api_key
        
        # Get or create coordinator
        coordinator = get_or_create_coordinator(
            str(current_user.id),
            api_key,
            chat_request.personality
        )
        
        # Convert agent strings to AgentType enums if specified
        required_agents = None
        if chat_request.required_agents:
            required_agents = []
            for agent_str in chat_request.required_agents:
                try:
                    required_agents.append(AgentType(agent_str))
                except ValueError:
                    # Skip invalid agent types
                    pass
        
        # Process query through multi-agent system
        coordinated_response = await coordinator.process_user_query(
            query=chat_request.message,
            context=chat_request.context,
            required_agents=required_agents
        )
        
        # Convert to API response format
        agent_insights = [
            AgentInsight(
                agent=insight.agent_type.value,
                message=insight.message,
                confidence=insight.confidence,
                recommendations=insight.recommendations
            )
            for insight in coordinated_response.agent_insights
        ]
        
        return MultiAgentChatResponse(
            primary_message=coordinated_response.primary_message,
            agent_insights=agent_insights,
            consensus_recommendations=coordinated_response.consensus_recommendations,
            action_items=coordinated_response.action_items,
            confidence_score=coordinated_response.confidence_score,
            timestamp=datetime.now(),
            responding_agents=coordinated_response.responding_agents
        )
        
    except Exception as e:
        logger.error(f"Error in multi-agent chat: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Multi-agent chat error: {str(e)}"
        )

@router.post("/assessment", response_model=Dict[str, Any])
async def comprehensive_assessment(
    assessment_request: ComprehensiveAssessmentRequest,
    request: Request,
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Get comprehensive fitness assessment from all agents
    """
    try:
        api_key = request.app.state.agent_service.openai_api_key
        
        coordinator = get_or_create_coordinator(
            str(current_user.id),
            api_key,
            CoachPersonality.SUPPORTIVE
        )
        
        # Prepare user data
        user_data = assessment_request.user_data or {
            "user_id": str(current_user.id),
            "fitness_level": current_user.fitness_level,
            "goals": current_user.fitness_goals,
            "assessment_date": datetime.now().isoformat()
        }
        
        # Perform comprehensive assessment
        assessment = await coordinator.perform_comprehensive_assessment(user_data)
        
        return assessment
        
    except Exception as e:
        logger.error(f"Error in comprehensive assessment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assessment error: {str(e)}"
        )

@router.post("/emergency", response_model=Dict[str, Any])
async def handle_emergency(
    emergency_request: EmergencyRequest,
    request: Request,
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Handle emergency fitness situations with appropriate agent coordination
    """
    try:
        api_key = request.app.state.agent_service.openai_api_key
        
        coordinator = get_or_create_coordinator(
            str(current_user.id),
            api_key,
            CoachPersonality.SUPPORTIVE
        )
        
        # Handle emergency
        response = await coordinator.handle_emergency_situation(
            situation=emergency_request.situation,
            severity=emergency_request.severity
        )
        
        # Log emergency for follow-up
        logger.warning(f"Emergency handled for user {current_user.id}: {emergency_request.situation}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error handling emergency: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Emergency handling error: {str(e)}"
        )

@router.get("/agents/info", response_model=Dict[str, Any])
async def get_agent_info(
    request: Request,
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Get information about available agents and their specializations
    """
    try:
        api_key = request.app.state.agent_service.openai_api_key
        
        coordinator = get_or_create_coordinator(
            str(current_user.id),
            api_key,
            CoachPersonality.SUPPORTIVE
        )
        
        agent_info = await coordinator.get_agent_specialization_info()
        
        return agent_info
        
    except Exception as e:
        logger.error(f"Error getting agent info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving agent information: {str(e)}"
        )

@router.post("/weekly-summary", response_model=Dict[str, Any])
async def generate_weekly_summary(
    request: Request,
    current_user: User = Depends(auth_service.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate comprehensive weekly summary using all agents
    """
    try:
        api_key = request.app.state.agent_service.openai_api_key
        
        coordinator = get_or_create_coordinator(
            str(current_user.id),
            api_key,
            CoachPersonality.SUPPORTIVE
        )
        
        # Get week data (simplified - in production would query actual data)
        week_data = {
            "workouts_completed": 4,
            "total_duration_minutes": 240,
            "calories_burned": 1800,
            "achievements": ["Completed all planned workouts", "Increased squat weight by 10lbs"],
            "challenges": ["Missed one recovery day", "Sleep quality decreased"],
            "nutrition_adherence": 85,
            "recovery_score": 72
        }
        
        # Generate weekly summary
        summary = await coordinator.generate_weekly_summary(week_data)
        
        return summary
        
    except Exception as e:
        logger.error(f"Error generating weekly summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Weekly summary error: {str(e)}"
        )

@router.delete("/coordinator/cleanup")
async def cleanup_coordinator(
    request: Request,
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Clean up coordinator resources for user
    """
    try:
        user_id = str(current_user.id)
        
        # Clean up all personality variations
        for personality in [CoachPersonality.SUPPORTIVE, CoachPersonality.AGGRESSIVE, CoachPersonality.STEADY_PACE]:
            cache_key = f"{user_id}_{personality}"
            if cache_key in coordinator_cache:
                coordinator_cache[cache_key].cleanup()
                del coordinator_cache[cache_key]
        
        return {"status": "success", "message": "Coordinator resources cleaned up"}
        
    except Exception as e:
        logger.error(f"Error cleaning up coordinator: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cleanup error: {str(e)}"
        )

# Import logger
from utils.logger import setup_logger
logger = setup_logger(__name__)