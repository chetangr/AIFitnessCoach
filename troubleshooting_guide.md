# AI Fitness Coach - Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide helps developers resolve common issues encountered while building and deploying the AI Fitness Coach app. Each solution includes step-by-step debugging approaches, code fixes, and preventive measures.

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [AI Service Errors](#ai-service-errors)
3. [Sync Conflicts](#sync-conflicts)
4. [Performance Issues](#performance-issues)
5. [Deployment Problems](#deployment-problems)
6. [Database Issues](#database-issues)
7. [Mobile-Specific Issues](#mobile-specific-issues)
8. [API Integration Problems](#api-integration-problems)
9. [Development Environment Issues](#development-environment-issues)
10. [Production Emergencies](#production-emergencies)

## Authentication Issues

### Issue: Google OAuth Login Fails on iOS

**Symptoms:**
- "Authentication error" message appears
- App redirects but doesn't complete login
- Token exchange fails

**Root Causes:**
1. Incorrect URL scheme configuration
2. Missing OAuth redirect URI
3. Bundle ID mismatch

**Solution:**

1. **Verify iOS Configuration:**
```xml
<!-- ios/Runner/Info.plist -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <!-- Replace with your REVERSED_CLIENT_ID -->
            <string>com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

2. **Check Google Cloud Console:**
```bash
# Verify OAuth client configuration
1. Go to console.cloud.google.com
2. Navigate to APIs & Services > Credentials
3. Check iOS client ID configuration
4. Ensure bundle ID matches: com.yourcompany.fitnessapp
```

3. **Update Flutter Configuration:**
```dart
// lib/services/auth_service.dart
class AuthService {
  static const String IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
  static const String ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';

  Future<UserCredential?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await GoogleSignIn(
        clientId: Platform.isIOS ? IOS_CLIENT_ID : null,
        serverClientId: ANDROID_CLIENT_ID,
      ).signIn();

      if (googleUser == null) {
        print('Google sign-in cancelled by user');
        return null;
      }

      // Add detailed logging
      print('Google user: ${googleUser.email}');
      
      final GoogleSignInAuthentication googleAuth = 
        await googleUser.authentication;

      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      return await FirebaseAuth.instance.signInWithCredential(credential);
    } catch (e, stackTrace) {
      print('Google sign-in error: $e');
      print('Stack trace: $stackTrace');
      
      // Handle specific errors
      if (e.toString().contains('PlatformException')) {
        throw AuthException('Platform configuration error. Check your OAuth setup.');
      }
      rethrow;
    }
  }
}
```

**Prevention:**
- Use environment-specific configuration files
- Implement comprehensive error logging
- Test on both iOS and Android simulators before release

### Issue: JWT Token Expiration Not Handled

**Symptoms:**
- API calls return 401 Unauthorized
- User gets logged out unexpectedly
- "Invalid token" errors

**Solution:**

1. **Implement Token Refresh Logic:**
```javascript
// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthMiddleware {
  async validateToken(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is about to expire (within 1 hour)
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn < 3600) {
        res.setHeader('X-Token-Expires-Soon', 'true');
      }

      req.user = await User.findByPk(decoded.userId);
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

// backend/routes/auth.js
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );

    // Update refresh token in database
    await user.update({ refresh_token: newRefreshToken });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});
```

2. **Flutter Auto-Refresh Implementation:**
```dart
// lib/services/api_client.dart
class ApiClient {
  String? _accessToken;
  String? _refreshToken;
  
  Future<http.Response> authenticatedRequest(
    String method,
    String endpoint,
    {Map<String, dynamic>? body}
  ) async {
    // First attempt
    var response = await _makeRequest(method, endpoint, body: body);
    
    // If token expired, try refreshing
    if (response.statusCode == 401) {
      final responseBody = json.decode(response.body);
      if (responseBody['code'] == 'TOKEN_EXPIRED') {
        await _refreshAccessToken();
        // Retry request with new token
        response = await _makeRequest(method, endpoint, body: body);
      }
    }
    
    return response;
  }

  Future<void> _refreshAccessToken() async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/refresh'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'refreshToken': _refreshToken}),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      _accessToken = data['accessToken'];
      _refreshToken = data['refreshToken'];
      
      // Save to secure storage
      await secureStorage.write(key: 'access_token', value: _accessToken);
      await secureStorage.write(key: 'refresh_token', value: _refreshToken);
    } else {
      // Refresh failed, force re-login
      throw AuthException('Session expired. Please login again.');
    }
  }
}
```

## AI Service Errors

### Issue: LLM API Rate Limiting

**Symptoms:**
- 429 Too Many Requests errors
- "Rate limit exceeded" messages
- Sporadic AI coaching failures

**Solution:**

1. **Implement Rate Limiting with Queue:**
```javascript
// backend/services/rateLimiter.js
const Bull = require('bull');
const Redis = require('redis');

class LLMRateLimiter {
  constructor() {
    this.queue = new Bull('llm-requests', {
      redis: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
      }
    });

    this.requestCounts = new Map();
    this.setupQueueProcessor();
  }

  setupQueueProcessor() {
    // Process max 10 requests per second
    this.queue.process(10, async (job) => {
      const { userId, prompt, model } = job.data;
      
      try {
        const response = await this.callLLMAPI(prompt, model);
        return response;
      } catch (error) {
        if (error.status === 429) {
          // Retry with exponential backoff
          throw new Error('Rate limit hit, will retry');
        }
        throw error;
      }
    });
  }

  async queueRequest(userId, prompt, model = 'claude-3.5-sonnet') {
    // Check user-specific rate limit (100 requests per hour)
    const userKey = `rate:${userId}`;
    const now = Date.now();
    const hourAgo = now - 3600000;

    const requests = this.requestCounts.get(userKey) || [];
    const recentRequests = requests.filter(time => time > hourAgo);

    if (recentRequests.length >= 100) {
      throw new Error('User rate limit exceeded. Try again later.');
    }

    // Add to queue with priority
    const job = await this.queue.add(
      { userId, prompt, model },
      {
        priority: this.getUserPriority(userId),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        }
      }
    );

    // Track request
    recentRequests.push(now);
    this.requestCounts.set(userKey, recentRequests);

    return job.finished();
  }

  getUserPriority(userId) {
    // Premium users get higher priority
    // Implementation depends on your user system
    return 1;
  }

  async callLLMAPI(prompt, model) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = new Error(`LLM API error: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  }
}
```

2. **Implement Fallback Strategy:**
```javascript
// backend/services/aiCoaching.js
class AICoachingService {
  constructor() {
    this.rateLimiter = new LLMRateLimiter();
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 min cache
  }

  async generateResponse(userId, message, personality) {
    // Check cache first
    const cacheKey = `${userId}:${message}:${personality}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Try primary model (Claude)
      const response = await this.rateLimiter.queueRequest(
        userId,
        this.buildPrompt(message, personality),
        'claude-3.5-sonnet'
      );
      
      this.cache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Primary LLM failed:', error);
      
      // Fallback to Llama
      try {
        const response = await this.callLlamaAPI(message, personality);
        return response;
      } catch (fallbackError) {
        console.error('Fallback LLM failed:', fallbackError);
        
        // Final fallback: rule-based response
        return this.generateRuleBasedResponse(message, personality);
      }
    }
  }

  generateRuleBasedResponse(message, personality) {
    const responses = {
      aggressive: {
        default: "No excuses! Let's push through this together. What specific challenge are you facing?",
        workout: "Time to crush it! I'll help you modify your workout for maximum gains.",
        tired: "Tired? That's when champions are made! But listen to your body - what's your energy level 1-10?",
      },
      supportive: {
        default: "I'm here to help! Tell me more about what you need.",
        workout: "Let's work together to adjust your workout. What would make it better for you?",
        tired: "It's okay to feel tired. Rest is important too. How about a lighter session today?",
      },
      steady: {
        default: "Let's maintain steady progress. What aspect should we focus on?",
        workout: "Consistency is key. Let me help you optimize your routine.",
        tired: "Recovery is part of the process. Should we adjust today's intensity?",
      }
    };

    // Simple keyword matching
    const messageType = message.toLowerCase().includes('tired') ? 'tired' :
                       message.toLowerCase().includes('workout') ? 'workout' : 
                       'default';

    return {
      coaching_message: responses[personality][messageType],
      workout_modifications: null,
      fallback: true,
    };
  }
}
```

### Issue: AI Response Parsing Failures

**Symptoms:**
- "Invalid response format" errors
- Workout modifications not applied
- Coaching messages appear garbled

**Solution:**

```javascript
// backend/services/responseParser.js
class AIResponseParser {
  parseCoachingResponse(aiResponse) {
    try {
      // First, try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return this.validateParsedResponse(parsed);
        } catch (jsonError) {
          console.warn('JSON parsing failed, attempting repair');
          return this.repairAndParseJSON(jsonMatch[0]);
        }
      }

