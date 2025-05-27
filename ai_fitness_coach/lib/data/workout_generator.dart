import 'dart:math';
import '../models/workout.dart';

class WorkoutGenerator {
  static final Random _random = Random();
  
  // Workout name components for generating variety
  static const List<String> _adjectives = [
    'Ultimate', 'Power', 'Intense', 'Dynamic', 'Explosive', 'Core',
    'Total', 'Extreme', 'Advanced', 'Beginner', 'Quick', 'Fast',
    'Strength', 'Cardio', 'HIIT', 'Fusion', 'Athletic', 'Functional',
    'Olympic', 'CrossFit', 'Metabolic', 'Warrior', 'Beast', 'Shred',
    'Lean', 'Muscle', 'Burn', 'Blast', 'Thunder', 'Lightning',
    'Fire', 'Ice', 'Storm', 'Titan', 'Gladiator', 'Spartan',
    'Ninja', 'Samurai', 'Viking', 'Champion', 'Elite', 'Pro'
  ];
  
  static const List<String> _bodyParts = [
    'Full Body', 'Upper Body', 'Lower Body', 'Core', 'Abs', 'Chest',
    'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Biceps',
    'Triceps', 'Quads', 'Hamstrings', 'Calves', 'Delts', 'Lats',
    'Traps', 'Forearms', 'Hip Flexors', 'Obliques', 'Posterior Chain',
    'Pelvic Floor', 'Neck', 'Face', 'Jaw', 'Eyes', 'Breathing'
  ];
  
  static const List<String> _workoutTypes = [
    'Workout', 'Circuit', 'Challenge', 'Crusher', 'Finisher', 'Burner',
    'Builder', 'Destroyer', 'Sculpt', 'Pump', 'Flow',
    'Session', 'Routine', 'Complex',
    'Superset', 'Blast', 'EMOM',
    'AMRAP', 'Tabata', 'Intervals'
  ];
  
  static const List<String> _equipment = [
    'Bodyweight', 'Dumbbell', 'Barbell', 'Kettlebell', 'Resistance Band',
    'TRX', 'Medicine Ball', 'Battle Rope', 'Pull-up Bar', 'Box',
    'Bench', 'Cable', 'Machine', 'Sled', 'Tire', 'Sandbag',
    'Bulgarian Bag', 'Steel Mace', 'Clubbell', 'Parallettes'
  ];
  
  static const List<String> _goals = [
    'Strength Building', 'Fat Loss', 'Muscle Gain', 'Endurance',
    'Flexibility', 'Power', 'Speed', 'Agility', 'Balance',
    'Coordination', 'Mobility', 'Recovery', 'Conditioning',
    'Toning', 'Definition', 'Mass Building', 'Athletic Performance',
    'Functional Fitness', 'Core Stability', 'Injury Prevention',
    'Pelvic Health', 'Posture Improvement', 'Mental Health',
    'Stress Relief', 'Sexual Health', 'Pregnancy Fitness',
    'Post-Pregnancy Recovery', 'Senior Fitness', 'Rehabilitation'
  ];
  
  static const List<String> _emojis = [
    '🔥', '💪', '⚡', '🏃‍♂️', '🏋️‍♀️', '🤸‍♂️', '🧘‍♀️', '🥊',
    '🏊‍♂️', '🚴‍♀️', '⛹️‍♂️', '🤾‍♀️', '🏃‍♀️', '💯', '🎯',
    '⭐', '🚀', '💥', '🌟', '✨', '🏆', '🥇', '💎', '🔱'
  ];

