import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../providers/user_preferences_provider.dart';
import '../data/models/user_model.dart';
import '../models/workout.dart';
import 'auth_service.dart';

/// Database Service using SharedPreferences for local storage
/// 
/// NOTE: This is a temporary implementation for MVP. 
/// See docs/data_storage_migration_guide.md for migration plan to SQLite.
/// 
/// Current limitations:
/// - No relational queries
/// - ~1MB storage limit on Android
/// - No concurrent access control
/// - No ACID transactions
/// 
/// TODO: Migrate to SQLite when:
/// - Message history > 1000 messages
/// - Coach swaps > 100 records  
/// - App startup time > 2 seconds

class DatabaseService {
  static const String _coachSwapsKey = 'coach_swaps';
  static const String _workoutStatsKey = 'workout_stats';
  static const String _userStatsKey = 'user_stats';
  static const String _usersKey = 'users';
  static const String _savedWorkoutsKey = 'saved_workouts';
  static const String _customExercisesKey = 'custom_exercises';

  // Record a coach swap
  Future<void> recordCoachSwap(CoachSwapRecord swapRecord) async {
    final prefs = await SharedPreferences.getInstance();
    
    // Get existing swaps
    final swapsJson = prefs.getString(_coachSwapsKey);
    final List<dynamic> swaps = swapsJson != null ? json.decode(swapsJson) : [];
    
    // Add new swap
    swaps.add(swapRecord.toJson());
    
    // Save back to preferences
    await prefs.setString(_coachSwapsKey, json.encode(swaps));
  }

  // Get all coach swaps for a user
  Future<List<Map<String, dynamic>>> getCoachSwaps(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final swapsJson = prefs.getString(_coachSwapsKey);
    
    if (swapsJson == null) return [];
    
    final List<dynamic> allSwaps = json.decode(swapsJson);
    return allSwaps
        .where((swap) => swap['userId'] == userId)
        .map((swap) => swap as Map<String, dynamic>)
        .toList();
  }

  // Save workout stats
  Future<void> saveWorkoutStats({
    required int workoutCount,
    required double totalHours,
    required int totalCalories,
    required int streakDays,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    
    final stats = {
      'workoutCount': workoutCount,
      'totalHours': totalHours,
      'totalCalories': totalCalories,
      'streakDays': streakDays,
      'lastUpdated': DateTime.now().toIso8601String(),
    };
    
    await prefs.setString(_workoutStatsKey, json.encode(stats));
  }

  // Get workout stats
  Future<Map<String, dynamic>> getWorkoutStats() async {
    final prefs = await SharedPreferences.getInstance();
    final statsJson = prefs.getString(_workoutStatsKey);
    
    if (statsJson == null) {
      return {
        'workoutCount': 0,
        'totalHours': 0.0,
        'totalCalories': 0,
        'streakDays': 0,
      };
    }
    
    return json.decode(statsJson);
  }

  // Save weekly activity data
  Future<void> saveWeeklyActivity(List<double> activityValues) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('weekly_activity', json.encode(activityValues));
  }

  // Get weekly activity data
  Future<List<double>> getWeeklyActivity() async {
    final prefs = await SharedPreferences.getInstance();
    final activityJson = prefs.getString('weekly_activity');
    
    if (activityJson == null) {
      // Return default values for the week
      return [0.6, 0.8, 0.4, 0.9, 0.7, 0.3, 0.0];
    }
    
    return List<double>.from(json.decode(activityJson));
  }

