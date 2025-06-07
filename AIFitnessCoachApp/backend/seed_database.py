#!/usr/bin/env python3
"""
Database seeding script for AI Fitness Coach
Populates the database with exercises, workout templates, and training programs
"""

import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select
from services.async_database import AsyncSessionLocal, engine, sync_engine
from models.base import Base
from models.workout import Exercise
from models.custom_content import TrainingProgram, WorkoutTemplate
from utils.logger import setup_logger

logger = setup_logger(__name__)

# Comprehensive exercise database
EXERCISES_DATA = [
    # Chest Exercises
    {
        "name": "Push-ups",
        "category": "chest",
        "target_muscles": ["chest", "triceps", "shoulders"],
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "instructions": [
            "Start in a plank position with hands shoulder-width apart",
            "Lower your body until your chest nearly touches the floor",
            "Push back up to the starting position",
            "Keep your core engaged throughout the movement"
        ],
        "tips": ["Keep your body in a straight line", "Don't let your hips sag", "Breathe in on the way down, out on the way up"],
        "variations": ["Incline push-ups", "Diamond push-ups", "Wide-grip push-ups"]
    },
    {
        "name": "Barbell Bench Press",
        "category": "chest",
        "target_muscles": ["chest", "triceps", "shoulders"],
        "equipment": "barbell",
        "difficulty": "intermediate",
        "instructions": [
            "Lie on a bench with feet flat on the floor",
            "Grip the bar slightly wider than shoulder-width",
            "Lower the bar to your chest with control",
            "Press the bar back up to the starting position"
        ],
        "tips": ["Keep your shoulder blades pulled back", "Maintain a slight arch in your lower back", "Don't bounce the bar off your chest"],
        "variations": ["Incline bench press", "Decline bench press", "Close-grip bench press"]
    },
    {
        "name": "Dumbbell Flyes",
        "category": "chest",
        "target_muscles": ["chest"],
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "instructions": [
            "Lie on a bench holding dumbbells above your chest",
            "Lower the weights in an arc motion",
            "Feel the stretch in your chest at the bottom",
            "Bring the dumbbells back together above your chest"
        ],
        "tips": ["Keep a slight bend in your elbows", "Control the descent", "Focus on squeezing your chest at the top"],
        "variations": ["Incline flyes", "Cable flyes", "Pec deck machine"]
    },

    # Back Exercises
    {
        "name": "Pull-ups",
        "category": "back",
        "target_muscles": ["lats", "biceps", "middle back"],
        "equipment": "pull-up bar",
        "difficulty": "intermediate",
        "instructions": [
            "Hang from a pull-up bar with an overhand grip",
            "Pull your body up until your chin clears the bar",
            "Lower yourself back down with control",
            "Keep your core engaged throughout"
        ],
        "tips": ["Avoid swinging", "Focus on pulling with your back", "Full range of motion"],
        "variations": ["Chin-ups", "Wide-grip pull-ups", "Assisted pull-ups"]
    },
    {
        "name": "Deadlifts",
        "category": "back",
        "target_muscles": ["lower back", "glutes", "hamstrings", "traps"],
        "equipment": "barbell",
        "difficulty": "advanced",
        "instructions": [
            "Stand with feet hip-width apart, bar over mid-foot",
            "Bend down and grip the bar with hands just outside legs",
            "Lift the bar by driving through your heels and extending hips and knees",
            "Stand tall with shoulders back, then lower the bar with control"
        ],
        "tips": ["Keep your back straight", "Engage your core", "Drive through your heels"],
        "variations": ["Romanian deadlifts", "Sumo deadlifts", "Trap bar deadlifts"]
    },
    {
        "name": "Barbell Rows",
        "category": "back",
        "target_muscles": ["middle back", "lats", "biceps"],
        "equipment": "barbell",
        "difficulty": "intermediate",
        "instructions": [
            "Bend forward at the hips with knees slightly bent",
            "Hold the bar with an overhand grip",
            "Pull the bar to your lower chest",
            "Lower the bar with control"
        ],
        "tips": ["Keep your back straight", "Pull your elbows back", "Squeeze shoulder blades together"],
        "variations": ["Pendlay rows", "T-bar rows", "Cable rows"]
    },

    # Leg Exercises
    {
        "name": "Squats",
        "category": "legs",
        "target_muscles": ["quadriceps", "glutes", "hamstrings"],
        "equipment": "barbell",
        "difficulty": "intermediate",
        "instructions": [
            "Stand with feet shoulder-width apart",
            "Lower your body by bending knees and hips",
            "Descend until thighs are parallel to the floor",
            "Drive through heels to return to standing"
        ],
        "tips": ["Keep knees tracking over toes", "Maintain a neutral spine", "Keep chest up"],
        "variations": ["Front squats", "Bulgarian split squats", "Goblet squats"]
    },
    {
        "name": "Lunges",
        "category": "legs",
        "target_muscles": ["quadriceps", "glutes", "hamstrings"],
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "instructions": [
            "Step forward with one leg",
            "Lower your hips until both knees are bent at 90 degrees",
            "Push through the front heel to return to start",
            "Alternate legs"
        ],
        "tips": ["Keep your torso upright", "Don't let knee go past toes", "Control the descent"],
        "variations": ["Reverse lunges", "Walking lunges", "Jump lunges"]
    },
    {
        "name": "Leg Press",
        "category": "legs",
        "target_muscles": ["quadriceps", "glutes", "hamstrings"],
        "equipment": "machine",
        "difficulty": "beginner",
        "instructions": [
            "Sit on the leg press machine with back against backrest",
            "Place feet on platform shoulder-width apart",
            "Lower the weight by bending knees to 90 degrees",
            "Press through heels to return to start"
        ],
        "tips": ["Don't lock out knees", "Keep lower back pressed against seat", "Full range of motion"],
        "variations": ["Single leg press", "Wide stance", "High foot placement"]
    },

    # Shoulder Exercises
    {
        "name": "Shoulder Press",
        "category": "shoulders",
        "target_muscles": ["shoulders", "triceps"],
        "equipment": "dumbbells",
        "difficulty": "intermediate",
        "instructions": [
            "Hold dumbbells at shoulder height",
            "Press the weights overhead until arms are extended",
            "Lower back to shoulder height with control",
            "Keep core engaged throughout"
        ],
        "tips": ["Don't arch your back", "Keep wrists straight", "Control the tempo"],
        "variations": ["Military press", "Arnold press", "Behind-the-neck press"]
    },
    {
        "name": "Lateral Raises",
        "category": "shoulders",
        "target_muscles": ["lateral deltoids"],
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "instructions": [
            "Hold dumbbells at your sides",
            "Raise the weights out to the sides until parallel with floor",
            "Pause briefly at the top",
            "Lower with control"
        ],
        "tips": ["Keep a slight bend in elbows", "Don't use momentum", "Lead with elbows"],
        "variations": ["Cable lateral raises", "Front raises", "Rear delt flyes"]
    },

    # Core Exercises
    {
        "name": "Plank",
        "category": "core",
        "target_muscles": ["abs", "obliques", "lower back"],
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "instructions": [
            "Start in a push-up position on forearms",
            "Keep body in a straight line from head to heels",
            "Hold this position for time",
            "Keep breathing normally"
        ],
        "tips": ["Don't let hips sag", "Keep core tight", "Look at the floor"],
        "variations": ["Side plank", "Plank with leg lifts", "Mountain climbers"]
    },
    {
        "name": "Crunches",
        "category": "core",
        "target_muscles": ["abs"],
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "instructions": [
            "Lie on your back with knees bent",
            "Place hands behind head or across chest",
            "Lift shoulders off the ground using abs",
            "Lower back down with control"
        ],
        "tips": ["Don't pull on neck", "Focus on using abs", "Exhale on the way up"],
        "variations": ["Bicycle crunches", "Reverse crunches", "Cable crunches"]
    },

    # Cardio/HIIT Exercises
    {
        "name": "Burpees",
        "category": "cardio",
        "target_muscles": ["full body"],
        "equipment": "bodyweight",
        "difficulty": "intermediate",
        "instructions": [
            "Start standing, then squat down and place hands on floor",
            "Jump feet back into plank position",
            "Perform a push-up (optional)",
            "Jump feet back to squat position",
            "Jump up with arms overhead"
        ],
        "tips": ["Move quickly but maintain form", "Land softly", "Keep core engaged"],
        "variations": ["Half burpees", "Burpee box jumps", "Burpee pull-ups"]
    },
    {
        "name": "Mountain Climbers",
        "category": "cardio",
        "target_muscles": ["core", "shoulders", "legs"],
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "instructions": [
            "Start in plank position",
            "Drive one knee toward chest",
            "Quickly switch legs",
            "Continue alternating legs at a quick pace"
        ],
        "tips": ["Keep hips level", "Maintain plank position", "Breathe steadily"],
        "variations": ["Cross-body mountain climbers", "Slow mountain climbers", "Spider climbers"]
    },
    {
        "name": "Jumping Jacks",
        "category": "cardio",
        "target_muscles": ["full body"],
        "equipment": "bodyweight",
        "difficulty": "beginner",
        "instructions": [
            "Start with feet together, arms at sides",
            "Jump feet apart while raising arms overhead",
            "Jump back to starting position",
            "Repeat continuously"
        ],
        "tips": ["Land softly", "Keep core engaged", "Maintain steady rhythm"],
        "variations": ["Star jumps", "Cross jacks", "Plank jacks"]
    },

    # Triceps Exercises
    {
        "name": "Tricep Dips",
        "category": "arms",
        "target_muscles": ["triceps"],
        "equipment": "bodyweight",
        "difficulty": "intermediate",
        "instructions": [
            "Position hands on bench/bars behind you",
            "Extend legs out in front",
            "Lower body by bending elbows to 90 degrees",
            "Push back up to starting position"
        ],
        "tips": ["Keep elbows close to body", "Don't go too low", "Control the movement"],
        "variations": ["Bench dips", "Ring dips", "Machine dips"]
    },

    # Biceps Exercises
    {
        "name": "Bicep Curls",
        "category": "arms",
        "target_muscles": ["biceps"],
        "equipment": "dumbbells",
        "difficulty": "beginner",
        "instructions": [
            "Hold dumbbells at arms length",
            "Curl weights toward shoulders",
            "Squeeze biceps at the top",
            "Lower with control"
        ],
        "tips": ["Don't swing the weights", "Keep elbows stationary", "Full range of motion"],
        "variations": ["Hammer curls", "Concentration curls", "Preacher curls"]
    }
]

