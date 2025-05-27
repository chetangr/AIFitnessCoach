import 'dart:math';
import '../models/workout.dart';

class ExerciseDatabase {
  static final Random _random = Random();
  
  // Exercise variations and modifiers
  static const List<String> _exerciseModifiers = [
    'Single-Arm', 'Single-Leg', 'Alternating', 'Wide-Grip', 'Close-Grip',
    'Neutral-Grip', 'Reverse-Grip', 'Underhand', 'Overhand', 'Mixed-Grip',
    'Paused', 'Tempo', '1.5 Rep', 'Partial', 'Full Range',
    'Explosive', 'Slow Eccentric', 'Isometric', 'Dynamic', 'Static',
    'Weighted', 'Bodyweight', 'Assisted', 'Unassisted', 'Banded',
    'Cable', 'Machine', 'Dumbbell', 'Barbell', 'Kettlebell',
    'Swiss Ball', 'Bosu Ball', 'TRX', 'Ring', 'Suspension',
    'Incline', 'Decline', 'Flat', 'Seated', 'Standing',
    'Kneeling', 'Lying', 'Prone', 'Supine', 'Side-Lying'
  ];
  
  // Base exercises by category
  static const Map<String, List<String>> _baseExercises = {
    'Chest': [
      'Push-up', 'Bench Press', 'Chest Fly', 'Chest Press', 'Crossover',
      'Pullover', 'Dip', 'Squeeze Press', 'Hex Press', 'Floor Press',
      'Pin Press', 'Spoto Press', 'JM Press', 'Svend Press', 'Plate Press'
    ],
    'Back': [
      'Pull-up', 'Chin-up', 'Dead Hang', 'Active Hang', 'Scapular Pull',
      'Row', 'Lat Pulldown', 'Face Pull', 'Shrug', 'Deadlift',
      'Good Morning', 'Back Extension', 'Reverse Fly', 'Y-Raise', 'T-Raise',
      'High Pull', 'Low Row', 'Pendlay Row', 'Kroc Row', 'Meadows Row'
    ],
    'Shoulders': [
      'Shoulder Press', 'Military Press', 'Push Press', 'Jerk', 'Raise',
      'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Arnold Press', 'Cuban Press',
      'Bradford Press', 'Z Press', 'Bottoms-up Press', 'Landmine Press', 'Viking Press',
      'W-Raise', 'Y-Raise', 'T-Raise', 'L-Raise', 'Complex'
    ],
    'Arms': [
      'Bicep Curl', 'Hammer Curl', 'Preacher Curl', 'Concentration Curl', 'Cable Curl',
      'Drag Curl', 'Spider Curl', 'Zottman Curl', '21s', 'Cheat Curl',
      'Tricep Extension', 'Skull Crusher', 'Kickback', 'Press Down', 'Diamond Push-up',
      'Close-Grip Press', 'Overhead Extension', 'Tate Press', 'JM Press', 'California Press'
    ],
    'Legs': [
      'Squat', 'Lunge', 'Deadlift', 'Leg Press', 'Leg Curl',
      'Leg Extension', 'Calf Raise', 'Step-up', 'Box Jump', 'Jump Squat',
      'Split Squat', 'Bulgarian Split Squat', 'Goblet Squat', 'Front Squat', 'Hack Squat',
      'Pistol Squat', 'Shrimp Squat', 'Sissy Squat', 'Nordic Curl', 'Wall Sit'
    ],
    'Core': [
      'Plank', 'Side Plank', 'Crunch', 'Sit-up', 'Leg Raise',
      'Knee Raise', 'Toe Touch', 'Russian Twist', 'Mountain Climber', 'Dead Bug',
      'Bird Dog', 'Hollow Hold', 'L-Sit', 'V-Up', 'Ab Wheel',
      'Pallof Press', 'Wood Chop', 'Farmer Walk', 'Suitcase Carry', 'Windmill'
    ],
    'Glutes': [
      'Hip Thrust', 'Glute Bridge', 'Hip Extension', 'Kickback', 'Fire Hydrant',
      'Clamshell', 'Side-Lying Abduction', 'Monster Walk', 'Sumo Walk', 'Frog Pump',
      'Single-Leg Bridge', 'Curtsy Lunge', 'Reverse Lunge', 'Walking Lunge', 'Hip Circle',
      'Good Morning', 'Romanian Deadlift', 'Stiff-Leg Deadlift', 'Cable Pull-through', 'Hyperextension'
    ],
    'Full Body': [
      'Burpee', 'Thruster', 'Man Maker', 'Turkish Get-up', 'Clean',
      'Snatch', 'Clean and Press', 'Clean and Jerk', 'Swing', 'Get-up',
      'Bear Crawl', 'Crab Walk', 'Duck Walk', 'Farmer Walk', 'Sled Push',
      'Sled Pull', 'Tire Flip', 'Battle Rope', 'Medicine Ball Slam', 'Wall Ball'
    ],
    'Cardio': [
      'Run', 'Sprint', 'Jog', 'Walk', 'March',
      'High Knees', 'Butt Kicks', 'Jump Rope', 'Double Under', 'Boxing',
      'Shadow Boxing', 'Jumping Jack', 'Star Jump', 'Skater', 'Mountain Climber',
      'Bicycle', 'Row', 'Ski', 'Assault Bike', 'Stair Climb'
    ],
    'Olympic': [
      'Snatch', 'Clean', 'Jerk', 'Clean and Jerk', 'Power Clean',
      'Power Snatch', 'Hang Clean', 'Hang Snatch', 'High Pull', 'Muscle Snatch',
      'Split Jerk', 'Push Jerk', 'Power Jerk', 'Squat Clean', 'Squat Snatch',
      'Clean Pull', 'Snatch Pull', 'Clean Deadlift', 'Snatch Deadlift', 'Front Squat'
    ],
    'Powerlifting': [
      'Squat', 'Bench Press', 'Deadlift', 'Low Bar Squat', 'High Bar Squat',
      'Pause Squat', 'Box Squat', 'Pin Squat', 'Pause Bench', 'Floor Press',
      'Board Press', 'Slingshot Press', 'Conventional Deadlift', 'Sumo Deadlift', 'Deficit Deadlift',
      'Block Pull', 'Rack Pull', 'Romanian Deadlift', 'Good Morning', 'Front Squat'
    ],
    'Calisthenics': [
      'Push-up', 'Pull-up', 'Dip', 'Muscle-up', 'Handstand',
      'Handstand Push-up', 'L-Sit', 'Front Lever', 'Back Lever', 'Planche',
      'Human Flag', 'Dragon Flag', 'Pistol Squat', 'Shrimp Squat', 'Nordic Curl',
      'Archer Push-up', 'Archer Pull-up', 'Typewriter Pull-up', 'Commando Pull-up', 'Clap Push-up'
    ],
    'Stretching': [
      'Hamstring Stretch', 'Quad Stretch', 'Calf Stretch', 'Hip Flexor Stretch', 'Glute Stretch',
      'Chest Stretch', 'Shoulder Stretch', 'Tricep Stretch', 'Bicep Stretch', 'Lat Stretch',
      'Cat-Cow', 'Child\'s Pose', 'Downward Dog', 'Pigeon Pose', 'Butterfly Stretch',
      'Figure 4 Stretch', 'Scorpion Stretch', 'Spinal Twist', 'Side Bend', 'Neck Roll'
    ],
    'Mobility': [
      'Hip Circle', 'Arm Circle', 'Leg Swing', 'Torso Twist', 'Cat-Cow',
      'World\'s Greatest Stretch', '90/90 Hip Stretch', 'Couch Stretch', 'Frog Stretch', 'Deep Squat Hold',
      'Shoulder Dislocate', 'Band Pull-apart', 'Face Pull', 'Wall Slide', 'Scapular Wall Slide',
      'Ankle Circle', 'Calf Raise', 'Toe Walk', 'Heel Walk', 'Duck Walk'
    ],
    'Rehabilitation': [
      'Band Pull-apart', 'External Rotation', 'Internal Rotation', 'Clamshell', 'Bird Dog',
      'Dead Bug', 'Glute Bridge', 'Wall Sit', 'Heel Slide', 'Straight Leg Raise',
      'Quad Set', 'Hamstring Set', 'Ankle Pump', 'Heel Raise', 'Toe Raise',
      'Pendulum', 'Alphabet', 'Towel Stretch', 'Belt Stretch', 'Foam Roll'
    ],
    'Balance': [
      'Single-Leg Stand', 'Single-Leg Deadlift', 'Single-Leg Squat', 'Bosu Squat', 'Balance Board',
      'Stability Ball', 'BOSU Ball', 'Wobble Board', 'Slack Line', 'Tree Pose',
      'Warrior III', 'Bird Dog', 'Half Moon', 'Standing Figure 4', 'Curtsy Lunge',
      'Lateral Lunge', 'Cossack Squat', 'Skater Hop', 'Single-Leg Box Jump', 'Pistol Squat'
    ],
    'Plyometric': [
      'Box Jump', 'Depth Jump', 'Broad Jump', 'Vertical Jump', 'Squat Jump',
      'Lunge Jump', 'Split Jump', 'Tuck Jump', 'Star Jump', 'Burpee',
      'Clap Push-up', 'Medicine Ball Slam', 'Medicine Ball Throw', 'Plyo Push-up', 'Jump Rope',
      'Double Under', 'Triple Under', 'High Knees', 'Butt Kicks', 'Skater'
    ],
    'Agility': [
      'Ladder Drill', 'Cone Drill', 'Shuttle Run', 'T-Drill', '5-10-5',
      'Box Drill', 'Star Drill', 'Zig-Zag', 'Karaoke', 'Backpedal',
      'Side Shuffle', 'Crossover', 'High Knees', 'Butt Kicks', 'A-Skip',
      'B-Skip', 'C-Skip', 'Power Skip', 'Bound', 'Single-Leg Hop'
    ],
    'Pelvic Floor': [
      'Kegel', 'Reverse Kegel', 'Bridge Kegel', 'Standing Kegel', 'Squatting Kegel',
      'Quick Flicks', 'Elevator Kegel', 'Pelvic Tilt', 'Happy Baby', 'Deep Breathing',
      'Transverse Abdominis Breathing', 'Cat-Cow', 'Child\'s Pose', 'Butterfly', 'Clamshell',
      'Side-Lying Leg Lift', 'Bridge', 'Wall Sit', 'Bird Dog', 'Modified Plank'
    ]
  };
  
