"""Exercise history API endpoints."""
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, func
from sqlalchemy.orm import selectinload

from services.async_database import get_db
from services.auth_service import get_current_user_id
from models.tracking import WorkoutSessionV2, ExercisePerformance, PersonalRecord
from models.workout import Exercise
from models.custom_content import ExerciseHistory
from schemas.workout_sessions import ExerciseHistoryResponse

router = APIRouter(tags=["exercise-history"])

@router.get("/{exercise_id}", response_model=ExerciseHistoryResponse)
async def get_exercise_history(
    exercise_id: str,
    days: int = 90,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get performance history for a specific exercise."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Get exercise details
    exercise_query = select(Exercise).where(Exercise.id == exercise_id)
    exercise_result = await db.execute(exercise_query)
    exercise = exercise_result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    # Get exercise performances
    perf_query = select(ExercisePerformance).join(WorkoutSessionV2).options(
        selectinload(ExercisePerformance.set_performances),
        selectinload(ExercisePerformance.workout_session)
    ).where(
        and_(
            ExercisePerformance.exercise_id == exercise_id,
            WorkoutSessionV2.user_id == user_id,
            WorkoutSessionV2.started_at >= cutoff_date
        )
    ).order_by(desc(WorkoutSessionV2.started_at))
    
    perf_result = await db.execute(perf_query)
    performances = perf_result.scalars().all()
    
    # Get personal records
    pr_query = select(PersonalRecord).where(
        and_(
            PersonalRecord.user_id == user_id,
            PersonalRecord.exercise_id == exercise_id
        )
    ).order_by(desc(PersonalRecord.value))
    
    pr_result = await db.execute(pr_query)
    personal_records = pr_result.scalars().all()
    
    # Calculate statistics
    total_performances = len(performances)
    last_performed = performances[0].workout_session.started_at if performances else None
    
    # Format recent performances
    recent_performances = []
    for perf in performances[:10]:  # Last 10 performances
        sets_data = []
        for set_perf in sorted(perf.set_performances, key=lambda s: s.set_number):
            if not set_perf.is_warmup:
                sets_data.append({
                    "set_number": set_perf.set_number,
                    "weight": set_perf.weight,
                    "reps": set_perf.actual_reps,
                    "rpe": set_perf.rpe
                })
        
        recent_performances.append({
            "date": perf.workout_session.started_at,
            "sets": sets_data,
            "total_volume": perf.total_volume,
            "average_rpe": perf.average_rpe
        })
    
    # Update or create exercise history record
    history_query = select(ExerciseHistory).where(
        and_(
            ExerciseHistory.user_id == user_id,
            ExerciseHistory.exercise_id == exercise_id
        )
    )
    history_result = await db.execute(history_query)
    history = history_result.scalar_one_or_none()
    
    if history:
        history.last_performed = last_performed
        history.times_performed = total_performances
    else:
        history = ExerciseHistory(
            user_id=user_id,
            exercise_id=exercise_id,
            last_performed=last_performed,
            times_performed=total_performances
        )
        db.add(history)
    
    await db.commit()
    
    return ExerciseHistoryResponse(
        exercise_id=exercise_id,
        exercise_name=exercise.name,
        last_performed=last_performed,
        times_performed=total_performances,
        personal_records=personal_records,
        recent_performances=recent_performances
    )

@router.get("/recent", response_model=List[Dict[str, Any]])
async def get_recent_exercise_history(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get recently performed exercises."""
    # Get recent exercise performances grouped by exercise
    subquery = select(
        ExercisePerformance.exercise_id,
        func.max(WorkoutSessionV2.started_at).label('last_performed')
    ).join(WorkoutSessionV2).where(
        WorkoutSessionV2.user_id == user_id
    ).group_by(ExercisePerformance.exercise_id).subquery()
    
    query = select(
        Exercise.id,
        Exercise.name,
        subquery.c.last_performed
    ).join(
        subquery, Exercise.id == subquery.c.exercise_id
    ).order_by(desc(subquery.c.last_performed)).limit(limit)
    
    result = await db.execute(query)
    recent_exercises = []
    
    for row in result:
        recent_exercises.append({
            "exercise_id": row.id,
            "exercise_name": row.name,
            "last_performed": row.last_performed
        })
    
    return recent_exercises

@router.get("/favorites", response_model=List[Dict[str, Any]])
async def get_favorite_exercises(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get most frequently performed exercises."""
    # Get exercise performance counts
    query = select(
        ExercisePerformance.exercise_id,
        Exercise.name,
        func.count(ExercisePerformance.id).label('performance_count')
    ).join(
        WorkoutSessionV2
    ).join(
        Exercise, ExercisePerformance.exercise_id == Exercise.id
    ).where(
        WorkoutSessionV2.user_id == user_id
    ).group_by(
        ExercisePerformance.exercise_id, Exercise.name
    ).order_by(
        desc('performance_count')
    ).limit(limit)
    
    result = await db.execute(query)
    favorite_exercises = []
    
    for row in result:
        favorite_exercises.append({
            "exercise_id": row.exercise_id,
            "exercise_name": row.name,
            "times_performed": row.performance_count
        })
    
    return favorite_exercises