import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:shared_preferences/shared_preferences.dart';

class GoogleTtsService {
  static GoogleTtsService? _instance;
  static GoogleTtsService get instance => _instance ??= GoogleTtsService._();
  
  GoogleTtsService._();
  
  final FlutterTts _flutterTts = FlutterTts();
  bool _isInitialized = false;
  bool _isSpeaking = false;
  
  // Voice settings
  static const String _voiceKey = 'preferred_voice';
  static const String _pitchKey = 'voice_pitch';
  static const String _rateKey = 'voice_rate';
  
  // Natural voice configurations
  static const Map<String, Map<String, dynamic>> naturalVoices = {
    'male_us': {
      'name': 'en-US-Wavenet-D',
      'locale': 'en-US',
      'gender': 'male',
      'pitch': 1.0,
      'rate': 0.9,
    },
    'female_us': {
      'name': 'en-US-Wavenet-F',
      'locale': 'en-US', 
      'gender': 'female',
      'pitch': 1.1,
      'rate': 0.95,
    },
    'male_uk': {
      'name': 'en-GB-Wavenet-B',
      'locale': 'en-GB',
      'gender': 'male',
      'pitch': 0.95,
      'rate': 0.9,
    },
    'female_uk': {
      'name': 'en-GB-Wavenet-A',
      'locale': 'en-GB',
      'gender': 'female',
      'pitch': 1.05,
      'rate': 0.95,
    },
  };
  
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Configure TTS for more natural speech
      await _flutterTts.setSharedInstance(true);
      
      // Set up enhanced voice quality
      if (Platform.isIOS) {
        await _flutterTts.setIosAudioCategory(
          IosTextToSpeechAudioCategory.playback,
          [
            IosTextToSpeechAudioCategoryOptions.allowBluetooth,
            IosTextToSpeechAudioCategoryOptions.allowBluetoothA2DP,
            IosTextToSpeechAudioCategoryOptions.mixWithOthers,
          ],
          IosTextToSpeechAudioMode.voicePrompt,
        );
      }
      
      // Load saved preferences
      final prefs = await SharedPreferences.getInstance();
      final savedVoice = prefs.getString(_voiceKey) ?? 'male_us';
      await setVoice(savedVoice);
      
      // Set up callbacks
      _flutterTts.setStartHandler(() {
        _isSpeaking = true;
      });
      
      _flutterTts.setCompletionHandler(() {
        _isSpeaking = false;
      });
      
      _flutterTts.setErrorHandler((msg) {
        _isSpeaking = false;
        debugPrint('TTS Error: $msg');
      });
      
      _isInitialized = true;
    } catch (e) {
      debugPrint('Failed to initialize TTS: $e');
    }
  }
  
  Future<void> setVoice(String voiceKey) async {
    if (!naturalVoices.containsKey(voiceKey)) {
      voiceKey = 'male_us';
    }
    
    final voice = naturalVoices[voiceKey]!;
    
    try {
      // Get available voices
      final voices = await _flutterTts.getVoices;
      
      // Try to find the exact voice or a similar one
      final matchingVoice = voices.firstWhere(
        (v) => v['name'] == voice['name'] || 
               (v['locale'] == voice['locale'] && v['gender'] == voice['gender']),
        orElse: () => null,
      );
      
      if (matchingVoice != null) {
        await _flutterTts.setVoice({
          'name': matchingVoice['name'],
          'locale': matchingVoice['locale'],
        });
      } else {
        // Fallback to locale
        await _flutterTts.setLanguage(voice['locale']);
      }
      
      // Set voice characteristics
      await _flutterTts.setPitch(voice['pitch']);
      await _flutterTts.setSpeechRate(voice['rate']);
      await _flutterTts.setVolume(1.0);
      
      // Save preference
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_voiceKey, voiceKey);
    } catch (e) {
      debugPrint('Failed to set voice: $e');
    }
  }
  
  Future<void> speak(String text, {bool priority = false}) async {
    if (!_isInitialized) {
      await initialize();
    }
    
    if (text.isEmpty) return;
    
    try {
      if (_isSpeaking && priority) {
        await stop();
      } else if (_isSpeaking) {
        return; // Don't interrupt current speech
      }
      
      // Process text for more natural speech
      final processedText = _processTextForNaturalSpeech(text);
      
      await _flutterTts.speak(processedText);
    } catch (e) {
      debugPrint('Failed to speak: $e');
    }
  }
  
  Future<void> stop() async {
    await _flutterTts.stop();
    _isSpeaking = false;
  }
  
  Future<void> pause() async {
    await _flutterTts.pause();
  }
  
  bool get isSpeaking => _isSpeaking;
  
  String _processTextForNaturalSpeech(String text) {
    // Add pauses for more natural speech
    text = text.replaceAll('!', '!...');
    text = text.replaceAll('?', '?...');
    text = text.replaceAll('.', '...');
    text = text.replaceAll(',', ',.');
    
    // Handle numbers
    text = text.replaceAllMapped(
      RegExp(r'\b(\d+)\s*reps?\b'),
      (match) => '${_numberToWords(int.parse(match.group(1)!))} repetitions',
    );
    
    text = text.replaceAllMapped(
      RegExp(r'\b(\d+)\s*sets?\b'),
      (match) => '${_numberToWords(int.parse(match.group(1)!))} sets',
    );
    
    text = text.replaceAllMapped(
      RegExp(r'\b(\d+)\s*seconds?\b'),
      (match) => '${_numberToWords(int.parse(match.group(1)!))} seconds',
    );
    
    return text;
  }
  
  String _numberToWords(int number) {
    final words = [
      '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
      'seventeen', 'eighteen', 'nineteen'
    ];
    
    if (number < 20) {
      return words[number];
    } else if (number < 100) {
      final tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
      return '${tens[number ~/ 10]} ${words[number % 10]}'.trim();
    }
    
    return number.toString();
  }
  
  // Coach personality voices
  Future<void> setCoachPersonalityVoice(String personality) async {
    switch (personality.toLowerCase()) {
      case 'aggressive':
        await setVoice('male_us');
        await _flutterTts.setPitch(0.9);
        await _flutterTts.setSpeechRate(1.0);
        break;
      case 'supportive':
        await setVoice('female_us');
        await _flutterTts.setPitch(1.1);
        await _flutterTts.setSpeechRate(0.9);
        break;
      case 'steady_pace':
      case 'steadypace':
        await setVoice('male_uk');
        await _flutterTts.setPitch(1.0);
        await _flutterTts.setSpeechRate(0.85);
        break;
      default:
        await setVoice('male_us');
    }
  }
  
  // Test voice with sample text
  Future<void> testVoice() async {
    await speak(
      "Great job! You're doing amazing. Let's keep pushing forward!",
      priority: true,
    );
  }
}