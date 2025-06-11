"""
Multi-Agent Coordinator using OpenAI SDK
Orchestrates all specialized fitness agents for comprehensive coaching
"""
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import json
import asyncio
from enum import Enum
from dataclasses import dataclass, asdict

from agents.openai_fitness_coach_agent import OpenAIFitnessCoachAgent, CoachPersonality
from agents.nutrition_specialist_agent import NutritionSpecialistAgent
from agents.recovery_wellness_agent import RecoveryWellnessAgent
from agents.goal_achievement_agent import GoalAchievementAgent
from agents.form_safety_agent import FormSafetyAgent
from agents.fitness_action_agent import FitnessActionAgent
from agents.ai_action_extractor import ai_action_extractor
from utils.logger import setup_logger
from utils.cache_manager import response_cache
from services.conversation_service import conversation_service

logger = setup_logger(__name__)

class AgentType(Enum):
    PRIMARY_COACH = "primary_coach"
    NUTRITION = "nutrition"
    RECOVERY = "recovery"
    GOAL = "goal"
    FORM_SAFETY = "form_safety"
    FITNESS_ACTION = "fitness_action"

@dataclass
class AgentResponse:
    agent_type: AgentType
    message: str
    confidence: float
    recommendations: List[str]
    data: Dict[str, Any]
    timestamp: datetime

@dataclass
class CoordinatedResponse:
    primary_message: str
    agent_insights: List[AgentResponse]
    consensus_recommendations: List[str]
    action_items: List[Dict[str, Any]]
    conflicts_resolved: List[str]
    confidence_score: float
    responding_agents: List[Dict[str, str]]  # Which agents responded

