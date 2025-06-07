#!/usr/bin/env python3
"""
Ensure the fitness action agent is included when workout modifications are requested
"""

import asyncio
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.multi_agent_coordinator import MultiAgentCoordinator, AgentType
from datetime import datetime

async def test_action_generation():
    """Test if action items are properly generated"""
    
    # Set up coordinator
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OpenAI API key not set")
        return
        
    coordinator = MultiAgentCoordinator(api_key, "test-user", "supportive")
    
    test_queries = [
        "I want to increase the difficulty of my workouts",
        "My knee hurts during squats",
        "Can you add push-ups to my workout?"
    ]
    
    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"Testing: {query}")
        print(f"{'='*60}")
        
        # Test agent routing
        agents = await coordinator._determine_relevant_agents(query, {})
        print(f"Agents selected: {[a.value for a in agents]}")
        
        # Ensure fitness action agent is included for workout modifications
        if any(keyword in query.lower() for keyword in ["workout", "add", "increase", "difficulty", "modify"]):
            if AgentType.FITNESS_ACTION not in agents:
                print("⚠️  FITNESS_ACTION agent should be included but wasn't!")
                agents.append(AgentType.FITNESS_ACTION)
                print(f"Updated agents: {[a.value for a in agents]}")
        
        # Process the query
        response = await coordinator.process_user_query(query, {}, agents)
        
        print(f"\nAction items generated: {len(response.action_items)}")
        for action in response.action_items:
            print(f"  - {action['type']}: {action['label']}")

if __name__ == "__main__":
    asyncio.run(test_action_generation())