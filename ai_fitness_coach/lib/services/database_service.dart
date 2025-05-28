import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../providers/user_preferences_provider.dart';

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
}