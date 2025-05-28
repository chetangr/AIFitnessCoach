import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';
import '../../models/workout.dart';
import '../../services/workout_scheduling_service.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/theme_provider.dart';

class DraggableWorkoutCard extends ConsumerWidget {
  final ScheduledWorkout workout;
  final VoidCallback? onTap;
  final Function(String workoutId, DateTime newDate)? onMoved;

  const DraggableWorkoutCard({
    Key? key,
    required this.workout,
    this.onTap,
    this.onMoved,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(themeProvider);
    final theme = Theme.of(context);
    return LongPressDraggable<ScheduledWorkout>(
      data: workout,
      dragAnchorStrategy: pointerDragAnchorStrategy,
      feedback: _buildDragFeedback(settings, theme),
      childWhenDragging: _buildDragPlaceholder(settings, theme),
      onDragStarted: () {
        HapticFeedback.mediumImpact();
      },
      onDragEnd: (details) {
        // Handle drag completion feedback
        if (details.wasAccepted) {
          HapticFeedback.heavyImpact();
        } else {
          HapticFeedback.lightImpact();
        }
      },
      child: _buildWorkoutCard(settings, theme),
    );
  }

  Widget _buildWorkoutCard(AppSettings settings, ThemeData theme) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white.withOpacity(0.1),
                    Colors.white.withOpacity(0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: workout.isUserModified 
                      ? Colors.orange.withOpacity(0.5)
                      : Colors.white.withOpacity(0.2),
                  width: workout.isUserModified ? 2 : 1,
                ),
              ),
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        workout.type.icon,
                        color: workout.difficulty.color,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          workout.workoutName,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: settings.darkMode ? Colors.white : theme.colorScheme.onSurface,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (workout.isUserModified)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.orange.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.orange.withOpacity(0.5),
                            ),
                          ),
                          child: Text(
                            'MOVED',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.orange.shade300,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.timer,
                        size: 14,
                        color: settings.darkMode 
                          ? Colors.white.withOpacity(0.7)
                          : theme.colorScheme.onSurface.withOpacity(0.7),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        workout.duration,
                        style: TextStyle(
                          fontSize: 12,
                          color: settings.darkMode 
                            ? Colors.white.withOpacity(0.7)
                            : theme.colorScheme.onSurface.withOpacity(0.7),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(
                        Icons.fitness_center,
                        size: 14,
                        color: settings.darkMode 
                          ? Colors.white.withOpacity(0.7)
                          : theme.colorScheme.onSurface.withOpacity(0.7),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${workout.exercises.length} exercises',
                        style: TextStyle(
                          fontSize: 12,
                          color: settings.darkMode 
                            ? Colors.white.withOpacity(0.7)
                            : theme.colorScheme.onSurface.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                  if (workout.originalDate != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.swap_horiz,
                          size: 12,
                          color: Colors.orange.withOpacity(0.8),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Originally ${_formatDate(workout.originalDate!)}',
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.orange.withOpacity(0.8),
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDragFeedback(AppSettings settings, ThemeData theme) {
    return Material(
      color: Colors.transparent,
      child: Container(
        width: 280,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.primaryColor.withOpacity(0.9),
              AppTheme.secondaryColor.withOpacity(0.9),
            ],
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              workout.type.icon,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                workout.workoutName,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const Icon(
              Icons.drag_indicator,
              color: Colors.white,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDragPlaceholder(AppSettings settings, ThemeData theme) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white.withOpacity(0.03),
                Colors.white.withOpacity(0.01),
              ],
            ),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.white.withOpacity(0.1),
              width: 1,
            ),
          ),
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    workout.type.icon,
                    color: Colors.white.withOpacity(0.3),
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      height: 16,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Container(
                height: 12,
                width: 150,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][date.weekday - 1];
    return '$weekday ${date.day}';
  }
}

class WorkoutDropTarget extends ConsumerWidget {
  final DateTime targetDate;
  final String dayName;
  final Widget child;
  final Function(ScheduledWorkout workout, DateTime targetDate)? onWorkoutDropped;

  const WorkoutDropTarget({
    Key? key,
    required this.targetDate,
    required this.dayName,
    required this.child,
    this.onWorkoutDropped,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DragTarget<ScheduledWorkout>(
      onWillAccept: (data) => data != null,
      onAccept: (workout) {
        if (onWorkoutDropped != null) {
          onWorkoutDropped!(workout, targetDate);
        }
      },
      builder: (context, candidateData, rejectedData) {
        final isHovering = candidateData.isNotEmpty;
        
        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: isHovering
                ? Border.all(
                    color: AppTheme.primaryColor.withOpacity(0.8),
                    width: 2,
                  )
                : null,
            color: isHovering
                ? AppTheme.primaryColor.withOpacity(0.1)
                : null,
          ),
          child: Stack(
            children: [
              child,
              if (isHovering)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      border: Border.all(
                        color: AppTheme.primaryColor.withOpacity(0.5),
                        width: 2,
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.add_circle,
                            color: AppTheme.primaryColor,
                            size: 32,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Drop workout here',
                            style: TextStyle(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            'Move to $dayName',
                            style: TextStyle(
                              color: AppTheme.primaryColor.withOpacity(0.8),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}