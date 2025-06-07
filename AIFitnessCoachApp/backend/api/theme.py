from fastapi import APIRouter, HTTPException
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter(prefix="/api/theme", tags=["theme"])

# Holiday Theme Model
class HolidayTheme(BaseModel):
    id: str
    name: str
    start_date: dict  # {month: int, day: int}
    end_date: dict    # {month: int, day: int}
    colors: dict
    particles: Optional[dict] = None
    animations: Optional[dict] = None

# Define holiday themes (matching frontend)
HOLIDAY_THEMES = [
    {
        "id": "new-year",
        "name": "New Year",
        "start_date": {"month": 12, "day": 25},
        "end_date": {"month": 1, "day": 7},
        "colors": {
            "primary": ["#FFD700", "#FFA500", "#FF6347"],
            "secondary": ["#4169E1", "#1E90FF", "#00BFFF"],
            "accent": "#FFD700",
            "background": ["#000033", "#000066", "#000099"],
            "glass": {
                "light": "rgba(255, 215, 0, 0.1)",
                "medium": "rgba(255, 215, 0, 0.2)",
                "dark": "rgba(255, 215, 0, 0.3)",
            },
        },
        "particles": {
            "type": "fireworks",
            "colors": ["#FFD700", "#FF69B4", "#00CED1", "#FF6347"],
            "count": 50,
        },
        "animations": {
            "sparkle": True,
            "pulse": True,
        },
    },
    {
        "id": "valentines",
        "name": "Valentine's Day",
        "start_date": {"month": 2, "day": 10},
        "end_date": {"month": 2, "day": 15},
        "colors": {
            "primary": ["#FF1493", "#FF69B4", "#FFB6C1"],
            "secondary": ["#FF0000", "#DC143C", "#B22222"],
            "accent": "#FF1493",
            "background": ["#FFE4E1", "#FFF0F5", "#FFF5EE"],
            "glass": {
                "light": "rgba(255, 20, 147, 0.1)",
                "medium": "rgba(255, 20, 147, 0.2)",
                "dark": "rgba(255, 20, 147, 0.3)",
            },
        },
        "particles": {
            "type": "hearts",
            "colors": ["#FF1493", "#FF69B4", "#FFB6C1"],
            "count": 30,
        },
        "animations": {
            "float": True,
            "pulse": True,
        },
    },
    {
        "id": "spring",
        "name": "Spring Festival",
        "start_date": {"month": 3, "day": 15},
        "end_date": {"month": 4, "day": 15},
        "colors": {
            "primary": ["#98FB98", "#90EE90", "#00FA9A"],
            "secondary": ["#FFB6C1", "#FFC0CB", "#FFDAB9"],
            "accent": "#00FA9A",
            "background": ["#F0FFF0", "#F5FFFA", "#F0FFFF"],
            "glass": {
                "light": "rgba(152, 251, 152, 0.1)",
                "medium": "rgba(152, 251, 152, 0.2)",
                "dark": "rgba(152, 251, 152, 0.3)",
            },
        },
        "particles": {
            "type": "leaves",
            "colors": ["#98FB98", "#FFB6C1", "#87CEEB"],
            "count": 25,
        },
        "animations": {
            "float": True,
        },
    },
    {
        "id": "summer",
        "name": "Summer Vibes",
        "start_date": {"month": 6, "day": 15},
        "end_date": {"month": 8, "day": 15},
        "colors": {
            "primary": ["#FFA500", "#FF8C00", "#FF7F50"],
            "secondary": ["#00CED1", "#48D1CC", "#40E0D0"],
            "accent": "#FFA500",
            "background": ["#FFEFD5", "#FFE4B5", "#FFDAB9"],
            "glass": {
                "light": "rgba(255, 165, 0, 0.1)",
                "medium": "rgba(255, 165, 0, 0.2)",
                "dark": "rgba(255, 165, 0, 0.3)",
            },
        },
        "animations": {
            "sparkle": True,
        },
    },
    {
        "id": "halloween",
        "name": "Halloween",
        "start_date": {"month": 10, "day": 20},
        "end_date": {"month": 11, "day": 2},
        "colors": {
            "primary": ["#FF8C00", "#FF7F50", "#FF6347"],
            "secondary": ["#4B0082", "#8B008B", "#9400D3"],
            "accent": "#FF8C00",
            "background": ["#1C1C1C", "#2F2F2F", "#424242"],
            "glass": {
                "light": "rgba(255, 140, 0, 0.1)",
                "medium": "rgba(255, 140, 0, 0.2)",
                "dark": "rgba(255, 140, 0, 0.3)",
            },
        },
        "particles": {
            "type": "stars",
            "colors": ["#FF8C00", "#9400D3", "#FFD700"],
            "count": 40,
        },
        "animations": {
            "pulse": True,
            "sparkle": True,
        },
    },
    {
        "id": "christmas",
        "name": "Christmas",
        "start_date": {"month": 12, "day": 15},
        "end_date": {"month": 12, "day": 26},
        "colors": {
            "primary": ["#DC143C", "#B22222", "#8B0000"],
            "secondary": ["#228B22", "#006400", "#008000"],
            "accent": "#FFD700",
            "background": ["#F8F8FF", "#FFFAFA", "#FFF8DC"],
            "glass": {
                "light": "rgba(220, 20, 60, 0.1)",
                "medium": "rgba(220, 20, 60, 0.2)",
                "dark": "rgba(220, 20, 60, 0.3)",
            },
        },
        "particles": {
            "type": "snow",
            "colors": ["#FFFFFF", "#F8F8FF", "#FFFAFA"],
            "count": 60,
        },
        "animations": {
            "float": True,
            "sparkle": True,
        },
    },
    {
        "id": "diwali",
        "name": "Diwali",
        "start_date": {"month": 11, "day": 1},
        "end_date": {"month": 11, "day": 5},
        "colors": {
            "primary": ["#FFD700", "#FF8C00", "#FF6347"],
            "secondary": ["#9400D3", "#4B0082", "#8B008B"],
            "accent": "#FFD700",
            "background": ["#4B0082", "#8B008B", "#9400D3"],
            "glass": {
                "light": "rgba(255, 215, 0, 0.1)",
                "medium": "rgba(255, 215, 0, 0.2)",
                "dark": "rgba(255, 215, 0, 0.3)",
            },
        },
        "particles": {
            "type": "fireworks",
            "colors": ["#FFD700", "#FF8C00", "#FF1493", "#00FA9A"],
            "count": 60,
        },
        "animations": {
            "sparkle": True,
            "pulse": True,
        },
    },
]

