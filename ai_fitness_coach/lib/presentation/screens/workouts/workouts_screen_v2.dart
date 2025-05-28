import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/glass_widgets.dart';
import '../../../models/workout.dart';
import '../workout_player/workout_player_screen.dart';
import '../../../providers/workout_provider.dart';
import '../../../services/workout_tracking_service.dart';
import '../../../services/workout_scheduling_service.dart';
import '../../../providers/user_preferences_provider.dart';
import '../../../providers/theme_provider.dart';
import '../../widgets/draggable_workout_card.dart';
import 'package:go_router/go_router.dart';

class WorkoutsScreenV2 extends ConsumerStatefulWidget {
  const WorkoutsScreenV2({Key? key}) : super(key: key);

  @override
  ConsumerState<WorkoutsScreenV2> createState() => _WorkoutsScreenV2State();
}

class _WorkoutsScreenV2State extends ConsumerState<WorkoutsScreenV2> {
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
      body: Container(
        decoration: BoxDecoration(
          gradient: settings.darkMode 
            ? const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF0A0F1C),
                  Color(0xFF1A1F2E),
                  Color(0xFF0A0F1C),
                ],
              )
            : LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.blue.shade50,
                  Colors.indigo.shade50,
                  Colors.purple.shade50,
                ],
              ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              Expanded(
                child: _buildWeeklySchedule(weeklySchedule),
              ),
            ],
          ),
        ),
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

  Widget _buildHeader() {
    final settings = ref.watch(themeProvider);
    final theme = Theme.of(context);
    
    return Container(
      margin: const EdgeInsets.all(20),
      child: GlassMorphicCard(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        blur: 20,
        borderRadius: BorderRadius.circular(20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Your Weekly Schedule',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: settings.darkMode ? Colors.white : theme.colorScheme.onSurface,
              ),
            ),
          ],
        ),
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
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        image: DecorationImage(
          image: AssetImage(workout.imagePath.isNotEmpty 
              ? workout.imagePath 
              : 'assets/images/default_workout.jpg'),
          fit: BoxFit.cover,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.transparent,
              Colors.black.withOpacity(0.7),
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'TODAY',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 40),
            Padding(
              padding: const EdgeInsets.all(20),
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
                  const SizedBox(height: 8),
                  Text(
                    workout.description,
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      if (workout.metadata?['trainer'] != null) ...[
                        CircleAvatar(
                          radius: 16,
                          backgroundImage: AssetImage(
                            'assets/images/trainer_${workout.metadata!['trainer'].toString().toLowerCase().replaceAll(' ', '_')}.jpg',
                          ),
                          backgroundColor: Colors.grey,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          workout.metadata!['trainer'],
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(width: 16),
                      ],
                      Icon(
                        Icons.timer,
                        size: 16,
                        color: Colors.white.withOpacity(0.8),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        workout.duration,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 14,
                        ),
                      ),
                      if (workout.metadata?['equipment'] != null) ...[
                        const SizedBox(width: 16),
                        Icon(
                          Icons.fitness_center,
                          size: 16,
                          color: Colors.white.withOpacity(0.8),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          workout.metadata!['equipment'],
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: GlassMorphicButton(
                      text: 'View Workout',
                      onPressed: () {
                        _showWorkoutDetails(context, workout);
                      },
                      isPrimary: true,
                      icon: Icons.arrow_forward,
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
                      child: Column(
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
                    ),
                    const SizedBox(height: 20),
                    
                    // Exercises List
                    const Text(
                      'Exercises',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
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
                          onPressed: () {
                            // Add to schedule or edit
                          },
                          icon: Icons.edit,
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