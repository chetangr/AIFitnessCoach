import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../services/auth_service.dart';
import '../../../services/ai_coach_service.dart';
import '../../../providers/user_preferences_provider.dart';
import '../../../models/coach.dart';
import '../../widgets/glass_container.dart';
import '../../../utils/ai_response_cleaner.dart';
import '../../../providers/workout_provider.dart';
import '../../../models/workout.dart';

class CoachIntroChatScreen extends ConsumerStatefulWidget {
  const CoachIntroChatScreen({super.key});

  @override
  ConsumerState<CoachIntroChatScreen> createState() => _CoachIntroChatScreenState();
}

class _CoachIntroChatScreenState extends ConsumerState<CoachIntroChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  final AuthService _authService = AuthService();
  late AICoachService _aiCoachService;
  
  bool _isTyping = false;
  bool _hasCompletedIntro = false;

  @override
  void initState() {
    super.initState();
    _aiCoachService = AICoachService();
    _initializeChat();
  }

  Future<void> _initializeChat() async {
    final coach = ref.read(userPreferencesProvider).selectedCoach;
    final user = await _authService.getCurrentUser();
    
    if (coach != null && user != null) {
      setState(() => _isTyping = true);
      
      try {
        // Generate personalized introduction using LLM
        final response = await _aiCoachService.getCoachResponse(
          userMessage: "Introduce yourself to ${user.firstName ?? 'the user'} who just selected you as their coach. Be authentic to your personality and reference their goals: ${user.goals.join(', ')}",
          personality: coach.personality,
          conversationHistory: [],
          userContext: {
            'userName': user.firstName ?? 'there',
            'fitnessLevel': user.fitnessLevel,
            'goals': user.goals.join(', '),
            'isFirstMeeting': true,
          },
        );
        
        if (mounted) {
          // Clean the response and check for workout suggestions
          final cleanedResponse = AIResponseCleaner.clean(response);
          final workoutSuggestion = _aiCoachService.parseWorkoutSuggestion(response);
          
          setState(() {
            _messages.add(ChatMessage(
              text: cleanedResponse,
              isUser: false,
              timestamp: DateTime.now(),
              workoutSuggestion: workoutSuggestion,
            ));
            _isTyping = false;
          });
          _scrollToBottom();
        }
      } catch (e) {
        // Fallback to hardcoded message if LLM fails
        if (mounted) {
          setState(() {
            _messages.add(ChatMessage(
              text: _generateIntroMessage(coach.name, user.firstName ?? 'there'),
              isUser: false,
              timestamp: DateTime.now(),
            ));
            _isTyping = false;
          });
        }
      }
    }
  }

  String _generateIntroMessage(String coachName, String userName) {
    final coach = ref.read(userPreferencesProvider).selectedCoach;
    
    switch (coach?.personality) {
      case CoachPersonality.aggressive:
        return "Hey $userName! I'm $coachName, and I'm here to PUSH you to greatness! 💪\n\n"
               "No excuses, no shortcuts - just pure dedication and hard work. "
               "I've reviewed your goals and I'm PUMPED to help you crush them!\n\n"
               "Are you ready to give me 110% every single day?";
               
      case CoachPersonality.supportive:
        return "Hi $userName! 🌟 I'm $coachName, and I'm so excited to be part of your fitness journey!\n\n"
               "I'm here to support you every step of the way. Remember, every small step counts, "
               "and I'll be celebrating your victories with you - big and small!\n\n"
               "How are you feeling about starting this amazing journey?";
               
      case CoachPersonality.steadyPace:
        return "Hello $userName, I'm $coachName. ⚖️\n\n"
               "I believe in sustainable progress and building habits that last. "
               "We'll work together to create a balanced approach that fits your lifestyle.\n\n"
               "What's most important to you as we begin this journey?";
               
      default:
        return "Hey $userName! I'm $coachName, your AI fitness coach. "
               "I'm here to help you reach your goals. Let's get started!";
    }
  }

  String _generateFollowUpQuestion() {
    final coach = ref.read(userPreferencesProvider).selectedCoach;
    
    switch (coach?.personality) {
      case CoachPersonality.aggressive:
        return "What time do you wake up? I want to know when we're starting our first workout! 🔥";
        
      case CoachPersonality.supportive:
        return "Is there anything you're nervous about? It's totally normal to have concerns, and I'm here to help! 💚";
        
      case CoachPersonality.steadyPace:
        return "What does your typical day look like? This will help me design workouts that fit seamlessly into your routine.";
        
      default:
        return "Tell me more about what motivates you to stay fit.";
    }
  }

  void _addCoachMessage(String message) {
    setState(() {
      _isTyping = true;
    });
    
    // Simulate typing delay
    Future.delayed(Duration(milliseconds: message.length * 20), () {
      if (mounted) {
        setState(() {
          _messages.add(ChatMessage(
            text: message,
            isUser: false,
            timestamp: DateTime.now(),
          ));
          _isTyping = false;
        });
        _scrollToBottom();
      }
    });
  }

  void _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;

    setState(() {
      _messages.add(ChatMessage(
        text: message,
        isUser: true,
        timestamp: DateTime.now(),
      ));
    });

    _messageController.clear();
    _scrollToBottom();

    // Get AI response
    setState(() => _isTyping = true);
    
    try {
      final coach = ref.read(userPreferencesProvider).selectedCoach;
      final user = await _authService.getCurrentUser();
      
      final response = await _aiCoachService.getCoachResponse(
        userMessage: message,
        personality: coach?.personality ?? CoachPersonality.supportive,
        conversationHistory: _messages.map((m) => {'role': m.isUser ? 'user' : 'assistant', 'content': m.text}).toList(),
        userContext: {
          'userName': user?.firstName ?? 'there',
          'fitnessLevel': user?.fitnessLevel ?? 'beginner',
          'goals': user?.goals.join(', ') ?? 'general fitness',
          'currentStreak': user?.currentStreak ?? 0,
        },
      );
      
      if (mounted) {
        // Clean the response and check for workout suggestions
        final cleanedResponse = AIResponseCleaner.clean(response);
        final workoutSuggestion = _aiCoachService.parseWorkoutSuggestion(response);
        
        // If workout suggestion found, create the workout
        String? workoutId;
        if (workoutSuggestion != null) {
          try {
            final exercises = workoutSuggestion.exercises.map((e) => Exercise(
              id: 'ex_${DateTime.now().millisecondsSinceEpoch}_${e.name.hashCode}',
              name: e.name,
              description: e.description,
              muscleGroups: e.muscleGroups,
              equipment: e.equipment,
              difficulty: _parseDifficulty(workoutSuggestion.difficulty),
              instructions: e.instructions,
              metadata: {
                'sets': e.sets,
                'reps': e.reps,
                'restSeconds': e.restSeconds,
              },
            )).toList();
            
            final workoutPlan = await ref.read(workoutProvider.notifier).createWorkoutFromAISuggestion(
              name: workoutSuggestion.name,
              description: workoutSuggestion.description,
              exercises: exercises,
              difficulty: _parseDifficulty(workoutSuggestion.difficulty),
              type: _parseWorkoutType(workoutSuggestion.type),
              scheduledFor: DateTime.now(),
              metadata: workoutSuggestion.metadata,
            );
            
            workoutId = workoutPlan.id;
          } catch (e) {
            print('Error creating workout: $e');
          }
        }
        
        setState(() {
          _messages.add(ChatMessage(
            text: cleanedResponse,
            isUser: false,
            timestamp: DateTime.now(),
            workoutSuggestion: workoutSuggestion,
            workoutId: workoutId,
          ));
          _isTyping = false;
        });
        _scrollToBottom();
        
        // Check if intro is complete (after 3-4 exchanges)
        if (_messages.where((m) => m.isUser).length >= 3) {
          setState(() => _hasCompletedIntro = true);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isTyping = false);
        _addCoachMessage("Sorry, I had a moment there! Let's keep going - what were you saying?");
      }
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _skipToMain() {
    context.go('/main');
  }

  WorkoutDifficulty _parseDifficulty(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return WorkoutDifficulty.easy;
      case 'medium':
        return WorkoutDifficulty.medium;
      case 'hard':
        return WorkoutDifficulty.hard;
      case 'extreme':
        return WorkoutDifficulty.extreme;
      default:
        return WorkoutDifficulty.medium;
    }
  }

  WorkoutType _parseWorkoutType(String type) {
    switch (type.toLowerCase()) {
      case 'strength':
        return WorkoutType.strength;
      case 'cardio':
        return WorkoutType.cardio;
      case 'hiit':
        return WorkoutType.hiit;
      case 'yoga':
        return WorkoutType.yoga;
      case 'recovery':
        return WorkoutType.recovery;
      case 'flexibility':
        return WorkoutType.flexibility;
      case 'sports':
        return WorkoutType.sports;
      default:
        return WorkoutType.strength;
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final coach = ref.watch(userPreferencesProvider).selectedCoach;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? [const Color(0xFF1a1a2e), const Color(0xFF0f0f1e)]
                : [coach?.color ?? const Color(0xFF6B73FF), const Color(0xFF000DFF)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: coach?.gradient,
                      ),
                      child: Center(
                        child: Text(
                          coach?.avatar ?? '🤖',
                          style: const TextStyle(fontSize: 24),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            coach?.name ?? 'AI Coach',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            'Getting to know you...',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: _skipToMain,
                      child: Text(
                        _hasCompletedIntro ? 'Continue' : 'Skip',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Chat messages
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length + (_isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _messages.length && _isTyping) {
                      return _buildTypingIndicator();
                    }
                    
                    final message = _messages[index];
                    return _buildMessageBubble(message);
                  },
                ),
              ),
              
              // Input field
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: GlassContainer(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: TextField(
                          controller: _messageController,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            hintText: 'Type your message...',
                            hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                            border: InputBorder.none,
                          ),
                          onSubmitted: (_) => _sendMessage(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GlassContainer(
                      padding: const EdgeInsets.all(12),
                      child: IconButton(
                        onPressed: _sendMessage,
                        icon: const Icon(Icons.send, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    final coach = ref.watch(userPreferencesProvider).selectedCoach;
    
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: message.isUser 
              ? Colors.white.withOpacity(0.2)
              : Colors.black.withOpacity(0.2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.text,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
              ),
            ),
            if (message.workoutSuggestion != null && message.workoutId != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      coach?.color.withOpacity(0.2) ?? Colors.blue.withOpacity(0.2),
                      coach?.color.withOpacity(0.1) ?? Colors.blue.withOpacity(0.1),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: coach?.color.withOpacity(0.3) ?? Colors.blue.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Row(
                      children: [
                        Icon(
                          Icons.fitness_center,
                          color: coach?.color ?? Colors.blue,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Workout Created! 🎉',
                            style: TextStyle(
                              color: coach?.color ?? Colors.blue,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      message.workoutSuggestion!.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                    
                    // Exercise Preview
                    const SizedBox(height: 12),
                    _buildIntroExercisePreview(message.workoutSuggestion!),
                    
                    const SizedBox(height: 12),
                    
                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              final workouts = ref.read(workoutProvider);
                              final workout = workouts.firstWhere((w) => w.id == message.workoutId);
                              context.push('/active-workout', extra: workout);
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    coach?.color ?? Colors.blue,
                                    coach?.color.withOpacity(0.8) ?? Colors.blue.withOpacity(0.8),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.play_arrow, color: Colors.white, size: 16),
                                  SizedBox(width: 4),
                                  Text(
                                    'Try It',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => context.go('/workouts'),
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.3),
                              ),
                            ),
                            child: const Icon(
                              Icons.calendar_today,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) {
            return AnimatedContainer(
              duration: Duration(milliseconds: 300 + (index * 100)),
              margin: const EdgeInsets.symmetric(horizontal: 2),
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.6),
                shape: BoxShape.circle,
              ),
            );
          }),
        ),
      ),
    );
  }

  /// Builds exercise preview for intro chat
  Widget _buildIntroExercisePreview(WorkoutSuggestion workout) {
    if (workout.exercises.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Text(
          'No exercises found',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 11,
            fontStyle: FontStyle.italic,
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.list_alt,
                color: Colors.white.withOpacity(0.8),
                size: 14,
              ),
              const SizedBox(width: 6),
              Text(
                'Exercises (${workout.exercises.length})',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...workout.exercises.take(3).toList().asMap().entries.map((entry) {
            final index = entry.key;
            final exercise = entry.value;
            
            return Padding(
              padding: EdgeInsets.only(bottom: index < 2 && index < workout.exercises.length - 1 ? 6 : 0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Exercise number
                  Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: Center(
                      child: Text(
                        '${index + 1}',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Exercise details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          exercise.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          '${exercise.sets} sets × ${exercise.reps} reps',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
          if (workout.exercises.length > 3) ...[
            const SizedBox(height: 4),
            Text(
              '+ ${workout.exercises.length - 3} more exercises',
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 10,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final WorkoutSuggestion? workoutSuggestion;
  final String? workoutId;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.workoutSuggestion,
    this.workoutId,
  });
}