      // Fallback: Extract information using regex
      return this.extractWithRegex(aiResponse);
    } catch (error) {
      console.error('Response parsing failed:', error);
      return this.getDefaultResponse(aiResponse);
    }
  }

  repairAndParseJSON(jsonString) {
    // Common JSON issues in LLM responses
    let repaired = jsonString
      .replace(/,\s*}/, '}') // Remove trailing commas
      .replace(/,\s*]/, ']') // Remove trailing commas in arrays
      .replace(/'/g, '"')    // Replace single quotes
      .replace(/(\w+):/g, '"$1":') // Quote unquoted keys
      .replace(/\n/g, '\\n') // Escape newlines
      .replace(/\t/g, '\\t'); // Escape tabs

    try {
      return JSON.parse(repaired);
    } catch (e) {
      throw new Error('JSON repair failed');
    }
  }

  extractWithRegex(text) {
    const response = {
      coaching_message: '',
      workout_modifications: null,
      safety_notes: []
    };

    // Extract coaching message (usually before JSON or at start)
    const messageMatch = text.match(/^([^{]*?)(?:\{|$)/s);
    if (messageMatch) {
      response.coaching_message = messageMatch[1].trim();
    }

    // Extract safety warnings
    const safetyPhrases = [
      /caution[:\s]+([^.]+)/gi,
      /warning[:\s]+([^.]+)/gi,
      /be careful[:\s]+([^.]+)/gi,
      /safety[:\s]+([^.]+)/gi,
    ];

    safetyPhrases.forEach(regex => {
      const matches = text.matchAll(regex);
      for (const match of matches) {
        response.safety_notes.push(match[1].trim());
      }
    });

    // Extract workout modifications
    const exercisePattern = /(?:add|remove|replace|modify)\s+(?:exercise[:\s]+)?([^,\n]+)/gi;
    const modifications = [];
    
    const exerciseMatches = text.matchAll(exercisePattern);
    for (const match of exerciseMatches) {
      modifications.push({
        action: match[0].toLowerCase().includes('add') ? 'add' : 
                match[0].toLowerCase().includes('remove') ? 'remove' : 
                match[0].toLowerCase().includes('replace') ? 'replace' : 'modify',
        exercise: match[1].trim()
      });
    }

    if (modifications.length > 0) {
      response.workout_modifications = {
        changes: modifications,
        reasoning: 'Extracted from conversation'
      };
    }

    return response;
  }

  validateParsedResponse(parsed) {
    const required = ['coaching_message'];
    const validated = {};

    // Ensure required fields
    required.forEach(field => {
      if (!parsed[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
      validated[field] = parsed[field];
    });

    // Optional fields with defaults
    validated.workout_modifications = parsed.workout_modifications || null;
    validated.safety_notes = Array.isArray(parsed.safety_notes) 
      ? parsed.safety_notes 
      : [];

    return validated;
  }

  getDefaultResponse(originalText) {
    // If all parsing fails, at least return the text
    return {
      coaching_message: originalText.substring(0, 500),
      workout_modifications: null,
      safety_notes: [],
      parse_error: true
    };
  }
}
```

## Sync Conflicts

### Issue: Offline/Online Data Merge Conflicts

**Symptoms:**
- Data loss when coming back online
- Duplicate workout entries
- "Sync conflict" errors

**Solution:**

1. **Implement Conflict Resolution Strategy:**
```dart
// lib/services/sync_service.dart
class SyncService {
  final LocalDatabase _localDb;
  final ApiService _apiService;
  
  Future<void> syncData() async {
    try {
      // Get local changes
      final localChanges = await _localDb.getUnsyncedChanges();
      
      // Get server state
      final lastSyncTime = await _localDb.getLastSyncTime();
      final serverChanges = await _apiService.getChangesSince(lastSyncTime);
      
      // Detect conflicts
      final conflicts = _detectConflicts(localChanges, serverChanges);
      
      if (conflicts.isNotEmpty) {
        await _resolveConflicts(conflicts);
      }
      
      // Apply server changes that don't conflict
      await _applyServerChanges(serverChanges, conflicts);
      
      // Push local changes
      await _pushLocalChanges(localChanges, conflicts);
      
      // Update sync timestamp
      await _localDb.updateLastSyncTime(DateTime.now());
      
    } catch (e) {
      print('Sync failed: $e');
      throw SyncException('Failed to sync data: $e');
    }
  }

  List<DataConflict> _detectConflicts(
    List<LocalChange> local,
    List<ServerChange> server
  ) {
    final conflicts = <DataConflict>[];
    
    for (final localChange in local) {
      final serverChange = server.firstWhere(
        (s) => s.entityId == localChange.entityId &&
               s.entityType == localChange.entityType,
        orElse: () => null,
      );
      
      if (serverChange != null) {
        // Both modified the same entity
        conflicts.add(DataConflict(
          entityId: localChange.entityId,
          entityType: localChange.entityType,
          localChange: localChange,
          serverChange: serverChange,
          localTimestamp: localChange.timestamp,
          serverTimestamp: serverChange.timestamp,
        ));
      }
    }
    
    return conflicts;
  }

  Future<void> _resolveConflicts(List<DataConflict> conflicts) async {
    for (final conflict in conflicts) {
      switch (conflict.entityType) {
        case 'workout_plan':
          await _resolveWorkoutConflict(conflict);
          break;
        case 'workout_session':
          await _resolveSessionConflict(conflict);
          break;
        case 'user_settings':
          await _resolveSettingsConflict(conflict);
          break;
        default:
          // Default: server wins
          await _applyServerVersion(conflict);
      }
    }
  }

  Future<void> _resolveWorkoutConflict(DataConflict conflict) async {
    // For workout plans, merge changes intelligently
    final localPlan = conflict.localChange.data as WorkoutPlan;
    final serverPlan = conflict.serverChange.data as WorkoutPlan;
    
    // Create merged version
    final mergedPlan = WorkoutPlan(
      id: localPlan.id,
      name: localPlan.name, // Keep local name
      exercises: _mergeExercises(localPlan.exercises, serverPlan.exercises),
      lastModified: DateTime.now(),
      syncVersion: serverPlan.syncVersion + 1,
    );
    
    // Save merged version
    await _localDb.saveWorkoutPlan(mergedPlan);
    await _apiService.updateWorkoutPlan(mergedPlan);
  }

  List<Exercise> _mergeExercises(
    List<Exercise> local,
    List<Exercise> server
  ) {
    // Combine exercises, avoiding duplicates
    final merged = <String, Exercise>{};
    
    // Add all server exercises first
    for (final exercise in server) {
      merged[exercise.id] = exercise;
    }
    
    // Add/update with local exercises
    for (final exercise in local) {
      if (merged.containsKey(exercise.id)) {
        // Conflict: keep the one with more recent timestamp
        if (exercise.lastModified.isAfter(merged[exercise.id]!.lastModified)) {
          merged[exercise.id] = exercise;
        }
      } else {
        // New local exercise
        merged[exercise.id] = exercise;
      }
    }
    
    return merged.values.toList();
  }
}

// lib/models/sync_models.dart
class DataConflict {
  final String entityId;
  final String entityType;
  final LocalChange localChange;
  final ServerChange serverChange;
  final DateTime localTimestamp;
  final DateTime serverTimestamp;

  DataConflict({
    required this.entityId,
    required this.entityType,
    required this.localChange,
    required this.serverChange,
    required this.localTimestamp,
    required this.serverTimestamp,
  });

  ConflictResolution autoResolve() {
    // Auto-resolution rules
    if (entityType == 'workout_session') {
      // Sessions are immutable, keep both
      return ConflictResolution.keepBoth;
    }
    
    if (entityType == 'user_progress') {
      // Progress entries should be merged
      return ConflictResolution.merge;
    }
    
    // For other types, latest wins
    return localTimestamp.isAfter(serverTimestamp)
      ? ConflictResolution.keepLocal
      : ConflictResolution.keepServer;
  }
}
```

2. **Implement Offline Queue:**
```dart
// lib/services/offline_queue.dart
class OfflineQueue {
  final LocalDatabase _db;
  final ConnectivityService _connectivity;
  
  Future<void> enqueueRequest(ApiRequest request) async {
    final queueItem = QueueItem(
      id: Uuid().v4(),
      request: request,
      timestamp: DateTime.now(),
      retryCount: 0,
      status: QueueStatus.pending,
    );
    
    await _db.addToQueue(queueItem);
    
    // Try to process immediately if online
    if (await _connectivity.isOnline) {
      processQueue();
    }
  }

  Future<void> processQueue() async {
    final pendingItems = await _db.getPendingQueueItems();
    
    for (final item in pendingItems) {
      try {
        await _processQueueItem(item);
      } catch (e) {
        await _handleQueueItemError(item, e);
      }
    }
  }

  Future<void> _processQueueItem(QueueItem item) async {
    // Mark as processing
    await _db.updateQueueItem(item.copyWith(status: QueueStatus.processing));
    
    try {
      // Execute the request
      final response = await item.request.execute();
      
      // Handle specific request types
      if (item.request.type == RequestType.createWorkout) {
        // Update local IDs with server IDs
        await _updateLocalIds(item.request.localId, response.data['id']);
      }
      
      // Mark as completed
      await _db.updateQueueItem(item.copyWith(status: QueueStatus.completed));
      
    } catch (e) {
      throw e;
    }
  }

  Future<void> _handleQueueItemError(QueueItem item, dynamic error) async {
    if (error is NetworkException) {
      // Network error, will retry later
      return;
    }
    
    if (item.retryCount < 3) {
      // Retry with exponential backoff
      final delay = Duration(seconds: pow(2, item.retryCount).toInt());
      
      await _db.updateQueueItem(item.copyWith(
        retryCount: item.retryCount + 1,
        nextRetry: DateTime.now().add(delay),
        status: QueueStatus.pending,
      ));
    } else {
      // Max retries reached
      await _db.updateQueueItem(item.copyWith(
        status: QueueStatus.failed,
        error: error.toString(),
      ));
      
      // Notify user
      NotificationService.showError(
        'Failed to sync: ${item.request.description}'
      );
    }
  }
}
```

## Performance Issues

### Issue: App Launch Time > 5 Seconds

**Symptoms:**
- Slow cold start
- White screen during launch
- Users complaining about sluggishness

**Solution:**

1. **Optimize Flutter App Startup:**
```dart
// lib/main.dart
void main() async {
  // Minimal initialization in main
  WidgetsFlutterBinding.ensureInitialized();
  
  // Start app immediately with splash
  runApp(SplashApp());
  
  // Initialize services in parallel
  await Future.wait([
    _initializeFirebase(),
    _initializeDatabase(),
    _loadUserPreferences(),
  ]);
  
  // Switch to main app
  runApp(MyApp());
}

class SplashApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Image.asset('assets/splash.png'),
        ),
      ),
    );
  }
}