# Sample training programs
TRAINING_PROGRAMS_DATA = [
    {
        "name": "Beginner Full Body",
        "description": "A 4-week program perfect for beginners starting their fitness journey",
        "difficulty_level": "beginner",
        "duration_weeks": 4,
        "category": "general",
        "target_goals": ["build strength", "learn form", "establish routine"],
        "equipment_needed": ["dumbbells", "bodyweight"],
        "workouts_per_week": 3,
        "is_public": True,
        "weekly_schedule": {
            "monday": "full_body_a",
            "wednesday": "full_body_b",
            "friday": "full_body_a"
        }
    },
    {
        "name": "Push Pull Legs",
        "description": "Classic 6-day PPL split for intermediate to advanced lifters",
        "difficulty_level": "intermediate",
        "duration_weeks": 8,
        "category": "strength",
        "target_goals": ["build muscle", "increase strength", "body recomposition"],
        "equipment_needed": ["barbell", "dumbbells", "cables", "machines"],
        "workouts_per_week": 6,
        "is_public": True,
        "weekly_schedule": {
            "monday": "push",
            "tuesday": "pull",
            "wednesday": "legs",
            "thursday": "push",
            "friday": "pull",
            "saturday": "legs"
        }
    },
    {
        "name": "HIIT Fat Loss",
        "description": "High-intensity interval training program for rapid fat loss",
        "difficulty_level": "intermediate",
        "duration_weeks": 6,
        "category": "cardio",
        "target_goals": ["lose fat", "improve conditioning", "boost metabolism"],
        "equipment_needed": ["bodyweight", "dumbbells"],
        "workouts_per_week": 4,
        "is_public": True,
        "weekly_schedule": {
            "monday": "hiit_upper",
            "tuesday": "hiit_cardio",
            "thursday": "hiit_lower",
            "saturday": "hiit_full"
        }
    }
]

