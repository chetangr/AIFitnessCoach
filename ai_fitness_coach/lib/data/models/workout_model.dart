import 'package:freezed_annotation/freezed_annotation.dart';

part 'workout_model.freezed.dart';
part 'workout_model.g.dart';

@freezed
class WorkoutModel with _$WorkoutModel {
  const factory WorkoutModel({
    required String id,
    required String name,
    String? description,
    required String difficulty,
    required int durationMinutes,
    required List<ExerciseModel> exercises,
    required List<String> equipmentRequired,
    required List<String> muscleGroups,
    String? imageUrl,
    @Default(true) bool isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _WorkoutModel;

  factory WorkoutModel.fromJson(Map<String, dynamic> json) => _$WorkoutModelFromJson(json);
}

@freezed
class ExerciseModel with _$ExerciseModel {
  const factory ExerciseModel({
    required String id,
    required String name,
    String? description,
    required int sets,
    required int reps,
    int? restSeconds,
    String? imageUrl,
    String? videoUrl,
    required List<String> muscleGroups,
    required List<String> equipment,
    @Default([]) List<String> instructions,
  }) = _ExerciseModel;

  factory ExerciseModel.fromJson(Map<String, dynamic> json) => _$ExerciseModelFromJson(json);
}

@freezed
class WorkoutSession with _$WorkoutSession {
  const factory WorkoutSession({
    required String id,
    required String workoutId,
    required String userId,
    required DateTime startedAt,
    DateTime? completedAt,
    required int durationSeconds,
    required int caloriesBurned,
    required List<ExerciseSet> completedSets,
    Map<String, dynamic>? heartRateData,
    String? notes,
  }) = _WorkoutSession;

  factory WorkoutSession.fromJson(Map<String, dynamic> json) => _$WorkoutSessionFromJson(json);
}

@freezed
class ExerciseSet with _$ExerciseSet {
  const factory ExerciseSet({
    required String exerciseId,
    required int setNumber,
    required int reps,
    double? weight,
    required int restTaken,
    DateTime? completedAt,
  }) = _ExerciseSet;

  factory ExerciseSet.fromJson(Map<String, dynamic> json) => _$ExerciseSetFromJson(json);
}