// Lazy load heavy dependencies
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Lazy initialization
        ChangeNotifierProvider(
          create: (_) => WorkoutProvider()..initLazy(),
          lazy: true,
        ),
        ChangeNotifierProvider(
          create: (_) => AICoachProvider()..initLazy(),
          lazy: true,
        ),
      ],
      child: MaterialApp(
        title: 'AI Fitness Coach',
        home: HomeScreen(),
      ),
    );
  }
}

// lib/providers/workout_provider.dart
class WorkoutProvider extends ChangeNotifier {
  List<WorkoutPlan>? _plans;
  
  // Don't load data in constructor
  WorkoutProvider();
  
  // Lazy initialization
  Future<void> initLazy() async {
    // Load only when needed
    if (_plans == null) {
      _plans = await _loadFromCache();
      notifyListeners();
      
      // Update from server in background
      _refreshFromServer();
    }
  }
  
  Future<List<WorkoutPlan>> _loadFromCache() async {
    // Quick local load
    return LocalStorage.getWorkoutPlans();
  }
  
  Future<void> _refreshFromServer() async {
    try {
      final serverPlans = await ApiService.getWorkoutPlans();
      _plans = serverPlans;
      notifyListeners();
      
      // Update cache
      await LocalStorage.saveWorkoutPlans(serverPlans);
    } catch (e) {
      // Silent fail, we have cache
    }
  }
}
```

2. **Implement Code Splitting:**
```dart
// lib/routes.dart
class Routes {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => HomeScreen());
      
      case '/ai-coach':
        // Lazy load AI coach screen
        return MaterialPageRoute(
          builder: (_) => FutureBuilder(
            future: _loadAICoachScreen(),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                return snapshot.data as Widget;
              }
              return LoadingScreen();
            },
          ),
        );
      
      case '/exercise-library':
        // Lazy load exercise library
        return MaterialPageRoute(
          builder: (_) => FutureBuilder(
            future: _loadExerciseLibrary(),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                return snapshot.data as Widget;
              }
              return LoadingScreen();
            },
          ),
        );
        
      default:
        return MaterialPageRoute(
          builder: (_) => ErrorScreen(message: 'Route not found'),
        );
    }
  }
  
  static Future<Widget> _loadAICoachScreen() async {
    // Dynamic import
    final module = await import('package:fitness_app/screens/ai_coach_screen.dart');
    return module.AICoachScreen();
  }
  
  static Future<Widget> _loadExerciseLibrary() async {
    final module = await import('package:fitness_app/screens/exercise_library_screen.dart');
    return module.ExerciseLibraryScreen();
  }
}
```

### Issue: Memory Leaks in Flutter App

**Symptoms:**
- App crashes after extended use
- Increasing memory usage over time
- "Lost connection to device" errors

**Solution:**

```dart
// lib/screens/workout_screen.dart
class WorkoutScreen extends StatefulWidget {
  @override
  _WorkoutScreenState createState() => _WorkoutScreenState();
}

