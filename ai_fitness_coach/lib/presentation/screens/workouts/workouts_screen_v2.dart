import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';
import 'dart:math' as math;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/glass_widgets.dart';
import '../../../models/workout.dart';
import '../workout_player/workout_player_screen.dart';
import '../../../providers/workout_provider.dart';
import '../../../services/workout_tracking_service.dart';
import '../../../services/workout_scheduling_service.dart';
import '../../../services/auth_service.dart';
import '../../../services/database_service.dart';
import '../../../providers/user_preferences_provider.dart';
import '../../../providers/theme_provider.dart';
import '../../widgets/draggable_workout_card.dart';
import '../../widgets/workout_of_the_day_card.dart';
import 'package:go_router/go_router.dart';

class WorkoutsScreenV2 extends ConsumerStatefulWidget {
  const WorkoutsScreenV2({Key? key}) : super(key: key);

  @override
  ConsumerState<WorkoutsScreenV2> createState() => _WorkoutsScreenV2State();
}

class _WorkoutsScreenV2State extends ConsumerState<WorkoutsScreenV2>
    with TickerProviderStateMixin {
  late AnimationController _backgroundController;
  late AnimationController _headerController;
  late Animation<double> _headerSlideAnimation;
  late Animation<double> _headerFadeAnimation;

  @override
  void initState() {
    super.initState();
    
    _backgroundController = AnimationController(
      duration: const Duration(seconds: 8),
      vsync: this,
    );
    
    _headerController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    
    _headerSlideAnimation = Tween<double>(
      begin: -100.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _headerController,
      curve: Curves.elasticOut,
    ));
    
    _headerFadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _headerController,
      curve: Curves.easeOut,
    ));
    
    _backgroundController.repeat();
    _headerController.forward();
  }

  @override
  void dispose() {
    _backgroundController.dispose();
    _headerController.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    final workouts = ref.watch(workoutProvider);
    final settings = ref.watch(themeProvider);
    final theme = Theme.of(context);
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    
    // Create weekly schedule
    final weeklySchedule = List.generate(7, (index) {
      final date = startOfWeek.add(Duration(days: index));
      final dayWorkouts = workouts.where((w) => 
        w.scheduledFor.year == date.year &&
        w.scheduledFor.month == date.month &&
        w.scheduledFor.day == date.day
      ).toList();
      
      return {
        'day': _getDayName(date.weekday),
        'date': date.day,
        'dateTime': date,
        'workouts': dayWorkouts,
        'isToday': date.year == now.year && 
                   date.month == now.month && 
                   date.day == now.day,
      };
    });

    return Scaffold(
      extendBody: true,
      backgroundColor: theme.scaffoldBackgroundColor,
      body: AnimatedBuilder(
        animation: _backgroundController,
        builder: (context, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: settings.darkMode 
                ? LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      const Color(0xFF0A0F1C),
                      Color.lerp(const Color(0xFF1A1F2E), const Color(0xFF2A1F3E), 
                        math.sin(_backgroundController.value * 2 * math.pi) * 0.3 + 0.5) ?? const Color(0xFF1A1F2E),
                      const Color(0xFF0A0F1C),
                    ],
                    stops: [
                      0.0,
                      0.5 + math.sin(_backgroundController.value * 2 * math.pi) * 0.2,
                      1.0,
                    ],
                  )
                : LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.blue.shade50,
                      Color.lerp(Colors.indigo.shade50, Colors.purple.shade100, 
                        math.sin(_backgroundController.value * 2 * math.pi) * 0.3 + 0.5) ?? Colors.indigo.shade50,
                      Colors.purple.shade50,
                    ],
                    stops: [
                      0.0,
                      0.5 + math.sin(_backgroundController.value * 2 * math.pi) * 0.2,
                      1.0,
                    ],
                  ),
            ),
            child: Stack(
              children: [
                // Floating background elements
                ...List.generate(5, (index) {
                  final offset = (index * 0.3) % 1.0;
                  return Positioned(
                    left: (MediaQuery.of(context).size.width * 0.2 * index) % MediaQuery.of(context).size.width,
                    top: 50 + math.sin((_backgroundController.value + offset) * 2 * math.pi) * 30,
                    child: Container(
                      width: 80 + (index * 20),
                      height: 80 + (index * 20),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: settings.darkMode 
                          ? Colors.white.withOpacity(0.03)
                          : Colors.blue.withOpacity(0.05),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.white.withOpacity(0.05),
                            blurRadius: 20,
                            spreadRadius: 5,
                          ),
                        ],
                      ),
                    ),
                  );
                }),
                
                // Main content
                SafeArea(
                  child: Column(
                    children: [
                      _buildEnhancedHeader(),
                      Expanded(
                        child: _buildWeeklySchedule(weeklySchedule),
                      ),
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

  String _getDayName(int weekday) {
    switch (weekday) {
      case 1: return 'Mon';
      case 2: return 'Tue';
      case 3: return 'Wed';
      case 4: return 'Thu';
      case 5: return 'Fri';
      case 6: return 'Sat';
      case 7: return 'Sun';
      default: return '';
    }
  }

  Widget _buildEnhancedHeader() {
    return AnimatedBuilder(
      animation: _headerController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _headerSlideAnimation.value),
          child: FadeTransition(
            opacity: _headerFadeAnimation,
            child: _buildHeader(),
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    final settings = ref.watch(themeProvider);
    final theme = Theme.of(context);
    final authService = AuthService();
    
    return Container(
      margin: const EdgeInsets.all(20),
      child: FutureBuilder(
        future: authService.getCurrentUser(),
        builder: (context, snapshot) {
          final user = snapshot.data;
          final streak = user?.currentStreak ?? 0;
          
          return Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Your Weekly Schedule',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: settings.darkMode ? Colors.white : theme.colorScheme.onSurface,
                ),
              ),
              if (streak > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.orange.shade400,
                        Colors.orange.shade600,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.orange.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.local_fire_department,
                        color: Colors.white,
                        size: 20,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '$streak',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Day${streak > 1 ? 's' : ''}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildWeeklySchedule(List<Map<String, dynamic>> weeklySchedule) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: weeklySchedule.length,
      itemBuilder: (context, index) {
        final dayData = weeklySchedule[index];
        final workouts = dayData['workouts'] as List<WorkoutPlan>;
        final isToday = dayData['isToday'] as bool;
        final dateTime = dayData['dateTime'] as DateTime;
        final dayName = dayData['day'] as String;

        if (isToday && workouts.isNotEmpty) {
          return _buildTodayWorkout(workouts.first);
        }

        return _buildDragDropDayItem(dayData);
      },
    );
  }

  Widget _buildTodayWorkout(WorkoutPlan workout) {
    return WorkoutOfTheDayCard(
      workout: workout,
      onTap: () => _showWorkoutDetails(context, workout),
    );
  }

  Widget _buildDragDropDayItem(Map<String, dynamic> dayData) {
    final day = dayData['day'] as String;
    final date = dayData['date'] as int;
    final workouts = dayData['workouts'] as List<WorkoutPlan>;
    final isToday = dayData['isToday'] as bool;
    final dateTime = dayData['dateTime'] as DateTime;
    final settings = ref.watch(themeProvider);
    final theme = Theme.of(context);

    // Convert WorkoutPlan to ScheduledWorkout for drag/drop functionality
    final scheduledWorkouts = workouts.map((workout) => ScheduledWorkout(
      id: workout.id,
      workoutPlanId: workout.id,
      workoutName: workout.name,
      scheduledDate: workout.scheduledFor,
      type: workout.type,
      difficulty: workout.difficulty,
      duration: workout.duration,
      exercises: workout.exercises,
    )).toList();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: WorkoutDropTarget(
        targetDate: dateTime,
        dayName: day,
        onWorkoutDropped: (workout, targetDate) async {
          // Handle the workout drop by updating the WorkoutPlan's scheduledFor date
          final workoutNotifier = ref.read(workoutProvider.notifier);
          await workoutNotifier.moveWorkout(workout.workoutPlanId, targetDate);
        },
        child: GlassMorphicCard(
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            onTap: workouts.isNotEmpty ? () => _showWorkoutSelectionDialog(context, workouts, day) : null,
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    child: Column(
                      children: [
                        Text(
                          day.toUpperCase(),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: settings.darkMode 
                              ? Colors.white.withOpacity(0.6)
                              : theme.colorScheme.onSurface.withOpacity(0.6),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          date.toString(),
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: settings.darkMode 
                              ? Colors.white
                              : theme.colorScheme.onSurface,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: scheduledWorkouts.isEmpty
                        ? Text(
                            'Rest Day',
                            style: TextStyle(
                              fontSize: 16,
                              color: settings.darkMode 
                                ? Colors.white.withOpacity(0.4)
                                : theme.colorScheme.onSurface.withOpacity(0.4),
                            ),
                          )
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: scheduledWorkouts.map((workout) => 
                              DraggableWorkoutCard(
                                workout: workout,
                                onTap: () => _showWorkoutDetails(context, workout.toWorkoutPlan()),
                              )
                            ).toList(),
                          ),
                  ),
                  if (workouts.isNotEmpty)
                    Icon(
                      Icons.arrow_forward_ios,
                      size: 16,
                      color: settings.darkMode 
                        ? Colors.white.withOpacity(0.4)
                        : theme.colorScheme.onSurface.withOpacity(0.4),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showWorkoutSelectionDialog(BuildContext context, List<WorkoutPlan> workouts, String day) {
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
                Text(
                  '$day Workouts',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                ...workouts.map((workout) => GestureDetector(
                  onTap: () {
                    Navigator.of(context).pop();
                    context.push('/active-workout', extra: workout);
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
                        Icon(
                          workout.type.icon,
                          color: workout.difficulty.color,
                          size: 32,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                workout.name,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${workout.duration} • ${workout.exercises.length} exercises',
                                style: TextStyle(
                                  fontSize: 14,
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
                )).toList(),
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

  void _showWorkoutDetails(BuildContext context, WorkoutPlan workout) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.9,
        decoration: BoxDecoration(
          color: const Color(0xFF1A1F2E),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Workout Header
                    GlassMorphicCard(
                      padding: const EdgeInsets.all(20),
                      child: Stack(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    workout.type.icon,
                                    color: workout.difficulty.color,
                                    size: 32,
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
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
                                        color: Colors.white.withOpacity(0.8),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              _buildInfoChip(Icons.timer, workout.duration),
                              const SizedBox(width: 12),
                              _buildInfoChip(Icons.fitness_center, '${workout.exercises.length} exercises'),
                              const SizedBox(width: 12),
                              _buildInfoChip(Icons.local_fire_department, workout.calories ?? '0 cal'),
                            ],
                          ),
                            ],
                          ),
                          // Play button in top right
                          Positioned(
                            top: 0,
                            right: 0,
                            child: GestureDetector(
                              onTap: () {
                                Navigator.pop(context);
                                context.push('/active-workout', extra: workout);
                              },
                              child: Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: workout.difficulty.color,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: workout.difficulty.color.withOpacity(0.3),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: const Icon(
                                  Icons.play_arrow,
                                  color: Colors.white,
                                  size: 24,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    
                    // Exercises List
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Exercises',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            Navigator.pop(context);
                            // Navigate to exercise library with workout context
                            context.push('/exercises', extra: workout);
                          },
                          icon: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.1),
                              shape: BoxShape.circle,
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
                    const SizedBox(height: 16),
                    ...workout.exercises.map((exercise) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GlassMorphicCard(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [
                                    workout.difficulty.color.withOpacity(0.3),
                                    workout.difficulty.color.withOpacity(0.1),
                                  ],
                                ),
                              ),
                              child: Icon(
                                Icons.fitness_center,
                                color: workout.difficulty.color,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    exercise.name,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${exercise.metadata['sets'] ?? 3} sets • ${exercise.metadata['reps'] ?? 12} reps',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.white.withOpacity(0.7),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    )).toList(),
                    
                    const SizedBox(height: 20),
                    
                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: GlassMorphicButton(
                            text: 'Start Workout',
                            onPressed: () {
                              Navigator.pop(context);
                              context.push('/active-workout', extra: workout);
                            },
                            isPrimary: true,
                            icon: Icons.play_arrow,
                          ),
                        ),
                        const SizedBox(width: 12),
                        GlassMorphicButton(
                          text: '',
                          onPressed: () async {
                            final authService = AuthService();
                            final user = await authService.getCurrentUser();
                            if (user != null) {
                              final databaseService = DatabaseService();
                              await databaseService.saveWorkoutToUser(user.id, workout);
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Workout saved to your profile!'),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            }
                          },
                          icon: Icons.bookmark_outline,
                          width: 56,
                        ),
                      ],
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF007AFF).withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF007AFF).withOpacity(0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: const Color(0xFF007AFF),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF007AFF),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

}

extension WorkoutExtensions on WorkoutPlan {
  bool get isToday {
    final now = DateTime.now();
    return scheduledFor.year == now.year &&
           scheduledFor.month == now.month &&
           scheduledFor.day == now.day;
  }
}