# Sample workout templates
WORKOUT_TEMPLATES_DATA = [
    {
        "name": "Full Body Workout A",
        "description": "Balanced full body workout focusing on compound movements",
        "category": "strength",
        "difficulty_level": "beginner",
        "duration_minutes": 45,
        "equipment_needed": ["dumbbells", "bodyweight"],
        "exercises": [
            {"exercise_name": "Squats", "sets": 3, "reps": "10-12", "rest_seconds": 90},
            {"exercise_name": "Push-ups", "sets": 3, "reps": "8-12", "rest_seconds": 60},
            {"exercise_name": "Lunges", "sets": 3, "reps": "10 each leg", "rest_seconds": 60},
            {"exercise_name": "Shoulder Press", "sets": 3, "reps": "10-12", "rest_seconds": 60},
            {"exercise_name": "Plank", "sets": 3, "reps": "30-60 seconds", "rest_seconds": 45}
        ],
        "is_public": True
    },
    {
        "name": "Push Day - Chest & Triceps",
        "description": "Focus on pushing movements for chest, shoulders, and triceps",
        "category": "strength",
        "difficulty_level": "intermediate",
        "duration_minutes": 60,
        "equipment_needed": ["barbell", "dumbbells", "cables"],
        "exercises": [
            {"exercise_name": "Barbell Bench Press", "sets": 4, "reps": "8-10", "rest_seconds": 120},
            {"exercise_name": "Shoulder Press", "sets": 3, "reps": "10-12", "rest_seconds": 90},
            {"exercise_name": "Dumbbell Flyes", "sets": 3, "reps": "12-15", "rest_seconds": 60},
            {"exercise_name": "Lateral Raises", "sets": 3, "reps": "12-15", "rest_seconds": 45},
            {"exercise_name": "Tricep Dips", "sets": 3, "reps": "10-12", "rest_seconds": 60}
        ],
        "is_public": True
    },
    {
        "name": "HIIT Cardio Blast",
        "description": "High-intensity interval training for maximum calorie burn",
        "category": "cardio",
        "difficulty_level": "intermediate",
        "duration_minutes": 30,
        "equipment_needed": ["bodyweight"],
        "exercises": [
            {"exercise_name": "Burpees", "sets": 4, "reps": "30 seconds", "rest_seconds": 30},
            {"exercise_name": "Mountain Climbers", "sets": 4, "reps": "30 seconds", "rest_seconds": 30},
            {"exercise_name": "Jumping Jacks", "sets": 4, "reps": "30 seconds", "rest_seconds": 30},
            {"exercise_name": "Plank", "sets": 3, "reps": "45 seconds", "rest_seconds": 30}
        ],
        "is_public": True
    }
]

