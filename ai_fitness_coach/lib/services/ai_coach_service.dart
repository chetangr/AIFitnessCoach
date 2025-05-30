import 'dart:convert';
import 'dart:math' as math;
import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/coach.dart';
import '../models/workout.dart';

// Data classes for workout suggestions
class WorkoutSuggestion {
  final String name;
  final String description;
  final String difficulty;
  final String type;
  final List<ExerciseSuggestion> exercises;
  final Map<String, dynamic> metadata;

  WorkoutSuggestion({
    required this.name,
    required this.description,
    required this.difficulty,
    required this.type,
    required this.exercises,
    required this.metadata,
  });
}

class ExerciseSuggestion {
  final String name;
  final String description;
  final List<String> muscleGroups;
  final List<String> equipment;
  final List<String> instructions;
  final int sets;
  final int reps;
  final int restSeconds;

  ExerciseSuggestion({
    required this.name,
    required this.description,
    required this.muscleGroups,
    required this.equipment,
    required this.instructions,
    this.sets = 3,
    this.reps = 12,
    this.restSeconds = 60,
  });
}

class AICoachService {
  final Dio _dio = Dio();
  
  static const String _apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  static String get _apiKey => dotenv.env['OPENAI_API_KEY'] ?? '';
  
  WorkoutSuggestion? parseWorkoutSuggestion(String response) {
    print('🔍 PARSING WORKOUT SUGGESTION FROM: $response');
    
    try {
      String? jsonStr;
      
      // Method 1: Look for properly wrapped workout suggestion JSON
      final wrappedRegex = RegExp(r'```workout_suggestion\s*\n?([\s\S]*?)\n?```');
      final wrappedMatch = wrappedRegex.firstMatch(response);
      
      if (wrappedMatch != null) {
        jsonStr = wrappedMatch.group(1)!;
        print('📦 Found wrapped JSON: $jsonStr');
      } else {
        // Method 2: Look for any JSON object that contains workout fields
        final jsonRegex = RegExp(r'\{[\s\S]*?"name"\s*:[\s\S]*?"exercises"\s*:[\s\S]*?\}');
        final jsonMatch = jsonRegex.firstMatch(response);
        
        if (jsonMatch != null) {
          jsonStr = jsonMatch.group(0)!;
          print('📄 Found unwrapped JSON: $jsonStr');
        } else {
          // Method 3: Look for JSON starting after workout_suggestion text
          if (response.contains('workout_suggestion')) {
            final startIndex = response.indexOf('workout_suggestion');
            final afterWorkoutSuggestion = response.substring(startIndex);
            
            // Find JSON object in the remaining text
            final bracketRegex = RegExp(r'\{[\s\S]*?\}');
            final bracketMatch = bracketRegex.firstMatch(afterWorkoutSuggestion);
            
            if (bracketMatch != null) {
              jsonStr = bracketMatch.group(0)!;
              print('🔧 Found JSON after workout_suggestion: $jsonStr');
            }
          }
        }
      }
      
      if (jsonStr != null) {
        // Clean up the JSON string
        jsonStr = jsonStr.trim();
        
        // Remove any leading/trailing non-JSON characters
        final cleanJsonRegex = RegExp(r'\{[\s\S]*\}');
        final cleanMatch = cleanJsonRegex.firstMatch(jsonStr);
        if (cleanMatch != null) {
          jsonStr = cleanMatch.group(0)!;
        }
        
        print('🧹 Cleaned JSON for parsing: $jsonStr');
        
        final json = jsonDecode(jsonStr);
        print('✅ Successfully parsed JSON');
        
        // Parse exercises
        final exercises = (json['exercises'] as List).map((e) => ExerciseSuggestion(
          name: e['name'],
          description: e['description'] ?? '',
          muscleGroups: List<String>.from(e['muscleGroups'] ?? []),
          equipment: List<String>.from(e['equipment'] ?? ['bodyweight']),
          instructions: List<String>.from(e['instructions'] ?? []),
          sets: e['sets'] ?? 3,
          reps: e['reps'] ?? 12,
          restSeconds: e['restSeconds'] ?? 60,
        )).toList();
        
        final workoutSuggestion = WorkoutSuggestion(
          name: json['name'],
          description: json['description'],
          exercises: exercises,
          difficulty: json['difficulty'],
          type: json['type'],
          metadata: json['metadata'] ?? {},
        );
        
        print('🏋️ Created workout suggestion: ${workoutSuggestion.name}');
        return workoutSuggestion;
      }
    } catch (e) {
      print('❌ Error parsing workout suggestion: $e');
      print('📝 Raw response: $response');
    }
    
    print('🚫 No workout suggestion found in response');
    return null;
  }
  