  static List<WorkoutPlan> generateWorkouts({required int count}) {
    print('🏋️ Generating $count workouts...');
    final List<WorkoutPlan> workouts = [];
    
    // First, ensure we create specific Kegel and pelvic floor workouts
    final specialWorkouts = _generateSpecialWorkouts();
    workouts.addAll(specialWorkouts);
    print('✅ Added ${specialWorkouts.length} special workouts (Kegels, etc.)');
    
    // Generate the remaining workouts
    final remainingCount = count - specialWorkouts.length;
    
    for (int i = 0; i < remainingCount; i++) {
      final workoutType = WorkoutType.values[_random.nextInt(WorkoutType.values.length)];
      final difficulty = WorkoutDifficulty.values[_random.nextInt(WorkoutDifficulty.values.length)];
      final bodyPart = _bodyParts[_random.nextInt(_bodyParts.length)];
      final equipment = _equipment[_random.nextInt(_equipment.length)];
      final goal = _goals[_random.nextInt(_goals.length)];
      
      // Generate creative workout names
      final nameFormat = _random.nextInt(6);
      String name;
      switch (nameFormat) {
        case 0:
          name = '${_adjectives[_random.nextInt(_adjectives.length)]} $bodyPart ${_workoutTypes[_random.nextInt(_workoutTypes.length)]}';
          break;
        case 1:
          name = '$equipment ${_adjectives[_random.nextInt(_adjectives.length)]} ${_workoutTypes[_random.nextInt(_workoutTypes.length)]}';
          break;
        case 2:
          name = '${_adjectives[_random.nextInt(_adjectives.length)]} ${workoutType.name.toUpperCase()} ${_workoutTypes[_random.nextInt(_workoutTypes.length)]}';
          break;
        case 3:
          name = '$bodyPart ${_workoutTypes[_random.nextInt(_workoutTypes.length)]} ${_random.nextInt(100) + 1}';
          break;
        case 4:
          name = '${_adjectives[_random.nextInt(_adjectives.length)]} ${_adjectives[_random.nextInt(_adjectives.length)]} ${_workoutTypes[_random.nextInt(_workoutTypes.length)]}';
          break;
        default:
          // Special themed workouts
          if (bodyPart == 'Pelvic Floor') {
            name = 'Kegel ${_adjectives[_random.nextInt(_adjectives.length)]} ${_workoutTypes[_random.nextInt(_workoutTypes.length)]}';
          } else {
            name = '${_adjectives[_random.nextInt(_adjectives.length)]} $bodyPart ${_workoutTypes[_random.nextInt(_workoutTypes.length)]}';
          }
      }
      
      // Add emoji occasionally
      if (_random.nextBool()) {
        name += ' ${_emojis[_random.nextInt(_emojis.length)]}';
      }
      
      final duration = '${_random.nextInt(45) + 15} MIN';
      final calories = '${(_random.nextInt(400) + 200)} Cal';
      
      final workout = WorkoutPlan(
        id: 'generated_${specialWorkouts.length + i + 1}',
        name: name,
        description: '$equipment • $goal',
        duration: duration,
        calories: calories,
        difficulty: difficulty,
        type: workoutType,
        imagePath: '', // No images for generated workouts
        isCompleted: false,
        scheduledFor: DateTime.now().add(Duration(days: _random.nextInt(30))),
        exercises: _generateExercises(workoutType, bodyPart, equipment),
        metadata: {
          'bodyPart': bodyPart,
          'equipment': equipment,
          'goal': goal,
          'rating': 3.5 + _random.nextDouble() * 1.5, // 3.5 to 5.0
          'completions': _random.nextInt(10000),
          'likes': _random.nextInt(5000),
        },
      );
      
      workouts.add(workout);
      
      // Log progress every 1000 workouts
      if ((i + 1) % 1000 == 0) {
        print('✅ Generated ${specialWorkouts.length + i + 1} workouts...');
      }
    }
    
    print('🎉 Successfully generated ${workouts.length} workouts!');
    return workouts;
  }

  static List<WorkoutPlan> _generateSpecialWorkouts() {
    final List<WorkoutPlan> specialWorkouts = [];
    
    // Kegel and Pelvic Floor workouts
    final kegelWorkouts = [
      'Kegel Power Workout 💪',
      'Pelvic Floor Strengthening',
      'Ultimate Kegel Challenge',
      'Core Kegel Fusion',
      'Pregnancy Kegel Routine',
      'Post-Birth Recovery Kegels',
      'Advanced Pelvic Floor Training',
      'Beginner Kegel Series',
      'Kegel & Core Combo',
      'Daily Kegel Maintenance',
    ];
    
    for (int i = 0; i < kegelWorkouts.length; i++) {
      final workout = WorkoutPlan(
        id: 'kegel_$i',
        name: kegelWorkouts[i],
        description: 'Bodyweight • Pelvic Health',
        duration: '${15 + (i % 3) * 10} MIN',
        calories: '${50 + (i % 4) * 25} Cal',
        difficulty: WorkoutDifficulty.values[i % WorkoutDifficulty.values.length],
        type: WorkoutType.flexibility,
        imagePath: '',
        isCompleted: false,
        scheduledFor: DateTime.now().add(Duration(days: i)),
        exercises: _generateKegelExercises(),
        metadata: {
          'bodyPart': 'Pelvic Floor',
          'equipment': 'Bodyweight',
          'goal': 'Pelvic Health',
          'rating': 4.2 + (_random.nextDouble() * 0.6),
          'completions': 500 + _random.nextInt(2000),
          'likes': 200 + _random.nextInt(800),
        },
      );
      specialWorkouts.add(workout);
    }
    
    return specialWorkouts;
  }