  // Equipment variations
  static const List<String> _equipment = [
    'Barbell', 'Dumbbell', 'Kettlebell', 'Cable', 'Machine',
    'Band', 'TRX', 'Ring', 'Swiss Ball', 'Medicine Ball',
    'BOSU Ball', 'Balance Board', 'Foam Roller', 'Lacrosse Ball', 'Slam Ball',
    'Wall Ball', 'Battle Rope', 'Sled', 'Tire', 'Chain',
    'Weight Vest', 'Ankle Weight', 'Wrist Weight', 'Sandbag', 'Bulgarian Bag'
  ];
  
  static List<Exercise> generateExercises({required int count}) {
    print('💪 Generating $count individual exercises...');
    final List<Exercise> exercises = [];
    final Set<String> usedNames = {};
    
    // First, add all base exercises
    int id = 0;
    _baseExercises.forEach((category, baseExercises) {
      for (final exercise in baseExercises) {
        if (exercises.length >= count) return;
        
        exercises.add(_createExercise(
          id: 'ex_${id++}',
          name: exercise,
          category: category,
          isBase: true,
        ));
        usedNames.add(exercise);
      }
    });
    
    // Generate variations
    while (exercises.length < count) {
      final category = _baseExercises.keys.elementAt(_random.nextInt(_baseExercises.keys.length));
      final baseExercises = _baseExercises[category]!;
      final baseExercise = baseExercises[_random.nextInt(baseExercises.length)];
      
      // Create variation
      String variation;
      final variationType = _random.nextInt(4);
      
      switch (variationType) {
        case 0: // Add modifier
          final modifier = _exerciseModifiers[_random.nextInt(_exerciseModifiers.length)];
          variation = '$modifier $baseExercise';
          break;
        case 1: // Add equipment
          final equip = _equipment[_random.nextInt(_equipment.length)];
          variation = '$equip $baseExercise';
          break;
        case 2: // Add both
          final modifier = _exerciseModifiers[_random.nextInt(_exerciseModifiers.length)];
          final equip = _equipment[_random.nextInt(_equipment.length)];
          variation = '$modifier $equip $baseExercise';
          break;
        default: // Add position/tempo
          final positions = ['Seated', 'Standing', 'Lying', 'Kneeling', 'Single-Arm', 'Single-Leg', 'Alternating'];
          final position = positions[_random.nextInt(positions.length)];
          variation = '$position $baseExercise';
      }
      
      // Ensure unique
      if (!usedNames.contains(variation)) {
        exercises.add(_createExercise(
          id: 'ex_${id++}',
          name: variation,
          category: category,
          isBase: false,
        ));
        usedNames.add(variation);
        
        if (exercises.length % 1000 == 0) {
          print('✅ Generated ${exercises.length} exercises...');
        }
      }
    }
    
    print('🎉 Successfully generated ${exercises.length} exercises!');
    return exercises;
  }
  
