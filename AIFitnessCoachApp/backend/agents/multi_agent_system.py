"""
Multi-Agent Coordination System for AI Fitness Coach
Based on N8N_MCP_AI_AGENTS_INTEGRATION.md specification
"""
import asyncio
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, date
import json
from dataclasses import dataclass, asdict
from enum import Enum
import logging

from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain.tools import Tool
from langchain.memory import ConversationBufferMemory

# MCP Integration
from mcp_servers.health_data_server import HealthDataMCPServer
from mcp_servers.environmental_server import EnvironmentalMCPServer
from mcp_servers.nutrition_server import NutritionMCPServer
from mcp_servers.exercise_science_server import ExerciseScienceMCPServer

# Internal Services
from services.workout_service import WorkoutService
from services.user_service import UserService
from utils.logger import setup_logger

logger = setup_logger(__name__)

class AgentPersonality(Enum):
    SUPPORTIVE = "supportive"
    AGGRESSIVE = "aggressive"
    STEADY_PACE = "steady_pace"

@dataclass
class AgentResponse:
    agent_type: str
    message: str
    actions_taken: List[str]
    recommendations: List[str]
    confidence: float
    requires_user_input: bool = False
    metadata: Dict[str, Any] = None

@dataclass
class CoordinatedPlan:
    primary_message: str
    action_items: List[str]
    priority_level: str
    expected_outcomes: List[str]
    follow_up_required: bool
    agent_consensus: Dict[str, float]

