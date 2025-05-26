# AI Fitness Coach - Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide provides solutions for common issues encountered during development, deployment, and operation of the AI Fitness Coach application. It's designed specifically for data engineers transitioning to mobile development.

## Quick Diagnosis Commands

```bash
# Health check commands
flutter doctor                    # Check Flutter installation
npm run health-check              # Backend health status
adb devices                       # Android device connection
xcrun simctl list                 # iOS simulator status
docker ps                         # Container status
pg_isready -h localhost           # PostgreSQL connection
redis-cli ping                    # Redis connection test
```

## 1. Authentication Issues

### 1.1 Google OAuth Failures

#### Symptom: "Invalid OAuth client" error
```
Error: invalid_client
The OAuth client was not found.
```

**Diagnosis:**
```bash
# Check environment variables
echo $GOOGLE_WEB_CLIENT_ID
echo $GOOGLE_IOS_CLIENT_ID
echo $GOOGLE_ANDROID_CLIENT_ID

# Verify OAuth configuration
curl -X POST "https://oauth2.googleapis.com/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$GOOGLE_WEB_CLIENT_ID"
```

**Solution:**
1. Verify Google Cloud Console configuration:
   ```bash
   # Check if client IDs match in Google Cloud Console
   # iOS: Bundle ID must match exactly
   # Android: SHA-1 certificate fingerprint must be correct
   ```

2. Generate correct SHA-1 for Android:
   ```bash
   # Debug keystore
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Release keystore
   keytool -list -v -keystore release-key.keystore -alias release
   ```

3. Update OAuth consent screen:
   - Add test users for internal testing
   - Verify authorized domains
   - Check app verification status

#### Symptom: Token refresh failures
```
Error: invalid_grant
The provided authorization grant is invalid, expired, revoked, or does not match the redirection URI
```

**Solution:**
```javascript
// Check token expiry handling
const isTokenExpired = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return Date.now() >= payload.exp * 1000;
};

// Implement proper refresh logic
const refreshToken = async (refreshToken) => {
  try {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${refreshToken}` }
    });
    
    if (!response.ok) {
      // Force re-authentication
      await signOut();
      throw new Error('Token refresh failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};
```

### 1.2 Cross-Platform Login Issues

#### Symptom: Login works on iOS but not Android
**Common Causes:**
- Missing SHA-1 fingerprint in Google Console
- Incorrect package name
- ProGuard/R8 obfuscation issues

**Solution:**
```yaml
# android/app/build.gradle
android {
    buildTypes {
        release {
            // Disable obfuscation for OAuth
            minifyEnabled false
            shrinkResources false
        }
    }
}
```

#### Symptom: Biometric authentication fails
**Diagnosis:**
```dart
// Check biometric availability
import 'package:local_auth/local_auth.dart';

final LocalAuthentication auth = LocalAuthentication();
final bool isAvailable = await auth.canCheckBiometrics;
final List<BiometricType> availableBiometrics = await auth.getAvailableBiometrics();

print('Biometrics available: $isAvailable');
print('Available types: $availableBiometrics');
```

**Solution:**
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

```xml
<!-- ios/Runner/Info.plist -->
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID for secure app access</string>
```

## 2. AI Service Errors

### 2.1 API Timeouts and Rate Limiting

#### Symptom: AI responses taking too long or timing out
```
Error: Request timeout after 30 seconds
```

**Diagnosis:**
```bash
# Test API connectivity
curl -w "@curl-format.txt" -s -o /dev/null \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  "https://api.openai.com/v1/models"

# Check current rate limits
curl -I -H "Authorization: Bearer $OPENAI_API_KEY" \
  "https://api.openai.com/v1/chat/completions"
```

**Solution:**
```javascript
// Implement request queuing and retry logic
class AIRequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.baseDelay = 1000;
  }

  async addRequest(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject, retries: 0 });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { request, resolve, reject, retries } = this.queue.shift();
      
      try {
        const result = await this.executeRequest(request);
        resolve(result);
      } catch (error) {
        if (retries < this.maxRetries && this.isRetryableError(error)) {
          // Exponential backoff
          const delay = this.baseDelay * Math.pow(2, retries);
          await new Promise(r => setTimeout(r, delay));
          
          this.queue.unshift({ request, resolve, reject, retries: retries + 1 });
        } else {
          reject(error);
        }
      }
    }
    
    this.processing = false;
  }

  isRetryableError(error) {
    return error.status === 429 || error.status >= 500;
  }
}
```

#### Symptom: Rate limit exceeded errors
```
Error: Rate limit reached for requests per minute
```

**Solution:**
```javascript
// Implement adaptive rate limiting
class AdaptiveRateLimiter {
  constructor(initialRpm = 50) {
    this.requestsPerMinute = initialRpm;
    this.requestTimes = [];
    this.lastRateLimit = null;
  }

