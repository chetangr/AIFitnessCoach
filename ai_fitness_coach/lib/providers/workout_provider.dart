import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/workout.dart';
import 'user_preferences_provider.dart';

// Workout state management
class WorkoutNotifier extends StateNotifier<List<WorkoutPlan>> {
  final SharedPreferences _prefs;
  final Ref _ref;
  
  WorkoutNotifier(this._prefs, this._ref) : super([]) {
    _loadWorkouts();
  }

  // Load workouts from SharedPreferences
  Future<void> _loadWorkouts() async {
    final workoutsJson = _prefs.getString('userWorkouts');
    if (workoutsJson != null) {
      try {
        final List<dynamic> workoutsList = json.decode(workoutsJson);
        state = workoutsList
            .map((workout) => WorkoutPlan.fromJson(workout))
            .toList();
      } catch (e) {
        print('Error loading workouts: $e');
        // Initialize with default workouts if loading fails
        _initializeDefaultWorkouts();
      }
    } else {
      // First time - add default workouts
      _initializeDefaultWorkouts();
    }
  }

  // Initialize with default workouts
  void _initializeDefaultWorkouts() {
    final now = DateTime.now();
    final defaultWorkouts = [
      WorkoutPlan(
        id: 'mon_1',
        name: 'Ready for pool time! 🏊',
        description: 'Core Crusher',
        duration: '52 min',
        calories: '450',
        difficulty: WorkoutDifficulty.medium,
        type: WorkoutType.strength,
        imagePath: 'assets/images/core_workout.jpg',
        isCompleted: false,
        scheduledFor: now.add(Duration(days: -now.weekday + 1)),
        exercises: _getDefaultExercises(WorkoutType.strength),
        metadata: {},
      ),
      WorkoutPlan(
        id: 'fri_1',
        name: 'Arm Day Super Sets',
        description: 'T-Rex Arms No More',
        duration: _calculateWorkoutDuration(_getArmDayExercises()),
        calories: '380',
        difficulty: WorkoutDifficulty.hard,
        type: WorkoutType.strength,
        imagePath: 'assets/images/arm_day.jpg',
        isCompleted: false,
        scheduledFor: now.add(Duration(days: -now.weekday + 5)),
        exercises: _getArmDayExercises(),
        metadata: {
          'trainer': 'Sarah Johnson',
          'equipment': 'Dumbbells',
        },
      ),
    ];
    
    state = defaultWorkouts;
    _saveWorkouts();
  }

  List<Exercise> _getArmDayExercises() {
    return [
      Exercise(
        id: 'arm1',
        name: 'Barbell Curls',
        description: 'Compound bicep exercise',
        muscleGroups: ['biceps'],
        equipment: ['barbell'],
        difficulty: WorkoutDifficulty.medium,
        instructions: [
          'Stand with feet shoulder-width apart',
          'Hold barbell with underhand grip',
          'Curl the bar up while keeping elbows stationary',
          'Lower with control'
        ],
        metadata: {
          'sets': 4,
          'reps': 10,
          'rest': 90,
          'weight': '45 LB',
        },
      ),
      Exercise(
        id: 'arm2',
        name: 'Tricep Pushdowns',
        description: 'Cable tricep isolation',
        muscleGroups: ['triceps'],
        equipment: ['cable machine'],
        difficulty: WorkoutDifficulty.medium,
        instructions: [
          'Stand at cable machine with rope attachment',
          'Keep elbows at your sides',
          'Push down until arms are fully extended',
          'Control the negative'
        ],
        metadata: {
          'sets': 3,
          'reps': 15,
          'rest': 60,
          'weight': '40 LB',
        },
      ),
      Exercise(
        id: 'arm3',
        name: 'Hammer Curls',
        description: 'Neutral grip bicep curls',
        muscleGroups: ['biceps', 'forearms'],
        equipment: ['dumbbells'],
        difficulty: WorkoutDifficulty.medium,
        instructions: [
          'Hold dumbbells with neutral grip',
          'Keep palms facing each other',
          'Curl weights up alternating arms',
          'Focus on controlled movement'
        ],
        metadata: {
          'sets': 3,
          'reps': 12,
          'rest': 60,
          'weight': '25 LB',
        },
      ),
      Exercise(
        id: 'arm4',
        name: 'Diamond Push-ups',
        description: 'Tricep-focused push-up variation',
        muscleGroups: ['triceps', 'chest'],
        equipment: ['bodyweight'],
        difficulty: WorkoutDifficulty.hard,
        instructions: [
          'Form diamond shape with hands',
          'Lower chest to hands',
          'Push up explosively',
          'Keep core tight throughout'
        ],
        metadata: {
          'sets': 3,
          'reps': 10,
          'rest': 60,
          'weight': 'Bodyweight',
        },
      ),
      Exercise(
        id: 'arm5',
        name: '21s Bicep Curls',
        description: 'High-volume bicep finisher',
        muscleGroups: ['biceps'],
        equipment: ['dumbbells'],
        difficulty: WorkoutDifficulty.hard,
        instructions: [
          '7 reps bottom half range',
          '7 reps top half range',
          '7 reps full range of motion',
          'No rest between portions'
        ],
        metadata: {
          'sets': 2,
          'reps': 21,
          'rest': 90,
          'weight': '20 LB',
        },
      ),
      Exercise(
        id: 'arm6',
        name: 'Overhead Tricep Extension',
        description: 'Overhead tricep stretch and contraction',
        muscleGroups: ['triceps'],
        equipment: ['dumbbell'],
        difficulty: WorkoutDifficulty.medium,
        instructions: [
          'Hold dumbbell overhead with both hands',
          'Lower weight behind head',
          'Extend back to starting position',
          'Keep elbows close to head'
        ],
        metadata: {
          'sets': 3,
          'reps': 12,
          'rest': 60,
          'weight': '30 LB',
        },
      ),
    ];
  }
  