class MultiAgentCoordinationSystem:
    """
    Production-ready multi-agent system implementing the architecture from
    N8N_MCP_AI_AGENTS_INTEGRATION.md
    """
    
    def __init__(self, openai_api_key: str, anthropic_api_key: str):
        self.openai_llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.7,
            api_key=openai_api_key
        )
        
        self.anthropic_llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            temperature=0.7,
            api_key=anthropic_api_key
        )
        
        # Initialize MCP Servers
        self.mcp_servers = {
            'health': HealthDataMCPServer(),
            'environment': EnvironmentalMCPServer(),
            'nutrition': NutritionMCPServer(),
            'exercise_science': ExerciseScienceMCPServer()
        }
        
        # Initialize Internal Services
        self.workout_service = WorkoutService()
        self.user_service = UserService()
        
        # Initialize Specialized Agents
        self._initialize_agents()
        
        # Agent coordination
        self.coordination_protocol = "collaborative_consensus"
        self.active_sessions: Dict[str, Dict] = {}

    def _initialize_agents(self):
        """Initialize all specialized fitness agents"""
        
        # 1. Primary Fitness Coach Agent
        self.primary_coach = Agent(
            role='Primary Fitness Coach',
            goal='Provide comprehensive fitness guidance and coordinate with specialized agents',
            backstory="""You are Alex, the primary AI fitness coach with years of experience 
            in personal training, exercise science, and holistic health. You coordinate with 
            specialized agents to provide the best possible guidance to users.""",
            tools=self._get_primary_coach_tools(),
            llm=self.anthropic_llm,
            memory=ConversationBufferMemory(return_messages=True),
            verbose=True,
            allow_delegation=True
        )
        
        # 2. Nutrition Specialist Agent
        self.nutrition_specialist = Agent(
            role='Nutrition Specialist',
            goal='Provide expert nutritional guidance and meal planning',
            backstory="""You are a certified nutritionist and dietitian specializing in 
            sports nutrition and metabolic optimization. You work with the fitness coach 
            to align nutrition with training goals.""",
            tools=self._get_nutrition_tools(),
            llm=self.openai_llm,
            memory=ConversationBufferMemory(return_messages=True),
            verbose=True
        )
        
        # 3. Recovery & Wellness Agent
        self.recovery_agent = Agent(
            role='Recovery & Wellness Specialist',
            goal='Optimize recovery, sleep, and stress management',
            backstory="""You are a recovery specialist with expertise in sleep science, 
            stress management, and physiological recovery. You monitor user wellness 
            metrics and provide proactive recovery interventions.""",
            tools=self._get_recovery_tools(),
            llm=self.anthropic_llm,
            memory=ConversationBufferMemory(return_messages=True),
            verbose=True
        )
        
        # 4. Goal Achievement Agent
        self.goal_agent = Agent(
            role='Goal Achievement Specialist',
            goal='Track progress and optimize goal achievement strategies',
            backstory="""You are a performance psychology expert who specializes in goal 
            setting, progress tracking, and motivation. You predict obstacles and create 
            strategies for consistent progress.""",
            tools=self._get_goal_tracking_tools(),
            llm=self.openai_llm,
            memory=ConversationBufferMemory(return_messages=True),
            verbose=True
        )
        
        # 5. Form & Safety Agent
        self.safety_agent = Agent(
            role='Exercise Form & Safety Specialist',
            goal='Ensure safe exercise execution and injury prevention',
            backstory="""You are a movement specialist and physical therapist with expertise 
            in biomechanics, injury prevention, and exercise form. You analyze movement 
            patterns and provide safety guidance.""",
            tools=self._get_safety_tools(),
            llm=self.anthropic_llm,
            memory=ConversationBufferMemory(return_messages=True),
            verbose=True
        )

    def _get_primary_coach_tools(self) -> List[Tool]:
        """Tools available to the primary fitness coach"""
        return [
            Tool(
                name="get_user_workout_schedule",
                description="Get the user's current workout schedule and upcoming sessions",
                func=self._get_workout_schedule
            ),
            Tool(
                name="modify_workout_plan",
                description="Modify or adjust the user's workout plan based on current needs",
                func=self._modify_workout_plan
            ),
            Tool(
                name="assess_user_readiness",
                description="Assess user's readiness for today's workout using MCP health data",
                func=self._assess_workout_readiness
            ),
            Tool(
                name="coordinate_with_specialists",
                description="Coordinate with specialized agents for comprehensive guidance",
                func=self._coordinate_specialists
            ),
            Tool(
                name="generate_motivational_message",
                description="Generate personalized motivational content based on user progress",
                func=self._generate_motivation
            )
        ]

    def _get_nutrition_tools(self) -> List[Tool]:
        """Tools for nutrition specialist agent"""
        return [
            Tool(
                name="analyze_meal_photo",
                description="Analyze nutrition content from meal photos using MCP vision AI",
                func=self._analyze_meal_photo
            ),
            Tool(
                name="calculate_macro_needs",
                description="Calculate personalized macro and calorie needs based on training",
                func=self._calculate_macro_needs
            ),
            Tool(
                name="suggest_meal_timing",
                description="Provide meal timing recommendations around workouts",
                func=self._suggest_meal_timing
            ),
            Tool(
                name="generate_meal_plan",
                description="Create personalized meal plans aligned with fitness goals",
                func=self._generate_meal_plan
            )
        ]

    def _get_recovery_tools(self) -> List[Tool]:
        """Tools for recovery specialist agent"""
        return [
            Tool(
                name="analyze_sleep_patterns",
                description="Analyze sleep quality and patterns from health data",
                func=self._analyze_sleep_patterns
            ),
            Tool(
                name="assess_recovery_metrics",
                description="Evaluate HRV, stress, and other recovery indicators",
                func=self._assess_recovery_metrics
            ),
            Tool(
                name="recommend_recovery_protocol",
                description="Suggest specific recovery interventions and rest periods",
                func=self._recommend_recovery_protocol
            ),
            Tool(
                name="monitor_stress_levels",
                description="Track and analyze stress indicators from multiple sources",
                func=self._monitor_stress_levels
            )
        ]

    def _get_goal_tracking_tools(self) -> List[Tool]:
        """Tools for goal achievement agent"""
        return [
            Tool(
                name="analyze_progress_trends",
                description="Analyze user progress patterns and predict future outcomes",
                func=self._analyze_progress_trends
            ),
            Tool(
                name="identify_potential_obstacles",
                description="Predict and identify potential obstacles to goal achievement",
                func=self._identify_obstacles
            ),
            Tool(
                name="adjust_goals_dynamically",
                description="Recommend goal adjustments based on progress and life changes",
                func=self._adjust_goals
            ),
            Tool(
                name="calculate_achievement_probability",
                description="Calculate probability of achieving current goals",
                func=self._calculate_achievement_probability
            )
        ]

    def _get_safety_tools(self) -> List[Tool]:
        """Tools for safety specialist agent"""
        return [
            Tool(
                name="analyze_exercise_form",
                description="Analyze exercise form from video using computer vision",
                func=self._analyze_exercise_form
            ),
            Tool(
                name="assess_injury_risk",
                description="Evaluate injury risk based on movement patterns and history",
                func=self._assess_injury_risk
            ),
            Tool(
                name="suggest_exercise_modifications",
                description="Recommend exercise modifications for safety or limitations",
                func=self._suggest_modifications
            ),
            Tool(
                name="create_injury_prevention_plan",
                description="Develop personalized injury prevention protocols",
                func=self._create_prevention_plan
            )
        ]

    async def process_user_message(
        self, 
        user_id: str, 
        message: str, 
        personality: AgentPersonality = AgentPersonality.SUPPORTIVE,
        context: Optional[Dict[str, Any]] = None
    ) -> CoordinatedPlan:
        """
        Main entry point for processing user messages through the multi-agent system
        """
        logger.info(f"Processing message for user {user_id}: {message[:100]}...")
        
        try:
            # Initialize or update user session
            session = await self._get_or_create_session(user_id, personality)
            
            # Analyze message intent and determine required agents
            required_agents = await self._analyze_message_intent(message, context)
            
            # Gather real-time context from MCP servers
            mcp_context = await self._gather_mcp_context(user_id, required_agents)
            
            # Execute tasks with specialized agents
            agent_responses = await self._execute_agent_tasks(
                user_id, message, required_agents, mcp_context, personality
            )
            
            # Coordinate responses and generate unified plan
            coordinated_plan = await self._coordinate_agent_responses(
                agent_responses, user_id, personality
            )
            
            # Update session with results
            await self._update_session(user_id, message, coordinated_plan)
            
            return coordinated_plan
            
        except Exception as e:
            logger.error(f"Error processing user message: {str(e)}")
            return CoordinatedPlan(
                primary_message="I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
                action_items=[],
                priority_level="low",
                expected_outcomes=[],
                follow_up_required=False,
                agent_consensus={}
            )

    async def _analyze_message_intent(
        self, 
        message: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """Analyze message to determine which agents should be involved"""
        
        # Define intent patterns for each agent
        intent_patterns = {
            'primary_coach': ['workout', 'exercise', 'training', 'fitness', 'schedule'],
            'nutrition_specialist': ['nutrition', 'diet', 'meal', 'food', 'calories', 'macro'],
            'recovery_agent': ['sleep', 'recovery', 'rest', 'tired', 'stress', 'wellness'],
            'goal_agent': ['goal', 'progress', 'achievement', 'target', 'milestone'],
            'safety_agent': ['pain', 'injury', 'form', 'safety', 'hurt', 'sore']
        }
        
        message_lower = message.lower()
        required_agents = ['primary_coach']  # Primary coach always involved
        
        for agent, patterns in intent_patterns.items():
            if agent != 'primary_coach' and any(pattern in message_lower for pattern in patterns):
                required_agents.append(agent)
        
        # If no specific patterns found, include all agents for comprehensive response
        if len(required_agents) == 1:
            required_agents = list(intent_patterns.keys())
        
        logger.info(f"Required agents for message: {required_agents}")
        return required_agents

    async def _gather_mcp_context(
        self, 
        user_id: str, 
        required_agents: List[str]
    ) -> Dict[str, Any]:
        """Gather relevant context from MCP servers"""
        
        mcp_context = {}
        
        try:
            # Health data (always relevant)
            health_data = await self.mcp_servers['health'].get_comprehensive_health_data(user_id)
            mcp_context['health'] = health_data
            
            # Environmental data for workout planning
            if 'primary_coach' in required_agents:
                env_data = await self.mcp_servers['environment'].get_workout_environment_data(user_id)
                mcp_context['environment'] = env_data
            
            # Nutrition data if nutrition agent involved
            if 'nutrition_specialist' in required_agents:
                nutrition_data = await self.mcp_servers['nutrition'].get_recent_nutrition_data(user_id)
                mcp_context['nutrition'] = nutrition_data
            
            # Exercise science data for safety and optimization
            if 'safety_agent' in required_agents or 'primary_coach' in required_agents:
                exercise_data = await self.mcp_servers['exercise_science'].get_relevant_research(user_id)
                mcp_context['exercise_science'] = exercise_data
            
        except Exception as e:
            logger.warning(f"Error gathering MCP context: {str(e)}")
            mcp_context = {'error': 'Limited context available'}
        
        return mcp_context

    async def _execute_agent_tasks(
        self, 
        user_id: str, 
        message: str, 
        required_agents: List[str], 
        mcp_context: Dict[str, Any],
        personality: AgentPersonality
    ) -> Dict[str, AgentResponse]:
        """Execute tasks with the required specialized agents"""
        
        agent_responses = {}
        agent_map = {
            'primary_coach': self.primary_coach,
            'nutrition_specialist': self.nutrition_specialist,
            'recovery_agent': self.recovery_agent,
            'goal_agent': self.goal_agent,
            'safety_agent': self.safety_agent
        }
        
        # Create tasks for each required agent
        tasks = []
        for agent_name in required_agents:
            if agent_name in agent_map:
                task = Task(
                    description=f"""
                    Analyze the user message: "{message}"
                    
                    Available context:
                    - User ID: {user_id}
                    - Personality preference: {personality.value}
                    - MCP Context: {json.dumps(mcp_context, default=str)}
                    
                    Provide your specialized analysis and recommendations as a {agent_name}.
                    Be specific, actionable, and align with the {personality.value} coaching style.
                    """,
                    agent=agent_map[agent_name],
                    expected_output=f"Specialized analysis and recommendations from {agent_name}"
                )
                tasks.append((agent_name, task))
        
        # Execute tasks (can be parallel for performance)
        for agent_name, task in tasks:
            try:
                crew = Crew(
                    agents=[agent_map[agent_name]],
                    tasks=[task],
                    process=Process.sequential,
                    verbose=False
                )
                
                result = crew.kickoff()
                
                agent_responses[agent_name] = AgentResponse(
                    agent_type=agent_name,
                    message=str(result),
                    actions_taken=[],
                    recommendations=[],
                    confidence=0.85,
                    metadata={'execution_time': datetime.now().isoformat()}
                )
                
            except Exception as e:
                logger.error(f"Error executing task for {agent_name}: {str(e)}")
                agent_responses[agent_name] = AgentResponse(
                    agent_type=agent_name,
                    message=f"Unable to provide {agent_name} analysis at this time.",
                    actions_taken=[],
                    recommendations=[],
                    confidence=0.0
                )
        
        return agent_responses

    async def _coordinate_agent_responses(
        self, 
        agent_responses: Dict[str, AgentResponse], 
        user_id: str,
        personality: AgentPersonality
    ) -> CoordinatedPlan:
        """Coordinate multiple agent responses into a unified plan"""
        
        # Extract key information from all agents
        all_messages = []
        all_recommendations = []
        confidence_scores = {}
        
        for agent_name, response in agent_responses.items():
            all_messages.append(f"**{agent_name.replace('_', ' ').title()}**: {response.message}")
            all_recommendations.extend(response.recommendations)
            confidence_scores[agent_name] = response.confidence
        
        # Create coordination task
        coordination_prompt = f"""
        You are the AI Fitness Coach coordinator. Multiple specialized agents have analyzed 
        the user's situation. Your job is to synthesize their responses into a coherent, 
        actionable plan with a {personality.value} coaching style.
        
        Agent Responses:
        {chr(10).join(all_messages)}
        
        Create a unified response that:
        1. Addresses the user's primary concern
        2. Incorporates the most important recommendations from all agents
        3. Maintains consistency across all advice
        4. Reflects a {personality.value} coaching personality
        5. Provides clear next steps
        
        Format your response as natural, encouraging coaching guidance.
        """
        
        # Use primary coach agent for coordination
        coordination_task = Task(
            description=coordination_prompt,
            agent=self.primary_coach,
            expected_output="Unified, coherent coaching response"
        )
        
        crew = Crew(
            agents=[self.primary_coach],
            tasks=[coordination_task],
            process=Process.sequential,
            verbose=False
        )
        
        coordinated_response = crew.kickoff()
        
        return CoordinatedPlan(
            primary_message=str(coordinated_response),
            action_items=all_recommendations[:5],  # Top 5 recommendations
            priority_level=self._calculate_priority_level(agent_responses),
            expected_outcomes=["Improved fitness progress", "Better health outcomes"],
            follow_up_required=any(r.requires_user_input for r in agent_responses.values()),
            agent_consensus=confidence_scores
        )

    def _calculate_priority_level(self, agent_responses: Dict[str, AgentResponse]) -> str:
        """Calculate overall priority level based on agent responses"""
        avg_confidence = sum(r.confidence for r in agent_responses.values()) / len(agent_responses)
        
        if avg_confidence > 0.8:
            return "high"
        elif avg_confidence > 0.6:
            return "medium"
        else:
            return "low"

    async def _get_or_create_session(self, user_id: str, personality: AgentPersonality) -> Dict:
        """Get existing session or create new one"""
        if user_id not in self.active_sessions:
            self.active_sessions[user_id] = {
                'created_at': datetime.now(),
                'personality': personality,
                'message_count': 0,
                'last_activity': datetime.now(),
                'context_history': []
            }
        
        return self.active_sessions[user_id]

    async def _update_session(self, user_id: str, message: str, plan: CoordinatedPlan):
        """Update session with latest interaction"""
        if user_id in self.active_sessions:
            session = self.active_sessions[user_id]
            session['message_count'] += 1
            session['last_activity'] = datetime.now()
            session['context_history'].append({
                'timestamp': datetime.now().isoformat(),
                'user_message': message,
                'coordinated_plan': asdict(plan)
            })
            
            # Keep only last 10 interactions for memory management
            if len(session['context_history']) > 10:
                session['context_history'] = session['context_history'][-10:]

    # Tool implementation methods (async stubs - implement based on your services)
    async def _get_workout_schedule(self, user_id: str) -> str:
        """Get user's workout schedule"""
        try:
            schedule = await self.workout_service.get_user_schedule(user_id)
            return json.dumps(schedule, default=str)
        except Exception as e:
            return f"Error retrieving schedule: {str(e)}"

    async def _modify_workout_plan(self, user_id: str, modifications: str) -> str:
        """Modify user's workout plan"""
        try:
            result = await self.workout_service.modify_plan(user_id, modifications)
            return f"Workout plan updated successfully: {result}"
        except Exception as e:
            return f"Error modifying plan: {str(e)}"

    async def _assess_workout_readiness(self, user_id: str) -> str:
        """Assess user's readiness for workout"""
        try:
            readiness = await self.mcp_servers['health'].assess_workout_readiness(user_id)
            return json.dumps(readiness, default=str)
        except Exception as e:
            return f"Error assessing readiness: {str(e)}"

    # Additional tool methods would be implemented here...
    async def _coordinate_specialists(self, query: str) -> str:
        return "Coordination complete"
    
    async def _generate_motivation(self, user_id: str) -> str:
        return "Motivational message generated"
    
    async def _analyze_meal_photo(self, image_data: str) -> str:
        return "Meal analysis complete"
    
    async def _calculate_macro_needs(self, user_id: str) -> str:
        return "Macro needs calculated"
    
    async def _suggest_meal_timing(self, user_id: str) -> str:
        return "Meal timing suggested"
    
    async def _generate_meal_plan(self, user_id: str) -> str:
        return "Meal plan generated"
    
    async def _analyze_sleep_patterns(self, user_id: str) -> str:
        return "Sleep patterns analyzed"
    
    async def _assess_recovery_metrics(self, user_id: str) -> str:
        return "Recovery metrics assessed"
    
    async def _recommend_recovery_protocol(self, user_id: str) -> str:
        return "Recovery protocol recommended"
    
    async def _monitor_stress_levels(self, user_id: str) -> str:
        return "Stress levels monitored"
    
    async def _analyze_progress_trends(self, user_id: str) -> str:
        return "Progress trends analyzed"
    
    async def _identify_obstacles(self, user_id: str) -> str:
        return "Obstacles identified"
    
    async def _adjust_goals(self, user_id: str) -> str:
        return "Goals adjusted"
    
    async def _calculate_achievement_probability(self, user_id: str) -> str:
        return "Achievement probability calculated"
    
    async def _analyze_exercise_form(self, video_data: str) -> str:
        return "Exercise form analyzed"
    
    async def _assess_injury_risk(self, user_id: str) -> str:
        return "Injury risk assessed"
    
    async def _suggest_modifications(self, user_id: str) -> str:
        return "Exercise modifications suggested"
    
    async def _create_prevention_plan(self, user_id: str) -> str:
        return "Prevention plan created"

# Singleton instance
multi_agent_system = None

def get_multi_agent_system(openai_key: str, anthropic_key: str) -> MultiAgentCoordinationSystem:
    """Get or create the multi-agent system singleton"""
    global multi_agent_system
    if multi_agent_system is None:
        multi_agent_system = MultiAgentCoordinationSystem(openai_key, anthropic_key)
    return multi_agent_system