async def check_and_seed_exercises(session):
    """Check if exercises exist, if not, seed them"""
    try:
        # Check if exercises already exist
        result = await session.execute(select(Exercise))
        existing_exercises = result.scalars().all()
        
        if len(existing_exercises) > 0:
            logger.info(f"Database already contains {len(existing_exercises)} exercises")
            return
        
        logger.info("Seeding exercises...")
        
        for exercise_data in EXERCISES_DATA:
            exercise = Exercise(
                name=exercise_data["name"],
                category=exercise_data["category"],
                muscle_groups=exercise_data["target_muscles"],
                equipment_required=[exercise_data["equipment"]] if isinstance(exercise_data["equipment"], str) else exercise_data["equipment"],
                difficulty_level=exercise_data["difficulty"],
                instructions=exercise_data["instructions"],
                safety_notes=exercise_data["tips"],
                variations=exercise_data["variations"],
                created_at=datetime.utcnow()
            )
            session.add(exercise)
        
        await session.commit()
        logger.info(f"Successfully seeded {len(EXERCISES_DATA)} exercises")
        
    except Exception as e:
        logger.error(f"Error seeding exercises: {e}")
        await session.rollback()
        raise

async def check_and_seed_programs(session):
    """Check if training programs exist, if not, seed them"""
    try:
        # Check if programs already exist
        result = await session.execute(select(TrainingProgram))
        existing_programs = result.scalars().all()
        
        if len(existing_programs) > 0:
            logger.info(f"Database already contains {len(existing_programs)} training programs")
            return
        
        logger.info("Seeding training programs...")
        
        # System user ID for seeded content
        # Use string for SQLite compatibility (will be converted by SQLAlchemy)
        system_user_id = '00000000-0000-0000-0000-000000000001'
        
        for program_data in TRAINING_PROGRAMS_DATA:
            program = TrainingProgram(
                name=program_data["name"],
                description=program_data["description"],
                user_id=system_user_id,
                difficulty_level=program_data["difficulty_level"],
                duration_weeks=program_data["duration_weeks"],
                goal=program_data["category"],  # Map category to goal field
                equipment_needed=program_data["equipment_needed"],
                workouts_per_week=program_data["workouts_per_week"],
                weekly_schedule=program_data["weekly_schedule"],
                is_public=program_data["is_public"],
                created_at=datetime.utcnow()
            )
            session.add(program)
        
        await session.commit()
        logger.info(f"Successfully seeded {len(TRAINING_PROGRAMS_DATA)} training programs")
        
    except Exception as e:
        logger.error(f"Error seeding programs: {e}")
        await session.rollback()
        raise

