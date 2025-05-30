from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatRequest(BaseModel):
    message: str = Field(..., max_length=1000)
    personality: str = Field(..., pattern="^(emma|max|dr_progress)$")
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class WorkoutSuggestion(BaseModel):
    id: str
    name: str
    description: str
    duration_minutes: int
    difficulty: str
    exercises: List[Dict[str, Any]]

class ChatResponse(BaseModel):
    message: str
    workout_suggestion: Optional[WorkoutSuggestion] = None
    metadata: Optional[Dict[str, Any]] = None

class CoachingSessionResponse(BaseModel):
    id: str
    user_id: str
    personality_type: str
    conversation_context: Dict[str, Any]
    session_start: datetime
    session_end: Optional[datetime]
    message_count: int
    
    class Config:
        from_attributes = True

class CoachingMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    message_metadata: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True

class WorkoutModificationRequest(BaseModel):
    workout_id: str
    modification_request: str = Field(..., max_length=500)
    personality: str = Field(..., pattern="^(emma|max|dr_progress)$")

class MotivationRequest(BaseModel):
    context: str = Field(..., max_length=200)
    personality: str = Field(..., pattern="^(emma|max|dr_progress)$")