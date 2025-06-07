"""
Dynamic Theme Engine for AI Fitness Coach
Automatically changes themes based on holidays, festivals, and special occasions
"""

from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
import json
from enum import Enum

class ThemeType(Enum):
    DEFAULT = "default"
    CHRISTMAS = "christmas"
    NEW_YEAR = "new_year"
    VALENTINE = "valentine"
    EASTER = "easter"
    HALLOWEEN = "halloween"
    THANKSGIVING = "thanksgiving"
    DIWALI = "diwali"
    CHINESE_NEW_YEAR = "chinese_new_year"
    HANUKKAH = "hanukkah"
    EID = "eid"
    FOURTH_OF_JULY = "fourth_of_july"
    ST_PATRICKS = "st_patricks"
    HOLI = "holi"
    SUMMER = "summer"
    WINTER = "winter"
    SPRING = "spring"
    AUTUMN = "autumn"

class DynamicThemeEngine:
    def __init__(self):
        self.themes = self._initialize_themes()
        self.holiday_calendar = self._initialize_holiday_calendar()
    
    def _initialize_themes(self) -> Dict:
        """Initialize all available themes with their color schemes"""
        return {
            ThemeType.DEFAULT: {
                "name": "Default",
                "primary": ["#667eea", "#764ba2", "#f093fb"],
                "secondary": ["#6B46C1", "#9333EA", "#C084FC"],
                "accent": "#FA114F",
                "glass": {
                    "tint": "light",
                    "intensity": 70,
                    "overlay": "rgba(255, 255, 255, 0.15)"
                },
                "particles": None,
                "animation": "standard"
            },
            
            ThemeType.CHRISTMAS: {
                "name": "Christmas Magic",
                "primary": ["#165B33", "#EA4630", "#F8B229"],
                "secondary": ["#BB2528", "#146B3A", "#F7941E"],
                "accent": "#EA4630",
                "glass": {
                    "tint": "light",
                    "intensity": 80,
                    "overlay": "rgba(255, 255, 255, 0.25)"
                },
                "particles": "snowflakes",
                "animation": "gentle_fall",
                "icons": ["🎄", "🎅", "🎁", "⛄", "❄️"]
            },
            
            ThemeType.NEW_YEAR: {
                "name": "New Year Celebration",
                "primary": ["#FFD700", "#FFA500", "#FF6347"],
                "secondary": ["#C0C0C0", "#FFD700", "#000000"],
                "accent": "#FFD700",
                "glass": {
                    "tint": "dark",
                    "intensity": 85,
                    "overlay": "rgba(255, 215, 0, 0.2)"
                },
                "particles": "fireworks",
                "animation": "burst",
                "icons": ["🎊", "🎉", "🥳", "🍾", "✨"]
            },
            
            ThemeType.VALENTINE: {
                "name": "Valentine's Love",
                "primary": ["#FF1744", "#E91E63", "#FF80AB"],
                "secondary": ["#F50057", "#C51162", "#FF4081"],
                "accent": "#FF1744",
                "glass": {
                    "tint": "light",
                    "intensity": 75,
                    "overlay": "rgba(255, 23, 68, 0.15)"
                },
                "particles": "hearts",
                "animation": "float_up",
                "icons": ["❤️", "💕", "💖", "💗", "🌹"]
            },
            
            ThemeType.HALLOWEEN: {
                "name": "Spooky Halloween",
                "primary": ["#FF6600", "#8B4513", "#FF8C00"],
                "secondary": ["#8B008B", "#4B0082", "#FF4500"],
                "accent": "#FF6600",
                "glass": {
                    "tint": "dark",
                    "intensity": 90,
                    "overlay": "rgba(255, 102, 0, 0.2)"
                },
                "particles": "bats",
                "animation": "spooky_float",
                "icons": ["🎃", "👻", "🦇", "🕷️", "🍬"]
            },
            
            ThemeType.DIWALI: {
                "name": "Festival of Lights",
                "primary": ["#FF6B35", "#F7931E", "#FFCC00"],
                "secondary": ["#C1272D", "#FF5722", "#FFC107"],
                "accent": "#FF6B35",
                "glass": {
                    "tint": "light",
                    "intensity": 85,
                    "overlay": "rgba(255, 204, 0, 0.25)"
                },
                "particles": "diyas",
                "animation": "twinkle",
                "icons": ["🪔", "✨", "🎆", "🌟", "💫"]
            },
            
            ThemeType.HOLI: {
                "name": "Festival of Colors",
                "primary": ["#FF0080", "#00FF88", "#FF00FF"],
                "secondary": ["#FFFF00", "#00FFFF", "#FF4500"],
                "accent": "#FF0080",
                "glass": {
                    "tint": "light",
                    "intensity": 70,
                    "overlay": "rgba(255, 0, 128, 0.15)"
                },
                "particles": "color_powder",
                "animation": "burst_colors",
                "icons": ["🎨", "🌈", "💜", "💚", "💛"]
            },
            
            ThemeType.CHINESE_NEW_YEAR: {
                "name": "Lunar New Year",
                "primary": ["#DC143C", "#FFD700", "#FF0000"],
                "secondary": ["#8B0000", "#FFA500", "#FF6347"],
                "accent": "#DC143C",
                "glass": {
                    "tint": "dark",
                    "intensity": 80,
                    "overlay": "rgba(220, 20, 60, 0.2)"
                },
                "particles": "lanterns",
                "animation": "float_sway",
                "icons": ["🧧", "🏮", "🐉", "🎊", "🥟"]
            },
            
            ThemeType.FOURTH_OF_JULY: {
                "name": "Independence Day",
                "primary": ["#B22234", "#FFFFFF", "#3C3B6E"],
                "secondary": ["#FF0000", "#0000FF", "#FFFFFF"],
                "accent": "#B22234",
                "glass": {
                    "tint": "light",
                    "intensity": 75,
                    "overlay": "rgba(178, 34, 52, 0.15)"
                },
                "particles": "fireworks_usa",
                "animation": "sparkle_burst",
                "icons": ["🇺🇸", "🎆", "🗽", "🦅", "⭐"]
            },
            
            ThemeType.SUMMER: {
                "name": "Summer Vibes",
                "primary": ["#FF6B6B", "#4ECDC4", "#FFE66D"],
                "secondary": ["#F7B731", "#5F27CD", "#00D2D3"],
                "accent": "#FF6B6B",
                "glass": {
                    "tint": "light",
                    "intensity": 60,
                    "overlay": "rgba(255, 230, 109, 0.15)"
                },
                "particles": "sun_rays",
                "animation": "shimmer",
                "icons": ["☀️", "🌊", "🏖️", "🌺", "🍹"]
            },
            
            ThemeType.WINTER: {
                "name": "Winter Wonderland",
                "primary": ["#00D9FF", "#0099CC", "#003366"],
                "secondary": ["#87CEEB", "#4682B4", "#191970"],
                "accent": "#00D9FF",
                "glass": {
                    "tint": "light",
                    "intensity": 85,
                    "overlay": "rgba(0, 217, 255, 0.2)"
                },
                "particles": "snow",
                "animation": "gentle_fall",
                "icons": ["❄️", "⛷️", "🏔️", "☃️", "🧊"]
            },
            
            ThemeType.SPRING: {
                "name": "Spring Bloom",
                "primary": ["#50C878", "#FFB6C1", "#DDA0DD"],
                "secondary": ["#98FB98", "#FF69B4", "#9370DB"],
                "accent": "#50C878",
                "glass": {
                    "tint": "light",
                    "intensity": 65,
                    "overlay": "rgba(80, 200, 120, 0.15)"
                },
                "particles": "petals",
                "animation": "gentle_float",
                "icons": ["🌸", "🌺", "🌷", "🦋", "🌱"]
            },
            
            ThemeType.AUTUMN: {
                "name": "Autumn Harvest",
                "primary": ["#D2691E", "#FF8C00", "#B22222"],
                "secondary": ["#8B4513", "#FF6347", "#CD853F"],
                "accent": "#D2691E",
                "glass": {
                    "tint": "dark",
                    "intensity": 75,
                    "overlay": "rgba(210, 105, 30, 0.2)"
                },
                "particles": "leaves",
                "animation": "falling_leaves",
                "icons": ["🍂", "🍁", "🎃", "🌰", "🍄"]
            }
        }
    
    def _initialize_holiday_calendar(self) -> Dict[str, List[Tuple[int, int]]]:
        """Initialize holiday calendar with date ranges (month, day)"""
        return {
            ThemeType.CHRISTMAS: [(12, 1), (12, 31)],  # December 1-31
            ThemeType.NEW_YEAR: [(12, 26), (1, 7)],   # Dec 26 - Jan 7
            ThemeType.VALENTINE: [(2, 7), (2, 21)],    # Feb 7-21
            ThemeType.HALLOWEEN: [(10, 15), (11, 2)],  # Oct 15 - Nov 2
            ThemeType.THANKSGIVING: [(11, 15), (11, 30)], # Nov 15-30
            ThemeType.FOURTH_OF_JULY: [(6, 28), (7, 10)], # Jun 28 - Jul 10
            ThemeType.ST_PATRICKS: [(3, 10), (3, 24)],    # Mar 10-24
            # Seasonal themes
            ThemeType.SUMMER: [(6, 1), (8, 31)],      # Jun 1 - Aug 31
            ThemeType.AUTUMN: [(9, 1), (11, 30)],     # Sep 1 - Nov 30
            ThemeType.WINTER: [(12, 1), (2, 28)],     # Dec 1 - Feb 28
            ThemeType.SPRING: [(3, 1), (5, 31)],      # Mar 1 - May 31
        }
    
    def get_current_theme(self, override: Optional[ThemeType] = None) -> Dict:
        """Get the current theme based on date or override"""
        if override:
            return self.themes.get(override, self.themes[ThemeType.DEFAULT])
        
        current_date = date.today()
        current_month = current_date.month
        current_day = current_date.day
        
        # Check for holidays (in priority order)
        holiday_priority = [
            ThemeType.CHRISTMAS,
            ThemeType.NEW_YEAR,
            ThemeType.VALENTINE,
            ThemeType.HALLOWEEN,
            ThemeType.FOURTH_OF_JULY,
            ThemeType.THANKSGIVING,
            ThemeType.ST_PATRICKS,
        ]
        
        for holiday in holiday_priority:
            if self._is_holiday_active(holiday, current_month, current_day):
                return self.themes[holiday]
        
        # Check for seasonal themes
        for season in [ThemeType.SUMMER, ThemeType.AUTUMN, ThemeType.WINTER, ThemeType.SPRING]:
            if self._is_holiday_active(season, current_month, current_day):
                return self.themes[season]
        
        return self.themes[ThemeType.DEFAULT]
    
    def _is_holiday_active(self, holiday: ThemeType, month: int, day: int) -> bool:
        """Check if a holiday/season is currently active"""
        if holiday not in self.holiday_calendar:
            return False
        
        date_ranges = self.holiday_calendar[holiday]
        for start, end in date_ranges:
            start_month, start_day = start
            end_month, end_day = end
            
            # Handle date ranges that cross year boundaries
            if start_month > end_month:  # e.g., Dec to Jan
                if month == start_month and day >= start_day:
                    return True
                if month == end_month and day <= end_day:
                    return True
            else:  # Normal date range
                if month == start_month and month == end_month:
                    return start_day <= day <= end_day
                elif month == start_month:
                    return day >= start_day
                elif month == end_month:
                    return day <= end_day
                elif start_month < month < end_month:
                    return True
        
        return False
    
    def get_theme_transitions(self) -> Dict[str, str]:
        """Get smooth transition configurations between themes"""
        return {
            "duration": 1000,  # milliseconds
            "easing": "easeInOut",
            "properties": ["backgroundColor", "color", "borderColor", "shadowColor"],
            "glassTransition": {
                "duration": 1500,
                "delay": 200,
                "easing": "easeOut"
            }
        }
    
    def get_particle_config(self, particle_type: str) -> Dict:
        """Get particle animation configuration"""
        configs = {
            "snowflakes": {
                "count": 30,
                "speed": 1.5,
                "size": [10, 20],
                "opacity": [0.4, 0.8],
                "wind": True,
                "spin": True
            },
            "fireworks": {
                "count": 5,
                "speed": 3,
                "burst": True,
                "colors": ["#FFD700", "#FF6347", "#00FF00"],
                "trail": True
            },
            "hearts": {
                "count": 15,
                "speed": 1,
                "size": [15, 25],
                "sway": True,
                "fadeIn": True
            },
            "leaves": {
                "count": 20,
                "speed": 1.2,
                "rotation": True,
                "colors": ["#D2691E", "#FF8C00", "#B22222"],
                "sway": True
            }
        }
        return configs.get(particle_type, {})
    
    def export_theme_for_frontend(self) -> str:
        """Export current theme configuration for React Native"""
        current_theme = self.get_current_theme()
        transitions = self.get_theme_transitions()
        
        config = {
            "theme": current_theme,
            "transitions": transitions,
            "particleConfig": self.get_particle_config(current_theme.get("particles"))
        }
        
        return json.dumps(config)

# Create singleton instance
theme_engine = DynamicThemeEngine()