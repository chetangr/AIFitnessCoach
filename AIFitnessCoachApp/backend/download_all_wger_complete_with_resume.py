#!/usr/bin/env python3
"""
Download ALL workout data from Wger.de API with resume capability
Includes exercise videos and handles large datasets
"""
import requests
import json
import time
import os
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
import pickle

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# API Configuration
API_KEY = "3fbf0c576224772b0558f5bed1e72334372659f9"
BASE_URL = "https://wger.de/api/v2"
HEADERS = {
    "Authorization": f"Token {API_KEY}",
    "Accept": "application/json"
}

# Data storage directory
DATA_DIR = os.path.join(os.path.dirname(__file__), "wger_data_complete")
os.makedirs(DATA_DIR, exist_ok=True)

# Video storage directory
VIDEO_DIR = os.path.join(DATA_DIR, "exercise_videos")
os.makedirs(VIDEO_DIR, exist_ok=True)

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), "ai_fitness_coach.db")

# Progress file
PROGRESS_FILE = os.path.join(DATA_DIR, "download_progress.pkl")

# COMPLETE list of all endpoints
ENDPOINTS = {
    # Workout and routine endpoints
    "routine": "/routine/",
    "templates": "/templates/",
    "public-templates": "/public-templates/",
    "workoutsession": "/workoutsession/",
    "day": "/day/",
    "slot": "/slot/",
    "slot-entry": "/slot-entry/",
    
    # Configuration endpoints - with page limits to prevent timeout
    "weight-config": ("/weight-config/", 50),  # Limit pages
    "max-weight-config": ("/max-weight-config/", 50),
    "repetitions-config": ("/repetitions-config/", 100),  # This one is huge
    "max-repetitions-config": ("/max-repetitions-config/", 50),
    "sets-config": ("/sets-config/", 50),
    "max-sets-config": ("/max-sets-config/", 50),
    "rest-config": ("/rest-config/", 50),
    "max-rest-config": ("/max-rest-config/", 50),
    "rir-config": ("/rir-config/", 50),
    "max-rir-config": ("/max-rir-config/", 50),
    
    # Logging and tracking
    "workoutlog": "/workoutlog/",
    
    # Core data
    "language": "/language/",
    "license": "/license/",
    "userprofile": "/userprofile/",
    "setting-repetitionunit": "/setting-repetitionunit/",
    "setting-weightunit": "/setting-weightunit/",
    
    # Exercise related
    "exerciseinfo": "/exerciseinfo/",
    "exercise-translation": "/exercise-translation/",
    "exercise": "/exercise/",
    "equipment": "/equipment/",
    "deletion-log": "/deletion-log/",
    "exercisecategory": "/exercisecategory/",
    "video": "/video/",
    "exerciseimage": "/exerciseimage/",
    "exercisecomment": "/exercisecomment/",
    "exercisealias": "/exercisealias/",
    "muscle": "/muscle/",
    "variation": "/variation/",
    
    # Nutrition related
    "ingredient": "/ingredient/",
    "ingredientinfo": "/ingredientinfo/",
    "weightunit": "/weightunit/",
    "ingredientweightunit": "/ingredientweightunit/",
    "nutritionplan": "/nutritionplan/",
    "nutritionplaninfo": "/nutritionplaninfo/",
    "nutritiondiary": "/nutritiondiary/",
    "meal": "/meal/",
    "mealitem": "/mealitem/",
    "ingredient-image": "/ingredient-image/",
    
    # Body measurements
    "weightentry": "/weightentry/",
    "gallery": "/gallery/",
    "measurement": "/measurement/",
    "measurement-category": "/measurement-category/"
}

