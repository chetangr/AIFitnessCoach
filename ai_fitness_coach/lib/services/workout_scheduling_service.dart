import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/workout.dart';
import '../providers/user_preferences_provider.dart';

class ScheduledWorkout {
  final String id;
  final String workoutPlanId;
  final String workoutName;
  final DateTime scheduledDate;
  final DateTime? originalDate; // Track if moved from another day
  final WorkoutType type;
  final WorkoutDifficulty difficulty;
  final String duration;
  final List<Exercise> exercises;
  final bool isUserModified; // Track if user manually moved this workout

  ScheduledWorkout({
    required this.id,
    required this.workoutPlanId,
    required this.workoutName,
    required this.scheduledDate,
    this.originalDate,
    required this.type,
    required this.difficulty,
    required this.duration,
    required this.exercises,
    this.isUserModified = false,
  });

  ScheduledWorkout copyWith({
    String? id,
    String? workoutPlanId,
    String? workoutName,
    DateTime? scheduledDate,
    DateTime? originalDate,
    WorkoutType? type,
    WorkoutDifficulty? difficulty,
    String? duration,
    List<Exercise>? exercises,
    bool? isUserModified,
  }) {
    return ScheduledWorkout(
      id: id ?? this.id,
      workoutPlanId: workoutPlanId ?? this.workoutPlanId,
      workoutName: workoutName ?? this.workoutName,
      scheduledDate: scheduledDate ?? this.scheduledDate,
      originalDate: originalDate ?? this.originalDate,
      type: type ?? this.type,
      difficulty: difficulty ?? this.difficulty,
      duration: duration ?? this.duration,
      exercises: exercises ?? this.exercises,
      isUserModified: isUserModified ?? this.isUserModified,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'workoutPlanId': workoutPlanId,
      'workoutName': workoutName,
      'scheduledDate': scheduledDate.toIso8601String(),
      'originalDate': originalDate?.toIso8601String(),
      'type': type.name,
      'difficulty': difficulty.name,
      'duration': duration,
      'exercises': exercises.map((e) => e.toJson()).toList(),
      'isUserModified': isUserModified,
    };
  }

  factory ScheduledWorkout.fromJson(Map<String, dynamic> json) {
    return ScheduledWorkout(
      id: json['id'],
      workoutPlanId: json['workoutPlanId'],
      workoutName: json['workoutName'],
      scheduledDate: DateTime.parse(json['scheduledDate']),
      originalDate: json['originalDate'] != null 
          ? DateTime.parse(json['originalDate'])
          : null,
      type: WorkoutType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => WorkoutType.strength,
      ),
      difficulty: WorkoutDifficulty.values.firstWhere(
        (e) => e.name == json['difficulty'],
        orElse: () => WorkoutDifficulty.medium,
      ),
      duration: json['duration'],
      exercises: (json['exercises'] as List)
          .map((e) => Exercise.fromJson(e))
          .toList(),
      isUserModified: json['isUserModified'] ?? false,
    );
  }

  // Convert to WorkoutPlan for compatibility
  WorkoutPlan toWorkoutPlan() {
    return WorkoutPlan(
      id: workoutPlanId,
      name: workoutName,
      description: '',
      duration: duration,
      calories: '0',
      difficulty: difficulty,
      type: type,
      imagePath: '',
      isCompleted: false,
      scheduledFor: scheduledDate,
      exercises: exercises,
      metadata: {},
    );
  }
}

class WorkoutSchedulingService {
  final SharedPreferences _prefs;
  static const String _scheduledWorkoutsKey = 'scheduled_workouts';

  WorkoutSchedulingService(this._prefs);

  // Get all scheduled workouts
  Future<List<ScheduledWorkout>> getScheduledWorkouts() async {
    final workoutsJson = _prefs.getString(_scheduledWorkoutsKey);
    if (workoutsJson == null) return [];

    try {
      final List<dynamic> workoutsList = json.decode(workoutsJson);
      return workoutsList
          .map((json) => ScheduledWorkout.fromJson(json))
          .toList();
    } catch (e) {
      print('Error loading scheduled workouts: $e');
      return [];
    }
  }

