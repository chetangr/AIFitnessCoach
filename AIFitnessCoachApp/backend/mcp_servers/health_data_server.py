"""
MCP Server for Real-Time Health Data Access
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import asyncio
import json
from dataclasses import dataclass

from mcp import MCPServer
from models.user import User
from models.progress import UserProgress
from services.async_database import get_db
from utils.logger import setup_logger

logger = setup_logger(__name__)

@dataclass
class HealthMetrics:
    heart_rate: int
    hrv: float
    sleep_score: float
    stress_level: float
    recovery_score: float
    readiness_score: float

class HealthDataMCPServer(MCPServer):
    """
    MCP Server providing real-time health data access for AI agents
    """
    
    def __init__(self):
        super().__init__(
            name="health_data_server",
            version="1.0.0",
            description="Real-time health data access for fitness coaching"
        )
        self.tools = [
            {
                "name": "get_current_heart_rate",
                "description": "Get real-time heart rate from connected devices",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "analyze_sleep_patterns",
                "description": "Comprehensive sleep analysis from multiple sources",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                        "days": {"type": "integer", "description": "Number of days to analyze", "default": 7}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "check_recovery_metrics",
                "description": "Get comprehensive recovery metrics",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "get_nutrition_history",
                "description": "Get recent nutrition data",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                        "days": {"type": "integer", "description": "Number of days", "default": 7}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "assess_workout_readiness",
                "description": "Holistic readiness assessment for workout",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"}
                    },
                    "required": ["user_id"]
                }
            }
        ]
    
    async def handle_tool_call(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle tool calls from AI agents"""
        
        tool_handlers = {
            "get_current_heart_rate": self.get_current_heart_rate,
            "analyze_sleep_patterns": self.analyze_sleep_patterns,
            "check_recovery_metrics": self.check_recovery_metrics,
            "get_nutrition_history": self.get_nutrition_history,
            "assess_workout_readiness": self.assess_workout_readiness
        }
        
        handler = tool_handlers.get(tool_name)
        if handler:
            return await handler(**arguments)
        else:
            return {"error": f"Unknown tool: {tool_name}"}
    
    async def get_current_heart_rate(self, user_id: str) -> Dict[str, Any]:
        """Get real-time heart rate from connected devices"""
        try:
            # In production, this would connect to actual health devices
            # For now, return simulated data
            current_hr = 72  # Simulated resting heart rate
            
            # Check if user is active (would come from device)
            is_active = False  # Simulated
            
            if is_active:
                current_hr = 135  # Simulated active heart rate
            
            return {
                "status": "success",
                "heart_rate": current_hr,
                "measurement_time": datetime.now().isoformat(),
                "is_active": is_active,
                "zone": self._calculate_hr_zone(current_hr, user_id)
            }
            
        except Exception as e:
            logger.error(f"Error getting heart rate: {e}")
            return {"status": "error", "message": str(e)}
    
    async def analyze_sleep_patterns(self, user_id: str, days: int = 7) -> Dict[str, Any]:
        """Comprehensive sleep analysis from multiple sources"""
        try:
            # In production, aggregate from multiple sleep tracking devices
            # Simulated sleep data
            sleep_data = []
            for i in range(days):
                date = datetime.now() - timedelta(days=i)
                sleep_data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "total_sleep": 7.5 - (i * 0.2),  # Simulated variation
                    "deep_sleep": 1.5 - (i * 0.05),
                    "rem_sleep": 1.8 - (i * 0.05),
                    "light_sleep": 4.2 - (i * 0.1),
                    "sleep_score": 85 - (i * 2),
                    "wake_ups": 2 + (i % 3)
                })
            
            # Calculate analysis
            avg_sleep = sum(d["total_sleep"] for d in sleep_data) / len(sleep_data)
            avg_score = sum(d["sleep_score"] for d in sleep_data) / len(sleep_data)
            
            return {
                "status": "success",
                "sleep_data": sleep_data,
                "analysis": {
                    "average_sleep_duration": avg_sleep,
                    "average_sleep_score": avg_score,
                    "trend": "declining" if sleep_data[0]["sleep_score"] < sleep_data[-1]["sleep_score"] else "improving",
                    "recommendation": self._generate_sleep_recommendation(avg_sleep, avg_score)
                }
            }
            
        except Exception as e:
            logger.error(f"Error analyzing sleep: {e}")
            return {"status": "error", "message": str(e)}
    
    async def check_recovery_metrics(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive recovery metrics"""
        try:
            # Simulated recovery data
            metrics = {
                "hrv": 58.5,  # Heart rate variability
                "resting_hr": 62,
                "sleep_score": 82,
                "stress_level": 3.2,  # 1-10 scale
                "muscle_soreness": 2.5,  # 1-10 scale
                "energy_level": 7.8,  # 1-10 scale
                "hydration_status": "adequate",
                "last_workout_intensity": 7.5,
                "hours_since_last_workout": 18
            }
            
            # Calculate overall recovery score
            recovery_score = self._calculate_recovery_score(metrics)
            
            return {
                "status": "success",
                "metrics": metrics,
                "recovery_score": recovery_score,
                "recovery_status": self._get_recovery_status(recovery_score),
                "recommendations": self._generate_recovery_recommendations(recovery_score, metrics)
            }
            
        except Exception as e:
            logger.error(f"Error checking recovery: {e}")
            return {"status": "error", "message": str(e)}
    
    async def get_nutrition_history(self, user_id: str, days: int = 7) -> Dict[str, Any]:
        """Get recent nutrition data"""
        try:
            # Simulated nutrition data
            nutrition_data = []
            for i in range(days):
                date = datetime.now() - timedelta(days=i)
                nutrition_data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "calories": 2200 + (i * 50),
                    "protein": 150 + (i * 5),
                    "carbs": 250 + (i * 10),
                    "fats": 70 + (i * 2),
                    "fiber": 30 + i,
                    "water": 2.5 + (i * 0.1),
                    "meal_timing": ["7:00", "12:30", "15:30", "19:00"]
                })
            
            # Calculate averages
            avg_calories = sum(d["calories"] for d in nutrition_data) / len(nutrition_data)
            avg_protein = sum(d["protein"] for d in nutrition_data) / len(nutrition_data)
            
            return {
                "status": "success",
                "nutrition_history": nutrition_data,
                "analysis": {
                    "average_calories": avg_calories,
                    "average_protein": avg_protein,
                    "calories_trend": "increasing" if nutrition_data[0]["calories"] > nutrition_data[-1]["calories"] else "decreasing",
                    "protein_adequacy": "adequate" if avg_protein > 140 else "low"
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting nutrition history: {e}")
            return {"status": "error", "message": str(e)}
    
    async def assess_workout_readiness(self, user_id: str) -> Dict[str, Any]:
        """Holistic readiness assessment for workout"""
        try:
            # Gather all relevant metrics
            hr_data = await self.get_current_heart_rate(user_id)
            recovery_data = await self.check_recovery_metrics(user_id)
            sleep_data = await self.analyze_sleep_patterns(user_id, days=1)
            
            # Extract key metrics
            current_hr = hr_data.get("heart_rate", 72)
            recovery_score = recovery_data.get("recovery_score", 70)
            last_night_sleep = sleep_data.get("sleep_data", [{}])[0].get("total_sleep", 7)
            sleep_score = sleep_data.get("sleep_data", [{}])[0].get("sleep_score", 80)
            
            # Calculate readiness score (0-10)
            readiness_components = {
                "recovery": recovery_score / 10,  # Convert to 0-10 scale
                "sleep": sleep_score / 10,
                "heart_rate": 10 - abs(current_hr - 65) / 10,  # Optimal around 65
                "subjective": 7.5  # Would come from user input
            }
            
            readiness_score = sum(readiness_components.values()) / len(readiness_components)
            
            return {
                "status": "success",
                "readiness_score": round(readiness_score, 1),
                "readiness_level": self._get_readiness_level(readiness_score),
                "components": readiness_components,
                "recommendations": self._generate_readiness_recommendations(readiness_score, readiness_components),
                "suggested_workout_intensity": self._suggest_workout_intensity(readiness_score)
            }
            
        except Exception as e:
            logger.error(f"Error assessing readiness: {e}")
            return {"status": "error", "message": str(e)}
    
    def _calculate_hr_zone(self, hr: int, user_id: str) -> str:
        """Calculate heart rate zone based on user's max HR"""
        # Simplified - would use actual user age and fitness level
        max_hr = 180  # Estimated for 40 year old
        
        percentage = (hr / max_hr) * 100
        
        if percentage < 50:
            return "rest"
        elif percentage < 60:
            return "very_light"
        elif percentage < 70:
            return "light"
        elif percentage < 80:
            return "moderate"
        elif percentage < 90:
            return "hard"
        else:
            return "maximum"
    
    def _calculate_recovery_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall recovery score from multiple metrics"""
        # Weighted calculation
        weights = {
            "hrv": 0.3,
            "sleep_score": 0.25,
            "stress_level": 0.2,
            "muscle_soreness": 0.15,
            "energy_level": 0.1
        }
        
        # Normalize metrics to 0-100 scale
        normalized = {
            "hrv": min(100, metrics["hrv"] * 1.5),  # HRV typically 0-100
            "sleep_score": metrics["sleep_score"],
            "stress_level": 100 - (metrics["stress_level"] * 10),  # Invert stress
            "muscle_soreness": 100 - (metrics["muscle_soreness"] * 10),  # Invert soreness
            "energy_level": metrics["energy_level"] * 10
        }
        
        recovery_score = sum(normalized[key] * weights[key] for key in weights)
        return round(recovery_score, 1)
    
    def _get_recovery_status(self, score: float) -> str:
        """Get recovery status from score"""
        if score >= 85:
            return "excellent"
        elif score >= 70:
            return "good"
        elif score >= 55:
            return "moderate"
        elif score >= 40:
            return "poor"
        else:
            return "very_poor"
    
    def _get_readiness_level(self, score: float) -> str:
        """Get readiness level from score"""
        if score >= 8.5:
            return "peak_ready"
        elif score >= 7:
            return "ready"
        elif score >= 5.5:
            return "moderate"
        elif score >= 4:
            return "low"
        else:
            return "rest_recommended"
    
    def _generate_sleep_recommendation(self, avg_sleep: float, avg_score: float) -> str:
        """Generate sleep recommendations based on patterns"""
        if avg_sleep < 7:
            return "Aim for 7-9 hours of sleep. Consider earlier bedtime or sleep hygiene improvements."
        elif avg_score < 70:
            return "Focus on sleep quality. Reduce screen time before bed and maintain consistent schedule."
        else:
            return "Sleep patterns look good. Maintain your current sleep routine."
    
    def _generate_recovery_recommendations(self, score: float, metrics: Dict[str, Any]) -> List[str]:
        """Generate recovery recommendations based on metrics"""
        recommendations = []
        
        if score < 60:
            recommendations.append("Consider active recovery or rest day")
        
        if metrics.get("hrv", 0) < 50:
            recommendations.append("Focus on stress reduction and breathing exercises")
        
        if metrics.get("muscle_soreness", 0) > 5:
            recommendations.append("Include foam rolling and stretching")
        
        if metrics.get("hydration_status") != "adequate":
            recommendations.append("Increase water intake to support recovery")
        
        return recommendations
    
    def _generate_readiness_recommendations(self, score: float, components: Dict[str, float]) -> List[str]:
        """Generate readiness recommendations"""
        recommendations = []
        
        if score < 6:
            recommendations.append("Consider lighter workout or active recovery")
        
        if components.get("sleep", 0) < 7:
            recommendations.append("Prioritize sleep tonight for better recovery")
        
        if components.get("recovery", 0) < 6:
            recommendations.append("Allow more time between intense workouts")
        
        return recommendations
    
    def _suggest_workout_intensity(self, readiness_score: float) -> str:
        """Suggest workout intensity based on readiness"""
        if readiness_score >= 8:
            return "high_intensity"
        elif readiness_score >= 6.5:
            return "moderate_intensity"
        elif readiness_score >= 5:
            return "low_intensity"
        else:
            return "recovery_only"