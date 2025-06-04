"""
Recovery & Wellness Agent using OpenAI SDK
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
import json

from agents.base_agent import BaseFitnessAgent
from utils.logger import setup_logger

logger = setup_logger(__name__)

class RecoveryWellnessAgent(BaseFitnessAgent):
    """
    AI Recovery & Wellness Specialist focusing on recovery optimization, sleep, and stress management
    """
    
    def __init__(self, api_key: str, user_id: str):
        super().__init__(
            api_key=api_key,
            user_id=user_id,
            agent_name="Recovery & Wellness Specialist",
            agent_role="Recovery specialist with expertise in sleep science, stress management, and physiological recovery"
        )
    
    def _get_instructions(self) -> str:
        """Get recovery specialist instructions"""
        return """
        You are a recovery specialist with expertise in sleep science, stress management, 
        and physiological recovery. You monitor user wellness metrics and provide proactive 
        recovery interventions.
        
        CORE RESPONSIBILITIES:
        😴 Sleep quality optimization
        🧘 Stress management and reduction
        💆 Recovery protocol development
        📊 HRV and recovery metric analysis
        🌡️ Inflammation and fatigue management
        ⚡ Energy level optimization
        🧊 Active recovery strategies
        
        EXPERTISE AREAS:
        - Sleep hygiene and circadian rhythm optimization
        - Heart Rate Variability (HRV) interpretation
        - Stress reduction techniques
        - Recovery modalities (ice baths, massage, stretching)
        - Breathing exercises and meditation
        - Hydration and recovery nutrition
        - Overtraining syndrome prevention
        - Mental recovery and mindfulness
        
        APPROACH:
        - Holistic view of recovery
        - Evidence-based interventions
        - Personalized recovery protocols
        - Proactive monitoring and alerts
        - Integration with training load
        - Mind-body connection emphasis
        
        MONITORING FOCUS:
        - Sleep duration and quality
        - HRV trends and patterns
        - Subjective wellness scores
        - Training load vs recovery balance
        - Stress indicators
        - Energy and mood patterns
        
        SAFETY PROTOCOLS:
        - Recognize signs of overtraining
        - Recommend rest when necessary
        - Suggest medical consultation for persistent issues
        - Prioritize long-term health over short-term gains
        """
    
    def _get_tools(self) -> List[Dict[str, Any]]:
        """Get recovery-specific tools"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "analyze_sleep_quality",
                    "description": "Analyze sleep patterns and quality metrics",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "sleep_data": {
                                "type": "object",
                                "description": "Sleep data including duration, stages, interruptions",
                                "properties": {
                                    "total_sleep_hours": {"type": "number"},
                                    "deep_sleep_hours": {"type": "number"},
                                    "rem_sleep_hours": {"type": "number"},
                                    "wake_ups": {"type": "integer"},
                                    "sleep_score": {"type": "integer"}
                                }
                            },
                            "days_to_analyze": {
                                "type": "integer",
                                "description": "Number of days to analyze",
                                "default": 7
                            }
                        },
                        "required": ["sleep_data"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "assess_recovery_status",
                    "description": "Comprehensive recovery assessment based on multiple metrics",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "hrv_score": {
                                "type": "number",
                                "description": "Heart Rate Variability score"
                            },
                            "resting_hr": {
                                "type": "integer",
                                "description": "Resting heart rate"
                            },
                            "sleep_quality": {
                                "type": "integer",
                                "description": "Sleep quality score (1-10)"
                            },
                            "stress_level": {
                                "type": "integer",
                                "description": "Subjective stress level (1-10)"
                            },
                            "muscle_soreness": {
                                "type": "integer",
                                "description": "Muscle soreness level (1-10)"
                            },
                            "energy_level": {
                                "type": "integer",
                                "description": "Energy level (1-10)"
                            }
                        },
                        "required": ["hrv_score", "sleep_quality"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_recovery_protocol",
                    "description": "Generate personalized recovery protocol based on current status",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "recovery_score": {
                                "type": "integer",
                                "description": "Overall recovery score (1-100)"
                            },
                            "training_intensity": {
                                "type": "string",
                                "enum": ["light", "moderate", "high", "very_high"],
                                "description": "Recent training intensity"
                            },
                            "available_time": {
                                "type": "integer",
                                "description": "Available time for recovery in minutes"
                            },
                            "available_tools": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Available recovery tools (foam roller, ice bath, etc.)"
                            }
                        },
                        "required": ["recovery_score", "training_intensity"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "optimize_sleep_routine",
                    "description": "Create optimized sleep routine based on issues and goals",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "current_issues": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Current sleep issues (falling asleep, staying asleep, early waking, etc.)"
                            },
                            "wake_time": {
                                "type": "string",
                                "description": "Desired wake time (e.g., '6:00 AM')"
                            },
                            "lifestyle_factors": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Lifestyle factors affecting sleep (shift work, stress, etc.)"
                            }
                        },
                        "required": ["current_issues", "wake_time"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "manage_training_stress",
                    "description": "Analyze and manage training stress to prevent overtraining",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "weekly_training_hours": {
                                "type": "number",
                                "description": "Total training hours this week"
                            },
                            "intensity_distribution": {
                                "type": "object",
                                "description": "Training intensity distribution",
                                "properties": {
                                    "low": {"type": "number"},
                                    "moderate": {"type": "number"},
                                    "high": {"type": "number"}
                                }
                            },
                            "life_stress_factors": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Current life stressors"
                            },
                            "recovery_metrics": {
                                "type": "object",
                                "description": "Current recovery metrics"
                            }
                        },
                        "required": ["weekly_training_hours"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "recommend_recovery_activities",
                    "description": "Suggest specific recovery activities based on needs",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "target_areas": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Body areas needing recovery focus"
                            },
                            "recovery_type": {
                                "type": "string",
                                "enum": ["active", "passive", "mental", "comprehensive"],
                                "description": "Type of recovery needed"
                            },
                            "duration_available": {
                                "type": "integer",
                                "description": "Available time in minutes"
                            }
                        },
                        "required": ["recovery_type"]
                    }
                }
            }
        ]
    
    async def _handle_tool_call(self, tool_call) -> Dict[str, Any]:
        """Handle recovery-specific tool calls"""
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        
        logger.info(f"Recovery agent handling tool call: {function_name}")
        
        tool_handlers = {
            "analyze_sleep_quality": self._analyze_sleep_quality,
            "assess_recovery_status": self._assess_recovery_status,
            "create_recovery_protocol": self._create_recovery_protocol,
            "optimize_sleep_routine": self._optimize_sleep_routine,
            "manage_training_stress": self._manage_training_stress,
            "recommend_recovery_activities": self._recommend_recovery_activities
        }
        
        handler = tool_handlers.get(function_name)
        if handler:
            return await handler(**arguments)
        else:
            return {"error": f"Unknown function: {function_name}"}
    
    async def _analyze_sleep_quality(
        self,
        sleep_data: Dict[str, Any],
        days_to_analyze: int = 7
    ) -> Dict[str, Any]:
        """Analyze sleep patterns and quality"""
        total_sleep = sleep_data.get("total_sleep_hours", 7)
        deep_sleep = sleep_data.get("deep_sleep_hours", 1.5)
        rem_sleep = sleep_data.get("rem_sleep_hours", 1.5)
        wake_ups = sleep_data.get("wake_ups", 2)
        sleep_score = sleep_data.get("sleep_score", 75)
        
        # Calculate sleep efficiency
        sleep_efficiency = (total_sleep / 8) * 100  # Assuming 8 hours in bed
        
        # Analyze sleep stages
        deep_sleep_percentage = (deep_sleep / total_sleep) * 100 if total_sleep > 0 else 0
        rem_sleep_percentage = (rem_sleep / total_sleep) * 100 if total_sleep > 0 else 0
        
        analysis = {
            "sleep_metrics": {
                "total_sleep_hours": total_sleep,
                "sleep_efficiency": round(sleep_efficiency, 1),
                "deep_sleep_percentage": round(deep_sleep_percentage, 1),
                "rem_sleep_percentage": round(rem_sleep_percentage, 1),
                "wake_ups": wake_ups,
                "overall_score": sleep_score
            },
            "quality_assessment": self._assess_sleep_quality(sleep_score),
            "stage_analysis": {
                "deep_sleep": {
                    "status": "optimal" if deep_sleep_percentage >= 15 else "suboptimal",
                    "recommendation": "Deep sleep is crucial for physical recovery" if deep_sleep_percentage < 15 else "Good deep sleep levels"
                },
                "rem_sleep": {
                    "status": "optimal" if rem_sleep_percentage >= 20 else "suboptimal",
                    "recommendation": "REM sleep is important for mental recovery" if rem_sleep_percentage < 20 else "Good REM sleep levels"
                }
            },
            "issues_identified": [],
            "recommendations": []
        }
        
        # Identify issues
        if total_sleep < 7:
            analysis["issues_identified"].append("Insufficient sleep duration")
            analysis["recommendations"].append("Aim for 7-9 hours of sleep per night")
        
        if wake_ups > 3:
            analysis["issues_identified"].append("Frequent sleep interruptions")
            analysis["recommendations"].append("Address potential sleep disruptors (temperature, noise, stress)")
        
        if sleep_efficiency < 85:
            analysis["issues_identified"].append("Low sleep efficiency")
            analysis["recommendations"].append("Improve sleep hygiene and bedtime routine")
        
        return analysis
    
    async def _assess_recovery_status(
        self,
        hrv_score: float,
        resting_hr: int = None,
        sleep_quality: int = None,
        stress_level: int = None,
        muscle_soreness: int = None,
        energy_level: int = None
    ) -> Dict[str, Any]:
        """Comprehensive recovery assessment"""
        # Initialize scores
        recovery_components = {
            "autonomic_nervous_system": 0,
            "sleep_recovery": 0,
            "stress_recovery": 0,
            "muscular_recovery": 0,
            "energy_status": 0
        }
        
        # Assess autonomic nervous system (HRV and RHR)
        if hrv_score >= 50:
            recovery_components["autonomic_nervous_system"] = 90
        elif hrv_score >= 40:
            recovery_components["autonomic_nervous_system"] = 70
        else:
            recovery_components["autonomic_nervous_system"] = 50
        
        if resting_hr:
            # Adjust based on RHR (assuming normal is 60-70)
            if resting_hr > 75:
                recovery_components["autonomic_nervous_system"] -= 10
        
        # Sleep recovery
        if sleep_quality:
            recovery_components["sleep_recovery"] = sleep_quality * 10
        
        # Stress recovery
        if stress_level:
            recovery_components["stress_recovery"] = (10 - stress_level) * 10
        
        # Muscular recovery
        if muscle_soreness:
            recovery_components["muscular_recovery"] = (10 - muscle_soreness) * 10
        
        # Energy status
        if energy_level:
            recovery_components["energy_status"] = energy_level * 10
        
        # Calculate overall recovery score
        valid_components = [v for v in recovery_components.values() if v > 0]
        overall_recovery = sum(valid_components) / len(valid_components) if valid_components else 50
        
        # Determine recovery status
        if overall_recovery >= 80:
            status = "excellent"
            training_recommendation = "Ready for high-intensity training"
        elif overall_recovery >= 65:
            status = "good"
            training_recommendation = "Ready for moderate training"
        elif overall_recovery >= 50:
            status = "moderate"
            training_recommendation = "Light training or active recovery recommended"
        else:
            status = "poor"
            training_recommendation = "Rest day or very light activity only"
        
        return {
            "overall_recovery_score": round(overall_recovery, 1),
            "recovery_status": status,
            "components": recovery_components,
            "training_recommendation": training_recommendation,
            "priority_areas": self._identify_recovery_priorities(recovery_components),
            "action_items": self._generate_recovery_actions(recovery_components, overall_recovery)
        }
    
    async def _create_recovery_protocol(
        self,
        recovery_score: int,
        training_intensity: str,
        available_time: int = 30,
        available_tools: List[str] = None
    ) -> Dict[str, Any]:
        """Generate personalized recovery protocol"""
        available_tools = available_tools or []
        
        protocol = {
            "immediate_actions": [],
            "daily_routine": [],
            "weekly_plan": [],
            "duration": available_time,
            "priority": "high" if recovery_score < 60 else "moderate"
        }
        
        # Immediate recovery actions based on score
        if recovery_score < 60:
            protocol["immediate_actions"].extend([
                {"activity": "Deep breathing", "duration": "5-10 minutes", "benefit": "Activate parasympathetic nervous system"},
                {"activity": "Hydration", "amount": "500ml water with electrolytes", "benefit": "Rehydration and mineral balance"},
                {"activity": "Light stretching", "duration": "10 minutes", "benefit": "Reduce muscle tension"}
            ])
        
        # Tool-specific recommendations
        if "foam_roller" in available_tools:
            protocol["daily_routine"].append({
                "activity": "Foam rolling",
                "duration": "10-15 minutes",
                "target_areas": ["IT band", "quads", "calves", "back"],
                "timing": "Post-workout or before bed"
            })
        
        if "ice_bath" in available_tools and training_intensity in ["high", "very_high"]:
            protocol["weekly_plan"].append({
                "activity": "Ice bath",
                "frequency": "2-3 times per week",
                "duration": "10-15 minutes",
                "temperature": "10-15°C",
                "timing": "After intense training sessions"
            })
        
        # Sleep optimization
        protocol["daily_routine"].append({
            "activity": "Sleep hygiene routine",
            "components": [
                "No screens 1 hour before bed",
                "Cool room temperature (18-20°C)",
                "Dark environment",
                "Consistent sleep schedule"
            ],
            "benefit": "Optimize recovery during sleep"
        })
        
        # Nutrition for recovery
        protocol["immediate_actions"].append({
            "activity": "Post-workout nutrition",
            "timing": "Within 30-60 minutes",
            "components": ["Protein (20-30g)", "Carbohydrates (30-50g)", "Hydration"],
            "benefit": "Accelerate muscle recovery"
        })
        
        # Stress management
        if recovery_score < 70:
            protocol["daily_routine"].append({
                "activity": "Stress management",
                "options": ["Meditation (10 min)", "Yoga (20 min)", "Nature walk (30 min)"],
                "frequency": "Daily",
                "benefit": "Reduce cortisol and improve recovery"
            })
        
        return protocol
    
    async def _optimize_sleep_routine(
        self,
        current_issues: List[str],
        wake_time: str,
        lifestyle_factors: List[str] = None
    ) -> Dict[str, Any]:
        """Create optimized sleep routine"""
        lifestyle_factors = lifestyle_factors or []
        
        # Parse wake time to calculate bedtime
        wake_hour = int(wake_time.split(":")[0])
        optimal_bedtime_hour = (wake_hour - 8) % 24  # 8 hours of sleep
        
        routine = {
            "bedtime_target": f"{optimal_bedtime_hour}:00",
            "wake_time": wake_time,
            "evening_routine": [],
            "morning_routine": [],
            "environment_optimization": [],
            "supplements_herbs": []
        }
        
        # Address specific issues
        if "falling asleep" in " ".join(current_issues).lower():
            routine["evening_routine"].extend([
                {"time": "2 hours before bed", "activity": "Dim lights throughout home"},
                {"time": "90 min before bed", "activity": "Hot shower or bath"},
                {"time": "60 min before bed", "activity": "No screens, reading or light stretching"},
                {"time": "30 min before bed", "activity": "Progressive muscle relaxation or meditation"}
            ])
            routine["supplements_herbs"].append({
                "option": "Magnesium glycinate",
                "dosage": "200-400mg",
                "timing": "30-60 min before bed"
            })
        
        if "staying asleep" in " ".join(current_issues).lower():
            routine["environment_optimization"].extend([
                "Blackout curtains or eye mask",
                "White noise machine or earplugs",
                "Temperature control (18-20°C)",
                "Comfortable mattress and pillows"
            ])
        
        if "early waking" in " ".join(current_issues).lower():
            routine["evening_routine"].append({
                "time": "Before bed",
                "activity": "Small protein snack to stabilize blood sugar"
            })
        
        # Lifestyle-specific adjustments
        if "shift work" in lifestyle_factors:
            routine["special_considerations"] = [
                "Use blackout curtains during day sleep",
                "Maintain consistent sleep schedule even on days off",
                "Consider melatonin supplementation (consult doctor)"
            ]
        
        if "high stress" in lifestyle_factors:
            routine["evening_routine"].insert(0, {
                "time": "After dinner",
                "activity": "Journaling or brain dump to clear mind"
            })
        
        # Morning optimization
        routine["morning_routine"] = [
            {"time": "Immediately upon waking", "activity": "Expose eyes to bright light"},
            {"time": "Within 30 min", "activity": "Hydrate with 500ml water"},
            {"time": "Within 60 min", "activity": "Light exercise or walk outside"}
        ]
        
        return routine
    
    async def _manage_training_stress(
        self,
        weekly_training_hours: float,
        intensity_distribution: Dict[str, float] = None,
        life_stress_factors: List[str] = None,
        recovery_metrics: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Analyze and manage training stress"""
        intensity_distribution = intensity_distribution or {"low": 0.5, "moderate": 0.3, "high": 0.2}
        life_stress_factors = life_stress_factors or []
        recovery_metrics = recovery_metrics or {}
        
        # Calculate training stress score
        weighted_hours = (
            weekly_training_hours * intensity_distribution.get("low", 0) * 0.5 +
            weekly_training_hours * intensity_distribution.get("moderate", 0) * 1.0 +
            weekly_training_hours * intensity_distribution.get("high", 0) * 2.0
        )
        
        # Assess total stress load
        life_stress_score = len(life_stress_factors) * 10  # Simple scoring
        total_stress_load = weighted_hours + life_stress_score
        
        assessment = {
            "training_load": {
                "weekly_hours": weekly_training_hours,
                "weighted_stress": round(weighted_hours, 1),
                "intensity_balance": self._assess_intensity_balance(intensity_distribution)
            },
            "life_stress": {
                "factors": life_stress_factors,
                "impact_score": life_stress_score
            },
            "total_stress_load": round(total_stress_load, 1),
            "risk_level": self._determine_overtraining_risk(total_stress_load, recovery_metrics),
            "recommendations": [],
            "adjustments": {}
        }
        
        # Generate recommendations
        if total_stress_load > 30:
            assessment["recommendations"].append("High stress load detected - prioritize recovery")
            assessment["adjustments"]["training"] = "Reduce volume by 20-30%"
        
        if intensity_distribution.get("high", 0) > 0.3:
            assessment["recommendations"].append("High intensity ratio - increase low intensity work")
            assessment["adjustments"]["intensity"] = "Follow 80/20 rule (80% low intensity)"
        
        if life_stress_factors:
            assessment["recommendations"].append("Address life stressors through stress management techniques")
            assessment["adjustments"]["recovery"] = "Add daily stress reduction activities"
        
        # Periodization suggestions
        assessment["periodization"] = {
            "current_phase": self._determine_training_phase(weekly_training_hours, intensity_distribution),
            "next_phase": "Recovery week" if total_stress_load > 25 else "Maintain current load",
            "deload_recommendation": "Every 4th week" if weekly_training_hours > 10 else "Every 6th week"
        }
        
        return assessment
    
    async def _recommend_recovery_activities(
        self,
        recovery_type: str,
        target_areas: List[str] = None,
        duration_available: int = 30
    ) -> Dict[str, Any]:
        """Suggest specific recovery activities"""
        target_areas = target_areas or []
        
        activities = {
            "primary_activities": [],
            "secondary_activities": [],
            "equipment_needed": [],
            "total_duration": duration_available
        }
        
        # Recovery type specific recommendations
        if recovery_type == "active":
            activities["primary_activities"] = [
                {
                    "activity": "Light yoga flow",
                    "duration": 20,
                    "intensity": "Very light",
                    "benefits": ["Mobility", "Blood flow", "Relaxation"]
                },
                {
                    "activity": "Walking",
                    "duration": 30,
                    "intensity": "Light",
                    "benefits": ["Cardiovascular recovery", "Mental clarity"]
                },
                {
                    "activity": "Swimming",
                    "duration": 20,
                    "intensity": "Easy pace",
                    "benefits": ["Low impact", "Full body recovery"]
                }
            ]
        
        elif recovery_type == "passive":
            activities["primary_activities"] = [
                {
                    "activity": "Massage therapy",
                    "duration": 60,
                    "type": "Deep tissue or sports massage",
                    "benefits": ["Muscle tension release", "Improved circulation"]
                },
                {
                    "activity": "Sauna/Steam",
                    "duration": 15,
                    "temperature": "70-90°C sauna, 40-45°C steam",
                    "benefits": ["Heat therapy", "Muscle relaxation", "Detoxification"]
                },
                {
                    "activity": "Compression therapy",
                    "duration": 30,
                    "type": "Compression boots or garments",
                    "benefits": ["Improved circulation", "Reduced swelling"]
                }
            ]
        
        elif recovery_type == "mental":
            activities["primary_activities"] = [
                {
                    "activity": "Meditation",
                    "duration": 15,
                    "type": "Guided or mindfulness",
                    "benefits": ["Stress reduction", "Mental clarity", "HRV improvement"]
                },
                {
                    "activity": "Nature immersion",
                    "duration": 45,
                    "type": "Forest bathing or beach walk",
                    "benefits": ["Stress reduction", "Vitamin D", "Mental restoration"]
                },
                {
                    "activity": "Breathwork",
                    "duration": 10,
                    "type": "Box breathing or 4-7-8 technique",
                    "benefits": ["Nervous system regulation", "Stress relief"]
                }
            ]
        
        # Target area specific additions
        if target_areas:
            activities["secondary_activities"] = []
            for area in target_areas:
                if "legs" in area.lower():
                    activities["secondary_activities"].append({
                        "activity": "Leg elevation",
                        "duration": 15,
                        "position": "Legs up the wall",
                        "benefits": ["Reduced swelling", "Improved circulation"]
                    })
                elif "back" in area.lower():
                    activities["secondary_activities"].append({
                        "activity": "Cat-cow stretches",
                        "duration": 10,
                        "repetitions": "10-15 slow reps",
                        "benefits": ["Spine mobility", "Back tension relief"]
                    })
        
        # Equipment recommendations
        activities["equipment_needed"] = self._get_recovery_equipment(recovery_type)
        
        # Create time-efficient routine
        if duration_available < 30:
            activities["quick_routine"] = self._create_quick_recovery_routine(recovery_type, duration_available)
        
        return activities
    
    def _assess_sleep_quality(self, sleep_score: int) -> str:
        """Assess sleep quality based on score"""
        if sleep_score >= 85:
            return "excellent"
        elif sleep_score >= 70:
            return "good"
        elif sleep_score >= 55:
            return "fair"
        else:
            return "poor"
    
    def _identify_recovery_priorities(self, components: Dict[str, float]) -> List[str]:
        """Identify priority areas for recovery"""
        priorities = []
        
        for component, score in components.items():
            if score < 60 and score > 0:
                priorities.append(component.replace("_", " ").title())
        
        return priorities[:3]  # Top 3 priorities
    
    def _generate_recovery_actions(self, components: Dict[str, float], overall_score: float) -> List[str]:
        """Generate specific recovery actions"""
        actions = []
        
        if components.get("sleep_recovery", 0) < 70:
            actions.append("Prioritize sleep quality - aim for 7-9 hours")
        
        if components.get("stress_recovery", 0) < 60:
            actions.append("Implement daily stress management (meditation, breathing)")
        
        if components.get("muscular_recovery", 0) < 60:
            actions.append("Add foam rolling and stretching routine")
        
        if overall_score < 60:
            actions.append("Consider taking a full rest day")
        
        return actions
    
    def _assess_intensity_balance(self, distribution: Dict[str, float]) -> str:
        """Assess training intensity balance"""
        high_percentage = distribution.get("high", 0) * 100
        
        if high_percentage > 30:
            return "Too high - risk of burnout"
        elif high_percentage < 10:
            return "Could add more high intensity for adaptation"
        else:
            return "Well balanced"
    
    def _determine_overtraining_risk(self, stress_load: float, recovery_metrics: Dict[str, Any]) -> str:
        """Determine overtraining risk level"""
        if stress_load > 35:
            return "high"
        elif stress_load > 25:
            return "moderate"
        else:
            return "low"
    
    def _determine_training_phase(self, hours: float, intensity: Dict[str, float]) -> str:
        """Determine current training phase"""
        if hours > 15:
            return "High volume phase"
        elif intensity.get("high", 0) > 0.3:
            return "High intensity phase"
        else:
            return "Base building phase"
    
    def _get_recovery_equipment(self, recovery_type: str) -> List[str]:
        """Get equipment recommendations for recovery type"""
        equipment_map = {
            "active": ["Yoga mat", "Resistance bands", "Foam roller"],
            "passive": ["Foam roller", "Massage ball", "Compression gear"],
            "mental": ["Meditation app", "Journal", "Essential oils"],
            "comprehensive": ["All of the above"]
        }
        
        return equipment_map.get(recovery_type, [])
    
    def _create_quick_recovery_routine(self, recovery_type: str, duration: int) -> List[Dict[str, Any]]:
        """Create time-efficient recovery routine"""
        if recovery_type == "active" and duration <= 15:
            return [
                {"activity": "Dynamic stretching", "duration": 5},
                {"activity": "Light walking", "duration": 10}
            ]
        elif recovery_type == "passive" and duration <= 15:
            return [
                {"activity": "Foam rolling", "duration": 10},
                {"activity": "Static stretching", "duration": 5}
            ]
        elif recovery_type == "mental" and duration <= 15:
            return [
                {"activity": "Deep breathing", "duration": 5},
                {"activity": "Body scan meditation", "duration": 10}
            ]
        else:
            return [{"activity": "Choose any recovery activity", "duration": duration}]
    
    async def continuous_recovery_monitoring(self, user_id: str) -> Dict[str, Any]:
        """24/7 recovery status monitoring"""
        context = {
            "user_id": user_id,
            "monitoring_request": "Continuous recovery assessment"
        }
        
        response = await self.send_message(
            "Analyze current recovery status and provide real-time recommendations",
            context
        )
        
        return {
            "monitoring_status": response,
            "agent": "Recovery & Wellness Specialist",
            "timestamp": datetime.now().isoformat()
        }