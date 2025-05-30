import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/models/user_model.dart';
import 'database_service.dart';

class AuthService {
  static const String _currentUserKey = 'current_user';
  static const String _authTokenKey = 'auth_token';
  
  final DatabaseService _databaseService = DatabaseService();
  
  // Hash password using SHA256
  String _hashPassword(String password) {
    final bytes = utf8.encode(password);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }
  
  // Generate a simple auth token (in production, use JWT)
  String _generateAuthToken(String userId) {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return '$userId:$timestamp';
  }
  
  // Register new user
  Future<UserModel?> register({
    required String username,
    required String password,
    required String email,
    required String displayName,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Check if username already exists
      final existingUsers = await _databaseService.getAllUsers();
      if (existingUsers.any((user) => user.username == username)) {
        throw Exception('Username already exists');
      }
      
      // Create new user
      final userId = DateTime.now().millisecondsSinceEpoch.toString();
      final passwordHash = _hashPassword(password);
      
      final newUser = UserModel(
        id: userId,
        username: username,
        passwordHash: passwordHash,
        email: email,
        displayName: displayName,
        fitnessLevel: 'beginner',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      // Save user to database
      await _databaseService.saveUser(newUser);
      
      // Set current user and auth token
      await prefs.setString(_currentUserKey, userId);
      await prefs.setString(_authTokenKey, _generateAuthToken(userId));
      
      return newUser;
    } catch (e) {
      print('Registration error: $e');
      return null;
    }
  }
  
  // Login user
  Future<UserModel?> login({
    required String username,
    required String password,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Handle demo user login
      if (username == 'demo@fitness.com' && password == 'demo123') {
        final demoUser = await _createDemoUser();
        if (demoUser != null) {
          // Set current user and auth token
          await prefs.setString(_currentUserKey, demoUser.id);
          await prefs.setString(_authTokenKey, _generateAuthToken(demoUser.id));
          return demoUser;
        }
      }
      
      final passwordHash = _hashPassword(password);
      
      // Find user by username and password
      final users = await _databaseService.getAllUsers();
      final user = users.firstWhere(
        (u) => u.username == username && u.passwordHash == passwordHash,
        orElse: () => throw Exception('Invalid username or password'),
      );
      
      // Set current user and auth token
      await prefs.setString(_currentUserKey, user.id);
      await prefs.setString(_authTokenKey, _generateAuthToken(user.id));
      
      return user;
    } catch (e) {
      print('Login error: $e');
      return null;
    }
  }
  
  // Get current user
  Future<UserModel?> getCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString(_currentUserKey);
      
      if (userId == null) {
        return null;
      }
      
      return await _databaseService.getUser(userId);
    } catch (e) {
      print('Get current user error: $e');
      return null;
    }
  }
  
  // Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_currentUserKey);
    await prefs.remove(_authTokenKey);
  }
  
  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey(_currentUserKey) && prefs.containsKey(_authTokenKey);
  }
  
  // Update user profile
  Future<UserModel?> updateUser(UserModel user) async {
    try {
      await _databaseService.saveUser(user);
      return user;
    } catch (e) {
      print('Update user error: $e');
      return null;
    }
  }
  
  // Create demo user with pre-filled data
  Future<UserModel?> _createDemoUser() async {
    try {
      final users = await _databaseService.getAllUsers();
      
      // Check if demo user already exists
      final existingDemo = users.where((u) => u.username == 'demo@fitness.com').firstOrNull;
      if (existingDemo != null) {
        return existingDemo;
      }
      
      // Create demo user with complete onboarding data
      final demoUser = UserModel(
        id: 'demo_user_id',
        username: 'demo@fitness.com',
        passwordHash: _hashPassword('demo123'),
        email: 'demo@fitness.com',
        displayName: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        fitnessLevel: 'intermediate',
        goals: ['Build Muscle', 'Lose Weight', 'Improve Endurance'],
        currentWeight: 70.0,
        targetWeight: 65.0,
        height: 175.0,
        sex: 'male',
        trainingEquipment: 'minimal',
        dietPreference: 'balanced',
        mindsetActivities: ['meditation', 'music'],
        preferences: {
          'workoutDaysPerWeek': 4,
          'sessionDuration': 45,
          'preferredCoach': 'supportive',
          'hasCompletedOnboarding': true,
        },
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      // Save demo user
      await _databaseService.saveUser(demoUser);
      
      return demoUser;
    } catch (e) {
      print('Create demo user error: $e');
      return null;
    }
  }
}