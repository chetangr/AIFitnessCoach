# AI Fitness Coach Database Schema

## Overview
The app uses a hybrid storage approach:
- **SharedPreferences**: For user preferences, coach selection, and chat messages
- **Local Storage**: For workout stats and achievements
- **Future**: PostgreSQL for server-side data persistence

## Current Local Storage Schema

### User Preferences (SharedPreferences)
```json
{
  "userData": {
    "userId": "string",
    "name": "string",
    "email": "string", 
    "avatarUrl": "string",
    "level": "number",
    "xp": "number",
    "selectedCoach": {
      "id": "string",
      "name": "string",
      "personality": "string",
      "avatar": "string",
      "colorValue": "number"
    },
    "lastCoachSwap": "ISO8601 timestamp"
  }
}
```

### Chat Messages (SharedPreferences)
```json
{
  "chatMessages": [
    {
      "id": "string",
      "content": "string",
      "isFromCoach": "boolean",
      "timestamp": "ISO8601 timestamp",
      "coachPersonality": "string",
      "metadata": {}
    }
  ]
}
```

### Coach Swap Records (SharedPreferences)
```json
{
  "coach_swaps": [
    {
      "id": "string",
      "userId": "string",
      "fromCoach": {
        "id": "string",
        "name": "string",
        "personality": "string"
      },
      "toCoach": {
        "id": "string",
        "name": "string",
        "personality": "string"
      },
      "reason": "string",
      "timestamp": "ISO8601 timestamp"
    }
  ]
}
```

### Workout Statistics (SharedPreferences)
```json
{
  "workout_stats": {
    "workoutCount": "number",
    "totalHours": "number",
    "totalCalories": "number",
    "streakDays": "number",
    "lastUpdated": "ISO8601 timestamp",
    "lastWorkout": "ISO8601 timestamp"
  }
}
```

### Weekly Activity (SharedPreferences)
```json
{
  "weekly_activity": [0.6, 0.8, 0.4, 0.9, 0.7, 0.3, 0.0]
}
```

## Future PostgreSQL Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    profile_image_url TEXT,
    fitness_level VARCHAR(50),
    goals JSONB,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Coach Selections Table
```sql
CREATE TABLE coach_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id VARCHAR(50) NOT NULL,
    coach_name VARCHAR(255) NOT NULL,
    coach_personality VARCHAR(50) NOT NULL,
    selected_at TIMESTAMP DEFAULT NOW(),
    deselected_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

### Coach Swap History Table
```sql
CREATE TABLE coach_swap_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    from_coach_id VARCHAR(50) NOT NULL,
    from_coach_name VARCHAR(255) NOT NULL,
    to_coach_id VARCHAR(50) NOT NULL,
    to_coach_name VARCHAR(255) NOT NULL,
    reason TEXT,
    swapped_at TIMESTAMP DEFAULT NOW()
);
```

### Coaching Sessions Table
```sql
CREATE TABLE coaching_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id VARCHAR(50) NOT NULL,
    personality_type VARCHAR(50) NOT NULL,
    session_start TIMESTAMP DEFAULT NOW(),
    session_end TIMESTAMP,
    message_count INTEGER DEFAULT 0
);
```

### Coaching Messages Table
```sql
CREATE TABLE coaching_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES coaching_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Workout Sessions Table
```sql
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workout_plan_id UUID,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    exercises_completed JSONB,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);
```

### User Progress Table
```sql
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'weight', 'body_fat', 'measurements'
    value DECIMAL(10,2),
    unit VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT NOW()
);
```

### Achievements Table
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    achievement_emoji VARCHAR(10),
    unlocked_at TIMESTAMP DEFAULT NOW()
);
```

## Indexes
```sql
-- Performance indexes
CREATE INDEX idx_coach_selections_user_id ON coach_selections(user_id);
CREATE INDEX idx_coach_selections_active ON coach_selections(user_id, is_active);
CREATE INDEX idx_coach_swap_history_user_id ON coach_swap_history(user_id);
CREATE INDEX idx_coaching_sessions_user_id ON coaching_sessions(user_id);
CREATE INDEX idx_coaching_messages_session_id ON coaching_messages(session_id);
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
```

## Data Migration Strategy

When moving from local storage to server:
1. Export all SharedPreferences data
2. Transform JSON structure to match PostgreSQL schema
3. Bulk insert into PostgreSQL tables
4. Maintain backward compatibility during transition
5. Sync local and remote data for offline functionality