  static List<Exercise> _generateKegelExercises() {
    final exercises = [
      Exercise(
        id: 'kegel_1',
        name: 'Basic Kegel Contractions',
        description: 'Fundamental pelvic floor strengthening',
        muscleGroups: ['Pelvic Floor'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Lie comfortably with knees bent',
          'Breathe in and relax pelvic floor muscles',
          'Breathe out and gently lift pelvic floor',
          'Hold for 3-5 seconds',
          'Slowly release and repeat'
        ],
        metadata: {'sets': 3, 'reps': 15, 'rest': 30},
      ),
      Exercise(
        id: 'kegel_2',
        name: 'Pelvic Floor Pulses',
        description: 'Quick contractions for muscle activation',
        muscleGroups: ['Pelvic Floor'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.medium,
        instructions: [
          'Find comfortable seated position',
          'Perform quick pelvic floor contractions',
          'Release immediately after each pulse',
          'Focus on quality over speed'
        ],
        metadata: {'sets': 2, 'reps': 20, 'rest': 45},
      ),
      Exercise(
        id: 'kegel_3',
        name: 'Bridge with Kegels',
        description: 'Combined glute and pelvic floor strengthening',
        muscleGroups: ['Pelvic Floor', 'Glutes', 'Core'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.medium,
        instructions: [
          'Lie on back with knees bent',
          'Lift hips into bridge position',
          'Perform Kegel contraction while holding bridge',
          'Lower slowly while maintaining pelvic floor engagement'
        ],
        metadata: {'sets': 3, 'reps': 12, 'rest': 60},
      ),
    ];
    
    return exercises;
  }
  
  static List<Exercise> _generateExercises(WorkoutType type, String bodyPart, String equipment) {
    final exerciseCount = _random.nextInt(8) + 5; // 5-12 exercises
    final List<Exercise> exercises = [];
    
    final exerciseNames = _getExerciseNamesForType(type, bodyPart, equipment);
    
    for (int i = 0; i < exerciseCount; i++) {
      final exercise = Exercise(
        id: 'ex_${_random.nextInt(10000)}',
        name: exerciseNames[_random.nextInt(exerciseNames.length)],
        description: 'Target: $bodyPart',
        muscleGroups: [bodyPart],
        equipment: [equipment],
        difficulty: WorkoutDifficulty.values[_random.nextInt(WorkoutDifficulty.values.length)],
        instructions: [
          'Maintain proper form throughout',
          'Control the movement',
          'Breathe steadily',
          'Focus on the target muscle',
        ],
        metadata: {
          'sets': _random.nextInt(3) + 3, // 3-5 sets
          'reps': _random.nextInt(12) + 8, // 8-20 reps
          'rest': _random.nextInt(60) + 30, // 30-90 seconds rest
        },
      );
      exercises.add(exercise);
    }
    
    return exercises;
  }
  
  static List<String> _getExerciseNamesForType(WorkoutType type, String bodyPart, String equipment) {
    // Generate context-appropriate exercise names with specific exercises
    final baseExercises = <String>[];
    
    // Add specific exercises based on body part
    if (bodyPart.contains('Pelvic Floor')) {
      baseExercises.addAll([
        'Kegel Exercises', 'Pelvic Tilts', 'Bridge Pose', 'Deep Breathing',
        'Pelvic Floor Contractions', 'Transverse Abdominis Activation',
        'Bird Dog', 'Dead Bug', 'Modified Planks', 'Glute Bridges'
      ]);
    }
    
    if (bodyPart.contains('Core')) {
      baseExercises.addAll([
        'Planks', 'Side Planks', 'Hollow Body Holds', 'L-Sits', 'Dead Hangs',
        'Hanging Leg Raises', 'Toes to Bar', 'Ab Wheel', 'Russian Twists',
        'Mountain Climbers', 'Bird Dog', 'Dead Bug', 'Pallof Press',
        'Cable Crunches', 'V-Ups', 'Flutter Kicks', 'Turkish Get-ups'
      ]);
    }
    
    if (bodyPart.contains('Full Body')) {
      baseExercises.addAll([
        'Burpees', 'Turkish Get-ups', 'Thrusters', 'Clean and Press',
        'Man Makers', 'Bear Crawls', 'Mountain Climbers'
      ]);
    }
    
    if (bodyPart.contains('Upper Body')) {
      baseExercises.addAll([
        'Push-ups', 'Pull-ups', 'Dead Hangs', 'Active Hangs', 'Chest Press', 'Shoulder Press',
        'Bent-over Rows', 'Lat Pulldowns', 'Dips', 'Face Pulls', 'Muscle-ups',
        'Chin-ups', 'Inverted Rows', 'Ring Dips', 'Archer Push-ups', 'Handstand Push-ups'
      ]);
    }
    
    if (bodyPart.contains('Lower Body')) {
      baseExercises.addAll([
        'Squats', 'Lunges', 'Deadlifts', 'Hip Thrusts', 'Step-ups',
        'Bulgarian Split Squats', 'Calf Raises', 'Glute Bridges'
      ]);
    }
    
    // Add specific body part exercises
    if (bodyPart.contains('Back')) {
      baseExercises.addAll([
        'Dead Hangs', 'Pull-ups', 'Chin-ups', 'Lat Pulldowns', 'Barbell Rows',
        'T-Bar Rows', 'Cable Rows', 'Face Pulls', 'Deadlifts', 'Rack Pulls',
        'Pendlay Rows', 'Kroc Rows', 'Seal Rows', 'Inverted Rows', 'Shrugs'
      ]);
    }
    
    if (bodyPart.contains('Chest')) {
      baseExercises.addAll([
        'Push-ups', 'Bench Press', 'Incline Press', 'Decline Press', 'Dumbbell Flyes',
        'Cable Crossovers', 'Chest Dips', 'Pec Deck', 'Diamond Push-ups',
        'Wide-Grip Push-ups', 'Archer Push-ups', 'Plyometric Push-ups'
      ]);
    }
    
    if (bodyPart.contains('Shoulders')) {
      baseExercises.addAll([
        'Shoulder Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes',
        'Arnold Press', 'Upright Rows', 'Face Pulls', 'Bradford Press',
        'Cuban Press', 'Y-Raises', 'W-Raises', 'Handstand Push-ups'
      ]);
    }
    
    if (bodyPart.contains('Arms')) {
      baseExercises.addAll([
        'Bicep Curls', 'Hammer Curls', 'Preacher Curls', 'Cable Curls', '21s',
        'Tricep Extensions', 'Skull Crushers', 'Tricep Dips', 'Close-Grip Press',
        'Diamond Push-ups', 'Concentration Curls', 'Overhead Press', 'JM Press'
      ]);
    }
    
    if (bodyPart.contains('Legs')) {
      baseExercises.addAll([
        'Squats', 'Front Squats', 'Goblet Squats', 'Bulgarian Split Squats',
        'Lunges', 'Walking Lunges', 'Reverse Lunges', 'Romanian Deadlifts',
        'Leg Press', 'Leg Curls', 'Leg Extensions', 'Calf Raises',
        'Box Jumps', 'Jump Squats', 'Pistol Squats', 'Nordic Curls'
      ]);
    }
    
    if (bodyPart.contains('Abs')) {
      baseExercises.addAll([
        'Planks', 'Side Planks', 'Hollow Body Holds', 'L-Sits', 'Dead Hangs',
        'Hanging Leg Raises', 'Toes to Bar', 'Ab Wheel', 'Russian Twists',
        'Mountain Climbers', 'Dragon Flags', 'V-Ups', 'Cable Crunches'
      ]);
    }
    
    // Add type-specific exercises
    switch (type) {
      case WorkoutType.strength:
        baseExercises.addAll([
          '$equipment Press', '$equipment Row', '$equipment Squat',
          '$equipment Deadlift', '$equipment Curl', '$equipment Extension',
          'Compound Lifts', 'Progressive Overload Sets'
        ]);
        break;
      case WorkoutType.cardio:
        baseExercises.addAll([
          'High Knees', 'Jumping Jacks', 'Sprint Intervals', 'Box Jumps',
          'Star Jumps', 'Lateral Shuffles', 'Butt Kickers', 'Jump Rope'
        ]);
        break;
      case WorkoutType.hiit:
        baseExercises.addAll([
          'Battle Rope Waves', 'Kettlebell Swings', 'Box Jump Burpees',
          'Medicine Ball Slams', 'Plyo Push-ups', 'Jump Squats',
          'High-Intensity Intervals', 'Tabata Sets'
        ]);
        break;
      case WorkoutType.yoga:
        baseExercises.addAll([
          'Downward Dog', 'Warrior I', 'Warrior II', 'Tree Pose',
          'Child\'s Pose', 'Cobra Pose', 'Cat-Cow Stretch', 'Sun Salutation'
        ]);
        break;
      case WorkoutType.flexibility:
        baseExercises.addAll([
          'Dynamic Stretching', 'Static Holds', 'PNF Stretching',
          'Foam Rolling', 'Mobility Flows', 'Joint Circles'
        ]);
        break;
      default:
        baseExercises.addAll([
          'Functional Movements', 'Compound Exercises', 'Isolation Work',
          'Bodyweight Exercises', 'Resistance Training'
        ]);
    }
    
    return baseExercises.isNotEmpty ? baseExercises : [
      '$equipment Exercise', '$bodyPart Movement', 'Functional Exercise'
    ];
  }
}