import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/glass_widgets.dart';
import '../../widgets/workout/workout_header.dart';
import '../../widgets/workout/exercise_display.dart';
import '../../widgets/workout/workout_controls.dart';
import '../../../models/workout.dart';
import '../../../models/coach.dart';
import '../../../providers/user_preferences_provider.dart';
import '../../../services/text_to_speech_service.dart';
import '../../../services/workout_tracking_service.dart';
import '../../../services/dynamic_coaching_service.dart';

class ActiveWorkoutScreen extends ConsumerStatefulWidget {
  final WorkoutPlan workoutPlan;
  
  const ActiveWorkoutScreen({
    Key? key,
    required this.workoutPlan,
  }) : super(key: key);

  @override
  ConsumerState<ActiveWorkoutScreen> createState() => _ActiveWorkoutScreenState();
}

class _ActiveWorkoutScreenState extends ConsumerState<ActiveWorkoutScreen>
    with TickerProviderStateMixin {
  Timer? _timer;
  int _secondsElapsed = 0;
  bool _isPlaying = false;
  bool _isPaused = false;
  int _currentExerciseIndex = 0;
  int _currentSet = 1;
  bool _soundEnabled = true;
  int _totalWorkoutDuration = 0;
  bool _showWelcome = true;
  final TextToSpeechService _ttsService = TextToSpeechService();
  final DynamicCoachingService _coachingService = DynamicCoachingService();
  bool _audioEnabled = true;
  
  late AnimationController _pulseController;
  late AnimationController _progressController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _progressAnimation;
  
  Exercise get _currentExercise => widget.workoutPlan.exercises.isNotEmpty
      ? widget.workoutPlan.exercises[_currentExerciseIndex]
      : _defaultExercise;
      
  int get _totalSets => (_currentExercise.metadata['sets'] as int?) ?? 3;
  
  final Exercise _defaultExercise = Exercise(
    id: 'default',
    name: 'Rest',
    description: 'Take a break',
    muscleGroups: [],
    equipment: ['None'],
    difficulty: WorkoutDifficulty.easy,
    instructions: ['Rest and recover'],
    metadata: {'sets': 1, 'reps': 1, 'rest': 60},
  );

  @override
  void initState() {
    super.initState();
    _calculateTotalDuration();
    _initAnimations();
    _initTTS();
    _showWelcomeMessage();
  }
  
  Future<void> _initTTS() async {
    await _ttsService.initialize();
  }

  void _initAnimations() {
    _pulseController = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );
    
    _progressController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    
    _progressAnimation = Tween<double>(begin: 0.0, end: 0.3).animate(
      CurvedAnimation(parent: _progressController, curve: Curves.easeOut),
    );
    
    _pulseController.repeat(reverse: true);
    _progressController.forward();
  }
  
  void _calculateTotalDuration() {
    final durationString = widget.workoutPlan.duration;
    final match = RegExp(r'(\d+)').firstMatch(durationString);
    if (match != null) {
      _totalWorkoutDuration = int.parse(match.group(1)!);
    } else {
      _totalWorkoutDuration = 30;
    }
  }
  
  String _formatRemainingTime() {
    final totalSeconds = _totalWorkoutDuration * 60;
    final remainingSeconds = totalSeconds - _secondsElapsed;
    if (remainingSeconds <= 0) return '0 MIN LEFT';
    final minutes = remainingSeconds ~/ 60;
    return '$minutes MIN LEFT';
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseController.dispose();
    _progressController.dispose();
    _ttsService.dispose();
    super.dispose();
  }

  void _startTimer() {
    if (_timer != null) return; // Prevent multiple timers
    
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isPaused) {
        setState(() {
          _secondsElapsed++;
        });
      }
    });
    setState(() {
      _isPlaying = true;
      _showWelcome = false;
    });
    if (_soundEnabled) {
      _playSound('workout_start');
    }
  }

  void _showWelcomeMessage() {
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => _buildWelcomeDialog(),
        );
      }
    });
  }

  Widget _buildWelcomeDialog() {
    final userData = ref.watch(userPreferencesProvider);
    final coach = userData.selectedCoach;
    
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
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
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: Colors.white.withOpacity(0.2),
                  width: 1.5,
                ),
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Coach Avatar
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: coach?.gradient ?? AppTheme.primaryGradient,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: (coach?.color ?? AppTheme.primaryColor).withOpacity(0.5),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        coach?.avatar ?? '💪',
                        style: const TextStyle(fontSize: 36),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Coach Name
                  Text(
                    coach?.name ?? 'Your Coach',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // Welcome Message
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _getWelcomeMessage(coach?.personality),
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 16,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Workout Info
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.1),
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(
                          widget.workoutPlan.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.timer,
                              color: Colors.white.withOpacity(0.7),
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              widget.workoutPlan.duration,
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.7),
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Icon(
                              Icons.fitness_center,
                              color: Colors.white.withOpacity(0.7),
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${widget.workoutPlan.exercises.length} exercises',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.7),
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Start Button
                  GestureDetector(
                    onTap: () async {
                      Navigator.pop(context);
                      // Speak the welcome message
                      if (_audioEnabled && coach != null) {
                        await _ttsService.speakCoachMessage(
                          _getWelcomeMessage(coach.personality),
                          coach.personality,
                        );
                      }
                      _startTimer();
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryColor.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Text(
                        'Start Workout',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _getWelcomeMessage(CoachPersonality? personality) {
    return _coachingService.getWelcomeMessage(
      widget.workoutPlan.name,
      widget.workoutPlan.exercises.length,
      personality ?? CoachPersonality.steadyPace,
    );
  }

  void _pauseTimer() {
    setState(() {
      _isPaused = !_isPaused;
    });
  }

  void _stopWorkout() {
    _timer?.cancel();
    Navigator.pop(context);
  }

  String _formatTime(int seconds) {
    int minutes = seconds ~/ 60;
    int remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(1, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
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
              WorkoutHeader(
                remainingTime: _formatRemainingTime(),
                soundEnabled: _soundEnabled,
                audioEnabled: _audioEnabled,
                isPaused: _isPaused,
                onClose: _stopWorkout,
                onToggleSound: () {
                  setState(() {
                    _soundEnabled = !_soundEnabled;
                  });
                  if (_soundEnabled) {
                    _playSound('toggle');
                  }
                },
                onToggleAudio: () {
                  setState(() {
                    _audioEnabled = !_audioEnabled;
                  });
                  if (!_audioEnabled) {
                    _ttsService.stop();
                  }
                },
                onTogglePause: _pauseTimer,
              ),
              _buildTimer(),
              _buildExerciseImage(),
              ExerciseDisplay(
                exercise: _currentExercise,
                currentSet: _currentSet,
                totalSets: _totalSets,
                onInfoTap: _showExerciseInfo,
              ),
              _buildProgressIndicator(),
              WorkoutControls(
                onOverview: _showWorkoutOverview,
                onPrevious: _canGoPrevious() ? _previousExercise : null,
                onNext: _nextExercise,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimer() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20.0),
      child: ScaleTransition(
        scale: _pulseAnimation,
        child: Text(
          _formatTime(_secondsElapsed),
          style: const TextStyle(
            fontSize: 48,
            fontWeight: FontWeight.w300,
            color: Colors.white,
            letterSpacing: 2,
          ),
        ),
      ),
    );
  }

  Widget _buildExerciseImage() {
    return Expanded(
      flex: 3,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.grey.withOpacity(0.3),
              Colors.grey.withOpacity(0.1),
            ],
          ),
        ),
        child: Stack(
          children: [
            Center(
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.primaryColor.withOpacity(0.3),
                      AppTheme.primaryColor.withOpacity(0.1),
                    ],
                  ),
                ),
                child: const Icon(
                  Icons.accessibility_new,
                  size: 100,
                  color: Colors.white,
                ),
              ),
            ),
            Positioned(
              bottom: 20,
              right: 20,
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6C5CE7), Color(0xFFA29BFE)],
                  ),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.3),
                    width: 2,
                  ),
                ),
                child: const Center(
                  child: Text(
                    '🌟',
                    style: TextStyle(fontSize: 24),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 20,
              left: 20,
              child: GlassMorphicCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                blur: 25,
                borderRadius: BorderRadius.circular(16),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.favorite,
                      color: const Color(0xFFFF375F),
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      '132',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$_currentSet / $_totalSets',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withOpacity(0.7),
                ),
              ),
              const Icon(
                Icons.arrow_forward,
                color: Colors.white,
                size: 20,
              ),
            ],
          ),
          const SizedBox(height: 8),
          AnimatedBuilder(
            animation: _progressAnimation,
            builder: (context, child) {
              return LinearProgressIndicator(
                value: _progressAnimation.value,
                backgroundColor: Colors.white.withOpacity(0.2),
                valueColor: const AlwaysStoppedAnimation<Color>(
                  Color(0xFF30D158),
                ),
                minHeight: 4,
              );
            },
          ),
        ],
      ),
    );
  }
  
  bool _canGoPrevious() {
    return _currentSet > 1 || _currentExerciseIndex > 0;
  }
  
  void _previousExercise() {
    setState(() {
      if (_currentSet > 1) {
        _currentSet--;
      } else if (_currentExerciseIndex > 0) {
        _currentExerciseIndex--;
        _currentSet = _totalSets;
        _progressController.reset();
        _progressController.forward();
      }
    });
  }
  
  void _nextExercise() async {
    setState(() {
      if (_currentSet < _totalSets) {
        _currentSet++;
        if (_soundEnabled) {
          _playSound('set_complete');
        }
      } else if (_currentExerciseIndex < widget.workoutPlan.exercises.length - 1) {
        _currentExerciseIndex++;
        _currentSet = 1;
        _progressController.reset();
        _progressController.forward();
        if (_soundEnabled) {
          _playSound('exercise_complete');
        }
      } else {
        if (_soundEnabled) {
          _playSound('workout_complete');
        }
        _showCompletionDialog();
        return;
      }
    });
    
    // Provide audio guidance for the new exercise/set
    if (_audioEnabled) {
      final userData = ref.read(userPreferencesProvider);
      final coach = userData.selectedCoach;
      
      // Wait a moment for the UI to update
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Speak workout guidance
      await _ttsService.speakWorkoutGuidance(
        _currentExercise.name,
        _currentSet,
        _totalSets,
        coach?.personality,
      );
      
      // Provide breathing guidance for new exercises
      if (_currentSet == 1) {
        await Future.delayed(const Duration(seconds: 2));
        await _ttsService.speakBreathingGuidance(_currentExercise.name, coach?.personality);
      }
    }
  }
  
  void _showExerciseInfo() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.grey[900],
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _currentExercise.name,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _currentExercise.description,
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Instructions:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            ..._currentExercise.instructions.map((instruction) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '• ',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.7),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      instruction,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                  ),
                ],
              ),
            )),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
  
  void _showWorkoutOverview() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.grey[900],
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.workoutPlan.name,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.white),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '${widget.workoutPlan.exercises.length} exercises • ${widget.workoutPlan.duration}',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView.builder(
                itemCount: widget.workoutPlan.exercises.length,
                itemBuilder: (context, index) {
                  final exercise = widget.workoutPlan.exercises[index];
                  final isActive = index == _currentExerciseIndex;
                  final sets = (exercise.metadata['sets'] as int?) ?? 3;
                  final reps = (exercise.metadata['reps'] as int?) ?? 12;
                  final rest = (exercise.metadata['rest'] as int?) ?? 60;
                  
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isActive
                          ? AppTheme.primaryColor.withOpacity(0.2)
                          : Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isActive
                            ? AppTheme.primaryColor.withOpacity(0.5)
                            : Colors.white.withOpacity(0.1),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isActive
                                ? AppTheme.primaryColor
                                : Colors.white.withOpacity(0.1),
                          ),
                          child: Center(
                            child: Text(
                              '${index + 1}',
                              style: TextStyle(
                                color: isActive ? Colors.white : Colors.white.withOpacity(0.7),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
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
                                '$sets sets • $reps reps • ${rest}s rest',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.white.withOpacity(0.6),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (isActive)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Set $_currentSet/$_totalSets',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  void _showCompletionDialog() {
    _timer?.cancel();
    
    // Record the completed workout
    _recordCompletedWorkout();
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text(
          '🎉 Workout Complete!',
          style: TextStyle(color: Colors.white),
          textAlign: TextAlign.center,
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Great job! You\'ve completed ${widget.workoutPlan.name}',
              style: TextStyle(color: Colors.white.withOpacity(0.8)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              'Time: ${_formatTime(_secondsElapsed)}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Exercises: ${widget.workoutPlan.exercises.length}',
              style: TextStyle(color: Colors.white.withOpacity(0.8)),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.green.withOpacity(0.5)),
              ),
              child: Text(
                'Recorded in your schedule ✓',
                style: TextStyle(
                  color: Colors.green.shade300,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text(
              'Finish',
              style: TextStyle(color: AppTheme.primaryColor),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _recordCompletedWorkout() async {
    try {
      final workoutTrackingService = ref.read(workoutTrackingServiceProvider);
      
      await workoutTrackingService.recordCompletedWorkout(
        workoutPlanId: widget.workoutPlan.id,
        workoutName: widget.workoutPlan.name,
        duration: Duration(seconds: _secondsElapsed),
        exercises: widget.workoutPlan.exercises,
        workoutType: 'manual', // Since user manually started this workout
      );
      
      // Show feedback that workout was recorded
      if (_audioEnabled) {
        final userData = ref.read(userPreferencesProvider);
        final coach = userData.selectedCoach;
        await _ttsService.speakCoachMessage(
          'Excellent work! Your workout has been recorded in your schedule.',
          coach?.personality,
        );
      }
    } catch (e) {
      print('Error recording completed workout: $e');
    }
  }
  
  void _playSound(String soundType) {
    try {
      switch (soundType) {
        case 'workout_start':
        case 'exercise_complete':
          HapticFeedback.mediumImpact();
          SystemSound.play(SystemSoundType.click);
          break;
        case 'set_complete':
          HapticFeedback.lightImpact();
          SystemSound.play(SystemSoundType.click);
          break;
        case 'workout_complete':
          HapticFeedback.heavyImpact();
          SystemSound.play(SystemSoundType.click);
          break;
        case 'toggle':
          HapticFeedback.selectionClick();
          break;
        default:
          SystemSound.play(SystemSoundType.click);
      }
    } catch (e) {
      print('Error playing sound: $e');
    }
  }
}