import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../../models/workout.dart';

class WorkoutsScreen extends ConsumerStatefulWidget {
  const WorkoutsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<WorkoutsScreen> createState() => _WorkoutsScreenState();
}

class _WorkoutsScreenState extends ConsumerState<WorkoutsScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late List<Animation<Offset>> _slideAnimations;
  late Animation<double> _fadeAnimation;

  final List<WorkoutPlan> _workouts = [
    WorkoutPlan(
      id: '1',
      name: 'The Floor is Lava 🔥',
      description: 'Jump Rope + Core',
      duration: '43:29',
      calories: '409 Cal',
      difficulty: WorkoutDifficulty.hard,
      type: WorkoutType.cardio,
      imagePath: 'assets/images/floor_lava.jpg',
      isCompleted: true,
      scheduledFor: DateTime.now().subtract(const Duration(days: 1)),
      exercises: [],
    ),
    WorkoutPlan(
      id: '2',
      name: 'Two Days Until Hawaii 🏝️',
      description: 'ARM DAY SUPER SETS',
      duration: '47 MIN',
      calories: '',
      difficulty: WorkoutDifficulty.medium,
      type: WorkoutType.strength,
      imagePath: 'assets/images/hawaii_workout.jpg',
      isCompleted: false,
      scheduledFor: DateTime.now(),
      exercises: [],
      subtitle: "TODAY'S WORKOUT",
    ),
    WorkoutPlan(
      id: '3',
      name: 'Travel Day ✈️',
      description: 'Recovery',
      duration: '',
      calories: '',
      difficulty: WorkoutDifficulty.easy,
      type: WorkoutType.recovery,
      imagePath: '',
      isCompleted: false,
      scheduledFor: DateTime.now().add(const Duration(days: 1)),
      exercises: [],
    ),
    WorkoutPlan(
      id: '4',
      name: "Sky's Out, Thighs Out",
      description: 'Beach Run',
      duration: '',
      calories: '',
      difficulty: WorkoutDifficulty.medium,
      type: WorkoutType.cardio,
      imagePath: '',
      isCompleted: false,
      scheduledFor: DateTime.now().add(const Duration(days: 2)),
      exercises: [],
      hasIssue: true,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.3, curve: Curves.easeOut),
      ),
    );
    
    _slideAnimations = List.generate(
      _workouts.length + 1, // +1 for header
      (index) => Tween<Offset>(
        begin: const Offset(0, 0.5),
        end: Offset.zero,
      ).animate(
        CurvedAnimation(
          parent: _animationController,
          curve: Interval(
            0.1 + (index * 0.1),
            0.4 + (index * 0.1),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              // Header
              SliverToBoxAdapter(
                child: SlideTransition(
                  position: _slideAnimations[0],
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: _buildHeader(),
                  ),
                ),
              ),
              
              // Workout list
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final workout = _workouts[index];
                    return SlideTransition(
                      position: _slideAnimations[index + 1],
                      child: _buildWorkoutCard(workout, index),
                    );
                  },
                  childCount: _workouts.length,
                ),
              ),
              
              // Bottom padding for FAB
              const SliverToBoxAdapter(
                child: SizedBox(height: 100),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'WORKOUTS',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.white,
              letterSpacing: 1.2,
            ),
          ),
          GestureDetector(
            onTap: () {
              // Navigate to add workout
            },
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: Colors.white.withOpacity(0.2),
                ),
              ),
              child: const Icon(
                Icons.add,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWorkoutCard(WorkoutPlan workout, int index) {
    final isToday = _isToday(workout.scheduledFor);
    final dayLabel = _getDayLabel(workout.scheduledFor);
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Day label
          if (index == 0 || !_isSameDay(_workouts[index - 1].scheduledFor, workout.scheduledFor))
            Padding(
              padding: const EdgeInsets.only(bottom: 12, left: 4),
              child: Text(
                dayLabel,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withOpacity(0.8),
                ),
              ),
            ),
          
          // Workout card
          GlassCard(
            onTap: () {
              if (isToday && !workout.isCompleted) {
                // Navigate to workout details or start workout
                _startWorkout(workout);
              }
            },
            child: _buildWorkoutContent(workout, isToday),
          ),
        ],
      ),
    );
  }

  Widget _buildWorkoutContent(WorkoutPlan workout, bool isToday) {
    if (isToday && !workout.isCompleted) {
      // Today's featured workout
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (workout.subtitle != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                workout.subtitle!,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.primaryColor,
                ),
              ),
            ),
          
          const SizedBox(height: 12),
          
          // Main workout image area
          Container(
            height: 200,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.3),
                  Colors.black.withOpacity(0.7),
                ],
              ),
              image: workout.imagePath.isNotEmpty ? DecorationImage(
                image: AssetImage(workout.imagePath),
                fit: BoxFit.cover,
              ) : null,
            ),
            child: Stack(
              children: [
                if (workout.imagePath.isEmpty)
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      gradient: LinearGradient(
                        colors: [
                          AppTheme.primaryColor.withOpacity(0.3),
                          AppTheme.primaryColor.withOpacity(0.1),
                        ],
                      ),
                    ),
                  ),
                
                Positioned(
                  bottom: 16,
                  left: 16,
                  right: 16,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        workout.name,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        workout.description,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white.withOpacity(0.9),
                        ),
                      ),
                      const SizedBox(height: 8),
                      if (workout.duration.isNotEmpty)
                        Text(
                          workout.duration,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.8),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Action button
          SizedBox(
            width: double.infinity,
            child: GlassButton(
              text: 'View Workout',
              isPrimary: true,
              onPressed: () => _startWorkout(workout),
            ),
          ),
        ],
      );
    } else {
      // Regular workout item
      return Row(
        children: [
          // Status indicator
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: workout.isCompleted 
                  ? const Color(0xFF30D158)
                  : workout.hasIssue
                      ? const Color(0xFFFF375F)
                      : Colors.white.withOpacity(0.3),
            ),
            child: Icon(
              workout.isCompleted 
                  ? Icons.check
                  : workout.hasIssue
                      ? Icons.error
                      : Icons.circle,
              color: Colors.white,
              size: workout.isCompleted || workout.hasIssue ? 16 : 8,
            ),
          ),
          
          const SizedBox(width: 16),
          
          // Workout info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  workout.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      workout.description,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                    if (workout.duration.isNotEmpty) ...[
                      Text(
                        ' • ',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.5),
                        ),
                      ),
                      Text(
                        workout.duration,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                    ],
                    if (workout.calories.isNotEmpty) ...[
                      Text(
                        ' • ',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.5),
                        ),
                      ),
                      Text(
                        workout.calories,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          
          // Difficulty indicator
          if (workout.hasIssue)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFF375F).withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: const Color(0xFFFF375F).withOpacity(0.3),
                ),
              ),
              child: const Text(
                '2',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFFF375F),
                ),
              ),
            ),
        ],
      );
    }
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && 
           date.month == now.month && 
           date.day == now.day;
  }

  bool _isSameDay(DateTime date1, DateTime date2) {
    return date1.year == date2.year && 
           date1.month == date2.month && 
           date1.day == date2.day;
  }

  String _getDayLabel(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now).inDays;
    
    if (difference == 0) return 'Mon\n5';
    if (difference == 1) return 'Wed';
    if (difference == 2) return 'Thu\n8';
    
    // Format other days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[date.weekday - 1];
  }

  void _startWorkout(WorkoutPlan workout) {
    // Navigate to workout detail or active workout screen
    print('Starting workout: ${workout.name}');
  }
}