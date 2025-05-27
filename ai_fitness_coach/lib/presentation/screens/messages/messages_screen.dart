import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../../models/coach.dart';
import '../../../services/ai_coach_service.dart';

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
  
  // Mock selected coach - in real app this would come from state management
  final Coach _selectedCoach = Coach(
    id: '2',
    name: 'Maya Zen',
    personality: CoachPersonality.supportive,
    description: 'Encouraging and understanding coach focused on your well-being',
    avatar: '🌟',
    motivationStyle: 'You\'re doing amazing, keep it up!',
    catchphrase: "Every step forward is progress!",
    color: const Color(0xFF6C5CE7),
    gradient: const LinearGradient(
      colors: [Color(0xFF6C5CE7), Color(0xFFA29BFE)],
    ),
  );

  final List<CoachingMessage> _messages = [
    CoachingMessage(
      id: '1',
      content: "Hey there! I'm Maya, your supportive AI coach. I'm here to help you on your fitness journey. How are you feeling about your workout today?",
      isFromCoach: true,
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
      coachPersonality: CoachPersonality.supportive,
    ),
    CoachingMessage(
      id: '2',
      content: "Hi Maya! I'm excited but a bit nervous about starting the 'Two Days Until Hawaii' workout.",
      isFromCoach: false,
      timestamp: DateTime.now().subtract(const Duration(minutes: 3)),
    ),
    CoachingMessage(
      id: '3',
      content: "That's completely normal! It's great that you're excited - that energy will carry you through. Remember, every rep is bringing you closer to your goals. Would you like me to modify the workout intensity or are you ready to dive in?",
      isFromCoach: true,
      timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
      coachPersonality: CoachPersonality.supportive,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _animationController.repeat();
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
    
    print('💬 Sending message: ${_messageController.text.trim()}');

    final userMessage = CoachingMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      content: _messageController.text.trim(),
      isFromCoach: false,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMessage);
      _isTyping = true;
    });

    _messageController.clear();
    _scrollToBottom();

    try {
      // Get AI response using the service
      final response = await _aiCoachService.getCoachResponse(
        userMessage: userMessage.content,
        personality: _selectedCoach.personality,
        conversationHistory: _messages,
        userContext: {
          'fitnessLevel': 'Intermediate',
          'currentWorkout': 'Two Days Until Hawaii',
          'goals': 'Build strength and endurance',
        },
      );

      final aiResponse = CoachingMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        content: response,
        isFromCoach: true,
        timestamp: DateTime.now(),
        coachPersonality: _selectedCoach.personality,
      );

      setState(() {
        _messages.add(aiResponse);
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
        coachPersonality: _selectedCoach.personality,
      );

      setState(() {
        _messages.add(errorMessage);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              Expanded(
                child: _buildMessageList(),
              ),
              _buildMessageInput(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
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
              gradient: _selectedCoach.gradient,
            ),
            child: Center(
              child: Text(
                _selectedCoach.avatar,
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
                  _selectedCoach.name,
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
        ],
      ),
    );
  }

  Widget _buildMessageList() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: _messages.length + (_isTyping ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _messages.length && _isTyping) {
          return _buildTypingIndicator();
        }
        final message = _messages[index];
        return _buildMessageBubble(message);
      },
    );
  }
  
  Widget _buildTypingIndicator() {
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
              gradient: _selectedCoach.gradient,
            ),
            child: Center(
              child: Text(
                _selectedCoach.avatar,
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
                gradient: _selectedCoach.gradient,
              ),
              child: Center(
                child: Text(
                  _selectedCoach.avatar,
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
                    : _selectedCoach.color.withOpacity(0.2),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(isFromCoach ? 4 : 20),
                  bottomRight: Radius.circular(isFromCoach ? 20 : 4),
                ),
                border: Border.all(
                  color: isFromCoach 
                      ? Colors.white.withOpacity(0.2)
                      : _selectedCoach.color.withOpacity(0.3),
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

  Widget _buildMessageInput() {
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
                gradient: _selectedCoach.gradient,
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
}