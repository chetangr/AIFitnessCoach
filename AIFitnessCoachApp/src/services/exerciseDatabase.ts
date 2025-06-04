import AsyncStorage from '@react-native-async-storage/async-storage';

interface Exercise {
  id: string;
  name: string;
  aliases: string[]; // Alternative names for better search
  sets: number;
  reps: number | string;
  weight?: string;
  duration?: string;
  equipment: string[];
  muscleGroups: string[];
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips?: string[];
  videoUrl?: string;
  imageUrl?: string;
  caloriesPerMinute: number;
  tags: string[];
  modificationOptions?: ExerciseModification[];
  safetyNotes?: string[];
  commonMistakes?: string[];
}

interface ExerciseModification {
  type: 'easier' | 'harder' | 'equipment_free' | 'low_impact' | 'injury_safe';
  name: string;
  description: string;
  adjustments: {
    sets?: number;
    reps?: number | string;
    weight?: string;
    equipment?: string[];
  };
}

interface ExerciseFilter {
  muscleGroups?: string[];
  equipment?: string[];
  category?: string[];
  difficulty?: string[];
  duration?: { min: number; max: number };
  tags?: string[];
  excludeInjury?: string[]; // Exclude exercises that stress these body parts
}

interface AlternativeRequest {
  originalExercise: Exercise;
  reason: 'injury' | 'equipment' | 'difficulty' | 'preference' | 'variety';
  specificRequirements?: {
    bodyPartToAvoid?: string[];
    availableEquipment?: string[];
    maxDifficulty?: 'beginner' | 'intermediate' | 'advanced';
    preferredMuscleGroups?: string[];
  };
}

