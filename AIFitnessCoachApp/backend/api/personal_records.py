"""Personal records API endpoints."""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, func
from sqlalchemy.orm import selectinload

from services.async_database import get_db
from services.auth_service import get_current_user_id
from models.tracking import PersonalRecord
from models.workout import Exercise
from schemas.workout_sessions import PersonalRecordResponse

router = APIRouter(tags=["personal-records"])

@router.get("", response_model=List[PersonalRecordResponse])
async def get_all_personal_records(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get all personal records for the user."""
    # Handle demo user
    if user_id == "demo-user-001":
        from datetime import timedelta
        demo_records = []
        exercises = [
            ("bench-press", "Barbell Bench Press", "one_rep_max", 100.0, "kg"),
            ("squat", "Back Squat", "one_rep_max", 120.0, "kg"),
            ("deadlift", "Conventional Deadlift", "one_rep_max", 140.0, "kg"),
            ("pull-up", "Pull-ups", "max_reps", 15.0, "reps"),
            ("plank", "Plank Hold", "max_duration", 180.0, "seconds")
        ]
        
        for i, (ex_id, ex_name, rec_type, value, unit) in enumerate(exercises[:limit]):
            demo_records.append(PersonalRecordResponse(
                id=f"demo-pr-{i+1}",
                user_id=user_id,
                exercise_id=ex_id,
                exercise_name=ex_name,
                record_type=rec_type,
                pr_type=rec_type,  # Add required pr_type field
                value=value,
                unit=unit,
                achieved_at=datetime.utcnow() - timedelta(days=i*7),
                notes=f"Personal best for {ex_name}",
                workout_session_id=f"demo-session-{i+1}"  # Add required workout_session_id
            ))
        
        return demo_records[offset:offset+limit]
    
    query = select(PersonalRecord).options(
        selectinload(PersonalRecord.exercise)
    ).where(
        PersonalRecord.user_id == user_id
    ).order_by(desc(PersonalRecord.achieved_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    records = result.scalars().all()
    
    # Add exercise name to response
    for record in records:
        if record.exercise and not record.exercise_name:
            record.exercise_name = record.exercise.name
    
    return records

@router.get("/exercise/{exercise_id}", response_model=List[PersonalRecordResponse])
async def get_exercise_personal_records(
    exercise_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get personal records for a specific exercise."""
    query = select(PersonalRecord).options(
        selectinload(PersonalRecord.exercise)
    ).where(
        and_(
            PersonalRecord.user_id == user_id,
            PersonalRecord.exercise_id == exercise_id
        )
    ).order_by(desc(PersonalRecord.value))
    
    result = await db.execute(query)
    records = result.scalars().all()
    
    # Add exercise name to response
    for record in records:
        if record.exercise and not record.exercise_name:
            record.exercise_name = record.exercise.name
    
    return records

@router.get("/recent", response_model=List[PersonalRecordResponse])
async def get_recent_personal_records(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get recent personal records from the last N days."""
    from datetime import datetime, timedelta
    
    # Handle demo user
    if user_id == "demo-user-001":
        demo_records = []
        recent_records = [
            ("bench-press", "Barbell Bench Press", "one_rep_max", 102.5, "kg", 1),
            ("squat", "Back Squat", "one_rep_max", 125.0, "kg", 3),
            ("pull-up", "Pull-ups", "max_reps", 16.0, "reps", 5)
        ]
        
        for ex_id, ex_name, rec_type, value, unit, days_ago in recent_records:
            if days_ago <= days:
                demo_records.append(PersonalRecordResponse(
                    id=f"demo-pr-recent-{ex_id}",
                    user_id=user_id,
                    exercise_id=ex_id,
                    exercise_name=ex_name,
                    record_type=rec_type,
                    pr_type=rec_type,  # Add required pr_type field
                    value=value,
                    unit=unit,
                    achieved_at=datetime.utcnow() - timedelta(days=days_ago),
                    notes=f"Recent PR for {ex_name}",
                    workout_session_id=f"demo-session-recent-{ex_id}"  # Add required workout_session_id
                ))
        
        return demo_records
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    query = select(PersonalRecord).options(
        selectinload(PersonalRecord.exercise)
    ).where(
        and_(
            PersonalRecord.user_id == user_id,
            PersonalRecord.achieved_at >= cutoff_date
        )
    ).order_by(desc(PersonalRecord.achieved_at))
    
    result = await db.execute(query)
    records = result.scalars().all()
    
    # Add exercise name to response
    for record in records:
        if record.exercise and not record.exercise_name:
            record.exercise_name = record.exercise.name
    
    return records

@router.post("/calculate")
async def calculate_personal_records(
    force_recalculate: bool = False,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Calculate/update personal records based on workout history."""
    # Handle demo user
    if user_id == "demo-user-001":
        return {
            "message": "Personal records calculated successfully",
            "records_updated": 5,
            "records_created": 3,
            "exercises_processed": 12
        }
    
    from models.tracking import WorkoutSessionV2, ExercisePerformance, SetPerformance
    
    # Get all completed workout sessions for the user
    query = select(WorkoutSessionV2).options(
        selectinload(WorkoutSessionV2.exercise_performances).selectinload(
            ExercisePerformance.set_performances
        )
    ).where(
        and_(
            WorkoutSessionV2.user_id == user_id,
            WorkoutSessionV2.ended_at.isnot(None)
        )
    ).order_by(WorkoutSessionV2.started_at)
    
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    # Dictionary to track PRs by exercise and type
    pr_tracker = {}
    records_created = 0
    records_updated = 0
    
    for session in sessions:
        for exercise_perf in session.exercise_performances:
            exercise_id = exercise_perf.exercise_id
            
            # Skip if no working sets
            working_sets = [s for s in exercise_perf.set_performances if not s.is_warmup]
            if not working_sets:
                continue
            
            # Initialize tracker for this exercise if needed
            if exercise_id not in pr_tracker:
                pr_tracker[exercise_id] = {
                    'exercise_name': exercise_perf.exercise_name,
                    'max_weight': {'value': 0, 'session_id': None, 'date': None},
                    'max_volume': {'value': 0, 'session_id': None, 'date': None},
                    'max_reps': {}  # Dict of weight -> max reps
                }
            
            # Check each set for PRs
            for set_perf in working_sets:
                weight = set_perf.weight or 0
                reps = set_perf.actual_reps or 0
                volume = weight * reps
                
                # Check max weight
                if weight > pr_tracker[exercise_id]['max_weight']['value']:
                    pr_tracker[exercise_id]['max_weight'] = {
                        'value': weight,
                        'session_id': session.id,
                        'date': session.started_at
                    }
                
                # Check max reps at weight
                if weight > 0:
                    weight_key = f"{weight}"
                    if weight_key not in pr_tracker[exercise_id]['max_reps'] or reps > pr_tracker[exercise_id]['max_reps'][weight_key]['value']:
                        pr_tracker[exercise_id]['max_reps'][weight_key] = {
                            'value': reps,
                            'session_id': session.id,
                            'date': session.started_at
                        }
            
            # Check total volume for the exercise
            if exercise_perf.total_volume > pr_tracker[exercise_id]['max_volume']['value']:
                pr_tracker[exercise_id]['max_volume'] = {
                    'value': exercise_perf.total_volume,
                    'session_id': session.id,
                    'date': session.started_at
                }
    
    # Now update the database with calculated PRs
    for exercise_id, pr_data in pr_tracker.items():
        exercise_name = pr_data['exercise_name']
        
        # Update max weight PR
        if pr_data['max_weight']['value'] > 0:
            result = await update_or_create_pr(
                db, user_id, exercise_id, exercise_name,
                'max_weight', pr_data['max_weight']['value'],
                pr_data['max_weight']['session_id'],
                pr_data['max_weight']['date'],
                force_recalculate
            )
            if result == 'created':
                records_created += 1
            elif result == 'updated':
                records_updated += 1
        
        # Update max volume PR
        if pr_data['max_volume']['value'] > 0:
            result = await update_or_create_pr(
                db, user_id, exercise_id, exercise_name,
                'max_volume', pr_data['max_volume']['value'],
                pr_data['max_volume']['session_id'],
                pr_data['max_volume']['date'],
                force_recalculate
            )
            if result == 'created':
                records_created += 1
            elif result == 'updated':
                records_updated += 1
        
        # Update max reps PRs
        for weight_str, reps_data in pr_data['max_reps'].items():
            weight = float(weight_str)
            result = await update_or_create_pr(
                db, user_id, exercise_id, exercise_name,
                f'max_reps_at_{weight}', reps_data['value'],
                reps_data['session_id'],
                reps_data['date'],
                force_recalculate
            )
            if result == 'created':
                records_created += 1
            elif result == 'updated':
                records_updated += 1
    
    await db.commit()
    
    return {
        "message": "Personal records calculated successfully",
        "records_created": records_created,
        "records_updated": records_updated,
        "exercises_analyzed": len(pr_tracker)
    }

async def update_or_create_pr(
    db: AsyncSession,
    user_id: str,
    exercise_id: str,
    exercise_name: str,
    pr_type: str,
    value: float,
    session_id: str,
    achieved_date: datetime,
    force_update: bool = False
) -> str:
    """Update or create a personal record."""
    # Check if PR exists
    query = select(PersonalRecord).where(
        and_(
            PersonalRecord.user_id == user_id,
            PersonalRecord.exercise_id == exercise_id,
            PersonalRecord.pr_type == pr_type
        )
    )
    result = await db.execute(query)
    existing_pr = result.scalar_one_or_none()
    
    if existing_pr:
        # Update if new value is higher or force update is requested
        if value > existing_pr.value or force_update:
            existing_pr.previous_value = existing_pr.value
            existing_pr.value = value
            existing_pr.workout_session_id = session_id
            existing_pr.achieved_at = achieved_date
            existing_pr.exercise_name = exercise_name
            
            # Calculate improvement percentage
            if existing_pr.previous_value and existing_pr.previous_value > 0:
                existing_pr.improvement_percentage = ((value - existing_pr.previous_value) / existing_pr.previous_value) * 100
            
            return 'updated'
        return 'unchanged'
    else:
        # Create new PR
        new_pr = PersonalRecord(
            user_id=user_id,
            exercise_id=exercise_id,
            exercise_name=exercise_name,
            pr_type=pr_type,
            value=value,
            workout_session_id=session_id,
            achieved_at=achieved_date
        )
        db.add(new_pr)
        return 'created'