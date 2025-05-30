// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

UserModel _$UserModelFromJson(Map<String, dynamic> json) {
  return _UserModel.fromJson(json);
}

/// @nodoc
mixin _$UserModel {
  String get id => throw _privateConstructorUsedError;
  String get email => throw _privateConstructorUsedError;
  String get displayName => throw _privateConstructorUsedError;
  String? get profileImageUrl => throw _privateConstructorUsedError;
  String get fitnessLevel => throw _privateConstructorUsedError;
  List<String> get goals => throw _privateConstructorUsedError;
  List<String> get limitations => throw _privateConstructorUsedError;
  Map<String, dynamic> get preferences =>
      throw _privateConstructorUsedError; // Authentication fields
  String? get username => throw _privateConstructorUsedError;
  String? get passwordHash =>
      throw _privateConstructorUsedError; // Never store plain passwords
// Onboarding fields
  String? get firstName => throw _privateConstructorUsedError;
  String? get lastName => throw _privateConstructorUsedError;
  String? get sex => throw _privateConstructorUsedError;
  String? get trainingEquipment => throw _privateConstructorUsedError;
  String? get dietPreference => throw _privateConstructorUsedError;
  List<String> get mindsetActivities =>
      throw _privateConstructorUsedError; // Stats fields
  int get totalWorkoutsCompleted => throw _privateConstructorUsedError;
  int get currentStreak => throw _privateConstructorUsedError;
  int get longestStreak => throw _privateConstructorUsedError;
  double get totalCaloriesBurned => throw _privateConstructorUsedError;
  double? get currentWeight => throw _privateConstructorUsedError;
  double? get targetWeight => throw _privateConstructorUsedError;
  double? get height => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this UserModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UserModelCopyWith<UserModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserModelCopyWith<$Res> {
  factory $UserModelCopyWith(UserModel value, $Res Function(UserModel) then) =
      _$UserModelCopyWithImpl<$Res, UserModel>;
  @useResult
  $Res call(
      {String id,
      String email,
      String displayName,
      String? profileImageUrl,
      String fitnessLevel,
      List<String> goals,
      List<String> limitations,
      Map<String, dynamic> preferences,
      String? username,
      String? passwordHash,
      String? firstName,
      String? lastName,
      String? sex,
      String? trainingEquipment,
      String? dietPreference,
      List<String> mindsetActivities,
      int totalWorkoutsCompleted,
      int currentStreak,
      int longestStreak,
      double totalCaloriesBurned,
      double? currentWeight,
      double? targetWeight,
      double? height,
      DateTime? createdAt,
      DateTime? updatedAt});
}

/// @nodoc
class _$UserModelCopyWithImpl<$Res, $Val extends UserModel>
    implements $UserModelCopyWith<$Res> {
  _$UserModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? email = null,
    Object? displayName = null,
    Object? profileImageUrl = freezed,
    Object? fitnessLevel = null,
    Object? goals = null,
    Object? limitations = null,
    Object? preferences = null,
    Object? username = freezed,
    Object? passwordHash = freezed,
    Object? firstName = freezed,
    Object? lastName = freezed,
    Object? sex = freezed,
    Object? trainingEquipment = freezed,
    Object? dietPreference = freezed,
    Object? mindsetActivities = null,
    Object? totalWorkoutsCompleted = null,
    Object? currentStreak = null,
    Object? longestStreak = null,
    Object? totalCaloriesBurned = null,
    Object? currentWeight = freezed,
    Object? targetWeight = freezed,
    Object? height = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      displayName: null == displayName
          ? _value.displayName
          : displayName // ignore: cast_nullable_to_non_nullable
              as String,
      profileImageUrl: freezed == profileImageUrl
          ? _value.profileImageUrl
          : profileImageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      fitnessLevel: null == fitnessLevel
          ? _value.fitnessLevel
          : fitnessLevel // ignore: cast_nullable_to_non_nullable
              as String,
      goals: null == goals
          ? _value.goals
          : goals // ignore: cast_nullable_to_non_nullable
              as List<String>,
      limitations: null == limitations
          ? _value.limitations
          : limitations // ignore: cast_nullable_to_non_nullable
              as List<String>,
      preferences: null == preferences
          ? _value.preferences
          : preferences // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      username: freezed == username
          ? _value.username
          : username // ignore: cast_nullable_to_non_nullable
              as String?,
      passwordHash: freezed == passwordHash
          ? _value.passwordHash
          : passwordHash // ignore: cast_nullable_to_non_nullable
              as String?,
      firstName: freezed == firstName
          ? _value.firstName
          : firstName // ignore: cast_nullable_to_non_nullable
              as String?,
      lastName: freezed == lastName
          ? _value.lastName
          : lastName // ignore: cast_nullable_to_non_nullable
              as String?,
      sex: freezed == sex
          ? _value.sex
          : sex // ignore: cast_nullable_to_non_nullable
              as String?,
      trainingEquipment: freezed == trainingEquipment
          ? _value.trainingEquipment
          : trainingEquipment // ignore: cast_nullable_to_non_nullable
              as String?,
      dietPreference: freezed == dietPreference
          ? _value.dietPreference
          : dietPreference // ignore: cast_nullable_to_non_nullable
              as String?,
      mindsetActivities: null == mindsetActivities
          ? _value.mindsetActivities
          : mindsetActivities // ignore: cast_nullable_to_non_nullable
              as List<String>,
      totalWorkoutsCompleted: null == totalWorkoutsCompleted
          ? _value.totalWorkoutsCompleted
          : totalWorkoutsCompleted // ignore: cast_nullable_to_non_nullable
              as int,
      currentStreak: null == currentStreak
          ? _value.currentStreak
          : currentStreak // ignore: cast_nullable_to_non_nullable
              as int,
      longestStreak: null == longestStreak
          ? _value.longestStreak
          : longestStreak // ignore: cast_nullable_to_non_nullable
              as int,
      totalCaloriesBurned: null == totalCaloriesBurned
          ? _value.totalCaloriesBurned
          : totalCaloriesBurned // ignore: cast_nullable_to_non_nullable
              as double,
      currentWeight: freezed == currentWeight
          ? _value.currentWeight
          : currentWeight // ignore: cast_nullable_to_non_nullable
              as double?,
      targetWeight: freezed == targetWeight
          ? _value.targetWeight
          : targetWeight // ignore: cast_nullable_to_non_nullable
              as double?,
      height: freezed == height
          ? _value.height
          : height // ignore: cast_nullable_to_non_nullable
              as double?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UserModelImplCopyWith<$Res>
    implements $UserModelCopyWith<$Res> {
  factory _$$UserModelImplCopyWith(
          _$UserModelImpl value, $Res Function(_$UserModelImpl) then) =
      __$$UserModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String email,
      String displayName,
      String? profileImageUrl,
      String fitnessLevel,
      List<String> goals,
      List<String> limitations,
      Map<String, dynamic> preferences,
      String? username,
      String? passwordHash,
      String? firstName,
      String? lastName,
      String? sex,
      String? trainingEquipment,
      String? dietPreference,
      List<String> mindsetActivities,
      int totalWorkoutsCompleted,
      int currentStreak,
      int longestStreak,
      double totalCaloriesBurned,
      double? currentWeight,
      double? targetWeight,
      double? height,
      DateTime? createdAt,
      DateTime? updatedAt});
}