def load_progress():
    """Load download progress from file"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'rb') as f:
            return pickle.load(f)
    return {}

def save_progress(progress):
    """Save download progress to file"""
    with open(PROGRESS_FILE, 'wb') as f:
        pickle.dump(progress, f)

def download_video(video_url: str, video_id: str) -> bool:
    """Download a video file"""
    try:
        video_path = os.path.join(VIDEO_DIR, f"exercise_video_{video_id}.mp4")
        if os.path.exists(video_path):
            logger.info(f"Video {video_id} already exists, skipping")
            return True
            
        response = requests.get(video_url, stream=True, timeout=60)
        response.raise_for_status()
        
        with open(video_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        logger.info(f"Downloaded video {video_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to download video {video_id}: {e}")
        return False

def fetch_endpoint(endpoint: str, max_pages: int = 100, progress: dict = None) -> List[Dict[str, Any]]:
    """Fetch all data from a paginated endpoint with resume capability"""
    all_data = []
    
    # Check if we have previous progress for this endpoint
    start_page = 1
    if progress and endpoint in progress:
        all_data = progress[endpoint].get('data', [])
        start_page = progress[endpoint].get('last_page', 0) + 1
        logger.info(f"Resuming {endpoint} from page {start_page} with {len(all_data)} existing items")
    
    page = start_page
    
    while page <= max_pages:
        try:
            logger.info(f"Fetching page {page} from {endpoint}")
            url = f"{BASE_URL}{endpoint}"
            params = {"page": page, "limit": 100}
            
            response = requests.get(url, headers=HEADERS, params=params, timeout=30)
            
            if response.status_code == 404:
                logger.error(f"Error fetching {endpoint}: 404")
                break
            
            response.raise_for_status()
            data = response.json()
            
            # Handle both paginated and non-paginated responses
            if isinstance(data, dict) and "results" in data:
                results = data["results"]
                all_data.extend(results)
                
                # Save progress after each page
                if progress is not None:
                    progress[endpoint] = {'data': all_data, 'last_page': page}
                    save_progress(progress)
                
                # Check if there are more pages
                if not data.get("next"):
                    break
            else:
                # Non-paginated endpoint
                all_data = data if isinstance(data, list) else [data]
                break
            
            page += 1
            time.sleep(0.3)  # Rate limiting - be nice to the API
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching {endpoint} page {page}: {e}")
            # Save progress before breaking
            if progress is not None and all_data:
                progress[endpoint] = {'data': all_data, 'last_page': page - 1}
                save_progress(progress)
            break
        except Exception as e:
            logger.error(f"Unexpected error fetching {endpoint}: {e}")
            break
    
    logger.info(f"Fetched {len(all_data)} items from {endpoint}")
    return all_data

def save_to_json(data: List[Dict[str, Any]], filename: str):
    """Save data to JSON file"""
    filepath = os.path.join(DATA_DIR, f"{filename}.json")
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved {len(data)} items to {filepath}")

def create_database_tables(conn: sqlite3.Connection):
    """Create all necessary database tables"""
    cursor = conn.cursor()
    
    # Core exercise tables (already exist, but ensure they're created)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_exercises (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            category INTEGER,
            muscles TEXT,
            muscles_secondary TEXT,
            equipment TEXT,
            language INTEGER,
            uuid TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_equipment (
            id INTEGER PRIMARY KEY,
            name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_muscles (
            id INTEGER PRIMARY KEY,
            name TEXT,
            name_en TEXT,
            is_front BOOLEAN,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_exercise_categories (
            id INTEGER PRIMARY KEY,
            name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Workout tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_routines (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_templates (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            is_public BOOLEAN,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_workout_sessions (
            id INTEGER PRIMARY KEY,
            date TEXT,
            notes TEXT,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_workout_logs (
            id INTEGER PRIMARY KEY,
            date TEXT,
            exercise_id INTEGER,
            repetitions INTEGER,
            weight REAL,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Configuration tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_configurations (
            id INTEGER PRIMARY KEY,
            type TEXT,
            exercise_id INTEGER,
            sets INTEGER,
            repetitions INTEGER,
            weight REAL,
            rest_seconds INTEGER,
            rir INTEGER,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Video table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_exercise_videos (
            id INTEGER PRIMARY KEY,
            exercise_id INTEGER,
            video_url TEXT,
            local_path TEXT,
            duration INTEGER,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Nutrition tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_ingredients (
            id INTEGER PRIMARY KEY,
            name TEXT,
            energy REAL,
            protein REAL,
            carbohydrates REAL,
            fat REAL,
            fiber REAL,
            sodium REAL,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_meals (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Measurement tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wger_measurements (
            id INTEGER PRIMARY KEY,
            category TEXT,
            value REAL,
            unit TEXT,
            date TEXT,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()

def save_to_database(conn: sqlite3.Connection, endpoint: str, data: List[Dict[str, Any]]):
    """Save data to appropriate database table"""
    cursor = conn.cursor()
    
    try:
        # Exercise-related endpoints
        if endpoint == "exercise" and data:
            for item in data:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_exercises 
                    (id, name, description, category, muscles, muscles_secondary, equipment, language, uuid)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item.get('id'), 
                    item.get('name'), 
                    item.get('description'),
                    item.get('category'),
                    json.dumps(item.get('muscles', [])),
                    json.dumps(item.get('muscles_secondary', [])),
                    json.dumps(item.get('equipment', [])),
                    item.get('language'),
                    item.get('uuid')
                ))
        
        elif endpoint == "equipment" and data:
            for item in data:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_equipment (id, name)
                    VALUES (?, ?)
                ''', (item.get('id'), item.get('name')))
        
        elif endpoint == "muscle" and data:
            for item in data:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_muscles (id, name, name_en, is_front)
                    VALUES (?, ?, ?, ?)
                ''', (item.get('id'), item.get('name'), item.get('name_en'), item.get('is_front')))
        
        elif endpoint == "exercisecategory" and data:
            for item in data:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_exercise_categories (id, name)
                    VALUES (?, ?)
                ''', (item.get('id'), item.get('name')))
        
        # Routine/Template endpoints
        elif endpoint == "routine" and data:
            for item in data:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_routines (id, name, description, data)
                    VALUES (?, ?, ?, ?)
                ''', (item.get('id'), item.get('name'), item.get('description'), json.dumps(item)))
        
        elif endpoint in ["templates", "public-templates"] and data:
            for item in data:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_templates (id, name, description, is_public, data)
                    VALUES (?, ?, ?, ?, ?)
                ''', (item.get('id'), item.get('name'), item.get('description'), 
                      endpoint == "public-templates", json.dumps(item)))
        
        # Configuration endpoints
        elif "config" in endpoint and data:
            config_type = endpoint.replace("-", "_").replace("/", "")
            for item in data:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_configurations 
                    (id, type, exercise_id, sets, repetitions, weight, rest_seconds, rir, data)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item.get('id'),
                    config_type,
                    item.get('exercise_id') or item.get('exercise'),
                    item.get('sets'),
                    item.get('repetitions') or item.get('reps'),
                    item.get('weight'),
                    item.get('rest') or item.get('rest_seconds'),
                    item.get('rir'),
                    json.dumps(item)
                ))
        
        # Video endpoints
        elif endpoint == "video" and data:
            for item in data:
                video_id = item.get('id')
                video_url = item.get('video')
                local_path = None
                
                # Download video if URL exists
                if video_url:
                    if download_video(video_url, video_id):
                        local_path = f"exercise_video_{video_id}.mp4"
                
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_exercise_videos 
                    (id, exercise_id, video_url, local_path, duration, data)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    video_id,
                    item.get('exercise'),
                    video_url,
                    local_path,
                    item.get('duration'),
                    json.dumps(item)
                ))
        
        # Nutrition endpoints
        elif endpoint == "ingredient" and data:
            for item in data:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_ingredients 
                    (id, name, energy, protein, carbohydrates, fat, fiber, sodium, data)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item.get('id'),
                    item.get('name'),
                    item.get('energy'),
                    item.get('protein'),
                    item.get('carbohydrates'),
                    item.get('fat'),
                    item.get('fiber'),
                    item.get('sodium'),
                    json.dumps(item)
                ))
        
        conn.commit()
        logger.info(f"Saved {len(data)} {endpoint} items to database")
        
    except Exception as e:
        logger.error(f"Error saving {endpoint} to database: {e}")
        conn.rollback()

def main():
    """Main download function with resume capability"""
    logger.info("Starting COMPLETE Wger data download with resume capability...")
    
    # Load progress
    progress = load_progress()
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    create_database_tables(conn)
    
    # Track statistics
    stats = {}
    
    # Download data from each endpoint
    for name, endpoint_info in ENDPOINTS.items():
        # Handle endpoints with page limits
        if isinstance(endpoint_info, tuple):
            endpoint, max_pages = endpoint_info
        else:
            endpoint = endpoint_info
            max_pages = 100
        
        logger.info(f"\nDownloading {name} data (max {max_pages} pages)...")
        
        try:
            # Check if already completed
            if name in progress and progress[name].get('completed', False):
                logger.info(f"Skipping {name} - already completed")
                stats[name] = len(progress[name].get('data', []))
                continue
            
            data = fetch_endpoint(endpoint, max_pages, progress)
            
            if data:
                # Save to JSON
                save_to_json(data, name)
                
                # Save to database
                save_to_database(conn, name, data)
                
                stats[name] = len(data)
                
                # Mark as completed
                if name in progress:
                    progress[name]['completed'] = True
                else:
                    progress[name] = {'data': data, 'completed': True}
                save_progress(progress)
            else:
                stats[name] = 0
                
        except Exception as e:
            logger.error(f"Failed to process {name}: {e}")
            stats[name] = 0
    
    # Close database connection
    conn.close()
    
    # Save index file with metadata
    index_data = {
        "download_date": datetime.now().isoformat(),
        "api_key": API_KEY[:10] + "...",
        "statistics": stats,
        "total_items": sum(stats.values()),
        "video_count": len(os.listdir(VIDEO_DIR)) if os.path.exists(VIDEO_DIR) else 0
    }
    
    with open(os.path.join(DATA_DIR, "index.json"), 'w') as f:
        json.dump(index_data, f, indent=2)
    
    # Print summary
    logger.info("\n" + "="*50)
    logger.info("DOWNLOAD COMPLETE!")
    logger.info("="*50)
    logger.info("\nData Summary:")
    for endpoint, count in stats.items():
        logger.info(f"{endpoint}: {count} items")
    logger.info(f"\nTotal items downloaded: {sum(stats.values())}")
    logger.info(f"Videos downloaded: {len(os.listdir(VIDEO_DIR)) if os.path.exists(VIDEO_DIR) else 0}")
    logger.info(f"Data saved to: {DATA_DIR}")
    logger.info(f"Database updated: {DB_PATH}")
    
    # Clean up progress file
    if os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)
        logger.info("Removed progress file")

if __name__ == "__main__":
    main()