class _WorkoutScreenState extends State<WorkoutScreen> {
  StreamSubscription? _timerSubscription;
  Timer? _workoutTimer;
  final List<StreamSubscription> _subscriptions = [];
  
  @override
  void initState() {
    super.initState();
    _initializeWorkout();
  }
  
  void _initializeWorkout() {
    // Properly manage stream subscriptions
    _subscriptions.add(
      WorkoutService.workoutStream.listen((event) {
        if (mounted) {
          setState(() {
            // Update UI
          });
        }
      })
    );
    
    // Timer with proper cleanup
    _workoutTimer = Timer.periodic(Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          // Update timer
        });
      } else {
        timer.cancel();
      }
    });
  }
  
  @override
  void dispose() {
    // Clean up all subscriptions
    for (final subscription in _subscriptions) {
      subscription.cancel();
    }
    
    // Cancel timers
    _workoutTimer?.cancel();
    _timerSubscription?.cancel();
    
    // Dispose controllers
    _animationController?.dispose();
    
    super.dispose();
  }

  // Avoid keeping references to disposed widgets
  void _handleWorkoutComplete() {
    if (!mounted) return;
    
    // Clean up resources
    _workoutTimer?.cancel();
    
    // Navigate safely
    Navigator.of(context).pushReplacementNamed('/workout-complete');
  }
}