/// @nodoc
class __$$UserModelImplCopyWithImpl<$Res>
    extends _$UserModelCopyWithImpl<$Res, _$UserModelImpl>
    implements _$$UserModelImplCopyWith<$Res> {
  __$$UserModelImplCopyWithImpl(
      _$UserModelImpl _value, $Res Function(_$UserModelImpl) _then)
      : super(_value, _then);

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? email = null,
    Object? displayName = null,
    Object? profileImageUrl = freezed,
    Object? fitnessLevel = null,
    Object? goals = null,
    Object? limitations = null,
    Object? preferences = null,
    Object? username = freezed,
    Object? passwordHash = freezed,
    Object? firstName = freezed,
    Object? lastName = freezed,
    Object? sex = freezed,
    Object? trainingEquipment = freezed,
    Object? dietPreference = freezed,
    Object? mindsetActivities = null,
    Object? totalWorkoutsCompleted = null,
    Object? currentStreak = null,
    Object? longestStreak = null,
    Object? totalCaloriesBurned = null,
    Object? currentWeight = freezed,
    Object? targetWeight = freezed,
    Object? height = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_$UserModelImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      displayName: null == displayName
          ? _value.displayName
          : displayName // ignore: cast_nullable_to_non_nullable
              as String,
      profileImageUrl: freezed == profileImageUrl
          ? _value.profileImageUrl
          : profileImageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      fitnessLevel: null == fitnessLevel
          ? _value.fitnessLevel
          : fitnessLevel // ignore: cast_nullable_to_non_nullable
              as String,
      goals: null == goals
          ? _value._goals
          : goals // ignore: cast_nullable_to_non_nullable
              as List<String>,
      limitations: null == limitations
          ? _value._limitations
          : limitations // ignore: cast_nullable_to_non_nullable
              as List<String>,
      preferences: null == preferences
          ? _value._preferences
          : preferences // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      username: freezed == username
          ? _value.username
          : username // ignore: cast_nullable_to_non_nullable
              as String?,
      passwordHash: freezed == passwordHash
          ? _value.passwordHash
          : passwordHash // ignore: cast_nullable_to_non_nullable
              as String?,
      firstName: freezed == firstName
          ? _value.firstName
          : firstName // ignore: cast_nullable_to_non_nullable
              as String?,
      lastName: freezed == lastName
          ? _value.lastName
          : lastName // ignore: cast_nullable_to_non_nullable
              as String?,
      sex: freezed == sex
          ? _value.sex
          : sex // ignore: cast_nullable_to_non_nullable
              as String?,
      trainingEquipment: freezed == trainingEquipment
          ? _value.trainingEquipment
          : trainingEquipment // ignore: cast_nullable_to_non_nullable
              as String?,
      dietPreference: freezed == dietPreference
          ? _value.dietPreference
          : dietPreference // ignore: cast_nullable_to_non_nullable
              as String?,
      mindsetActivities: null == mindsetActivities
          ? _value._mindsetActivities
          : mindsetActivities // ignore: cast_nullable_to_non_nullable
              as List<String>,
      totalWorkoutsCompleted: null == totalWorkoutsCompleted
          ? _value.totalWorkoutsCompleted
          : totalWorkoutsCompleted // ignore: cast_nullable_to_non_nullable
              as int,
      currentStreak: null == currentStreak
          ? _value.currentStreak
          : currentStreak // ignore: cast_nullable_to_non_nullable
              as int,
      longestStreak: null == longestStreak
          ? _value.longestStreak
          : longestStreak // ignore: cast_nullable_to_non_nullable
              as int,
      totalCaloriesBurned: null == totalCaloriesBurned
          ? _value.totalCaloriesBurned
          : totalCaloriesBurned // ignore: cast_nullable_to_non_nullable
              as double,
      currentWeight: freezed == currentWeight
          ? _value.currentWeight
          : currentWeight // ignore: cast_nullable_to_non_nullable
              as double?,
      targetWeight: freezed == targetWeight
          ? _value.targetWeight
          : targetWeight // ignore: cast_nullable_to_non_nullable
              as double?,
      height: freezed == height
          ? _value.height
          : height // ignore: cast_nullable_to_non_nullable
              as double?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UserModelImpl implements _UserModel {
  const _$UserModelImpl(
      {required this.id,
      required this.email,
      required this.displayName,
      this.profileImageUrl,
      required this.fitnessLevel,
      final List<String> goals = const [],
      final List<String> limitations = const [],
      final Map<String, dynamic> preferences = const {},
      this.username,
      this.passwordHash,
      this.firstName,
      this.lastName,
      this.sex,
      this.trainingEquipment,
      this.dietPreference,
      final List<String> mindsetActivities = const [],
      this.totalWorkoutsCompleted = 0,
      this.currentStreak = 0,
      this.longestStreak = 0,
      this.totalCaloriesBurned = 0,
      this.currentWeight,
      this.targetWeight,
      this.height,
      this.createdAt,
      this.updatedAt})
      : _goals = goals,
        _limitations = limitations,
        _preferences = preferences,
        _mindsetActivities = mindsetActivities;

  factory _$UserModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserModelImplFromJson(json);

  @override
  final String id;
  @override
  final String email;
  @override
  final String displayName;
  @override
  final String? profileImageUrl;
  @override
  final String fitnessLevel;
  final List<String> _goals;
  @override
  @JsonKey()
  List<String> get goals {
    if (_goals is EqualUnmodifiableListView) return _goals;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_goals);
  }

  final List<String> _limitations;
  @override
  @JsonKey()
  List<String> get limitations {
    if (_limitations is EqualUnmodifiableListView) return _limitations;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_limitations);
  }

  final Map<String, dynamic> _preferences;
  @override
  @JsonKey()
  Map<String, dynamic> get preferences {
    if (_preferences is EqualUnmodifiableMapView) return _preferences;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_preferences);
  }