  List<Exercise> _getDefaultExercises(WorkoutType type) {
    // Return sample exercises based on workout type
    switch (type) {
      case WorkoutType.strength:
        return [
          Exercise(
            id: 'ex1',
            name: 'Push-ups',
            description: 'Classic upper body exercise',
            muscleGroups: ['chest', 'shoulders', 'triceps'],
            equipment: ['bodyweight'],
            difficulty: WorkoutDifficulty.medium,
            instructions: [
              'Start in plank position',
              'Lower your body until chest nearly touches floor',
              'Push back up to starting position',
              'Keep core engaged throughout'
            ],
            metadata: {
              'sets': 3,
              'reps': 12,
              'rest': 60,
              'weight': 'Bodyweight',
            },
          ),
          Exercise(
            id: 'ex2',
            name: 'Squats',
            description: 'Lower body compound movement',
            muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
            equipment: ['bodyweight'],
            difficulty: WorkoutDifficulty.medium,
            instructions: [
              'Stand with feet shoulder-width apart',
              'Lower body by bending knees and hips',
              'Keep chest up and core engaged',
              'Push through heels to return to standing'
            ],
            metadata: {
              'sets': 4,
              'reps': 15,
              'rest': 90,
              'weight': 'Bodyweight',
            },
          ),
          Exercise(
            id: 'ex3',
            name: 'Dumbbell Curls',
            description: 'Bicep isolation exercise',
            muscleGroups: ['biceps'],
            equipment: ['dumbbells'],
            difficulty: WorkoutDifficulty.medium,
            instructions: [
              'Hold dumbbells at arms length',
              'Curl weights up while keeping elbows stationary',
              'Squeeze biceps at the top',
              'Lower back down with control'
            ],
            metadata: {
              'sets': 3,
              'reps': 10,
              'rest': 45,
              'weight': '30 LB',
            },
          ),
          Exercise(
            id: 'ex4',
            name: 'Tricep Dips',
            description: 'Tricep and chest exercise',
            muscleGroups: ['triceps', 'chest', 'shoulders'],
            equipment: ['bench', 'bodyweight'],
            difficulty: WorkoutDifficulty.medium,
            instructions: [
              'Position hands on bench behind you',
              'Lower body by bending elbows to 90 degrees',
              'Push back up to starting position',
              'Keep elbows close to body'
            ],
            metadata: {
              'sets': 3,
              'reps': 12,
              'rest': 60,
              'weight': 'Bodyweight',
            },
          ),
        ];
      default:
        return [];
    }
  }

  // Save workouts to SharedPreferences
  Future<void> _saveWorkouts() async {
    final workoutsJson = state.map((workout) => workout.toJson()).toList();
    await _prefs.setString('userWorkouts', json.encode(workoutsJson));
  }

  // Add a new workout
  Future<void> addWorkout(WorkoutPlan workout) async {
    state = [...state, workout];
    await _saveWorkouts();
  }

  // Update an existing workout
  Future<void> updateWorkout(String workoutId, WorkoutPlan updatedWorkout) async {
    state = state.map((workout) {
      return workout.id == workoutId ? updatedWorkout : workout;
    }).toList();
    await _saveWorkouts();
  }

  // Delete a workout
  Future<void> deleteWorkout(String workoutId) async {
    state = state.where((workout) => workout.id != workoutId).toList();
    await _saveWorkouts();
  }

  // Get workouts for a specific date
  List<WorkoutPlan> getWorkoutsForDate(DateTime date) {
    return state.where((workout) {
      return workout.scheduledFor.year == date.year &&
             workout.scheduledFor.month == date.month &&
             workout.scheduledFor.day == date.day;
    }).toList();
  }


  // Get upcoming workouts
  List<WorkoutPlan> getUpcomingWorkouts() {
    final now = DateTime.now();
    return state.where((workout) {
      return workout.scheduledFor.isAfter(now) && !workout.isCompleted;
    }).toList()
      ..sort((a, b) => a.scheduledFor.compareTo(b.scheduledFor));
  }

