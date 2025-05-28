import 'package:flutter/material.dart';

enum WorkoutDifficulty {
  easy,
  medium,
  hard,
  extreme,
}

enum WorkoutType {
  strength,
  cardio,
  hiit,
  yoga,
  recovery,
  flexibility,
  sports,
}

extension WorkoutDifficultyExtension on WorkoutDifficulty {
  String get name {
    switch (this) {
      case WorkoutDifficulty.easy:
        return 'Easy';
      case WorkoutDifficulty.medium:
        return 'Medium';
      case WorkoutDifficulty.hard:
        return 'Hard';
      case WorkoutDifficulty.extreme:
        return 'Extreme';
    }
  }

  Color get color {
    switch (this) {
      case WorkoutDifficulty.easy:
        return const Color(0xFF30D158);
      case WorkoutDifficulty.medium:
        return const Color(0xFFFF9F0A);
      case WorkoutDifficulty.hard:
        return const Color(0xFFFF375F);
      case WorkoutDifficulty.extreme:
        return const Color(0xFF8E44AD);
    }
  }
}

extension WorkoutTypeExtension on WorkoutType {
  String get name {
    switch (this) {
      case WorkoutType.strength:
        return 'Strength';
      case WorkoutType.cardio:
        return 'Cardio';
      case WorkoutType.hiit:
        return 'HIIT';
      case WorkoutType.yoga:
        return 'Yoga';
      case WorkoutType.recovery:
        return 'Recovery';
      case WorkoutType.flexibility:
        return 'Flexibility';
      case WorkoutType.sports:
        return 'Sports';
    }
  }

  IconData get icon {
    switch (this) {
      case WorkoutType.strength:
        return Icons.fitness_center;
      case WorkoutType.cardio:
        return Icons.directions_run;
      case WorkoutType.hiit:
        return Icons.whatshot;
      case WorkoutType.yoga:
        return Icons.self_improvement;
      case WorkoutType.recovery:
        return Icons.spa;
      case WorkoutType.flexibility:
        return Icons.accessibility_new;
      case WorkoutType.sports:
        return Icons.sports_basketball;
    }
  }
}

class Exercise {
  final String id;
  final String name;
  final String description;
  final List<String> muscleGroups;
  final List<String> equipment;
  final WorkoutDifficulty difficulty;
  final String? imageUrl;
  final String? videoUrl;
  final List<String> instructions;
  final Map<String, dynamic> metadata;

  Exercise({
    required this.id,
    required this.name,
    required this.description,
    required this.muscleGroups,
    required this.equipment,
    required this.difficulty,
    this.imageUrl,
    this.videoUrl,
    required this.instructions,
    this.metadata = const {},
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'muscleGroups': muscleGroups,
      'equipment': equipment,
      'difficulty': difficulty.name,
      'imageUrl': imageUrl,
      'videoUrl': videoUrl,
      'instructions': instructions,
      'metadata': metadata,
    };
  }

  factory Exercise.fromJson(Map<String, dynamic> json) {
    WorkoutDifficulty difficulty;
    switch (json['difficulty']) {
      case 'Easy':
        difficulty = WorkoutDifficulty.easy;
        break;
      case 'Medium':
        difficulty = WorkoutDifficulty.medium;
        break;
      case 'Hard':
        difficulty = WorkoutDifficulty.hard;
        break;
      case 'Extreme':
        difficulty = WorkoutDifficulty.extreme;
        break;
      default:
        difficulty = WorkoutDifficulty.medium;
    }

    return Exercise(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      muscleGroups: List<String>.from(json['muscleGroups']),
      equipment: List<String>.from(json['equipment']),
      difficulty: difficulty,
      imageUrl: json['imageUrl'],
      videoUrl: json['videoUrl'],
      instructions: List<String>.from(json['instructions']),
      metadata: json['metadata'] ?? {},
    );
  }
}

class WorkoutSet {
  final String exerciseId;
  final int reps;
  final double weight;
  final int duration; // in seconds
  final int restTime; // in seconds
  final String? notes;

  WorkoutSet({
    required this.exerciseId,
    this.reps = 0,
    this.weight = 0.0,
    this.duration = 0,
    this.restTime = 0,
    this.notes,
  });

  Map<String, dynamic> toJson() {
    return {
      'exerciseId': exerciseId,
      'reps': reps,
      'weight': weight,
      'duration': duration,
      'restTime': restTime,
      'notes': notes,
    };
  }

  factory WorkoutSet.fromJson(Map<String, dynamic> json) {
    return WorkoutSet(
      exerciseId: json['exerciseId'],
      reps: json['reps'] ?? 0,
      weight: json['weight']?.toDouble() ?? 0.0,
      duration: json['duration'] ?? 0,
      restTime: json['restTime'] ?? 0,
      notes: json['notes'],
    );
  }
}

class WorkoutPlan {
  final String id;
  final String name;
  final String description;
  final String duration;
  final String calories;
  final WorkoutDifficulty difficulty;
  final WorkoutType type;
  final String imagePath;
  final bool isCompleted;
  final DateTime scheduledFor;
  final List<Exercise> exercises;
  final String? subtitle;
  final bool hasIssue;
  final Map<String, dynamic> metadata;

