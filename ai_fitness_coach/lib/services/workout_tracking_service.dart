import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/workout.dart';
import '../providers/user_preferences_provider.dart';

class CompletedWorkout {
  final String id;
  final String workoutPlanId;
  final String workoutName;
  final DateTime completedDate;
  final DateTime? originalScheduledDate; // New field for cross-day tracking
  final Duration duration;
  final int exercisesCompleted;
  final List<String> exerciseNames;
  final String workoutType; // 'scheduled', 'manual', 'custom'
  
  CompletedWorkout({
    required this.id,
    required this.workoutPlanId,
    required this.workoutName,
    required this.completedDate,
    this.originalScheduledDate,
    required this.duration,
    required this.exercisesCompleted,
    required this.exerciseNames,
    required this.workoutType,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'workoutPlanId': workoutPlanId,
      'workoutName': workoutName,
      'completedDate': completedDate.toIso8601String(),
      'originalScheduledDate': originalScheduledDate?.toIso8601String(),
      'duration': duration.inSeconds,
      'exercisesCompleted': exercisesCompleted,
      'exerciseNames': exerciseNames,
      'workoutType': workoutType,
    };
  }

  factory CompletedWorkout.fromJson(Map<String, dynamic> json) {
    return CompletedWorkout(
      id: json['id'],
      workoutPlanId: json['workoutPlanId'],
      workoutName: json['workoutName'],
      completedDate: DateTime.parse(json['completedDate']),
      originalScheduledDate: json['originalScheduledDate'] != null 
          ? DateTime.parse(json['originalScheduledDate'])
          : null,
      duration: Duration(seconds: json['duration']),
      exercisesCompleted: json['exercisesCompleted'],
      exerciseNames: List<String>.from(json['exerciseNames']),
      workoutType: json['workoutType'],
    );
  }
}

class WorkoutTrackingService {
  final SharedPreferences _prefs;
  static const String _completedWorkoutsKey = 'completed_workouts';

  WorkoutTrackingService(this._prefs);

  // Record a completed workout
  Future<void> recordCompletedWorkout({
    required String workoutPlanId,
    required String workoutName,
    required Duration duration,
    required List<Exercise> exercises,
    String workoutType = 'scheduled',
    DateTime? customDate,
    DateTime? originalScheduledDate,
  }) async {
    final completedWorkout = CompletedWorkout(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      workoutPlanId: workoutPlanId,
      workoutName: workoutName,
      completedDate: customDate ?? DateTime.now(),
      originalScheduledDate: originalScheduledDate,
      duration: duration,
      exercisesCompleted: exercises.length,
      exerciseNames: exercises.map((e) => e.name).toList(),
      workoutType: workoutType,
    );

    final completedWorkouts = await getCompletedWorkouts();
    completedWorkouts.add(completedWorkout);
    
    await _saveCompletedWorkouts(completedWorkouts);
  }

  // Get all completed workouts
  Future<List<CompletedWorkout>> getCompletedWorkouts() async {
    final workoutsJson = _prefs.getString(_completedWorkoutsKey);
    if (workoutsJson == null) return [];

    try {
      final List<dynamic> workoutsList = json.decode(workoutsJson);
      return workoutsList
          .map((json) => CompletedWorkout.fromJson(json))
          .toList();
    } catch (e) {
      print('Error loading completed workouts: $e');
      return [];
    }
  }

  // Get workouts for a specific date
  Future<List<CompletedWorkout>> getWorkoutsForDate(DateTime date) async {
    final allWorkouts = await getCompletedWorkouts();
    return allWorkouts.where((workout) {
      return workout.completedDate.year == date.year &&
             workout.completedDate.month == date.month &&
             workout.completedDate.day == date.day;
    }).toList();
  }

  // Get workouts for a date range
  Future<List<CompletedWorkout>> getWorkoutsForDateRange(
    DateTime startDate,
    DateTime endDate,
  ) async {
    final allWorkouts = await getCompletedWorkouts();
    return allWorkouts.where((workout) {
      return workout.completedDate.isAfter(startDate.subtract(const Duration(days: 1))) &&
             workout.completedDate.isBefore(endDate.add(const Duration(days: 1)));
    }).toList();
  }

