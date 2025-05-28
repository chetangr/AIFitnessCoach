import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import '../../../core/theme/app_theme.dart';
import '../../../models/workout.dart';

class ExercisePlayerScreen extends ConsumerStatefulWidget {
  final WorkoutPlan workout;

  const ExercisePlayerScreen({
    Key? key,
    required this.workout,
  }) : super(key: key);

  @override
  ConsumerState<ExercisePlayerScreen> createState() => _ExercisePlayerScreenState();
}

class _ExercisePlayerScreenState extends ConsumerState<ExercisePlayerScreen> {
  int _currentExerciseIndex = 0;
  int _timeRemaining = 20; // seconds
  Timer? _timer;
  bool _isPaused = false;

  final List<Map<String, dynamic>> _exercises = [
    {
      'name': 'Jog in Place',
      'duration': 20,
      'category': 'Hip Lifts',
      'next': 'Heel Kicks',
    },
    {
      'name': 'Heel Kicks',
      'duration': 20,
      'category': 'Warm Up',
      'next': 'Jumping Jacks',
    },
    {
      'name': 'Jumping Jacks',
      'duration': 30,
      'category': 'Cardio',
      'next': 'Rest',
    },
  ];

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    _timeRemaining = _exercises[_currentExerciseIndex]['duration'] as int;
    
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isPaused) {
        setState(() {
          if (_timeRemaining > 0) {
            _timeRemaining--;
          } else {
            _nextExercise();
          }
        });
      }
    });
  }

  void _nextExercise() {
    if (_currentExerciseIndex < _exercises.length - 1) {
      setState(() {
        _currentExerciseIndex++;
      });
      _startTimer();
    } else {
      // Workout complete
      _timer?.cancel();
      _showWorkoutComplete();
    }
  }

  void _previousExercise() {
    if (_currentExerciseIndex > 0) {
      setState(() {
        _currentExerciseIndex--;
      });
      _startTimer();
    }
  }

  void _togglePause() {
    setState(() {
      _isPaused = !_isPaused;
    });
  }

  void _showWorkoutComplete() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text(
          'Workout Complete! 🎉',
          style: TextStyle(color: Colors.white),
        ),
        content: Text(
          'Great job completing ${widget.workout.name}!',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop();
              Navigator.of(context).pop();
            },
            child: const Text('Finish'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentExercise = _exercises[_currentExerciseIndex];
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Background with gradient
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
                colors: [
                  Colors.purple.withOpacity(0.3),
                  Colors.blue.withOpacity(0.3),
                  Colors.black,
                ],
              ),
            ),
          ),
          
          // Main content
          SafeArea(
            child: Column(
              children: [
                _buildHeader(),
                const Spacer(),
                _buildExerciseInfo(currentExercise),
                const Spacer(),
                _buildControls(),
              ],
            ),
          ),
          
          // Exercise demo placeholder
          Positioned(
            top: MediaQuery.of(context).size.height * 0.25,
            left: 0,
            right: 0,
            child: Container(
              height: MediaQuery.of(context).size.height * 0.35,
              margin: const EdgeInsets.symmetric(horizontal: 40),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                image: const DecorationImage(
                  image: AssetImage('assets/images/exercise_demo.jpg'),
                  fit: BoxFit.cover,
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.2),
                    width: 2,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () {
              _timer?.cancel();
              Navigator.pop(context);
            },
          ),
          Column(
            children: [
              Text(
                '${_currentExerciseIndex + 1} / ${_exercises.length}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                width: 120,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(2),
                ),
                child: Row(
                  children: List.generate(
                    _exercises.length,
                    (index) => Expanded(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 1),
                        decoration: BoxDecoration(
                          color: index <= _currentExerciseIndex
                              ? Colors.white
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.music_note, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildExerciseInfo(Map<String, dynamic> exercise) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        children: [
          Text(
            exercise['category'] as String,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.white54,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            exercise['name'] as String,
            style: const TextStyle(
              fontSize: 36,
              color: Colors.white,
              fontWeight: FontWeight.w300,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '$_timeRemaining sec',
            style: const TextStyle(
              fontSize: 24,
              color: Colors.white70,
              fontWeight: FontWeight.w400,
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.arrow_forward,
                  size: 16,
                  color: Colors.white70,
                ),
                const SizedBox(width: 8),
                Text(
                  exercise['next'] as String,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControls() {
    return Container(
      padding: const EdgeInsets.all(32),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          IconButton(
            icon: const Icon(Icons.skip_previous),
            iconSize: 32,
            color: Colors.white54,
            onPressed: _currentExerciseIndex > 0 ? _previousExercise : null,
          ),
          GestureDetector(
            onTap: _togglePause,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.1),
                border: Border.all(
                  color: Colors.white.withOpacity(0.3),
                  width: 2,
                ),
              ),
              child: Icon(
                _isPaused ? Icons.play_arrow : Icons.pause,
                size: 40,
                color: Colors.white,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.skip_next),
            iconSize: 32,
            color: Colors.white,
            onPressed: _nextExercise,
          ),
        ],
      ),
    );
  }
}