  async makeRequest(requestFn) {
    await this.waitForSlot();
    
    try {
      const result = await requestFn();
      this.onSuccess();
      return result;
    } catch (error) {
      if (error.status === 429) {
        this.onRateLimit(error);
        throw error;
      }
      throw error;
    }
  }

  async waitForSlot() {
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(time => now - time < 60000);
    
    if (this.requestTimes.length >= this.requestsPerMinute) {
      const oldestRequest = Math.min(...this.requestTimes);
      const waitTime = 60000 - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requestTimes.push(now);
  }

  onSuccess() {
    // Gradually increase rate limit if successful
    if (Date.now() - this.lastRateLimit > 300000) { // 5 minutes
      this.requestsPerMinute = Math.min(this.requestsPerMinute * 1.1, 100);
    }
  }

  onRateLimit(error) {
    this.lastRateLimit = Date.now();
    this.requestsPerMinute = Math.max(this.requestsPerMinute * 0.5, 10);
    
    // Extract retry-after header if available
    const retryAfter = error.headers?.['retry-after'];
    if (retryAfter) {
      setTimeout(() => {
        this.requestsPerMinute = Math.min(this.requestsPerMinute * 1.2, 50);
      }, parseInt(retryAfter) * 1000);
    }
  }
}
```

### 2.2 AI Response Parsing Failures

#### Symptom: AI returns unstructured responses
```
Error: Cannot parse AI response for workout modifications
Response: "Yeah, you should maybe try some different exercises or something..."
```

**Solution:**
```javascript
// Robust response parser with fallbacks
class AIResponseParser {
  parseWorkoutModification(response) {
    try {
      // Try structured parsing first
      return this.parseStructuredResponse(response);
    } catch (error) {
      console.warn('Structured parsing failed, trying NLP extraction:', error);
      return this.parseWithNLP(response);
    }
  }

  parseStructuredResponse(response) {
    const patterns = {
      modifications: /WORKOUT_MODIFICATIONS?:\s*(.*?)(?=\n\n|\nREASONING|$)/is,
      reasoning: /REASONING:\s*(.*?)(?=\n\n|$)/is,
      safety: /SAFETY:\s*(.*?)(?=\n\n|$)/is
    };

    const result = {
      modifications: [],
      reasoning: '',
      safety: []
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = response.match(pattern);
      if (match) {
        if (key === 'modifications') {
          result[key] = this.parseModificationList(match[1]);
        } else {
          result[key] = match[1].trim();
        }
      }
    }

    if (result.modifications.length === 0) {
      throw new Error('No modifications found in structured format');
    }

    return result;
  }

  parseWithNLP(response) {
    // Extract action verbs and exercise names
    const actionPatterns = {
      add: /add|include|incorporate\s+([^.]+)/gi,
      remove: /remove|skip|eliminate\s+([^.]+)/gi,
      replace: /replace|substitute|swap\s+([^.]+)\s+(?:with|for)\s+([^.]+)/gi,
      modify: /modify|change|adjust\s+([^.]+)/gi
    };

    const modifications = [];
    
    for (const [action, pattern] of Object.entries(actionPatterns)) {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        modifications.push({
          action,
          details: match[0],
          confidence: 0.7 // Lower confidence for NLP parsing
        });
      }
    }

    return {
      modifications,
      reasoning: this.extractReasoning(response),
      safety: this.extractSafetyNotes(response),
      parseMethod: 'nlp',
      requiresReview: true
    };
  }

  generateFallbackResponse(originalResponse) {
    return {
      modifications: [],
      reasoning: 'Unable to parse specific modifications from AI response',
      safety: ['Please review AI response manually'],
      fallbackMessage: originalResponse,
      requiresHumanIntervention: true
    };
  }
}
```

## 3. Sync Conflicts

### 3.1 Offline/Online Data Merging Issues

#### Symptom: Workout data lost after sync
```
Error: Conflict detected - local changes overwritten by server
```

**Diagnosis:**
```javascript
// Check for sync conflicts
const detectConflicts = (localData, serverData) => {
  const conflicts = [];
  
  for (const localItem of localData) {
    const serverItem = serverData.find(item => item.id === localItem.id);
    
    if (serverItem && localItem.lastModified !== serverItem.lastModified) {
      conflicts.push({
        id: localItem.id,
        type: 'modification_conflict',
        local: localItem,
        server: serverItem,
        conflictFields: this.getConflictingFields(localItem, serverItem)
      });
    }
  }
  
  return conflicts;
};
```

**Solution:**
```javascript
// Three-way merge strategy
class ConflictResolver {
  async resolveWorkoutConflicts(conflicts) {
    const resolutions = [];
    
    for (const conflict of conflicts) {
      const resolution = await this.resolveConflict(conflict);
      resolutions.push(resolution);
    }
    
    return resolutions;
  }