  // Get workout statistics
  Future<Map<String, dynamic>> getWorkoutStats() async {
    final completedWorkouts = await getCompletedWorkouts();
    
    if (completedWorkouts.isEmpty) {
      return {
        'totalWorkouts': 0,
        'totalDuration': Duration.zero,
        'averageDuration': Duration.zero,
        'totalExercises': 0,
        'workoutsByType': <String, int>{},
        'workoutsThisWeek': 0,
        'workoutsThisMonth': 0,
      };
    }

    final now = DateTime.now();
    final weekStart = now.subtract(Duration(days: now.weekday - 1));
    final monthStart = DateTime(now.year, now.month, 1);

    final totalDuration = completedWorkouts.fold<Duration>(
      Duration.zero,
      (sum, workout) => sum + workout.duration,
    );

    final workoutsByType = <String, int>{};
    for (final workout in completedWorkouts) {
      workoutsByType[workout.workoutType] = 
          (workoutsByType[workout.workoutType] ?? 0) + 1;
    }

    final workoutsThisWeek = completedWorkouts
        .where((w) => w.completedDate.isAfter(weekStart))
        .length;

    final workoutsThisMonth = completedWorkouts
        .where((w) => w.completedDate.isAfter(monthStart))
        .length;

    return {
      'totalWorkouts': completedWorkouts.length,
      'totalDuration': totalDuration,
      'averageDuration': Duration(
        seconds: totalDuration.inSeconds ~/ completedWorkouts.length,
      ),
      'totalExercises': completedWorkouts.fold<int>(
        0,
        (sum, workout) => sum + workout.exercisesCompleted,
      ),
      'workoutsByType': workoutsByType,
      'workoutsThisWeek': workoutsThisWeek,
      'workoutsThisMonth': workoutsThisMonth,
    };
  }

  // Check if there are workouts for today
  Future<bool> hasWorkoutToday() async {
    final today = DateTime.now();
    final todayWorkouts = await getWorkoutsForDate(today);
    return todayWorkouts.isNotEmpty;
  }

  // Get current streak (consecutive days with workouts)
  Future<int> getCurrentStreak() async {
    final completedWorkouts = await getCompletedWorkouts();
    if (completedWorkouts.isEmpty) return 0;

    // Group workouts by date
    final workoutDates = <DateTime>{};
    for (final workout in completedWorkouts) {
      final date = DateTime(
        workout.completedDate.year,
        workout.completedDate.month,
        workout.completedDate.day,
      );
      workoutDates.add(date);
    }

    // Sort dates in descending order
    final sortedDates = workoutDates.toList()..sort((a, b) => b.compareTo(a));

    int streak = 0;
    DateTime currentDate = DateTime.now();
    currentDate = DateTime(currentDate.year, currentDate.month, currentDate.day);

    // Check if today has a workout, if not start from yesterday
    if (!sortedDates.contains(currentDate)) {
      currentDate = currentDate.subtract(const Duration(days: 1));
    }

    // Count consecutive days with workouts
    for (final date in sortedDates) {
      if (date.isAtSameMomentAs(currentDate)) {
        streak++;
        currentDate = currentDate.subtract(const Duration(days: 1));
      } else {
        break;
      }
    }

    return streak;
  }

  // Delete a completed workout
  Future<void> deleteCompletedWorkout(String workoutId) async {
    final completedWorkouts = await getCompletedWorkouts();
    completedWorkouts.removeWhere((workout) => workout.id == workoutId);
    await _saveCompletedWorkouts(completedWorkouts);
  }

  // Save completed workouts to SharedPreferences
  Future<void> _saveCompletedWorkouts(List<CompletedWorkout> workouts) async {
    final workoutsJson = json.encode(
      workouts.map((workout) => workout.toJson()).toList(),
    );
    await _prefs.setString(_completedWorkoutsKey, workoutsJson);
  }

  // Clear all completed workouts (for testing/reset)
  Future<void> clearAllWorkouts() async {
    await _prefs.remove(_completedWorkoutsKey);
  }
}

// Provider for workout tracking service
final workoutTrackingServiceProvider = Provider<WorkoutTrackingService>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return WorkoutTrackingService(prefs);
});

// Provider for completed workouts stream
final completedWorkoutsProvider = FutureProvider<List<CompletedWorkout>>((ref) {
  final service = ref.watch(workoutTrackingServiceProvider);
  return service.getCompletedWorkouts();
});

// Provider for workout statistics
final workoutStatsProvider = FutureProvider<Map<String, dynamic>>((ref) {
  final service = ref.watch(workoutTrackingServiceProvider);
  return service.getWorkoutStats();
});

// Provider for workouts on a specific date
final workoutsForDateProvider = FutureProvider.family<List<CompletedWorkout>, DateTime>((ref, date) {
  final service = ref.watch(workoutTrackingServiceProvider);
  return service.getWorkoutsForDate(date);
});