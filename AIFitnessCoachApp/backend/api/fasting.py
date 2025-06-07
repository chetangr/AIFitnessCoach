"""Fasting management API endpoints."""
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, func

from services.async_database import get_db
from services.auth_service import get_current_user_id
from models.measurements import FastingSession
from schemas.measurements import (
    FastingSessionCreate,
    FastingSessionResponse,
    FastingStats
)

router = APIRouter(tags=["fasting"])

@router.post("/start", response_model=FastingSessionResponse)
async def start_fasting_session(
    session: FastingSessionCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Start a new fasting session."""
    # Check if there's an active session
    active_query = select(FastingSession).where(
        and_(
            FastingSession.user_id == user_id,
            FastingSession.actual_end_at.is_(None)
        )
    )
    result = await db.execute(active_query)
    active_session = result.scalar_one_or_none()
    
    if active_session:
        raise HTTPException(status_code=400, detail="An active fasting session already exists")
    
    # Create new session
    from models.measurements import FastingPlan
    from datetime import datetime, timedelta, timezone
    
    # Map the fasting_type string to FastingPlan enum
    plan_type_map = {
        "12:12": FastingPlan.TWELVE_TWELVE,
        "16:8": FastingPlan.SIXTEEN_EIGHT,
        "18:6": FastingPlan.EIGHTEEN_SIX,
        "20:4": FastingPlan.TWENTY_FOUR,
        "OMAD": FastingPlan.OMAD,
        "custom": FastingPlan.CUSTOM
    }
    
    now = datetime.now(timezone.utc)
    target_end = now + timedelta(hours=session.planned_duration_hours)
    
    db_session = FastingSession(
        user_id=user_id,
        plan_type=plan_type_map.get(session.fasting_type, FastingPlan.CUSTOM),
        target_hours=session.planned_duration_hours,
        started_at=now,
        target_end_at=target_end,
        notes=session.notes,
        is_active=True,
        is_completed=False
    )
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    
    # Return response matching schema
    return FastingSessionResponse(
        id=str(db_session.id),
        user_id=str(db_session.user_id),
        fasting_type=session.fasting_type,
        planned_duration_hours=db_session.target_hours,
        notes=db_session.notes,
        started_at=db_session.started_at,
        ended_at=db_session.actual_end_at,
        actual_duration_hours=None,
        completed_successfully=db_session.is_completed
    )

@router.post("/stop", response_model=FastingSessionResponse)
async def stop_fasting_session(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Stop the current fasting session."""
    # Find active session
    query = select(FastingSession).where(
        and_(
            FastingSession.user_id == user_id,
            FastingSession.actual_end_at.is_(None)
        )
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="No active fasting session found")
    
    # Stop the session
    session.actual_end_at = datetime.now(timezone.utc)
    duration = session.actual_end_at - session.started_at
    session.completion_percentage = (duration.total_seconds() / 3600) / session.target_hours * 100
    
    # Mark as completed if they fasted at least 80% of planned duration
    session.is_completed = session.completion_percentage >= 80
    session.is_active = False
    
    await db.commit()
    await db.refresh(session)
    
    return session

@router.get("/current", response_model=Optional[FastingSessionResponse])
async def get_current_fasting_session(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get the current active fasting session."""
    query = select(FastingSession).where(
        and_(
            FastingSession.user_id == user_id,
            FastingSession.actual_end_at.is_(None)
        )
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    if session:
        # Calculate current duration
        duration = datetime.utcnow() - session.started_at
        # Just calculate for display, don't modify the session
    
    return session

@router.get("/history", response_model=List[FastingSessionResponse])
async def get_fasting_history(
    limit: int = 30,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get fasting session history."""
    # Handle demo user
    if user_id == "demo-user-001":
        from datetime import timedelta
        demo_sessions = []
        now = datetime.now(timezone.utc)
        
        # Create some sample fasting history
        fasting_plans = [
            ("16:8", 16, True),
            ("18:6", 18, True),
            ("16:8", 16, True),
            ("20:4", 20, False),  # Current/incomplete
            ("16:8", 16, True),
        ]
        
        for i, (plan_type, hours, completed) in enumerate(fasting_plans[:limit]):
            started = now - timedelta(days=i+1, hours=8)
            ended = started + timedelta(hours=hours) if completed else None
            
            demo_sessions.append(FastingSessionResponse(
                id=f"demo-fasting-{i+1}",
                user_id=user_id,
                fasting_type=plan_type,
                planned_duration_hours=hours,
                notes=f"Fasting session {i+1}",
                started_at=started,
                ended_at=ended,
                actual_duration_hours=hours if completed else None,
                completed_successfully=completed
            ))
        
        return demo_sessions[offset:offset+limit]
    
    query = select(FastingSession).where(
        FastingSession.user_id == user_id
    ).order_by(desc(FastingSession.started_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    return sessions

@router.get("/stats", response_model=FastingStats)
async def get_fasting_stats(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get fasting statistics and streaks."""
    # Get all sessions
    query = select(FastingSession).where(
        FastingSession.user_id == user_id
    ).order_by(desc(FastingSession.started_at))
    
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    if not sessions:
        return FastingStats(
            total_sessions=0,
            completed_sessions=0,
            current_streak=0,
            longest_streak=0,
            average_duration_hours=0,
            total_fasting_hours=0,
            favorite_fasting_type=None
        )
    
    # Calculate stats
    total_sessions = len(sessions)
    completed_sessions = sum(1 for s in sessions if s.is_completed)
    total_fasting_hours = sum(((s.actual_end_at - s.started_at).total_seconds() / 3600) if s.actual_end_at else 0 for s in sessions)
    
    # Calculate average duration
    completed_with_duration = [s for s in sessions if s.actual_end_at]
    if completed_with_duration:
        total_hours = sum(((s.actual_end_at - s.started_at).total_seconds() / 3600) for s in completed_with_duration)
        average_duration_hours = total_hours / len(completed_with_duration)
    else:
        average_duration_hours = 0
    
    # Calculate current streak
    current_streak = 0
    today = datetime.now(timezone.utc).date()
    for i, session in enumerate(sessions):
        if not session.is_completed:
            break
        session_date = session.started_at.date()
        expected_date = today - timedelta(days=i)
        if session_date == expected_date:
            current_streak += 1
        else:
            break
    
    # Calculate longest streak
    longest_streak = current_streak
    temp_streak = 0
    last_date = None
    
    for session in reversed(sessions):
        if not session.is_completed:
            temp_streak = 0
            last_date = None
            continue
            
        session_date = session.started_at.date()
        if last_date is None or (last_date - session_date).days == 1:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1
        last_date = session_date
    
    # Find favorite fasting type
    fasting_types = {}
    for session in sessions:
        if session.plan_type:
            fasting_types[session.plan_type] = fasting_types.get(session.plan_type, 0) + 1
    
    favorite_fasting_type = max(fasting_types.items(), key=lambda x: x[1])[0] if fasting_types else None
    
    return FastingStats(
        total_sessions=total_sessions,
        completed_sessions=completed_sessions,
        current_streak=current_streak,
        longest_streak=longest_streak,
        average_duration_hours=round(average_duration_hours, 1),
        total_fasting_hours=round(total_fasting_hours, 1),
        favorite_fasting_type=favorite_fasting_type
    )

@router.delete("/{session_id}")
async def delete_fasting_record(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a fasting record."""
    query = select(FastingSession).where(
        and_(
            FastingSession.id == session_id,
            FastingSession.user_id == user_id
        )
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Fasting session not found")
    
    await db.delete(session)
    await db.commit()
    
    return {"message": "Fasting session deleted successfully"}