def is_date_in_range(check_date: date, theme: dict) -> bool:
    """Check if a date falls within a theme's date range"""
    month = check_date.month
    day = check_date.day
    start = theme["start_date"]
    end = theme["end_date"]
    
    # Handle year-end wrap (e.g., Christmas to New Year)
    if start["month"] > end["month"]:
        return (month == start["month"] and day >= start["day"]) or \
               (month == end["month"] and day <= end["day"])
    
    # Normal date range
    if month == start["month"] == end["month"]:
        return day >= start["day"] and day <= end["day"]
    
    if month == start["month"]:
        return day >= start["day"]
    
    if month == end["month"]:
        return day <= end["day"]
    
    return start["month"] < month < end["month"]

@router.get("/current", response_model=Optional[HolidayTheme])
async def get_current_theme():
    """Get the currently active holiday theme based on today's date"""
    today = date.today()
    
    for theme in HOLIDAY_THEMES:
        if is_date_in_range(today, theme):
            return HolidayTheme(**theme)
    
    return None

@router.get("/themes", response_model=List[HolidayTheme])
async def get_all_themes():
    """Get all available holiday themes"""
    return [HolidayTheme(**theme) for theme in HOLIDAY_THEMES]

@router.get("/theme/{theme_id}", response_model=HolidayTheme)
async def get_theme_by_id(theme_id: str):
    """Get a specific theme by ID"""
    theme = next((t for t in HOLIDAY_THEMES if t["id"] == theme_id), None)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return HolidayTheme(**theme)

@router.post("/preview/{theme_id}")
async def preview_theme(theme_id: str):
    """Preview a specific theme (for testing)"""
    theme = next((t for t in HOLIDAY_THEMES if t["id"] == theme_id), None)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    
    return {
        "message": f"Preview mode activated for {theme['name']} theme",
        "theme": HolidayTheme(**theme),
        "preview_duration": "5 minutes"
    }

@router.get("/schedule")
async def get_theme_schedule():
    """Get the annual theme schedule"""
    schedule = []
    for theme in HOLIDAY_THEMES:
        schedule.append({
            "id": theme["id"],
            "name": theme["name"],
            "start": f"{theme['start_date']['month']}/{theme['start_date']['day']}",
            "end": f"{theme['end_date']['month']}/{theme['end_date']['day']}",
            "active": is_date_in_range(date.today(), theme)
        })
    
    return {
        "current_date": date.today().isoformat(),
        "schedule": schedule
    }

# Add custom theme support
class CustomTheme(BaseModel):
    name: str
    colors: dict
    duration_days: int = 7
    particles: Optional[dict] = None
    animations: Optional[dict] = None

@router.post("/custom", response_model=dict)
async def create_custom_theme(theme: CustomTheme):
    """Create a temporary custom theme"""
    # In a real app, this would save to database
    custom_theme = {
        "id": f"custom-{datetime.now().timestamp()}",
        "name": theme.name,
        "colors": theme.colors,
        "particles": theme.particles,
        "animations": theme.animations,
        "expires_at": datetime.now().timestamp() + (theme.duration_days * 86400)
    }
    
    return {
        "message": "Custom theme created",
        "theme": custom_theme,
        "expires_in_days": theme.duration_days
    }