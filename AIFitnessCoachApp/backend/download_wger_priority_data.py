#!/usr/bin/env python3
"""
Download priority wger.de exercise data for the AI Fitness Coach app.
Focuses on essential exercise data, skipping massive configuration endpoints.
"""

import requests
import json
import time
import os
from datetime import datetime
import sqlite3
from typing import Dict, List, Any, Optional
import logging
from urllib.parse import urlparse
import hashlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class WgerPriorityDownloader:
    def __init__(self, db_path: str = "ai_fitness_coach.db"):
        self.base_url = "https://wger.de/api/v2"
        self.db_path = db_path
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'User-Agent': 'AIFitnessCoach/1.0'
        })
        self.download_dir = "wger_downloads"
        self.video_dir = os.path.join(self.download_dir, "videos")
        self.image_dir = os.path.join(self.download_dir, "images")
        
        # Create directories
        os.makedirs(self.video_dir, exist_ok=True)
        os.makedirs(self.image_dir, exist_ok=True)
        
        # Track download progress
        self.stats = {
            'exercises': 0,
            'categories': 0,
            'muscles': 0,
            'equipment': 0,
            'images': 0,
            'videos': 0,
            'routines': 0,
            'templates': 0,
            'errors': 0
        }
    
    def connect_db(self):
        """Connect to the SQLite database."""
        return sqlite3.connect(self.db_path)
    
    def create_wger_tables(self):
        """Create tables for wger data if they don't exist."""
        conn = self.connect_db()
        cursor = conn.cursor()
        
        # Exercise categories
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wger_categories (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                name_en TEXT
            )
        ''')
        
        # Muscles
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wger_muscles (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                name_en TEXT,
                is_front INTEGER DEFAULT 0,
                image_url_main TEXT,
                image_url_secondary TEXT
            )
        ''')
        
        # Equipment
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wger_equipment (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                name_en TEXT
            )
        ''')
        
        # Exercises
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wger_exercises (
                id INTEGER PRIMARY KEY,
                uuid TEXT UNIQUE,
                name TEXT NOT NULL,
                name_en TEXT,
                description TEXT,
                description_en TEXT,
                category_id INTEGER,
                creation_date TEXT,
                language_id INTEGER,
                FOREIGN KEY (category_id) REFERENCES wger_categories(id)
            )
        ''')
        
        # Exercise muscles (many-to-many)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wger_exercise_muscles (
                exercise_id INTEGER,
                muscle_id INTEGER,
                is_secondary INTEGER DEFAULT 0,
                PRIMARY KEY (exercise_id, muscle_id),
                FOREIGN KEY (exercise_id) REFERENCES wger_exercises(id),
                FOREIGN KEY (muscle_id) REFERENCES wger_muscles(id)
            )
        ''')
        
        # Exercise equipment (many-to-many)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wger_exercise_equipment (
                exercise_id INTEGER,
                equipment_id INTEGER,
                PRIMARY KEY (exercise_id, equipment_id),
                FOREIGN KEY (exercise_id) REFERENCES wger_exercises(id),
                FOREIGN KEY (equipment_id) REFERENCES wger_equipment(id)
            )
        ''')
        
        # Exercise images
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wger_exercise_images (
                id INTEGER PRIMARY KEY,
                exercise_id INTEGER,
                image_url TEXT,
                local_path TEXT,
                is_main INTEGER DEFAULT 0,
                FOREIGN KEY (exercise_id) REFERENCES wger_exercises(id)
            )
        ''')
        
        # Exercise videos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wger_exercise_videos (
                id INTEGER PRIMARY KEY,
                exercise_id INTEGER,
                video_url TEXT,
                local_path TEXT,
                size INTEGER,
                duration REAL,
                width INTEGER,
                height INTEGER,
                codec TEXT,
                FOREIGN KEY (exercise_id) REFERENCES wger_exercises(id)
            )
        ''')
        
        # Workout templates
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wger_templates (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                creation_date TEXT,
                is_public INTEGER DEFAULT 0
            )
        ''')
        
        # Download metadata
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wger_download_metadata (
                endpoint TEXT PRIMARY KEY,
                last_downloaded TEXT,
                total_items INTEGER,
                status TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database tables created successfully")
    
    def fetch_paginated_data(self, endpoint: str, limit: int = 100) -> List[Dict]:
        """Fetch all pages of data from a paginated endpoint."""
        all_results = []
        url = f"{self.base_url}/{endpoint}?limit={limit}"
        
        while url:
            try:
                logger.info(f"Fetching: {url}")
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                results = data.get('results', [])
                all_results.extend(results)
                
                # Get next page URL
                url = data.get('next')
                
                # Rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                logger.error(f"Error fetching {url}: {e}")
                self.stats['errors'] += 1
                break
        
        return all_results
    
    def download_file(self, url: str, local_path: str) -> bool:
        """Download a file from URL to local path."""
        try:
            response = self.session.get(url, stream=True, timeout=60)
            response.raise_for_status()
            
            with open(local_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            return True
        except Exception as e:
            logger.error(f"Error downloading {url}: {e}")
            return False
    
    def download_categories(self):
        """Download exercise categories."""
        logger.info("Downloading exercise categories...")
        categories = self.fetch_paginated_data("exercisecategory")
        
        conn = self.connect_db()
        cursor = conn.cursor()
        
        for cat in categories:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_categories (id, name, name_en)
                    VALUES (?, ?, ?)
                ''', (cat['id'], cat['name'], cat.get('name_en', cat['name'])))
                self.stats['categories'] += 1
            except Exception as e:
                logger.error(f"Error inserting category {cat['id']}: {e}")
                self.stats['errors'] += 1
        
        conn.commit()
        conn.close()
        logger.info(f"Downloaded {self.stats['categories']} categories")
    
    def download_muscles(self):
        """Download muscle data."""
        logger.info("Downloading muscles...")
        muscles = self.fetch_paginated_data("muscle")
        
        conn = self.connect_db()
        cursor = conn.cursor()
        
        for muscle in muscles:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_muscles 
                    (id, name, name_en, is_front, image_url_main, image_url_secondary)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    muscle['id'], 
                    muscle['name'], 
                    muscle.get('name_en', muscle['name']),
                    muscle.get('is_front', 0),
                    muscle.get('image_url_main'),
                    muscle.get('image_url_secondary')
                ))
                self.stats['muscles'] += 1
            except Exception as e:
                logger.error(f"Error inserting muscle {muscle['id']}: {e}")
                self.stats['errors'] += 1
        
        conn.commit()
        conn.close()
        logger.info(f"Downloaded {self.stats['muscles']} muscles")
    
    def download_equipment(self):
        """Download equipment data."""
        logger.info("Downloading equipment...")
        equipment = self.fetch_paginated_data("equipment")
        
        conn = self.connect_db()
        cursor = conn.cursor()
        
        for eq in equipment:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_equipment (id, name, name_en)
                    VALUES (?, ?, ?)
                ''', (eq['id'], eq['name'], eq.get('name_en', eq['name'])))
                self.stats['equipment'] += 1
            except Exception as e:
                logger.error(f"Error inserting equipment {eq['id']}: {e}")
                self.stats['errors'] += 1
        
        conn.commit()
        conn.close()
        logger.info(f"Downloaded {self.stats['equipment']} equipment items")
    
    def download_exercises(self):
        """Download exercise data with relationships."""
        logger.info("Downloading exercises...")
        exercises = self.fetch_paginated_data("exercise")
        
        conn = self.connect_db()
        cursor = conn.cursor()
        
        for ex in exercises:
            try:
                # Insert exercise
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_exercises 
                    (id, uuid, name, name_en, description, description_en, 
                     category_id, creation_date, language_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    ex['id'],
                    ex.get('uuid'),
                    ex.get('name', 'Unknown'),
                    ex.get('name_en', ex.get('name')),
                    ex.get('description', ''),
                    ex.get('description_en', ex.get('description')),
                    ex.get('category'),
                    ex.get('creation_date'),
                    ex.get('language')
                ))
                
                # Insert muscle relationships
                for muscle_id in ex.get('muscles', []):
                    cursor.execute('''
                        INSERT OR REPLACE INTO wger_exercise_muscles 
                        (exercise_id, muscle_id, is_secondary)
                        VALUES (?, ?, ?)
                    ''', (ex['id'], muscle_id, 0))
                
                for muscle_id in ex.get('muscles_secondary', []):
                    cursor.execute('''
                        INSERT OR REPLACE INTO wger_exercise_muscles 
                        (exercise_id, muscle_id, is_secondary)
                        VALUES (?, ?, ?)
                    ''', (ex['id'], muscle_id, 1))
                
                # Insert equipment relationships
                for eq_id in ex.get('equipment', []):
                    cursor.execute('''
                        INSERT OR REPLACE INTO wger_exercise_equipment 
                        (exercise_id, equipment_id)
                        VALUES (?, ?)
                    ''', (ex['id'], eq_id))
                
                self.stats['exercises'] += 1
                
                if self.stats['exercises'] % 100 == 0:
                    logger.info(f"Progress: {self.stats['exercises']} exercises downloaded")
                    conn.commit()
                
            except Exception as e:
                logger.error(f"Error inserting exercise {ex.get('id')}: {e}")
                self.stats['errors'] += 1
        
        conn.commit()
        conn.close()
        logger.info(f"Downloaded {self.stats['exercises']} exercises")
    
    def download_exercise_images(self):
        """Download exercise images."""
        logger.info("Downloading exercise images...")
        images = self.fetch_paginated_data("exerciseimage")
        
        conn = self.connect_db()
        cursor = conn.cursor()
        
        for img in images[:1000]:  # Limit to first 1000 images
            try:
                image_url = img.get('image')
                if image_url:
                    # Generate local filename
                    filename = f"exercise_{img.get('exercise')}_{img['id']}.jpg"
                    local_path = os.path.join(self.image_dir, filename)
                    
                    # Download image
                    if self.download_file(image_url, local_path):
                        cursor.execute('''
                            INSERT OR REPLACE INTO wger_exercise_images 
                            (id, exercise_id, image_url, local_path, is_main)
                            VALUES (?, ?, ?, ?, ?)
                        ''', (
                            img['id'],
                            img.get('exercise'),
                            image_url,
                            local_path,
                            img.get('is_main', 0)
                        ))
                        self.stats['images'] += 1
                        
                        if self.stats['images'] % 50 == 0:
                            logger.info(f"Progress: {self.stats['images']} images downloaded")
                            conn.commit()
                
            except Exception as e:
                logger.error(f"Error processing image {img.get('id')}: {e}")
                self.stats['errors'] += 1
        
        conn.commit()
        conn.close()
        logger.info(f"Downloaded {self.stats['images']} images")
    
    def download_exercise_videos(self):
        """Download exercise videos metadata (not actual videos due to size)."""
        logger.info("Downloading exercise video metadata...")
        videos = self.fetch_paginated_data("video")
        
        conn = self.connect_db()
        cursor = conn.cursor()
        
        for video in videos[:100]:  # Limit to first 100 videos
            try:
                video_url = video.get('video')
                if video_url:
                    cursor.execute('''
                        INSERT OR REPLACE INTO wger_exercise_videos 
                        (id, exercise_id, video_url, size, duration, width, height, codec)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        video['id'],
                        video.get('exercise'),
                        video_url,
                        video.get('size'),
                        video.get('duration'),
                        video.get('width'),
                        video.get('height'),
                        video.get('codec')
                    ))
                    self.stats['videos'] += 1
                
            except Exception as e:
                logger.error(f"Error processing video {video.get('id')}: {e}")
                self.stats['errors'] += 1
        
        conn.commit()
        conn.close()
        logger.info(f"Downloaded {self.stats['videos']} video metadata entries")
    
    def download_templates(self):
        """Download workout templates."""
        logger.info("Downloading workout templates...")
        templates = self.fetch_paginated_data("template")
        
        conn = self.connect_db()
        cursor = conn.cursor()
        
        for template in templates[:500]:  # Limit to first 500 templates
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO wger_templates 
                    (id, name, description, creation_date, is_public)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    template['id'],
                    template.get('name', 'Unnamed'),
                    template.get('description', ''),
                    template.get('creation_date'),
                    template.get('is_public', 0)
                ))
                self.stats['templates'] += 1
                
            except Exception as e:
                logger.error(f"Error inserting template {template.get('id')}: {e}")
                self.stats['errors'] += 1
        
        conn.commit()
        conn.close()
        logger.info(f"Downloaded {self.stats['templates']} templates")
    
    def update_metadata(self, endpoint: str, total_items: int, status: str = "completed"):
        """Update download metadata."""
        conn = self.connect_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO wger_download_metadata 
            (endpoint, last_downloaded, total_items, status)
            VALUES (?, ?, ?, ?)
        ''', (endpoint, datetime.now().isoformat(), total_items, status))
        
        conn.commit()
        conn.close()
    
    def run_priority_download(self):
        """Run the priority download process."""
        logger.info("Starting wger priority data download...")
        start_time = time.time()
        
        # Create database tables
        self.create_wger_tables()
        
        # Download in priority order
        try:
            # 1. Basic reference data
            self.download_categories()
            self.update_metadata("categories", self.stats['categories'])
            
            self.download_muscles()
            self.update_metadata("muscles", self.stats['muscles'])
            
            self.download_equipment()
            self.update_metadata("equipment", self.stats['equipment'])
            
            # 2. Exercise data (most important)
            self.download_exercises()
            self.update_metadata("exercises", self.stats['exercises'])
            
            # 3. Media (limited)
            self.download_exercise_images()
            self.update_metadata("images", self.stats['images'])
            
            self.download_exercise_videos()
            self.update_metadata("videos", self.stats['videos'])
            
            # 4. Templates (limited)
            self.download_templates()
            self.update_metadata("templates", self.stats['templates'])
            
        except KeyboardInterrupt:
            logger.info("Download interrupted by user")
        except Exception as e:
            logger.error(f"Unexpected error during download: {e}")
        
        # Print summary
        elapsed_time = time.time() - start_time
        logger.info("\n" + "="*50)
        logger.info("DOWNLOAD SUMMARY")
        logger.info("="*50)
        logger.info(f"Total time: {elapsed_time:.2f} seconds")
        logger.info(f"Categories: {self.stats['categories']}")
        logger.info(f"Muscles: {self.stats['muscles']}")
        logger.info(f"Equipment: {self.stats['equipment']}")
        logger.info(f"Exercises: {self.stats['exercises']}")
        logger.info(f"Images: {self.stats['images']}")
        logger.info(f"Videos: {self.stats['videos']}")
        logger.info(f"Templates: {self.stats['templates']}")
        logger.info(f"Errors: {self.stats['errors']}")
        logger.info("="*50)
        
        # Save stats to file
        stats_file = os.path.join(self.download_dir, "download_stats.json")
        with open(stats_file, 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'elapsed_seconds': elapsed_time,
                'stats': self.stats
            }, f, indent=2)
        
        logger.info(f"Stats saved to {stats_file}")

def main():
    """Main entry point."""
    downloader = WgerPriorityDownloader()
    downloader.run_priority_download()

if __name__ == "__main__":
    main()