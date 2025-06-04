# Database Migration Guide: SQLite to Supabase/Firebase

## Current Architecture

We currently use SQLite with the following advantages:
- No external dependencies
- Perfect for development and small-scale deployment
- Can handle thousands of users
- All data stored locally in `backend/ai_fitness_coach.db`

## Database Tables Created

### Core User Data
- `users` - User profiles and authentication
- `user_settings` - User preferences and app settings
- `user_progress` - Progress tracking over time

### Workout & Training
- `workout_plans` - Workout plan definitions
- `workout_plan_versions` - Version history for plans
- `workout_sessions_v2` - Detailed workout session tracking
- `exercise_performances` - Performance per exercise in a session
- `set_performances` - Individual set tracking with RPE
- `personal_records` - PR tracking across exercises
- `workout_schedules` - Calendar/timeline scheduling
- `exercises` - Exercise library
- `exercise_history` - User's history with each exercise

### Custom Content
- `custom_exercises` - User-created exercises
- `workout_templates` - Reusable workout templates
- `training_programs` - Multi-week training programs

### Health & Measurements
- `body_measurements` - Weight, body fat, measurements
- `progress_photos` - Photo tracking
- `fasting_sessions` - Intermittent fasting tracking

### AI Coaching
- `coaching_sessions` - AI coaching conversations
- `coaching_messages` - Individual messages in conversations

## Migration to Supabase (Recommended)

Supabase is the easiest migration path because:
1. It's PostgreSQL-based (our SQLAlchemy models will work with minimal changes)
2. Built-in authentication
3. Real-time subscriptions
4. Row-level security
5. Auto-generated REST APIs

### Migration Steps for Supabase:

1. **Create Supabase Project**
   ```bash
   # Sign up at supabase.com
   # Create new project
   # Note your project URL and anon key
   ```

2. **Update Backend Configuration**
   ```python
   # In services/database.py or .env
   DATABASE_URL = "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres"
   ```

3. **Install PostgreSQL Adapter**
   ```bash
   pip install psycopg2-binary
   # Already in requirements.txt
   ```

4. **Run Migrations**
   ```bash
   # The app will auto-create tables on startup
   # Or use Alembic for production migrations
   alembic init alembic
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

5. **Enable Row Level Security**
   ```sql
   -- In Supabase SQL editor
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE workout_sessions_v2 ENABLE ROW LEVEL SECURITY;
   -- etc for all tables
   
   -- Create policies
   CREATE POLICY "Users can view own data" ON users
     FOR SELECT USING (auth.uid() = id);
   ```

6. **Use Supabase Auth (Optional)**
   ```typescript
   // Replace current auth with Supabase auth
   import { createClient } from '@supabase/supabase-js'
   const supabase = createClient(url, anonKey)
   
   // Login
   const { user, error } = await supabase.auth.signIn({
     email: 'demo@fitness.com',
     password: 'demo123'
   })
   ```

### Data Export/Import
```bash
# Export from SQLite
sqlite3 ai_fitness_coach.db .dump > backup.sql

# Import to PostgreSQL (clean up SQLite-specific syntax first)
psql -h [YOUR-PROJECT].supabase.co -U postgres -d postgres < backup.sql
```

## Migration to Firebase

Firebase uses Firestore (NoSQL) which requires restructuring:

### Pros:
- Great mobile SDK
- Built-in auth
- Offline support
- Real-time sync

### Cons:
- Need to denormalize data
- No SQL queries
- More complex aggregations

### Migration Steps for Firebase:

1. **Restructure Data for NoSQL**
   ```javascript
   // Instead of relational tables, use collections:
   {
     users: {
       userId: {
         email: "demo@fitness.com",
         settings: { ... },
         stats: { ... }
       }
     },
     workouts: {
       workoutId: {
         userId: "userId",
         exercises: [ ... ]
       }
     }
   }
   ```

2. **Create Migration Script**
   ```python
   import sqlite3
   import firebase_admin
   from firebase_admin import firestore
   
   # Initialize Firebase
   firebase_admin.initialize_app()
   db = firestore.client()
   
   # Connect to SQLite
   conn = sqlite3.connect('ai_fitness_coach.db')
   
   # Migrate users
   users = conn.execute("SELECT * FROM users").fetchall()
   for user in users:
       db.collection('users').document(user['id']).set({...})
   ```

3. **Update Frontend**
   ```typescript
   // Use Firebase SDK instead of REST API
   import { initializeApp } from 'firebase/app'
   import { getFirestore } from 'firebase/firestore'
   ```

## Comparison Table

| Feature | SQLite (Current) | Supabase | Firebase |
|---------|-----------------|----------|----------|
| Setup Complexity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Cost (< 10k users) | Free | Free | Free |
| Cost (> 10k users) | N/A | ~$25/mo | ~$25/mo |
| Auth Included | ❌ | ✅ | ✅ |
| Real-time | ❌ | ✅ | ✅ |
| SQL Support | ✅ | ✅ | ❌ |
| Offline Support | ✅ | ❌ | ✅ |
| Scaling | Limited | Excellent | Excellent |
| Migration Effort | - | Low | High |

## Recommendation

**For your use case, I recommend Supabase because:**

1. **Minimal Code Changes**: Your SQLAlchemy models work almost as-is
2. **Built-in Auth**: Replace your auth system with Supabase Auth
3. **Real-time Updates**: Get live updates when workouts change
4. **PostgreSQL**: Full SQL support for complex queries
5. **Free Tier**: Generous free tier for development
6. **Easy Migration**: Simple PostgreSQL dump/restore

## Quick Start with Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Update your `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT].supabase.co
   SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   ```
4. Restart backend - tables will auto-create
5. Enable RLS in Supabase dashboard
6. Done! Your app now uses cloud database

## Next Steps

1. Set up automated backups
2. Configure row-level security policies
3. Add database indexes for performance
4. Set up monitoring and alerts
5. Plan for data migration from existing users