// Authentication fields
  @override
  final String? username;
  @override
  final String? passwordHash;
// Never store plain passwords
// Onboarding fields
  @override
  final String? firstName;
  @override
  final String? lastName;
  @override
  final String? sex;
  @override
  final String? trainingEquipment;
  @override
  final String? dietPreference;
  final List<String> _mindsetActivities;
  @override
  @JsonKey()
  List<String> get mindsetActivities {
    if (_mindsetActivities is EqualUnmodifiableListView)
      return _mindsetActivities;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_mindsetActivities);
  }

// Stats fields
  @override
  @JsonKey()
  final int totalWorkoutsCompleted;
  @override
  @JsonKey()
  final int currentStreak;
  @override
  @JsonKey()
  final int longestStreak;
  @override
  @JsonKey()
  final double totalCaloriesBurned;
  @override
  final double? currentWeight;
  @override
  final double? targetWeight;
  @override
  final double? height;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'UserModel(id: $id, email: $email, displayName: $displayName, profileImageUrl: $profileImageUrl, fitnessLevel: $fitnessLevel, goals: $goals, limitations: $limitations, preferences: $preferences, username: $username, passwordHash: $passwordHash, firstName: $firstName, lastName: $lastName, sex: $sex, trainingEquipment: $trainingEquipment, dietPreference: $dietPreference, mindsetActivities: $mindsetActivities, totalWorkoutsCompleted: $totalWorkoutsCompleted, currentStreak: $currentStreak, longestStreak: $longestStreak, totalCaloriesBurned: $totalCaloriesBurned, currentWeight: $currentWeight, targetWeight: $targetWeight, height: $height, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.profileImageUrl, profileImageUrl) ||
                other.profileImageUrl == profileImageUrl) &&
            (identical(other.fitnessLevel, fitnessLevel) ||
                other.fitnessLevel == fitnessLevel) &&
            const DeepCollectionEquality().equals(other._goals, _goals) &&
            const DeepCollectionEquality()
                .equals(other._limitations, _limitations) &&
            const DeepCollectionEquality()
                .equals(other._preferences, _preferences) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.passwordHash, passwordHash) ||
                other.passwordHash == passwordHash) &&
            (identical(other.firstName, firstName) ||
                other.firstName == firstName) &&
            (identical(other.lastName, lastName) ||
                other.lastName == lastName) &&
            (identical(other.sex, sex) || other.sex == sex) &&
            (identical(other.trainingEquipment, trainingEquipment) ||
                other.trainingEquipment == trainingEquipment) &&
            (identical(other.dietPreference, dietPreference) ||
                other.dietPreference == dietPreference) &&
            const DeepCollectionEquality()
                .equals(other._mindsetActivities, _mindsetActivities) &&
            (identical(other.totalWorkoutsCompleted, totalWorkoutsCompleted) ||
                other.totalWorkoutsCompleted == totalWorkoutsCompleted) &&
            (identical(other.currentStreak, currentStreak) ||
                other.currentStreak == currentStreak) &&
            (identical(other.longestStreak, longestStreak) ||
                other.longestStreak == longestStreak) &&
            (identical(other.totalCaloriesBurned, totalCaloriesBurned) ||
                other.totalCaloriesBurned == totalCaloriesBurned) &&
            (identical(other.currentWeight, currentWeight) ||
                other.currentWeight == currentWeight) &&
            (identical(other.targetWeight, targetWeight) ||
                other.targetWeight == targetWeight) &&
            (identical(other.height, height) || other.height == height) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        email,
        displayName,
        profileImageUrl,
        fitnessLevel,
        const DeepCollectionEquality().hash(_goals),
        const DeepCollectionEquality().hash(_limitations),
        const DeepCollectionEquality().hash(_preferences),
        username,
        passwordHash,
        firstName,
        lastName,
        sex,
        trainingEquipment,
        dietPreference,
        const DeepCollectionEquality().hash(_mindsetActivities),
        totalWorkoutsCompleted,
        currentStreak,
        longestStreak,
        totalCaloriesBurned,
        currentWeight,
        targetWeight,
        height,
        createdAt,
        updatedAt
      ]);

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserModelImplCopyWith<_$UserModelImpl> get copyWith =>
      __$$UserModelImplCopyWithImpl<_$UserModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UserModelImplToJson(
      this,
    );
  }
}

