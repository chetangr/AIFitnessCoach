import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String email,
    required String displayName,
    String? profileImageUrl,
    required String fitnessLevel,
    @Default([]) List<String> goals,
    @Default([]) List<String> limitations,
    @Default({}) Map<String, dynamic> preferences,
    // Authentication fields
    String? username,
    String? passwordHash, // Never store plain passwords
    // Onboarding fields
    String? firstName,
    String? lastName,
    String? sex,
    String? trainingEquipment,
    String? dietPreference,
    @Default([]) List<String> mindsetActivities,
    // Stats fields
    @Default(0) int totalWorkoutsCompleted,
    @Default(0) int currentStreak,
    @Default(0) int longestStreak,
    @Default(0) double totalCaloriesBurned,
    double? currentWeight,
    double? targetWeight,
    double? height,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
}