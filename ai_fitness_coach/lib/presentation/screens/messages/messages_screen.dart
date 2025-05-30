import 'package:flutter/material.dart';
import 'dart:ui';
import 'dart:math' as math;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/glass_widgets.dart';
import '../../../models/coach.dart';
import '../../../models/workout.dart';
import '../../../services/ai_coach_service.dart';
import '../../../providers/user_preferences_provider.dart';
import '../../../providers/chat_provider.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/workout_provider.dart';
import '../../../utils/ai_response_cleaner.dart';
import '../../../services/ai_coach_service.dart' show WorkoutSuggestion, ExerciseSuggestion;
import 'package:flutter/services.dart';

class Particle {
  late double x;
  late double y;
  late double vx;
  late double vy;
  late double size;
  late Color color;
  late double life;
  late double maxLife;

  Particle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.size,
    required this.color,
    required this.life,
  }) : maxLife = life;

  void update() {
    x += vx;
    y += vy;
    life -= 0.02;
    if (life < 0) life = 0;
  }

  bool get isDead => life <= 0;
}

class ParticlePainter extends CustomPainter {
  final List<Particle> particles;

  ParticlePainter(this.particles);

  @override
  void paint(Canvas canvas, Size size) {
    for (var particle in particles) {
      final paint = Paint()
        ..color = particle.color.withOpacity(particle.life / particle.maxLife)
        ..style = PaintingStyle.fill;

      canvas.drawCircle(
        Offset(particle.x, particle.y),
        particle.size,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}

class MessagesScreen extends ConsumerStatefulWidget {
  const MessagesScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends ConsumerState<MessagesScreen>
    with TickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late AnimationController _animationController;
  late AnimationController _backgroundController;
  late AnimationController _messageAnimationController;
  late AnimationController _particleController;
  final AICoachService _aiCoachService = AICoachService();
  bool _isTyping = false;
  final List<Particle> _particles = [];

  @override
  void initState() {
    super.initState();
    
    // Typing animation controller
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _animationController.repeat();
    
    // Background animation controller
    _backgroundController = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: this,
    );
    _backgroundController.repeat();
    
    // Message animation controller
    _messageAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    // Particle animation controller
    _particleController = AnimationController(
      duration: const Duration(milliseconds: 16),
      vsync: this,
    );
    _particleController.addListener(_updateParticles);
    _particleController.repeat();
    
    // Initialize some floating particles
    _initializeParticles();
    
    // Scroll to bottom after frame is built
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
      _sendInitialGreeting();
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _animationController.dispose();
    _backgroundController.dispose();
    _messageAnimationController.dispose();
    _particleController.dispose();
    super.dispose();
  }

  void _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;
    
    final userData = ref.read(userPreferencesProvider);
    final selectedCoach = userData.selectedCoach;
    
    if (selectedCoach == null) {
      // Redirect to coach selection if no coach selected
      context.go('/coach-selection');
      return;
    }
    
    print('💬 Sending message: ${_messageController.text.trim()}');

    final userMessage = CoachingMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      content: _messageController.text.trim(),
      isFromCoach: false,
      timestamp: DateTime.now(),
    );

    // Add message using provider
    await ref.read(chatProvider.notifier).addMessage(userMessage);

    setState(() {
      _isTyping = true;
    });

    _messageController.clear();
    _scrollToBottom();

    try {
      // Get conversation history from provider
      final conversationHistory = ref.read(chatProvider.notifier).getConversationHistory();
      
      // Get AI response using the real service with selected coach personality
      final response = await _aiCoachService.getCoachResponse(
        userMessage: userMessage.content,
        personality: selectedCoach.personality,
        conversationHistory: ref.read(chatProvider).map((msg) => {
          'role': msg.isFromCoach ? 'assistant' : 'user',
          'content': msg.content,
        }).toList(),
        userContext: {
          'fitnessLevel': 'Intermediate',
          'currentWorkout': 'Two Days Until Hawaii',
          'goals': 'Build strength and endurance',
          'userName': userData.name ?? 'there',
        },
      );

      // Check for workout suggestion in the response
      print('🔍 MESSAGES SCREEN: Checking for workout suggestion in response');
      var workoutSuggestion = _aiCoachService.parseWorkoutSuggestion(response);
      Map<String, dynamic>? metadata;
      
      // If no JSON workout found but AI mentioned creating/having a workout, create a fallback
      if (workoutSuggestion == null && _detectsMentionedWorkout(response)) {
        print('🚨 FALLBACK: AI mentioned workout but no JSON found, creating fallback workout');
        workoutSuggestion = _createFallbackWorkout(response, selectedCoach.personality);
      }
      
      print('🏋️ WORKOUT SUGGESTION RESULT: ${workoutSuggestion != null ? "FOUND: ${workoutSuggestion.name}" : "NOT FOUND"}');
      
      if (workoutSuggestion != null) {
        // Create workout from suggestion
        final exercises = workoutSuggestion.exercises.map((e) => Exercise(
          id: 'ex_${DateTime.now().millisecondsSinceEpoch}_${e.name.hashCode}',
          name: e.name,
          description: e.description,
          muscleGroups: e.muscleGroups,
          equipment: e.equipment,
          difficulty: _parseDifficulty(workoutSuggestion?.difficulty ?? 'Medium'),
          instructions: e.instructions,
          metadata: {
            'sets': e.sets,
            'reps': e.reps,
            'restSeconds': e.restSeconds,
          },
        )).toList();
        
        // Determine when to schedule the workout based on user message
        DateTime scheduledDate = DateTime.now();
        final lowerMessage = userMessage.content.toLowerCase();
        if (lowerMessage.contains('tomorrow')) {
          scheduledDate = DateTime.now().add(const Duration(days: 1));
        } else if (lowerMessage.contains('next week')) {
          scheduledDate = DateTime.now().add(const Duration(days: 7));
        }
        // Default to today for immediate requests
        
        final workoutPlan = await ref.read(workoutProvider.notifier).createWorkoutFromAISuggestion(
          name: workoutSuggestion.name,
          description: workoutSuggestion.description,
          exercises: exercises,
          difficulty: _parseDifficulty(workoutSuggestion.difficulty),
          type: _parseWorkoutType(workoutSuggestion.type),
          scheduledFor: scheduledDate,
          metadata: workoutSuggestion.metadata,
        );
        
        metadata = {
          'hasWorkoutSuggestion': true,
          'workoutId': workoutPlan.id,
          'workoutName': workoutPlan.name,
        };
        
        // Show success message
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Workout "${workoutPlan.name}" added to your schedule!'),
              backgroundColor: selectedCoach.color,
              duration: const Duration(seconds: 3),
            ),
          );
          
          // Create celebration particles
          _createSuccessParticles();
        }
      }

      // Clean the response by removing JSON blocks
      print('🧹 MESSAGES SCREEN: Cleaning AI response before display');
      String cleanedResponse = _cleanAIResponse(response);
      print('✅ MESSAGES SCREEN: Cleaned response ready for display');
      
      final aiResponse = CoachingMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        content: cleanedResponse,
        isFromCoach: true,
        timestamp: DateTime.now(),
        coachPersonality: selectedCoach.personality,
        metadata: metadata,
      );

      // Add AI response using provider
      await ref.read(chatProvider.notifier).addMessage(aiResponse);
      
      setState(() {
        _isTyping = false;
      });
      _scrollToBottom();
      
      print('✅ AI response added to chat');
    } catch (e) {
      print('❌ Error getting AI response: $e');
      
      final errorMessage = CoachingMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        content: '⚠️ Sorry, I had trouble connecting to my AI brain. Error: ${e.toString()}',
        isFromCoach: true,
        timestamp: DateTime.now(),
        coachPersonality: selectedCoach.personality,
      );

      await ref.read(chatProvider.notifier).addMessage(errorMessage);
      
      setState(() {
        _isTyping = false;
      });
      _scrollToBottom();
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

  Future<void> _sendInitialGreeting() async {
    final messages = ref.read(chatProvider);
    final userData = ref.read(userPreferencesProvider);
    final selectedCoach = userData.selectedCoach;
    
    // Only send greeting if this is the first message and no greeting has been sent before
    final hasGreeting = messages.any((msg) => 
      msg.metadata?['isGreeting'] == true && msg.isFromCoach
    );
    
    if (!hasGreeting && selectedCoach != null) {
      setState(() {
        _isTyping = true;
      });
      
      try {
        // Get current time of day for contextual greeting
        final hour = DateTime.now().hour;
        String timeContext = '';
        if (hour < 12) {
          timeContext = 'morning';
        } else if (hour < 17) {
          timeContext = 'afternoon';
        } else {
          timeContext = 'evening';
        }
        
        // Get greeting from AI coach
        final response = await _aiCoachService.getCoachResponse(
          personality: selectedCoach.personality,
          userMessage: 'System: User just opened the chat. Generate a warm, personality-appropriate greeting for the $timeContext. Be welcoming and ask how you can help with their fitness journey today. Keep it natural and conversational.',
          conversationHistory: [],
          userContext: {
            'isGreeting': true,
            'timeOfDay': timeContext,
            'coachName': selectedCoach.name,
            'userName': userData.name ?? 'there',
          },
        );
        
        // Apply response cleaning
        final cleanedResponse = AIResponseCleaner.clean(response);
        
        // Add the greeting message
        final greetingMessage = CoachingMessage(
          id: 'greeting_${DateTime.now().millisecondsSinceEpoch}',
          content: cleanedResponse,
          isFromCoach: true,
          timestamp: DateTime.now(),
          metadata: {
            'coachId': selectedCoach.id,
            'isGreeting': true,
          },
        );
        
        await ref.read(chatProvider.notifier).addMessage(greetingMessage);
        
      } catch (e) {
        print('Error sending initial greeting: $e');
        // Fallback greeting if AI fails
        String fallbackGreeting = '';
        switch (selectedCoach.personality) {
          case CoachPersonality.aggressive:
            fallbackGreeting = "Hey there! Ready to CRUSH some fitness goals today? I'm here to push you to your limits and beyond! What are we working on today?";
            break;
          case CoachPersonality.supportive:
            fallbackGreeting = "Hello! I'm so glad you're here. How are you feeling today? I'm here to support you on your fitness journey. What would you like to work on together?";
            break;
          case CoachPersonality.steadyPace:
            fallbackGreeting = "Good to see you! I'm here to help you build consistent, sustainable progress. What fitness goals would you like to focus on today?";
            break;
        }
        
        final greetingMessage = CoachingMessage(
          id: 'fallback_greeting_${DateTime.now().millisecondsSinceEpoch}',
          content: fallbackGreeting,
          isFromCoach: true,
          timestamp: DateTime.now(),
          metadata: {
            'coachId': selectedCoach.id,
            'isGreeting': true,
            'isFallback': true,
          },
        );
        
        await ref.read(chatProvider.notifier).addMessage(greetingMessage);
      } finally {
        setState(() {
          _isTyping = false;
        });
        _scrollToBottom();
      }
    }
  }

  void _initializeParticles() {
    for (int i = 0; i < 5; i++) {
      _particles.add(Particle(
        x: math.Random().nextDouble() * 400,
        y: math.Random().nextDouble() * 800,
        vx: (math.Random().nextDouble() - 0.5) * 0.5,
        vy: (math.Random().nextDouble() - 0.5) * 0.5,
        size: math.Random().nextDouble() * 3 + 1,
        color: Colors.white.withOpacity(0.1),
        life: 1.0,
      ));
    }
  }

  void _updateParticles() {
    setState(() {
      for (var particle in _particles) {
        particle.update();
      }
      _particles.removeWhere((particle) => particle.isDead);
      
      // Add new particles occasionally
      if (math.Random().nextDouble() < 0.02) {
        _particles.add(Particle(
          x: math.Random().nextDouble() * 400,
          y: 800.0,
          vx: (math.Random().nextDouble() - 0.5) * 0.5,
          vy: -math.Random().nextDouble() * 2 - 1,
          size: math.Random().nextDouble() * 3 + 1,
          color: Colors.white.withOpacity(0.1),
          life: 1.0,
        ));
      }
    });
  }

  void _createSuccessParticles() {
    HapticFeedback.mediumImpact();
    for (int i = 0; i < 10; i++) {
      _particles.add(Particle(
        x: 200 + (math.Random().nextDouble() - 0.5) * 100,
        y: 400 + (math.Random().nextDouble() - 0.5) * 100,
        vx: (math.Random().nextDouble() - 0.5) * 4,
        vy: (math.Random().nextDouble() - 0.5) * 4,
        size: math.Random().nextDouble() * 5 + 2,
        color: [
          Colors.amber,
          Colors.orange,
          Colors.green.shade400,
          Colors.blue.shade300,
        ][math.Random().nextInt(4)],
        life: 1.0,
      ));
    }
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
  Widget build(BuildContext context) {
    final userData = ref.watch(userPreferencesProvider);
    final messages = ref.watch(chatProvider);
    final selectedCoach = userData.selectedCoach;
    
    // If no coach selected, redirect to coach selection
    if (selectedCoach == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/coach-selection');
      });
      return const SizedBox.shrink();
    }
    
    return Scaffold(
      body: AnimatedBuilder(
        animation: _backgroundController,
        builder: (context, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppTheme.backgroundGradient.colors[0],
                  AppTheme.backgroundGradient.colors[1],
                  selectedCoach.color.withOpacity(0.1),
                ],
                stops: [
                  0.0,
                  0.5 + math.sin(_backgroundController.value * 2 * math.pi) * 0.1,
                  1.0,
                ],
              ),
            ),
            child: Stack(
              children: [
                // Floating particles
                CustomPaint(
                  painter: ParticlePainter(_particles),
                  size: Size.infinite,
                ),
                // Main content
                SafeArea(
                  child: Column(
                    children: [
                      _buildEnhancedHeader(selectedCoach),
                      Expanded(
                        child: Stack(
                          children: [
                            _buildMessageList(messages),
                            if (messages.isEmpty || !_isTyping)
                              Positioned(
                                bottom: 0,
                                left: 0,
                                right: 0,
                                child: _buildQuickActions(),
                              ),
                          ],
                        ),
                      ),
                      _buildEnhancedMessageInput(selectedCoach),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildEnhancedHeader(Coach selectedCoach) {
    return AnimatedBuilder(
      animation: _backgroundController,
      builder: (context, child) {
        return Container(
          padding: const EdgeInsets.all(20.0),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                selectedCoach.color.withOpacity(0.1),
                Colors.transparent,
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: Row(
            children: [
              // Enhanced coach avatar with glow effect
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: selectedCoach.color.withOpacity(0.3),
                      blurRadius: 10 + math.sin(_backgroundController.value * 2 * math.pi) * 5,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: selectedCoach.gradient,
                    border: Border.all(
                      color: Colors.white.withOpacity(0.3),
                      width: 2,
                    ),
                  ),
                  child: Icon(
                    Icons.fitness_center,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // Coach info with animated typing indicator
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      selectedCoach.name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _isTyping ? Colors.green : Colors.green.withOpacity(0.7),
                            boxShadow: _isTyping ? [
                              BoxShadow(
                                color: Colors.green.withOpacity(0.5),
                                blurRadius: 8,
                                spreadRadius: 2,
                              ),
                            ] : [],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _isTyping ? 'Typing...' : 'Online',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Settings button with hover effect
              GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  context.go('/settings');
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.2),
                    ),
                  ),
                  child: const Icon(
                    Icons.settings,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(Coach selectedCoach) {
    return Container(
      padding: const EdgeInsets.all(20.0),
      child: Row(
        children: [
          // Coach avatar
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: selectedCoach.gradient,
            ),
            child: Center(
              child: Text(
                selectedCoach.avatar,
                style: const TextStyle(fontSize: 20),
              ),
            ),
          ),
          
          const SizedBox(width: 16),
          
          // Coach info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  selectedCoach.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFF30D158),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Online',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Coach swap button
          IconButton(
            onPressed: () => _showCoachSwapDialog(),
            icon: Icon(
              Icons.swap_horiz,
              color: Colors.white.withOpacity(0.7),
            ),
            tooltip: 'Change Coach',
          ),
        ],
      ),
    );
  }

  Widget _buildMessageList(List<CoachingMessage> messages) {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: messages.length + (_isTyping ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == messages.length && _isTyping) {
          return _buildTypingIndicator();
        }
        final message = messages[index];
        return _buildMessageBubble(message);
      },
    );
  }
  
  Widget _buildTypingIndicator() {
    final userData = ref.watch(userPreferencesProvider);
    final selectedCoach = userData.selectedCoach!;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: selectedCoach.gradient,
            ),
            child: Center(
              child: Text(
                selectedCoach.avatar,
                style: const TextStyle(fontSize: 14),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(20),
                topRight: const Radius.circular(20),
                bottomLeft: const Radius.circular(4),
                bottomRight: const Radius.circular(20),
              ),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
              ),
            ),
            child: Row(
              children: [
                ...List.generate(3, (index) => AnimatedBuilder(
                  animation: _animationController,
                  builder: (context, child) {
                    return Container(
                      margin: EdgeInsets.only(right: index < 2 ? 6 : 0),
                      child: AnimatedContainer(
                        duration: Duration(milliseconds: 300 + (index * 100)),
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(
                            _animationController.value > (index * 0.3) ? 0.8 : 0.3
                          ),
                          shape: BoxShape.circle,
                        ),
                      ),
                    );
                  },
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(CoachingMessage message) {
    final isFromCoach = message.isFromCoach;
    final userData = ref.watch(userPreferencesProvider);
    final selectedCoach = userData.selectedCoach!;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isFromCoach 
            ? MainAxisAlignment.start 
            : MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (isFromCoach) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: selectedCoach.gradient,
              ),
              child: Center(
                child: Text(
                  selectedCoach.avatar,
                  style: const TextStyle(fontSize: 14),
                ),
              ),
            ),
            const SizedBox(width: 12),
          ],
          
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isFromCoach 
                    ? Colors.white.withOpacity(0.1)
                    : selectedCoach.color.withOpacity(0.2),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(isFromCoach ? 4 : 20),
                  bottomRight: Radius.circular(isFromCoach ? 20 : 4),
                ),
                border: Border.all(
                  color: isFromCoach 
                      ? Colors.white.withOpacity(0.2)
                      : selectedCoach.color.withOpacity(0.3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    message.content,
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  if (message.metadata?['hasWorkoutSuggestion'] == true) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            selectedCoach.color.withOpacity(0.1),
                            selectedCoach.color.withOpacity(0.05),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: selectedCoach.color.withOpacity(0.3),
                          width: 1.5,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: selectedCoach.color.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  Icons.fitness_center,
                                  color: selectedCoach.color,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Workout Created! 🎉',
                                      style: TextStyle(
                                        color: selectedCoach.color,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      message.metadata!['workoutName'] ?? 'Custom Workout',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          
                          // Exercise Preview List
                          const SizedBox(height: 16),
                          _buildExercisePreview(message.metadata!['workoutId'] as String),
                          
                          const SizedBox(height: 16),
                          
                          // Action Buttons
                          Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    final workoutId = message.metadata!['workoutId'] as String;
                                    final workouts = ref.read(workoutProvider);
                                    final workout = workouts.firstWhere((w) => w.id == workoutId);
                                    
                                    // Navigate to active workout screen
                                    context.push('/active-workout', extra: workout);
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          selectedCoach.color,
                                          selectedCoach.color.withOpacity(0.8),
                                        ],
                                      ),
                                      borderRadius: BorderRadius.circular(25),
                                      boxShadow: [
                                        BoxShadow(
                                          color: selectedCoach.color.withOpacity(0.4),
                                          blurRadius: 8,
                                          offset: const Offset(0, 3),
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(
                                          Icons.play_arrow,
                                          color: Colors.white,
                                          size: 20,
                                        ),
                                        const SizedBox(width: 8),
                                        const Text(
                                          'Start Workout',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              GestureDetector(
                                onTap: () {
                                  // Navigate to workouts screen to view in schedule
                                  context.go('/workouts');
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(25),
                                    border: Border.all(
                                      color: Colors.white.withOpacity(0.3),
                                    ),
                                  ),
                                  child: Icon(
                                    Icons.calendar_today,
                                    color: Colors.white.withOpacity(0.8),
                                    size: 20,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 8),
                  Text(
                    _formatTimestamp(message.timestamp),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          if (!isFromCoach) const SizedBox(width: 32),
        ],
      ),
    );
  }

  Widget _buildEnhancedMessageInput(Coach selectedCoach) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.transparent,
            selectedCoach.color.withOpacity(0.05),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.95),
                borderRadius: BorderRadius.circular(25),
                border: Border.all(
                  color: selectedCoach.color.withOpacity(0.3),
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: selectedCoach.color.withOpacity(0.1),
                    blurRadius: 10,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: TextField(
                controller: _messageController,
                style: const TextStyle(
                  color: Colors.black87,
                  fontSize: 16,
                ),
                decoration: InputDecoration(
                  hintText: 'Ask ${selectedCoach.name} anything...',
                  hintStyle: TextStyle(
                    color: Colors.black54,
                    fontSize: 14,
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                  prefixIcon: Icon(
                    Icons.chat_bubble_outline,
                    color: selectedCoach.color.withOpacity(0.7),
                  ),
                ),
                onSubmitted: (_) => _sendMessage(),
                textInputAction: TextInputAction.send,
              ),
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: () {
              HapticFeedback.mediumImpact();
              _sendMessage();
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                gradient: selectedCoach.gradient,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: selectedCoach.color.withOpacity(0.4),
                    blurRadius: 15,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Icon(
                _messageController.text.trim().isEmpty 
                  ? Icons.mic 
                  : Icons.send,
                color: Colors.white,
                size: 24,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageInput(Coach selectedCoach) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(25),
                border: Border.all(
                  color: Colors.white.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: TextField(
                controller: _messageController,
                style: const TextStyle(
                  color: Colors.black87,
                  fontSize: 16,
                ),
                decoration: InputDecoration(
                  hintText: 'Ask your coach anything...',
                  hintStyle: const TextStyle(
                    color: Colors.black54,
                    fontSize: 14,
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                ),
                maxLines: null,
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
          ),
          
          const SizedBox(width: 12),
          
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: selectedCoach.gradient,
              ),
              child: const Icon(
                Icons.send,
                color: Colors.white,
                size: 24,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);
    
    if (difference.inMinutes < 1) {
      return 'now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${timestamp.day}/${timestamp.month}';
    }
  }
  
  void _showCoachSwapDialog() {
    final userData = ref.read(userPreferencesProvider);
    final currentCoach = userData.selectedCoach!;
    final coaches = ref.read(coachListProvider);
    final reasonController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white.withOpacity(0.1),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Change Your Coach',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Select a new coaching style that better suits your needs',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.7),
                  ),
                ),
                const SizedBox(height: 24),
                
                // Coach options
                ...coaches.where((coach) => coach.id != currentCoach.id).map((coach) {
                  return GestureDetector(
                    onTap: () {
                      // Show reason input
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            backgroundColor: const Color(0xFF1A1A1A),
                            title: Text(
                              'Why are you switching to ${coach.name}?',
                              style: const TextStyle(color: Colors.white),
                            ),
                            content: TextField(
                              controller: reasonController,
                              style: const TextStyle(color: Colors.white),
                              decoration: InputDecoration(
                                hintText: 'Enter reason (optional)',
                                hintStyle: TextStyle(
                                  color: Colors.white.withOpacity(0.5),
                                ),
                                enabledBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(
                                    color: Colors.white.withOpacity(0.3),
                                  ),
                                ),
                                focusedBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: coach.color),
                                ),
                              ),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(context).pop(),
                                child: const Text(
                                  'Cancel',
                                  style: TextStyle(color: Colors.white54),
                                ),
                              ),
                              TextButton(
                                onPressed: () async {
                                  final reason = reasonController.text.isEmpty
                                      ? 'User preference'
                                      : reasonController.text;
                                  
                                  // Swap coach
                                  await ref.read(userPreferencesProvider.notifier)
                                      .swapCoach(coach, reason);
                                  
                                  // Notify chat provider
                                  ref.read(chatProvider.notifier)
                                      .onCoachChanged(coach);
                                  
                                  Navigator.of(context).pop();
                                  Navigator.of(context).pop();
                                  
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        'Switched to ${coach.name}!',
                                        style: const TextStyle(color: Colors.white),
                                      ),
                                      backgroundColor: coach.color,
                                    ),
                                  );
                                },
                                child: Text(
                                  'Switch',
                                  style: TextStyle(color: coach.color),
                                ),
                              ),
                            ],
                          );
                        },
                      );
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.1),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: coach.gradient,
                            ),
                            child: Center(
                              child: Text(
                                coach.avatar,
                                style: const TextStyle(fontSize: 20),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  coach.name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  coach.catchphrase,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.white.withOpacity(0.7),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            Icons.arrow_forward_ios,
                            color: Colors.white.withOpacity(0.3),
                            size: 16,
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
                
                const SizedBox(height: 16),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(
                      'Cancel',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildQuickActions() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildQuickActionBubble(
              'Add workout',
              Icons.add_circle,
              const Color(0xFF007AFF),
              () => _sendQuickMessage('Can you create a workout for me today?'),
            ),
            const SizedBox(width: 12),
            _buildQuickActionBubble(
              'Edit schedule',
              Icons.calendar_today,
              const Color(0xFF00C7BE),
              () => _sendQuickMessage('I want to edit my workout schedule'),
            ),
            const SizedBox(width: 12),
            _buildQuickActionBubble(
              'Progress check',
              Icons.insights,
              const Color(0xFFFF9F0A),
              () => _sendQuickMessage('How am I doing with my fitness goals?'),
            ),
            const SizedBox(width: 12),
            _buildQuickActionBubble(
              'Diet tips',
              Icons.restaurant,
              const Color(0xFF30D158),
              () => _sendQuickMessage('What should I eat today to support my workout?'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionBubble(String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              color.withOpacity(0.2),
              color.withOpacity(0.1),
            ],
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: color.withOpacity(0.3),
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: color,
              size: 18,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _sendQuickMessage(String message) {
    _messageController.text = message;
    _sendMessage();
  }

  String _cleanAIResponse(String response) {
    return AIResponseCleaner.clean(response);
  }

  /// Detects if AI mentioned creating or having a workout without providing JSON
  bool _detectsMentionedWorkout(String response) {
    final workoutMentionPatterns = [
      RegExp(r"I['\']?ve\s+(got|created|designed|crafted)\s+.*workout", caseSensitive: false),
      RegExp(r"perfect\s+workout", caseSensitive: false),
      RegExp(r"workout\s+(for\s+you|called|named)", caseSensitive: false),
      RegExp(r"(Island\s+Intensity|Beach\s+Body|Killer\s+Workout)", caseSensitive: false),
      RegExp(r"this\s+(routine|regime|workout)\s+(is|will)", caseSensitive: false),
      RegExp(r"I['\']?ve\s+got\s+the\s+perfect", caseSensitive: false),
    ];
    
    for (final pattern in workoutMentionPatterns) {
      if (pattern.hasMatch(response)) {
        print('🎯 DETECTED WORKOUT MENTION: ${pattern.pattern}');
        return true;
      }
    }
    
    return false;
  }

  /// Creates a fallback workout when AI mentions one but doesn't provide JSON
  WorkoutSuggestion _createFallbackWorkout(String response, CoachPersonality personality) {
    // Extract workout name from response
    String workoutName = _extractWorkoutName(response);
    
    // Create exercises based on personality and context
    final exercises = _generateFallbackExercises(personality);
    
    // Determine difficulty and type from response context
    final difficulty = _inferDifficulty(response);
    final workoutType = _inferWorkoutType(response);
    
    print('🔨 CREATING FALLBACK WORKOUT: $workoutName ($difficulty $workoutType)');
    
    return WorkoutSuggestion(
      name: workoutName,
      description: _generateWorkoutDescription(workoutName, personality),
      difficulty: difficulty,
      type: workoutType,
      exercises: exercises,
      metadata: {'source': 'fallback', 'personality': personality.name},
    );
  }

  String _extractWorkoutName(String response) {
    // Try to extract specific workout names mentioned
    final namePatterns = [
      // Specific known workout names
      RegExp(r'(Island\s+Intensity|Beach\s+Body|Thunder\s+Blast|Core\s+Crusher)', caseSensitive: false),
      // "called [Name]" - capture only proper names after "called"
      RegExp(r'called\s+"?([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)"?', caseSensitive: false),
      // "named [Name]" - capture only proper names after "named"
      RegExp(r'named\s+"?([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)"?', caseSensitive: false),
      // "the [Name] workout" - capture names before "workout"
      RegExp(r'the\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+workout', caseSensitive: false),
      // "[Name] workout" but exclude common words - simplified
      RegExp(r'([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+workout', caseSensitive: false),
    ];
    
    for (final pattern in namePatterns) {
      final match = pattern.firstMatch(response);
      if (match != null) {
        String name = match.group(1)!.trim();
        // Validate the name - exclude common phrases
        final excludedPhrases = [
          'specifically for you',
          'for you',
          'perfect',
          'great',
          'awesome',
          'custom',
          'personalized'
        ];
        
        bool isValidName = true;
        for (final phrase in excludedPhrases) {
          if (name.toLowerCase().contains(phrase)) {
            isValidName = false;
            break;
          }
        }
        
        if (isValidName && name.length > 3 && name.length < 30) {
          print('✅ Extracted workout name: "$name"');
          return name;
        }
      }
    }
    
    print('⚠️ No valid workout name found, using fallback');
    // Fallback to personality-based names
    switch (ref.read(userPreferencesProvider).selectedCoach?.personality) {
      case CoachPersonality.aggressive:
        return "Thunder Blast Workout";
      case CoachPersonality.supportive:
        return "Feel-Good Fitness";
      case CoachPersonality.steadyPace:
        return "Steady Progress Builder";
      default:
        return "Custom AI Workout";
    }
  }

  List<ExerciseSuggestion> _generateFallbackExercises(CoachPersonality personality) {
    switch (personality) {
      case CoachPersonality.aggressive:
        return [
          ExerciseSuggestion(
            name: "Burpees",
            description: "High-intensity full body exercise",
            muscleGroups: ["Full Body", "Cardio"],
            equipment: ["Bodyweight"],
            instructions: ["Start standing", "Drop to squat", "Jump back to plank", "Do push-up", "Jump feet back", "Explosive jump up"],
            sets: 4,
            reps: 15,
            restSeconds: 45,
          ),
          ExerciseSuggestion(
            name: "Mountain Climbers",
            description: "Intense core and cardio exercise",
            muscleGroups: ["Core", "Cardio"],
            equipment: ["Bodyweight"],
            instructions: ["Start in high plank", "Alternate bringing knees to chest", "Keep core tight", "Move as fast as possible"],
            sets: 4,
            reps: 30,
            restSeconds: 30,
          ),
          ExerciseSuggestion(
            name: "Jump Squats",
            description: "Explosive lower body power",
            muscleGroups: ["Legs", "Glutes"],
            equipment: ["Bodyweight"],
            instructions: ["Stand with feet shoulder-width", "Lower into squat", "Explode up jumping", "Land softly", "Repeat immediately"],
            sets: 4,
            reps: 20,
            restSeconds: 45,
          ),
        ];
        
      case CoachPersonality.supportive:
        return [
          ExerciseSuggestion(
            name: "Modified Push-ups",
            description: "Upper body strength building",
            muscleGroups: ["Chest", "Arms"],
            equipment: ["Bodyweight"],
            instructions: ["Start on knees or full plank", "Lower chest toward ground", "Push back up slowly", "Focus on form"],
            sets: 3,
            reps: 10,
            restSeconds: 60,
          ),
          ExerciseSuggestion(
            name: "Wall Sits",
            description: "Gentle leg strengthening",
            muscleGroups: ["Legs", "Glutes"],
            equipment: ["Wall"],
            instructions: ["Stand with back against wall", "Slide down to sitting position", "Hold position", "Keep knees at 90 degrees"],
            sets: 3,
            reps: 1,
            restSeconds: 60,
          ),
          ExerciseSuggestion(
            name: "Plank Hold",
            description: "Core stability exercise",
            muscleGroups: ["Core"],
            equipment: ["Bodyweight"],
            instructions: ["Start in plank position", "Keep body straight", "Hold position", "Breathe steadily"],
            sets: 3,
            reps: 1,
            restSeconds: 60,
          ),
        ];
        
      case CoachPersonality.steadyPace:
        return [
          ExerciseSuggestion(
            name: "Standard Push-ups",
            description: "Classic upper body exercise",
            muscleGroups: ["Chest", "Triceps", "Shoulders"],
            equipment: ["Bodyweight"],
            instructions: ["Start in plank position", "Lower chest to ground", "Push back up", "Maintain steady rhythm"],
            sets: 3,
            reps: 12,
            restSeconds: 60,
          ),
          ExerciseSuggestion(
            name: "Bodyweight Squats",
            description: "Fundamental leg exercise",
            muscleGroups: ["Legs", "Glutes"],
            equipment: ["Bodyweight"],
            instructions: ["Stand with feet hip-width", "Lower into squat position", "Keep chest up", "Push through heels to stand"],
            sets: 3,
            reps: 15,
            restSeconds: 60,
          ),
          ExerciseSuggestion(
            name: "Lunges",
            description: "Unilateral leg strengthening",
            muscleGroups: ["Legs", "Glutes"],
            equipment: ["Bodyweight"],
            instructions: ["Step forward into lunge", "Lower back knee toward ground", "Push back to start", "Alternate legs"],
            sets: 3,
            reps: 12,
            restSeconds: 60,
          ),
        ];
    }
  }

  String _inferDifficulty(String response) {
    if (response.toLowerCase().contains('intense') || 
        response.toLowerCase().contains('demanding') ||
        response.toLowerCase().contains('challenging') ||
        response.toLowerCase().contains('extreme')) {
      return 'Hard';
    } else if (response.toLowerCase().contains('easy') || 
               response.toLowerCase().contains('gentle') ||
               response.toLowerCase().contains('beginner')) {
      return 'Easy';
    }
    return 'Medium';
  }

  String _inferWorkoutType(String response) {
    if (response.toLowerCase().contains('hiit') || 
        response.toLowerCase().contains('intensity') ||
        response.toLowerCase().contains('interval')) {
      return 'HIIT';
    } else if (response.toLowerCase().contains('cardio') || 
               response.toLowerCase().contains('endurance')) {
      return 'Cardio';
    } else if (response.toLowerCase().contains('strength') || 
               response.toLowerCase().contains('muscle')) {
      return 'Strength';
    }
    return 'Strength';
  }

  String _generateWorkoutDescription(String name, CoachPersonality personality) {
    switch (personality) {
      case CoachPersonality.aggressive:
        return "High-intensity workout designed to push your limits and maximize results";
      case CoachPersonality.supportive:
        return "Thoughtfully designed workout to help you build strength at your own pace";
      case CoachPersonality.steadyPace:
        return "Balanced workout routine focused on consistent progress and sustainable results";
    }
  }

  /// Builds a preview list of exercises in the workout
  Widget _buildExercisePreview(String workoutId) {
    final workouts = ref.watch(workoutProvider);
    final workout = workouts.firstWhere((w) => w.id == workoutId, orElse: () => WorkoutPlan(
      id: 'not_found',
      name: 'Not Found',
      description: 'Workout not found',
      duration: '0 mins',
      calories: '0',
      difficulty: WorkoutDifficulty.medium,
      type: WorkoutType.strength,
      imagePath: 'assets/images/workout_default.png',
      isCompleted: false,
      scheduledFor: DateTime.now(),
      exercises: [],
    ));

    if (workout.exercises.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Text(
          'No exercises found',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 12,
            fontStyle: FontStyle.italic,
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
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
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'Exercises (${workout.exercises.length})',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...workout.exercises.asMap().entries.map((entry) {
            final index = entry.key;
            final exercise = entry.value;
            final sets = exercise.metadata['sets'] ?? 3;
            final reps = exercise.metadata['reps'] ?? 12;
            
            return Padding(
              padding: EdgeInsets.only(bottom: index < workout.exercises.length - 1 ? 8 : 0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Exercise number
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        '${index + 1}',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Exercise details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          exercise.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$sets sets × $reps reps',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
}