abstract class _UserModel implements UserModel {
  const factory _UserModel(
      {required final String id,
      required final String email,
      required final String displayName,
      final String? profileImageUrl,
      required final String fitnessLevel,
      final List<String> goals,
      final List<String> limitations,
      final Map<String, dynamic> preferences,
      final String? username,
      final String? passwordHash,
      final String? firstName,
      final String? lastName,
      final String? sex,
      final String? trainingEquipment,
      final String? dietPreference,
      final List<String> mindsetActivities,
      final int totalWorkoutsCompleted,
      final int currentStreak,
      final int longestStreak,
      final double totalCaloriesBurned,
      final double? currentWeight,
      final double? targetWeight,
      final double? height,
      final DateTime? createdAt,
      final DateTime? updatedAt}) = _$UserModelImpl;

  factory _UserModel.fromJson(Map<String, dynamic> json) =
      _$UserModelImpl.fromJson;

  @override
  String get id;
  @override
  String get email;
  @override
  String get displayName;
  @override
  String? get profileImageUrl;
  @override
  String get fitnessLevel;
  @override
  List<String> get goals;
  @override
  List<String> get limitations;
  @override
  Map<String, dynamic> get preferences; // Authentication fields
  @override
  String? get username;
  @override
  String? get passwordHash; // Never store plain passwords
// Onboarding fields
  @override
  String? get firstName;
  @override
  String? get lastName;
  @override
  String? get sex;
  @override
  String? get trainingEquipment;
  @override
  String? get dietPreference;
  @override
  List<String> get mindsetActivities; // Stats fields
  @override
  int get totalWorkoutsCompleted;
  @override
  int get currentStreak;
  @override
  int get longestStreak;
  @override
  double get totalCaloriesBurned;
  @override
  double? get currentWeight;
  @override
  double? get targetWeight;
  @override
  double? get height;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserModelImplCopyWith<_$UserModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
