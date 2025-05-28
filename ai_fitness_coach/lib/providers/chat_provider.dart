import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/coach.dart';
import 'user_preferences_provider.dart';

// Chat state management
class ChatNotifier extends StateNotifier<List<CoachingMessage>> {
  final SharedPreferences _prefs;
  final Ref _ref;
  
  ChatNotifier(this._prefs, this._ref) : super([]) {
    _loadMessages();
  }

  // Load messages from SharedPreferences
  Future<void> _loadMessages() async {
    final messagesJson = _prefs.getString('chatMessages');
    if (messagesJson != null) {
      try {
        final List<dynamic> messagesList = json.decode(messagesJson);
        state = messagesList
            .map((msg) => CoachingMessage.fromJson(msg))
            .toList();
      } catch (e) {
        print('Error loading messages: $e');
        // Initialize with welcome message if loading fails
        _initializeWelcomeMessage();
      }
    } else {
      // First time - add welcome message
      _initializeWelcomeMessage();
    }
  }

  // Initialize with welcome message
  void _initializeWelcomeMessage() {
    final userData = _ref.read(userPreferencesProvider);
    final coach = userData.selectedCoach;
    
    if (coach != null) {
      final welcomeMessage = CoachingMessage(
        id: 'welcome_${DateTime.now().millisecondsSinceEpoch}',
        content: "Hi there! I'm ${coach.name}, your AI fitness coach. ${coach.catchphrase} How can I help you with your fitness journey today?",
        isFromCoach: true,
        timestamp: DateTime.now(),
        coachPersonality: coach.personality,
      );
      
      state = [welcomeMessage];
      _saveMessages();
    }
  }

  // Save messages to SharedPreferences
  Future<void> _saveMessages() async {
    final messagesJson = state.map((msg) => msg.toJson()).toList();
    await _prefs.setString('chatMessages', json.encode(messagesJson));
  }

  // Add a new message
  Future<void> addMessage(CoachingMessage message) async {
    state = [...state, message];
    await _saveMessages();
  }

  // Clear all messages
  Future<void> clearMessages() async {
    state = [];
    await _prefs.remove('chatMessages');
    _initializeWelcomeMessage();
  }

  // Get conversation history for AI context
  List<Map<String, String>> getConversationHistory() {
    // Return last 10 messages for context
    final recentMessages = state.length > 10 
        ? state.sublist(state.length - 10) 
        : state;
    
    return recentMessages.map((msg) => {
      'role': msg.isFromCoach ? 'assistant' : 'user',
      'content': msg.content,
    }).toList();
  }

  // Update messages when coach changes
  void onCoachChanged(Coach newCoach) {
    // Add a transition message
    final transitionMessage = CoachingMessage(
      id: 'transition_${DateTime.now().millisecondsSinceEpoch}',
      content: "Hey! ${newCoach.name} here. I'll be your new coach from now on. ${newCoach.catchphrase} Let's continue your fitness journey together!",
      isFromCoach: true,
      timestamp: DateTime.now(),
      coachPersonality: newCoach.personality,
    );
    
    addMessage(transitionMessage);
  }
}

// Provider
final chatProvider = StateNotifierProvider<ChatNotifier, List<CoachingMessage>>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return ChatNotifier(prefs, ref);
});