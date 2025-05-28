import 'package:flutter_tts/flutter_tts.dart';
import '../models/coach.dart';
import 'dynamic_coaching_service.dart';

class TextToSpeechService {
  static final TextToSpeechService _instance = TextToSpeechService._internal();
  factory TextToSpeechService() => _instance;
  TextToSpeechService._internal();

  final FlutterTts _flutterTts = FlutterTts();
  final DynamicCoachingService _coachingService = DynamicCoachingService();
  bool _isInitialized = false;
  bool _isSpeaking = false;

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      await _flutterTts.setLanguage("en-US");
      await _flutterTts.setSpeechRate(0.8);
      await _flutterTts.setVolume(0.8);
      await _flutterTts.setPitch(1.0);
      
      _flutterTts.setStartHandler(() {
        _isSpeaking = true;
      });

      _flutterTts.setCompletionHandler(() {
        _isSpeaking = false;
      });

      _flutterTts.setErrorHandler((msg) {
        _isSpeaking = false;
        print('TTS Error: $msg');
      });

      _isInitialized = true;
    } catch (e) {
      print('TTS initialization error: $e');
    }
  }

  Future<void> speakCoachMessage(String message, CoachPersonality? personality) async {
    if (!_isInitialized) await initialize();
    
    await stop(); // Stop any current speech
    
    // Adjust voice parameters based on coach personality
    await _configureVoiceForPersonality(personality);
    
    try {
      await _flutterTts.speak(message);
    } catch (e) {
      print('TTS speak error: $e');
    }
  }

  Future<void> speakExerciseInstruction(String instruction, {bool isBreathingTip = false}) async {
    if (!_isInitialized) await initialize();
    
    // Configure voice for instructions (slower, clearer)
    await _flutterTts.setSpeechRate(0.6);
    await _flutterTts.setPitch(1.0);
    
    if (isBreathingTip) {
      // Slower for breathing instructions
      await _flutterTts.setSpeechRate(0.5);
    }
    
    try {
      await _flutterTts.speak(instruction);
    } catch (e) {
      print('TTS instruction error: $e');
    }
  }

  Future<void> speakWorkoutGuidance(String exerciseName, int currentSet, int totalSets, CoachPersonality? personality) async {
    if (!_isInitialized) await initialize();
    
    String guidance;
    if (currentSet == 1) {
      // Use dynamic coaching script for first set
      guidance = _coachingService.getRandomExerciseScript(exerciseName, personality ?? CoachPersonality.steadyPace);
    } else if (currentSet == totalSets) {
      // Use encouragement for final set
      guidance = _coachingService.getRandomSetEncouragement(personality ?? CoachPersonality.steadyPace);
    } else {
      // Use general encouragement for middle sets
      guidance = _coachingService.getRandomSetEncouragement(personality ?? CoachPersonality.steadyPace);
    }
    
    await speakExerciseInstruction(guidance);
  }

  Future<void> speakBreathingGuidance(String exerciseName, CoachPersonality? personality) async {
    String breathingTip = _coachingService.getRandomBreathingInstruction(
      exerciseName, 
      personality ?? CoachPersonality.steadyPace
    );
    
    await speakExerciseInstruction(breathingTip, isBreathingTip: true);
  }

  Future<void> _configureVoiceForPersonality(CoachPersonality? personality) async {
    switch (personality) {
      case CoachPersonality.aggressive:
        await _flutterTts.setSpeechRate(0.9); // Faster, more energetic
        await _flutterTts.setPitch(1.1); // Slightly higher pitch
        await _flutterTts.setVolume(0.9); // Louder
        break;
      case CoachPersonality.supportive:
        await _flutterTts.setSpeechRate(0.7); // Slower, more gentle
        await _flutterTts.setPitch(0.9); // Slightly lower pitch
        await _flutterTts.setVolume(0.7); // Softer
        break;
      case CoachPersonality.steadyPace:
        await _flutterTts.setSpeechRate(0.8); // Normal pace
        await _flutterTts.setPitch(1.0); // Normal pitch
        await _flutterTts.setVolume(0.8); // Normal volume
        break;
      default:
        await _flutterTts.setSpeechRate(0.8);
        await _flutterTts.setPitch(1.0);
        await _flutterTts.setVolume(0.8);
    }
  }

  Future<void> stop() async {
    if (_isSpeaking) {
      try {
        await _flutterTts.stop();
        _isSpeaking = false;
      } catch (e) {
        print('TTS stop error: $e');
      }
    }
  }

  Future<void> pause() async {
    try {
      await _flutterTts.pause();
    } catch (e) {
      print('TTS pause error: $e');
    }
  }

  bool get isSpeaking => _isSpeaking;

  void dispose() {
    _flutterTts.stop();
  }
}