class MultiAgentCoordinator:
    """
    Coordinates multiple specialized agents for comprehensive fitness coaching
    """
    
    def __init__(self, api_key: str, user_id: str, primary_personality: str = CoachPersonality.SUPPORTIVE):
        self.api_key = api_key
        self.user_id = user_id
        self.primary_personality = primary_personality
        
        # Initialize all agents
        self._initialize_agents()
        
        # Coordination settings
        self.consensus_threshold = 0.7  # 70% agreement needed
        self.conflict_resolution_strategy = "weighted_consensus"
        
    def _initialize_agents(self):
        """Initialize all specialized agents"""
        logger.info(f"Initializing multi-agent system for user {self.user_id}")
        
        # Primary fitness coach
        self.primary_coach = OpenAIFitnessCoachAgent(
            api_key=self.api_key,
            user_id=self.user_id,
            personality=self.primary_personality
        )
        
        # Specialized agents
        self.nutrition_agent = NutritionSpecialistAgent(
            api_key=self.api_key,
            user_id=self.user_id
        )
        
        self.recovery_agent = RecoveryWellnessAgent(
            api_key=self.api_key,
            user_id=self.user_id
        )
        
        self.goal_agent = GoalAchievementAgent(
            api_key=self.api_key,
            user_id=self.user_id
        )
        
        self.form_safety_agent = FormSafetyAgent(
            api_key=self.api_key,
            user_id=self.user_id
        )
        
        self.fitness_action_agent = FitnessActionAgent(
            api_key=self.api_key,
            user_id=self.user_id
        )
        
        self.agents = {
            AgentType.PRIMARY_COACH: self.primary_coach,
            AgentType.NUTRITION: self.nutrition_agent,
            AgentType.RECOVERY: self.recovery_agent,
            AgentType.GOAL: self.goal_agent,
            AgentType.FORM_SAFETY: self.form_safety_agent,
            AgentType.FITNESS_ACTION: self.fitness_action_agent
        }
        
        logger.info("All agents initialized successfully")
    
    async def _get_workout_timeline(self) -> Dict[str, Any]:
        """Fetch current workout timeline from fitness action agent"""
        try:
            # Use the fitness action agent to get the timeline
            timeline_data = await self.fitness_action_agent.get_workout_timeline()
            return timeline_data
        except Exception as e:
            logger.error(f"Error fetching workout timeline: {e}")
            return {"error": "Unable to fetch workout timeline"}
    
    async def process_user_query(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        required_agents: Optional[List[AgentType]] = None
    ) -> CoordinatedResponse:
        """
        Process user query through multiple agents and coordinate responses
        
        Args:
            query: User's question or request
            context: Additional context (workout history, goals, etc.)
            required_agents: Specific agents to consult (None = auto-determine)
            
        Returns:
            Coordinated response from all relevant agents
        """
        try:
            # Add message to conversation history
            conversation_service.add_message(self.user_id, "user", query, context)
            
            # Get full user context including conversation history
            full_context = conversation_service.get_user_context(self.user_id)
            
            # Fetch workout timeline to include in context
            timeline_data = await self._get_workout_timeline()
            
            # Enhance context with timeline data and conversation history
            if context is None:
                context = {}
            context.update(full_context)
            context["workout_timeline"] = timeline_data
            
            # Log the complete context being sent
            logger.info(f"Complete context for query '{query[:50]}...':")
            logger.info(f"Context keys: {list(context.keys())}")
            if 'todaysWorkout' in context:
                logger.info(f"Today's workout: {context['todaysWorkout']}")
            
            # Store context for action extraction
            self._current_context = context
            
            # Determine which agents to consult
            agents_to_consult = required_agents or await self._determine_relevant_agents(query, context)
            
            logger.info(f"Consulting agents: {[agent.value for agent in agents_to_consult]}")
            
            # Gather responses from all relevant agents in parallel
            agent_responses = await self._gather_agent_responses(query, context, agents_to_consult)
            
            # Analyze and coordinate responses
            coordinated = await self._coordinate_responses(agent_responses, query, agents_to_consult)
            
            # Save AI response to conversation history
            conversation_service.add_message(
                self.user_id, 
                "assistant", 
                coordinated.primary_message,
                {
                    "agent_count": len(coordinated.responding_agents),
                    "action_items": len(coordinated.action_items)
                }
            )
            
            return coordinated
            
        except Exception as e:
            logger.error(f"Error in multi-agent coordination: {str(e)}")
            raise
    
    async def _determine_relevant_agents(self, query: str, context: Optional[Dict[str, Any]]) -> List[AgentType]:
        """Determine which agents should be consulted based on query"""
        query_lower = query.lower()
        relevant_agents = []
        
        # Use AI for intelligent routing if we have a primary coach
        if hasattr(self, 'agents') and AgentType.PRIMARY_COACH in self.agents:
            try:
                # Ask the primary coach to analyze and route
                # Safely serialize context
                try:
                    context_str = json.dumps(context, default=str) if context else 'None'
                except Exception as e:
                    logger.warning(f"Failed to serialize context: {e}")
                    context_str = str(context) if context else 'None'
                
                routing_prompt = f"""Analyze this user query and determine which specialized agents should handle it:

Query: "{query}"

Available agents and their responsibilities:

1. FITNESS_ACTION: 
   - Creating, modifying, rescheduling workouts
   - Adding/removing exercises
   - Adjusting sets, reps, weights
   - Planning workout schedules
   - "What's my workout today/tomorrow/this week"
   - "Add leg day", "Remove squats", "Change to 3 sets"
   - Analyzing user stats and suggesting personalized workouts
   - "Suggest workouts based on my progress"
   - "What should I focus on this week?"
   - "Swap today's workout with something else"
   
PRIMARY_COACH (always handles):
   - Stats queries ("what are my stats", "calories burned", "how many workouts")
   - Progress analysis ("am I improving", "show my progress")
   - General fitness questions
   - Complex queries requiring data analysis

2. NUTRITION:
   - Diet plans, meal suggestions
   - Macros, calories, supplements
   - Pre/post workout nutrition
   - Digestive issues, food allergies
   - Weight management (gain/loss)
   - Hydration strategies
   - "What should I eat", "I'm bloated", "Need more protein"

3. RECOVERY:
   - Rest days, sleep optimization
   - Stress management, mental health
   - General fatigue, overtraining
   - Recovery techniques (stretching, foam rolling)
   - Non-exercise related pain/discomfort
   - Energy levels, burnout
   - "I'm exhausted", "Can't sleep", "Feeling stressed"

4. GOAL:
   - Setting fitness goals
   - Tracking progress, milestones
   - Motivation, plateaus
   - Long-term planning
   - Performance metrics
   - "Want to lose 20 pounds", "Training for marathon"

5. FORM_SAFETY:
   - Exercise technique, proper form
   - Injury prevention/management
   - Exercise-induced pain
   - Movement assessments
   - Safety modifications
   - "My knee hurts during squats", "Is my form correct"

Special routing rules:
- Questions about specific exercises → FITNESS_ACTION + FORM_SAFETY
- Pain queries:
  * Stomach/digestive pain → NUTRITION (+ RECOVERY if stress-related)
  * Joint/muscle pain during exercise → FORM_SAFETY
  * General body aches/fatigue → RECOVERY
  * Headaches → RECOVERY (unless exercise-induced → FORM_SAFETY)
- "I feel..." queries:
  * Tired/exhausted/drained → RECOVERY
  * Weak/unmotivated → RECOVERY + GOAL
  * Sore from workout → RECOVERY (+ FORM_SAFETY if excessive)
  * Hungry/full/bloated → NUTRITION
- Time-based queries ("today", "tomorrow", "this week") → FITNESS_ACTION
- Multiple topics → Include all relevant agents
- Vague queries → Include PRIMARY_COACH for clarification

Context from conversation: {context_str}

Analyze the query carefully. Consider:
1. Primary intent (what they're asking for)
2. Secondary concerns (underlying issues)
3. Implied needs (what might help but wasn't asked)

Return ONLY a JSON array of agent types needed, e.g., ["NUTRITION", "RECOVERY"]
If unsure, include multiple relevant agents. PRIMARY_COACH will be included automatically.
"""
                
                response = await self.agents[AgentType.PRIMARY_COACH].send_message(routing_prompt)
                
                # Parse the response to get agent list
                import re
                
                # Extract JSON from response
                json_match = re.search(r'\[.*?\]', response)
                if json_match:
                    agent_names = json.loads(json_match.group())
                    for name in agent_names:
                        try:
                            agent_type = AgentType[name.upper()]
                            if agent_type not in relevant_agents:
                                relevant_agents.append(agent_type)
                        except KeyError:
                            logger.warning(f"Unknown agent type suggested: {name}")
                
            except Exception as e:
                logger.warning(f"AI routing failed, falling back to keyword-based: {e}")
        
        # Only include primary coach if not in single agent mode
        if context and context.get('single_agent_mode'):
            # In single agent mode, don't add primary coach unless explicitly requested
            pass
        else:
            # Always include primary coach in normal mode
            if AgentType.PRIMARY_COACH not in relevant_agents:
                relevant_agents.insert(0, AgentType.PRIMARY_COACH)
        
        # Fallback to keyword-based if AI routing fails or no other agents suggested
        if len(relevant_agents) == 0 or (len(relevant_agents) == 1 and not context.get('single_agent_mode')):
            
            # Simple keyword-based backup
            nutrition_keywords = ["eat", "diet", "nutrition", "meal", "food", "macro", "calorie", "protein", "supplement", "stomach", "digest"]
            recovery_keywords = ["recover", "sleep", "tired", "sore", "rest", "stress", "fatigue", "hrv"]
            goal_keywords = ["goal", "progress", "achieve", "target", "milestone", "improve", "plateau"]
            safety_keywords = ["form", "injury", "hurt", "safe", "technique", "correct", "proper"]
            action_keywords = ["workout", "exercise", "add", "remove", "modify", "change", "schedule", "plan", "today", "tomorrow", "week", "create", "update", "reschedule"]
            
            # Special handling for pain
            if "pain" in query_lower:
                if "stomach" in query_lower or "abdomen" in query_lower:
                    # Stomach pain -> nutrition or recovery, not form safety
                    relevant_agents.append(AgentType.NUTRITION)
                    relevant_agents.append(AgentType.RECOVERY)
                elif any(body_part in query_lower for body_part in ["knee", "back", "shoulder", "ankle", "wrist", "elbow"]):
                    # Joint pain -> form safety
                    relevant_agents.append(AgentType.FORM_SAFETY)
                else:
                    # General pain -> recovery
                    relevant_agents.append(AgentType.RECOVERY)
            else:
                # Normal keyword matching
                if any(keyword in query_lower for keyword in nutrition_keywords):
                    relevant_agents.append(AgentType.NUTRITION)
                
                if any(keyword in query_lower for keyword in recovery_keywords):
                    relevant_agents.append(AgentType.RECOVERY)
                
                if any(keyword in query_lower for keyword in goal_keywords):
                    relevant_agents.append(AgentType.GOAL)
                
                if any(keyword in query_lower for keyword in safety_keywords):
                    relevant_agents.append(AgentType.FORM_SAFETY)
                
                if any(keyword in query_lower for keyword in action_keywords):
                    relevant_agents.append(AgentType.FITNESS_ACTION)
        
        # Context-based selection
        if context:
            if context.get("request_type") == "comprehensive_assessment":
                relevant_agents = list(AgentType)  # All agents
            elif context.get("pain_reported") or context.get("injury_concern"):
                if AgentType.FORM_SAFETY not in relevant_agents:
                    relevant_agents.append(AgentType.FORM_SAFETY)
                if AgentType.RECOVERY not in relevant_agents:
                    relevant_agents.append(AgentType.RECOVERY)
        
        return relevant_agents
    
    async def _gather_agent_responses(
        self,
        query: str,
        context: Optional[Dict[str, Any]],
        agents_to_consult: List[AgentType]
    ) -> List[AgentResponse]:
        """Gather responses from multiple agents in parallel"""
        
        async def get_agent_response(agent_type: AgentType) -> AgentResponse:
            agent = self.agents[agent_type]
            
            # Prepare agent-specific context
            agent_context = {
                "user_query": query,
                "general_context": context or {},
                "agent_role": agent_type.value,
                "coordination_mode": True
            }
            
            try:
                # Check cache first
                cached_response = response_cache.get(agent_type.value, query, agent_context)
                if cached_response:
                    logger.info(f"Cache hit for {agent_type.value}")
                    return cached_response
                
                # Get response from agent
                response = await agent.send_message(query, agent_context)
                
                # Parse structured data if available
                data = {}
                recommendations = []
                
                # Extract recommendations and data from response
                if "recommend" in response.lower():
                    # Simple extraction - in production would use more sophisticated parsing
                    recommendations = [response]
                
                agent_response = AgentResponse(
                    agent_type=agent_type,
                    message=response,
                    confidence=0.8,  # Default confidence
                    recommendations=recommendations,
                    data=data,
                    timestamp=datetime.now()
                )
                
                # Cache the response
                response_cache.set(agent_type.value, query, agent_response, agent_context)
                
                return agent_response
                
            except Exception as e:
                logger.error(f"Error getting response from {agent_type.value}: {str(e)}")
                return AgentResponse(
                    agent_type=agent_type,
                    message=f"Error consulting {agent_type.value} specialist",
                    confidence=0.0,
                    recommendations=[],
                    data={"error": str(e)},
                    timestamp=datetime.now()
                )
        
        # Gather all responses in parallel with timeout
        try:
            responses = await asyncio.wait_for(
                asyncio.gather(*[
                    get_agent_response(agent_type) for agent_type in agents_to_consult
                ]),
                timeout=25.0  # 25 second timeout
            )
        except asyncio.TimeoutError:
            logger.error("Agent responses timed out after 25 seconds")
            # Return partial responses if available
            responses = []
            for agent_type in agents_to_consult:
                responses.append(AgentResponse(
                    agent_type=agent_type,
                    message=f"{agent_type.value} response timed out",
                    confidence=0.0,
                    recommendations=[],
                    data={"error": "timeout"},
                    timestamp=datetime.now()
                ))
        
        return responses
    
    async def _coordinate_responses(self, agent_responses: List[AgentResponse], original_query: str, agents_consulted: List[AgentType]) -> CoordinatedResponse:
        """Coordinate and synthesize responses from multiple agents"""
        
        # Extract primary coach response (always present)
        primary_response = next(
            (r for r in agent_responses if r.agent_type == AgentType.PRIMARY_COACH),
            None
        )
        
        if not primary_response:
            raise ValueError("Primary coach response missing")
        
        # Analyze responses for consensus and conflicts
        consensus_items, conflicts = await self._analyze_agent_consensus(agent_responses)
        
        # Resolve conflicts if any
        resolved_conflicts = []
        if conflicts:
            resolved_conflicts = await self._resolve_conflicts(conflicts, agent_responses)
        
        # Generate action items from all agents
        action_items = self._extract_action_items(agent_responses)
        
        # Calculate overall confidence
        confidence_score = self._calculate_confidence(agent_responses)
        
        # Create list of responding agents for user visibility
        responding_agents = self._format_responding_agents(agent_responses)
        
        # Create coordinated response
        coordinated = CoordinatedResponse(
            primary_message=primary_response.message,
            agent_insights=agent_responses,
            consensus_recommendations=consensus_items,
            action_items=action_items,
            conflicts_resolved=resolved_conflicts,
            confidence_score=confidence_score,
            responding_agents=responding_agents
        )
        
        return coordinated
    
    async def _analyze_agent_consensus(self, responses: List[AgentResponse]) -> Tuple[List[str], List[Dict[str, Any]]]:
        """Analyze agent responses for consensus and conflicts"""
        consensus_items = []
        conflicts = []
        
        # Group similar recommendations
        recommendation_groups = {}
        for response in responses:
            for rec in response.recommendations:
                # Simple similarity check - in production would use embeddings
                key = rec.lower()[:30]  # First 30 chars as key
                if key not in recommendation_groups:
                    recommendation_groups[key] = []
                recommendation_groups[key].append({
                    "agent": response.agent_type,
                    "recommendation": rec,
                    "confidence": response.confidence
                })
        
        # Determine consensus
        for key, group in recommendation_groups.items():
            if len(group) >= len(responses) * self.consensus_threshold:
                consensus_items.append(group[0]["recommendation"])
            elif len(group) > 1:
                # Conflict detected
                conflicts.append({
                    "topic": key,
                    "conflicting_views": group
                })
        
        return consensus_items, conflicts
    
    async def _resolve_conflicts(self, conflicts: List[Dict[str, Any]], all_responses: List[AgentResponse]) -> List[str]:
        """Resolve conflicts between agent recommendations"""
        resolved = []
        
        for conflict in conflicts:
            if self.conflict_resolution_strategy == "weighted_consensus":
                # Weight by agent confidence and specialization
                best_recommendation = max(
                    conflict["conflicting_views"],
                    key=lambda x: x["confidence"]
                )
                resolved.append(f"Resolved: {best_recommendation['recommendation']} (based on highest confidence)")
                
            elif self.conflict_resolution_strategy == "primary_coach_override":
                # Primary coach has final say
                primary_view = next(
                    (v for v in conflict["conflicting_views"] if v["agent"] == AgentType.PRIMARY_COACH),
                    None
                )
                if primary_view:
                    resolved.append(f"Resolved: {primary_view['recommendation']} (primary coach decision)")
                    
        return resolved
    
    def _extract_action_items(self, responses: List[AgentResponse]) -> List[Dict[str, Any]]:
        """Extract actionable items from all agent responses using AI"""
        all_action_items = []
        
        # Get context from the conversation
        context = getattr(self, '_current_context', {})
        
        # Use AI action extractor for each agent response
        for response in responses:
            # Extract actions using AI
            extracted_actions = ai_action_extractor.extract_actions(
                message=response.message,
                agent_type=response.agent_type.value,
                context=context
            )
            
            # Add agent-specific priority boost
            priority_boost = {
                AgentType.FORM_SAFETY: -2,      # Safety first (lower number = higher priority)
                AgentType.RECOVERY: -1,         # Recovery second
                AgentType.FITNESS_ACTION: 0,    # Fitness actions
                AgentType.PRIMARY_COACH: 1,     # General coaching
                AgentType.NUTRITION: 2,         # Nutrition
                AgentType.GOAL: 3              # Goal adjustments
            }.get(response.agent_type, 0)
            
            # Adjust priorities based on agent type
            for action in extracted_actions:
                action["priority"] = action.get("priority", 5) + priority_boost
                action["agent_confidence"] = response.confidence
                all_action_items.append(action)
        
        # Deduplicate actions - keep highest confidence version of each type
        action_map = {}
        for action in all_action_items:
            action_type = action["type"]
            if action_type not in action_map or action.get("confidence", 0) > action_map[action_type].get("confidence", 0):
                action_map[action_type] = action
        
        # Sort by priority and return as list
        final_actions = list(action_map.values())
        final_actions.sort(key=lambda x: (x.get("priority", 99), -x.get("confidence", 0)))
        
        # Log extracted actions for debugging
        logger.info(f"Extracted {len(final_actions)} actions from {len(responses)} agent responses")
        for action in final_actions:
            logger.debug(f"Action: {action['type']} - {action['label']} (priority: {action['priority']}, confidence: {action.get('confidence', 0)})")
        
        return final_actions[:5]  # Limit to 5 most relevant actions
    
    def _analyze_message_for_actions(self, message: str, agent_type: AgentType) -> List[str]:
        """Analyze message content to extract implied actions"""
        actions = []
        
        # Common action patterns
        action_patterns = {
            "add": ["add", "include", "incorporate", "put in"],
            "remove": ["remove", "take out", "delete", "skip"],
            "modify": ["change", "adjust", "modify", "update"],
            "schedule": ["schedule", "plan", "set up", "arrange"],
            "create": ["create", "make", "build", "design"],
            "view": ["show", "display", "view", "see"]
        }
        
        for action, keywords in action_patterns.items():
            if any(keyword in message for keyword in keywords):
                actions.append(action)
        
        return actions
    
    def _calculate_confidence(self, responses: List[AgentResponse]) -> float:
        """Calculate overall confidence score from all agents"""
        if not responses:
            return 0.0
        
        total_confidence = sum(r.confidence for r in responses)
        return round(total_confidence / len(responses), 2)
    
    def _format_responding_agents(self, responses: List[AgentResponse]) -> List[Dict[str, str]]:
        """Format agent information for user visibility"""
        agent_info = []
        
        # Map agent types to user-friendly names and descriptions
        agent_display_names = {
            AgentType.PRIMARY_COACH: "Primary Fitness Coach",
            AgentType.NUTRITION: "Nutrition Specialist",
            AgentType.RECOVERY: "Recovery & Wellness Expert",
            AgentType.GOAL: "Goal Achievement Strategist",
            AgentType.FORM_SAFETY: "Form & Safety Specialist",
            AgentType.FITNESS_ACTION: "Fitness Action Coordinator"
        }
        
        agent_emojis = {
            AgentType.PRIMARY_COACH: "💪",
            AgentType.NUTRITION: "🥗",
            AgentType.RECOVERY: "😴",
            AgentType.GOAL: "🎯",
            AgentType.FORM_SAFETY: "🛡️",
            AgentType.FITNESS_ACTION: "📋"
        }
        
        for response in responses:
            agent_info.append({
                "type": response.agent_type.value,
                "name": agent_display_names.get(response.agent_type, response.agent_type.value),
                "emoji": agent_emojis.get(response.agent_type, "🤖"),
                "confidence": f"{int(response.confidence * 100)}%"
            })
        
        return agent_info
    
    async def perform_comprehensive_assessment(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform comprehensive user assessment using all agents
        """
        logger.info(f"Performing comprehensive assessment for user {self.user_id}")
        
        assessment_query = """
        Please provide a comprehensive assessment of my current fitness status, including:
        1. Overall fitness evaluation
        2. Nutritional assessment and recommendations
        3. Recovery status and optimization strategies
        4. Goal progress and adjustments needed
        5. Form and safety considerations
        """
        
        context = {
            "request_type": "comprehensive_assessment",
            "user_data": user_data
        }
        
        # Get coordinated response from all agents
        coordinated_response = await self.process_user_query(
            assessment_query,
            context,
            list(AgentType)  # Use all agents
        )
        
        # Structure the comprehensive assessment
        assessment = {
            "timestamp": datetime.now().isoformat(),
            "overall_status": coordinated_response.primary_message,
            "specialist_insights": {},
            "key_recommendations": coordinated_response.consensus_recommendations,
            "action_plan": coordinated_response.action_items,
            "confidence_level": coordinated_response.confidence_score
        }
        
        # Organize specialist insights
        for response in coordinated_response.agent_insights:
            assessment["specialist_insights"][response.agent_type.value] = {
                "analysis": response.message,
                "confidence": response.confidence,
                "specific_recommendations": response.recommendations
            }
        
        return assessment
    
    async def handle_emergency_situation(self, situation: str, severity: str = "moderate") -> Dict[str, Any]:
        """
        Handle emergency situations (injury, severe pain, etc.) with appropriate agent coordination
        """
        logger.warning(f"Emergency situation reported: {situation} (severity: {severity})")
        
        emergency_context = {
            "emergency": True,
            "severity": severity,
            "situation": situation,
            "timestamp": datetime.now().isoformat()
        }
        
        # For emergencies, prioritize safety and recovery agents
        emergency_agents = [
            AgentType.PRIMARY_COACH,
            AgentType.FORM_SAFETY,
            AgentType.RECOVERY
        ]
        
        response = await self.process_user_query(
            f"URGENT: {situation}. What should I do immediately?",
            emergency_context,
            emergency_agents
        )
        
        # Extract immediate actions
        immediate_actions = [
            item for item in response.action_items 
            if item["source"] in ["form_safety", "recovery"]
        ]
        
        return {
            "status": "emergency_response",
            "immediate_actions": immediate_actions[:3],  # Top 3 immediate actions
            "full_guidance": response.primary_message,
            "specialist_advice": {
                r.agent_type.value: r.message 
                for r in response.agent_insights
            },
            "follow_up_required": True
        }
    
    def cleanup(self):
        """Clean up all agent resources"""
        logger.info("Cleaning up multi-agent system")
        
        for agent_type, agent in self.agents.items():
            try:
                agent.cleanup()
                logger.info(f"Cleaned up {agent_type.value} agent")
            except Exception as e:
                logger.error(f"Error cleaning up {agent_type.value}: {e}")
    
    async def get_agent_specialization_info(self) -> Dict[str, Any]:
        """Get information about each agent's specialization and capabilities"""
        return {
            "agents": {
                AgentType.PRIMARY_COACH.value: {
                    "role": "Overall fitness guidance and coordination",
                    "specialties": ["Workout planning", "General fitness advice", "Motivation"],
                    "when_to_use": "General fitness questions and overall guidance"
                },
                AgentType.NUTRITION.value: {
                    "role": "Nutritional guidance and meal planning",
                    "specialties": ["Macro calculations", "Meal planning", "Supplementation"],
                    "when_to_use": "Diet, nutrition, and meal-related questions"
                },
                AgentType.RECOVERY.value: {
                    "role": "Recovery optimization and wellness",
                    "specialties": ["Sleep optimization", "Stress management", "Recovery protocols"],
                    "when_to_use": "Recovery, fatigue, sleep, and wellness concerns"
                },
                AgentType.GOAL.value: {
                    "role": "Goal setting and progress tracking",
                    "specialties": ["Goal analysis", "Progress prediction", "Motivation strategies"],
                    "when_to_use": "Goal setting, progress tracking, and motivation"
                },
                AgentType.FORM_SAFETY.value: {
                    "role": "Exercise form and injury prevention",
                    "specialties": ["Form analysis", "Injury prevention", "Exercise modifications"],
                    "when_to_use": "Form checks, pain, injuries, and safety concerns"
                }
            },
            "coordination_benefits": [
                "Comprehensive analysis from multiple perspectives",
                "Conflict resolution between different recommendations",
                "Prioritized action items based on safety and effectiveness",
                "Holistic approach to fitness coaching"
            ]
        }
    
    async def generate_weekly_summary(self, week_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive weekly summary using all agents"""
        summary_query = "Please provide a weekly summary and recommendations based on my progress."
        
        context = {
            "request_type": "weekly_summary",
            "week_data": week_data
        }
        
        response = await self.process_user_query(
            summary_query,
            context,
            list(AgentType)  # All agents contribute
        )
        
        return {
            "week_summary": response.primary_message,
            "specialist_summaries": {
                r.agent_type.value: r.message
                for r in response.agent_insights
            },
            "next_week_focus": response.consensus_recommendations[:5],
            "key_achievements": week_data.get("achievements", []),
            "areas_for_improvement": response.action_items[:5]
        }
    
    async def process_message(self, message: str, context: Optional[Dict[str, Any]] = None, agents_to_consult: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Process message and return a dictionary response (wrapper for process_user_query)
        """
        # Convert agent strings to AgentType enums
        agent_types = None
        if agents_to_consult:
            agent_types = []
            for agent_str in agents_to_consult:
                if agent_str == "primary_coach":
                    agent_types.append(AgentType.PRIMARY_COACH)
                elif agent_str == "fitness_action":
                    agent_types.append(AgentType.FITNESS_ACTION)
                elif agent_str == "nutrition":
                    agent_types.append(AgentType.NUTRITION)
                elif agent_str == "recovery":
                    agent_types.append(AgentType.RECOVERY)
                elif agent_str == "goal":
                    agent_types.append(AgentType.GOAL)
                elif agent_str == "form_safety":
                    agent_types.append(AgentType.FORM_SAFETY)
        
        # Get coordinated response
        response = await self.process_user_query(message, context, agent_types)
        
        # Convert to dictionary format expected by API
        return {
            "primary_message": response.primary_message,
            "agent_insights": [
                {
                    "agent": insight.agent_type.value,
                    "message": insight.message,
                    "confidence": insight.confidence,
                    "recommendations": insight.recommendations
                }
                for insight in response.agent_insights
            ],
            "consensus_recommendations": response.consensus_recommendations,
            "action_items": response.action_items,
            "confidence_score": response.confidence_score,
            "timestamp": datetime.now(),
            "responding_agents": response.responding_agents
        }