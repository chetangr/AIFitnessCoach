#!/usr/bin/env node

/**
 * Test Backend Connection
 * Simple script to verify backend connectivity
 */

const BACKEND_URL = 'https://desire-prostores-rather-fears.trycloudflare.com';

async function testConnection() {
  console.log('Testing backend connection...');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('---');

  // Test health endpoint
  try {
    console.log('Testing /health endpoint...');
    const startTime = Date.now();
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const latency = Date.now() - startTime;
    
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ Health check passed');
      console.log(`   Status: ${healthResponse.status}`);
      console.log(`   Latency: ${latency}ms`);
      console.log(`   Response:`, data);
    } else {
      console.log('❌ Health check failed');
      console.log(`   Status: ${healthResponse.status}`);
      console.log(`   Body: ${await healthResponse.text()}`);
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
  }

  console.log('---');

  // Test multi-agent demo endpoint
  try {
    console.log('Testing /api/multi-agent/chat/demo endpoint...');
    const startTime = Date.now();
    const chatResponse = await fetch(`${BACKEND_URL}/api/multi-agent/chat/demo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "What's my workout for today?",
        personality: 'supportive',
        context: {
          date: new Date().toISOString(),
          day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        }
      })
    });
    const latency = Date.now() - startTime;
    
    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log('✅ Multi-agent demo endpoint working');
      console.log(`   Status: ${chatResponse.status}`);
      console.log(`   Latency: ${latency}ms`);
      console.log(`   Primary message: ${data.primary_message?.substring(0, 100)}...`);
      console.log(`   Responding agents: ${data.responding_agents?.length || 0}`);
    } else {
      console.log('❌ Multi-agent demo endpoint failed');
      console.log(`   Status: ${chatResponse.status}`);
      console.log(`   Body: ${await chatResponse.text()}`);
    }
  } catch (error) {
    console.error('❌ Multi-agent demo error:', error.message);
  }

  console.log('---');

  // Test conversation history endpoint (might not exist)
  try {
    console.log('Testing /api/agent/messages endpoint...');
    const historyResponse = await fetch(`${BACKEND_URL}/api/agent/messages?limit=5`);
    
    if (historyResponse.ok) {
      const data = await historyResponse.json();
      console.log('✅ Conversation history endpoint exists');
      console.log(`   Message count: ${data.length || 0}`);
    } else if (historyResponse.status === 404) {
      console.log('⚠️  Conversation history endpoint not found (404)');
      console.log('   This is expected if the endpoint is not implemented');
    } else {
      console.log('❌ Conversation history endpoint error');
      console.log(`   Status: ${historyResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Conversation history error:', error.message);
  }

  console.log('---');
  console.log('Test complete!');
}

// Run the test
testConnection().catch(console.error);