  static Exercise _createExercise({
    required String id,
    required String name,
    required String category,
    required bool isBase,
  }) {
    // Determine muscle groups based on category
    final List<String> muscleGroups = _getMuscleGroups(category);
    
    // Determine equipment from name
    final List<String> equipment = _getEquipmentFromName(name);
    
    // Assign difficulty
    final difficulty = _getDifficultyFromName(name);
    
    // Generate instructions
    final instructions = _generateInstructions(name, category);
    
    // Generate metadata
    final metadata = {
      'category': category,
      'isBase': isBase,
      'sets': _random.nextInt(3) + 2, // 2-4 sets
      'reps': _getRepRange(category),
      'rest': _random.nextInt(60) + 30, // 30-90 seconds
      'tempo': _getTempo(name),
      'rating': 4.0 + _random.nextDouble(), // 4.0-5.0
      'difficulty_score': difficulty.index + 1,
    };
    
    return Exercise(
      id: id,
      name: name,
      description: _generateDescription(name, category, muscleGroups),
      muscleGroups: muscleGroups,
      equipment: equipment,
      difficulty: difficulty,
      instructions: instructions,
      metadata: metadata,
    );
  }
  
  static List<String> _getMuscleGroups(String category) {
    switch (category) {
      case 'Chest':
        return ['Chest', 'Triceps', 'Front Delts'];
      case 'Back':
        return ['Lats', 'Rhomboids', 'Traps', 'Rear Delts', 'Biceps'];
      case 'Shoulders':
        return ['Front Delts', 'Side Delts', 'Rear Delts', 'Traps'];
      case 'Arms':
        return ['Biceps', 'Triceps', 'Forearms'];
      case 'Legs':
        return ['Quads', 'Hamstrings', 'Glutes', 'Calves'];
      case 'Core':
        return ['Abs', 'Obliques', 'Transverse Abdominis', 'Lower Back'];
      case 'Glutes':
        return ['Glutes', 'Hip Flexors', 'Hamstrings'];
      case 'Full Body':
        return ['Full Body'];
      case 'Cardio':
        return ['Cardiovascular System', 'Full Body'];
      case 'Pelvic Floor':
        return ['Pelvic Floor', 'Core', 'Glutes'];
      default:
        return [category];
    }
  }
  