// Memory-efficient image handling
class ExerciseImage extends StatelessWidget {
  final String imageUrl;
  final double width;
  final double height;
  
  @override
  Widget build(BuildContext context) {
    return CachedNetworkImage(
      imageUrl: imageUrl,
      width: width,
      height: height,
      memCacheWidth: width.toInt(),  // Resize in memory
      memCacheHeight: height.toInt(),
      placeholder: (context, url) => Shimmer.fromColors(
        baseColor: Colors.grey[300]!,
        highlightColor: Colors.grey[100]!,
        child: Container(
          width: width,
          height: height,
          color: Colors.white,
        ),
      ),
      errorWidget: (context, url, error) => Icon(Icons.error),
    );
  }
}
```

### Issue: Slow Database Queries

**Symptoms:**
- API endpoints taking > 2 seconds
- Timeout errors
- Database CPU spikes

**Solution:**

1. **Add Missing Indexes:**
```sql
-- Check slow queries
EXPLAIN ANALYZE
SELECT wp.*, u.display_name, u.fitness_level
FROM workout_plans wp
JOIN users u ON wp.user_id = u.id
WHERE wp.user_id = 'uuid-here'
  AND wp.is_active = true
ORDER BY wp.created_at DESC;

-- Add composite indexes
CREATE INDEX idx_workout_plans_user_active 
ON workout_plans(user_id, is_active, created_at DESC);

