import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'user_preferences_provider.dart';

class AppSettings {
  final bool darkMode;
  final bool notificationsEnabled;
  final bool soundEffectsEnabled;
  final bool voiceCoachingEnabled;
  final String units; // 'Metric' or 'Imperial'
  final String language;

  const AppSettings({
    this.darkMode = false,
    this.notificationsEnabled = true,
    this.soundEffectsEnabled = true,
    this.voiceCoachingEnabled = true,
    this.units = 'Metric',
    this.language = 'English',
  });

  AppSettings copyWith({
    bool? darkMode,
    bool? notificationsEnabled,
    bool? soundEffectsEnabled,
    bool? voiceCoachingEnabled,
    String? units,
    String? language,
  }) {
    return AppSettings(
      darkMode: darkMode ?? this.darkMode,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      soundEffectsEnabled: soundEffectsEnabled ?? this.soundEffectsEnabled,
      voiceCoachingEnabled: voiceCoachingEnabled ?? this.voiceCoachingEnabled,
      units: units ?? this.units,
      language: language ?? this.language,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'darkMode': darkMode,
      'notificationsEnabled': notificationsEnabled,
      'soundEffectsEnabled': soundEffectsEnabled,
      'voiceCoachingEnabled': voiceCoachingEnabled,
      'units': units,
      'language': language,
    };
  }

  factory AppSettings.fromJson(Map<String, dynamic> json) {
    return AppSettings(
      darkMode: json['darkMode'] ?? false,
      notificationsEnabled: json['notificationsEnabled'] ?? true,
      soundEffectsEnabled: json['soundEffectsEnabled'] ?? true,
      voiceCoachingEnabled: json['voiceCoachingEnabled'] ?? true,
      units: json['units'] ?? 'Metric',
      language: json['language'] ?? 'English',
    );
  }
}

class ThemeNotifier extends StateNotifier<AppSettings> {
  final SharedPreferences _prefs;

  ThemeNotifier(this._prefs) : super(const AppSettings()) {
    _loadSettings();
  }

  void _loadSettings() {
    try {
      final settingsJson = _prefs.getString('app_settings');
      if (settingsJson != null) {
        // Try to parse as JSON first
        try {
          final Map<String, dynamic> jsonMap = json.decode(settingsJson);
          state = AppSettings.fromJson(jsonMap);
          return;
        } catch (e) {
          print('JSON parse failed, trying URL encoding: $e');
        }
        
        // Fallback to URL encoding format
        final settingsMap = Map<String, dynamic>.from(const AppSettings().toJson());
        settingsJson.split('&').forEach((pair) {
          final parts = pair.split('=');
          if (parts.length == 2) {
            final key = parts[0];
            final value = parts[1];
            
            // Parse boolean values
            if (value == 'true' || value == 'false') {
              settingsMap[key] = value == 'true';
            } else {
              settingsMap[key] = value;
            }
          }
        });
        state = AppSettings.fromJson(settingsMap);
      } else {
        // First time - save default settings
        _saveSettings();
      }
    } catch (e) {
      print('Error loading settings: $e');
      // Use default settings if loading fails
      state = const AppSettings();
      _saveSettings();
    }
  }

  Future<void> _saveSettings() async {
    final settingsJson = json.encode(state.toJson());
    await _prefs.setString('app_settings', settingsJson);
  }

  Future<void> toggleDarkMode() async {
    state = state.copyWith(darkMode: !state.darkMode);
    await _saveSettings();
  }

  Future<void> toggleNotifications() async {
    state = state.copyWith(notificationsEnabled: !state.notificationsEnabled);
    await _saveSettings();
  }

  Future<void> toggleSoundEffects() async {
    state = state.copyWith(soundEffectsEnabled: !state.soundEffectsEnabled);
    await _saveSettings();
  }

  Future<void> toggleVoiceCoaching() async {
    state = state.copyWith(voiceCoachingEnabled: !state.voiceCoachingEnabled);
    await _saveSettings();
  }

  Future<void> setUnits(String units) async {
    state = state.copyWith(units: units);
    await _saveSettings();
  }

  Future<void> setLanguage(String language) async {
    state = state.copyWith(language: language);
    await _saveSettings();
  }

  Future<void> resetToDefaults() async {
    await _prefs.remove('app_settings');
    state = const AppSettings();
    await _saveSettings();
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, AppSettings>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return ThemeNotifier(prefs);
});

// Theme data based on dark mode setting
final themeDataProvider = Provider<ThemeData>((ref) {
  final settings = ref.watch(themeProvider);
  
  if (settings.darkMode) {
    return ThemeData(
      brightness: Brightness.dark,
      primarySwatch: Colors.blue,
      primaryColor: const Color(0xFF007AFF),
      scaffoldBackgroundColor: const Color(0xFF0A0A0A),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      cardColor: const Color(0xFF1C1C1E),
      dividerColor: Colors.white12,
    );
  } else {
    return ThemeData(
      brightness: Brightness.light,
      primarySwatch: Colors.blue,
      primaryColor: const Color(0xFF007AFF),
      scaffoldBackgroundColor: Colors.white,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.black),
        titleTextStyle: TextStyle(
          color: Colors.black,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardColor: const Color(0xFFF2F2F7),
      dividerColor: Colors.black12,
    );
  }
});