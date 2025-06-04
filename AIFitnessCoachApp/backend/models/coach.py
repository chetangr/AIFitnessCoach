from datetime import datetime
from sqlalchemy import Column, String, Integer, JSON, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class CoachingSession(BaseModel):
    __tablename__ = "coaching_sessions"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    personality_type = Column(String(50), nullable=False)
    conversation_context = Column(JSON, default=dict)
    session_start = Column(DateTime(timezone=True), nullable=False)
    session_end = Column(DateTime(timezone=True))
    message_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="coaching_sessions")
    messages = relationship("CoachingMessage", back_populates="session", cascade="all, delete-orphan")

class CoachingMessage(BaseModel):
    __tablename__ = "coaching_messages"
    
    session_id = Column(UUID(as_uuid=True), ForeignKey("coaching_sessions.id"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    message_metadata = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    session = relationship("CoachingSession", back_populates="messages")