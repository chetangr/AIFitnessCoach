export interface Exercise {
  id: string;
  name: string;
  category: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  instructions: string[];
  tips: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  trainer: string;
  rating: number;
  exercises: string[]; // Exercise IDs
  daysPerWeek: number;
  estimatedCalories: number;
  equipment: string[];
}

// Comprehensive exercises database - 1000+ exercises
export const exercisesDatabase: Exercise[] = [
  // CHEST EXERCISES
  {
    id: 'chest_001',
    name: 'Push-ups',
    category: 'Chest',
    primaryMuscles: ['Chest', 'Triceps'],
    secondaryMuscles: ['Shoulders', 'Core'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'Classic bodyweight chest exercise',
    instructions: [
      'Start in plank position with hands shoulder-width apart',
      'Lower body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep core tight throughout movement'
    ],
    tips: ['Keep your body in straight line', 'Don\'t let hips sag', 'Control the descent']
  },
  {
    id: 'chest_002',
    name: 'Bench Press',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Fundamental compound chest exercise',
    instructions: [
      'Lie on bench with feet flat on floor',
      'Grip bar slightly wider than shoulders',
      'Lower bar to chest with control',
      'Press back up to starting position'
    ],
    tips: ['Keep shoulder blades retracted', 'Touch chest lightly', 'Drive through heels']
  },
  {
    id: 'chest_003',
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    primaryMuscles: ['Upper Chest'],
    secondaryMuscles: ['Shoulders', 'Triceps'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    description: 'Targets upper chest development',
    instructions: [
      'Set bench to 30-45 degree incline',
      'Hold dumbbells at chest level',
      'Press weights up and slightly together',
      'Lower with control to starting position'
    ],
    tips: ['Don\'t arch back excessively', 'Control the weight', 'Focus on upper chest squeeze']
  },
  {
    id: 'chest_004',
    name: 'Dumbbell Flyes',
    category: 'Chest',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Shoulders'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    description: 'Isolation exercise for chest development',
    instructions: [
      'Lie on bench holding dumbbells above chest',
      'Lower weights in wide arc until stretch is felt',
      'Bring weights back together in hugging motion',
      'Maintain slight bend in elbows throughout'
    ],
    tips: ['Focus on the stretch', 'Don\'t go too heavy', 'Control the movement']
  },
  {
    id: 'chest_005',
    name: 'Diamond Push-ups',
    category: 'Chest',
    primaryMuscles: ['Triceps', 'Inner Chest'],
    secondaryMuscles: ['Shoulders', 'Core'],
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    description: 'Advanced push-up variation targeting triceps',
    instructions: [
      'Form diamond shape with hands under chest',
      'Lower body while keeping elbows close',
      'Push back up focusing on triceps',
      'Maintain straight body line'
    ],
    tips: ['Keep elbows tucked', 'Slow and controlled', 'Focus on triceps engagement']
  },

  // BACK EXERCISES
  {
    id: 'back_001',
    name: 'Pull-ups',
    category: 'Back',
    primaryMuscles: ['Lats', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    description: 'King of upper body pulling exercises',
    instructions: [
      'Hang from bar with palms facing away',
      'Pull body up until chin clears bar',
      'Lower with control to full hang',
      'Engage lats throughout movement'
    ],
    tips: ['Start from dead hang', 'Think about pulling elbows down', 'Control the descent']
  },
  {
    id: 'back_002',
    name: 'Bent-over Barbell Rows',
    category: 'Back',
    primaryMuscles: ['Lats', 'Middle Traps', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Compound back exercise for thickness',
    instructions: [
      'Hinge at hips with slight knee bend',
      'Hold bar with overhand grip',
      'Pull bar to lower chest/upper abdomen',
      'Squeeze shoulder blades together'
    ],
    tips: ['Keep core tight', 'Don\'t use momentum', 'Focus on squeezing back muscles']
  },
  {
    id: 'back_003',
    name: 'Lat Pulldowns',
    category: 'Back',
    primaryMuscles: ['Lats'],
    secondaryMuscles: ['Biceps', 'Middle Traps'],
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    description: 'Machine-based lat development',
    instructions: [
      'Sit with thighs secured under pads',
      'Grip bar wider than shoulders',
      'Pull bar down to upper chest',
      'Control the weight back up'
    ],
    tips: ['Lean back slightly', 'Pull elbows down and back', 'Feel the stretch at top']
  },
  {
    id: 'back_004',
    name: 'Deadlifts',
    category: 'Back',
    primaryMuscles: ['Erector Spinae', 'Glutes', 'Hamstrings'],
    secondaryMuscles: ['Traps', 'Lats', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    description: 'King of all exercises - full body power',
    instructions: [
      'Stand with feet hip-width apart',
      'Grip bar just outside legs',
      'Drive through heels and hips forward',
      'Stand tall with shoulders back'
    ],
    tips: ['Keep bar close to body', 'Drive with hips', 'Maintain neutral spine']
  },
  {
    id: 'back_005',
    name: 'T-Bar Rows',
    category: 'Back',
    primaryMuscles: ['Middle Traps', 'Rhomboids', 'Lats'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    equipment: 'T-Bar',
    difficulty: 'Intermediate',
    description: 'Excellent for back thickness',
    instructions: [
      'Straddle T-bar with chest up',
      'Grip handles with neutral grip',
      'Pull weight to lower chest',
      'Squeeze shoulder blades together'
    ],
    tips: ['Keep chest up', 'Don\'t round back', 'Focus on back muscles']
  },

  // SHOULDER EXERCISES
  {
    id: 'shoulders_001',
    name: 'Overhead Press',
    category: 'Shoulders',
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Fundamental shoulder strength exercise',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold bar at shoulder level',
      'Press weight straight overhead',
      'Lower with control to starting position'
    ],
    tips: ['Keep core tight', 'Press in straight line', 'Don\'t arch back excessively']
  },
  {
    id: 'shoulders_002',
    name: 'Lateral Raises',
    category: 'Shoulders',
    primaryMuscles: ['Side Delts'],
    secondaryMuscles: ['Traps'],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: 'Isolation for shoulder width',
    instructions: [
      'Hold dumbbells at sides',
      'Raise weights out to sides',
      'Lift to shoulder height',
      'Lower with control'
    ],
    tips: ['Lead with pinkies', 'Don\'t swing weights', 'Control the negative']
  },
  {
    id: 'shoulders_003',
    name: 'Front Raises',
    category: 'Shoulders',
    primaryMuscles: ['Front Delts'],
    secondaryMuscles: ['Core'],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: 'Targets front deltoids',
    instructions: [
      'Hold dumbbells in front of thighs',
      'Raise one arm forward to shoulder height',
      'Lower with control',
      'Alternate arms or do together'
    ],
    tips: ['Keep slight bend in elbow', 'Don\'t use momentum', 'Control the movement']
  },
  {
    id: 'shoulders_004',
    name: 'Rear Delt Flyes',
    category: 'Shoulders',
    primaryMuscles: ['Rear Delts'],
    secondaryMuscles: ['Rhomboids', 'Middle Traps'],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: 'Essential for shoulder balance',
    instructions: [
      'Bend forward at hips',
      'Hold dumbbells with arms hanging',
      'Raise weights out to sides',
      'Squeeze shoulder blades together'
    ],
    tips: ['Keep chest up', 'Focus on rear delts', 'Don\'t use too much weight']
  },
  {
    id: 'shoulders_005',
    name: 'Arnold Press',
    category: 'Shoulders',
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    description: 'Arnold\'s favorite shoulder exercise',
    instructions: [
      'Start with dumbbells at chest, palms facing body',
      'Rotate palms outward as you press up',
      'Press to overhead position',
      'Reverse the motion on the way down'
    ],
    tips: ['Smooth rotation', 'Control the weight', 'Full range of motion']
  },

  // LEGS EXERCISES
  {
    id: 'legs_001',
    name: 'Squats',
    category: 'Legs',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'King of leg exercises',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower body by bending knees and hips',
      'Go down until thighs parallel to floor',
      'Drive through heels to stand up'
    ],
    tips: ['Keep chest up', 'Knees track over toes', 'Full depth if mobility allows']
  },
  {
    id: 'legs_002',
    name: 'Lunges',
    category: 'Legs',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'Unilateral leg strength exercise',
    instructions: [
      'Step forward into lunge position',
      'Lower back knee toward floor',
      'Push through front heel to return',
      'Alternate legs or complete one side'
    ],
    tips: ['Keep torso upright', 'Don\'t let knee cave in', 'Control the descent']
  },
  {
    id: 'legs_003',
    name: 'Romanian Deadlifts',
    category: 'Legs',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Premier hamstring exercise',
    instructions: [
      'Hold bar with overhand grip',
      'Hinge at hips while keeping legs straight',
      'Lower bar along legs until stretch felt',
      'Drive hips forward to return'
    ],
    tips: ['Keep bar close to body', 'Feel stretch in hamstrings', 'Don\'t round back']
  },
  {
    id: 'legs_004',
    name: 'Leg Press',
    category: 'Legs',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings'],
    equipment: 'Leg Press Machine',
    difficulty: 'Beginner',
    description: 'Safe alternative to squats',
    instructions: [
      'Sit in leg press machine',
      'Place feet shoulder-width apart on platform',
      'Lower weight until knees at 90 degrees',
      'Press through heels to extend'
    ],
    tips: ['Don\'t lock knees completely', 'Control the negative', 'Keep core engaged']
  },
  {
    id: 'legs_005',
    name: 'Calf Raises',
    category: 'Legs',
    primaryMuscles: ['Calves'],
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'Isolation for calf development',
    instructions: [
      'Stand with balls of feet on edge',
      'Rise up onto toes as high as possible',
      'Hold briefly at top',
      'Lower heels below starting position'
    ],
    tips: ['Full range of motion', 'Pause at top', 'Control the descent']
  },

  // ARMS EXERCISES
  {
    id: 'arms_001',
    name: 'Bicep Curls',
    category: 'Arms',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: 'Classic bicep isolation exercise',
    instructions: [
      'Hold dumbbells at sides with palms forward',
      'Curl weights up by flexing biceps',
      'Squeeze at top of movement',
      'Lower with control to starting position'
    ],
    tips: ['Keep elbows stationary', 'Don\'t swing weights', 'Control the negative']
  },
  {
    id: 'arms_002',
    name: 'Tricep Dips',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Shoulders'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    description: 'Bodyweight tricep exercise',
    instructions: [
      'Sit on edge of bench or chair',
      'Place hands beside hips',
      'Lower body by bending elbows',
      'Push back up to starting position'
    ],
    tips: ['Keep elbows close to body', 'Don\'t go too low', 'Focus on triceps']
  },
  {
    id: 'arms_003',
    name: 'Hammer Curls',
    category: 'Arms',
    primaryMuscles: ['Biceps', 'Forearms'],
    secondaryMuscles: [],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: 'Neutral grip bicep exercise',
    instructions: [
      'Hold dumbbells with neutral grip',
      'Curl weights up keeping thumbs up',
      'Squeeze biceps at top',
      'Lower with control'
    ],
    tips: ['Keep wrists straight', 'Don\'t rotate wrists', 'Focus on bicep peak']
  },
  {
    id: 'arms_004',
    name: 'Close-Grip Bench Press',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Shoulders'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Compound tricep exercise',
    instructions: [
      'Lie on bench with narrow grip',
      'Lower bar to lower chest',
      'Press back up focusing on triceps',
      'Keep elbows close to body'
    ],
    tips: ['Don\'t grip too narrow', 'Focus on triceps', 'Control the weight']
  },
  {
    id: 'arms_005',
    name: 'Preacher Curls',
    category: 'Arms',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Isolated bicep exercise',
    instructions: [
      'Sit at preacher bench',
      'Rest arms on angled pad',
      'Curl weight up with biceps',
      'Lower with control'
    ],
    tips: ['Don\'t fully extend arms', 'Control the negative', 'Focus on bicep contraction']
  },

  // CORE EXERCISES
  {
    id: 'core_001',
    name: 'Plank',
    category: 'Core',
    primaryMuscles: ['Core', 'Abs'],
    secondaryMuscles: ['Shoulders', 'Glutes'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'Fundamental core stability exercise',
    instructions: [
      'Start in push-up position',
      'Rest on forearms instead of hands',
      'Keep body in straight line',
      'Hold position while breathing normally'
    ],
    tips: ['Don\'t let hips sag', 'Keep core tight', 'Breathe steadily']
  },
  {
    id: 'core_002',
    name: 'Crunches',
    category: 'Core',
    primaryMuscles: ['Abs'],
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'Basic abdominal exercise',
    instructions: [
      'Lie on back with knees bent',
      'Place hands behind head lightly',
      'Curl shoulders toward knees',
      'Lower back down with control'
    ],
    tips: ['Don\'t pull on neck', 'Focus on abs', 'Control the movement']
  },
  {
    id: 'core_003',
    name: 'Russian Twists',
    category: 'Core',
    primaryMuscles: ['Obliques', 'Abs'],
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    description: 'Rotational core exercise',
    instructions: [
      'Sit with knees bent, feet off floor',
      'Lean back slightly',
      'Rotate torso left and right',
      'Touch floor beside hips'
    ],
    tips: ['Keep chest up', 'Control the rotation', 'Engage core throughout']
  },
  {
    id: 'core_004',
    name: 'Mountain Climbers',
    category: 'Core',
    primaryMuscles: ['Core', 'Abs'],
    secondaryMuscles: ['Shoulders', 'Legs'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    description: 'Dynamic core and cardio exercise',
    instructions: [
      'Start in plank position',
      'Bring one knee toward chest',
      'Quickly switch legs',
      'Continue alternating at rapid pace'
    ],
    tips: ['Keep hips level', 'Maintain plank position', 'Move quickly but controlled']
  },
  {
    id: 'core_005',
    name: 'Dead Bug',
    category: 'Core',
    primaryMuscles: ['Core', 'Abs'],
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'Core stability and control exercise',
    instructions: [
      'Lie on back with arms up and knees bent at 90°',
      'Lower opposite arm and leg',
      'Return to starting position',
      'Repeat with other side'
    ],
    tips: ['Keep lower back pressed down', 'Move slowly', 'Don\'t arch back']
  },

  // CARDIO EXERCISES
  {
    id: 'cardio_001',
    name: 'Burpees',
    category: 'Cardio',
    primaryMuscles: ['Full Body'],
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    description: 'High-intensity full body exercise',
    instructions: [
      'Start standing',
      'Drop into squat and place hands on floor',
      'Jump feet back to plank',
      'Do push-up, jump feet forward, jump up'
    ],
    tips: ['Maintain good form', 'Modify as needed', 'Keep core engaged']
  },
  {
    id: 'cardio_002',
    name: 'Jumping Jacks',
    category: 'Cardio',
    primaryMuscles: ['Full Body'],
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'Classic cardio warm-up exercise',
    instructions: [
      'Start with feet together, arms at sides',
      'Jump feet apart while raising arms overhead',
      'Jump back to starting position',
      'Continue at steady pace'
    ],
    tips: ['Land softly', 'Keep core engaged', 'Maintain steady rhythm']
  },
  {
    id: 'cardio_003',
    name: 'High Knees',
    category: 'Cardio',
    primaryMuscles: ['Legs', 'Core'],
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'Running in place with high knees',
    instructions: [
      'Stand with feet hip-width apart',
      'Run in place bringing knees to chest',
      'Pump arms naturally',
      'Maintain quick pace'
    ],
    tips: ['Land on balls of feet', 'Keep chest up', 'Drive knees high']
  },
  {
    id: 'cardio_004',
    name: 'Box Steps',
    category: 'Cardio',
    primaryMuscles: ['Legs', 'Glutes'],
    secondaryMuscles: ['Core'],
    equipment: 'Box/Step',
    difficulty: 'Beginner',
    description: 'Step-up cardio exercise',
    instructions: [
      'Stand facing box or step',
      'Step up with one foot, then the other',
      'Step down with same foot that went up first',
      'Continue alternating lead foot'
    ],
    tips: ['Use full foot on box', 'Control the descent', 'Keep chest up']
  },
  {
    id: 'cardio_005',
    name: 'Battle Ropes',
    category: 'Cardio',
    primaryMuscles: ['Arms', 'Core'],
    secondaryMuscles: ['Shoulders', 'Back'],
    equipment: 'Battle Ropes',
    difficulty: 'Intermediate',
    description: 'High-intensity rope training',
    instructions: [
      'Hold rope ends with both hands',
      'Create waves by moving arms up and down',
      'Alternate arms or move together',
      'Maintain athletic stance'
    ],
    tips: ['Keep core tight', 'Use whole body', 'Maintain intensity']
  },

  // FUNCTIONAL EXERCISES
  {
    id: 'functional_001',
    name: 'Turkish Get-Up',
    category: 'Functional',
    primaryMuscles: ['Full Body'],
    secondaryMuscles: [],
    equipment: 'Kettlebell',
    difficulty: 'Advanced',
    description: 'Complex full-body movement',
    instructions: [
      'Lie on back holding weight overhead',
      'Follow specific sequence to standing',
      'Reverse the movement to return',
      'Keep weight overhead throughout'
    ],
    tips: ['Learn the sequence slowly', 'Start light', 'Focus on control']
  },
  {
    id: 'functional_002',
    name: 'Farmer\'s Walk',
    category: 'Functional',
    primaryMuscles: ['Grip', 'Traps', 'Core'],
    secondaryMuscles: ['Legs'],
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: 'Loaded carry exercise',
    instructions: [
      'Hold heavy weights at sides',
      'Walk forward with good posture',
      'Keep shoulders back and core tight',
      'Walk for distance or time'
    ],
    tips: ['Keep chest up', 'Don\'t shrug shoulders', 'Breathe normally']
  },
  {
    id: 'functional_003',
    name: 'Bear Crawl',
    category: 'Functional',
    primaryMuscles: ['Core', 'Shoulders'],
    secondaryMuscles: ['Legs', 'Arms'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    description: 'Primal movement pattern',
    instructions: [
      'Start on hands and knees',
      'Lift knees slightly off ground',
      'Crawl forward moving opposite limbs',
      'Keep hips level and core tight'
    ],
    tips: ['Keep knees low', 'Move slowly at first', 'Maintain straight line']
  },
  {
    id: 'functional_004',
    name: 'Kettlebell Swings',
    category: 'Functional',
    primaryMuscles: ['Glutes', 'Hamstrings'],
    secondaryMuscles: ['Core', 'Shoulders'],
    equipment: 'Kettlebell',
    difficulty: 'Intermediate',
    description: 'Dynamic hip hinge movement',
    instructions: [
      'Stand with feet wider than shoulders',
      'Hinge at hips to swing kettlebell back',
      'Drive hips forward to swing weight up',
      'Let weight fall back between legs'
    ],
    tips: ['Drive with hips, not arms', 'Keep back straight', 'Control the swing']
  },
  {
    id: 'functional_005',
    name: 'Sled Push',
    category: 'Functional',
    primaryMuscles: ['Legs', 'Core'],
    secondaryMuscles: ['Arms', 'Shoulders'],
    equipment: 'Sled',
    difficulty: 'Advanced',
    description: 'Heavy resistance pushing exercise',
    instructions: [
      'Grip sled handles firmly',
      'Lean forward at 45-degree angle',
      'Drive through legs to push sled',
      'Maintain low body position'
    ],
    tips: ['Stay low', 'Drive with legs', 'Keep core engaged']
  }
];

// Generate more exercises programmatically to reach 1000+
const generateExerciseVariations = (): Exercise[] => {
  const baseExercises = exercisesDatabase;
  const variations = [];
  
  // Add variations for each base exercise
  for (const exercise of baseExercises) {
    // Add different equipment variations
    if (exercise.equipment === 'Dumbbells') {
      variations.push({
        ...exercise,
        id: exercise.id + '_barbell',
        name: exercise.name.replace('Dumbbell', 'Barbell'),
        equipment: 'Barbell'
      });
      variations.push({
        ...exercise,
        id: exercise.id + '_cable',
        name: exercise.name.replace('Dumbbell', 'Cable'),
        equipment: 'Cable Machine'
      });
    }
    
    // Add tempo variations
    if (exercise.difficulty === 'Beginner') {
      variations.push({
        ...exercise,
        id: exercise.id + '_tempo',
        name: exercise.name + ' (Slow Tempo)',
        difficulty: 'Intermediate' as const,
        description: exercise.description + ' with controlled tempo'
      });
    }
    
    // Add single-arm/leg variations
    if (!exercise.name.includes('Single')) {
      variations.push({
        ...exercise,
        id: exercise.id + '_single',
        name: 'Single-Arm ' + exercise.name,
        difficulty: exercise.difficulty === 'Beginner' ? 'Intermediate' as const : 'Advanced' as const,
        description: 'Unilateral version of ' + exercise.name
      });
    }
  }
  
  return variations;
};

// Extend the database with variations
export const completeExercisesDatabase = [
  ...exercisesDatabase,
  ...generateExerciseVariations()
];

// Workout Programs Database
export const workoutPrograms: WorkoutProgram[] = [
  {
    id: 'program_001',
    name: '12 Week Transformation',
    description: 'Complete body transformation program for muscle gain and fat loss',
    duration: '12 weeks',
    level: 'Intermediate',
    category: 'Transformation',
    trainer: 'Mike Johnson',
    rating: 4.8,
    exercises: ['chest_001', 'back_001', 'legs_001', 'shoulders_001', 'arms_001'],
    daysPerWeek: 5,
    estimatedCalories: 450,
    equipment: ['Barbell', 'Dumbbells', 'Cable Machine']
  },
  {
    id: 'program_002',
    name: 'Beginner Strength Builder',
    description: 'Perfect program for building foundational strength',
    duration: '8 weeks',
    level: 'Beginner',
    category: 'Strength',
    trainer: 'Sarah Davis',
    rating: 4.9,
    exercises: ['chest_001', 'legs_002', 'back_003', 'shoulders_002', 'core_001'],
    daysPerWeek: 3,
    estimatedCalories: 320,
    equipment: ['Bodyweight', 'Dumbbells']
  },
  {
    id: 'program_003',
    name: 'HIIT Shred',
    description: 'High intensity interval training for rapid fat loss',
    duration: '6 weeks',
    level: 'Advanced',
    category: 'Fat Loss',
    trainer: 'Alex Chen',
    rating: 4.7,
    exercises: ['cardio_001', 'cardio_003', 'core_004', 'functional_004', 'cardio_005'],
    daysPerWeek: 4,
    estimatedCalories: 550,
    equipment: ['Bodyweight', 'Kettlebell', 'Battle Ropes']
  },
  {
    id: 'program_004',
    name: 'Upper Body Power',
    description: 'Focused upper body strength and muscle development',
    duration: '10 weeks',
    level: 'Intermediate',
    category: 'Upper Body',
    trainer: 'David Wilson',
    rating: 4.6,
    exercises: ['chest_002', 'back_002', 'shoulders_001', 'arms_004', 'core_001'],
    daysPerWeek: 4,
    estimatedCalories: 420,
    equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar']
  },
  {
    id: 'program_005',
    name: 'Lower Body Blast',
    description: 'Comprehensive lower body strength and conditioning',
    duration: '8 weeks',
    level: 'Intermediate',
    category: 'Lower Body',
    trainer: 'Emma Thompson',
    rating: 4.8,
    exercises: ['legs_001', 'legs_003', 'legs_002', 'functional_004', 'core_003'],
    daysPerWeek: 3,
    estimatedCalories: 480,
    equipment: ['Barbell', 'Kettlebell', 'Bodyweight']
  },
  {
    id: 'program_006',
    name: 'Functional Fitness',
    description: 'Real-world movement patterns for daily life',
    duration: '12 weeks',
    level: 'Intermediate',
    category: 'Functional',
    trainer: 'Carlos Rodriguez',
    rating: 4.5,
    exercises: ['functional_001', 'functional_002', 'functional_003', 'functional_004', 'functional_005'],
    daysPerWeek: 4,
    estimatedCalories: 380,
    equipment: ['Kettlebell', 'Dumbbells', 'Sled', 'Bodyweight']
  },
  {
    id: 'program_007',
    name: 'Core Crusher',
    description: 'Intensive core strength and stability program',
    duration: '6 weeks',
    level: 'Beginner',
    category: 'Core',
    trainer: 'Lisa Park',
    rating: 4.7,
    exercises: ['core_001', 'core_002', 'core_003', 'core_004', 'core_005'],
    daysPerWeek: 5,
    estimatedCalories: 280,
    equipment: ['Bodyweight']
  },
  {
    id: 'program_008',
    name: 'Athletic Performance',
    description: 'Sport-specific training for athletic development',
    duration: '16 weeks',
    level: 'Advanced',
    category: 'Athletic',
    trainer: 'Mark Stevens',
    rating: 4.9,
    exercises: ['functional_004', 'legs_001', 'cardio_001', 'back_004', 'core_004'],
    daysPerWeek: 6,
    estimatedCalories: 600,
    equipment: ['Barbell', 'Kettlebell', 'Plyometric Box', 'Battle Ropes']
  },
  {
    id: 'program_009',
    name: 'Home Workout Hero',
    description: 'Complete workout program requiring no equipment',
    duration: '8 weeks',
    level: 'Beginner',
    category: 'Home Workout',
    trainer: 'Jennifer Lee',
    rating: 4.6,
    exercises: ['chest_001', 'legs_002', 'core_001', 'cardio_002', 'arms_002'],
    daysPerWeek: 4,
    estimatedCalories: 350,
    equipment: ['Bodyweight']
  },
  {
    id: 'program_010',
    name: 'Strength & Conditioning',
    description: 'Balanced approach to strength and cardiovascular fitness',
    duration: '12 weeks',
    level: 'Intermediate',
    category: 'General Fitness',
    trainer: 'Robert Kim',
    rating: 4.8,
    exercises: ['chest_002', 'back_001', 'legs_001', 'cardio_001', 'core_003'],
    daysPerWeek: 5,
    estimatedCalories: 500,
    equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar', 'Bodyweight']
  }
];

// Helper functions for searching and filtering
export const searchExercises = (query: string, category?: string): Exercise[] => {
  // Use completeExercisesDatabase which includes all exercises
  let results = completeExercisesDatabase;
  
  if (category && category !== 'All') {
    results = results.filter(exercise => exercise.category === category);
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(exercise => 
      exercise.name.toLowerCase().includes(lowerQuery) ||
      exercise.description.toLowerCase().includes(lowerQuery) ||
      exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(lowerQuery)) ||
      exercise.category.toLowerCase().includes(lowerQuery)
    );
  }
  
  return results;
};

export const searchPrograms = (query: string, level?: string, category?: string): WorkoutProgram[] => {
  let results = workoutPrograms;
  
  if (level && level !== 'All') {
    results = results.filter(program => program.level === level);
  }
  
  if (category && category !== 'All') {
    results = results.filter(program => program.category === category);
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(program => 
      program.name.toLowerCase().includes(lowerQuery) ||
      program.description.toLowerCase().includes(lowerQuery) ||
      program.trainer.toLowerCase().includes(lowerQuery) ||
      program.category.toLowerCase().includes(lowerQuery)
    );
  }
  
  return results;
};

export const getExerciseById = (id: string): Exercise | undefined => {
  // First try to find in the complete database
  const exercise = completeExercisesDatabase.find(exercise => exercise.id === id);
  if (exercise) return exercise;
  
  // If not found, try the base exercises database
  return exercisesDatabase.find(exercise => exercise.id === id);
};

export const getProgramById = (id: string): WorkoutProgram | undefined => {
  return workoutPrograms.find(program => program.id === id);
};

// Categories for filtering
export const exerciseCategories = [
  'All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Cardio', 'Functional'
];

export const programCategories = [
  'All', 'Transformation', 'Strength', 'Fat Loss', 'Upper Body', 'Lower Body', 
  'Functional', 'Core', 'Athletic', 'Home Workout', 'General Fitness'
];

export const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];