  Future<String> getCoachResponse({
    required String userMessage,
    required CoachPersonality personality,
    required List<Map<String, dynamic>> conversationHistory,
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
      
      // Check if response contains a workout suggestion
      final workoutSuggestion = parseWorkoutSuggestion(aiResponse);
      if (workoutSuggestion != null) {
        print('🏋️ Workout suggestion detected: ${workoutSuggestion.name}');
      }
      
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
    required List<Map<String, dynamic>> conversationHistory,
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
        'role': message['role'] ?? 'user',
        'content': message['content'] ?? '',
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
    
    buffer.writeln('\n\n🚨 WORKOUT CREATION PROTOCOL - MANDATORY 🚨');
    buffer.writeln('⚠️ CRITICAL: When user asks for a workout OR when you mention creating/designing a specific workout, you MUST provide the JSON data!');
    buffer.writeln('');
    buffer.writeln('🔍 TRIGGERS that REQUIRE JSON workout data:');
    buffer.writeln('   - "Can you create a workout"');
    buffer.writeln('   - "I need a workout"');
    buffer.writeln('   - When you say "I\'ve created/designed [workout name]"');
    buffer.writeln('   - When you mention a specific workout name');
    buffer.writeln('   - When you describe a workout routine');
    buffer.writeln('');
    buffer.writeln('📝 FORMAT (EXACTLY like this):');
    buffer.writeln('   Step 1: Natural response mentioning the workout');
    buffer.writeln('   Step 2: IMMEDIATELY add the JSON (even if you named the workout)');
    buffer.writeln('');
    buffer.writeln('✅ CORRECT EXAMPLE:');
    buffer.writeln('   "I\'ve got the perfect workout for you! It\'s called Island Intensity. This regime is demanding and will challenge your strength and endurance for your Hawaii goal!"');
    buffer.writeln('   ```workout_suggestion');
    buffer.writeln('   {');
    buffer.writeln('     "name": "Island Intensity",');
    buffer.writeln('     "description": "High-intensity strength and endurance workout for beach body goals",');
    buffer.writeln('     "difficulty": "Hard",');
    buffer.writeln('     "type": "HIIT",');
    buffer.writeln('     "metadata": {},');
    buffer.writeln('     "exercises": [');
    buffer.writeln('       {');
    buffer.writeln('         "name": "Burpees",');
    buffer.writeln('         "description": "Full body explosive exercise",');
    buffer.writeln('         "muscleGroups": ["Full Body"],');
    buffer.writeln('         "equipment": ["Bodyweight"],');
    buffer.writeln('         "sets": 4,');
    buffer.writeln('         "reps": 15,');
    buffer.writeln('         "restSeconds": 45,');
    buffer.writeln('         "instructions": ["Start standing", "Drop to push-up", "Jump back up", "Jump with arms overhead"]');
    buffer.writeln('       },');
    buffer.writeln('       {');
    buffer.writeln('         "name": "Mountain Climbers",');
    buffer.writeln('         "description": "Core and cardio exercise",');
    buffer.writeln('         "muscleGroups": ["Core", "Cardio"],');
    buffer.writeln('         "equipment": ["Bodyweight"],');
    buffer.writeln('         "sets": 4,');
    buffer.writeln('         "reps": 30,');
    buffer.writeln('         "restSeconds": 30,');
    buffer.writeln('         "instructions": ["Start in plank", "Alternate bringing knees to chest", "Keep hips level", "Maintain fast pace"]');
    buffer.writeln('       }');
    buffer.writeln('     ]');
    buffer.writeln('   }');
    buffer.writeln('   ```');
    buffer.writeln('');
    buffer.writeln('🚫 NEVER DO THIS:');
    buffer.writeln('   - Mention a workout name without providing the JSON');
    buffer.writeln('   - Say "I\'ve created X workout" without the actual workout data');
    buffer.writeln('   - Leave the user hanging without the workout they can actually do');
    buffer.writeln('');
    buffer.writeln('✅ REQUIREMENTS:');
    buffer.writeln('   - 3-5 exercises minimum');
    buffer.writeln('   - Complete exercise data (all fields required)');
    buffer.writeln('   - Match your personality tone');
    buffer.writeln('   - If you name it, you must provide it!');
    
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

  /// Generate daily check-in message based on user's schedule and workout progress
  Future<String> generateDailyCheckIn({
    required CoachPersonality personality,
    required List<WorkoutPlan> todaysWorkouts,
    required List<WorkoutPlan> weeklySchedule,
    required Map<String, dynamic> userStats,
    required bool hasCompletedTodaysWorkout,
  }) async {
    final timeOfDay = DateTime.now().hour;
    String greeting;
    String encouragement;

    // Determine time-based greeting
    if (timeOfDay < 12) {
      greeting = "Good morning!";
    } else if (timeOfDay < 17) {
      greeting = "Good afternoon!";
    } else {
      greeting = "Good evening!";
    }

    // Build context about today's workouts
    String scheduleContext = "";
    if (todaysWorkouts.isNotEmpty) {
      final workoutNames = todaysWorkouts.map((w) => w.name).join(', ');
      scheduleContext = "Today you have: $workoutNames scheduled.";
      
      if (hasCompletedTodaysWorkout) {
        scheduleContext += " Amazing! You've already completed your workout today. ";
      } else {
        scheduleContext += " You haven't started your workout yet. ";
      }
    } else {
      scheduleContext = "You don't have any workouts scheduled for today. ";
    }

    // Add weekly progress context
    final completedThisWeek = weeklySchedule.where((w) => w.isCompleted).length;
    final totalThisWeek = weeklySchedule.length;
    scheduleContext += "This week you've completed $completedThisWeek out of $totalThisWeek workouts.";

    // Generate personality-specific encouragement
    switch (personality) {
      case CoachPersonality.aggressive:
        if (hasCompletedTodaysWorkout) {
          encouragement = "You crushed it today! That's the kind of dedication that separates champions from the rest. Keep this momentum going!";
        } else {
          encouragement = "Time to get after it! Every moment you wait is a missed opportunity to become stronger. Let's dominate this workout!";
        }
        break;
      case CoachPersonality.supportive:
        if (hasCompletedTodaysWorkout) {
          encouragement = "I'm so proud of you for completing your workout! You're building such healthy habits and taking great care of yourself.";
        } else {
          encouragement = "Remember, every small step counts toward your goals. When you're ready, I'll be here to support you through your workout.";
        }
        break;
      case CoachPersonality.steadyPace:
        if (hasCompletedTodaysWorkout) {
          encouragement = "Excellent consistency! Completing your scheduled workout shows real commitment to your fitness journey.";
        } else {
          encouragement = "Consistency is key to long-term success. Your scheduled workout is waiting whenever you're ready to tackle it.";
        }
        break;
    }

    return "$greeting $scheduleContext $encouragement";
  }

  /// Check if user should receive a check-in based on their activity and schedule
  bool shouldSendDailyCheckIn({
    required DateTime lastCheckIn,
    required DateTime lastWorkoutCompletion,
    required List<WorkoutPlan> todaysWorkouts,
  }) {
    final now = DateTime.now();
    final hoursSinceLastCheckIn = now.difference(lastCheckIn).inHours;
    
    // Send check-in if:
    // 1. Haven't checked in for 24+ hours
    // 2. Have workouts scheduled today and it's been 6+ hours since last check-in
    // 3. Haven't worked out in 48+ hours
    
    if (hoursSinceLastCheckIn >= 24) return true;
    
    if (todaysWorkouts.isNotEmpty && hoursSinceLastCheckIn >= 6) return true;
    
    final hoursSinceLastWorkout = now.difference(lastWorkoutCompletion).inHours;
    if (hoursSinceLastWorkout >= 48) return true;
    
    return false;
  }

  /// Generate schedule awareness message
  String generateScheduleAwareness({
    required List<WorkoutPlan> todaysWorkouts,
    required List<WorkoutPlan> tomorrowsWorkouts,
    required List<WorkoutPlan> weeklySchedule,
  }) {
    final now = DateTime.now();
    final timeOfDay = now.hour;
    
    String message = "";
    
    // Today's schedule
    if (todaysWorkouts.isNotEmpty) {
      if (timeOfDay < 12) {
        message += "Looking at your schedule, you have ${todaysWorkouts.length} workout(s) planned for today. ";
      } else if (timeOfDay < 18) {
        message += "You still have ${todaysWorkouts.where((w) => !w.isCompleted).length} workout(s) left for today. ";
      } else {
        final remaining = todaysWorkouts.where((w) => !w.isCompleted).length;
        if (remaining > 0) {
          message += "You have $remaining workout(s) left to complete today. ";
        }
      }
    }
    
    // Tomorrow's preview
    if (tomorrowsWorkouts.isNotEmpty) {
      final workoutNames = tomorrowsWorkouts.map((w) => w.name).take(2).join(" and ");
      message += "Tomorrow you have $workoutNames scheduled. ";
    }
    
    // Weekly overview
    final completedThisWeek = weeklySchedule.where((w) => w.isCompleted).length;
    final totalThisWeek = weeklySchedule.length;
    message += "This week you're $completedThisWeek/$totalThisWeek workouts completed.";
    
    return message;
  }

  /// Generate motivational message based on streak and progress
  String generateProgressMotivation({
    required int currentStreak,
    required int totalWorkouts,
    required double averageRating,
    required CoachPersonality personality,
  }) {
    String message = "";
    
    // Streak motivation
    if (currentStreak > 0) {
      switch (personality) {
        case CoachPersonality.aggressive:
          if (currentStreak >= 7) {
            message += "🔥 SEVEN DAYS STRONG! You're on fire! This streak is proof you've got what it takes to achieve anything!";
          } else if (currentStreak >= 3) {
            message += "💪 $currentStreak days in a row! You're building unstoppable momentum!";
          } else {
            message += "⚡ $currentStreak days down! Let's keep this streak alive and crushing!";
          }
          break;
        case CoachPersonality.supportive:
          if (currentStreak >= 7) {
            message += "🌟 What an amazing $currentStreak-day streak! I'm so proud of your dedication and consistency.";
          } else if (currentStreak >= 3) {
            message += "✨ You're doing beautifully with your $currentStreak-day streak! Small consistent steps lead to big changes.";
          } else {
            message += "🎉 Great job staying consistent for $currentStreak days! You're building such healthy habits.";
          }
          break;
        case CoachPersonality.steadyPace:
          if (currentStreak >= 7) {
            message += "📈 Excellent $currentStreak-day consistency! This kind of dedication yields lasting results.";
          } else if (currentStreak >= 3) {
            message += "✅ $currentStreak days of solid progress! Consistency is the foundation of all fitness success.";
          } else {
            message += "👍 $currentStreak days completed! Building habits takes time and you're doing it right.";
          }
          break;
      }
    }
    
    // Total workout milestone recognition
    if (totalWorkouts % 10 == 0 && totalWorkouts > 0) {
      message += " You've now completed $totalWorkouts total workouts - that's a significant milestone!";
    }
    
    return message;
  }

}