class ExerciseDatabase {
  private readonly STORAGE_KEY = '@exercise_database_v2';
  private exercises: Exercise[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('Initializing exercise database...');
      
      // Try to load from storage first
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.exercises = JSON.parse(stored);
        console.log('Loaded', this.exercises.length, 'exercises from storage');
      } else {
        // Generate comprehensive exercise database
        this.exercises = this.generateComprehensiveDatabase();
        await this.saveToStorage();
        console.log('Generated and saved', this.exercises.length, 'exercises');
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing exercise database:', error);
      // Fallback to in-memory generation
      this.exercises = this.generateComprehensiveDatabase();
      this.initialized = true;
    }
  }

  private generateComprehensiveDatabase(): Exercise[] {
    const exercises: Exercise[] = [];

    // CHEST EXERCISES
    exercises.push(
      {
        id: 'bench_press',
        name: 'Bench Press',
        aliases: ['barbell bench press', 'flat bench press'],
        sets: 4,
        reps: '8-10',
        weight: '70-85% 1RM',
        equipment: ['barbell', 'bench', 'weight plates'],
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        category: 'strength',
        difficulty: 'intermediate',
        instructions: [
          'Lie flat on bench with feet planted on floor',
          'Grip barbell with hands slightly wider than shoulder-width',
          'Unrack the bar and position it over your chest',
          'Lower bar to chest with control, touching lightly',
          'Press bar up explosively to starting position',
          'Maintain tight core and shoulder blade retraction'
        ],
        tips: [
          'Keep your shoulder blades pulled back and down',
          'Maintain a slight arch in your lower back',
          'Drive through your heels for stability',
          'Focus on squeezing chest muscles at the top'
        ],
        caloriesPerMinute: 8,
        tags: ['compound', 'upper body', 'push', 'strength building'],
        modificationOptions: [
          {
            type: 'easier',
            name: 'Incline Bench Press',
            description: 'Use incline bench to reduce load',
            adjustments: { weight: '60-70% 1RM' }
          },
          {
            type: 'equipment_free',
            name: 'Push-ups',
            description: 'Bodyweight alternative',
            adjustments: { sets: 3, reps: '12-15', equipment: [] }
          },
          {
            type: 'harder',
            name: 'Close-Grip Bench Press',
            description: 'Narrow grip for more tricep focus',
            adjustments: { weight: '65-75% 1RM' }
          }
        ],
        safetyNotes: [
          'Always use a spotter for heavy weights',
          'Never bounce the bar off your chest',
          'Ensure proper bar path (straight up and down)'
        ],
        commonMistakes: [
          'Flaring elbows too wide',
          'Lifting head off bench',
          'Using too much weight too soon'
        ]
      },
      {
        id: 'pushups',
        name: 'Push-ups',
        aliases: ['pushup', 'press ups', 'bodyweight press'],
        sets: 3,
        reps: '12-20',
        equipment: [],
        muscleGroups: ['chest', 'triceps', 'shoulders', 'core'],
        category: 'strength',
        difficulty: 'beginner',
        instructions: [
          'Start in plank position with hands slightly wider than shoulders',
          'Keep body in straight line from head to heels',
          'Lower chest to within 1-2 inches of floor',
          'Push up explosively to starting position',
          'Repeat with controlled movement'
        ],
        tips: [
          'Engage core throughout movement',
          'Keep elbows at 45-degree angle',
          'Look slightly forward, not down',
          'Quality over quantity - focus on form'
        ],
        caloriesPerMinute: 8,
        tags: ['bodyweight', 'compound', 'functional', 'beginner friendly'],
        modificationOptions: [
          {
            type: 'easier',
            name: 'Knee Push-ups',
            description: 'Perform on knees to reduce load',
            adjustments: { reps: '8-15' }
          },
          {
            type: 'easier',
            name: 'Incline Push-ups',
            description: 'Hands elevated on bench or step',
            adjustments: { equipment: ['bench', 'step'] }
          },
          {
            type: 'harder',
            name: 'Decline Push-ups',
            description: 'Feet elevated for increased difficulty',
            adjustments: { equipment: ['bench', 'step'], reps: '8-12' }
          },
          {
            type: 'harder',
            name: 'Diamond Push-ups',
            description: 'Hands form diamond shape for tricep focus',
            adjustments: { reps: '6-10' }
          }
        ],
        safetyNotes: [
          'Stop if you feel pain in wrists or shoulders',
          'Maintain proper form throughout all repetitions'
        ]
      },
      {
        id: 'dumbbell_flyes',
        name: 'Dumbbell Flyes',
        aliases: ['chest flyes', 'db flyes', 'pec flyes'],
        sets: 3,
        reps: '12-15',
        weight: '20-30% of bench press weight',
        equipment: ['dumbbells', 'bench'],
        muscleGroups: ['chest', 'shoulders'],
        category: 'strength',
        difficulty: 'intermediate',
        instructions: [
          'Lie on bench holding dumbbells above chest',
          'Lower weights in wide arc with slight bend in elbows',
          'Feel stretch in chest at bottom position',
          'Bring weights back together above chest',
          'Squeeze chest muscles at top'
        ],
        caloriesPerMinute: 6,
        tags: ['isolation', 'chest building', 'definition'],
        modificationOptions: [
          {
            type: 'equipment_free',
            name: 'Wide Push-ups',
            description: 'Wide hand position mimics flye movement',
            adjustments: { sets: 3, reps: '10-15', equipment: [] }
          }
        ]
      }
    );

    // BACK EXERCISES
    exercises.push(
      {
        id: 'pullups',
        name: 'Pull-ups',
        aliases: ['pullup', 'chin ups', 'lat pulldowns'],
        sets: 4,
        reps: '6-12',
        equipment: ['pull-up bar'],
        muscleGroups: ['back', 'biceps', 'shoulders'],
        category: 'strength',
        difficulty: 'intermediate',
        instructions: [
          'Hang from bar with hands slightly wider than shoulders',
          'Pull body up until chin clears bar',
          'Lower with control to full arm extension',
          'Avoid swinging or using momentum',
          'Engage core throughout movement'
        ],
        tips: [
          'Focus on pulling elbows down and back',
          'Squeeze shoulder blades together',
          'Look slightly upward',
          'Full range of motion is key'
        ],
        caloriesPerMinute: 10,
        tags: ['compound', 'functional', 'upper body', 'bodyweight'],
        modificationOptions: [
          {
            type: 'easier',
            name: 'Assisted Pull-ups',
            description: 'Use resistance band or machine assistance',
            adjustments: { equipment: ['pull-up bar', 'resistance band'], reps: '8-12' }
          },
          {
            type: 'easier',
            name: 'Negative Pull-ups',
            description: 'Jump to top position, lower slowly',
            adjustments: { reps: '5-8' }
          },
          {
            type: 'easier',
            name: 'Lat Pulldowns',
            description: 'Machine alternative',
            adjustments: { equipment: ['lat pulldown machine'], weight: '60-80% bodyweight' }
          },
          {
            type: 'harder',
            name: 'Weighted Pull-ups',
            description: 'Add weight for increased difficulty',
            adjustments: { equipment: ['pull-up bar', 'weight belt', 'plates'], reps: '4-8' }
          }
        ],
        safetyNotes: [
          'Ensure pull-up bar is securely mounted',
          'Avoid excessive swinging',
          'Stop if you feel shoulder pain'
        ]
      },
      {
        id: 'bent_over_rows',
        name: 'Bent-over Rows',
        aliases: ['barbell rows', 'bb rows', 'bent rows'],
        sets: 3,
        reps: '8-12',
        weight: '60-75% of bench press',
        equipment: ['barbell', 'weight plates'],
        muscleGroups: ['back', 'biceps', 'rear delts'],
        category: 'strength',
        difficulty: 'intermediate',
        instructions: [
          'Stand with feet hip-width apart, holding barbell',
          'Hinge at hips, lean forward about 45 degrees',
          'Keep back straight and core engaged',
          'Pull bar to lower chest/upper abdomen',
          'Squeeze shoulder blades together',
          'Lower with control'
        ],
        caloriesPerMinute: 7,
        tags: ['compound', 'back building', 'posture'],
        modificationOptions: [
          {
            type: 'equipment_free',
            name: 'Inverted Rows',
            description: 'Bodyweight alternative using bar or table',
            adjustments: { equipment: ['low bar', 'table'], reps: '10-15' }
          },
          {
            type: 'easier',
            name: 'Dumbbell Rows',
            description: 'Single arm variation for better form',
            adjustments: { equipment: ['dumbbell', 'bench'], reps: '10-12 each arm' }
          }
        ]
      }
    );

    // LEG EXERCISES
    exercises.push(
      {
        id: 'squats',
        name: 'Squats',
        aliases: ['back squats', 'barbell squats', 'bodyweight squats'],
        sets: 4,
        reps: '8-12',
        weight: '80-100% bodyweight',
        equipment: ['barbell', 'squat rack', 'weight plates'],
        muscleGroups: ['legs', 'glutes', 'core'],
        category: 'strength',
        difficulty: 'intermediate',
        instructions: [
          'Position barbell on upper traps (high bar) or rear delts (low bar)',
          'Stand with feet shoulder-width apart',
          'Initiate movement by pushing hips back',
          'Lower until thighs are parallel to floor',
          'Drive through heels to return to standing',
          'Keep chest up and knees tracking over toes'
        ],
        tips: [
          'Maintain neutral spine throughout',
          'Focus on sitting back into the squat',
          'Keep knees aligned with toes',
          'Full depth improves mobility and strength'
        ],
        caloriesPerMinute: 8,
        tags: ['compound', 'functional', 'leg day', 'strength building'],
        modificationOptions: [
          {
            type: 'equipment_free',
            name: 'Bodyweight Squats',
            description: 'No equipment needed',
            adjustments: { equipment: [], reps: '15-25' }
          },
          {
            type: 'easier',
            name: 'Box Squats',
            description: 'Sit down to box for depth control',
            adjustments: { equipment: ['barbell', 'squat rack', 'box'], weight: '70-85% bodyweight' }
          },
          {
            type: 'easier',
            name: 'Goblet Squats',
            description: 'Hold weight at chest',
            adjustments: { equipment: ['dumbbell', 'kettlebell'], reps: '12-20' }
          },
          {
            type: 'harder',
            name: 'Front Squats',
            description: 'Bar positioned on front delts',
            adjustments: { weight: '70-85% of back squat' }
          },
          {
            type: 'injury_safe',
            name: 'Wall Sits',
            description: 'Isometric alternative for knee issues',
            adjustments: { equipment: ['wall'], reps: '30-60s', sets: 3 }
          }
        ],
        safetyNotes: [
          'Always use safety bars in squat rack',
          'Warm up thoroughly before heavy squats',
          'Stop if you feel knee or back pain'
        ],
        commonMistakes: [
          'Knees caving inward',
          'Not reaching proper depth',
          'Leaning too far forward'
        ]
      },
      {
        id: 'deadlifts',
        name: 'Deadlifts',
        aliases: ['conventional deadlift', 'barbell deadlift'],
        sets: 3,
        reps: '5-8',
        weight: '100-150% bodyweight',
        equipment: ['barbell', 'weight plates'],
        muscleGroups: ['back', 'legs', 'glutes', 'traps', 'forearms'],
        category: 'strength',
        difficulty: 'advanced',
        instructions: [
          'Stand with feet hip-width apart, bar over mid-foot',
          'Bend at hips and knees to grip bar',
          'Keep back straight and chest up',
          'Drive through heels and extend hips',
          'Stand tall with shoulders back',
          'Reverse movement to lower bar'
        ],
        caloriesPerMinute: 10,
        tags: ['compound', 'full body', 'strength building', 'posterior chain'],
        modificationOptions: [
          {
            type: 'easier',
            name: 'Romanian Deadlifts',
            description: 'Start from standing, focus on hip hinge',
            adjustments: { weight: '60-80% of conventional', reps: '8-12' }
          },
          {
            type: 'easier',
            name: 'Trap Bar Deadlifts',
            description: 'More upright position, easier on back',
            adjustments: { equipment: ['trap bar', 'weight plates'] }
          },
          {
            type: 'equipment_free',
            name: 'Single Leg RDLs',
            description: 'Bodyweight hip hinge movement',
            adjustments: { equipment: [], reps: '8-12 each leg' }
          }
        ],
        safetyNotes: [
          'Master form with light weight first',
          'Never round your back',
          'Use proper breathing technique'
        ]
      },
      {
        id: 'lunges',
        name: 'Lunges',
        aliases: ['forward lunges', 'walking lunges', 'stationary lunges'],
        sets: 3,
        reps: '12-16 each leg',
        equipment: [],
        muscleGroups: ['legs', 'glutes', 'core'],
        category: 'strength',
        difficulty: 'beginner',
        instructions: [
          'Stand tall with feet hip-width apart',
          'Step forward with one leg',
          'Lower until both knees are at 90 degrees',
          'Push off front foot to return to start',
          'Alternate legs or complete all reps on one side'
        ],
        caloriesPerMinute: 7,
        tags: ['unilateral', 'functional', 'bodyweight', 'balance'],
        modificationOptions: [
          {
            type: 'easier',
            name: 'Reverse Lunges',
            description: 'Step backward instead of forward',
            adjustments: { reps: '10-15 each leg' }
          },
          {
            type: 'harder',
            name: 'Weighted Lunges',
            description: 'Hold dumbbells for added resistance',
            adjustments: { equipment: ['dumbbells'], reps: '10-12 each leg' }
          },
          {
            type: 'low_impact',
            name: 'Static Lunges',
            description: 'Stay in lunge position, pulse up and down',
            adjustments: { reps: '15-20 each leg' }
          }
        ]
      }
    );

    // SHOULDER EXERCISES
    exercises.push(
      {
        id: 'overhead_press',
        name: 'Overhead Press',
        aliases: ['military press', 'standing press', 'shoulder press'],
        sets: 4,
        reps: '6-10',
        weight: '50-70% of bench press',
        equipment: ['barbell', 'weight plates'],
        muscleGroups: ['shoulders', 'triceps', 'core'],
        category: 'strength',
        difficulty: 'intermediate',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Hold bar at shoulder height with hands just outside shoulders',
          'Brace core and press bar straight overhead',
          'Lock out arms fully at top',
          'Lower with control to starting position'
        ],
        caloriesPerMinute: 7,
        tags: ['compound', 'shoulder building', 'functional'],
        modificationOptions: [
          {
            type: 'easier',
            name: 'Seated Dumbbell Press',
            description: 'Seated position with dumbbells',
            adjustments: { equipment: ['dumbbells', 'bench'], reps: '8-12' }
          },
          {
            type: 'equipment_free',
            name: 'Pike Push-ups',
            description: 'Bodyweight shoulder press movement',
            adjustments: { equipment: [], reps: '8-15' }
          }
        ]
      },
      {
        id: 'lateral_raises',
        name: 'Lateral Raises',
        aliases: ['side raises', 'dumbbell lateral raises'],
        sets: 3,
        reps: '12-20',
        equipment: ['dumbbells'],
        muscleGroups: ['shoulders'],
        category: 'strength',
        difficulty: 'beginner',
        instructions: [
          'Stand with dumbbells at sides',
          'Raise arms out to sides until parallel to floor',
          'Pause at top',
          'Lower with control',
          'Keep slight bend in elbows throughout'
        ],
        caloriesPerMinute: 5,
        tags: ['isolation', 'shoulder width', 'definition'],
        modificationOptions: [
          {
            type: 'equipment_free',
            name: 'Arm Circles',
            description: 'Large arm circles for shoulder activation',
            adjustments: { equipment: [], reps: '15-20 each direction' }
          }
        ]
      }
    );

    // CARDIO EXERCISES
    exercises.push(
      {
        id: 'burpees',
        name: 'Burpees',
        aliases: ['burpee', 'squat thrusts'],
        sets: 4,
        reps: '8-15',
        equipment: [],
        muscleGroups: ['full body'],
        category: 'cardio',
        difficulty: 'advanced',
        instructions: [
          'Start standing',
          'Drop into squat position',
          'Jump feet back to plank',
          'Perform push-up (optional)',
          'Jump feet back to squat',
          'Jump up with arms overhead'
        ],
        caloriesPerMinute: 15,
        tags: ['full body', 'hiit', 'conditioning', 'bodyweight'],
        modificationOptions: [
          {
            type: 'easier',
            name: 'Step-back Burpees',
            description: 'Step back instead of jumping',
            adjustments: { reps: '6-10' }
          },
          {
            type: 'easier',
            name: 'Half Burpees',
            description: 'Skip the push-up and jump',
            adjustments: { reps: '10-15' }
          }
        ]
      },
      {
        id: 'mountain_climbers',
        name: 'Mountain Climbers',
        aliases: ['mountain climber'],
        sets: 4,
        reps: '20-30 each leg',
        duration: '30-45s',
        equipment: [],
        muscleGroups: ['core', 'shoulders', 'legs'],
        category: 'cardio',
        difficulty: 'intermediate',
        instructions: [
          'Start in plank position',
          'Bring one knee toward chest',
          'Quickly switch legs',
          'Maintain plank position throughout',
          'Keep core engaged'
        ],
        caloriesPerMinute: 12,
        tags: ['cardio', 'core', 'coordination', 'bodyweight']
      },
      {
        id: 'jumping_jacks',
        name: 'Jumping Jacks',
        aliases: ['star jumps'],
        sets: 3,
        reps: '30-50',
        duration: '30-60s',
        equipment: [],
        muscleGroups: ['full body'],
        category: 'cardio',
        difficulty: 'beginner',
        instructions: [
          'Stand with feet together, arms at sides',
          'Jump feet apart while raising arms overhead',
          'Jump back to starting position',
          'Maintain steady rhythm',
          'Land softly on balls of feet'
        ],
        caloriesPerMinute: 8,
        tags: ['cardio', 'warm-up', 'coordination', 'beginner friendly'],
        modificationOptions: [
          {
            type: 'low_impact',
            name: 'Step Jacks',
            description: 'Step side to side instead of jumping',
            adjustments: { reps: '40-60' }
          }
        ]
      }
    );

    // CORE EXERCISES
    exercises.push(
      {
        id: 'plank',
        name: 'Plank',
        aliases: ['front plank', 'forearm plank'],
        sets: 3,
        reps: '30-90s',
        duration: '30-90s',
        equipment: [],
        muscleGroups: ['core', 'shoulders', 'glutes'],
        category: 'strength',
        difficulty: 'beginner',
        instructions: [
          'Start in forearm plank position',
          'Keep body in straight line from head to heels',
          'Engage core and glutes',
          'Breathe normally',
          'Hold for specified time'
        ],
        caloriesPerMinute: 6,
        tags: ['isometric', 'core stability', 'functional'],
        modificationOptions: [
          {
            type: 'easier',
            name: 'Knee Plank',
            description: 'Perform on knees',
            adjustments: { duration: '20-60s' }
          },
          {
            type: 'harder',
            name: 'Single Arm Plank',
            description: 'Lift one arm alternately',
            adjustments: { duration: '15-30s each arm' }
          }
        ]
      },
      {
        id: 'russian_twists',
        name: 'Russian Twists',
        aliases: ['seated twists', 'oblique twists'],
        sets: 3,
        reps: '20-30',
        equipment: [],
        muscleGroups: ['core', 'obliques'],
        category: 'strength',
        difficulty: 'beginner',
        instructions: [
          'Sit with knees bent, feet lifted off ground',
          'Lean back slightly, keeping back straight',
          'Rotate torso left and right',
          'Touch ground beside hips with hands',
          'Keep core engaged throughout'
        ],
        caloriesPerMinute: 7,
        tags: ['core rotation', 'obliques', 'bodyweight'],
        modificationOptions: [
          {
            type: 'harder',
            name: 'Weighted Russian Twists',
            description: 'Hold weight or medicine ball',
            adjustments: { equipment: ['dumbbell', 'medicine ball'], reps: '15-25' }
          },
          {
            type: 'easier',
            name: 'Feet on Ground Twists',
            description: 'Keep feet on ground for stability',
            adjustments: { reps: '25-40' }
          }
        ]
      }
    );

    // FLEXIBILITY & YOGA
    exercises.push(
      {
        id: 'downward_dog',
        name: 'Downward Facing Dog',
        aliases: ['downward dog', 'down dog'],
        sets: 1,
        reps: '30-90s',
        duration: '30-90s',
        equipment: ['yoga mat'],
        muscleGroups: ['shoulders', 'hamstrings', 'calves', 'back'],
        category: 'flexibility',
        difficulty: 'beginner',
        instructions: [
          'Start on hands and knees',
          'Tuck toes under and lift hips up',
          'Straighten legs as much as possible',
          'Press hands into ground',
          'Create inverted V shape with body'
        ],
        caloriesPerMinute: 3,
        tags: ['yoga', 'flexibility', 'inversion', 'full body stretch'],
        modificationOptions: [
          {
            type: 'easier',
            name: 'Bent Knee Down Dog',
            description: 'Keep knees slightly bent',
            adjustments: { duration: '20-60s' }
          }
        ]
      },
      {
        id: 'childs_pose',
        name: 'Child\'s Pose',
        aliases: ['balasana', 'resting pose'],
        sets: 1,
        reps: '60-300s',
        duration: '1-5 minutes',
        equipment: ['yoga mat'],
        muscleGroups: ['back', 'hips', 'shoulders'],
        category: 'flexibility',
        difficulty: 'beginner',
        instructions: [
          'Kneel on mat with big toes touching',
          'Sit back on heels',
          'Fold forward, extending arms in front',
          'Rest forehead on mat',
          'Breathe deeply and relax'
        ],
        caloriesPerMinute: 2,
        tags: ['yoga', 'relaxation', 'recovery', 'stress relief']
      }
    );

    // Add more exercises for comprehensive coverage...
    // This is a foundation - in production, you'd have 1000+ exercises

    return exercises;
  }

  // Search exercises by various criteria
  async searchExercises(query: string, filters?: ExerciseFilter): Promise<Exercise[]> {
    await this.initialize();
    
    let results = [...this.exercises];
    
    // Text search in name, aliases, and muscle groups
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.aliases.some(alias => alias.toLowerCase().includes(searchTerm)) ||
        exercise.muscleGroups.some(group => group.toLowerCase().includes(searchTerm)) ||
        exercise.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply filters
    if (filters) {
      if (filters.muscleGroups?.length) {
        results = results.filter(exercise =>
          filters.muscleGroups!.some(group =>
            exercise.muscleGroups.includes(group.toLowerCase())
          )
        );
      }
      
      if (filters.equipment?.length) {
        results = results.filter(exercise =>
          filters.equipment!.some(equip =>
            exercise.equipment.includes(equip.toLowerCase()) ||
            exercise.equipment.length === 0 // Include bodyweight exercises
          )
        );
      }
      
      if (filters.category?.length) {
        results = results.filter(exercise =>
          filters.category!.includes(exercise.category)
        );
      }
      
      if (filters.difficulty?.length) {
        results = results.filter(exercise =>
          filters.difficulty!.includes(exercise.difficulty)
        );
      }
      
      if (filters.excludeInjury?.length) {
        results = results.filter(exercise => {
          // Exclude exercises that stress injured body parts
          const bodyPartsToAvoid = filters.excludeInjury!.map(part => part.toLowerCase());
          return !exercise.muscleGroups.some(group =>
            bodyPartsToAvoid.some(avoid => group.includes(avoid))
          );
        });
      }
    }
    
    return results;
  }

  // Find alternatives for a specific exercise
  async findAlternatives(request: AlternativeRequest): Promise<Exercise[]> {
    await this.initialize();
    
    const { originalExercise, reason, specificRequirements } = request;
    let alternatives: Exercise[] = [];
    
    // Start with exercises targeting similar muscle groups
    const similarMuscleGroups = this.exercises.filter(exercise =>
      exercise.id !== originalExercise.id &&
      exercise.muscleGroups.some(group =>
        originalExercise.muscleGroups.includes(group)
      )
    );
    
    switch (reason) {
      case 'injury':
        // Find exercises that don't stress the injured area
        alternatives = similarMuscleGroups.filter(exercise => {
          if (!specificRequirements?.bodyPartToAvoid) return true;
          
          const avoidParts = specificRequirements.bodyPartToAvoid.map(part => part.toLowerCase());
          return !exercise.muscleGroups.some(group =>
            avoidParts.some(avoid => group.includes(avoid))
          );
        });
        
        // Prefer low-impact alternatives
        alternatives = alternatives.filter(exercise =>
          exercise.tags.includes('low_impact') ||
          exercise.category === 'flexibility' ||
          exercise.difficulty === 'beginner'
        );
        break;
        
      case 'equipment':
        // Find exercises using available equipment
        if (specificRequirements?.availableEquipment) {
          const available = specificRequirements.availableEquipment.map(eq => eq.toLowerCase());
          alternatives = similarMuscleGroups.filter(exercise =>
            exercise.equipment.length === 0 || // Bodyweight exercises
            exercise.equipment.some(eq => available.includes(eq.toLowerCase()))
          );
        } else {
          // Default to bodyweight alternatives
          alternatives = similarMuscleGroups.filter(exercise =>
            exercise.equipment.length === 0
          );
        }
        break;
        
      case 'difficulty':
        // Find exercises at appropriate difficulty level
        const maxDiff = specificRequirements?.maxDifficulty || 'beginner';
        const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
        const maxIndex = difficultyOrder.indexOf(maxDiff);
        
        alternatives = similarMuscleGroups.filter(exercise =>
          difficultyOrder.indexOf(exercise.difficulty) <= maxIndex
        );
        break;
        
      case 'variety':
        // Find different exercises for the same muscle groups
        alternatives = similarMuscleGroups.filter(exercise =>
          exercise.category === originalExercise.category
        );
        break;
        
      default:
        alternatives = similarMuscleGroups;
    }
    
    // Sort by relevance (muscle group overlap, difficulty match, etc.)
    alternatives.sort((a, b) => {
      const aOverlap = a.muscleGroups.filter(group =>
        originalExercise.muscleGroups.includes(group)
      ).length;
      const bOverlap = b.muscleGroups.filter(group =>
        originalExercise.muscleGroups.includes(group)
      ).length;
      
      if (aOverlap !== bOverlap) return bOverlap - aOverlap;
      
      // Prefer same difficulty level
      if (a.difficulty === originalExercise.difficulty && b.difficulty !== originalExercise.difficulty) return -1;
      if (b.difficulty === originalExercise.difficulty && a.difficulty !== originalExercise.difficulty) return 1;
      
      return 0;
    });
    
    // Return top 5 alternatives
    return alternatives.slice(0, 5);
  }

  // Get exercises by muscle group
  async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    await this.initialize();
    
    return this.exercises.filter(exercise =>
      exercise.muscleGroups.includes(muscleGroup.toLowerCase())
    );
  }

  // Get exercises by equipment
  async getExercisesByEquipment(equipment: string[]): Promise<Exercise[]> {
    await this.initialize();
    
    const availableEquipment = equipment.map(eq => eq.toLowerCase());
    
    return this.exercises.filter(exercise =>
      exercise.equipment.length === 0 || // Include bodyweight exercises
      exercise.equipment.some(eq => availableEquipment.includes(eq.toLowerCase()))
    );
  }

  // Get random exercises
  async getRandomExercises(count: number, filters?: ExerciseFilter): Promise<Exercise[]> {
    const allExercises = await this.searchExercises('', filters);
    
    // Shuffle array and take first 'count' items
    const shuffled = allExercises.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Get exercise by ID
  async getExerciseById(id: string): Promise<Exercise | null> {
    await this.initialize();
    
    return this.exercises.find(exercise => exercise.id === id) || null;
  }

  // Add custom exercise
  async addCustomExercise(exercise: Omit<Exercise, 'id'>): Promise<string> {
    await this.initialize();
    
    const newExercise: Exercise = {
      ...exercise,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.exercises.push(newExercise);
    await this.saveToStorage();
    
    console.log('Custom exercise added:', newExercise.name);
    return newExercise.id;
  }

  // Get all muscle groups
  async getAllMuscleGroups(): Promise<string[]> {
    await this.initialize();
    
    const muscleGroups = new Set<string>();
    this.exercises.forEach(exercise => {
      exercise.muscleGroups.forEach(group => muscleGroups.add(group));
    });
    
    return Array.from(muscleGroups).sort();
  }

  // Get all equipment types
  async getAllEquipment(): Promise<string[]> {
    await this.initialize();
    
    const equipment = new Set<string>();
    this.exercises.forEach(exercise => {
      exercise.equipment.forEach(eq => equipment.add(eq));
    });
    
    return Array.from(equipment).sort();
  }

  private async saveToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.exercises));
    } catch (error) {
      console.error('Error saving exercises to storage:', error);
    }
  }

  // Clear all data
  async clearDatabase(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      this.exercises = [];
      this.initialized = false;
      console.log('Exercise database cleared');
    } catch (error) {
      console.error('Error clearing exercise database:', error);
    }
  }
}

export const exerciseDatabase = new ExerciseDatabase();
export type { Exercise, ExerciseFilter, AlternativeRequest, ExerciseModification };