  WorkoutPlan({
    required this.id,
    required this.name,
    required this.description,
    required this.duration,
    required this.calories,
    required this.difficulty,
    required this.type,
    required this.imagePath,
    required this.isCompleted,
    required this.scheduledFor,
    required this.exercises,
    this.subtitle,
    this.hasIssue = false,
    this.metadata = const {},
  });

  WorkoutPlan copyWith({
    String? id,
    String? name,
    String? description,
    String? duration,
    String? calories,
    WorkoutDifficulty? difficulty,
    WorkoutType? type,
    String? imagePath,
    bool? isCompleted,
    DateTime? scheduledFor,
    List<Exercise>? exercises,
    String? subtitle,
    bool? hasIssue,
    Map<String, dynamic>? metadata,
  }) {
    return WorkoutPlan(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      duration: duration ?? this.duration,
      calories: calories ?? this.calories,
      difficulty: difficulty ?? this.difficulty,
      type: type ?? this.type,
      imagePath: imagePath ?? this.imagePath,
      isCompleted: isCompleted ?? this.isCompleted,
      scheduledFor: scheduledFor ?? this.scheduledFor,
      exercises: exercises ?? this.exercises,
      subtitle: subtitle ?? this.subtitle,
      hasIssue: hasIssue ?? this.hasIssue,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'duration': duration,
      'calories': calories,
      'difficulty': difficulty.name,
      'type': type.name,
      'imagePath': imagePath,
      'isCompleted': isCompleted,
      'scheduledFor': scheduledFor.toIso8601String(),
      'exercises': exercises.map((e) => e.toJson()).toList(),
      'subtitle': subtitle,
      'hasIssue': hasIssue,
      'metadata': metadata,
    };
  }

  factory WorkoutPlan.fromJson(Map<String, dynamic> json) {
    WorkoutDifficulty difficulty;
    switch (json['difficulty']) {
      case 'Easy':
        difficulty = WorkoutDifficulty.easy;
        break;
      case 'Medium':
        difficulty = WorkoutDifficulty.medium;
        break;
      case 'Hard':
        difficulty = WorkoutDifficulty.hard;
        break;
      case 'Extreme':
        difficulty = WorkoutDifficulty.extreme;
        break;
      default:
        difficulty = WorkoutDifficulty.medium;
    }

    WorkoutType type;
    switch (json['type']) {
      case 'Strength':
        type = WorkoutType.strength;
        break;
      case 'Cardio':
        type = WorkoutType.cardio;
        break;
      case 'HIIT':
        type = WorkoutType.hiit;
        break;
      case 'Yoga':
        type = WorkoutType.yoga;
        break;
      case 'Recovery':
        type = WorkoutType.recovery;
        break;
      case 'Flexibility':
        type = WorkoutType.flexibility;
        break;
      case 'Sports':
        type = WorkoutType.sports;
        break;
      default:
        type = WorkoutType.strength;
    }

    return WorkoutPlan(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      duration: json['duration'],
      calories: json['calories'],
      difficulty: difficulty,
      type: type,
      imagePath: json['imagePath'],
      isCompleted: json['isCompleted'],
      scheduledFor: DateTime.parse(json['scheduledFor']),
      exercises: (json['exercises'] as List)
          .map((e) => Exercise.fromJson(e))
          .toList(),
      subtitle: json['subtitle'],
      hasIssue: json['hasIssue'] ?? false,
      metadata: json['metadata'] ?? {},
    );
  }
}

class WorkoutSession {
  final String id;
  final String workoutPlanId;
  final DateTime startTime;
  final DateTime? endTime;
  final List<WorkoutSet> completedSets;
  final int caloriesBurned;
  final Map<String, dynamic> performanceMetrics;
  final String? notes;

  WorkoutSession({
    required this.id,
    required this.workoutPlanId,
    required this.startTime,
    this.endTime,
    required this.completedSets,
    this.caloriesBurned = 0,
    this.performanceMetrics = const {},
    this.notes,
  });

  Duration get duration {
    if (endTime != null) {
      return endTime!.difference(startTime);
    }
    return DateTime.now().difference(startTime);
  }

  bool get isCompleted => endTime != null;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'workoutPlanId': workoutPlanId,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
      'completedSets': completedSets.map((s) => s.toJson()).toList(),
      'caloriesBurned': caloriesBurned,
      'performanceMetrics': performanceMetrics,
      'notes': notes,
    };
  }

  factory WorkoutSession.fromJson(Map<String, dynamic> json) {
    return WorkoutSession(
      id: json['id'],
      workoutPlanId: json['workoutPlanId'],
      startTime: DateTime.parse(json['startTime']),
      endTime: json['endTime'] != null ? DateTime.parse(json['endTime']) : null,
      completedSets: (json['completedSets'] as List)
          .map((s) => WorkoutSet.fromJson(s))
          .toList(),
      caloriesBurned: json['caloriesBurned'] ?? 0,
      performanceMetrics: json['performanceMetrics'] ?? {},
      notes: json['notes'],
    );
  }
}