  async resolveConflict(conflict) {
    const { local, server, type } = conflict;
    
    switch (type) {
      case 'modification_conflict':
        return this.mergeModifications(local, server);
      
      case 'deletion_conflict':
        return this.handleDeletionConflict(local, server);
      
      case 'creation_conflict':
        return this.handleCreationConflict(local, server);
      
      default:
        return this.promptUserResolution(conflict);
    }
  }

  mergeModifications(local, server) {
    // Field-level merge
    const merged = { ...server }; // Start with server version
    
    // Preserve user's exercise modifications
    if (local.exercises && server.exercises) {
      merged.exercises = this.mergeExercises(local.exercises, server.exercises);
    }
    
    // Preserve local progress data
    if (local.progressData) {
      merged.progressData = {
        ...server.progressData,
        ...local.progressData
      };
    }
    
    return {
      action: 'merge',
      result: merged,
      conflicts: this.getRemainingConflicts(local, server, merged)
    };
  }

  async handleDeletionConflict(local, server) {
    // Item was deleted on server but modified locally
    const userChoice = await this.showConflictDialog({
      title: 'Sync Conflict',
      message: `"${local.name}" was deleted on another device but modified here. What would you like to do?`,
      options: [
        { id: 'keep_local', text: 'Keep my changes' },
        { id: 'accept_deletion', text: 'Accept deletion' },
        { id: 'create_copy', text: 'Create a copy' }
      ]
    });

    switch (userChoice) {
      case 'keep_local':
        return { action: 'restore', result: local };
      case 'accept_deletion':
        return { action: 'delete', result: null };
      case 'create_copy':
        return { 
          action: 'create', 
          result: { ...local, name: `${local.name} (Copy)`, id: generateNewId() }
        };
    }
  }
}
```

### 3.2 Version Conflicts

#### Symptom: Workout plan version mismatch
```
Error: Version conflict - plan was modified by another session
Current version: 5, Expected version: 3
```

**Solution:**
```javascript
// Optimistic locking with conflict resolution
class WorkoutVersionManager {
  async updateWorkoutPlan(planId, updates, expectedVersion) {
    const transaction = await db.beginTransaction();
    
    try {
      // Check current version
      const currentPlan = await WorkoutPlan.findById(planId, { transaction });
      
      if (currentPlan.version !== expectedVersion) {
        // Version conflict detected
        const conflict = await this.analyzeVersionConflict(
          currentPlan, 
          updates, 
          expectedVersion
        );
        
        if (conflict.canAutoResolve) {
          const resolved = await this.autoResolveConflict(conflict);
          await this.createNewVersion(planId, resolved, transaction);
        } else {
          throw new VersionConflictError(conflict);
        }
      } else {
        // No conflict, proceed with update
        await this.createNewVersion(planId, updates, transaction);
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async analyzeVersionConflict(currentPlan, updates, expectedVersion) {
    const missedVersions = await WorkoutPlanVersion.findAll({
      where: {
        planId: currentPlan.id,
        version: {
          [Op.gt]: expectedVersion,
          [Op.lte]: currentPlan.version
        }
      },
      order: [['version', 'ASC']]
    });

    const conflictingChanges = this.findConflictingChanges(
      missedVersions,
      updates
    );

    return {
      missedVersions,
      conflictingChanges,
      canAutoResolve: conflictingChanges.length === 0,
      suggestedResolution: this.suggestResolution(conflictingChanges)
    };
  }
}
```

## 4. Performance Issues

### 4.1 Memory Leaks

#### Symptom: App crashes due to out of memory
```
Error: Out of memory - app terminated
Memory usage: 890MB (iOS limit: 1GB)
```

**Diagnosis:**
```dart
// Memory monitoring in Flutter
import 'dart:io';

class MemoryMonitor {
  static void logMemoryUsage() {
    final info = ProcessInfo();
    print('Memory usage: ${info.maxRss ~/ 1024 ~/ 1024} MB');
  }

  static void trackWidgetLeaks() {
    // Enable widget tree debugging
    assert(() {
      debugPrintRebuildDirtyWidgets = true;
      return true;
    }());
  }
}
```

**Solution:**
```dart
// Proper resource disposal
class WorkoutScreen extends StatefulWidget {
  @override
  _WorkoutScreenState createState() => _WorkoutScreenState();
}

class _WorkoutScreenState extends State<WorkoutScreen> {
  Timer? _timer;
  StreamController? _controller;
  VideoPlayerController? _videoController;

  @override
  void dispose() {
    // Always dispose of resources
    _timer?.cancel();
    _controller?.close();
    _videoController?.dispose();
    super.dispose();
  }

  // Implement proper image caching
  Widget buildExerciseImage(String imageUrl) {
    return CachedNetworkImage(
      imageUrl: imageUrl,
      memCacheWidth: 300, // Limit image size in memory
      memCacheHeight: 200,
      placeholder: (context, url) => CircularProgressIndicator(),
      errorWidget: (context, url, error) => Icon(Icons.error),
    );
  }
}
```

#### Symptom: Slow loading and navigation
```
Performance: Screen transition taking 800ms (target: <100ms)
```

**Solution:**
```dart
// Optimize navigation and loading
class OptimizedNavigation {
  static void preloadRoute(BuildContext context, Widget route) {
    // Preload route to reduce transition time
    precacheRoute(context, route);
  }

  static Widget buildLazyList(List<WorkoutPlan> plans) {
    return ListView.builder(
      itemCount: plans.length,
      cacheExtent: 1000, // Reasonable cache size
      itemBuilder: (context, index) {
        if (index >= plans.length) return null;
        
        return WorkoutPlanTile(
          plan: plans[index],
          key: ValueKey(plans[index].id), // Stable keys for performance
        );
      },
    );
  }
}

// Implement proper pagination
class WorkoutPlanList extends StatefulWidget {
  @override
  _WorkoutPlanListState createState() => _WorkoutPlanListState();
}

class _WorkoutPlanListState extends State<WorkoutPlanList> {
  final ScrollController _scrollController = ScrollController();
  List<WorkoutPlan> _plans = [];
  bool _isLoading = false;
  int _currentPage = 0;
  final int _pageSize = 20;

  @override
  void initState() {
    super.initState();
    _loadPlans();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      _loadMorePlans();
    }
  }

  Future<void> _loadMorePlans() async {
    if (_isLoading) return;
    
    setState(() => _isLoading = true);
    
    try {
      final newPlans = await WorkoutService.getPlans(
        page: _currentPage + 1,
        pageSize: _pageSize,
      );
      
      setState(() {
        _plans.addAll(newPlans);
        _currentPage++;
        _isLoading = false;
      });
    } catch (error) {
      setState(() => _isLoading = false);
      // Handle error
    }
  }
}
```

### 4.2 Database Performance Issues

#### Symptom: Slow database queries
```
Query: SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC
Execution time: 2.3 seconds (target: <100ms)
```

**Diagnosis:**
```sql
-- Check query execution plan
EXPLAIN ANALYZE SELECT * FROM workout_plans 
WHERE user_id = 'user-123' 
ORDER BY created_at DESC;

-- Check missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'workout_plans';

-- Monitor slow queries
SELECT query, total_time, calls, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;
```

**Solution:**
```sql
-- Add necessary indexes
CREATE INDEX CONCURRENTLY idx_workout_plans_user_created 
ON workout_plans(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_workout_plans_active 
ON workout_plans(user_id) WHERE is_active = true;

-- Optimize queries with proper pagination
SELECT wp.*, u.display_name 
FROM workout_plans wp
JOIN users u ON wp.user_id = u.id
WHERE wp.user_id = $1 
  AND wp.created_at < $2  -- Cursor-based pagination
ORDER BY wp.created_at DESC
LIMIT 20;
```

```javascript
// Implement connection pooling
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Monitor pool health
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

pool.on('connect', () => {
  console.log('New database connection established');
});
```

## 5. Deployment Problems

### 5.1 Build Failures

#### Symptom: Flutter build fails with dependency conflicts
```
Error: Package 'package_info' has conflicting versions
```

**Solution:**
```yaml
# pubspec.yaml - Use dependency overrides
dependency_overrides:
  package_info_plus: ^4.0.0
  
# Clean and rebuild
flutter clean
flutter pub get
flutter pub deps  # Check dependency tree
flutter build ios --release
```

#### Symptom: Android build fails with ProGuard errors
```
Error: Missing classes during obfuscation
```

**Solution:**
```
# android/app/proguard-rules.pro
-keep class com.google.** { *; }
-keep class io.flutter.** { *; }
-keep class androidx.** { *; }

# Keep AI/ML model classes
-keep class org.tensorflow.** { *; }
-keep class ai.onnxruntime.** { *; }

# Keep serialization classes
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
```

### 5.2 App Store Rejections

#### Symptom: iOS App Store rejection for health claims
```
Guideline 5.1.1 - Legal - Privacy - Data Collection and Storage
Your app includes health-related features but does not include the required disclaimer.
```

**Solution:**
```dart
// Add health disclaimer
class HealthDisclaimer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Health Disclaimer'),
      content: Text(
        'This app is for informational purposes only and is not intended '
        'as a substitute for professional medical advice, diagnosis, or treatment. '
        'Always consult your physician before beginning any exercise program.'
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: Text('Cancel'),
        ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(true),
          child: Text('Agree'),
        ),
      ],
    );
  }
}
```

```xml
<!-- ios/Runner/Info.plist -->
<key>NSHealthUpdateUsageDescription</key>
<string>This app integrates with Health app to track workout data</string>
<key>NSHealthShareUsageDescription</key>
<string>This app reads health data to provide personalized workout recommendations</string>
```

## 6. Monitoring & Alerting

### 6.1 Production Issue Detection

```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    aiService: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Database check
    await pool.query('SELECT 1');
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Redis check
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  try {
    // AI service check
    const response = await fetch(`${AI_SERVICE_URL}/health`);
    checks.aiService = response.ok;
  } catch (error) {
    console.error('AI service health check failed:', error);
  }

  const allHealthy = Object.values(checks).every(check => 
    typeof check === 'boolean' ? check : true
  );

  res.status(allHealthy ? 200 : 503).json(checks);
});
```

### 6.2 Error Tracking Setup

```javascript
// Sentry configuration
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter out sensitive information
    if (event.request) {
      delete event.request.headers.authorization;
    }
    return event;
  }
});

