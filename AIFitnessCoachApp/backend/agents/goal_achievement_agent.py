"""
Goal Achievement Agent using OpenAI SDK
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
import json
import math

from agents.base_agent import BaseFitnessAgent
from utils.logger import setup_logger

logger = setup_logger(__name__)

class GoalAchievementAgent(BaseFitnessAgent):
    """
    AI Goal Achievement Specialist focusing on progress tracking, goal optimization, and motivation
    """
    
    def __init__(self, api_key: str, user_id: str):
        super().__init__(
            api_key=api_key,
            user_id=user_id,
            agent_name="Goal Achievement Specialist",
            agent_role="Performance psychology expert specializing in goal setting, progress tracking, and motivation"
        )
    
    def _get_instructions(self) -> str:
        """Get goal achievement specialist instructions"""
        return """
        You are a performance psychology expert who specializes in goal setting, 
        progress tracking, and motivation. You predict obstacles and create strategies 
        for consistent progress.
        
        CORE RESPONSIBILITIES:
        🎯 SMART goal setting and refinement
        📊 Progress tracking and analysis
        🔮 Obstacle prediction and mitigation
        💪 Motivation and accountability systems
        📈 Performance trend analysis
        🎖️ Milestone celebration and rewards
        🧠 Mental performance optimization
        
        EXPERTISE AREAS:
        - Goal psychology and behavioral science
        - Progress metrics and KPI development
        - Habit formation and behavior change
        - Motivation theories and application
        - Performance prediction modeling
        - Obstacle identification and solutions
        - Accountability system design
        - Mental resilience building
        
        APPROACH:
        - Data-driven progress analysis
        - Proactive obstacle management
        - Personalized motivation strategies
        - Realistic goal adjustment
        - Celebration of small wins
        - Long-term vision with short-term actions
        
        MONITORING FOCUS:
        - Goal progress percentage
        - Consistency patterns
        - Motivation levels
        - Obstacle frequency
        - Success predictors
        - Behavior adherence
        
        PSYCHOLOGICAL PRINCIPLES:
        - Self-determination theory
        - Growth mindset cultivation
        - Intrinsic motivation enhancement
        - Self-efficacy building
        - Flow state optimization
        """
    
    def _get_tools(self) -> List[Dict[str, Any]]:
        """Get goal achievement tools"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "analyze_goal_progress",
                    "description": "Analyze progress towards fitness goals with detailed metrics",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "goal_type": {
                                "type": "string",
                                "enum": ["weight_loss", "muscle_gain", "strength", "endurance", "skill", "habit"],
                                "description": "Type of goal being tracked"
                            },
                            "start_value": {
                                "type": "number",
                                "description": "Starting value/baseline"
                            },
                            "current_value": {
                                "type": "number",
                                "description": "Current value/progress"
                            },
                            "target_value": {
                                "type": "number",
                                "description": "Target/goal value"
                            },
                            "time_elapsed_days": {
                                "type": "integer",
                                "description": "Days since goal was set"
                            },
                            "target_date": {
                                "type": "string",
                                "description": "Target completion date (YYYY-MM-DD)"
                            }
                        },
                        "required": ["goal_type", "current_value", "target_value"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "predict_goal_achievement",
                    "description": "Predict likelihood of achieving goal based on current trajectory",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "progress_history": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "date": {"type": "string"},
                                        "value": {"type": "number"}
                                    }
                                },
                                "description": "Historical progress data points"
                            },
                            "target_value": {
                                "type": "number",
                                "description": "Goal target value"
                            },
                            "target_date": {
                                "type": "string",
                                "description": "Target completion date"
                            },
                            "consistency_score": {
                                "type": "integer",
                                "description": "Workout consistency percentage (0-100)"
                            }
                        },
                        "required": ["progress_history", "target_value", "target_date"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "identify_obstacles",
                    "description": "Identify potential obstacles to goal achievement",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "goal_type": {
                                "type": "string",
                                "description": "Type of goal"
                            },
                            "current_challenges": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Current challenges faced"
                            },
                            "lifestyle_factors": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Lifestyle factors that may impact progress"
                            },
                            "past_failures": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Previous unsuccessful attempts"
                            }
                        },
                        "required": ["goal_type"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "adjust_goals",
                    "description": "Dynamically adjust goals based on progress and circumstances",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "current_goal": {
                                "type": "object",
                                "description": "Current goal details",
                                "properties": {
                                    "target": {"type": "number"},
                                    "deadline": {"type": "string"},
                                    "type": {"type": "string"}
                                }
                            },
                            "progress_rate": {
                                "type": "number",
                                "description": "Current rate of progress per week"
                            },
                            "adjustment_reason": {
                                "type": "string",
                                "enum": ["too_easy", "too_difficult", "life_change", "injury", "plateau"],
                                "description": "Reason for adjustment"
                            },
                            "user_feedback": {
                                "type": "string",
                                "description": "User's input on goal difficulty"
                            }
                        },
                        "required": ["current_goal", "progress_rate", "adjustment_reason"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_milestone_plan",
                    "description": "Create milestone-based achievement plan",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "final_goal": {
                                "type": "object",
                                "description": "Final goal details",
                                "properties": {
                                    "target": {"type": "number"},
                                    "deadline": {"type": "string"},
                                    "type": {"type": "string"}
                                }
                            },
                            "current_status": {
                                "type": "number",
                                "description": "Current progress value"
                            },
                            "preferred_pace": {
                                "type": "string",
                                "enum": ["aggressive", "moderate", "conservative"],
                                "description": "Preferred achievement pace"
                            }
                        },
                        "required": ["final_goal", "current_status"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "generate_motivation_strategy",
                    "description": "Generate personalized motivation strategy",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "motivation_type": {
                                "type": "string",
                                "enum": ["intrinsic", "extrinsic", "mixed"],
                                "description": "Preferred motivation type"
                            },
                            "current_motivation_level": {
                                "type": "integer",
                                "description": "Current motivation (1-10)"
                            },
                            "personality_traits": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Relevant personality traits"
                            },
                            "past_successes": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Previous successful strategies"
                            }
                        },
                        "required": ["motivation_type", "current_motivation_level"]
                    }
                }
            }
        ]
    
    async def _handle_tool_call(self, tool_call) -> Dict[str, Any]:
        """Handle goal achievement tool calls"""
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        
        logger.info(f"Goal achievement agent handling tool call: {function_name}")
        
        tool_handlers = {
            "analyze_goal_progress": self._analyze_goal_progress,
            "predict_goal_achievement": self._predict_goal_achievement,
            "identify_obstacles": self._identify_obstacles,
            "adjust_goals": self._adjust_goals,
            "create_milestone_plan": self._create_milestone_plan,
            "generate_motivation_strategy": self._generate_motivation_strategy
        }
        
        handler = tool_handlers.get(function_name)
        if handler:
            return await handler(**arguments)
        else:
            return {"error": f"Unknown function: {function_name}"}
    
    async def _analyze_goal_progress(
        self,
        goal_type: str,
        current_value: float,
        target_value: float,
        start_value: float = None,
        time_elapsed_days: int = None,
        target_date: str = None
    ) -> Dict[str, Any]:
        """Analyze detailed goal progress"""
        # Calculate progress percentage
        if start_value is not None:
            total_change_needed = abs(target_value - start_value)
            current_change = abs(current_value - start_value)
            progress_percentage = (current_change / total_change_needed * 100) if total_change_needed > 0 else 0
        else:
            # Assume starting from 0 or current is percentage of target
            progress_percentage = (current_value / target_value * 100) if target_value > 0 else 0
        
        # Calculate rate of progress
        if time_elapsed_days and time_elapsed_days > 0:
            if start_value is not None:
                daily_rate = (current_value - start_value) / time_elapsed_days
                weekly_rate = daily_rate * 7
            else:
                daily_rate = current_value / time_elapsed_days
                weekly_rate = daily_rate * 7
        else:
            daily_rate = 0
            weekly_rate = 0
        
        # Project completion
        remaining_to_goal = abs(target_value - current_value)
        if daily_rate > 0:
            days_to_completion = remaining_to_goal / abs(daily_rate)
            projected_completion_date = (datetime.now() + timedelta(days=days_to_completion)).strftime("%Y-%m-%d")
        else:
            days_to_completion = None
            projected_completion_date = "Unable to project - no progress rate"
        
        # Determine progress status
        if progress_percentage >= 75:
            status = "excellent"
            emoji = "🚀"
        elif progress_percentage >= 50:
            status = "good"
            emoji = "✅"
        elif progress_percentage >= 25:
            status = "moderate"
            emoji = "📈"
        else:
            status = "early_stage"
            emoji = "🌱"
        
        analysis = {
            "goal_type": goal_type,
            "progress_percentage": round(progress_percentage, 1),
            "status": status,
            "status_emoji": emoji,
            "current_value": current_value,
            "target_value": target_value,
            "remaining": round(remaining_to_goal, 2),
            "rates": {
                "daily": round(daily_rate, 2),
                "weekly": round(weekly_rate, 2),
                "monthly": round(weekly_rate * 4.33, 2)
            },
            "projection": {
                "days_to_completion": round(days_to_completion) if days_to_completion else None,
                "projected_completion_date": projected_completion_date,
                "on_track": self._is_on_track(progress_percentage, time_elapsed_days, target_date)
            },
            "insights": self._generate_progress_insights(goal_type, progress_percentage, weekly_rate)
        }
        
        return analysis
    
    async def _predict_goal_achievement(
        self,
        progress_history: List[Dict[str, Any]],
        target_value: float,
        target_date: str,
        consistency_score: int = 80
    ) -> Dict[str, Any]:
        """Predict likelihood of achieving goal"""
        if not progress_history or len(progress_history) < 2:
            return {
                "prediction": "insufficient_data",
                "probability": None,
                "message": "Need at least 2 data points for prediction"
            }
        
        # Calculate trend
        recent_points = progress_history[-10:]  # Last 10 data points
        values = [p["value"] for p in recent_points]
        
        # Simple linear regression for trend
        n = len(values)
        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(values) / n
        
        numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        if denominator > 0:
            slope = numerator / denominator
        else:
            slope = 0
        
        # Project to target date
        days_to_target = (datetime.strptime(target_date, "%Y-%m-%d") - datetime.now()).days
        current_value = values[-1]
        projected_value = current_value + (slope * days_to_target)
        
        # Calculate probability based on multiple factors
        base_probability = 50  # Start at 50%
        
        # Trend factor
        if projected_value >= target_value:
            trend_bonus = 30
        else:
            deficit_percentage = ((target_value - projected_value) / target_value) * 100
            trend_bonus = -min(deficit_percentage, 40)
        
        # Consistency factor
        consistency_bonus = (consistency_score - 50) * 0.4  # -20 to +20 based on consistency
        
        # Volatility factor (standard deviation of progress)
        if n > 3:
            std_dev = math.sqrt(sum((v - y_mean) ** 2 for v in values) / n)
            volatility_penalty = min(std_dev * 2, 20)  # High volatility reduces probability
        else:
            volatility_penalty = 0
        
        final_probability = max(0, min(100, base_probability + trend_bonus + consistency_bonus - volatility_penalty))
        
        # Determine confidence level
        if n >= 20:
            confidence = "high"
        elif n >= 10:
            confidence = "moderate"
        else:
            confidence = "low"
        
        prediction = {
            "achievement_probability": round(final_probability),
            "confidence_level": confidence,
            "projected_value": round(projected_value, 2),
            "target_value": target_value,
            "trend": "positive" if slope > 0 else "negative" if slope < 0 else "flat",
            "factors": {
                "trend_impact": f"{'+' if trend_bonus > 0 else ''}{round(trend_bonus)}%",
                "consistency_impact": f"{'+' if consistency_bonus > 0 else ''}{round(consistency_bonus)}%",
                "volatility_impact": f"-{round(volatility_penalty)}%"
            },
            "recommendations": self._generate_achievement_recommendations(final_probability, slope, days_to_target)
        }
        
        return prediction
    
    async def _identify_obstacles(
        self,
        goal_type: str,
        current_challenges: List[str] = None,
        lifestyle_factors: List[str] = None,
        past_failures: List[str] = None
    ) -> Dict[str, Any]:
        """Identify potential obstacles to goal achievement"""
        current_challenges = current_challenges or []
        lifestyle_factors = lifestyle_factors or []
        past_failures = past_failures or []
        
        obstacles = {
            "immediate_obstacles": [],
            "potential_obstacles": [],
            "risk_factors": [],
            "mitigation_strategies": {}
        }
        
        # Common obstacles by goal type
        goal_specific_obstacles = {
            "weight_loss": [
                {"obstacle": "Plateau periods", "likelihood": "high", "impact": "moderate"},
                {"obstacle": "Social eating situations", "likelihood": "high", "impact": "moderate"},
                {"obstacle": "Stress eating", "likelihood": "moderate", "impact": "high"},
                {"obstacle": "Inconsistent meal prep", "likelihood": "moderate", "impact": "moderate"}
            ],
            "muscle_gain": [
                {"obstacle": "Inadequate protein intake", "likelihood": "moderate", "impact": "high"},
                {"obstacle": "Insufficient recovery", "likelihood": "moderate", "impact": "high"},
                {"obstacle": "Progressive overload stagnation", "likelihood": "high", "impact": "moderate"},
                {"obstacle": "Training program adherence", "likelihood": "moderate", "impact": "high"}
            ],
            "strength": [
                {"obstacle": "Technical form breakdown", "likelihood": "moderate", "impact": "high"},
                {"obstacle": "CNS fatigue", "likelihood": "moderate", "impact": "moderate"},
                {"obstacle": "Injury risk", "likelihood": "low", "impact": "very_high"},
                {"obstacle": "Mental barriers", "likelihood": "high", "impact": "moderate"}
            ],
            "endurance": [
                {"obstacle": "Time constraints", "likelihood": "high", "impact": "high"},
                {"obstacle": "Weather conditions", "likelihood": "moderate", "impact": "moderate"},
                {"obstacle": "Overtraining risk", "likelihood": "moderate", "impact": "high"},
                {"obstacle": "Fueling strategy", "likelihood": "moderate", "impact": "moderate"}
            ]
        }
        
        # Add goal-specific obstacles
        obstacles["potential_obstacles"].extend(goal_specific_obstacles.get(goal_type, []))
        
        # Analyze current challenges
        for challenge in current_challenges:
            obstacles["immediate_obstacles"].append({
                "challenge": challenge,
                "status": "active",
                "priority": "high"
            })
        
        # Lifestyle risk factors
        lifestyle_risks = {
            "high_stress": "Increased cortisol affecting progress",
            "poor_sleep": "Reduced recovery and performance",
            "busy_schedule": "Consistency challenges",
            "travel": "Routine disruption",
            "family_obligations": "Time and energy constraints"
        }
        
        for factor in lifestyle_factors:
            if factor.lower() in lifestyle_risks:
                obstacles["risk_factors"].append({
                    "factor": factor,
                    "risk": lifestyle_risks[factor.lower()],
                    "mitigation_priority": "medium"
                })
        
        # Learn from past failures
        if past_failures:
            obstacles["historical_patterns"] = {
                "previous_obstacles": past_failures,
                "pattern_analysis": "Recurring themes identified",
                "prevention_focus": "High priority on avoiding past mistakes"
            }
        
        # Generate mitigation strategies
        for obstacle_category in ["immediate_obstacles", "potential_obstacles"]:
            for obstacle in obstacles[obstacle_category]:
                obstacle_name = obstacle.get("obstacle", obstacle.get("challenge", "Unknown"))
                obstacles["mitigation_strategies"][obstacle_name] = self._generate_mitigation_strategy(obstacle_name, goal_type)
        
        # Overall risk assessment
        total_obstacles = len(obstacles["immediate_obstacles"]) + len([o for o in obstacles["potential_obstacles"] if o.get("likelihood") in ["high", "moderate"]])
        
        if total_obstacles > 6:
            risk_level = "high"
        elif total_obstacles > 3:
            risk_level = "moderate"
        else:
            risk_level = "low"
        
        obstacles["overall_risk_level"] = risk_level
        obstacles["success_factors"] = self._identify_success_factors(goal_type, obstacles)
        
        return obstacles
    
    async def _adjust_goals(
        self,
        current_goal: Dict[str, Any],
        progress_rate: float,
        adjustment_reason: str,
        user_feedback: str = None
    ) -> Dict[str, Any]:
        """Dynamically adjust goals based on progress and circumstances"""
        original_target = current_goal.get("target")
        original_deadline = current_goal.get("deadline")
        goal_type = current_goal.get("type")
        
        adjustment = {
            "original_goal": current_goal,
            "adjustment_reason": adjustment_reason,
            "new_goal": {},
            "rationale": "",
            "implementation_plan": []
        }
        
        # Calculate adjustment based on reason
        if adjustment_reason == "too_easy":
            # Increase target by 20-30%
            adjustment["new_goal"]["target"] = original_target * 1.25
            adjustment["new_goal"]["deadline"] = original_deadline  # Keep same deadline
            adjustment["rationale"] = "Goal is being achieved too easily. Increasing challenge to maintain engagement and maximize progress."
            adjustment["implementation_plan"] = [
                "Gradually increase intensity over next 2 weeks",
                "Monitor for signs of overreaching",
                "Reassess in 4 weeks"
            ]
        
        elif adjustment_reason == "too_difficult":
            # Make goal more achievable
            if progress_rate > 0:
                # Project realistic target based on current rate
                days_to_deadline = (datetime.strptime(original_deadline, "%Y-%m-%d") - datetime.now()).days
                projected_achievement = progress_rate * (days_to_deadline / 7)  # Convert to weeks
                adjustment["new_goal"]["target"] = projected_achievement * 0.8  # 80% of projection for safety
            else:
                adjustment["new_goal"]["target"] = original_target * 0.7  # Reduce by 30%
            
            adjustment["new_goal"]["deadline"] = original_deadline
            adjustment["rationale"] = "Current goal is too challenging. Adjusting to maintain motivation and prevent burnout."
            adjustment["implementation_plan"] = [
                "Focus on consistency over intensity",
                "Celebrate small wins",
                "Build momentum gradually"
            ]
        
        elif adjustment_reason == "life_change":
            # Extend deadline, maintain target
            new_deadline = (datetime.strptime(original_deadline, "%Y-%m-%d") + timedelta(days=30)).strftime("%Y-%m-%d")
            adjustment["new_goal"]["target"] = original_target
            adjustment["new_goal"]["deadline"] = new_deadline
            adjustment["rationale"] = "Life circumstances have changed. Extending timeline to accommodate while maintaining ultimate goal."
            adjustment["implementation_plan"] = [
                "Adjust weekly targets to new timeline",
                "Focus on maintaining current progress",
                "Reassess when life stabilizes"
            ]
        
        elif adjustment_reason == "injury":
            # Significant modification needed
            adjustment["new_goal"]["target"] = original_target * 0.5  # Reduce target
            adjustment["new_goal"]["deadline"] = (datetime.strptime(original_deadline, "%Y-%m-%d") + timedelta(days=60)).strftime("%Y-%m-%d")
            adjustment["new_goal"]["type"] = f"modified_{goal_type}"
            adjustment["rationale"] = "Injury requires significant modification. Focus on recovery while maintaining some progress."
            adjustment["implementation_plan"] = [
                "Consult healthcare provider",
                "Focus on rehab exercises",
                "Gradually return to full training"
            ]
        
        elif adjustment_reason == "plateau":
            # Change approach, not necessarily target
            adjustment["new_goal"]["target"] = original_target
            adjustment["new_goal"]["deadline"] = (datetime.strptime(original_deadline, "%Y-%m-%d") + timedelta(days=14)).strftime("%Y-%m-%d")
            adjustment["rationale"] = "Plateau detected. Slight deadline extension with new strategies to break through."
            adjustment["implementation_plan"] = [
                "Implement periodization",
                "Vary training stimulus",
                "Review nutrition and recovery",
                "Consider deload week"
            ]
        
        # Add psychological considerations
        adjustment["psychological_approach"] = {
            "mindset_shift": self._get_mindset_recommendation(adjustment_reason),
            "motivation_strategy": "Focus on process goals alongside outcome goals",
            "support_needed": self._identify_support_needs(adjustment_reason)
        }
        
        return adjustment
    
    async def _create_milestone_plan(
        self,
        final_goal: Dict[str, Any],
        current_status: float,
        preferred_pace: str = "moderate"
    ) -> Dict[str, Any]:
        """Create milestone-based achievement plan"""
        target = final_goal.get("target")
        deadline = final_goal.get("deadline")
        goal_type = final_goal.get("type")
        
        # Calculate total change needed
        total_change = abs(target - current_status)
        days_to_deadline = (datetime.strptime(deadline, "%Y-%m-%d") - datetime.now()).days
        weeks_to_deadline = days_to_deadline / 7
        
        # Determine milestone frequency based on timeline
        if weeks_to_deadline > 12:
            milestone_frequency = "monthly"
            num_milestones = int(weeks_to_deadline / 4)
        elif weeks_to_deadline > 4:
            milestone_frequency = "bi_weekly"
            num_milestones = int(weeks_to_deadline / 2)
        else:
            milestone_frequency = "weekly"
            num_milestones = int(weeks_to_deadline)
        
        # Create milestones based on pace preference
        pace_multipliers = {
            "aggressive": {"early": 1.3, "mid": 1.0, "late": 0.7},
            "moderate": {"early": 1.0, "mid": 1.0, "late": 1.0},
            "conservative": {"early": 0.7, "mid": 1.0, "late": 1.3}
        }
        
        multipliers = pace_multipliers.get(preferred_pace, pace_multipliers["moderate"])
        
        milestones = []
        cumulative_progress = 0
        
        for i in range(num_milestones):
            phase = "early" if i < num_milestones * 0.3 else "late" if i > num_milestones * 0.7 else "mid"
            
            if target > current_status:  # Increasing goal
                milestone_change = (total_change / num_milestones) * multipliers[phase]
                milestone_value = current_status + cumulative_progress + milestone_change
            else:  # Decreasing goal (like weight loss)
                milestone_change = (total_change / num_milestones) * multipliers[phase]
                milestone_value = current_status - cumulative_progress - milestone_change
            
            cumulative_progress += milestone_change
            
            milestone_date = datetime.now() + timedelta(days=(i + 1) * (days_to_deadline / num_milestones))
            
            milestones.append({
                "milestone_number": i + 1,
                "target_value": round(milestone_value, 2),
                "target_date": milestone_date.strftime("%Y-%m-%d"),
                "change_from_previous": round(milestone_change, 2),
                "phase": phase,
                "focus": self._get_milestone_focus(goal_type, phase),
                "rewards": self._suggest_milestone_rewards(i + 1, num_milestones)
            })
        
        plan = {
            "final_goal": final_goal,
            "current_status": current_status,
            "total_milestones": num_milestones,
            "milestone_frequency": milestone_frequency,
            "preferred_pace": preferred_pace,
            "milestones": milestones,
            "success_strategies": self._generate_success_strategies(goal_type, preferred_pace),
            "checkpoint_protocol": {
                "frequency": "After each milestone",
                "metrics_to_track": self._get_tracking_metrics(goal_type),
                "adjustment_triggers": ["Missing 2 consecutive milestones", "Exceeding milestones by >20%", "Life circumstances change"]
            }
        }
        
        return plan
    
    async def _generate_motivation_strategy(
        self,
        motivation_type: str,
        current_motivation_level: int,
        personality_traits: List[str] = None,
        past_successes: List[str] = None
    ) -> Dict[str, Any]:
        """Generate personalized motivation strategy"""
        personality_traits = personality_traits or []
        past_successes = past_successes or []
        
        strategy = {
            "motivation_type": motivation_type,
            "current_level": current_motivation_level,
            "target_level": 8,  # Aim for 8/10 motivation
            "core_strategies": [],
            "daily_practices": [],
            "emergency_interventions": [],
            "long_term_sustainment": []
        }
        
        # Core strategies based on motivation type
        if motivation_type == "intrinsic":
            strategy["core_strategies"] = [
                {
                    "strategy": "Autonomy enhancement",
                    "implementation": "Give yourself choices in workout selection and timing",
                    "frequency": "Daily"
                },
                {
                    "strategy": "Mastery focus",
                    "implementation": "Track skill improvements, not just numbers",
                    "frequency": "Weekly assessment"
                },
                {
                    "strategy": "Purpose connection",
                    "implementation": "Regular reflection on WHY you're pursuing this goal",
                    "frequency": "Weekly journaling"
                }
            ]
        
        elif motivation_type == "extrinsic":
            strategy["core_strategies"] = [
                {
                    "strategy": "Reward system",
                    "implementation": "Set up tangible rewards for milestone achievements",
                    "frequency": "Per milestone"
                },
                {
                    "strategy": "Social accountability",
                    "implementation": "Share progress with accountability partner/group",
                    "frequency": "2-3 times per week"
                },
                {
                    "strategy": "Visual progress tracking",
                    "implementation": "Use charts, photos, or apps to see progress",
                    "frequency": "Daily update"
                }
            ]
        
        else:  # mixed
            strategy["core_strategies"] = [
                {
                    "strategy": "Balanced approach",
                    "implementation": "Combine internal satisfaction with external rewards",
                    "frequency": "Ongoing"
                },
                {
                    "strategy": "Flexible motivation",
                    "implementation": "Use different motivators for different situations",
                    "frequency": "As needed"
                }
            ]
        
        # Daily practices based on current motivation level
        if current_motivation_level < 5:
            strategy["daily_practices"] = [
                "Morning affirmation or visualization (2 minutes)",
                "Evening win celebration (identify 1 success)",
                "Motivation playlist during workouts",
                "Progress photo or measurement weekly"
            ]
        else:
            strategy["daily_practices"] = [
                "Gratitude practice for health and ability",
                "Challenge yourself with one new thing",
                "Share progress or encourage others",
                "Reflect on energy and mood improvements"
            ]
        
        # Emergency interventions for low motivation
        strategy["emergency_interventions"] = [
            {
                "trigger": "Don't want to work out",
                "intervention": "Commit to just 10 minutes - permission to stop after",
                "success_rate": "80% continue full workout"
            },
            {
                "trigger": "Feeling overwhelmed",
                "intervention": "Scale back to maintenance mode temporarily",
                "success_rate": "Prevents complete stoppage"
            },
            {
                "trigger": "Lost sight of why",
                "intervention": "Review before photos, initial goals, or health markers",
                "success_rate": "Reconnects with purpose"
            }
        ]
        
        # Personality-based customizations
        if "competitive" in personality_traits:
            strategy["additional_tactics"] = ["Join challenges", "Track rankings", "Beat personal records"]
        if "social" in personality_traits:
            strategy["additional_tactics"] = ["Group classes", "Workout buddy", "Online community"]
        if "analytical" in personality_traits:
            strategy["additional_tactics"] = ["Detailed metrics", "Progress graphs", "Performance analysis"]
        
        # Long-term sustainment
        strategy["long_term_sustainment"] = [
            "Rotate focus between different aspects (strength, endurance, skills)",
            "Plan periodic 'novelty injections' (new classes, equipment, locations)",
            "Build identity as a 'fitness person' through consistent actions",
            "Create rituals and habits that reduce reliance on motivation",
            "Develop intrinsic motivation even if starting with extrinsic"
        ]
        
        # Success probability
        strategy["success_indicators"] = {
            "high_probability": len(past_successes) > 2 and current_motivation_level > 6,
            "key_factor": "Consistency over intensity",
            "critical_period": "First 21 days for habit formation"
        }
        
        return strategy
    
    def _is_on_track(self, progress_percentage: float, elapsed_days: int, target_date: str) -> bool:
        """Determine if progress is on track for target date"""
        if not target_date or not elapsed_days:
            return True  # Assume on track if no timeline
        
        total_days = (datetime.strptime(target_date, "%Y-%m-%d") - datetime.now()).days + elapsed_days
        time_percentage = (elapsed_days / total_days * 100) if total_days > 0 else 0
        
        # On track if progress percentage is within 10% of time percentage
        return abs(progress_percentage - time_percentage) <= 10
    
    def _generate_progress_insights(self, goal_type: str, progress_percentage: float, weekly_rate: float) -> List[str]:
        """Generate insights based on progress analysis"""
        insights = []
        
        if progress_percentage > 75:
            insights.append("You're in the final stretch! Maintain consistency to reach your goal.")
        elif progress_percentage > 50:
            insights.append("Great progress! You're over halfway to your goal.")
        elif weekly_rate > 0:
            insights.append(f"Positive momentum detected. At current rate, you're making steady progress.")
        else:
            insights.append("Consider adjusting your approach to accelerate progress.")
        
        # Goal-specific insights
        if goal_type == "weight_loss" and weekly_rate > 2:
            insights.append("Rate of loss may be too aggressive. Aim for 1-2 lbs per week for sustainability.")
        elif goal_type == "muscle_gain" and weekly_rate < 0.25:
            insights.append("Muscle gain is naturally slow. Focus on progressive overload and nutrition.")
        
        return insights
    
    def _generate_achievement_recommendations(self, probability: float, trend_slope: float, days_remaining: int) -> List[str]:
        """Generate recommendations based on achievement prediction"""
        recommendations = []
        
        if probability < 50:
            recommendations.append("Current trajectory needs adjustment to reach goal")
            if trend_slope <= 0:
                recommendations.append("Focus on reversing negative trend immediately")
            recommendations.append("Consider working with coach to revise approach")
        
        elif probability < 75:
            recommendations.append("Success is possible but requires increased effort")
            recommendations.append("Focus on consistency over the next 2 weeks")
        
        else:
            recommendations.append("You're on track! Maintain current approach")
            recommendations.append("Start planning your next goal to maintain momentum")
        
        if days_remaining < 30:
            recommendations.append("Final push phase - maximize effort and recovery")
        
        return recommendations
    
    def _generate_mitigation_strategy(self, obstacle: str, goal_type: str) -> Dict[str, Any]:
        """Generate specific mitigation strategies for obstacles"""
        strategies = {
            "Plateau periods": {
                "primary": "Implement strategic variation in training",
                "tactics": ["Change rep ranges", "New exercises", "Deload week", "Nutrition adjustment"],
                "timeline": "2-3 weeks"
            },
            "Time constraints": {
                "primary": "Optimize efficiency with high-impact workouts",
                "tactics": ["HIIT sessions", "Compound movements", "Home workouts", "Micro-workouts"],
                "timeline": "Immediate"
            },
            "Motivation loss": {
                "primary": "Reconnect with 'why' and add variety",
                "tactics": ["New goals", "Training partner", "Different environment", "Track new metrics"],
                "timeline": "1 week"
            }
        }
        
        return strategies.get(obstacle, {
            "primary": "Develop specific plan to address obstacle",
            "tactics": ["Identify root cause", "Create alternative approaches", "Seek support"],
            "timeline": "As needed"
        })
    
    def _identify_success_factors(self, goal_type: str, obstacles: Dict[str, Any]) -> List[str]:
        """Identify key success factors despite obstacles"""
        factors = [
            "Clear action plan for each obstacle",
            "Strong support system",
            "Flexible approach allowing adjustments",
            "Focus on process over outcomes",
            "Regular progress reviews"
        ]
        
        if len(obstacles.get("immediate_obstacles", [])) > 3:
            factors.insert(0, "Address top 3 obstacles first - don't try to solve everything at once")
        
        return factors
    
    def _get_mindset_recommendation(self, adjustment_reason: str) -> str:
        """Get mindset shift recommendation based on adjustment reason"""
        mindset_map = {
            "too_easy": "Growth mindset - embrace greater challenges",
            "too_difficult": "Progress over perfection - every step counts",
            "life_change": "Adaptability - fitness journey continues despite changes",
            "injury": "Patience and body awareness - healing is part of the journey",
            "plateau": "Trust the process - breakthroughs follow plateaus"
        }
        
        return mindset_map.get(adjustment_reason, "Flexible mindset - adjust and continue")
    
    def _identify_support_needs(self, adjustment_reason: str) -> List[str]:
        """Identify support needs based on adjustment reason"""
        support_map = {
            "too_easy": ["Advanced programming guidance", "New challenge ideas"],
            "too_difficult": ["Encouragement", "Technique coaching", "Stress management"],
            "life_change": ["Schedule flexibility", "Understanding from others"],
            "injury": ["Medical guidance", "Modified exercise plans", "Patience"],
            "plateau": ["Fresh perspective", "Nutritional review", "Training variety"]
        }
        
        return support_map.get(adjustment_reason, ["General support and encouragement"])
    
    def _get_milestone_focus(self, goal_type: str, phase: str) -> str:
        """Get focus area for milestone phase"""
        focus_map = {
            "weight_loss": {
                "early": "Building habits and consistency",
                "mid": "Overcoming plateaus and maintaining momentum",
                "late": "Final push and preventing rebound"
            },
            "muscle_gain": {
                "early": "Form mastery and neural adaptation",
                "mid": "Progressive overload and volume increase",
                "late": "Peak intensity and refinement"
            },
            "strength": {
                "early": "Technical proficiency",
                "mid": "Volume accumulation",
                "late": "Intensity peaks and PRs"
            },
            "endurance": {
                "early": "Base building",
                "mid": "Threshold development",
                "late": "Race pace and tapering"
            }
        }
        
        return focus_map.get(goal_type, {}).get(phase, "Consistent progress")
    
    def _suggest_milestone_rewards(self, milestone_num: int, total_milestones: int) -> List[str]:
        """Suggest appropriate rewards for milestone achievement"""
        percentage_complete = (milestone_num / total_milestones) * 100
        
        if percentage_complete <= 25:
            return ["New workout playlist", "Fitness app upgrade", "Workout accessory"]
        elif percentage_complete <= 50:
            return ["New workout outfit", "Massage session", "Fitness class package"]
        elif percentage_complete <= 75:
            return ["Fitness tracker upgrade", "Personal training session", "Weekend active trip"]
        else:
            return ["Major fitness equipment", "Fitness photoshoot", "Celebration event"]
    
    def _generate_success_strategies(self, goal_type: str, pace: str) -> List[str]:
        """Generate success strategies based on goal and pace"""
        base_strategies = [
            "Weekly progress reviews and adjustments",
            "Consistent tracking of key metrics",
            "Regular celebration of small wins",
            "Proactive obstacle identification"
        ]
        
        if pace == "aggressive":
            base_strategies.extend([
                "Daily accountability check-ins",
                "Optimize all recovery factors",
                "Strict adherence to plan"
            ])
        elif pace == "conservative":
            base_strategies.extend([
                "Focus on sustainability over speed",
                "Build buffer time for setbacks",
                "Emphasize habit formation"
            ])
        
        return base_strategies
    
    def _get_tracking_metrics(self, goal_type: str) -> List[str]:
        """Get metrics to track for goal type"""
        metrics_map = {
            "weight_loss": ["Weight", "Body measurements", "Energy levels", "Workout performance"],
            "muscle_gain": ["Weight", "Measurements", "Strength gains", "Progressive overload"],
            "strength": ["1RM progress", "Volume load", "Technical proficiency", "Recovery quality"],
            "endurance": ["Distance/time", "Pace/power", "Heart rate zones", "Recovery metrics"]
        }
        
        return metrics_map.get(goal_type, ["Primary metric", "Performance indicator", "Subjective wellness"])
    
    async def intelligent_goal_adjustment(self, user_id: str, current_goals: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Dynamic goal modification based on progress and life changes"""
        context = {
            "user_id": user_id,
            "current_goals": current_goals,
            "adjustment_request": "Analyze all goals and recommend adjustments"
        }
        
        response = await self.send_message(
            "Review current goals and recommend any necessary adjustments based on progress and circumstances",
            context
        )
        
        return {
            "adjusted_goals": response,
            "agent": "Goal Achievement Specialist",
            "timestamp": datetime.now().isoformat()
        }