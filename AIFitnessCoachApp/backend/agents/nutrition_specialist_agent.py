"""
Nutrition Specialist Agent using OpenAI SDK
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
import json

from agents.base_agent import BaseFitnessAgent
from services.user_service import UserService
from utils.logger import setup_logger

logger = setup_logger(__name__)

class NutritionSpecialistAgent(BaseFitnessAgent):
    """
    AI Nutrition Specialist focusing on meal planning, macro optimization, and nutritional guidance
    """
    
    def __init__(self, api_key: str, user_id: str):
        self.user_service = UserService()
        super().__init__(
            api_key=api_key,
            user_id=user_id,
            agent_name="Nutrition Specialist",
            agent_role="Expert nutritionist and dietitian specializing in sports nutrition"
        )
    
    def _get_instructions(self) -> str:
        """Get nutrition specialist instructions"""
        return """
        You are a certified nutritionist and dietitian specializing in sports nutrition 
        and metabolic optimization. You work closely with fitness coaches to align 
        nutrition with training goals.
        
        CORE RESPONSIBILITIES:
        🥗 Personalized meal planning based on fitness goals
        🔬 Macro and micronutrient optimization
        ⏰ Strategic meal timing around workouts
        💊 Supplement recommendations when appropriate
        🍽️ Practical meal prep guidance
        📊 Nutritional analysis and tracking
        🎯 Goal-specific nutrition strategies
        
        EXPERTISE AREAS:
        - Sports nutrition for performance
        - Weight management (loss/gain/maintenance)
        - Metabolic health optimization
        - Recovery nutrition
        - Hydration strategies
        - Pre/post workout nutrition
        - Dietary restrictions and allergies
        - Sustainable eating habits
        
        APPROACH:
        - Evidence-based recommendations
        - Practical, sustainable solutions
        - Culturally sensitive meal planning
        - Budget-conscious options
        - Emphasis on whole foods
        - Flexible dieting principles
        
        SAFETY PROTOCOLS:
        - Never diagnose medical conditions
        - Recommend medical consultation for eating disorders
        - Avoid extreme dietary restrictions
        - Consider individual health conditions
        - Promote balanced, sustainable nutrition
        """
    
    def _get_tools(self) -> List[Dict[str, Any]]:
        """Get nutrition-specific tools"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "calculate_macro_needs",
                    "description": "Calculate personalized macronutrient and calorie needs based on user profile and goals",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "activity_level": {
                                "type": "string",
                                "enum": ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"],
                                "description": "User's activity level"
                            },
                            "goal": {
                                "type": "string",
                                "enum": ["weight_loss", "muscle_gain", "maintenance", "performance"],
                                "description": "Primary nutrition goal"
                            },
                            "weight_kg": {
                                "type": "number",
                                "description": "User's weight in kilograms"
                            },
                            "height_cm": {
                                "type": "number",
                                "description": "User's height in centimeters"
                            },
                            "age": {
                                "type": "integer",
                                "description": "User's age"
                            },
                            "gender": {
                                "type": "string",
                                "enum": ["male", "female"],
                                "description": "User's biological gender"
                            }
                        },
                        "required": ["activity_level", "goal"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "generate_meal_plan",
                    "description": "Create a personalized meal plan based on nutritional needs and preferences",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "calories": {
                                "type": "integer",
                                "description": "Target daily calories"
                            },
                            "protein_g": {
                                "type": "integer",
                                "description": "Target protein in grams"
                            },
                            "carbs_g": {
                                "type": "integer",
                                "description": "Target carbohydrates in grams"
                            },
                            "fats_g": {
                                "type": "integer",
                                "description": "Target fats in grams"
                            },
                            "meals_per_day": {
                                "type": "integer",
                                "description": "Number of meals per day",
                                "default": 3
                            },
                            "dietary_restrictions": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Dietary restrictions (vegetarian, vegan, gluten-free, etc.)"
                            },
                            "preferences": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Food preferences"
                            }
                        },
                        "required": ["calories", "protein_g", "carbs_g", "fats_g"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "analyze_meal_nutrition",
                    "description": "Analyze nutritional content of a meal or food item",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "meal_description": {
                                "type": "string",
                                "description": "Description of the meal or food items"
                            },
                            "portion_size": {
                                "type": "string",
                                "description": "Portion size description"
                            }
                        },
                        "required": ["meal_description"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "suggest_meal_timing",
                    "description": "Provide optimal meal timing recommendations around workouts",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "workout_time": {
                                "type": "string",
                                "description": "Time of workout (e.g., '7:00 AM', '6:00 PM')"
                            },
                            "workout_type": {
                                "type": "string",
                                "enum": ["strength", "cardio", "hiit", "endurance", "mixed"],
                                "description": "Type of workout"
                            },
                            "workout_duration": {
                                "type": "integer",
                                "description": "Workout duration in minutes"
                            }
                        },
                        "required": ["workout_time", "workout_type"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "recommend_supplements",
                    "description": "Suggest appropriate supplements based on goals and needs",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "goals": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Fitness and health goals"
                            },
                            "diet_type": {
                                "type": "string",
                                "description": "Current diet type (omnivore, vegetarian, vegan, etc.)"
                            },
                            "health_conditions": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Any relevant health conditions"
                            }
                        },
                        "required": ["goals"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_shopping_list",
                    "description": "Generate a shopping list from meal plan",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "meal_plan": {
                                "type": "object",
                                "description": "The meal plan to create shopping list from"
                            },
                            "servings": {
                                "type": "integer",
                                "description": "Number of servings to shop for",
                                "default": 1
                            },
                            "budget": {
                                "type": "string",
                                "enum": ["budget", "moderate", "premium"],
                                "description": "Budget preference"
                            }
                        },
                        "required": ["meal_plan"]
                    }
                }
            }
        ]
    
    async def _handle_tool_call(self, tool_call) -> Dict[str, Any]:
        """Handle nutrition-specific tool calls"""
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        
        logger.info(f"Nutrition agent handling tool call: {function_name}")
        
        tool_handlers = {
            "calculate_macro_needs": self._calculate_macro_needs,
            "generate_meal_plan": self._generate_meal_plan,
            "analyze_meal_nutrition": self._analyze_meal_nutrition,
            "suggest_meal_timing": self._suggest_meal_timing,
            "recommend_supplements": self._recommend_supplements,
            "create_shopping_list": self._create_shopping_list
        }
        
        handler = tool_handlers.get(function_name)
        if handler:
            return await handler(**arguments)
        else:
            return {"error": f"Unknown function: {function_name}"}
    
    async def _calculate_macro_needs(
        self, 
        activity_level: str, 
        goal: str,
        weight_kg: float = None,
        height_cm: float = None,
        age: int = None,
        gender: str = None
    ) -> Dict[str, Any]:
        """Calculate personalized macro needs"""
        # Get user data if not provided
        if not all([weight_kg, height_cm, age, gender]):
            # In production, fetch from user profile
            # For now, use defaults
            weight_kg = weight_kg or 70
            height_cm = height_cm or 170
            age = age or 30
            gender = gender or "male"
        
        # Calculate BMR using Mifflin-St Jeor equation
        if gender == "male":
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        else:
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
        
        # Activity multipliers
        activity_multipliers = {
            "sedentary": 1.2,
            "lightly_active": 1.375,
            "moderately_active": 1.55,
            "very_active": 1.725,
            "extremely_active": 1.9
        }
        
        tdee = bmr * activity_multipliers.get(activity_level, 1.55)
        
        # Adjust for goals
        if goal == "weight_loss":
            calories = int(tdee * 0.8)  # 20% deficit
            protein_ratio = 0.35
            fat_ratio = 0.25
            carb_ratio = 0.40
        elif goal == "muscle_gain":
            calories = int(tdee * 1.1)  # 10% surplus
            protein_ratio = 0.30
            fat_ratio = 0.25
            carb_ratio = 0.45
        elif goal == "performance":
            calories = int(tdee)
            protein_ratio = 0.25
            fat_ratio = 0.25
            carb_ratio = 0.50
        else:  # maintenance
            calories = int(tdee)
            protein_ratio = 0.30
            fat_ratio = 0.30
            carb_ratio = 0.40
        
        # Calculate macros
        protein_g = int((calories * protein_ratio) / 4)
        carbs_g = int((calories * carb_ratio) / 4)
        fats_g = int((calories * fat_ratio) / 9)
        
        return {
            "status": "success",
            "bmr": int(bmr),
            "tdee": int(tdee),
            "daily_calories": calories,
            "macros": {
                "protein_g": protein_g,
                "carbs_g": carbs_g,
                "fats_g": fats_g
            },
            "ratios": {
                "protein": f"{int(protein_ratio * 100)}%",
                "carbs": f"{int(carb_ratio * 100)}%",
                "fats": f"{int(fat_ratio * 100)}%"
            },
            "recommendations": {
                "protein_per_kg": round(protein_g / weight_kg, 1),
                "water_liters": round(weight_kg * 0.035, 1),
                "fiber_g": 25 if gender == "female" else 35
            }
        }
    
    async def _generate_meal_plan(
        self,
        calories: int,
        protein_g: int,
        carbs_g: int,
        fats_g: int,
        meals_per_day: int = 3,
        dietary_restrictions: List[str] = None,
        preferences: List[str] = None
    ) -> Dict[str, Any]:
        """Generate a personalized meal plan"""
        dietary_restrictions = dietary_restrictions or []
        preferences = preferences or []
        
        # Calculate per-meal macros
        if meals_per_day == 3:
            meal_distribution = {"breakfast": 0.25, "lunch": 0.35, "dinner": 0.35, "snacks": 0.05}
        elif meals_per_day == 4:
            meal_distribution = {"breakfast": 0.25, "lunch": 0.30, "snack": 0.15, "dinner": 0.30}
        elif meals_per_day == 5:
            meal_distribution = {"breakfast": 0.20, "snack1": 0.15, "lunch": 0.25, "snack2": 0.15, "dinner": 0.25}
        else:
            meal_distribution = {"meal1": 0.33, "meal2": 0.34, "meal3": 0.33}
        
        # Generate sample meal plan
        meal_plan = {
            "daily_targets": {
                "calories": calories,
                "protein_g": protein_g,
                "carbs_g": carbs_g,
                "fats_g": fats_g
            },
            "meals": {}
        }
        
        # Sample meals (in production, would use a food database)
        sample_meals = {
            "breakfast": {
                "name": "Power Breakfast Bowl",
                "foods": ["Oatmeal (1 cup)", "Greek yogurt (150g)", "Berries (100g)", "Almonds (20g)"],
                "macros": {"calories": 450, "protein": 25, "carbs": 55, "fats": 15}
            },
            "lunch": {
                "name": "Grilled Chicken Salad",
                "foods": ["Grilled chicken (150g)", "Mixed greens (200g)", "Quinoa (100g)", "Olive oil (15ml)"],
                "macros": {"calories": 520, "protein": 45, "carbs": 40, "fats": 18}
            },
            "dinner": {
                "name": "Salmon with Sweet Potato",
                "foods": ["Salmon (150g)", "Sweet potato (200g)", "Broccoli (150g)", "Avocado (50g)"],
                "macros": {"calories": 550, "protein": 40, "carbs": 45, "fats": 22}
            },
            "snack": {
                "name": "Protein Smoothie",
                "foods": ["Protein powder (30g)", "Banana (100g)", "Almond milk (250ml)", "Peanut butter (15g)"],
                "macros": {"calories": 320, "protein": 28, "carbs": 35, "fats": 10}
            }
        }
        
        # Build meal plan
        for meal_time, ratio in meal_distribution.items():
            if "snack" in meal_time:
                meal_template = sample_meals["snack"]
            else:
                meal_template = sample_meals.get(meal_time, sample_meals["lunch"])
            
            meal_plan["meals"][meal_time] = {
                "name": meal_template["name"],
                "foods": meal_template["foods"],
                "target_macros": {
                    "calories": int(calories * ratio),
                    "protein_g": int(protein_g * ratio),
                    "carbs_g": int(carbs_g * ratio),
                    "fats_g": int(fats_g * ratio)
                },
                "actual_macros": meal_template["macros"]
            }
        
        meal_plan["dietary_notes"] = f"Plan accommodates: {', '.join(dietary_restrictions) if dietary_restrictions else 'No restrictions'}"
        meal_plan["prep_time_total"] = "2-3 hours per week"
        
        return meal_plan
    
    async def _analyze_meal_nutrition(self, meal_description: str, portion_size: str = "standard") -> Dict[str, Any]:
        """Analyze nutritional content of a meal"""
        # In production, would use nutrition API or database
        # For now, provide estimated analysis
        
        # Simple keyword-based estimation
        protein_keywords = ["chicken", "fish", "beef", "eggs", "tofu", "beans", "protein"]
        carb_keywords = ["rice", "pasta", "bread", "potato", "oats", "quinoa"]
        fat_keywords = ["oil", "butter", "nuts", "avocado", "cheese", "salmon"]
        
        description_lower = meal_description.lower()
        
        # Estimate macros based on keywords
        protein_score = sum(1 for keyword in protein_keywords if keyword in description_lower)
        carb_score = sum(1 for keyword in carb_keywords if keyword in description_lower)
        fat_score = sum(1 for keyword in fat_keywords if keyword in description_lower)
        
        # Base estimates
        estimated_calories = 400 + (protein_score * 100) + (carb_score * 80) + (fat_score * 90)
        estimated_protein = 20 + (protein_score * 25)
        estimated_carbs = 30 + (carb_score * 30)
        estimated_fats = 10 + (fat_score * 10)
        
        # Adjust for portion size
        if "large" in portion_size.lower():
            multiplier = 1.5
        elif "small" in portion_size.lower():
            multiplier = 0.75
        else:
            multiplier = 1.0
        
        return {
            "meal": meal_description,
            "portion_size": portion_size,
            "estimated_nutrition": {
                "calories": int(estimated_calories * multiplier),
                "protein_g": int(estimated_protein * multiplier),
                "carbs_g": int(estimated_carbs * multiplier),
                "fats_g": int(estimated_fats * multiplier)
            },
            "analysis": {
                "protein_quality": "high" if protein_score >= 2 else "moderate",
                "carb_type": "complex" if any(word in description_lower for word in ["whole", "brown", "quinoa"]) else "simple",
                "healthy_fats": "yes" if any(word in description_lower for word in ["avocado", "nuts", "olive", "salmon"]) else "limited"
            },
            "suggestions": self._get_meal_suggestions(protein_score, carb_score, fat_score)
        }
    
    async def _suggest_meal_timing(
        self,
        workout_time: str,
        workout_type: str,
        workout_duration: int = 60
    ) -> Dict[str, Any]:
        """Suggest optimal meal timing around workouts"""
        # Parse workout time
        hour = int(workout_time.split(":")[0])
        is_morning = hour < 12
        is_evening = hour >= 17
        
        recommendations = {
            "workout_time": workout_time,
            "workout_type": workout_type,
            "pre_workout": {},
            "post_workout": {},
            "hydration": {}
        }
        
        # Pre-workout nutrition
        if is_morning:
            recommendations["pre_workout"] = {
                "timing": "30-45 minutes before",
                "foods": ["Banana with almond butter", "Oatmeal with berries", "Toast with honey"],
                "avoid": ["High fat foods", "High fiber foods", "Large meals"],
                "focus": "Quick energy from carbs"
            }
        else:
            recommendations["pre_workout"] = {
                "timing": "2-3 hours before",
                "foods": ["Chicken with rice", "Pasta with lean protein", "Sweet potato with turkey"],
                "avoid": ["Fried foods", "High fat meals", "Excessive fiber"],
                "focus": "Balanced meal with carbs and protein"
            }
        
        # Post-workout nutrition
        if workout_type in ["strength", "hiit"]:
            recommendations["post_workout"] = {
                "timing": "Within 30-60 minutes",
                "foods": ["Protein shake with banana", "Greek yogurt with granola", "Chicken breast with white rice"],
                "protein_target": "25-40g",
                "carb_target": "30-50g",
                "focus": "Muscle recovery and glycogen replenishment"
            }
        else:  # cardio, endurance
            recommendations["post_workout"] = {
                "timing": "Within 45-90 minutes",
                "foods": ["Smoothie with protein", "Whole grain sandwich with turkey", "Quinoa bowl with vegetables"],
                "protein_target": "15-25g",
                "carb_target": "40-60g",
                "focus": "Energy restoration and recovery"
            }
        
        # Hydration
        recommendations["hydration"] = {
            "before": "500ml 2 hours before",
            "during": f"{150 * (workout_duration / 60)}ml per hour",
            "after": "150% of fluid lost (weigh yourself before/after)",
            "electrolytes": "Needed if workout > 60 minutes or high intensity"
        }
        
        return recommendations
    
    async def _recommend_supplements(
        self,
        goals: List[str],
        diet_type: str = "omnivore",
        health_conditions: List[str] = None
    ) -> Dict[str, Any]:
        """Recommend appropriate supplements"""
        health_conditions = health_conditions or []
        
        supplements = {
            "essential": [],
            "performance": [],
            "health": [],
            "considerations": []
        }
        
        # Essential supplements based on diet
        if diet_type in ["vegan", "vegetarian"]:
            supplements["essential"].append({
                "name": "Vitamin B12",
                "dosage": "2.4mcg daily",
                "reason": "Not found in plant foods"
            })
            supplements["essential"].append({
                "name": "Vitamin D3",
                "dosage": "1000-2000 IU daily",
                "reason": "Limited plant sources"
            })
        
        # Goal-based supplements
        if "muscle_gain" in goals or "strength" in goals:
            supplements["performance"].append({
                "name": "Creatine Monohydrate",
                "dosage": "5g daily",
                "reason": "Proven for strength and muscle gains"
            })
            supplements["performance"].append({
                "name": "Whey Protein",
                "dosage": "25-50g post-workout",
                "reason": "Convenient protein source for muscle recovery"
            })
        
        if "endurance" in goals:
            supplements["performance"].append({
                "name": "Beta-Alanine",
                "dosage": "3-5g daily",
                "reason": "Improves muscular endurance"
            })
        
        if "weight_loss" in goals:
            supplements["health"].append({
                "name": "Green Tea Extract",
                "dosage": "250-500mg daily",
                "reason": "May support metabolism"
            })
        
        # General health
        supplements["health"].append({
            "name": "Omega-3 Fatty Acids",
            "dosage": "1-2g EPA/DHA daily",
            "reason": "Anti-inflammatory, heart health"
        })
        
        supplements["health"].append({
            "name": "Magnesium",
            "dosage": "200-400mg daily",
            "reason": "Muscle function, sleep quality"
        })
        
        # Considerations
        if health_conditions:
            supplements["considerations"].append(
                "Consult healthcare provider due to existing health conditions"
            )
        
        supplements["considerations"].extend([
            "Start with essential supplements first",
            "Introduce one supplement at a time",
            "Quality matters - choose third-party tested products",
            "Supplements complement, not replace, a balanced diet"
        ])
        
        return supplements
    
    async def _create_shopping_list(
        self,
        meal_plan: Dict[str, Any],
        servings: int = 1,
        budget: str = "moderate"
    ) -> Dict[str, Any]:
        """Generate shopping list from meal plan"""
        shopping_list = {
            "proteins": [],
            "grains": [],
            "vegetables": [],
            "fruits": [],
            "dairy": [],
            "fats": [],
            "pantry": [],
            "estimated_cost": {}
        }
        
        # Extract all foods from meal plan
        all_foods = []
        for meal in meal_plan.get("meals", {}).values():
            all_foods.extend(meal.get("foods", []))
        
        # Categorize foods (simplified)
        for food in all_foods:
            food_lower = food.lower()
            if any(protein in food_lower for protein in ["chicken", "fish", "beef", "eggs", "tofu"]):
                shopping_list["proteins"].append(food)
            elif any(grain in food_lower for grain in ["rice", "pasta", "bread", "oats", "quinoa"]):
                shopping_list["grains"].append(food)
            elif any(veg in food_lower for veg in ["broccoli", "spinach", "lettuce", "tomato"]):
                shopping_list["vegetables"].append(food)
            elif any(fruit in food_lower for fruit in ["apple", "banana", "berries", "orange"]):
                shopping_list["fruits"].append(food)
            elif any(dairy in food_lower for dairy in ["milk", "yogurt", "cheese"]):
                shopping_list["dairy"].append(food)
            elif any(fat in food_lower for fat in ["oil", "nuts", "avocado", "butter"]):
                shopping_list["fats"].append(food)
            else:
                shopping_list["pantry"].append(food)
        
        # Adjust quantities for servings
        for category in shopping_list:
            if category != "estimated_cost" and shopping_list[category]:
                shopping_list[category] = [f"{item} x{servings}" for item in shopping_list[category]]
        
        # Estimate costs based on budget
        cost_multipliers = {"budget": 0.8, "moderate": 1.0, "premium": 1.5}
        base_cost = len(all_foods) * 3  # $3 average per item
        shopping_list["estimated_cost"] = {
            "total": f"${int(base_cost * servings * cost_multipliers.get(budget, 1.0))}",
            "per_serving": f"${int(base_cost * cost_multipliers.get(budget, 1.0))}",
            "budget_level": budget
        }
        
        # Add shopping tips
        shopping_list["tips"] = [
            "Buy proteins in bulk and freeze portions",
            "Choose seasonal vegetables for better prices",
            "Prep vegetables after shopping to save time later",
            "Store herbs properly to extend freshness"
        ]
        
        return shopping_list
    
    def _get_meal_suggestions(self, protein_score: int, carb_score: int, fat_score: int) -> List[str]:
        """Get meal improvement suggestions based on macro scores"""
        suggestions = []
        
        if protein_score < 1:
            suggestions.append("Consider adding a protein source like chicken, fish, tofu, or legumes")
        if carb_score < 1:
            suggestions.append("Add complex carbohydrates like quinoa, sweet potato, or whole grains")
        if fat_score < 1:
            suggestions.append("Include healthy fats from nuts, seeds, avocado, or olive oil")
        
        if not suggestions:
            suggestions.append("Well-balanced meal! Good macro distribution")
        
        return suggestions
    
    async def proactive_meal_planning(self, user_id: str, training_schedule: Dict[str, Any]) -> Dict[str, Any]:
        """AI-driven meal planning based on training schedule"""
        context = {
            "user_id": user_id,
            "training_schedule": training_schedule,
            "planning_request": "Create optimal meal plan for training days"
        }
        
        response = await self.send_message(
            "Based on the training schedule, create an optimized meal plan that supports performance and recovery",
            context
        )
        
        return {
            "meal_plan": response,
            "agent": "Nutrition Specialist",
            "timestamp": datetime.now().isoformat()
        }