// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'workout_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$WorkoutModelImpl _$$WorkoutModelImplFromJson(Map<String, dynamic> json) =>
    _$WorkoutModelImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      difficulty: json['difficulty'] as String,
      durationMinutes: (json['durationMinutes'] as num).toInt(),
      exercises: (json['exercises'] as List<dynamic>)
          .map((e) => ExerciseModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      equipmentRequired: (json['equipmentRequired'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      muscleGroups: (json['muscleGroups'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      imageUrl: json['imageUrl'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$WorkoutModelImplToJson(_$WorkoutModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'difficulty': instance.difficulty,
      'durationMinutes': instance.durationMinutes,
      'exercises': instance.exercises,
      'equipmentRequired': instance.equipmentRequired,
      'muscleGroups': instance.muscleGroups,
      'imageUrl': instance.imageUrl,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };

_$ExerciseModelImpl _$$ExerciseModelImplFromJson(Map<String, dynamic> json) =>
    _$ExerciseModelImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      sets: (json['sets'] as num).toInt(),
      reps: (json['reps'] as num).toInt(),
      restSeconds: (json['restSeconds'] as num?)?.toInt(),
      imageUrl: json['imageUrl'] as String?,
      videoUrl: json['videoUrl'] as String?,
      muscleGroups: (json['muscleGroups'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      equipment:
          (json['equipment'] as List<dynamic>).map((e) => e as String).toList(),
      instructions: (json['instructions'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$ExerciseModelImplToJson(_$ExerciseModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'sets': instance.sets,
      'reps': instance.reps,
      'restSeconds': instance.restSeconds,
      'imageUrl': instance.imageUrl,
      'videoUrl': instance.videoUrl,
      'muscleGroups': instance.muscleGroups,
      'equipment': instance.equipment,
      'instructions': instance.instructions,
    };

_$WorkoutSessionImpl _$$WorkoutSessionImplFromJson(Map<String, dynamic> json) =>
    _$WorkoutSessionImpl(
      id: json['id'] as String,
      workoutId: json['workoutId'] as String,
      userId: json['userId'] as String,
      startedAt: DateTime.parse(json['startedAt'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      durationSeconds: (json['durationSeconds'] as num).toInt(),
      caloriesBurned: (json['caloriesBurned'] as num).toInt(),
      completedSets: (json['completedSets'] as List<dynamic>)
          .map((e) => ExerciseSet.fromJson(e as Map<String, dynamic>))
          .toList(),
      heartRateData: json['heartRateData'] as Map<String, dynamic>?,
      notes: json['notes'] as String?,
    );

Map<String, dynamic> _$$WorkoutSessionImplToJson(
        _$WorkoutSessionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'workoutId': instance.workoutId,
      'userId': instance.userId,
      'startedAt': instance.startedAt.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'durationSeconds': instance.durationSeconds,
      'caloriesBurned': instance.caloriesBurned,
      'completedSets': instance.completedSets,
      'heartRateData': instance.heartRateData,
      'notes': instance.notes,
    };

_$ExerciseSetImpl _$$ExerciseSetImplFromJson(Map<String, dynamic> json) =>
    _$ExerciseSetImpl(
      exerciseId: json['exerciseId'] as String,
      setNumber: (json['setNumber'] as num).toInt(),
      reps: (json['reps'] as num).toInt(),
      weight: (json['weight'] as num?)?.toDouble(),
      restTaken: (json['restTaken'] as num).toInt(),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
    );

Map<String, dynamic> _$$ExerciseSetImplToJson(_$ExerciseSetImpl instance) =>
    <String, dynamic>{
      'exerciseId': instance.exerciseId,
      'setNumber': instance.setNumber,
      'reps': instance.reps,
      'weight': instance.weight,
      'restTaken': instance.restTaken,
      'completedAt': instance.completedAt?.toIso8601String(),
    };
