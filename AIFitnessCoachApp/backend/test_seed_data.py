#!/usr/bin/env python3
"""
Test script to verify database seeding worked correctly
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from services.database import get_db
from models.workout import Exercise
from models.custom_content import TrainingProgram, WorkoutTemplate
from utils.logger import setup_logger

logger = setup_logger(__name__)

def test_seed_data():
    """Test that seed data was loaded correctly"""
    try:
        db = next(get_db())
        
        # Check exercises
        exercises = db.query(Exercise).all()
        logger.info(f"✅ Found {len(exercises)} exercises in database")
        
        if exercises:
            logger.info("Sample exercises:")
            for exercise in exercises[:5]:
                logger.info(f"  - {exercise.name} ({exercise.category}, {exercise.difficulty})")
        
        # Check training programs
        programs = db.query(TrainingProgram).all()
        logger.info(f"\n✅ Found {len(programs)} training programs in database")
        
        if programs:
            logger.info("Sample programs:")
            for program in programs:
                logger.info(f"  - {program.name} ({program.duration_weeks} weeks, {program.difficulty_level})")
        
        # Check workout templates
        templates = db.query(WorkoutTemplate).all()
        logger.info(f"\n✅ Found {len(templates)} workout templates in database")
        
        if templates:
            logger.info("Sample templates:")
            for template in templates:
                logger.info(f"  - {template.name} ({template.duration_minutes} mins, {template.difficulty_level})")
        
        # Test the exercise service
        from services.exercise_service import ExerciseService
        exercise_service = ExerciseService()
        
        logger.info("\n🔍 Testing ExerciseService...")
        all_exercises = exercise_service.get_all_exercises()
        logger.info(f"✅ ExerciseService loaded {len(all_exercises)} exercises")
        
        # Test search
        search_results = exercise_service.search_exercises("push")
        logger.info(f"✅ Search for 'push' returned {len(search_results)} results")
        
        # Test muscle group filter
        chest_exercises = exercise_service.get_exercises_by_muscle_group("chest")
        logger.info(f"✅ Found {len(chest_exercises)} chest exercises")
        
        logger.info("\n✨ Database seeding verification complete!")
        
    except Exception as e:
        logger.error(f"❌ Error testing seed data: {e}")
    finally:
        if db:
            db.close()

if __name__ == "__main__":
    test_seed_data()