#!/usr/bin/env node

/**
 * Test script for agent switching functionality
 */

const BASE_URL = 'http://localhost:8000';

// Test messages for different agents
const testCases = [
  {
    message: "What's a good workout for building muscle?",
    required_agents: ["fitness_coach"],
    expected: "fitness_coach should respond"
  },
  {
    message: "What should I eat before a workout?",
    required_agents: ["nutrition_specialist"],
    expected: "nutrition_specialist should respond"
  },
  {
    message: "My lower back hurts after deadlifts",
    required_agents: ["recovery_wellness", "form_safety"],
    expected: "recovery_wellness and form_safety should respond"
  },
  {
    message: "I need a complete fitness assessment",
    required_agents: null, // Let system decide
    expected: "Multiple agents should collaborate"
  }
];

async function testAgentSwitching() {
  console.log('🧪 Testing Agent Switching Functionality\n');
  
  for (const testCase of testCases) {
    console.log(`📨 Test: "${testCase.message}"`);
    console.log(`   Required agents: ${testCase.required_agents ? testCase.required_agents.join(', ') : 'Auto-select'}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/multi-agent/chat/demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.message,
          required_agents: testCase.required_agents,
          personality: 'supportive'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ Response received`);
      console.log(`   Primary message: ${data.primary_message.substring(0, 100)}...`);
      console.log(`   Responding agents: ${data.responding_agents.map(a => a.type).join(', ')}`);
      
      // Verify expected agents responded
      if (testCase.required_agents) {
        const respondingTypes = data.responding_agents.map(a => a.type);
        const allRequiredResponded = testCase.required_agents.every(agent => 
          respondingTypes.includes(agent)
        );
        
        if (allRequiredResponded) {
          console.log(`   ✅ All required agents responded as expected`);
        } else {
          console.log(`   ⚠️  Not all required agents responded`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }
}

// Run the test
testAgentSwitching().catch(console.error);