async def check_and_seed_workout_templates(session):
    """Check if workout templates exist, if not, seed them"""
    try:
        # Check if templates already exist
        result = await session.execute(select(WorkoutTemplate))
        existing_templates = result.scalars().all()
        
        if len(existing_templates) > 0:
            logger.info(f"Database already contains {len(existing_templates)} workout templates")
            return
        
        logger.info("Seeding workout templates...")
        
        # System user ID for seeded content
        # Use string for SQLite compatibility (will be converted by SQLAlchemy)
        system_user_id = '00000000-0000-0000-0000-000000000001'
        
        for template_data in WORKOUT_TEMPLATES_DATA:
            template = WorkoutTemplate(
                name=template_data["name"],
                description=template_data["description"],
                user_id=system_user_id,
                difficulty_level=template_data["difficulty_level"],
                duration_minutes=template_data["duration_minutes"],
                equipment_needed=template_data["equipment_needed"],
                target_muscle_groups=template_data.get("target_muscle_groups", []),
                exercises=template_data["exercises"],
                is_public=template_data["is_public"],
                created_at=datetime.utcnow()
            )
            session.add(template)
        
        await session.commit()
        logger.info(f"Successfully seeded {len(WORKOUT_TEMPLATES_DATA)} workout templates")
        
    except Exception as e:
        logger.error(f"Error seeding workout templates: {e}")
        await session.rollback()
        raise

async def ensure_system_user(session):
    """Ensure system user exists for seeded content"""
    try:
        from models.user import User
        
        system_user_id = '00000000-0000-0000-0000-000000000001'
        
        # Check if system user exists
        result = await session.execute(
            select(User).where(User.id == system_user_id)
        )
        system_user = result.scalar_one_or_none()
        
        if not system_user:
            logger.info("Creating system user for seeded content...")
            system_user = User(
                id=system_user_id,
                email='system@aifitness.local',
                username='system',
                display_name='System',
                password_hash='',  # No login allowed
                is_active=False,
                created_at=datetime.utcnow()
            )
            session.add(system_user)
            await session.commit()
            logger.info("System user created")
        
        return system_user_id
    except Exception as e:
        logger.error(f"Error ensuring system user: {e}")
        await session.rollback()
        raise

async def seed_database():
    """Main function to seed the database"""
    logger.info("Starting database seeding process...")
    
    # Create tables if they don't exist
    if sync_engine:
        try:
            Base.metadata.create_all(bind=sync_engine)
            logger.info("Database tables created/verified")
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            return
    
    # Seed data
    async with AsyncSessionLocal() as session:
        try:
            # Ensure system user exists first
            await ensure_system_user(session)
            
            await check_and_seed_exercises(session)
            await check_and_seed_workout_templates(session)
            await check_and_seed_programs(session)
            
            logger.info("Database seeding completed successfully!")
            
        except Exception as e:
            logger.error(f"Error during database seeding: {e}")
            raise

if __name__ == "__main__":
    # Run the seeding process
    asyncio.run(seed_database())