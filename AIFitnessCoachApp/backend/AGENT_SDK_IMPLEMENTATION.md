# OpenAI Agents SDK Implementation

## Overview

The AI Fitness Coach backend has been updated to use the official OpenAI Agents SDK for production-ready AI coaching capabilities. This implementation provides:

- **Persistent Conversations**: Threads maintain conversation history
- **Tool Calling**: Agents can execute fitness-specific functions
- **Multi-Personality Support**: Supportive, Aggressive, and Steady Pace coaching styles
- **Real-time Responses**: Async implementation for efficient handling

## Architecture

### 1. OpenAI Fitness Coach Agent (`agents/openai_fitness_coach_agent.py`)

The core agent implementation using the official OpenAI SDK:

```python
class OpenAIFitnessCoachAgent:
    - Uses OpenAI Assistants API
    - Implements fitness-specific tools
    - Manages conversation threads
    - Handles async operations
```

**Key Features:**
- Dynamic assistant creation with personality-specific instructions
- Tool implementations for workout management, exercise substitution, progress tracking
- Proper cleanup to avoid resource leaks

### 2. Agent Service (`services/agent_service.py`)

Service layer for managing agent instances:

```python
class AgentService:
    - Manages agent lifecycle
    - Caches active agents
    - Tracks session statistics
    - Handles user context updates
```

**Key Features:**
- Singleton pattern (initialized during app startup)
- Agent caching for performance
- Session tracking and analytics
- Automatic cleanup of inactive agents

### 3. API Endpoints (`api/coach_agents.py`)

RESTful API for agent interactions:

- `POST /api/agent/chat` - Chat with AI coach
- `GET /api/agent/state` - Get agent state
- `POST /api/agent/clear` - Clear conversation
- `POST /api/agent/preferences` - Update preferences
- `GET /api/agent/stats` - Get usage statistics

### 4. MCP Server Integration

Model Context Protocol servers for real-time data access:

- **HealthDataMCPServer**: Real-time health metrics, sleep analysis, recovery assessment
- Additional servers planned: Environmental, Nutrition, Exercise Science

## Setup Instructions

### 1. Install Dependencies

```bash
cd AIFitnessCoachApp/backend
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://user:password@localhost/fitness_db
```

### 3. Run the Server

```bash
python app.py
```

The server will start on `http://localhost:8000`

## Testing

### 1. Direct Agent Test

```bash
python test_agent_sdk.py
```

This tests:
- Direct agent creation and conversation
- Tool calling (workout management, custom workouts)
- Injury assessment
- Agent cleanup

### 2. API Integration Test

```bash
# First, start the server
python app.py

# In another terminal
python test_api_integration.py
```

### 3. Manual Testing with cURL

```bash
# Health check
curl http://localhost:8000/health

# Chat with agent (requires authentication)
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Create a 30-minute workout for me",
    "personality": "supportive"
  }'
```

## Agent Tools

The fitness coach agent has access to these tools:

1. **get_workout_for_date** - Retrieve scheduled workouts
2. **make_rest_day** - Convert workout days to rest days
3. **substitute_exercise** - Replace exercises with alternatives
4. **create_custom_workout** - Generate personalized workouts
5. **get_user_progress** - Track fitness progress
6. **assess_injury_risk** - Evaluate injury risks and provide safety recommendations

## Personality Types

### Supportive Coach
- Warm, understanding, and motivational
- Focuses on progress celebration
- Emphasizes self-care

### Aggressive Coach
- Direct, intense, and results-focused
- Pushes users beyond comfort zones
- Focuses on discipline

### Steady Pace Coach
- Calm, systematic, and progress-oriented
- Emphasizes consistency
- Provides structured guidance

## Production Considerations

### 1. API Key Management
- Store OpenAI API key securely
- Use environment variables
- Implement key rotation

### 2. Rate Limiting
- Monitor OpenAI API usage
- Implement request throttling
- Cache frequent responses

### 3. Error Handling
- Graceful fallbacks for API failures
- Comprehensive error logging
- User-friendly error messages

### 4. Scaling
- Agent instance pooling
- Database connection pooling
- Horizontal scaling support

### 5. Monitoring
- Track API response times
- Monitor agent creation/cleanup
- Log conversation metrics

## Future Enhancements

1. **Complete MCP Integration**
   - Implement remaining MCP servers
   - Real-time health device integration
   - Environmental context awareness

2. **Multi-Agent System**
   - Nutrition specialist agent
   - Recovery wellness agent
   - Goal achievement agent

3. **Advanced Features**
   - Voice interaction support
   - Image analysis for form checking
   - Wearable device integration

## Troubleshooting

### Common Issues

1. **"Agent service not available"**
   - Check OPENAI_API_KEY is set
   - Verify API key is valid
   - Check server logs for initialization errors

2. **Slow responses**
   - OpenAI API latency is normal
   - Consider implementing response streaming
   - Check network connectivity

3. **Agent cleanup errors**
   - Normal if assistant already deleted
   - Check OpenAI dashboard for orphaned assistants
   - Implement periodic cleanup job

## API Usage Examples

### Python Client

```python
import requests

# Login first to get token
response = requests.post("http://localhost:8000/api/auth/login", json={
    "email": "demo@fitness.com",
    "password": "demo123"
})
token = response.json()["access_token"]

# Chat with agent
response = requests.post(
    "http://localhost:8000/api/agent/chat",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "message": "I want to build muscle. What should I do?",
        "personality": "aggressive"
    }
)
print(response.json()["message"])
```

### JavaScript/React Native

```javascript
const chatWithCoach = async (message) => {
  const response = await fetch('http://localhost:8000/api/agent/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      message,
      personality: 'supportive'
    })
  });
  
  const data = await response.json();
  return data.message;
};
```

## Performance Metrics

Expected performance:
- Agent creation: 2-3 seconds
- Message response: 3-5 seconds (including tool calls)
- Tool execution: 1-2 seconds per tool
- Cleanup: < 1 second

## Security Best Practices

1. Never expose API keys in client code
2. Implement request signing for mobile apps
3. Use HTTPS in production
4. Sanitize user inputs
5. Implement rate limiting per user
6. Log all agent interactions for audit

## Support

For issues or questions:
1. Check server logs: `tail -f backend/logs/app.log`
2. Review OpenAI dashboard for API usage
3. Check agent state: `GET /api/agent/state`
4. Review this documentation

---

Last Updated: January 2025
Version: 1.0.0