-- Index for text search
CREATE INDEX idx_exercises_name_trgm 
ON exercises USING gin(name gin_trgm_ops);

-- Index for JSON queries
CREATE INDEX idx_exercises_muscle_groups_gin 
ON exercises USING gin(muscle_groups);

-- Partial index for active records
CREATE INDEX idx_workout_sessions_active 
ON workout_sessions(user_id, completed_at) 
WHERE completed_at IS NULL;
```

2. **Optimize N+1 Queries:**
```javascript
// backend/services/workoutService.js
class WorkoutService {
  // Bad: N+1 query
  async getWorkoutPlansWithExercisesBad(userId) {
    const plans = await WorkoutPlan.findAll({
      where: { user_id: userId }
    });
    
    // This creates N additional queries!
    for (const plan of plans) {
      plan.exercises = await Exercise.findAll({
        where: { 
          id: plan.exercise_ids 
        }
      });
    }
    
    return plans;
  }
  
  // Good: Eager loading
  async getWorkoutPlansWithExercises(userId) {
    const plans = await WorkoutPlan.findAll({
      where: { user_id: userId },
      include: [{
        model: Exercise,
        through: { attributes: ['sets', 'reps', 'rest_seconds'] },
        required: false
      }],
      order: [['created_at', 'DESC']]
    });
    
    return plans;
  }
  
  // Better: Raw query for complex joins
  async getWorkoutAnalytics(userId) {
    const query = `
      WITH workout_stats AS (
        SELECT 
          wp.id,
          wp.name,
          COUNT(DISTINCT ws.id) as session_count,
          AVG(ws.duration_minutes) as avg_duration,
          MAX(ws.completed_at) as last_completed
        FROM workout_plans wp
        LEFT JOIN workout_sessions ws ON ws.plan_id = wp.id
        WHERE wp.user_id = $1
        GROUP BY wp.id, wp.name
      ),
      exercise_stats AS (
        SELECT
          wpe.plan_id,
          COUNT(DISTINCT e.muscle_groups) as muscle_groups_targeted,
          SUM(wpe.sets * wpe.reps) as total_volume
        FROM workout_plan_exercises wpe
        JOIN exercises e ON e.id = wpe.exercise_id
        GROUP BY wpe.plan_id
      )
      SELECT 
        ws.*,
        es.muscle_groups_targeted,
        es.total_volume
      FROM workout_stats ws
      LEFT JOIN exercise_stats es ON es.plan_id = ws.id
      ORDER BY ws.last_completed DESC NULLS LAST;
    `;
    
    const results = await sequelize.query(query, {
      bind: [userId],
      type: QueryTypes.SELECT
    });
    
    return results;
  }
}
```

## Deployment Problems

### Issue: App Store Rejection - iOS

**Common Rejection Reasons:**
1. Crashes on review devices
2. Missing privacy policy
3. Inappropriate content
4. Performance issues
5. Guideline violations

**Solutions:**

1. **Pre-Submission Checklist:**
```bash
#!/bin/bash
# pre-submission-check.sh

echo "iOS App Store Pre-Submission Checklist"
echo "======================================"

# Check for common issues
echo "1. Checking Info.plist..."
if ! grep -q "NSCameraUsageDescription" ios/Runner/Info.plist; then
  echo "❌ Missing NSCameraUsageDescription"
