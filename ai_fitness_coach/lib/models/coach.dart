import 'package:flutter/material.dart';

enum CoachPersonality {
  aggressive,
  supportive,
  steadyPace,
}

extension CoachPersonalityExtension on CoachPersonality {
  String get name {
    switch (this) {
      case CoachPersonality.aggressive:
        return 'Aggressive';
      case CoachPersonality.supportive:
        return 'Supportive';
      case CoachPersonality.steadyPace:
        return 'Steady Pace';
    }
  }

  String get description {
    switch (this) {
      case CoachPersonality.aggressive:
        return 'High-energy, challenging, results-focused coaching that pushes you to your limits';
      case CoachPersonality.supportive:
        return 'Encouraging, understanding, motivation-focused coaching that builds confidence';
      case CoachPersonality.steadyPace:
        return 'Consistent, methodical, progress-oriented coaching for sustainable results';
    }
  }

  String get systemPrompt {
    switch (this) {
      case CoachPersonality.aggressive:
        return '''You are Alex Thunder, an aggressive AI fitness coach. Your personality is:
- High-energy and demanding
- Results-focused and challenging  
- Uses motivational pressure and urgency
- Direct communication style
- Pushes users beyond comfort zones
- Celebrates achievements with intense enthusiasm
- Never accepts excuses
- Focuses on maximum effort and performance''';

      case CoachPersonality.supportive:
        return '''You are Maya Zen, a supportive AI fitness coach. Your personality is:
- Encouraging and understanding
- Patient and empathetic
- Focuses on positive reinforcement
- Gentle but effective motivation
- Celebrates small victories
- Provides emotional support during challenges
- Adapts to user's emotional state
- Builds confidence and self-esteem''';

      case CoachPersonality.steadyPace:
        return '''You are Ryan Steady, a steady-pace AI fitness coach. Your personality is:
- Methodical and consistent
- Focus on sustainable progress
- Data-driven approach
- Balanced and measured communication
- Emphasizes long-term goals
- Practical and realistic advice
- Consistent encouragement
- Process-oriented rather than outcome-focused''';
    }
  }
}

class Coach {
  final String id;
  final String name;
  final CoachPersonality personality;
  final String description;
  final String avatar;
  final String motivationStyle;
  final String catchphrase;
  final Color color;
  final Gradient gradient;

  Coach({
    required this.id,
    required this.name,
    required this.personality,
    required this.description,
    required this.avatar,
    required this.motivationStyle,
    required this.catchphrase,
    required this.color,
    required this.gradient,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'personality': personality.name,
      'description': description,
      'avatar': avatar,
      'motivationStyle': motivationStyle,
      'catchphrase': catchphrase,
      'colorValue': color.value,
    };
  }

  factory Coach.fromJson(Map<String, dynamic> json) {
    CoachPersonality personality;
    switch (json['personality']) {
      case 'Aggressive':
        personality = CoachPersonality.aggressive;
        break;
      case 'Supportive':
        personality = CoachPersonality.supportive;
        break;
      case 'Steady Pace':
        personality = CoachPersonality.steadyPace;
        break;
      default:
        personality = CoachPersonality.supportive;
    }

    Color color = Color(json['colorValue'] ?? 0xFF6C5CE7);
    
    return Coach(
      id: json['id'],
      name: json['name'],
      personality: personality,
      description: json['description'],
      avatar: json['avatar'],
      motivationStyle: json['motivationStyle'],
      catchphrase: json['catchphrase'],
      color: color,
      gradient: LinearGradient(
        colors: [color, color.withOpacity(0.7)],
      ),
    );
  }
}

class CoachingMessage {
  final String id;
  final String content;
  final bool isFromCoach;
  final DateTime timestamp;
  final CoachPersonality? coachPersonality;
  final Map<String, dynamic>? metadata;

  CoachingMessage({
    required this.id,
    required this.content,
    required this.isFromCoach,
    required this.timestamp,
    this.coachPersonality,
    this.metadata,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'isFromCoach': isFromCoach,
      'timestamp': timestamp.toIso8601String(),
      'coachPersonality': coachPersonality?.name,
      'metadata': metadata,
    };
  }

  factory CoachingMessage.fromJson(Map<String, dynamic> json) {
    CoachPersonality? personality;
    if (json['coachPersonality'] != null) {
      switch (json['coachPersonality']) {
        case 'Aggressive':
          personality = CoachPersonality.aggressive;
          break;
        case 'Supportive':
          personality = CoachPersonality.supportive;
          break;
        case 'Steady Pace':
          personality = CoachPersonality.steadyPace;
          break;
      }
    }

    return CoachingMessage(
      id: json['id'],
      content: json['content'],
      isFromCoach: json['isFromCoach'],
      timestamp: DateTime.parse(json['timestamp']),
      coachPersonality: personality,
      metadata: json['metadata'],
    );
  }
}