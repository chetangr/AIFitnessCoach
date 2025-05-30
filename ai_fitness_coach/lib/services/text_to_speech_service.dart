import 'package:flutter_tts/flutter_tts.dart';
import '../models/coach.dart';
import 'dynamic_coaching_service.dart';
import 'google_tts_service.dart';

class TextToSpeechService {
  static final TextToSpeechService _instance = TextToSpeechService._internal();
  factory TextToSpeechService() => _instance;
  TextToSpeechService._internal();

  final GoogleTtsService _googleTts = GoogleTtsService.instance;
  final DynamicCoachingService _coachingService = DynamicCoachingService();
  bool _isInitialized = false;
  bool _useGoogleTts = true; // Flag to switch between services

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      if (_useGoogleTts) {
        await _googleTts.initialize();
      }
      _isInitialized = true;
    } catch (e) {
      print('TTS initialization error: $e');
      _useGoogleTts = false; // Fallback to basic TTS
    }
  }

  Future<void> speakCoachMessage(String message, CoachPersonality? personality) async {
    if (!_isInitialized) await initialize();
    
    await stop(); // Stop any current speech
    
    if (_useGoogleTts) {
      // Use Google TTS with natural voice
      await _googleTts.setCoachPersonalityVoice(personality?.name ?? 'steadyPace');
      await _googleTts.speak(message, priority: true);
    } else {
      // Fallback to basic TTS
      await _configureVoiceForPersonality(personality);
      try {
        final FlutterTts basicTts = FlutterTts();
        await basicTts.speak(message);
      } catch (e) {
        print('TTS speak error: $e');
      }
    }
  }

  Future<void> speakExerciseInstruction(String instruction, {bool isBreathingTip = false}) async {
    if (!_isInitialized) await initialize();
    
    if (_useGoogleTts) {
      // Use slower rate for instructions
      await _googleTts.speak(instruction, priority: false);
    } else {
      // Fallback to basic TTS
      final FlutterTts basicTts = FlutterTts();
      await basicTts.setSpeechRate(isBreathingTip ? 0.5 : 0.6);
      await basicTts.setPitch(1.0);
      
      try {
        await basicTts.speak(instruction);
      } catch (e) {
        print('TTS instruction error: $e');
      }
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
    final FlutterTts basicTts = FlutterTts();
    switch (personality) {
      case CoachPersonality.aggressive:
        await basicTts.setSpeechRate(0.9); // Faster, more energetic
        await basicTts.setPitch(1.1); // Slightly higher pitch
        await basicTts.setVolume(0.9); // Louder
        break;
      case CoachPersonality.supportive:
        await basicTts.setSpeechRate(0.7); // Slower, more gentle
        await basicTts.setPitch(0.9); // Slightly lower pitch
        await basicTts.setVolume(0.7); // Softer
        break;
      case CoachPersonality.steadyPace:
        await basicTts.setSpeechRate(0.8); // Normal pace
        await basicTts.setPitch(1.0); // Normal pitch
        await basicTts.setVolume(0.8); // Normal volume
        break;
      default:
        await basicTts.setSpeechRate(0.8);
        await basicTts.setPitch(1.0);
        await basicTts.setVolume(0.8);
    }
  }

  Future<void> stop() async {
    if (_useGoogleTts) {
      await _googleTts.stop();
    } else {
      try {
        final FlutterTts basicTts = FlutterTts();
        await basicTts.stop();
      } catch (e) {
        print('TTS stop error: $e');
      }
    }
  }

  Future<void> pause() async {
    if (_useGoogleTts) {
      await _googleTts.pause();
    } else {
      try {
        final FlutterTts basicTts = FlutterTts();
        await basicTts.pause();
      } catch (e) {
        print('TTS pause error: $e');
      }
    }
  }

  bool get isSpeaking => _useGoogleTts ? _googleTts.isSpeaking : false;

  void dispose() {
    stop();
  }
}