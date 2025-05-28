import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/coach.dart';
import '../services/database_service.dart';
import 'dart:convert';

// User data model
class UserData {
  final String? userId;
  final String? name;
  final String? email;
  final String? avatarUrl;
  final int level;
  final int xp;
  final Coach? selectedCoach;
  final DateTime? lastCoachSwap;

  UserData({
    this.userId,
    this.name,
    this.email,
    this.avatarUrl,
    this.level = 1,
    this.xp = 0,
    this.selectedCoach,
    this.lastCoachSwap,
  });

  UserData copyWith({
    String? userId,
    String? name,
    String? email,
    String? avatarUrl,
    int? level,
    int? xp,
    Coach? selectedCoach,
    DateTime? lastCoachSwap,
  }) {
    return UserData(
      userId: userId ?? this.userId,
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      level: level ?? this.level,
      xp: xp ?? this.xp,
      selectedCoach: selectedCoach ?? this.selectedCoach,
      lastCoachSwap: lastCoachSwap ?? this.lastCoachSwap,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'name': name,
      'email': email,
      'avatarUrl': avatarUrl,
      'level': level,
      'xp': xp,
      'selectedCoach': selectedCoach?.toJson(),
      'lastCoachSwap': lastCoachSwap?.toIso8601String(),
    };
  }

  factory UserData.fromJson(Map<String, dynamic> json) {
    return UserData(
      userId: json['userId'],
      name: json['name'],
      email: json['email'],
      avatarUrl: json['avatarUrl'],
      level: json['level'] ?? 1,
      xp: json['xp'] ?? 0,
      selectedCoach: json['selectedCoach'] != null 
          ? Coach.fromJson(json['selectedCoach']) 
          : null,
      lastCoachSwap: json['lastCoachSwap'] != null 
          ? DateTime.parse(json['lastCoachSwap']) 
          : null,
    );
  }
}

// Coach swap record
class CoachSwapRecord {
  final String id;
  final String userId;
  final Coach fromCoach;
  final Coach toCoach;
  final String reason;
  final DateTime timestamp;

  CoachSwapRecord({
    required this.id,
    required this.userId,
    required this.fromCoach,
    required this.toCoach,
    required this.reason,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'fromCoach': fromCoach.toJson(),
      'toCoach': toCoach.toJson(),
      'reason': reason,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

// Provider for user preferences
class UserPreferencesNotifier extends StateNotifier<UserData> {
  final SharedPreferences _prefs;
  final DatabaseService _databaseService;
  
  UserPreferencesNotifier(this._prefs, this._databaseService) : super(UserData()) {
    _loadUserData();
  }

  // Load user data from SharedPreferences
  Future<void> _loadUserData() async {
    final userDataJson = _prefs.getString('userData');
    if (userDataJson != null) {
      try {
        final userData = UserData.fromJson(json.decode(userDataJson));
        state = userData;
      } catch (e) {
        print('Error loading user data: $e');
      }
    }
  }

  // Save user data to SharedPreferences
  Future<void> _saveUserData() async {
    await _prefs.setString('userData', json.encode(state.toJson()));
  }

  // Update user profile
  Future<void> updateUserProfile({
    String? name,
    String? email,
    String? avatarUrl,
  }) async {
    state = state.copyWith(
      name: name,
      email: email,
      avatarUrl: avatarUrl,
    );
    await _saveUserData();
  }

  // Select a coach
  Future<void> selectCoach(Coach coach) async {
    final previousCoach = state.selectedCoach;
    
    state = state.copyWith(
      selectedCoach: coach,
      lastCoachSwap: DateTime.now(),
    );
    
    await _saveUserData();
    
    // Record the coach selection/swap in database
    if (previousCoach != null && previousCoach.id != coach.id) {
      await _recordCoachSwap(
        fromCoach: previousCoach,
        toCoach: coach,
        reason: 'User selected new coach',
      );
    }
  }

  // Swap coach with reason
  Future<void> swapCoach(Coach newCoach, String reason) async {
    final previousCoach = state.selectedCoach;
    
    if (previousCoach == null || previousCoach.id == newCoach.id) {
      return;
    }
    
    state = state.copyWith(
      selectedCoach: newCoach,
      lastCoachSwap: DateTime.now(),
    );
    
    await _saveUserData();
    await _recordCoachSwap(
      fromCoach: previousCoach,
      toCoach: newCoach,
      reason: reason,
    );
  }

  // Record coach swap in database
  Future<void> _recordCoachSwap({
    required Coach fromCoach,
    required Coach toCoach,
    required String reason,
  }) async {
    final swapRecord = CoachSwapRecord(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      userId: state.userId ?? 'anonymous',
      fromCoach: fromCoach,
      toCoach: toCoach,
      reason: reason,
      timestamp: DateTime.now(),
    );
    
    await _databaseService.recordCoachSwap(swapRecord);
  }

  // Update XP and level
  Future<void> addXP(int xpGained) async {
    final newXP = state.xp + xpGained;
    final newLevel = _calculateLevel(newXP);
    
    state = state.copyWith(
      xp: newXP,
      level: newLevel,
    );
    
    await _saveUserData();
  }

  // Calculate level from XP
  int _calculateLevel(int xp) {
    // Simple level calculation: 1000 XP per level
    return (xp / 1000).floor() + 1;
  }

  // Clear all messages when switching coaches
  Future<void> clearChatHistory() async {
    await _prefs.remove('chatMessages');
  }
}

// Providers
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden');
});

final databaseServiceProvider = Provider<DatabaseService>((ref) {
  return DatabaseService();
});

final userPreferencesProvider = StateNotifierProvider<UserPreferencesNotifier, UserData>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  final dbService = ref.watch(databaseServiceProvider);
  return UserPreferencesNotifier(prefs, dbService);
});

// Coach list provider
final coachListProvider = Provider<List<Coach>>((ref) {
  return [
    Coach(
      id: 'alex_thunder',
      name: 'Alex Thunder',
      personality: CoachPersonality.aggressive,
      description: 'High-energy, results-driven coach who pushes you to your limits',
      avatar: '💪',
      motivationStyle: 'Aggressive & Challenging',
      catchphrase: "No excuses, only results!",
      color: const Color(0xFFE74C3C),
      gradient: const LinearGradient(
        colors: [Color(0xFFE74C3C), Color(0xFFFF6B7A)],
      ),
    ),
    Coach(
      id: 'maya_zen',
      name: 'Maya Zen',
      personality: CoachPersonality.supportive,
      description: 'Patient and encouraging coach who builds your confidence',
      avatar: '🌸',
      motivationStyle: 'Supportive & Encouraging',
      catchphrase: "Progress, not perfection!",
      color: const Color(0xFF6C5CE7),
      gradient: const LinearGradient(
        colors: [Color(0xFF6C5CE7), Color(0xFF8A84FF)],
      ),
    ),
    Coach(
      id: 'ryan_steady',
      name: 'Ryan Steady',
      personality: CoachPersonality.steadyPace,
      description: 'Methodical coach who focuses on consistent, sustainable progress',
      avatar: '⚡',
      motivationStyle: 'Steady & Consistent',
      catchphrase: "One step at a time!",
      color: const Color(0xFF00B894),
      gradient: const LinearGradient(
        colors: [Color(0xFF00B894), Color(0xFF00D9B7)],
      ),
    ),
  ];
});