  static List<String> _getEquipmentFromName(String name) {
    final equipment = <String>[];
    
    // Check for equipment in name
    for (final equip in _equipment) {
      if (name.contains(equip)) {
        equipment.add(equip);
      }
    }
    
    // Default to bodyweight if no equipment found
    if (equipment.isEmpty && !name.contains('Cable') && !name.contains('Machine')) {
      equipment.add('Bodyweight');
    }
    
    return equipment;
  }
  
  static WorkoutDifficulty _getDifficultyFromName(String name) {
    // Advanced movements
    if (name.contains('Muscle-up') || name.contains('Planche') || name.contains('Front Lever') ||
        name.contains('Dragon Flag') || name.contains('Pistol') || name.contains('Nordic')) {
      return WorkoutDifficulty.extreme;
    }
    
    // Hard movements
    if (name.contains('Single-Leg') || name.contains('Single-Arm') || name.contains('Jump') ||
        name.contains('Explosive') || name.contains('Olympic') || name.contains('1.5 Rep')) {
      return WorkoutDifficulty.hard;
    }
    
    // Easy movements
    if (name.contains('Assisted') || name.contains('Wall') || name.contains('Modified') ||
        name.contains('Stretch') || name.contains('Hold')) {
      return WorkoutDifficulty.easy;
    }
    
    // Default medium
    return WorkoutDifficulty.medium;
  }
  
