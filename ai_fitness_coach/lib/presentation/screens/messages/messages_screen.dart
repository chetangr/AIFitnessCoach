import 'package:flutter/material.dart';
import 'dart:ui';
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
  final AICoachService _aiCoachService = AICoachService();
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _animationController.repeat();
    
    // Scroll to bottom after frame is built
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _animationController.dispose();
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
        conversationHistory: ref.read(chatProvider),
        userContext: {
          'fitnessLevel': 'Intermediate',
          'currentWorkout': 'Two Days Until Hawaii',
          'goals': 'Build strength and endurance',
          'userName': userData.name ?? 'there',
        },
      );

      // Check for workout suggestion in the response
      final workoutSuggestion = _aiCoachService.parseWorkoutSuggestion(response);
      Map<String, dynamic>? metadata;
      
      if (workoutSuggestion != null) {
        // Create workout from suggestion
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
          scheduledFor: DateTime.now().add(const Duration(days: 1)), // Schedule for tomorrow
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
        }
      }

      final aiResponse = CoachingMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        content: response,
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
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(selectedCoach),
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
              _buildMessageInput(selectedCoach),
            ],
          ),
        ),
      ),
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
                    const SizedBox(height: 12),
                    GestureDetector(
                      onTap: () {
                        final workoutId = message.metadata!['workoutId'] as String;
                        final workouts = ref.read(workoutProvider);
                        final workout = workouts.firstWhere((w) => w.id == workoutId);
                        
                        // Navigate to active workout screen
                        context.push('/active-workout', extra: workout);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              selectedCoach.color,
                              selectedCoach.color.withOpacity(0.8),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: selectedCoach.color.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.fitness_center,
                              color: Colors.white,
                              size: 18,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'View Workout',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
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

  Widget _buildMessageInput(Coach selectedCoach) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: AppTheme.glassDecoration(borderRadius: 25),
              child: TextField(
                controller: _messageController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Ask your coach anything...',
                  hintStyle: TextStyle(
                    color: Colors.white.withOpacity(0.6),
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
}