else
  echo "✅ Camera usage description present"
fi

if ! grep -q "NSPhotoLibraryUsageDescription" ios/Runner/Info.plist; then
  echo "❌ Missing NSPhotoLibraryUsageDescription"
else
  echo "✅ Photo library usage description present"
fi

# Check for debug code
echo "2. Checking for debug code..."
if grep -r "print(" lib/ | grep -v "test/"; then
  echo "⚠️  Found print statements in production code"
fi

# Check app size
echo "3. Checking app size..."
flutter build ios --release
IPA_SIZE=$(du -h build/ios/iphoneos/Runner.app | cut -f1)
echo "App size: $IPA_SIZE"

# Run tests
echo "4. Running tests..."
flutter test

# Check for crashes
echo "5. Testing on simulators..."
xcrun simctl list devices

echo "
Next Steps:
1. Test on physical devices
2. Check privacy policy URL
3. Review screenshots
4. Test in-app purchases
5. Verify age rating
"
```

2. **Privacy Policy Implementation:**
```dart
// lib/screens/settings_screen.dart
class SettingsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Settings')),
      body: ListView(
        children: [
          ListTile(
            title: Text('Privacy Policy'),
            trailing: Icon(Icons.arrow_forward_ios),
            onTap: () => _launchURL('https://yourapp.com/privacy'),
          ),
          ListTile(
            title: Text('Terms of Service'),
            trailing: Icon(Icons.arrow_forward_ios),
            onTap: () => _launchURL('https://yourapp.com/terms'),
          ),
          ListTile(
            title: Text('Data & Privacy'),
            trailing: Icon(Icons.arrow_forward_ios),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => DataPrivacyScreen()),
            ),
          ),
          SwitchListTile(
            title: Text('Analytics'),
            subtitle: Text('Help us improve the app'),
            value: _analyticsEnabled,
            onChanged: (value) => _toggleAnalytics(value),
          ),
          ListTile(
            title: Text('Delete Account'),
            textColor: Colors.red,
            onTap: () => _showDeleteAccountDialog(context),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Delete Account'),
        content: Text(
          'This will permanently delete your account and all associated data. '
          'This action cannot be undone.'
        ),
        actions: [
          TextButton(
            child: Text('Cancel'),
            onPressed: () => Navigator.pop(context),
          ),
          TextButton(
            child: Text('Delete', style: TextStyle(color: Colors.red)),
            onPressed: () => _deleteAccount(context),
          ),
        ],
      ),
    );
  }
}
```

### Issue: Build Failures in CI/CD

**Symptoms:**
- "Build failed" in GitHub Actions
- Dependency conflicts
- Environment variable issues

**Solution:**

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-backend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-node-
    
    - name: Install dependencies
      run: |
        npm ci
        npm audit fix --audit-level=high
    
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      env:
        NODE_ENV: production
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: backend-build
        path: dist/

  build-flutter:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.16.0'
        channel: 'stable'
        cache: true
    
    - name: Install dependencies
      run: |
        flutter pub get
        cd ios && pod install
    
    - name: Generate build files
      run: |
        flutter pub run build_runner build --delete-conflicting-outputs
    
    - name: Run tests
      run: flutter test
    
    - name: Build iOS
      run: |
        flutter build ios --release --no-codesign
      env:
        FLUTTER_BUILD_MODE: release
    
    - name: Build Android
      run: |
        flutter build apk --release
        flutter build appbundle --release
      
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: app-builds
        path: |
          build/app/outputs/flutter-apk/app-release.apk
          build/app/outputs/bundle/release/app-release.aab

  deploy:
    needs: [build-backend, build-flutter]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Download artifacts
      uses: actions/download-artifact@v3
    
    - name: Deploy to server
      run: |
        # Deploy backend
        scp -r backend-build/* ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:/app/
        
        # Restart services
        ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} 'pm2 restart all'
```

## Mobile-Specific Issues

### Issue: iOS Simulator Can't Connect to Local Backend

**Symptoms:**
- "Network request failed"
- "Could not connect to server"
- Works on Android but not iOS

**Solution:**

```javascript
// backend/server.js
const express = require('express');
const app = express();

// IMPORTANT: Listen on all interfaces for iOS simulator
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Not 'localhost' or '127.0.0.1'

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
```

```dart
// lib/config/api_config.dart
class ApiConfig {
  static String get baseUrl {
    if (kDebugMode) {
      // iOS Simulator
      if (Platform.isIOS) {
        return 'http://localhost:3000/api';  // iOS can use localhost
      }
      // Android Emulator
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:3000/api';  // Android special IP
      }
    }
    
    // Production
    return 'https://api.yourfitnessapp.com/api';
  }
}
```

### Issue: Flutter App Crashes on Real Device but Works in Simulator

**Symptoms:**
- App crashes immediately on launch
- Works fine in simulator/emulator
- No crash logs available

