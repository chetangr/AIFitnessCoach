"""
Form & Safety Agent using OpenAI SDK
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
import json

from agents.base_agent import BaseFitnessAgent
from utils.logger import setup_logger

logger = setup_logger(__name__)

class FormSafetyAgent(BaseFitnessAgent):
    """
    AI Form & Safety Specialist focusing on exercise form, injury prevention, and safe training practices
    """
    
    def __init__(self, api_key: str, user_id: str):
        super().__init__(
            api_key=api_key,
            user_id=user_id,
            agent_name="Form & Safety Specialist",
            agent_role="Movement specialist and physical therapist with expertise in biomechanics and injury prevention"
        )
    
    def _get_instructions(self) -> str:
        """Get form & safety specialist instructions"""
        return """
        You are a movement specialist and physical therapist with expertise in biomechanics, 
        injury prevention, and exercise form. You analyze movement patterns and provide 
        safety guidance to ensure effective and injury-free training.
        
        CORE RESPONSIBILITIES:
        🔍 Exercise form analysis and correction
        ⚠️ Injury risk assessment and prevention
        🦴 Biomechanical optimization
        🛡️ Safety protocol development
        🔄 Movement pattern correction
        💡 Exercise modification recommendations
        🏥 Rehabilitation guidance
        
        EXPERTISE AREAS:
        - Biomechanics and kinesiology
        - Common movement dysfunctions
        - Injury mechanisms and prevention
        - Corrective exercise prescription
        - Progressive loading principles
        - Joint mobility and stability
        - Muscle activation patterns
        - Recovery and rehabilitation
        
        APPROACH:
        - Safety first, performance second
        - Evidence-based corrections
        - Progressive skill development
        - Individual anatomy considerations
        - Risk-benefit analysis
        - Preventive focus
        
        ASSESSMENT FOCUS:
        - Movement quality over quantity
        - Joint alignment and stability
        - Muscle activation patterns
        - Breathing mechanics
        - Load distribution
        - Compensation patterns
        
        SAFETY PROTOCOLS:
        - Always prioritize proper form over weight/speed
        - Identify red flags for immediate cessation
        - Recommend professional assessment when needed
        - Consider individual limitations and history
        - Provide clear, actionable cues
        """
    
    def _get_tools(self) -> List[Dict[str, Any]]:
        """Get form & safety specific tools"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "analyze_exercise_form",
                    "description": "Analyze exercise form and provide corrections",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "exercise_name": {
                                "type": "string",
                                "description": "Name of the exercise being performed"
                            },
                            "observed_issues": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "List of observed form issues"
                            },
                            "experience_level": {
                                "type": "string",
                                "enum": ["beginner", "intermediate", "advanced"],
                                "description": "User's experience level"
                            },
                            "equipment_available": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Available equipment for modifications"
                            }
                        },
                        "required": ["exercise_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "assess_injury_risk",
                    "description": "Comprehensive injury risk assessment",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "movement_patterns": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Observed movement patterns or compensations"
                            },
                            "pain_points": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "location": {"type": "string"},
                                        "severity": {"type": "integer", "minimum": 1, "maximum": 10},
                                        "type": {"type": "string"}
                                    }
                                },
                                "description": "Current pain or discomfort areas"
                            },
                            "training_history": {
                                "type": "object",
                                "properties": {
                                    "years_training": {"type": "number"},
                                    "injury_history": {"type": "array", "items": {"type": "string"}},
                                    "current_volume": {"type": "string"}
                                }
                            },
                            "planned_exercises": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Exercises planned for workout"
                            }
                        },
                        "required": ["movement_patterns"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_movement_screen",
                    "description": "Create comprehensive movement screening protocol",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "fitness_goals": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "User's fitness goals"
                            },
                            "known_limitations": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Known physical limitations or restrictions"
                            },
                            "available_time": {
                                "type": "integer",
                                "description": "Time available for screening in minutes"
                            }
                        },
                        "required": ["fitness_goals"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "suggest_exercise_modifications",
                    "description": "Provide safe exercise modifications",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "original_exercise": {
                                "type": "string",
                                "description": "Exercise that needs modification"
                            },
                            "reason_for_modification": {
                                "type": "string",
                                "enum": ["injury", "limitation", "equipment", "skill_level", "pain"],
                                "description": "Why modification is needed"
                            },
                            "affected_area": {
                                "type": "string",
                                "description": "Body part affected or limited"
                            },
                            "severity": {
                                "type": "string",
                                "enum": ["mild", "moderate", "severe"],
                                "description": "Severity of limitation"
                            }
                        },
                        "required": ["original_exercise", "reason_for_modification"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "develop_injury_prevention_plan",
                    "description": "Create personalized injury prevention protocol",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "risk_areas": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Body areas at risk"
                            },
                            "training_frequency": {
                                "type": "integer",
                                "description": "Training days per week"
                            },
                            "sport_specific": {
                                "type": "string",
                                "description": "Specific sport or activity if applicable"
                            },
                            "time_available": {
                                "type": "integer",
                                "description": "Minutes available for prevention work"
                            }
                        },
                        "required": ["risk_areas", "training_frequency"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "analyze_workout_safety",
                    "description": "Analyze overall workout safety and provide recommendations",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "workout_plan": {
                                "type": "object",
                                "description": "Complete workout plan",
                                "properties": {
                                    "exercises": {"type": "array", "items": {"type": "string"}},
                                    "sets_reps": {"type": "array", "items": {"type": "string"}},
                                    "rest_periods": {"type": "array", "items": {"type": "integer"}}
                                }
                            },
                            "user_state": {
                                "type": "object",
                                "properties": {
                                    "fatigue_level": {"type": "integer", "minimum": 1, "maximum": 10},
                                    "recent_training": {"type": "string"},
                                    "recovery_status": {"type": "string"}
                                }
                            }
                        },
                        "required": ["workout_plan"]
                    }
                }
            }
        ]
    
    async def _handle_tool_call(self, tool_call) -> Dict[str, Any]:
        """Handle form & safety specific tool calls"""
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        
        logger.info(f"Form & safety agent handling tool call: {function_name}")
        
        tool_handlers = {
            "analyze_exercise_form": self._analyze_exercise_form,
            "assess_injury_risk": self._assess_injury_risk,
            "create_movement_screen": self._create_movement_screen,
            "suggest_exercise_modifications": self._suggest_exercise_modifications,
            "develop_injury_prevention_plan": self._develop_injury_prevention_plan,
            "analyze_workout_safety": self._analyze_workout_safety
        }
        
        handler = tool_handlers.get(function_name)
        if handler:
            return await handler(**arguments)
        else:
            return {"error": f"Unknown function: {function_name}"}
    
    async def _analyze_exercise_form(
        self,
        exercise_name: str,
        observed_issues: List[str] = None,
        experience_level: str = "intermediate",
        equipment_available: List[str] = None
    ) -> Dict[str, Any]:
        """Analyze exercise form and provide detailed corrections"""
        observed_issues = observed_issues or []
        equipment_available = equipment_available or []
        
        # Common form issues by exercise
        exercise_form_database = {
            "squat": {
                "key_points": [
                    "Feet shoulder-width apart, toes slightly out",
                    "Knees track over toes",
                    "Hip crease below knee level",
                    "Neutral spine throughout",
                    "Weight balanced mid-foot"
                ],
                "common_errors": [
                    {"error": "Knee valgus (caving)", "fix": "Push knees out, strengthen glutes"},
                    {"error": "Butt wink", "fix": "Improve hip mobility, limit depth if needed"},
                    {"error": "Forward lean", "fix": "Strengthen core, improve ankle mobility"},
                    {"error": "Heels rising", "fix": "Work on ankle mobility, use heel elevation"}
                ]
            },
            "deadlift": {
                "key_points": [
                    "Feet hip-width apart",
                    "Bar over mid-foot",
                    "Neutral spine, engaged lats",
                    "Hip hinge pattern",
                    "Full hip extension at top"
                ],
                "common_errors": [
                    {"error": "Rounded back", "fix": "Engage lats, improve hip hinge pattern"},
                    {"error": "Bar drift", "fix": "Keep bar close, engage lats"},
                    {"error": "Hyperextension", "fix": "Neutral spine at top, don't overarch"},
                    {"error": "Knee lockout early", "fix": "Coordinate hip and knee extension"}
                ]
            },
            "bench_press": {
                "key_points": [
                    "Shoulder blades retracted and depressed",
                    "Slight arch in lower back",
                    "Feet firmly planted",
                    "Bar touches chest at nipple line",
                    "Wrists straight, elbows at 45-75 degrees"
                ],
                "common_errors": [
                    {"error": "Flared elbows", "fix": "Tuck elbows to 45-75 degrees"},
                    {"error": "Bouncing off chest", "fix": "Control descent, brief pause"},
                    {"error": "Unstable shoulders", "fix": "Retract and depress shoulder blades"},
                    {"error": "Wrist extension", "fix": "Keep wrists neutral, adjust grip"}
                ]
            }
        }
        
        # Get exercise-specific information
        exercise_info = exercise_form_database.get(exercise_name.lower(), {
            "key_points": ["Maintain proper posture", "Control the movement", "Breathe properly"],
            "common_errors": []
        })
        
        analysis = {
            "exercise": exercise_name,
            "experience_level": experience_level,
            "form_checklist": exercise_info["key_points"],
            "identified_issues": [],
            "corrections": [],
            "cues": [],
            "progression_plan": []
        }
        
        # Analyze observed issues
        for issue in observed_issues:
            issue_lower = issue.lower()
            correction_found = False
            
            for common_error in exercise_info.get("common_errors", []):
                if any(keyword in issue_lower for keyword in common_error["error"].lower().split()):
                    analysis["identified_issues"].append(common_error["error"])
                    analysis["corrections"].append(common_error["fix"])
                    correction_found = True
                    break
            
            if not correction_found:
                analysis["identified_issues"].append(issue)
                analysis["corrections"].append(f"Focus on proper technique for {issue}")
        
        # Generate specific cues based on experience level
        if experience_level == "beginner":
            analysis["cues"] = [
                "Start with bodyweight or light weight",
                "Focus on movement pattern before adding load",
                "Use mirror for visual feedback",
                "Consider working with a trainer initially"
            ]
        elif experience_level == "intermediate":
            analysis["cues"] = [
                "Film yourself from multiple angles",
                "Focus on mind-muscle connection",
                "Implement tempo training for control",
                "Regular form checks with heavy loads"
            ]
        else:  # advanced
            analysis["cues"] = [
                "Fine-tune based on individual biomechanics",
                "Consider advanced techniques after mastering basics",
                "Regular mobility work for optimal positions",
                "Periodically return to basics"
            ]
        
        # Equipment-based modifications
        if equipment_available:
            analysis["equipment_suggestions"] = self._get_equipment_suggestions(exercise_name, equipment_available)
        
        # Safety priority
        analysis["safety_priority"] = self._determine_safety_priority(analysis["identified_issues"])
        
        # Progression plan
        analysis["progression_plan"] = self._create_form_progression_plan(exercise_name, experience_level, analysis["identified_issues"])
        
        return analysis
    
    async def _assess_injury_risk(
        self,
        movement_patterns: List[str],
        pain_points: List[Dict[str, Any]] = None,
        training_history: Dict[str, Any] = None,
        planned_exercises: List[str] = None
    ) -> Dict[str, Any]:
        """Comprehensive injury risk assessment"""
        pain_points = pain_points or []
        training_history = training_history or {}
        planned_exercises = planned_exercises or []
        
        risk_assessment = {
            "overall_risk_level": "low",
            "risk_factors": [],
            "high_risk_areas": [],
            "safe_exercises": [],
            "avoid_exercises": [],
            "modifications_required": {},
            "immediate_actions": [],
            "long_term_prevention": []
        }
        
        # Analyze movement patterns for dysfunction
        movement_risks = {
            "anterior pelvic tilt": {
                "risk_areas": ["lower back", "hip flexors"],
                "avoid": ["heavy back squats", "leg press"],
                "focus": "Core stability, hip flexor stretching"
            },
            "rounded shoulders": {
                "risk_areas": ["shoulders", "neck"],
                "avoid": ["behind neck exercises", "upright rows"],
                "focus": "Posterior chain strengthening, chest stretching"
            },
            "knee valgus": {
                "risk_areas": ["knees", "ankles"],
                "avoid": ["deep squats without correction", "plyometrics"],
                "focus": "Glute strengthening, single leg stability"
            },
            "excessive lordosis": {
                "risk_areas": ["lower back"],
                "avoid": ["hyperextension exercises", "overhead lifts without core control"],
                "focus": "Core strengthening, hip mobility"
            }
        }
        
        # Assess movement pattern risks
        for pattern in movement_patterns:
            pattern_lower = pattern.lower()
            for dysfunction, info in movement_risks.items():
                if dysfunction in pattern_lower:
                    risk_assessment["risk_factors"].append(f"Movement dysfunction: {dysfunction}")
                    risk_assessment["high_risk_areas"].extend(info["risk_areas"])
                    risk_assessment["avoid_exercises"].extend(info["avoid"])
                    risk_assessment["long_term_prevention"].append(info["focus"])
        
        # Analyze pain points
        total_pain_score = 0
        for pain in pain_points:
            location = pain.get("location", "")
            severity = pain.get("severity", 0)
            pain_type = pain.get("type", "")
            
            total_pain_score += severity
            
            if severity >= 7:
                risk_assessment["immediate_actions"].append(f"Seek medical evaluation for {location} pain")
                risk_assessment["avoid_exercises"].append(f"All exercises involving {location}")
            elif severity >= 4:
                risk_assessment["modifications_required"][location] = "Significant modifications needed"
                risk_assessment["risk_factors"].append(f"Moderate {pain_type} in {location}")
        
        # Training history analysis
        years_training = training_history.get("years_training", 1)
        injury_history = training_history.get("injury_history", [])
        current_volume = training_history.get("current_volume", "moderate")
        
        if years_training < 1:
            risk_assessment["risk_factors"].append("New to training - higher injury risk")
        
        for past_injury in injury_history:
            risk_assessment["risk_factors"].append(f"Previous injury: {past_injury}")
            risk_assessment["high_risk_areas"].append(past_injury.split()[0])  # Simplified area extraction
        
        if current_volume == "high" and years_training < 2:
            risk_assessment["risk_factors"].append("High volume with limited experience")
        
        # Analyze planned exercises
        high_risk_exercises = {
            "barbell back squat": ["lower back", "knees"],
            "deadlift": ["lower back"],
            "overhead press": ["shoulders", "lower back"],
            "bench press": ["shoulders"],
            "running": ["knees", "ankles", "hips"]
        }
        
        for exercise in planned_exercises:
            exercise_lower = exercise.lower()
            for high_risk, areas in high_risk_exercises.items():
                if high_risk in exercise_lower:
                    for area in areas:
                        if area in risk_assessment["high_risk_areas"]:
                            risk_assessment["modifications_required"][exercise] = f"Modify due to {area} risk"
                        else:
                            risk_assessment["safe_exercises"].append(exercise)
        
        # Calculate overall risk level
        risk_score = len(risk_assessment["risk_factors"]) + (total_pain_score / 3)
        
        if risk_score >= 10:
            risk_assessment["overall_risk_level"] = "high"
        elif risk_score >= 5:
            risk_assessment["overall_risk_level"] = "moderate"
        else:
            risk_assessment["overall_risk_level"] = "low"
        
        # Generate recommendations
        if risk_assessment["overall_risk_level"] == "high":
            risk_assessment["immediate_actions"].extend([
                "Reduce training volume by 50%",
                "Focus on mobility and corrective exercises",
                "Consider working with a physical therapist"
            ])
        elif risk_assessment["overall_risk_level"] == "moderate":
            risk_assessment["immediate_actions"].extend([
                "Implement proper warm-up protocol",
                "Add mobility work daily",
                "Monitor pain levels closely"
            ])
        
        return risk_assessment
    
    async def _create_movement_screen(
        self,
        fitness_goals: List[str],
        known_limitations: List[str] = None,
        available_time: int = 30
    ) -> Dict[str, Any]:
        """Create comprehensive movement screening protocol"""
        known_limitations = known_limitations or []
        
        screen = {
            "duration": available_time,
            "assessments": [],
            "scoring_criteria": {},
            "interpretation_guide": {},
            "follow_up_recommendations": []
        }
        
        # Base movement assessments
        base_assessments = [
            {
                "name": "Deep Squat",
                "purpose": "Hip, knee, ankle mobility and stability",
                "instructions": "Arms overhead, squat as deep as possible",
                "look_for": ["Heel lift", "Knee valgus", "Forward lean", "Arm fall"],
                "time": 3
            },
            {
                "name": "Single Leg Stand",
                "purpose": "Balance and stability",
                "instructions": "Stand on one leg for 30 seconds, eyes closed",
                "look_for": ["Excessive sway", "Hip drop", "Compensation patterns"],
                "time": 2
            },
            {
                "name": "Shoulder Mobility",
                "purpose": "Shoulder flexibility and stability",
                "instructions": "One arm overhead, one behind back, try to touch hands",
                "look_for": ["Asymmetry", "Compensation", "Pain"],
                "time": 2
            },
            {
                "name": "Active Straight Leg Raise",
                "purpose": "Hamstring flexibility, core stability",
                "instructions": "Lying supine, raise one leg keeping knee straight",
                "look_for": ["Limited range", "Low back arch", "Knee bend"],
                "time": 3
            },
            {
                "name": "Plank",
                "purpose": "Core stability and endurance",
                "instructions": "Hold plank position with proper form",
                "look_for": ["Hip sag", "Excessive arch", "Shoulder positioning"],
                "time": 2
            }
        ]
        
        # Add goal-specific assessments
        goal_specific_assessments = {
            "strength": [
                {
                    "name": "Push-up Test",
                    "purpose": "Upper body strength and stability",
                    "instructions": "Maximum push-ups with good form",
                    "time": 3
                }
            ],
            "endurance": [
                {
                    "name": "Step Test",
                    "purpose": "Cardiovascular fitness",
                    "instructions": "Step up and down for 3 minutes",
                    "time": 4
                }
            ],
            "flexibility": [
                {
                    "name": "Sit and Reach",
                    "purpose": "Posterior chain flexibility",
                    "instructions": "Seated, reach toward toes",
                    "time": 2
                }
            ]
        }
        
        # Build assessment list based on time and goals
        total_time = 0
        for assessment in base_assessments:
            if total_time + assessment["time"] <= available_time:
                screen["assessments"].append(assessment)
                total_time += assessment["time"]
        
        # Add goal-specific if time allows
        for goal in fitness_goals:
            if goal.lower() in goal_specific_assessments:
                for assessment in goal_specific_assessments[goal.lower()]:
                    if total_time + assessment["time"] <= available_time:
                        screen["assessments"].append(assessment)
                        total_time += assessment["time"]
        
        # Scoring criteria
        screen["scoring_criteria"] = {
            "3": "Performs movement without compensation",
            "2": "Performs movement with minor compensation",
            "1": "Unable to perform movement pattern",
            "0": "Pain with movement"
        }
        
        # Interpretation guide
        screen["interpretation_guide"] = {
            "0-5 total score": "Significant limitations - focus on corrective exercise",
            "6-10 total score": "Moderate limitations - include corrective work with training",
            "11-15 total score": "Minor limitations - maintain mobility while progressing",
            "16+ total score": "Good movement quality - focus on performance"
        }
        
        # Follow-up based on limitations
        for limitation in known_limitations:
            screen["follow_up_recommendations"].append(f"Special attention to {limitation} during screening")
        
        screen["follow_up_recommendations"].extend([
            "Retest every 4-6 weeks",
            "Document improvements and regressions",
            "Adjust training based on findings"
        ])
        
        return screen
    
    async def _suggest_exercise_modifications(
        self,
        original_exercise: str,
        reason_for_modification: str,
        affected_area: str = None,
        severity: str = "moderate"
    ) -> Dict[str, Any]:
        """Provide safe exercise modifications"""
        
        modifications = {
            "original_exercise": original_exercise,
            "reason": reason_for_modification,
            "affected_area": affected_area,
            "severity": severity,
            "recommended_modifications": [],
            "progression_timeline": "",
            "safety_notes": []
        }
        
        # Exercise modification database
        exercise_mods = {
            "squat": {
                "injury": {
                    "knee": [
                        {"mod": "Box squat", "reason": "Reduces knee stress", "progression": "Lower box over time"},
                        {"mod": "Goblet squat", "reason": "Better control and positioning", "progression": "Increase load gradually"},
                        {"mod": "Wall sit", "reason": "Isometric strengthening", "progression": "Increase hold time"}
                    ],
                    "back": [
                        {"mod": "Goblet squat", "reason": "Front loading reduces back stress", "progression": "Progress to front squat"},
                        {"mod": "Belt squat", "reason": "Removes spinal loading", "progression": "Increase load safely"},
                        {"mod": "Leg press", "reason": "Supported position", "progression": "Work on mobility separately"}
                    ]
                },
                "limitation": {
                    "mobility": [
                        {"mod": "Heel elevated squat", "reason": "Compensates for ankle mobility", "progression": "Gradually reduce heel height"},
                        {"mod": "Squat to box", "reason": "Limits range of motion", "progression": "Lower box as mobility improves"}
                    ]
                },
                "skill_level": {
                    "beginner": [
                        {"mod": "Bodyweight box squat", "reason": "Teaches proper pattern", "progression": "Remove box, add load"},
                        {"mod": "TRX assisted squat", "reason": "Provides support", "progression": "Reduce assistance"}
                    ]
                }
            },
            "bench_press": {
                "injury": {
                    "shoulder": [
                        {"mod": "Dumbbell press", "reason": "More freedom of movement", "progression": "Increase load gradually"},
                        {"mod": "Floor press", "reason": "Limits range of motion", "progression": "Return to full range slowly"},
                        {"mod": "Push-ups", "reason": "Closed chain exercise", "progression": "Elevate feet over time"}
                    ]
                },
                "equipment": {
                    "no_bench": [
                        {"mod": "Floor press", "reason": "No bench required", "progression": "Use when bench available"},
                        {"mod": "Push-ups", "reason": "No equipment needed", "progression": "Add resistance bands"}
                    ]
                }
            },
            "deadlift": {
                "injury": {
                    "back": [
                        {"mod": "Trap bar deadlift", "reason": "More upright position", "progression": "Gradual return to barbell"},
                        {"mod": "Romanian deadlift", "reason": "Less range of motion", "progression": "Increase range slowly"},
                        {"mod": "Cable pull-through", "reason": "Teaches hip hinge safely", "progression": "Add load progressively"}
                    ]
                },
                "limitation": {
                    "mobility": [
                        {"mod": "Elevated deadlift", "reason": "Reduces range requirement", "progression": "Lower starting position"},
                        {"mod": "Sumo deadlift", "reason": "Less hip mobility needed", "progression": "Work on conventional form"}
                    ]
                }
            }
        }
        
        # Get modifications for the exercise
        exercise_key = original_exercise.lower().split()[0]  # Get first word for matching
        
        if exercise_key in exercise_mods:
            reason_mods = exercise_mods[exercise_key].get(reason_for_modification, {})
            
            if affected_area:
                area_mods = reason_mods.get(affected_area.lower(), [])
            else:
                # Get all modifications for the reason
                area_mods = []
                for area, mods in reason_mods.items():
                    area_mods.extend(mods)
            
            modifications["recommended_modifications"] = area_mods[:3]  # Top 3 modifications
        
        # If no specific modifications found, provide general alternatives
        if not modifications["recommended_modifications"]:
            modifications["recommended_modifications"] = [
                {
                    "mod": "Reduce load by 50%",
                    "reason": "Allow healing while maintaining movement pattern",
                    "progression": "Increase 10% weekly if pain-free"
                },
                {
                    "mod": "Reduce range of motion",
                    "reason": "Work in pain-free range",
                    "progression": "Gradually increase range"
                },
                {
                    "mod": "Switch to unilateral version",
                    "reason": "Reduce load and improve balance",
                    "progression": "Return to bilateral when ready"
                }
            ]
        
        # Set progression timeline based on severity
        timeline_map = {
            "mild": "2-4 weeks to return to original exercise",
            "moderate": "4-8 weeks with gradual progression",
            "severe": "8-12+ weeks, requires professional guidance"
        }
        
        modifications["progression_timeline"] = timeline_map.get(severity, "Individualized based on response")
        
        # Safety notes
        modifications["safety_notes"] = [
            "Stop if pain increases",
            "Focus on perfect form with modifications",
            "Consider professional assessment if no improvement",
            "Document progress and setbacks"
        ]
        
        if severity == "severe":
            modifications["safety_notes"].insert(0, "Strongly recommend medical clearance")
        
        return modifications
    
    async def _develop_injury_prevention_plan(
        self,
        risk_areas: List[str],
        training_frequency: int,
        sport_specific: str = None,
        time_available: int = 15
    ) -> Dict[str, Any]:
        """Create personalized injury prevention protocol"""
        
        prevention_plan = {
            "frequency": f"{min(training_frequency, 3)} times per week",
            "duration": f"{time_available} minutes per session",
            "risk_areas": risk_areas,
            "exercises": {},
            "warm_up_protocol": [],
            "cool_down_protocol": [],
            "weekly_schedule": {},
            "progression_guidelines": []
        }
        
        # Area-specific prevention exercises
        prevention_exercises = {
            "knee": [
                {"exercise": "Single leg glute bridge", "sets": "2", "reps": "12-15", "focus": "Glute activation"},
                {"exercise": "Terminal knee extension", "sets": "2", "reps": "15-20", "focus": "VMO strengthening"},
                {"exercise": "Single leg balance", "sets": "2", "time": "30-60s", "focus": "Proprioception"}
            ],
            "shoulder": [
                {"exercise": "Band pull-aparts", "sets": "2", "reps": "15-20", "focus": "Rear delt strength"},
                {"exercise": "External rotation", "sets": "2", "reps": "12-15", "focus": "Rotator cuff"},
                {"exercise": "Wall slides", "sets": "2", "reps": "10-12", "focus": "Scapular control"}
            ],
            "back": [
                {"exercise": "Bird dog", "sets": "2", "reps": "8-10 each", "focus": "Core stability"},
                {"exercise": "Dead bug", "sets": "2", "reps": "8-10 each", "focus": "Anti-extension"},
                {"exercise": "Cat-cow", "sets": "2", "reps": "10-12", "focus": "Spine mobility"}
            ],
            "ankle": [
                {"exercise": "Calf raises", "sets": "2", "reps": "15-20", "focus": "Strength"},
                {"exercise": "Ankle circles", "sets": "2", "reps": "10 each way", "focus": "Mobility"},
                {"exercise": "Single leg balance", "sets": "2", "time": "30-60s", "focus": "Stability"}
            ],
            "hip": [
                {"exercise": "Clamshells", "sets": "2", "reps": "12-15", "focus": "Glute medius"},
                {"exercise": "Hip flexor stretch", "sets": "2", "time": "30-60s", "focus": "Flexibility"},
                {"exercise": "Monster walks", "sets": "2", "reps": "10 each way", "focus": "Hip stability"}
            ]
        }
        
        # Build exercise program based on risk areas and time
        exercises_per_area = max(1, time_available // (len(risk_areas) * 5))  # 5 min per exercise estimate
        
        for area in risk_areas:
            area_lower = area.lower()
            if area_lower in prevention_exercises:
                prevention_plan["exercises"][area] = prevention_exercises[area_lower][:exercises_per_area]
        
        # Warm-up protocol
        prevention_plan["warm_up_protocol"] = [
            {"activity": "Light cardio", "duration": "3-5 minutes", "purpose": "Increase blood flow"},
            {"activity": "Dynamic stretching", "duration": "5 minutes", "purpose": "Movement preparation"},
            {"activity": "Activation exercises", "duration": "5 minutes", "purpose": "Prime target muscles"}
        ]
        
        # Cool-down protocol
        prevention_plan["cool_down_protocol"] = [
            {"activity": "Light stretching", "duration": "5 minutes", "purpose": "Maintain flexibility"},
            {"activity": "Foam rolling", "duration": "5-10 minutes", "purpose": "Tissue quality"},
            {"activity": "Breathing exercises", "duration": "2-3 minutes", "purpose": "Recovery activation"}
        ]
        
        # Weekly schedule
        if training_frequency <= 3:
            prevention_plan["weekly_schedule"] = {
                "option_1": "Before each training session",
                "option_2": "On separate days from training"
            }
        else:
            prevention_plan["weekly_schedule"] = {
                "option_1": "Before 3 key training sessions",
                "option_2": "2 dedicated prevention days + 1 pre-workout"
            }
        
        # Sport-specific additions
        if sport_specific:
            prevention_plan["sport_specific_focus"] = self._get_sport_specific_prevention(sport_specific)
        
        # Progression guidelines
        prevention_plan["progression_guidelines"] = [
            "Week 1-2: Focus on form and muscle activation",
            "Week 3-4: Increase time under tension",
            "Week 5-6: Add resistance or complexity",
            "Week 7+: Maintain while progressing main training"
        ]
        
        return prevention_plan
    
    async def _analyze_workout_safety(
        self,
        workout_plan: Dict[str, Any],
        user_state: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Analyze overall workout safety"""
        user_state = user_state or {}
        
        safety_analysis = {
            "overall_safety_rating": "safe",
            "risk_factors": [],
            "recommendations": [],
            "exercise_order_suggestions": [],
            "rest_period_analysis": {},
            "volume_assessment": "",
            "red_flags": []
        }
        
        exercises = workout_plan.get("exercises", [])
        sets_reps = workout_plan.get("sets_reps", [])
        rest_periods = workout_plan.get("rest_periods", [])
        
        # Check exercise order for safety
        compound_exercises = ["squat", "deadlift", "bench press", "overhead press", "row", "pull-up"]
        isolation_exercises = ["curl", "extension", "raise", "fly"]
        
        compound_count = 0
        isolation_before_compound = False
        
        for i, exercise in enumerate(exercises):
            exercise_lower = exercise.lower()
            
            # Check if compound
            is_compound = any(comp in exercise_lower for comp in compound_exercises)
            is_isolation = any(iso in exercise_lower for iso in isolation_exercises)
            
            if is_compound:
                compound_count += 1
                if isolation_before_compound:
                    safety_analysis["exercise_order_suggestions"].append(
                        "Consider moving compound exercises before isolation exercises"
                    )
            elif is_isolation and compound_count == 0:
                isolation_before_compound = True
        
        # Analyze volume
        total_sets = len(sets_reps)
        if total_sets > 25:
            safety_analysis["volume_assessment"] = "High volume - monitor recovery"
            safety_analysis["risk_factors"].append("High training volume")
        elif total_sets > 20:
            safety_analysis["volume_assessment"] = "Moderate-high volume"
        else:
            safety_analysis["volume_assessment"] = "Appropriate volume"
        
        # Check user state
        fatigue_level = user_state.get("fatigue_level", 5)
        recovery_status = user_state.get("recovery_status", "good")
        
        if fatigue_level >= 7:
            safety_analysis["red_flags"].append("High fatigue - consider reducing intensity")
            safety_analysis["overall_safety_rating"] = "caution"
        
        if recovery_status in ["poor", "very_poor"]:
            safety_analysis["red_flags"].append("Poor recovery - prioritize rest or light activity")
            safety_analysis["overall_safety_rating"] = "high_risk"
        
        # Rest period analysis
        if rest_periods:
            avg_rest = sum(rest_periods) / len(rest_periods)
            if avg_rest < 60 and compound_count > 2:
                safety_analysis["rest_period_analysis"] = {
                    "issue": "Short rest for compound exercises",
                    "recommendation": "Increase rest to 2-3 minutes for compound movements"
                }
        
        # Generate recommendations
        if safety_analysis["overall_safety_rating"] == "high_risk":
            safety_analysis["recommendations"] = [
                "Consider postponing intense training",
                "Focus on mobility and light movement",
                "Prioritize recovery methods"
            ]
        elif safety_analysis["overall_safety_rating"] == "caution":
            safety_analysis["recommendations"] = [
                "Reduce training intensity by 20-30%",
                "Add extra warm-up time",
                "Monitor how you feel during workout",
                "Be ready to stop if needed"
            ]
        else:
            safety_analysis["recommendations"] = [
                "Proceed with planned workout",
                "Ensure proper warm-up",
                "Maintain good form throughout"
            ]
        
        return safety_analysis
    
    def _get_equipment_suggestions(self, exercise: str, available_equipment: List[str]) -> List[str]:
        """Get equipment-based exercise suggestions"""
        suggestions = []
        
        equipment_alternatives = {
            "dumbbells": ["Dumbbell variations of most exercises", "Unilateral training options"],
            "barbell": ["Barbell compound movements", "Progressive overload easier"],
            "resistance_bands": ["Joint-friendly resistance", "Good for warm-up and accessories"],
            "cables": ["Constant tension throughout ROM", "Great for isolation work"],
            "bodyweight": ["Always available", "Focus on control and progression"]
        }
        
        for equipment in available_equipment:
            if equipment.lower() in equipment_alternatives:
                suggestions.extend(equipment_alternatives[equipment.lower()])
        
        return suggestions[:3]  # Top 3 suggestions
    
    def _determine_safety_priority(self, issues: List[str]) -> str:
        """Determine safety priority based on identified issues"""
        high_risk_keywords = ["pain", "sharp", "injury", "unstable", "can't control"]
        medium_risk_keywords = ["discomfort", "tight", "weak", "compensation"]
        
        for issue in issues:
            issue_lower = issue.lower()
            if any(keyword in issue_lower for keyword in high_risk_keywords):
                return "high"
        
        for issue in issues:
            issue_lower = issue.lower()
            if any(keyword in issue_lower for keyword in medium_risk_keywords):
                return "medium"
        
        return "low"
    
    def _create_form_progression_plan(self, exercise: str, level: str, issues: List[str]) -> List[str]:
        """Create form-focused progression plan"""
        plan = []
        
        if level == "beginner":
            plan.extend([
                "Week 1-2: Bodyweight or very light weight, focus on movement pattern",
                "Week 3-4: Add light resistance, maintain perfect form",
                "Week 5-6: Gradual load increase, film yourself for form checks",
                "Week 7+: Continue progression with form as priority"
            ])
        elif level == "intermediate":
            plan.extend([
                "Week 1: Reduce load by 20%, perfect form practice",
                "Week 2-3: Return to previous loads with improved form",
                "Week 4+: Progress loads only when form is maintained"
            ])
        else:  # advanced
            plan.extend([
                "Immediate: Video analysis of current form",
                "Week 1-2: Technical refinement with moderate loads",
                "Week 3+: Return to heavy loads with improved technique"
            ])
        
        # Add issue-specific elements
        if issues:
            plan.insert(0, f"Priority: Address {issues[0]} before progressing")
        
        return plan
    
    def _get_sport_specific_prevention(self, sport: str) -> Dict[str, Any]:
        """Get sport-specific injury prevention focus"""
        sport_prevention = {
            "running": {
                "focus_areas": ["knees", "ankles", "hips", "IT band"],
                "key_exercises": ["Single leg strength", "Calf raises", "Hip stability"],
                "common_issues": ["Runner's knee", "IT band syndrome", "Plantar fasciitis"]
            },
            "basketball": {
                "focus_areas": ["ankles", "knees", "shoulders"],
                "key_exercises": ["Jump landing mechanics", "Ankle stability", "Rotator cuff"],
                "common_issues": ["Ankle sprains", "ACL injuries", "Shoulder impingement"]
            },
            "weightlifting": {
                "focus_areas": ["back", "shoulders", "wrists"],
                "key_exercises": ["Core stability", "Shoulder mobility", "Wrist flexibility"],
                "common_issues": ["Lower back strain", "Shoulder impingement", "Wrist pain"]
            }
        }
        
        return sport_prevention.get(sport.lower(), {
            "focus_areas": ["General injury prevention"],
            "key_exercises": ["Mobility and stability work"],
            "common_issues": ["Sport-specific assessment needed"]
        })
    
    async def real_time_form_analysis(self, user_id: str, exercise_video: bytes) -> Dict[str, Any]:
        """Analyze exercise form from video (placeholder for actual implementation)"""
        context = {
            "user_id": user_id,
            "analysis_request": "Form analysis from video"
        }
        
        response = await self.send_message(
            "Analyze exercise form and provide safety recommendations",
            context
        )
        
        return {
            "form_analysis": response,
            "agent": "Form & Safety Specialist",
            "timestamp": datetime.now().isoformat()
        }