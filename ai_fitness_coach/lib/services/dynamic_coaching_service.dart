import 'dart:math';
import '../models/coach.dart';

class DynamicCoachingService {
  static final DynamicCoachingService _instance = DynamicCoachingService._internal();
  factory DynamicCoachingService() => _instance;
  DynamicCoachingService._internal();

  final Random _random = Random();

  // Exercise-specific coaching scripts organized by personality
  final Map<String, Map<CoachPersonality, List<String>>> _exerciseScripts = {
    'Push-up': {
      CoachPersonality.aggressive: [
        "Come on! You've got more in you than that! Don't you dare quit on me now!",
        "This is where champions are made! Push through that burn - it's just weakness leaving your body!",
        "I see you struggling, but that's exactly where you need to be! One more rep - show me your heart!",
        "Your arms might be screaming, but your will is stronger! Drive through and prove who's boss!",
        "Feel that fire? That's your body transforming! Don't waste this moment - push harder!",
      ],
      CoachPersonality.supportive: [
        "You're doing so well! I can see how much stronger you're getting with each workout.",
        "Take a breath if you need to - there's no rush. You're exactly where you need to be right now.",
        "I'm really proud of how you're pushing yourself today. Your form looks fantastic!",
        "Remember, every single rep is making you stronger. You're investing in yourself beautifully.",
        "If you need to drop to your knees, that's totally fine! We're building strength progressively.",
      ],
      CoachPersonality.steadyPace: [
        "Let's focus on smooth, controlled movement. Down for three counts, then push up powerfully.",
        "I want you to really feel your chest and shoulders working here. Keep that core engaged.",
        "Think about quality over quantity. Each rep should feel deliberate and strong.",
        "Breathe with me - inhale as you lower, exhale as you push up. Find that rhythm.",
        "Perfect! You're maintaining excellent form. Let's keep this steady pace going.",
      ],
    },
    'Squat': {
      CoachPersonality.aggressive: [
        "Drop it low! I want to see that depth - your glutes will thank you later!",
        "Drive through those heels like you're pushing the earth away! Explode up!",
        "No excuses, no shortcuts! Every rep needs to be picture perfect!",
        "Feel that burn in your quads? That's pure strength being forged right now!",
        "Come on! Deeper! I know you've got more range in there - show me!",
      ],
      CoachPersonality.supportive: [
        "Beautiful squat! I love how you're sitting back into your heels - that's textbook form.",
        "You're getting so much stronger! I can see the confidence in your movement.",
        "Take your time with this one. Really feel those glutes working for you.",
        "Wow, your mobility has improved so much! You should be proud of this progress.",
        "Perfect depth! You're building such functional strength with every single rep.",
      ],
      CoachPersonality.steadyPace: [
        "Let's take it slow and controlled. Think about sitting back like you're reaching for a chair.",
        "I want you to pause at the bottom for just a moment, then drive up with power.",
        "Keep that chest proud and eyes forward. Your posture is looking excellent.",
        "Feel your weight distributed evenly across both feet. Nice, stable base.",
        "Excellent rhythm! You're really mastering this movement pattern beautifully.",
      ],
    },
    'Plank': {
      CoachPersonality.aggressive: [
        "Don't you dare break! I can see you shaking, but that's just your core getting bulletproof!",
        "This is what separates the warriors from the quitters! Hold that line!",
        "Your body wants to give up, but your mind is stronger! Prove who's in charge!",
        "Feel that burn? That's weakness melting away! Every second counts!",
        "Mental toughness time! You're building an unbreakable core right now!",
      ],
      CoachPersonality.supportive: [
        "You're holding this beautifully! I can see how much your core strength has improved.",
        "Breathe steadily and trust yourself. You're stronger than you realize.",
        "Every second you hold this is making your entire body more stable and strong.",
        "I'm so impressed with your determination! You're exactly where you need to be.",
        "Remember, it's okay to shake - that's just your muscles working hard for you.",
      ],
      CoachPersonality.steadyPace: [
        "Let's focus on that straight line from head to heels. You've got perfect alignment.",
        "Keep breathing naturally - don't hold your breath. In and out, nice and steady.",
        "Think about pulling your belly button toward your spine. Feel that deep core engagement.",
        "Shoulders right over your wrists, nice and stable. You're nailing this position.",
        "Excellent hold! You're building incredible time under tension for your core.",
      ],
    },
    'Burpee': {
      CoachPersonality.aggressive: [
        "Explosive movement! Hit the deck and bounce back up!",
        "This is where champions are made! Give me everything!",
        "Burpee beast mode! No rest, no mercy, just pure power!",
        "Full body warfare! Attack each rep like it's your last!",
        "Cardio killer! Show this exercise who's boss!",
      ],
      CoachPersonality.supportive: [
        "Great job breaking it down! One movement at a time.",
        "You're conquering one of the toughest exercises! So proud!",
        "Listen to your body. Modify if needed, but keep moving!",
        "Amazing effort! Every burpee makes you stronger and more resilient.",
        "You're pushing your limits! That takes real courage.",
      ],
      CoachPersonality.steadyPace: [
        "Break it into components: squat, plank, push-up, jump.",
        "Maintain control through each phase. No rushing the movement.",
        "Land softly on your jump. Protect those joints.",
        "Consistent rhythm. Find your pace and maintain it.",
        "Quality form over speed. Each burpee should be perfect.",
      ],
    },
    'Lunges': {
      CoachPersonality.aggressive: [
        "Lunge like a warrior! Drive through that front heel!",
        "Power step! Show me explosive leg strength!",
        "No shallow lunges! Go deep and feel the burn!",
        "Switch legs like lightning! Keep that intensity high!",
        "Glutes and quads on fire! That's the sign of a champion!",
      ],
      CoachPersonality.supportive: [
        "Beautiful lunge form! You're really mastering this movement.",
        "Great balance! Your stability is improving with each step.",
        "Love your focus! You're building incredible leg definition.",
        "Perfect depth! You should be proud of your progress.",
        "Excellent control! Your functional strength is growing.",
      ],
      CoachPersonality.steadyPace: [
        "Step out to 90-degree angles in both knees at the bottom.",
        "Keep your torso upright. Don't lean forward during the movement.",
        "Control the descent. Two seconds down, drive up with power.",
        "Even weight distribution. Feel the work in both legs.",
        "Consistent step length. Find your range and maintain it.",
      ],
    },
    'Mountain Climbers': {
      CoachPersonality.aggressive: [
        "Mountain climber machine! Drive those knees like pistons!",
        "Cardio crusher! Keep that heart rate sky high!",
        "No slowing down! Sprint in place like you're running for gold!",
        "Core on fire! This is where mental toughness is built!",
        "Machine-like precision! Every knee drive should be explosive!",
      ],
      CoachPersonality.supportive: [
        "You're doing great! Focus on bringing knees toward your chest.",
        "Wonderful rhythm! You're building amazing cardiovascular fitness.",
        "Keep breathing! This is challenging but you're handling it perfectly.",
        "I love your determination! Your endurance is improving every day.",
        "Strong work! You're building both core strength and cardio fitness.",
      ],
      CoachPersonality.steadyPace: [
        "Maintain plank position in your upper body throughout.",
        "Quick feet, stable shoulders. Keep the movement controlled.",
        "Breathe rhythmically. Match your breathing to your movement pace.",
        "Keep hips level. Don't let them pike up during the movement.",
        "Consistent pace. Find a rhythm you can maintain.",
      ],
    },
  };

