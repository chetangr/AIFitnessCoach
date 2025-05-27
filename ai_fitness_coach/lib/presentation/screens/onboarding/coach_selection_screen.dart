import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../../models/coach.dart';

class CoachSelectionScreen extends ConsumerStatefulWidget {
  const CoachSelectionScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<CoachSelectionScreen> createState() => _CoachSelectionScreenState();
}

class _CoachSelectionScreenState extends ConsumerState<CoachSelectionScreen>
    with TickerProviderStateMixin {
  Coach? _selectedCoach;
  late AnimationController _animationController;
  late List<Animation<Offset>> _slideAnimations;

  final List<Coach> _coaches = [
    Coach(
      id: '1',
      name: 'Alex Thunder',
      personality: CoachPersonality.aggressive,
      description: 'High-energy, results-driven coach who pushes you to your limits',
      avatar: '💪',
      motivationStyle: 'No excuses, maximum effort!',
      catchphrase: "Let's crush this workout!",
      color: const Color(0xFFE74C3C),
      gradient: const LinearGradient(
        colors: [Color(0xFFE74C3C), Color(0xFFFF6B7A)],
      ),
    ),
    Coach(
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
    ),
    Coach(
      id: '3',
      name: 'Ryan Steady',
      personality: CoachPersonality.steadyPace,
      description: 'Methodical coach who focuses on consistent, sustainable progress',
      avatar: '⚖️',
      motivationStyle: 'Consistency is key to success',
      catchphrase: "Steady progress, lasting results!",
      color: const Color(0xFF00B894),
      gradient: const LinearGradient(
        colors: [Color(0xFF00B894), Color(0xFF55EFC4)],
      ),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    
    _slideAnimations = List.generate(
      _coaches.length,
      (index) => Tween<Offset>(
        begin: Offset(0, 1 + (index * 0.1)),
        end: Offset.zero,
      ).animate(
        CurvedAnimation(
          parent: _animationController,
          curve: Interval(
            index * 0.2,
            0.6 + (index * 0.2),
            curve: Curves.easeOutBack,
          ),
        ),
      ),
    );
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _selectCoach(Coach coach) {
    setState(() {
      _selectedCoach = coach;
    });
  }

  void _continueToApp() {
    if (_selectedCoach != null) {
      // Save selected coach to state management
      context.go('/main');
    }
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    IconButton(
                      onPressed: () => context.go('/onboarding'),
                      icon: const Icon(
                        Icons.arrow_back,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Choose Your',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    ShaderMask(
                      shaderCallback: (bounds) => AppTheme.primaryGradient
                          .createShader(bounds),
                      child: const Text(
                        'AI Coach',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Select the coaching style that motivates you best',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Coach cards
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _coaches.length,
                  itemBuilder: (context, index) {
                    final coach = _coaches[index];
                    return SlideTransition(
                      position: _slideAnimations[index],
                      child: _buildCoachCard(coach, index),
                    );
                  },
                ),
              ),
              
              // Continue button
              if (_selectedCoach != null)
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: SizedBox(
                    width: double.infinity,
                    child: GlassButton(
                      text: 'Start Training with ${_selectedCoach!.name}',
                      isPrimary: true,
                      onPressed: _continueToApp,
                      padding: const EdgeInsets.symmetric(vertical: 18),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCoachCard(Coach coach, int index) {
    final isSelected = _selectedCoach?.id == coach.id;
    
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: 16),
      transform: Matrix4.identity()
        ..scale(isSelected ? 1.02 : 1.0),
      child: GlassCard(
        onTap: () => _selectCoach(coach),
        showShadow: isSelected,
        borderColor: isSelected 
            ? coach.color.withOpacity(0.5)
            : null,
        child: Column(
          children: [
            Row(
              children: [
                // Avatar with gradient background
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: coach.gradient,
                    boxShadow: isSelected ? [
                      BoxShadow(
                        color: coach.color.withOpacity(0.3),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      ),
                    ] : null,
                  ),
                  child: Center(
                    child: Text(
                      coach.avatar,
                      style: const TextStyle(fontSize: 24),
                    ),
                  ),
                ),
                
                const SizedBox(width: 16),
                
                // Coach info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            coach.name,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: coach.color.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: coach.color.withOpacity(0.3),
                              ),
                            ),
                            child: Text(
                              coach.personality.name.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: coach.color,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        coach.description,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Selection indicator
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected 
                          ? coach.color 
                          : Colors.white.withOpacity(0.3),
                      width: 2,
                    ),
                    color: isSelected 
                        ? coach.color 
                        : Colors.transparent,
                  ),
                  child: isSelected
                      ? const Icon(
                          Icons.check,
                          color: Colors.white,
                          size: 16,
                        )
                      : null,
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Motivation style
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: coach.color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: coach.color.withOpacity(0.2),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Coaching Style',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: coach.color,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '"${coach.catchphrase}"',
                    style: const TextStyle(
                      fontSize: 14,
                      fontStyle: FontStyle.italic,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}