  static List<String> _generateInstructions(String name, String category) {
    final instructions = <String>[];
    
    // Setup
    if (name.contains('Barbell') || name.contains('Dumbbell')) {
      instructions.add('Set up with proper weight selection');
    } else if (name.contains('Cable') || name.contains('Machine')) {
      instructions.add('Adjust machine to appropriate settings');
    }
    
    // Starting position
    instructions.add('Get into starting position with proper form');
    
    // Movement
    if (category == 'Pelvic Floor') {
      instructions.add('Engage pelvic floor muscles gently');
      instructions.add('Breathe normally throughout the exercise');
      instructions.add('Avoid holding your breath');
    } else {
      instructions.add('Perform movement with controlled tempo');
      instructions.add('Maintain proper form throughout');
    }
    
    // Focus
    instructions.add('Focus on target muscle engagement');
    
    // Return
    instructions.add('Return to starting position');
    
    return instructions;
  }
  
  static String _getRepRange(String category) {
    switch (category) {
      case 'Powerlifting':
        return '${_random.nextInt(3) + 1}-${_random.nextInt(3) + 3}'; // 1-5
      case 'Olympic':
        return '${_random.nextInt(3) + 1}-${_random.nextInt(2) + 3}'; // 1-4
      case 'Strength':
        return '${_random.nextInt(4) + 3}-${_random.nextInt(3) + 6}'; // 3-8
      case 'Cardio':
      case 'Agility':
        return '${_random.nextInt(20) + 20}-${_random.nextInt(20) + 40}'; // 20-60
      case 'Pelvic Floor':
        return '${_random.nextInt(5) + 8}-${_random.nextInt(5) + 12}'; // 8-15
      default:
        return '${_random.nextInt(5) + 8}-${_random.nextInt(5) + 12}'; // 8-15
    }
  }
  
  static String _getTempo(String name) {
    if (name.contains('Tempo')) {
      return '3-1-2-1'; // 3 sec eccentric, 1 pause, 2 concentric, 1 pause
    } else if (name.contains('Paused')) {
      return '2-2-2-0'; // 2 sec each with pause
    } else if (name.contains('Explosive') || name.contains('Jump') || name.contains('Plyo')) {
      return 'X-0-X-0'; // Explosive
    } else if (name.contains('Slow')) {
      return '4-0-4-0'; // Slow tempo
    }
    return '2-0-2-0'; // Standard tempo
  }
  
  static String _generateDescription(String name, String category, List<String> muscleGroups) {
    final primary = muscleGroups.isNotEmpty ? muscleGroups.first : category;
    final String intensity = name.contains('Explosive') || name.contains('Power') ? 'high-intensity' :
                           name.contains('Slow') || name.contains('Control') ? 'controlled' : 'moderate';
    
    return 'A $intensity $category exercise targeting the $primary';
  }
}