import 'dart:math';
import '../models/workout.dart';
import '../services/exercise_video_service.dart';

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
    
    // Add warmup exercises first (except for yoga/flexibility)
    if (type != WorkoutType.yoga && type != WorkoutType.flexibility) {
      exercises.addAll(_generateWarmupExercises(bodyPart, type));
    }
    
    // Generate main workout exercises
    final exerciseNames = _getExerciseNamesForType(type, bodyPart, equipment);
    
    for (int i = 0; i < exerciseCount; i++) {
      final exerciseName = exerciseNames[_random.nextInt(exerciseNames.length)];
      final videoUrl = ExerciseVideoService.generateVideoUrl(exerciseName);
      final imageUrl = ExerciseVideoService.generateThumbnailUrl(videoUrl);
      
      final exercise = Exercise(
        id: 'ex_${_random.nextInt(10000)}',
        name: exerciseName,
        description: 'Target: $bodyPart',
        muscleGroups: [bodyPart],
        equipment: [equipment],
        difficulty: WorkoutDifficulty.values[_random.nextInt(WorkoutDifficulty.values.length)],
        videoUrl: videoUrl,
        imageUrl: imageUrl,
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
          'duration': ExerciseVideoService.getVideoDuration(exerciseName),
        },
      );
      exercises.add(exercise);
    }
    
    // Add cooldown/stretching exercises at the end
    exercises.addAll(_generateCooldownExercises(bodyPart, type));
    
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
  
  static Exercise _createExerciseWithVideo({
    required String id,
    required String name,
    required String description,
    required List<String> muscleGroups,
    required List<String> equipment,
    required WorkoutDifficulty difficulty,
    required List<String> instructions,
    required Map<String, dynamic> metadata,
  }) {
    final videoUrl = ExerciseVideoService.generateVideoUrl(name);
    return Exercise(
      id: id,
      name: name,
      description: description,
      muscleGroups: muscleGroups,
      equipment: equipment,
      difficulty: difficulty,
      videoUrl: videoUrl,
      imageUrl: ExerciseVideoService.generateThumbnailUrl(videoUrl),
      instructions: instructions,
      metadata: metadata,
    );
  }

  static List<Exercise> _generateWarmupExercises(String bodyPart, WorkoutType type) {
    final List<Exercise> warmupExercises = [];
    
    // General warmup exercises
    final generalWarmups = [
      _createExerciseWithVideo(
        id: 'warmup_${_random.nextInt(1000)}',
        name: 'Light Cardio',
        description: 'Get your heart rate up and blood flowing',
        muscleGroups: ['Full Body'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Start with 2-3 minutes of light jogging in place',
          'Keep movements controlled and comfortable',
          'Gradually increase intensity',
          'Focus on breathing rhythm',
        ],
        metadata: {
          'duration': '3 minutes',
          'intensity': 'Light',
        },
      ),
      _createExerciseWithVideo(
        id: 'warmup_${_random.nextInt(1000)}',
        name: 'Dynamic Arm Circles',
        description: 'Warm up shoulders and upper body',
        muscleGroups: ['Shoulders', 'Arms'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Stand with feet shoulder-width apart',
          'Extend arms to the sides',
          'Make small circles forward for 15 seconds',
          'Reverse direction for 15 seconds',
          'Gradually increase circle size',
        ],
        metadata: {
          'sets': 2,
          'duration': '30 seconds each',
        },
      ),
    ];
    
    // Add general warmup
    warmupExercises.add(generalWarmups[_random.nextInt(generalWarmups.length)]);
    
    // Add body part specific warmups
    if (bodyPart.contains('Upper Body') || bodyPart.contains('Chest') || bodyPart.contains('Back')) {
      warmupExercises.add(Exercise(
        id: 'warmup_${_random.nextInt(1000)}',
        name: 'Band Pull-Aparts',
        description: 'Activate upper back and rear delts',
        muscleGroups: ['Back', 'Shoulders'],
        equipment: ['Resistance Band'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Hold band with arms extended in front',
          'Pull band apart by squeezing shoulder blades',
          'Control the return to starting position',
          'Keep core engaged throughout',
        ],
        metadata: {
          'sets': 2,
          'reps': 15,
          'rest': 30,
        },
      ));
    }
    
    if (bodyPart.contains('Lower Body') || bodyPart.contains('Legs')) {
      warmupExercises.add(Exercise(
        id: 'warmup_${_random.nextInt(1000)}',
        name: 'Leg Swings',
        description: 'Dynamic hip and leg warmup',
        muscleGroups: ['Hips', 'Legs'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Hold onto something for balance',
          'Swing one leg forward and back',
          'Keep movement controlled',
          'Switch legs after 15 swings',
          'Then do side-to-side swings',
        ],
        metadata: {
          'sets': 2,
          'reps': 15,
          'rest': 0,
        },
      ));
    }
    
    if (bodyPart.contains('Core') || bodyPart.contains('Abs')) {
      warmupExercises.add(Exercise(
        id: 'warmup_${_random.nextInt(1000)}',
        name: 'Cat-Cow Stretches',
        description: 'Mobilize spine and activate core',
        muscleGroups: ['Core', 'Back'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Start on hands and knees',
          'Arch back up like a cat',
          'Then drop belly and lift chest',
          'Move slowly between positions',
          'Breathe deeply throughout',
        ],
        metadata: {
          'sets': 2,
          'reps': 10,
          'rest': 0,
        },
      ));
    }
    
    // Add movement-specific warmup
    if (type == WorkoutType.hiit || type == WorkoutType.cardio) {
      warmupExercises.add(Exercise(
        id: 'warmup_${_random.nextInt(1000)}',
        name: 'High Knees to Butt Kicks',
        description: 'Dynamic lower body warmup',
        muscleGroups: ['Legs', 'Cardio'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Start with 30 seconds of high knees',
          'Transition to 30 seconds of butt kicks',
          'Keep core engaged',
          'Land softly on balls of feet',
        ],
        metadata: {
          'sets': 2,
          'duration': '1 minute',
          'rest': 30,
        },
      ));
    }
    
    return warmupExercises;
  }
  
  static List<Exercise> _generateCooldownExercises(String bodyPart, WorkoutType type) {
    final List<Exercise> cooldownExercises = [];
    
    // General cooldown stretches
    cooldownExercises.add(Exercise(
      id: 'cooldown_${_random.nextInt(1000)}',
      name: 'Deep Breathing',
      description: 'Calm your nervous system and lower heart rate',
      muscleGroups: ['Full Body'],
      equipment: ['Bodyweight'],
      difficulty: WorkoutDifficulty.easy,
      instructions: [
        'Sit or lie in a comfortable position',
        'Inhale deeply through nose for 4 counts',
        'Hold for 2 counts',
        'Exhale slowly through mouth for 6 counts',
        'Repeat for 2-3 minutes',
      ],
      metadata: {
        'duration': '3 minutes',
        'sets': 1,
      },
    ));
    
    // Body part specific stretches
    if (bodyPart.contains('Upper Body') || bodyPart.contains('Chest')) {
      cooldownExercises.add(Exercise(
        id: 'cooldown_${_random.nextInt(1000)}',
        name: 'Chest Doorway Stretch',
        description: 'Stretch chest and front shoulders',
        muscleGroups: ['Chest', 'Shoulders'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Stand in doorway with arm at 90 degrees',
          'Place forearm against door frame',
          'Step forward until you feel stretch in chest',
          'Hold for 30 seconds each side',
          'Breathe deeply throughout',
        ],
        metadata: {
          'duration': '30 seconds per side',
          'sets': 2,
        },
      ));
    }
    
    if (bodyPart.contains('Back') || bodyPart.contains('Upper Body')) {
      cooldownExercises.add(Exercise(
        id: 'cooldown_${_random.nextInt(1000)}',
        name: 'Child\'s Pose',
        description: 'Gentle back and shoulder stretch',
        muscleGroups: ['Back', 'Shoulders'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Kneel on floor with knees hip-width apart',
          'Fold forward, extending arms in front',
          'Rest forehead on floor if possible',
          'Hold and breathe deeply',
          'Can walk hands to each side for lat stretch',
        ],
        metadata: {
          'duration': '60 seconds',
          'sets': 1,
        },
      ));
    }
    
    if (bodyPart.contains('Legs') || bodyPart.contains('Lower Body')) {
      cooldownExercises.add(Exercise(
        id: 'cooldown_${_random.nextInt(1000)}',
        name: 'Standing Quad Stretch',
        description: 'Stretch quadriceps and hip flexors',
        muscleGroups: ['Quads', 'Hip Flexors'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Stand on one leg, use wall for balance if needed',
          'Grab opposite foot and pull heel to glutes',
          'Keep knees together',
          'Push hips slightly forward',
          'Hold 30 seconds each leg',
        ],
        metadata: {
          'duration': '30 seconds per leg',
          'sets': 2,
        },
      ));
      
      cooldownExercises.add(Exercise(
        id: 'cooldown_${_random.nextInt(1000)}',
        name: 'Seated Forward Fold',
        description: 'Stretch hamstrings and lower back',
        muscleGroups: ['Hamstrings', 'Back'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Sit with legs extended straight',
          'Hinge at hips and reach for toes',
          'Keep back as straight as possible',
          'Hold where you feel a gentle stretch',
          'Breathe deeply and relax into stretch',
        ],
        metadata: {
          'duration': '45 seconds',
          'sets': 2,
        },
      ));
    }
    
    if (bodyPart.contains('Core') || bodyPart.contains('Abs')) {
      cooldownExercises.add(Exercise(
        id: 'cooldown_${_random.nextInt(1000)}',
        name: 'Cobra Stretch',
        description: 'Stretch abs and hip flexors',
        muscleGroups: ['Abs', 'Hip Flexors'],
        equipment: ['Bodyweight'],
        difficulty: WorkoutDifficulty.easy,
        instructions: [
          'Lie face down with hands under shoulders',
          'Press up, extending arms and arching back',
          'Keep hips on ground',
          'Hold comfortable stretch position',
          'Breathe deeply throughout',
        ],
        metadata: {
          'duration': '30 seconds',
          'sets': 2,
          'rest': 15,
        },
      ));
    }
    
    // Add a final full-body stretch
    cooldownExercises.add(Exercise(
      id: 'cooldown_${_random.nextInt(1000)}',
      name: 'Full Body Stretch',
      description: 'Lengthen entire body',
      muscleGroups: ['Full Body'],
      equipment: ['Bodyweight'],
      difficulty: WorkoutDifficulty.easy,
      instructions: [
        'Lie on back with arms overhead',
        'Point toes and reach fingertips in opposite directions',
        'Create length through entire body',
        'Hold for 20 seconds, then relax',
        'Repeat 2-3 times',
      ],
      metadata: {
        'duration': '20 seconds',
        'sets': 3,
        'rest': 10,
      },
    ));
    
    return cooldownExercises;
  }
}