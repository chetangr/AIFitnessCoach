import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'dart:math' as math;
import '../../models/workout.dart';
import '../../services/auth_service.dart';

class WorkoutOfTheDayCard extends ConsumerStatefulWidget {
  final WorkoutPlan workout;
  final VoidCallback onTap;

  const WorkoutOfTheDayCard({
    super.key,
    required this.workout,
    required this.onTap,
  });

  @override
  ConsumerState<WorkoutOfTheDayCard> createState() => _WorkoutOfTheDayCardState();
}

class _WorkoutOfTheDayCardState extends ConsumerState<WorkoutOfTheDayCard>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _shimmerController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _shimmerAnimation;

  @override
  void initState() {
    super.initState();
    
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    
    _shimmerController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
    
    _shimmerAnimation = Tween<double>(
      begin: -2.0,
      end: 2.0,
    ).animate(CurvedAnimation(
      parent: _shimmerController,
      curve: Curves.easeInOut,
    ));
    
    _pulseController.repeat(reverse: true);
    _shimmerController.repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _shimmerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authService = AuthService();
    
    return FutureBuilder(
      future: authService.getCurrentUser(),
      builder: (context, snapshot) {
        final user = snapshot.data;
        final firstName = user?.firstName ?? 'there';
        
        return AnimatedBuilder(
          animation: Listenable.merge([_pulseController, _shimmerController]),
          builder: (context, child) {
            return Transform.scale(
              scale: _pulseAnimation.value,
              child: GestureDetector(
                onTap: () {
                  HapticFeedback.mediumImpact();
                  widget.onTap();
                },
                child: Container(
                  height: 300,
                  margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        const Color(0xFF6B46C1),
                        const Color(0xFF9333EA),
                        const Color(0xFF7C3AED),
                        Color.lerp(const Color(0xFF7C3AED), const Color(0xFF6B46C1), 
                          (_shimmerAnimation.value + 2) / 4) ?? const Color(0xFF7C3AED),
                      ],
                      stops: [0.0, 0.3, 0.7, 1.0],
                    ),
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6B46C1).withOpacity(0.4 + _pulseAnimation.value * 0.1),
                        blurRadius: 25 + _pulseAnimation.value * 5,
                        offset: const Offset(0, 12),
                        spreadRadius: 2,
                      ),
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      // Animated background patterns
                      Positioned(
                        right: -50 + math.sin(_shimmerController.value * 2 * math.pi) * 10,
                        top: -50 + math.cos(_shimmerController.value * 2 * math.pi) * 5,
                        child: Container(
                          width: 200,
                          height: 200,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.15 + _pulseAnimation.value * 0.05),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.white.withOpacity(0.1),
                                blurRadius: 20,
                                spreadRadius: 5,
                              ),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        left: -30 + math.cos(_shimmerController.value * 1.5 * math.pi) * 8,
                        bottom: -30 + math.sin(_shimmerController.value * 1.5 * math.pi) * 6,
                        child: Container(
                          width: 150,
                          height: 150,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.08 + _pulseAnimation.value * 0.03),
                          ),
                        ),
                      ),
                      
                      // Shimmer overlay
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(28),
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Colors.transparent,
                                Colors.white.withOpacity(0.1),
                                Colors.transparent,
                              ],
                              stops: [
                                (_shimmerAnimation.value + 2) / 4 - 0.1,
                                (_shimmerAnimation.value + 2) / 4,
                                (_shimmerAnimation.value + 2) / 4 + 0.1,
                              ],
                            ),
                          ),
                        ),
                      ),
                
                // Content
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Greeting
                      Text(
                        'Get ready, $firstName',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      
                      // Motivational text
                      const Text(
                        "Let's smash today's workout!",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Tags
                      Row(
                        children: [
                          _buildTag('Special for $firstName'),
                          const SizedBox(width: 8),
                          _buildTag(_getEquipmentTag()),
                        ],
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Workout info
                      Row(
                        children: [
                          // Duration
                          Row(
                            children: [
                              const Icon(
                                Icons.timer_outlined,
                                color: Colors.white,
                                size: 20,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${widget.workout.duration} min',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 24),
                          
                          // Muscle groups
                          Expanded(
                            child: Text(
                              _getMuscleGroups(widget.workout).join(', '),
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 16,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Exercise preview
                      Container(
                        height: 60,
                        child: Row(
                          children: [
                            ..._buildExercisePreviews(),
                            if (widget.workout.exercises.length > 4)
                              Container(
                                width: 50,
                                height: 50,
                                margin: const EdgeInsets.only(left: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        '+${widget.workout.exercises.length - 4}',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const Icon(
                                        Icons.arrow_forward,
                                        color: Colors.white,
                                        size: 16,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Play button overlay
                Positioned(
                  bottom: 20,
                  right: 20,
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.play_arrow,
                      color: Color(0xFF6B46C1),
                      size: 32,
                    ),
                  ),
                ),
              ],
            ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildTag(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  List<String> _getMuscleGroups(WorkoutPlan workout) {
    final Set<String> muscleGroups = {};
    for (final exercise in workout.exercises) {
      muscleGroups.addAll(exercise.muscleGroups);
    }
    return muscleGroups.take(3).toList(); // Limit to 3 main muscle groups
  }

  String _getEquipmentTag() {
    // Determine equipment based on exercises
    if (widget.workout.exercises.any((e) => e.equipment.any((eq) => eq.toLowerCase().contains('dumbbell')))) {
      return 'Dumbbells';
    } else if (widget.workout.exercises.any((e) => e.equipment.any((eq) => eq.toLowerCase().contains('barbell')))) {
      return 'Gym';
    } else if (widget.workout.exercises.every((e) => e.equipment.every((eq) => eq.toLowerCase() == 'bodyweight' || eq.toLowerCase() == 'none'))) {
      return 'Bodyweight';
    } else {
      return 'Gym';
    }
  }

  List<Widget> _buildExercisePreviews() {
    final previewCount = widget.workout.exercises.length > 4 ? 4 : widget.workout.exercises.length;
    
    return List.generate(previewCount, (index) {
      final exercise = widget.workout.exercises[index];
      return Container(
        width: 50,
        height: 50,
        margin: const EdgeInsets.only(right: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12),
          image: DecorationImage(
            image: AssetImage(_getExerciseImage(exercise.name)),
            fit: BoxFit.cover,
            onError: (exception, stackTrace) {
              // Fallback to icon if image not found
            },
          ),
        ),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.3),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Icon(
              _getExerciseIcon(exercise.name),
              color: Colors.white,
              size: 24,
            ),
          ),
        ),
      );
    });
  }

  String _getExerciseImage(String exerciseName) {
    // Map exercise names to asset images
    // This is a placeholder - you would have actual images
    return 'assets/images/exercises/placeholder.png';
  }

  IconData _getExerciseIcon(String exerciseName) {
    final name = exerciseName.toLowerCase();
    if (name.contains('push') || name.contains('press')) {
      return Icons.fitness_center;
    } else if (name.contains('squat') || name.contains('lunge')) {
      return Icons.airline_seat_legroom_reduced;
    } else if (name.contains('plank') || name.contains('core')) {
      return Icons.self_improvement;
    } else if (name.contains('curl') || name.contains('bicep')) {
      return Icons.fitness_center;
    } else if (name.contains('run') || name.contains('cardio')) {
      return Icons.directions_run;
    }
    return Icons.fitness_center;
  }
}