  // Breathing instructions with personality variations
  final Map<String, Map<CoachPersonality, List<String>>> _breathingInstructions = {
    'Push-up': {
      CoachPersonality.aggressive: [
        "Breathe like a warrior! Inhale on the way down, explosive exhale up!",
        "Power breathing! Control your breath, control the rep!",
        "Don't hold your breath! Breathe through the challenge!",
      ],
      CoachPersonality.supportive: [
        "Remember to breathe naturally. Inhale as you lower, exhale as you push up.",
        "Your breathing helps you stay calm and focused. Steady in, steady out.",
        "Great breathing pattern! You're staying relaxed even during the challenge.",
      ],
      CoachPersonality.steadyPace: [
        "Inhale on the descent for two counts, exhale on the push for one count.",
        "Breathing creates rhythm. Use it to pace your repetitions.",
        "Never hold your breath. Consistent breathing, consistent reps.",
      ],
    },
    'Squat': {
      CoachPersonality.aggressive: [
        "Big breath in, sit back, explode up with a power exhale!",
        "Breathe deep and squat like you mean it!",
        "Inhale for power, exhale for explosion!",
      ],
      CoachPersonality.supportive: [
        "Take a nice deep breath in as you squat down, breathe out as you stand.",
        "Your breathing keeps you centered and strong throughout the movement.",
        "Beautiful breathing! You're staying calm and controlled.",
      ],
      CoachPersonality.steadyPace: [
        "Inhale at the top, breathe out as you drive through your heels.",
        "Consistent breathing pattern for consistent squat quality.",
        "Use your breath to maintain tempo and control.",
      ],
    },
    'Plank': {
      CoachPersonality.aggressive: [
        "Breathe like a champion! Don't let the burn stop your breathing!",
        "Fight to keep breathing! This is where mental strength is built!",
        "Strong breath, strong plank! Show me your endurance!",
      ],
      CoachPersonality.supportive: [
        "Keep breathing naturally. It helps you stay calm and hold longer.",
        "Your breath is your anchor. Use it to stay present and strong.",
        "Great breathing! You're handling this challenge so well.",
      ],
      CoachPersonality.steadyPace: [
        "Natural breathing rhythm. Don't hold your breath during the hold.",
        "Count your breaths to track time. In for four, out for four.",
        "Breathing maintains your form. Stay relaxed in your breathing.",
      ],
    },
  };

