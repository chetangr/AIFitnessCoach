#!/usr/bin/env python3
"""
Import all workout data from Wger.de API
"""
import requests
import json
import time
from datetime import datetime
import os
from typing import Dict, List, Any

# API Configuration
API_KEY = "3fbf0c576224772b0558f5bed1e72334372659f9"
BASE_URL = "https://wger.de/api/v2"
HEADERS = {
    "Authorization": f"Token {API_KEY}",
    "Accept": "application/json"
}

# Endpoints to fetch
ENDPOINTS = {
    "routine": "/routine/",
    "templates": "/templates/",
    "public-templates": "/public-templates/",
    "day": "/day/",
    "slot": "/slot/",
    "slot-entry": "/slot-entry/",
    "exerciseinfo": "/exerciseinfo/",
    "exercise": "/exercise/",
    "equipment": "/equipment/",
    "exercisecategory": "/exercisecategory/",
    "muscle": "/muscle/",
    "language": "/language/",
    "license": "/license/",
}

# Data storage directory
DATA_DIR = os.path.join(os.path.dirname(__file__), "wger_data")
os.makedirs(DATA_DIR, exist_ok=True)

def fetch_paginated_data(endpoint: str, params: Dict[str, Any] = None) -> List[Dict]:
    """Fetch all pages of data from a paginated endpoint"""
    all_data = []
    url = f"{BASE_URL}{endpoint}"
    params = params or {}
    params['limit'] = 100  # Max items per page
    
    while url:
        try:
            print(f"Fetching: {url}")
            response = requests.get(url, headers=HEADERS, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # Handle different response formats
            if isinstance(data, dict) and 'results' in data:
                all_data.extend(data['results'])
                url = data.get('next')
                params = None  # Clear params for subsequent requests
            else:
                # Non-paginated response
                if isinstance(data, list):
                    all_data.extend(data)
                else:
                    all_data.append(data)
                url = None
                
            # Rate limiting
            time.sleep(0.5)
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {url}: {e}")
            url = None
            
    return all_data

def save_data(filename: str, data: Any):
    """Save data to JSON file"""
    filepath = os.path.join(DATA_DIR, f"{filename}.json")
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data) if isinstance(data, list) else 1} items to {filename}.json")

def import_exercises():
    """Import exercise data with translations"""
    print("\n=== Importing Exercises ===")
    
    # Get exercises in English
    exercises = fetch_paginated_data("/exerciseinfo/", {"language": 2})  # 2 = English
    save_data("exercises", exercises)
    
    # Get exercise categories
    categories = fetch_paginated_data("/exercisecategory/")
    save_data("exercise_categories", categories)
    
    # Get muscles
    muscles = fetch_paginated_data("/muscle/")
    save_data("muscles", muscles)
    
    # Get equipment
    equipment = fetch_paginated_data("/equipment/")
    save_data("equipment", equipment)
    
    return exercises

def import_workout_templates():
    """Import workout templates and routines"""
    print("\n=== Importing Workout Templates ===")
    
    # Get public templates
    templates = []
    try:
        # Try to get public templates
        public_templates = fetch_paginated_data("/template/", {"is_public": True})
        templates.extend(public_templates)
    except:
        print("Could not fetch public templates")
    
    save_data("workout_templates", templates)
    
    # Get workout days
    days = fetch_paginated_data("/day/")
    save_data("workout_days", days)
    
    return templates

def create_exercise_database():
    """Create a consolidated exercise database for the app"""
    print("\n=== Creating Exercise Database ===")
    
    # Load saved data
    try:
        with open(os.path.join(DATA_DIR, "exercises.json"), 'r') as f:
            exercises = json.load(f)
        with open(os.path.join(DATA_DIR, "exercise_categories.json"), 'r') as f:
            categories = json.load(f)
        with open(os.path.join(DATA_DIR, "muscles.json"), 'r') as f:
            muscles = json.load(f)
        with open(os.path.join(DATA_DIR, "equipment.json"), 'r') as f:
            equipment_list = json.load(f)
    except FileNotFoundError as e:
        print(f"Error loading data: {e}")
        return
    
    # Transform exercises for app database
    app_exercises = []
    
    for exercise in exercises:
        # Get English translation
        english_translation = None
        for translation in exercise.get('translations', []):
            if translation.get('language') == 2:  # English
                english_translation = translation
                break
        
        # Skip exercises without English translation
        if not english_translation or not english_translation.get('name'):
            continue
            
        # Extract category
        category_name = exercise.get('category', {}).get('name', 'Other')
        
        # Extract muscles
        primary_muscles = [m.get('name_en') or m.get('name') for m in exercise.get('muscles', [])]
        secondary_muscles = [m.get('name_en') or m.get('name') for m in exercise.get('muscles_secondary', [])]
        
        # Extract equipment
        equipment = [e.get('name') for e in exercise.get('equipment', [])]
        
        app_exercise = {
            'id': f"wger_{exercise['id']}",
            'name': english_translation['name'],
            'description': english_translation.get('description', ''),
            'category': category_name,
            'primaryMuscles': primary_muscles,
            'secondaryMuscles': secondary_muscles,
            'equipment': equipment,
            'difficulty': 'Intermediate',  # Default as Wger doesn't provide difficulty
            'instructions': english_translation.get('description', ''),
            'images': [f"https://wger.de{img['image']}" if 'image' in img else '' for img in exercise.get('images', [])],
            'source': 'wger',
            'sourceId': exercise['id']
        }
        
        # Set equipment string (first equipment or "Bodyweight")
        app_exercise['equipment_str'] = app_exercise['equipment'][0] if app_exercise['equipment'] else "Bodyweight"
        
        app_exercises.append(app_exercise)
    
    # Save app-ready exercise database
    save_data("app_exercises", app_exercises)
    
    # Create TypeScript file for the app
    create_typescript_database(app_exercises)
    
    print(f"Created database with {len(app_exercises)} exercises")

def create_typescript_database(exercises: List[Dict]):
    """Create TypeScript file with exercise data"""
    ts_content = """// Auto-generated from Wger.de API
// Generated on: """ + datetime.now().isoformat() + """

export interface WgerExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  equipment_str: string;
  difficulty: string;
  instructions: string;
  images: string[];
  source: string;
  sourceId: number;
}

export const wgerExercises: WgerExercise[] = """ + json.dumps(exercises, indent=2) + ";"
    
    ts_filepath = os.path.join(os.path.dirname(__file__), "..", "src", "data", "wgerExerciseDatabase.ts")
    os.makedirs(os.path.dirname(ts_filepath), exist_ok=True)
    
    with open(ts_filepath, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"Created TypeScript database at: {ts_filepath}")

def main():
    """Main import function"""
    print("Starting Wger.de data import...")
    print(f"API Key: {API_KEY[:10]}...")
    print(f"Data will be saved to: {DATA_DIR}")
    
    # Import exercises
    exercises = import_exercises()
    print(f"Imported {len(exercises)} exercises")
    
    # Import workout templates
    templates = import_workout_templates()
    print(f"Imported {len(templates)} workout templates")
    
    # Create consolidated database
    create_exercise_database()
    
    print("\nImport complete!")
    print(f"Data saved to: {DATA_DIR}")
    
    # Summary
    summary = {
        "import_date": datetime.now().isoformat(),
        "exercises_count": len(exercises),
        "templates_count": len(templates),
        "data_directory": DATA_DIR
    }
    save_data("import_summary", summary)

if __name__ == "__main__":
    main()