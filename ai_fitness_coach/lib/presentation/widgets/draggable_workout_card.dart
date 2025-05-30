import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';
import 'dart:math' as math;
import '../../models/workout.dart';
import '../../services/workout_scheduling_service.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/theme_provider.dart';

class DraggableWorkoutCard extends ConsumerStatefulWidget {
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
  ConsumerState<DraggableWorkoutCard> createState() => _DraggableWorkoutCardState();
}

class _DraggableWorkoutCardState extends ConsumerState<DraggableWorkoutCard>
    with TickerProviderStateMixin {
  late AnimationController _hoverController;
  late AnimationController _pulseController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _elevationAnimation;
  late Animation<Color?> _glowAnimation;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    
    _hoverController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _hoverController,
      curve: Curves.easeInOut,
    ));
    
    _elevationAnimation = Tween<double>(
      begin: 0.0,
      end: 10.0,
    ).animate(CurvedAnimation(
      parent: _hoverController,
      curve: Curves.easeInOut,
    ));
    
    _glowAnimation = ColorTween(
      begin: Colors.transparent,
      end: widget.workout.difficulty.color.withOpacity(0.3),
    ).animate(CurvedAnimation(
      parent: _hoverController,
      curve: Curves.easeInOut,
    ));
    
    // Start pulse animation for incomplete workouts
    // Note: ScheduledWorkout doesn't have isCompleted, so we'll pulse all workouts
    _pulseController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _hoverController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(themeProvider);
    final theme = Theme.of(context);
    return AnimatedBuilder(
      animation: Listenable.merge([_hoverController, _pulseController]),
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: LongPressDraggable<ScheduledWorkout>(
            data: widget.workout,
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
            child: _buildEnhancedWorkoutCard(settings, theme),
          ),
        );
      },
    );
  }

  Widget _buildEnhancedWorkoutCard(AppSettings settings, ThemeData theme) {
    final pulseValue = _pulseController.value * 0.2;
    
    return MouseRegion(
      onEnter: (_) {
        setState(() => _isHovered = true);
        _hoverController.forward();
      },
      onExit: (_) {
        setState(() => _isHovered = false);
        _hoverController.reverse();
      },
      child: GestureDetector(
        onTap: () {
          HapticFeedback.lightImpact();
          widget.onTap?.call();
        },
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: _glowAnimation.value ?? Colors.transparent,
                blurRadius: 20 + (_elevationAnimation.value * 2),
                spreadRadius: 3 + pulseValue * 10,
                offset: Offset(0, _elevationAnimation.value / 2),
              ),
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10 + _elevationAnimation.value,
                offset: Offset(0, 5 + _elevationAnimation.value),
              ),
            ],
          ),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: _getGradientColors(settings),
                stops: [
                  0.0,
                  0.3 + pulseValue,
                  1.0,
                ],
              ),
              border: Border.all(
                color: widget.workout.difficulty.color.withOpacity(
                  0.3 + pulseValue * 0.5
                ),
                width: 1.5 + pulseValue * 2,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(
                      settings.darkMode ? 0.05 + pulseValue * 0.1 : 0.15 + pulseValue * 0.1
                    ),
                  ),
                  child: _buildCardContent(settings, theme),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  List<Color> _getGradientColors(AppSettings settings) {
    final difficulty = widget.workout.difficulty;
    final baseColor = difficulty.color;
    
    return [
      baseColor.withOpacity(0.4),
      baseColor.withOpacity(0.2),
      Colors.transparent,
    ];
  }

  Widget _buildCardContent(AppSettings settings, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header with animated indicators
        Row(
          children: [
            // Animated difficulty indicator
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: widget.workout.difficulty.color.withOpacity(
                  _isHovered ? 0.8 : 0.6
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: _isHovered ? [
                  BoxShadow(
                    color: widget.workout.difficulty.color.withOpacity(0.4),
                    blurRadius: 8,
                    spreadRadius: 2,
                  ),
                ] : [],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    widget.workout.type.icon,
                    size: 12,
                    color: Colors.white,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    widget.workout.difficulty.name,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            // Completion status with animation - ScheduledWorkout doesn't have completion status
            // So we'll skip this for now
          ],
        ),
        const SizedBox(height: 12),
        
        // Workout title with shimmer effect
        AnimatedDefaultTextStyle(
          duration: const Duration(milliseconds: 200),
          style: TextStyle(
            fontSize: _isHovered ? 18 : 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
          child: Text(
            widget.workout.workoutName,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        
        const SizedBox(height: 8),
        
        // Workout details with enhanced styling
        Row(
          children: [
            _buildInfoChip(
              icon: Icons.timer,
              label: widget.workout.duration,
              color: Colors.blue,
            ),
            const SizedBox(width: 8),
            _buildInfoChip(
              icon: Icons.local_fire_department,
              label: '${widget.workout.exercises.length} exercises',
              color: Colors.orange,
            ),
          ],
        ),
        
        if (widget.workout.originalDate != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: Colors.amber.withOpacity(0.4),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.swap_horiz,
                  size: 12,
                  color: Colors.amber.shade700,
                ),
                const SizedBox(width: 4),
                Text(
                  'MOVED',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.amber.shade700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildInfoChip({
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: color.withOpacity(0.4),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 12,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWorkoutCard(AppSettings settings, ThemeData theme) {
    return GestureDetector(
      onTap: widget.onTap,
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
                  color: widget.workout.isUserModified 
                      ? Colors.orange.withOpacity(0.5)
                      : Colors.white.withOpacity(0.2),
                  width: widget.workout.isUserModified ? 2 : 1,
                ),
              ),
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        widget.workout.type.icon,
                        color: widget.workout.difficulty.color,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          widget.workout.workoutName,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: settings.darkMode ? Colors.white : theme.colorScheme.onSurface,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (widget.workout.isUserModified)
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
                        widget.workout.duration,
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
                        '${widget.workout.exercises.length} exercises',
                        style: TextStyle(
                          fontSize: 12,
                          color: settings.darkMode 
                            ? Colors.white.withOpacity(0.7)
                            : theme.colorScheme.onSurface.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                  if (widget.workout.originalDate != null) ...[
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
                          'Originally ${_formatDate(widget.workout.originalDate!)}',
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
              widget.workout.type.icon,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                widget.workout.workoutName,
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
                    widget.workout.type.icon,
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