**Solution:**

1. **Enable Crash Reporting:**
```dart
// lib/main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Catch Flutter errors
  FlutterError.onError = (FlutterErrorDetails details) {
    if (kReleaseMode) {
      // Send to crash reporting service
      FirebaseCrashlytics.instance.recordFlutterFatalError(details);
    } else {
      // In debug mode, print to console
      FlutterError.dumpErrorToConsole(details);
    }
  };
  
  // Catch async errors
  runZonedGuarded(
    () => runApp(MyApp()),
    (error, stack) {
      if (kReleaseMode) {
        FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      } else {
        print('Async error: $error');
        print(stack);
      }
    },
  );
}
```

2. **Debug on Physical Device:**
```bash
# Enable verbose logging
flutter run --verbose

# Check device logs - iOS
idevicesyslog | grep Runner

# Check device logs - Android
adb logcat | grep flutter

# Profile mode for performance issues
flutter run --profile
```

3. **Common Physical Device Issues:**
```dart
// lib/utils/device_utils.dart
class DeviceUtils {
  // Check for required permissions
  static Future<bool> checkPermissions() async {
    if (Platform.isIOS) {
      // iOS specific permissions
      final cameraStatus = await Permission.camera.status;
      final photosStatus = await Permission.photos.status;
      
      if (cameraStatus.isDenied || photosStatus.isDenied) {
        return false;
      }
    }
    
    if (Platform.isAndroid) {
      // Android specific permissions
      final storageStatus = await Permission.storage.status;
      
      if (storageStatus.isDenied) {
        return false;
      }
    }
    
    return true;
  }
  
  // Handle missing permissions gracefully
  static Future<void> requestPermissions() async {
    final permissions = [
      Permission.camera,
      Permission.photos,
      Permission.notification,
    ];
    
    Map<Permission, PermissionStatus> statuses = 
      await permissions.request();
    
    statuses.forEach((permission, status) {
      if (status.isPermanentlyDenied) {
        // Open app settings
        openAppSettings();
      }
    });
  }
}
```

## Emergency Response Procedures

### Production Down Scenarios

1. **Database Connection Lost:**
```bash
# Quick diagnosis
curl -f http://localhost:3000/health || echo "API is down"
pg_isready -h localhost -p 5432 || echo "PostgreSQL is down"

# Restart services
sudo systemctl restart postgresql
pm2 restart api-server

# If database corrupted
pg_dump -h backup-server dbname > emergency-backup.sql
psql -h localhost dbname < last-known-good-backup.sql
```

2. **API Server Crash Loop:**
```javascript
// emergency-server.js
const express = require('express');
const app = express();

// Minimal emergency API
app.get('/health', (req, res) => {
  res.json({ 
    status: 'emergency_mode',
    message: 'System is under maintenance'
  });
});

app.all('*', (req, res) => {
  res.status(503).json({
    error: 'Service temporarily unavailable',
    maintenance: true
  });
});

app.listen(3000, () => {
  console.log('Emergency server running');
});
```

3. **Rollback Procedures:**
```bash
#!/bin/bash
# rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Usage: ./rollback.sh <version>"
  exit 1
fi

echo "Rolling back to version $PREVIOUS_VERSION"

# Backend rollback
cd /app
git fetch --tags
git checkout $PREVIOUS_VERSION
npm install
npm run build
pm2 restart all

# Database rollback if needed
psql -U postgres -d fitnessapp -f migrations/rollback-$PREVIOUS_VERSION.sql

# Clear caches
redis-cli FLUSHALL

echo "Rollback complete"
```

## Prevention Best Practices

1. **Implement Comprehensive Logging:**
```javascript
// backend/utils/logger.js
const winston = require('winston');
const Sentry = require('@sentry/node');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-fitness-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Integrate with Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  }
});

module.exports = logger;
```

2. **Add Health Checks:**
```javascript
// backend/routes/health.js
router.get('/health', async (req, res) => {
  const checks = {
    api: 'ok',
    database: 'checking',
    redis: 'checking',
    ai_service: 'checking'
  };

  // Check database
  try {
    await sequelize.authenticate();
    checks.database = 'ok';
  } catch (e) {
    checks.database = 'error';
  }

  // Check Redis
  try {
    await redisClient.ping();
    checks.redis = 'ok';
  } catch (e) {
    checks.redis = 'error';
  }

  // Check AI service
  try {
    const testResponse = await aiService.healthCheck();
    checks.ai_service = testResponse ? 'ok' : 'error';
  } catch (e) {
    checks.ai_service = 'error';
  }

  const allOk = Object.values(checks).every(status => status === 'ok');
  
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks
  });
});
```

This troubleshooting guide provides comprehensive solutions for the most common issues you'll encounter while developing the AI Fitness Coach app. Keep it handy and update it with new issues and solutions as you discover them.