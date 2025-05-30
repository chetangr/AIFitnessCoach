// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserModelImpl _$$UserModelImplFromJson(Map<String, dynamic> json) =>
    _$UserModelImpl(
      id: json['id'] as String,
      email: json['email'] as String,
      displayName: json['displayName'] as String,
      profileImageUrl: json['profileImageUrl'] as String?,
      fitnessLevel: json['fitnessLevel'] as String,
      goals:
          (json['goals'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      limitations: (json['limitations'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      preferences: json['preferences'] as Map<String, dynamic>? ?? const {},
      username: json['username'] as String?,
      passwordHash: json['passwordHash'] as String?,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      sex: json['sex'] as String?,
      trainingEquipment: json['trainingEquipment'] as String?,
      dietPreference: json['dietPreference'] as String?,
      mindsetActivities: (json['mindsetActivities'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      totalWorkoutsCompleted:
          (json['totalWorkoutsCompleted'] as num?)?.toInt() ?? 0,
      currentStreak: (json['currentStreak'] as num?)?.toInt() ?? 0,
      longestStreak: (json['longestStreak'] as num?)?.toInt() ?? 0,
      totalCaloriesBurned:
          (json['totalCaloriesBurned'] as num?)?.toDouble() ?? 0,
      currentWeight: (json['currentWeight'] as num?)?.toDouble(),
      targetWeight: (json['targetWeight'] as num?)?.toDouble(),
      height: (json['height'] as num?)?.toDouble(),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$UserModelImplToJson(_$UserModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'displayName': instance.displayName,
      'profileImageUrl': instance.profileImageUrl,
      'fitnessLevel': instance.fitnessLevel,
      'goals': instance.goals,
      'limitations': instance.limitations,
      'preferences': instance.preferences,
      'username': instance.username,
      'passwordHash': instance.passwordHash,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'sex': instance.sex,
      'trainingEquipment': instance.trainingEquipment,
      'dietPreference': instance.dietPreference,
      'mindsetActivities': instance.mindsetActivities,
      'totalWorkoutsCompleted': instance.totalWorkoutsCompleted,
      'currentStreak': instance.currentStreak,
      'longestStreak': instance.longestStreak,
      'totalCaloriesBurned': instance.totalCaloriesBurned,
      'currentWeight': instance.currentWeight,
      'targetWeight': instance.targetWeight,
      'height': instance.height,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