  // Update user stats after workout
  Future<void> updateUserStats({
    required int caloriesBurned,
    required double workoutDuration,
    required int xpEarned,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    
    // Get current stats
    final stats = await getWorkoutStats();
    
    // Update stats
    final newStats = {
      'workoutCount': (stats['workoutCount'] ?? 0) + 1,
      'totalHours': (stats['totalHours'] ?? 0.0) + workoutDuration,
      'totalCalories': (stats['totalCalories'] ?? 0) + caloriesBurned,
      'streakDays': _calculateStreak(stats['lastWorkout']),
      'lastWorkout': DateTime.now().toIso8601String(),
    };
    
    await saveWorkoutStats(
      workoutCount: newStats['workoutCount'],
      totalHours: newStats['totalHours'],
      totalCalories: newStats['totalCalories'],
      streakDays: newStats['streakDays'],
    );
  }

  // Calculate streak days
  int _calculateStreak(String? lastWorkoutStr) {
    if (lastWorkoutStr == null) return 1;
    
    final lastWorkout = DateTime.parse(lastWorkoutStr);
    final now = DateTime.now();
    final difference = now.difference(lastWorkout).inDays;
    
    // If last workout was yesterday or today, continue streak
    if (difference <= 1) {
      return 1; // This would need to track actual streak count
    }
    
    // Streak broken
    return 1;
  }

  // Get achievements
  Future<List<Map<String, String>>> getAchievements() async {
    final stats = await getWorkoutStats();
    final achievements = <Map<String, String>>[];
    
    // Check for various achievements
    if (stats['streakDays'] >= 7) {
      achievements.add({'emoji': '🔥', 'title': '7 Day Streak'});
    }
    
    if (stats['workoutCount'] >= 100) {
      achievements.add({'emoji': '💪', 'title': '100 Workouts'});
    }
    
    if (stats['workoutCount'] >= 50) {
      achievements.add({'emoji': '⚡', 'title': 'Power User'});
    }
    
    if (stats['totalCalories'] >= 10000) {
      achievements.add({'emoji': '🏆', 'title': 'Goal Crusher'});
    }
    
    return achievements;
  }

  // User Management Methods
  
  // Save user data
  Future<void> saveUser(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    
    // Get existing users
    final usersJson = prefs.getString(_usersKey);
    final Map<String, dynamic> users = usersJson != null ? json.decode(usersJson) : {};
    
    // Add/update user
    users[user.id] = user.toJson();
    
    // Save back to preferences
    await prefs.setString(_usersKey, json.encode(users));
  }
  
  // Get user by ID
  Future<UserModel?> getUser(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final usersJson = prefs.getString(_usersKey);
    
    if (usersJson == null) return null;
    
    final Map<String, dynamic> users = json.decode(usersJson);
    final userData = users[userId];
    
    if (userData == null) return null;
    
    return UserModel.fromJson(userData);
  }
  
  // Get all users
  Future<List<UserModel>> getAllUsers() async {
    final prefs = await SharedPreferences.getInstance();
    final usersJson = prefs.getString(_usersKey);
    
    if (usersJson == null) return [];
    
    final Map<String, dynamic> users = json.decode(usersJson);
    return users.values.map((userData) => UserModel.fromJson(userData)).toList();
  }
  
  // Save workout to user's saved list
  Future<void> saveWorkoutToUser(String userId, WorkoutPlan workout) async {
    final prefs = await SharedPreferences.getInstance();
    final key = '${_savedWorkoutsKey}_$userId';
    
    // Get existing saved workouts
    final savedJson = prefs.getString(key);
    final List<dynamic> savedWorkouts = savedJson != null ? json.decode(savedJson) : [];
    
    // Add new workout
    savedWorkouts.add({
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'workoutId': workout.id,
      'name': workout.name,
      'description': workout.description,
      'difficulty': workout.difficulty.name,
      'duration': workout.duration,
      'type': workout.type.name,
      'calories': workout.calories,
      'savedAt': DateTime.now().toIso8601String(),
    });
    
    // Save back to preferences
    await prefs.setString(key, json.encode(savedWorkouts));
  }
  
  // Save workout for current user
  Future<void> saveWorkout(WorkoutPlan workout) async {
    final authService = AuthService();
    final user = await authService.getCurrentUser();
    if (user != null) {
      await saveWorkoutToUser(user.id, workout);
    } else {
      throw Exception('No user logged in');
    }
  }
  
  // Get user's saved workouts
  Future<List<Map<String, dynamic>>> getSavedWorkouts(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final key = '${_savedWorkoutsKey}_$userId';
    final savedJson = prefs.getString(key);
    
    if (savedJson == null) return [];
    
    return List<Map<String, dynamic>>.from(json.decode(savedJson));
  }
  
  // Save custom exercise
  Future<void> saveCustomExercise(String userId, Map<String, dynamic> exercise) async {
    final prefs = await SharedPreferences.getInstance();
    final key = '${_customExercisesKey}_$userId';
    
    // Get existing custom exercises
    final exercisesJson = prefs.getString(key);
    final List<dynamic> exercises = exercisesJson != null ? json.decode(exercisesJson) : [];
    
    // Add new exercise
    exercises.add({
      ...exercise,
      'createdAt': DateTime.now().toIso8601String(),
      'createdBy': userId,
    });
    
    // Save back to preferences
    await prefs.setString(key, json.encode(exercises));
  }
  
  // Get user's custom exercises
  Future<List<Map<String, dynamic>>> getCustomExercises(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final key = '${_customExercisesKey}_$userId';
    final exercisesJson = prefs.getString(key);
    
    if (exercisesJson == null) return [];
    
    return List<Map<String, dynamic>>.from(json.decode(exercisesJson));
  }
  
  // Get user-specific stats
  Future<Map<String, dynamic>> getUserStats(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final key = '${_userStatsKey}_$userId';
    final statsJson = prefs.getString(key);
    
    if (statsJson == null) {
      return {
        'workoutCount': 0,
        'totalHours': 0.0,
        'totalCalories': 0,
        'streakDays': 0,
        'currentStreak': 0,
        'longestStreak': 0,
      };
    }
    
    return json.decode(statsJson);
  }
  
  // Update user-specific stats
  Future<void> updateUserSpecificStats({
    required String userId,
    required int caloriesBurned,
    required double workoutDuration,
    required int xpEarned,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final key = '${_userStatsKey}_$userId';
    
    // Get current stats
    final stats = await getUserStats(userId);
    
    // Update stats
    final newStats = {
      'workoutCount': (stats['workoutCount'] ?? 0) + 1,
      'totalHours': (stats['totalHours'] ?? 0.0) + workoutDuration,
      'totalCalories': (stats['totalCalories'] ?? 0) + caloriesBurned,
      'streakDays': _calculateStreak(stats['lastWorkout']),
      'currentStreak': _updateCurrentStreak(stats['lastWorkout'], stats['currentStreak'] ?? 0),
      'longestStreak': _updateLongestStreak(stats['currentStreak'] ?? 0, stats['longestStreak'] ?? 0),
      'lastWorkout': DateTime.now().toIso8601String(),
    };
    
    await prefs.setString(key, json.encode(newStats));
  }
  
  int _updateCurrentStreak(String? lastWorkoutStr, int currentStreak) {
    if (lastWorkoutStr == null) return 1;
    
    final lastWorkout = DateTime.parse(lastWorkoutStr);
    final now = DateTime.now();
    final difference = now.difference(lastWorkout).inDays;
    
    if (difference <= 1) {
      return currentStreak + 1;
    }
    
    return 1;
  }
  
  int _updateLongestStreak(int currentStreak, int longestStreak) {
    return currentStreak > longestStreak ? currentStreak : longestStreak;
  }
}