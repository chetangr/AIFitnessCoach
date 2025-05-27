import 'dart:convert';
import 'dart:math' as math;
import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/coach.dart';

class AICoachService {
  final Dio _dio = Dio();
  
  static const String _apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  static String get _apiKey => dotenv.env['OPENAI_API_KEY'] ?? '';
  
  Future<String> getCoachResponse({
    required String userMessage,
    required CoachPersonality personality,
    required List<CoachingMessage> conversationHistory,
    Map<String, dynamic>? userContext,
  }) async {
    print('🤖 AI Coach Service: Processing message...');
    print('📝 User message: "$userMessage"');
    print('🎭 Coach personality: ${personality.name}');
    print('📊 Conversation history: ${conversationHistory.length} messages');
    print('🔑 API Key available: ${_apiKey.isNotEmpty}');
    
    if (_apiKey.isEmpty) {
      print('⚠️ OpenAI API key not found in .env file');
      throw Exception('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file');
    }
    
    try {
      // Build conversation context
      final messages = _buildConversationContext(
        personality: personality,
        userMessage: userMessage,
        conversationHistory: conversationHistory,
        userContext: userContext,
      );
      
      print('📤 Sending request to OpenAI API...');
      
      // Real API call
      final response = await _dio.post(
        _apiEndpoint,
        options: Options(
          headers: {
            'Authorization': 'Bearer $_apiKey',
            'Content-Type': 'application/json',
          },
        ),
        data: {
          'model': 'gpt-4', // Using GPT-4 for best quality
          'messages': messages,
          'temperature': _getTemperatureForPersonality(personality),
          'max_tokens': 500,
          'presence_penalty': 0.6,
          'frequency_penalty': 0.3,
        },
      );
      
      final aiResponse = response.data['choices'][0]['message']['content'];
      final previewLength = math.min<int>(50, aiResponse.length);
      print('✅ AI Response received: ${aiResponse.substring(0, previewLength)}...');
      return aiResponse;
      
    } catch (e) {
      print('❌ AI Coach Service Error: $e');
      if (e is DioException) {
        print('Response status: ${e.response?.statusCode}');
        print('Response data: ${e.response?.data}');
        
        if (e.response?.statusCode == 401) {
          throw Exception('Invalid OpenAI API key. Please check your .env file');
        } else if (e.response?.statusCode == 429) {
          throw Exception('OpenAI rate limit exceeded. Please try again later');
        }
      }
      throw Exception('Failed to get AI response: $e');
    }
  }
  
  List<Map<String, String>> _buildConversationContext({
    required CoachPersonality personality,
    required String userMessage,
    required List<CoachingMessage> conversationHistory,
    Map<String, dynamic>? userContext,
  }) {
    final messages = <Map<String, String>>[];
    
    // System prompt with personality
    messages.add({
      'role': 'system',
      'content': personality.systemPrompt + _buildContextPrompt(userContext),
    });
    
    // Add conversation history (last 10 messages for context)
    final recentHistory = conversationHistory.length > 10
        ? conversationHistory.sublist(conversationHistory.length - 10)
        : conversationHistory;
        
    for (final message in recentHistory) {
      messages.add({
        'role': message.isFromCoach ? 'assistant' : 'user',
        'content': message.content,
      });
    }
    
    // Add current user message
    messages.add({
      'role': 'user',
      'content': userMessage,
    });
    
    return messages;
  }
  
  String _buildContextPrompt(Map<String, dynamic>? userContext) {
    if (userContext == null) return '';
    
    final buffer = StringBuffer('\n\nUser Context:\n');
    
    if (userContext['fitnessLevel'] != null) {
      buffer.writeln('- Fitness Level: ${userContext['fitnessLevel']}');
    }
    if (userContext['currentWorkout'] != null) {
      buffer.writeln('- Current Workout: ${userContext['currentWorkout']}');
    }
    if (userContext['goals'] != null) {
      buffer.writeln('- Goals: ${userContext['goals']}');
    }
    if (userContext['recentProgress'] != null) {
      buffer.writeln('- Recent Progress: ${userContext['recentProgress']}');
    }
    
    return buffer.toString();
  }
  
  double _getTemperatureForPersonality(CoachPersonality personality) {
    switch (personality) {
      case CoachPersonality.aggressive:
        return 0.9; // More varied, energetic responses
      case CoachPersonality.supportive:
        return 0.7; // Balanced, warm responses
      case CoachPersonality.steadyPace:
        return 0.5; // More consistent, measured responses
    }
  }
  
}