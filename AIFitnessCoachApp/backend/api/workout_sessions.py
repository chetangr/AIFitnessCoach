"""Workout session tracking API endpoints for set-by-set recording."""
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from sqlalchemy.orm import selectinload

from services.async_database import get_db
from services.auth_service import get_current_user_id
from models.tracking import WorkoutSessionV2, ExercisePerformance, SetPerformance
from models.workout import Exercise
from schemas.workout_sessions import (
    WorkoutSessionCreate,
    WorkoutSessionResponse,
    ExercisePerformanceCreate,
    ExercisePerformanceResponse,
    SetPerformanceCreate,
    SetPerformanceUpdate,
    SetPerformanceResponse,
    WorkoutSessionComplete
)

router = APIRouter(tags=["workout-sessions"])

@router.post("/start", response_model=WorkoutSessionResponse)
async def start_workout_session(
    session_data: WorkoutSessionCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Start a new workout session."""
    # Handle demo user
    if user_id == "demo-user-001":
        import uuid
        session_id = str(uuid.uuid4())
        return WorkoutSessionResponse(
            id=session_id,
            user_id=user_id,
            workout_plan_id=session_data.workout_plan_id,
            workout_name=session_data.workout_name,
            started_at=datetime.utcnow(),
            ended_at=None,
            notes=session_data.notes,
            total_duration_minutes=0,
            total_sets=0,
            total_reps=0,
            total_weight_kg=0,
            exercises=[],
            rating=None  # Add the required rating field
        )
    
    # Check if there's an active session
    active_query = select(WorkoutSessionV2).where(
        and_(
            WorkoutSessionV2.user_id == user_id,
            WorkoutSessionV2.ended_at.is_(None)
        )
    )
    result = await db.execute(active_query)
    active_session = result.scalar_one_or_none()
    
    if active_session:
        raise HTTPException(status_code=400, detail="An active workout session already exists")
    
    # Create new session
    db_session = WorkoutSessionV2(
        user_id=user_id,
        workout_plan_id=session_data.workout_plan_id,
        workout_name=session_data.workout_name,
        notes=session_data.notes
    )
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    
    return db_session

@router.post("/{session_id}/exercise", response_model=ExercisePerformanceResponse)
async def add_exercise_to_session(
    session_id: str,
    exercise_data: ExercisePerformanceCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Add an exercise to the workout session."""
    # Verify session belongs to user and is active
    query = select(WorkoutSessionV2).where(
        and_(
            WorkoutSessionV2.id == session_id,
            WorkoutSessionV2.user_id == user_id,
            WorkoutSessionV2.ended_at.is_(None)
        )
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Active workout session not found")
    
    # Get exercise details
    exercise_query = select(Exercise).where(Exercise.id == exercise_data.exercise_id)
    exercise_result = await db.execute(exercise_query)
    exercise = exercise_result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    # Create exercise performance record
    db_performance = ExercisePerformance(
        workout_session_id=session_id,
        exercise_id=exercise_data.exercise_id,
        exercise_name=exercise.name,
        order_in_workout=exercise_data.order_in_workout,
        notes=exercise_data.notes
    )
    db.add(db_performance)
    await db.commit()
    await db.refresh(db_performance)
    
    return db_performance

@router.post("/{session_id}/set", response_model=SetPerformanceResponse)
async def record_set(
    session_id: str,
    set_data: SetPerformanceCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Record a set performance."""
    # Verify session and exercise performance
    query = select(ExercisePerformance).join(WorkoutSessionV2).where(
        and_(
            ExercisePerformance.id == set_data.exercise_performance_id,
            WorkoutSessionV2.id == session_id,
            WorkoutSessionV2.user_id == user_id,
            WorkoutSessionV2.ended_at.is_(None)
        )
    )
    result = await db.execute(query)
    exercise_performance = result.scalar_one_or_none()
    
    if not exercise_performance:
        raise HTTPException(status_code=404, detail="Exercise performance not found in active session")
    
    # Create set record
    db_set = SetPerformance(
        exercise_performance_id=set_data.exercise_performance_id,
        set_number=set_data.set_number,
        target_reps=set_data.target_reps,
        actual_reps=set_data.actual_reps,
        weight=set_data.weight,
        rpe=set_data.rpe,
        is_warmup=set_data.is_warmup,
        is_drop_set=set_data.is_drop_set,
        notes=set_data.notes
    )
    db.add(db_set)
    await db.commit()
    await db.refresh(db_set)
    
    # Update exercise performance stats
    await update_exercise_performance_stats(exercise_performance.id, db)
    
    return db_set

@router.put("/{session_id}/set/{set_id}", response_model=SetPerformanceResponse)
async def update_set(
    session_id: str,
    set_id: str,
    set_update: SetPerformanceUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update a recorded set."""
    # Verify ownership through joins
    query = select(SetPerformance).join(ExercisePerformance).join(WorkoutSessionV2).where(
        and_(
            SetPerformance.id == set_id,
            WorkoutSessionV2.id == session_id,
            WorkoutSessionV2.user_id == user_id
        )
    )
    result = await db.execute(query)
    set_performance = result.scalar_one_or_none()
    
    if not set_performance:
        raise HTTPException(status_code=404, detail="Set not found")
    
    # Update fields
    update_data = set_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(set_performance, field, value)
    
    await db.commit()
    await db.refresh(set_performance)
    
    # Update exercise performance stats
    await update_exercise_performance_stats(set_performance.exercise_performance_id, db)
    
    return set_performance

@router.post("/{session_id}/complete", response_model=WorkoutSessionResponse)
async def complete_workout_session(
    session_id: str,
    completion_data: WorkoutSessionComplete,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Complete a workout session."""
    # Get session with all related data
    query = select(WorkoutSessionV2).options(
        selectinload(WorkoutSessionV2.exercise_performances).selectinload(
            ExercisePerformance.set_performances
        )
    ).where(
        and_(
            WorkoutSessionV2.id == session_id,
            WorkoutSessionV2.user_id == user_id,
            WorkoutSessionV2.ended_at.is_(None)
        )
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Active workout session not found")
    
    # Update session
    session.ended_at = datetime.utcnow()
    session.total_duration_minutes = int((session.ended_at - session.started_at).total_seconds() / 60)
    session.rating = completion_data.rating
    if completion_data.notes:
        session.notes = completion_data.notes
    
    # Calculate session stats
    total_sets = 0
    total_reps = 0
    total_weight = 0
    
    for exercise_perf in session.exercise_performances:
        for set_perf in exercise_perf.set_performances:
            if not set_perf.is_warmup:
                total_sets += 1
                total_reps += set_perf.actual_reps or 0
                total_weight += (set_perf.weight or 0) * (set_perf.actual_reps or 0)
    
    session.total_sets = total_sets
    session.total_reps = total_reps
    session.total_volume = total_weight
    
    await db.commit()
    await db.refresh(session)
    
    # Check and update personal records
    await check_and_update_personal_records(session, db)
    
    return session

@router.get("", response_model=List[WorkoutSessionResponse])
async def get_workout_sessions(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get workout session history."""
    query = select(WorkoutSessionV2).where(
        WorkoutSessionV2.user_id == user_id
    ).order_by(desc(WorkoutSessionV2.started_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    return sessions

@router.get("/{session_id}", response_model=Dict[str, Any])
async def get_workout_session_details(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get detailed workout session with all exercises and sets."""
    query = select(WorkoutSessionV2).options(
        selectinload(WorkoutSessionV2.exercise_performances).selectinload(
            ExercisePerformance.set_performances
        )
    ).where(
        and_(
            WorkoutSessionV2.id == session_id,
            WorkoutSessionV2.user_id == user_id
        )
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Workout session not found")
    
    # Format response
    return {
        "session": session,
        "exercises": [
            {
                "performance": exercise_perf,
                "sets": sorted(exercise_perf.set_performances, key=lambda s: s.set_number)
            }
            for exercise_perf in sorted(session.exercise_performances, key=lambda e: e.order_in_workout)
        ]
    }

@router.delete("/{session_id}")
async def delete_workout_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a workout session."""
    query = select(WorkoutSessionV2).where(
        and_(
            WorkoutSessionV2.id == session_id,
            WorkoutSessionV2.user_id == user_id
        )
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Workout session not found")
    
    await db.delete(session)
    await db.commit()
    
    return {"message": "Workout session deleted successfully"}

# Helper functions

async def update_exercise_performance_stats(exercise_performance_id: str, db: AsyncSession):
    """Update exercise performance statistics based on sets."""
    query = select(ExercisePerformance).options(
        selectinload(ExercisePerformance.set_performances)
    ).where(ExercisePerformance.id == exercise_performance_id)
    
    result = await db.execute(query)
    exercise_perf = result.scalar_one_or_none()
    
    if not exercise_perf:
        return
    
    # Calculate stats from non-warmup sets
    working_sets = [s for s in exercise_perf.set_performances if not s.is_warmup]
    
    if working_sets:
        exercise_perf.total_sets = len(working_sets)
        exercise_perf.total_reps = sum(s.actual_reps or 0 for s in working_sets)
        exercise_perf.total_volume = sum((s.weight or 0) * (s.actual_reps or 0) for s in working_sets)
        exercise_perf.average_rpe = sum(s.rpe or 0 for s in working_sets if s.rpe) / len([s for s in working_sets if s.rpe]) if any(s.rpe for s in working_sets) else None
        exercise_perf.max_weight = max((s.weight or 0) for s in working_sets) if working_sets else 0
    
    await db.commit()

async def check_and_update_personal_records(session: WorkoutSessionV2, db: AsyncSession):
    """Check for and update personal records from a completed session."""
    from models.tracking import PersonalRecord
    
    for exercise_perf in session.exercise_performances:
        working_sets = [s for s in exercise_perf.set_performances if not s.is_warmup]
        
        if not working_sets:
            continue
        
        # Check for various PR types
        max_weight = max((s.weight or 0) for s in working_sets)
        max_reps_at_weight = {}
        max_volume_single_set = 0
        
        for set_perf in working_sets:
            weight = set_perf.weight or 0
            reps = set_perf.actual_reps or 0
            volume = weight * reps
            
            # Track max reps at each weight
            if weight not in max_reps_at_weight or reps > max_reps_at_weight[weight]:
                max_reps_at_weight[weight] = reps
            
            # Track max volume in a single set
            if volume > max_volume_single_set:
                max_volume_single_set = volume
        
        # Check and create PRs
        # 1. Max weight PR
        await check_and_create_pr(
            user_id=session.user_id,
            exercise_id=exercise_perf.exercise_id,
            pr_type="max_weight",
            value=max_weight,
            workout_session_id=session.id,
            db=db
        )
        
        # 2. Max reps PRs for each weight
        for weight, reps in max_reps_at_weight.items():
            if weight > 0:  # Only track PRs for weighted exercises
                await check_and_create_pr(
                    user_id=session.user_id,
                    exercise_id=exercise_perf.exercise_id,
                    pr_type=f"max_reps_at_{weight}",
                    value=reps,
                    workout_session_id=session.id,
                    db=db
                )
        
        # 3. Max volume PR
        if exercise_perf.total_volume > 0:
            await check_and_create_pr(
                user_id=session.user_id,
                exercise_id=exercise_perf.exercise_id,
                pr_type="max_volume",
                value=exercise_perf.total_volume,
                workout_session_id=session.id,
                db=db
            )

async def check_and_create_pr(user_id: str, exercise_id: str, pr_type: str, value: float, workout_session_id: str, db: AsyncSession):
    """Check if a value is a PR and create/update the record."""
    from models.tracking import PersonalRecord
    
    # Check existing PR
    query = select(PersonalRecord).where(
        and_(
            PersonalRecord.user_id == user_id,
            PersonalRecord.exercise_id == exercise_id,
            PersonalRecord.pr_type == pr_type
        )
    )
    result = await db.execute(query)
    existing_pr = result.scalar_one_or_none()
    
    if not existing_pr or value > existing_pr.value:
        if existing_pr:
            # Update existing PR
            existing_pr.value = value
            existing_pr.workout_session_id = workout_session_id
            existing_pr.achieved_at = datetime.utcnow()
        else:
            # Create new PR
            new_pr = PersonalRecord(
                user_id=user_id,
                exercise_id=exercise_id,
                pr_type=pr_type,
                value=value,
                workout_session_id=workout_session_id
            )
            db.add(new_pr)
        
        await db.commit()