  // Mark workout as completed
  Future<void> markWorkoutCompleted(String workoutId) async {
    state = state.map((workout) {
      if (workout.id == workoutId) {
        return WorkoutPlan(
          id: workout.id,
          name: workout.name,
          description: workout.description,
          duration: workout.duration,
          calories: workout.calories,
          difficulty: workout.difficulty,
          type: workout.type,
          imagePath: workout.imagePath,
          isCompleted: true,
          scheduledFor: workout.scheduledFor,
          exercises: workout.exercises,
          subtitle: workout.subtitle,
          hasIssue: workout.hasIssue,
          metadata: workout.metadata,
        );
      }
      return workout;
    }).toList();
    await _saveWorkouts();
  }

  // Create workout from AI suggestion
  Future<WorkoutPlan> createWorkoutFromAISuggestion({
    required String name,
    required String description,
    required List<Exercise> exercises,
    required WorkoutDifficulty difficulty,
    required WorkoutType type,
    required DateTime scheduledFor,
    Map<String, dynamic>? metadata,
  }) async {
    // Calculate duration based on exercises
    int totalSeconds = 0;
    for (var exercise in exercises) {
      // Assume 3 sets of 45 seconds each with 30 seconds rest
      totalSeconds += (45 * 3) + (30 * 2);
    }
    final duration = '${(totalSeconds / 60).round()} min';

    // Estimate calories based on workout type and duration
    final calories = _estimateCalories(type, totalSeconds ~/ 60);

    final workout = WorkoutPlan(
      id: 'ai_${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      description: description,
      duration: duration,
      calories: calories,
      difficulty: difficulty,
      type: type,
      imagePath: _getImagePathForType(type),
      isCompleted: false,
      scheduledFor: scheduledFor,
      exercises: exercises,
      metadata: {
        'createdBy': 'ai_coach',
        'createdAt': DateTime.now().toIso8601String(),
        ...?metadata,
      },
    );

    await addWorkout(workout);
    return workout;
  }

  String _estimateCalories(WorkoutType type, int minutes) {
    // Rough calorie estimates per minute based on workout type
    final caloriesPerMinute = {
      WorkoutType.strength: 8,
      WorkoutType.cardio: 12,
      WorkoutType.hiit: 15,
      WorkoutType.yoga: 4,
      WorkoutType.recovery: 3,
      WorkoutType.flexibility: 3,
      WorkoutType.sports: 10,
    };

    final calories = (caloriesPerMinute[type] ?? 8) * minutes;
    return calories.toString();
  }

  String _getImagePathForType(WorkoutType type) {
    final imagePaths = {
      WorkoutType.strength: 'assets/images/strength_workout.jpg',
      WorkoutType.cardio: 'assets/images/cardio_workout.jpg',
      WorkoutType.hiit: 'assets/images/hiit_workout.jpg',
      WorkoutType.yoga: 'assets/images/yoga_workout.jpg',
      WorkoutType.recovery: 'assets/images/recovery_workout.jpg',
      WorkoutType.flexibility: 'assets/images/flexibility_workout.jpg',
      WorkoutType.sports: 'assets/images/sports_workout.jpg',
    };

    return imagePaths[type] ?? 'assets/images/default_workout.jpg';
  }
  
  String _calculateWorkoutDuration(List<Exercise> exercises) {
    if (exercises.isEmpty) return '30 MIN';
    
    int totalSeconds = 0;
    for (var exercise in exercises) {
      final sets = (exercise.metadata['sets'] as int?) ?? 3;
      final reps = (exercise.metadata['reps'] as int?) ?? 12;
      final rest = (exercise.metadata['rest'] as int?) ?? 60;
      
      // Estimate 3 seconds per rep + rest between sets
      final exerciseTime = (reps * 3 * sets) + (rest * (sets - 1));
      totalSeconds += exerciseTime;
    }
    
    // Add transition time between exercises (30 seconds each)
    totalSeconds += (exercises.length - 1) * 30;
    
    final minutes = (totalSeconds / 60).round();
    return '$minutes MIN';
  }

  // Move a workout to a different date
  Future<void> moveWorkout(String workoutId, DateTime newDate) async {
    state = state.map((workout) {
      if (workout.id == workoutId) {
        return workout.copyWith(scheduledFor: newDate);
      }
      return workout;
    }).toList();
    await _saveWorkouts();
  }

  Future<void> addExerciseToWorkout(String workoutId, Exercise exercise) async {
    state = state.map((workout) {
      if (workout.id == workoutId) {
        final updatedExercises = List<Exercise>.from(workout.exercises);
        updatedExercises.add(exercise);
        return workout.copyWith(exercises: updatedExercises);
      }
      return workout;
    }).toList();
    await _saveWorkouts();
  }
}

// Provider
final workoutProvider = StateNotifierProvider<WorkoutNotifier, List<WorkoutPlan>>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return WorkoutNotifier(prefs, ref);
});

// Helper provider to get workouts for a specific date
final workoutsForDateProvider = Provider.family<List<WorkoutPlan>, DateTime>((ref, date) {
  final workouts = ref.watch(workoutProvider);
  return ref.read(workoutProvider.notifier).getWorkoutsForDate(date);
});

// Helper provider to get upcoming workouts
final upcomingWorkoutsProvider = Provider<List<WorkoutPlan>>((ref) {
  ref.watch(workoutProvider);
  return ref.read(workoutProvider.notifier).getUpcomingWorkouts();
});