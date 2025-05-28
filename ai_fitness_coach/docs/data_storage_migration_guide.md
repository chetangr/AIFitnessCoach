# Data Storage & Migration Guide

## Current Implementation (v1.0)

The AI Fitness Coach app currently uses **SharedPreferences** for all local data storage. This approach was chosen for MVP development due to its simplicity and quick implementation time.

### Storage Locations by Platform

| Platform | Storage Location |
|----------|-----------------|
| **iOS** | `~/Library/Developer/CoreSimulator/Devices/[Device-ID]/data/Containers/Data/Application/[App-ID]/Library/Preferences/` |
| **Android** | `/data/data/com.example.ai_fitness_coach/shared_prefs/` |
| **Web** | Browser LocalStorage (viewable in DevTools → Application → Local Storage) |
| **macOS** | `~/Library/Containers/com.example.ai_fitness_coach/Data/Library/Preferences/` |

### Current Data Structure

All data is stored as JSON strings with the following keys:

```dart
// User Preferences
'selected_coach' - Currently selected AI coach
'user_name' - User's display name
'user_level' - User level (int)
'user_xp' - User experience points (int)

// Coach Data
'coach_swaps' - Array of coach swap records
[
  {
    "userId": "user123",
    "fromCoach": "maya_zen",
    "toCoach": "alex_thunder",
    "reason": "Need more motivation",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]

// Workout Statistics
'workout_stats' - JSON object with workout data
{
  "workoutCount": 12,
  "totalHours": 16.5,
  "totalCalories": 2154,
  "streakDays": 4,
  "lastUpdated": "2024-01-15T10:30:00Z"
}

// Activity Data
'weekly_activity' - Array of 7 doubles representing daily activity levels
[0.6, 0.8, 0.4, 0.9, 0.7, 0.3, 0.0]

// Chat History
'messages' - Array of message objects
[
  {
    "content": "Hello coach!",
    "isFromCoach": false,
    "timestamp": "2024-01-15T10:30:00Z",
    "coachId": "maya_zen"
  }
]
```

## Limitations of Current Approach

1. **Storage Size**: SharedPreferences has platform-specific size limits
   - Android: ~1MB practical limit
   - iOS: No hard limit but performance degrades with large data

2. **Query Performance**: No indexing or efficient querying capabilities

3. **Data Relationships**: No relational capabilities or foreign keys

4. **Concurrent Access**: Limited concurrent read/write capabilities

5. **Data Integrity**: No ACID transactions or rollback capabilities

## Future Migration Strategy

### Phase 1: Immediate Improvements (1-2 months)
- Add data versioning to SharedPreferences
- Implement data compression for message history
- Add periodic cleanup of old messages

### Phase 2: Database Migration (3-6 months)

#### Recommended Database Options

1. **SQLite (via sqflite package)**
   - ✅ Best for: Structured data, complex queries, offline-first apps
   - ✅ Works on: iOS, Android, macOS, Windows, Linux
   - ❌ Not supported on: Web (use sqflite_common_ffi_web)

2. **Drift (formerly Moor)**
   - ✅ Type-safe SQLite wrapper
   - ✅ Built-in migration support
   - ✅ Reactive queries with streams

3. **Isar Database**
   - ✅ NoSQL, very fast
   - ✅ Built for Flutter
   - ✅ Good for mobile performance

4. **Hive**
   - ✅ Lightweight NoSQL
   - ✅ Good for simple key-value storage
   - ✅ Works on all platforms including web

### Migration Implementation Plan

```dart
// 1. Add version tracking
class StorageVersion {
  static const int current = 1;
  static const String key = 'storage_version';
}

// 2. Create migration service
class DataMigrationService {
  Future<void> migrate() async {
    final prefs = await SharedPreferences.getInstance();
    final currentVersion = prefs.getInt(StorageVersion.key) ?? 0;
    
    if (currentVersion < StorageVersion.current) {
      // Perform migration
      await _migrateToSQLite(prefs);
      await prefs.setInt(StorageVersion.key, StorageVersion.current);
    }
  }
  
  Future<void> _migrateToSQLite(SharedPreferences prefs) async {
    // 1. Read all data from SharedPreferences
    // 2. Initialize SQLite database
    // 3. Create tables
    // 4. Insert data into SQLite
    // 5. Verify migration
    // 6. Clear SharedPreferences (keep backup)
  }
}
```

### Database Schema for Future Migration

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coach swaps table
CREATE TABLE coach_swaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  from_coach TEXT NOT NULL,
  to_coach TEXT NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Messages table
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  coach_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_from_coach BOOLEAN DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Workout stats table
CREATE TABLE workout_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  workout_count INTEGER DEFAULT 0,
  total_hours REAL DEFAULT 0,
  total_calories INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_workout TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Weekly activity table
CREATE TABLE weekly_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  activity_level REAL NOT NULL,
  date DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Migration Checklist

- [ ] Implement data versioning system
- [ ] Create backup mechanism before migration
- [ ] Build migration service with rollback capability
- [ ] Add progress indicators for migration process
- [ ] Test migration with various data sizes
- [ ] Implement data validation post-migration
- [ ] Create fallback mechanism if migration fails
- [ ] Update all data access layers to support both storage types during transition
- [ ] Plan for gradual rollout with feature flags

## Code Changes Required

1. **Create Database Service Interface**
```dart
abstract class IDataService {
  Future<void> saveCoachSwap(CoachSwapRecord record);
  Future<List<CoachSwapRecord>> getCoachSwaps(String userId);
  Future<void> saveMessage(Message message);
  Future<List<Message>> getMessages(String userId);
  // ... other methods
}
```

2. **Implement for Both Storage Types**
```dart
class SharedPrefsDataService implements IDataService { }
class SQLiteDataService implements IDataService { }
```

3. **Use Dependency Injection**
```dart
final dataServiceProvider = Provider<IDataService>((ref) {
  // Check if should use SQLite or SharedPreferences
  if (shouldUseSQLite) {
    return SQLiteDataService();
  }
  return SharedPrefsDataService();
});
```

## Timeline

- **Month 1-2**: Continue with SharedPreferences, monitor data growth
- **Month 3**: Implement data versioning and compression
- **Month 4**: Design and test SQLite schema
- **Month 5**: Build migration service
- **Month 6**: Gradual rollout of SQLite storage

## Monitoring

Track these metrics to determine when migration is necessary:
- Average SharedPreferences file size
- Message history load time
- Coach swap query performance
- App startup time
- Memory usage during data operations

## Notes

- Current implementation is sufficient for MVP and early users
- Migration should be transparent to users
- Always maintain backwards compatibility during transition
- Consider cloud sync requirements before choosing final database solution