  // Get workouts for a specific date
  Future<List<ScheduledWorkout>> getWorkoutsForDate(DateTime date) async {
    final allWorkouts = await getScheduledWorkouts();
    return allWorkouts.where((workout) {
      return workout.scheduledDate.year == date.year &&
             workout.scheduledDate.month == date.month &&
             workout.scheduledDate.day == date.day;
    }).toList();
  }

  // Move workout to a different date
  Future<void> moveWorkout(String workoutId, DateTime newDate) async {
    final scheduledWorkouts = await getScheduledWorkouts();
    final workoutIndex = scheduledWorkouts.indexWhere((w) => w.id == workoutId);
    
    if (workoutIndex == -1) return;

    final workout = scheduledWorkouts[workoutIndex];
    final originalDate = workout.originalDate ?? workout.scheduledDate;
    
    // Update the workout with new date and mark as user-modified
    scheduledWorkouts[workoutIndex] = workout.copyWith(
      scheduledDate: newDate,
      originalDate: originalDate,
      isUserModified: true,
    );

    await _saveScheduledWorkouts(scheduledWorkouts);
  }

  // Add a new scheduled workout
  Future<void> addScheduledWorkout(WorkoutPlan workoutPlan, DateTime date) async {
    final scheduledWorkouts = await getScheduledWorkouts();
    
    final scheduledWorkout = ScheduledWorkout(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      workoutPlanId: workoutPlan.id,
      workoutName: workoutPlan.name,
      scheduledDate: date,
      type: workoutPlan.type,
      difficulty: workoutPlan.difficulty,
      duration: workoutPlan.duration,
      exercises: workoutPlan.exercises,
    );

    scheduledWorkouts.add(scheduledWorkout);
    await _saveScheduledWorkouts(scheduledWorkouts);
  }

  // Remove a scheduled workout
  Future<void> removeScheduledWorkout(String workoutId) async {
    final scheduledWorkouts = await getScheduledWorkouts();
    scheduledWorkouts.removeWhere((workout) => workout.id == workoutId);
    await _saveScheduledWorkouts(scheduledWorkouts);
  }

  // Reset workout to original date
  Future<void> resetWorkoutToOriginalDate(String workoutId) async {
    final scheduledWorkouts = await getScheduledWorkouts();
    final workoutIndex = scheduledWorkouts.indexWhere((w) => w.id == workoutId);
    
    if (workoutIndex == -1) return;

    final workout = scheduledWorkouts[workoutIndex];
    if (workout.originalDate != null) {
      scheduledWorkouts[workoutIndex] = workout.copyWith(
        scheduledDate: workout.originalDate,
        originalDate: null,
        isUserModified: false,
      );

      await _saveScheduledWorkouts(scheduledWorkouts);
    }
  }

  // Get workouts that have been moved from their original dates
  Future<List<ScheduledWorkout>> getMovedWorkouts() async {
    final allWorkouts = await getScheduledWorkouts();
    return allWorkouts.where((workout) => workout.isUserModified).toList();
  }

  // Save scheduled workouts to SharedPreferences
  Future<void> _saveScheduledWorkouts(List<ScheduledWorkout> workouts) async {
    final workoutsJson = json.encode(
      workouts.map((workout) => workout.toJson()).toList(),
    );
    await _prefs.setString(_scheduledWorkoutsKey, workoutsJson);
  }

  // Clear all scheduled workouts (for testing/reset)
  Future<void> clearAllScheduledWorkouts() async {
    await _prefs.remove(_scheduledWorkoutsKey);
  }
}

// Provider for workout scheduling service
final workoutSchedulingServiceProvider = Provider<WorkoutSchedulingService>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return WorkoutSchedulingService(prefs);
});

// Provider for scheduled workouts
final scheduledWorkoutsProvider = FutureProvider<List<ScheduledWorkout>>((ref) {
  final service = ref.watch(workoutSchedulingServiceProvider);
  return service.getScheduledWorkouts();
});

// Provider for workouts on a specific date
final scheduledWorkoutsForDateProvider = FutureProvider.family<List<ScheduledWorkout>, DateTime>((ref, date) {
  final service = ref.watch(workoutSchedulingServiceProvider);
  return service.getWorkoutsForDate(date);
});