  // Motivational encouragements during sets
  final Map<CoachPersonality, List<String>> _setEncouragement = {
    CoachPersonality.aggressive: [
      "You've got more in you! Push past your limits!",
      "This is where champions are made! Don't quit now!",
      "Feel that burn? That's weakness leaving your body!",
      "No mercy! Show this workout what you're made of!",
      "Beast mode activated! You're unstoppable!",
    ],
    CoachPersonality.supportive: [
      "You're doing so well! I believe in your strength.",
      "Every rep makes you stronger. You should be proud!",
      "You've got this! Trust in your amazing capabilities.",
      "I'm here with you every step. You're not alone in this!",
      "Your effort is inspiring! Keep up that beautiful work.",
    ],
    CoachPersonality.steadyPace: [
      "Steady progress. Each rep builds upon the last.",
      "Focus on quality. Every movement has purpose.",
      "Consistent effort yields consistent results.",
      "Maintain your pace. You're building lasting strength.",
      "Good steady work. Your body is adapting and growing stronger.",
    ],
  };

  String getRandomExerciseScript(String exerciseName, CoachPersonality personality) {
    final scripts = _exerciseScripts[exerciseName]?[personality];
    if (scripts == null || scripts.isEmpty) {
      return _getGenericScript(exerciseName, personality);
    }
    return scripts[_random.nextInt(scripts.length)];
  }

  String getRandomBreathingInstruction(String exerciseName, CoachPersonality personality) {
    final instructions = _breathingInstructions[exerciseName]?[personality];
    if (instructions == null || instructions.isEmpty) {
      return _getGenericBreathingInstruction(exerciseName, personality);
    }
    return instructions[_random.nextInt(instructions.length)];
  }

  String getRandomSetEncouragement(CoachPersonality personality) {
    final encouragements = _setEncouragement[personality] ?? [];
    if (encouragements.isEmpty) {
      return "Keep going! You're doing great!";
    }
    return encouragements[_random.nextInt(encouragements.length)];
  }

