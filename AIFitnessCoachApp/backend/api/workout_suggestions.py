"""
Workout Suggestions API Endpoints
Provides intelligent workout recommendations based on user data
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from services.workout_suggestion_service import workout_suggestion_service
from services.auth_service import auth_service
from utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()
security = HTTPBearer()

class ApplySuggestionRequest(BaseModel):
    date: Optional[str] = None
    replace_existing: bool = False

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user_id"""
    try:
        token = credentials.credentials
        payload = auth_service.decode_token(token)
        return payload.get('sub', 'demo-user')
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

@router.get("/workout-suggestions")
async def get_workout_suggestions(
    days_ahead: int = Query(7, description="Number of days to look ahead"),
    focus_muscle: Optional[str] = Query(None, description="Specific muscle group to focus on"),
    include_rationale: bool = Query(True, description="Include explanation for suggestions"),
    user_id: str = Depends(verify_token)
):
    """
    Get personalized workout suggestions for the current user
    """
    try:
        # Get suggestions
        suggestions = workout_suggestion_service.get_suggestions_for_user(
            user_id=user_id,
            days_ahead=days_ahead,
            include_rationale=include_rationale
        )
        
        # Filter by muscle if specified
        if focus_muscle and 'suggestions' in suggestions:
            filtered = [
                s for s in suggestions['suggestions']
                if not focus_muscle or focus_muscle in s.muscle_groups
            ]
            suggestions['suggestions'] = filtered
        
        logger.info(f"Generated {len(suggestions.get('suggestions', []))} workout suggestions for user {user_id}")
        
        return suggestions
        
    except Exception as e:
        logger.error(f"Error getting workout suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get workout suggestions")

@router.post("/workout-suggestions/{suggestion_id}/apply")
async def apply_workout_suggestion(
    suggestion_id: str,
    request: ApplySuggestionRequest,
    user_id: str = Depends(verify_token)
):
    """
    Apply a workout suggestion to the user's schedule
    """
    try:
        target_date = request.date or datetime.now().date().isoformat()
        
        # This would integrate with the fitness action agent
        # For now, return a success response
        result = {
            'status': 'success',
            'message': f'Workout suggestion {suggestion_id} applied to {target_date}',
            'suggestion_id': suggestion_id,
            'date': target_date,
            'replaced': request.replace_existing
        }
        
        logger.info(f"Applied workout suggestion {suggestion_id} for user {user_id} on {target_date}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error applying workout suggestion: {e}")
        raise HTTPException(status_code=500, detail="Failed to apply workout suggestion")

@router.get("/workout-suggestions/analysis")
async def get_workout_analysis(user_id: str = Depends(verify_token)):
    """
    Get detailed analysis of user's workout patterns and needs
    """
    try:
        # Get full analysis
        suggestions_data = workout_suggestion_service.get_suggestions_for_user(
            user_id=user_id,
            days_ahead=14,  # Look at 2 weeks
            include_rationale=True
        )
        
        analysis = suggestions_data.get('analysis', {})
        
        # Format response
        response = {
            'user_id': user_id,
            'analysis': {
                'avg_workouts_per_week': analysis.get('avg_workouts_per_week', 0),
                'muscle_group_frequency': analysis.get('muscle_group_frequency', {}),
                'undertrained_muscles': analysis.get('undertrained_muscles', []),
                'consecutive_workout_days': analysis.get('consecutive_workout_days', 0),
                'needs_rest': analysis.get('needs_rest', False),
                'current_week_load': analysis.get('current_week_load', 'moderate'),
                'training_phase': analysis.get('training_phase', 'maintenance'),
                'recovery_status': analysis.get('recovery_status', 'normal')
            },
            'recommendations': {
                'primary_focus': analysis.get('undertrained_muscles', ['balanced'])[:2],
                'suggested_frequency': 'Maintain current' if analysis.get('avg_workouts_per_week', 0) >= 3 else 'Increase frequency',
                'rest_needed': analysis.get('needs_rest', False)
            },
            'generated_at': datetime.now().isoformat()
        }
        
        logger.info(f"Generated workout analysis for user {user_id}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting workout analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to get workout analysis")

# Demo endpoint for testing
@router.get("/demo/workout-suggestions")
async def get_demo_workout_suggestions():
    """
    Get demo workout suggestions without authentication
    """
    try:
        # Use demo user
        suggestions = workout_suggestion_service.get_suggestions_for_user(
            user_id='demo-user',
            days_ahead=7,
            include_rationale=True
        )
        
        return suggestions
        
    except Exception as e:
        logger.error(f"Error getting demo workout suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get demo workout suggestions")