// Custom error handling
class ApplicationError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, ApplicationError);
  }
}

// Global error handler
app.use((error, req, res, next) => {
  Sentry.captureException(error);
  
  if (error instanceof ApplicationError) {
    return res.status(error.statusCode).json({
      error: error.message,
      requestId: req.id
    });
  }
  
  console.error('Unexpected error:', error);
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  });
});
```

## 7. Emergency Procedures

### 7.1 Database Recovery

```bash
#!/bin/bash
# Emergency database recovery script

# 1. Stop application
docker-compose stop app

# 2. Create backup of current state
pg_dump -h localhost -U postgres fitness_app > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Restore from latest backup
psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS fitness_app;"
psql -h localhost -U postgres -c "CREATE DATABASE fitness_app;"
psql -h localhost -U postgres fitness_app < latest_backup.sql

# 4. Verify restoration
psql -h localhost -U postgres fitness_app -c "SELECT COUNT(*) FROM users;"

# 5. Restart application
docker-compose start app
```

### 7.2 Service Rollback

```bash
#!/bin/bash
# Quick rollback script

PREVIOUS_VERSION=$(git log --oneline -n 2 | tail -1 | cut -d' ' -f1)

echo "Rolling back to version: $PREVIOUS_VERSION"

# 1. Rollback code
git checkout $PREVIOUS_VERSION

# 2. Rebuild and deploy
docker build -t fitness-app:rollback .
docker tag fitness-app:rollback fitness-app:latest

# 3. Update service
kubectl set image deployment/fitness-app app=fitness-app:latest

# 4. Wait for rollout
kubectl rollout status deployment/fitness-app

echo "Rollback completed to version: $PREVIOUS_VERSION"
```

## Contact & Escalation

### Development Issues
- Check GitHub Issues: `https://github.com/your-repo/issues`
- Development Slack: `#fitness-app-dev`
- Code Review: Create PR for urgent fixes

### Production Issues
- Severity 1 (Critical): Call on-call engineer immediately
- Severity 2 (High): Page DevOps team
- Severity 3 (Medium): Create ticket for next business day

### External Dependencies
- Google Cloud Console: Check service status
- OpenAI Status Page: `https://status.openai.com`
- Flutter Issues: `https://github.com/flutter/flutter/issues`

This troubleshooting guide should be updated regularly as new issues are discovered and resolved.