  String getWelcomeMessage(String workoutName, int exerciseCount, CoachPersonality personality) {
    switch (personality) {
      case CoachPersonality.aggressive:
        final messages = [
          "Time to demolish $workoutName! We've got $exerciseCount exercises to absolutely crush! No excuses, just pure domination!",
          "Ready to go to war with $workoutName? $exerciseCount exercises are waiting for you to show them who's boss!",
          "Beast mode time! $workoutName with $exerciseCount exercises is about to meet its match - YOU!",
          "Lock and load! $workoutName is your battlefield and these $exerciseCount exercises don't stand a chance!",
        ];
        return messages[_random.nextInt(messages.length)];

      case CoachPersonality.supportive:
        final messages = [
          "Welcome to your $workoutName journey! I'm so excited to guide you through these $exerciseCount exercises. You've got this!",
          "I'm here to support you through every step of $workoutName! These $exerciseCount exercises will help you grow stronger.",
          "You're about to do something amazing with $workoutName! I believe in you through all $exerciseCount exercises.",
          "Ready for a wonderful $workoutName session? Together we'll conquer these $exerciseCount exercises with grace and strength!",
        ];
        return messages[_random.nextInt(messages.length)];

      case CoachPersonality.steadyPace:
        final messages = [
          "Prepared for $workoutName? We have $exerciseCount well-structured exercises ahead. Let's maintain focus and consistency.",
          "Time to begin $workoutName with methodical precision. $exerciseCount exercises await your disciplined approach.",
          "$workoutName is designed for steady progress. Each of these $exerciseCount exercises serves a specific purpose.",
          "Ready for structured $workoutName training? $exerciseCount exercises will build your foundation systematically.",
        ];
        return messages[_random.nextInt(messages.length)];

      default:
        return "Welcome to $workoutName! You have $exerciseCount exercises ahead. Let's make this workout count!";
    }
  }

  String getCompletionMessage(String workoutName, Duration duration, CoachPersonality personality) {
    final minutes = duration.inMinutes;
    
    switch (personality) {
      case CoachPersonality.aggressive:
        final messages = [
          "CRUSHING IT! You just demolished $workoutName in $minutes minutes! That's the spirit of a champion!",
          "BEAST MODE COMPLETE! $workoutName didn't know what hit it! $minutes minutes of pure domination!",
          "VICTORY! You just proved you're unstoppable! $workoutName conquered in $minutes minutes!",
          "LEGENDARY PERFORMANCE! $minutes minutes of absolute commitment to $workoutName! You're a warrior!",
        ];
        return messages[_random.nextInt(messages.length)];

      case CoachPersonality.supportive:
        final messages = [
          "I'm so incredibly proud of you! You completed $workoutName beautifully in $minutes minutes!",
          "You did it! What an amazing effort on $workoutName! $minutes minutes of pure dedication!",
          "Absolutely wonderful! You should feel so proud of finishing $workoutName in $minutes minutes!",
          "You're amazing! That $workoutName completion in $minutes minutes shows your incredible commitment!",
        ];
        return messages[_random.nextInt(messages.length)];

      case CoachPersonality.steadyPace:
        final messages = [
          "Excellent work. $workoutName completed efficiently in $minutes minutes with consistent effort.",
          "Well executed. Your $minutes minute $workoutName session demonstrates steady progress.",
          "Quality completion. $workoutName finished in $minutes minutes with methodical precision.",
          "Strong performance. $minutes minutes of focused work on $workoutName builds lasting fitness.",
        ];
        return messages[_random.nextInt(messages.length)];

      default:
        return "Great job! You completed $workoutName in $minutes minutes!";
    }
  }

  String _getGenericScript(String exerciseName, CoachPersonality personality) {
    switch (personality) {
      case CoachPersonality.aggressive:
        return "Attack that $exerciseName! Show me what you're made of!";
      case CoachPersonality.supportive:
        return "You're doing great with that $exerciseName! Keep up the wonderful work!";
      case CoachPersonality.steadyPace:
        return "Focus on proper $exerciseName form. Quality over speed.";
      default:
        return "Keep going with that $exerciseName!";
    }
  }

  String _getGenericBreathingInstruction(String exerciseName, CoachPersonality personality) {
    switch (personality) {
      case CoachPersonality.aggressive:
        return "Don't forget to breathe during $exerciseName! Power through!";
      case CoachPersonality.supportive:
        return "Remember to breathe naturally during $exerciseName. You're doing great!";
      case CoachPersonality.steadyPace:
        return "Maintain steady breathing throughout your $exerciseName. Rhythm is key.";
      default:
        return "Breathe steadily during $exerciseName.";
    }
  }
}