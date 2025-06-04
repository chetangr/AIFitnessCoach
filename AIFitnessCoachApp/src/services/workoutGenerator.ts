import { exerciseDatabase, Exercise } from './exerciseDatabase';
import { WorkoutEvent } from './workoutScheduleService';

interface WorkoutRequirements {
  duration: number; // in minutes
  focus: string; // 'chest', 'back', 'legs', 'full body', 'cardio', etc.
  equipment: string; // 'gym', 'home', 'bodyweight', 'minimal'
  level: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[]; // 'strength', 'endurance', 'weight_loss', 'muscle_gain'
  limitations?: string[]; // injury limitations
  preferredExercises?: string[]; // exercises user likes
  excludedExercises?: string[]; // exercises to avoid
}

interface WorkoutTemplate {
  name: string;
  type: 'strength' | 'cardio' | 'hiit' | 'yoga' | 'flexibility';
  structure: WorkoutSection[];
  totalDuration: number;
  targetMuscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface WorkoutSection {
  name: string; // 'Warm-up', 'Main', 'Finisher', 'Cool-down'
  duration: number; // minutes
  exercises: ExerciseSelection[];
  restBetweenExercises?: number; // seconds
}

interface ExerciseSelection {
  exerciseId: string;
  sets: number;
  reps: number | string;
  weight?: string;
  duration?: string;
  restBetweenSets?: number; // seconds
  notes?: string;
}

interface GeneratedWorkout {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'strength' | 'cardio' | 'hiit' | 'yoga' | 'flexibility';
  calories: number;
  exercises: Exercise[];
  sections: WorkoutSection[];
  tags: string[];
  equipment: string[];
  muscleGroups: string[];
  notes: string[];
}

class WorkoutGenerator {
  private workoutTemplates: WorkoutTemplate[] = [];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Define workout templates for different goals and types
    this.workoutTemplates = [
      // STRENGTH TEMPLATES
      {
        name: 'Upper Body Strength',
        type: 'strength',
        structure: [
          {
            name: 'Warm-up',
            duration: 5,
            exercises: [
              { exerciseId: 'arm_circles', sets: 1, reps: '10 each direction', restBetweenSets: 30 },
              { exerciseId: 'shoulder_rolls', sets: 1, reps: '10 each direction', restBetweenSets: 30 }
            ],
            restBetweenExercises: 30
          },
          {
            name: 'Main Strength',
            duration: 25,
            exercises: [
              { exerciseId: 'bench_press', sets: 4, reps: '8-10', weight: '70-85% 1RM', restBetweenSets: 120 },
              { exerciseId: 'pullups', sets: 3, reps: '6-12', restBetweenSets: 120 },
              { exerciseId: 'overhead_press', sets: 3, reps: '8-10', weight: '60-75% 1RM', restBetweenSets: 90 },
              { exerciseId: 'bent_over_rows', sets: 3, reps: '10-12', weight: '65-80% 1RM', restBetweenSets: 90 }
            ],
            restBetweenExercises: 60
          },
          {
            name: 'Accessory',
            duration: 10,
            exercises: [
              { exerciseId: 'lateral_raises', sets: 3, reps: '12-15', restBetweenSets: 60 },
              { exerciseId: 'tricep_dips', sets: 3, reps: '10-15', restBetweenSets: 60 }
            ],
            restBetweenExercises: 45
          }
        ],
        totalDuration: 40,
        targetMuscleGroups: ['chest', 'back', 'shoulders', 'arms'],
        difficulty: 'intermediate'
      },
      {
        name: 'Lower Body Power',
        type: 'strength',
        structure: [
          {
            name: 'Warm-up',
            duration: 8,
            exercises: [
              { exerciseId: 'bodyweight_squats', sets: 2, reps: '15', restBetweenSets: 45 },
              { exerciseId: 'leg_swings', sets: 1, reps: '10 each leg', restBetweenSets: 30 }
            ],
            restBetweenExercises: 30
          },
          {
            name: 'Main Strength',
            duration: 30,
            exercises: [
              { exerciseId: 'squats', sets: 4, reps: '6-8', weight: '80-90% 1RM', restBetweenSets: 180 },
              { exerciseId: 'deadlifts', sets: 3, reps: '5-8', weight: '85-95% 1RM', restBetweenSets: 180 },
              { exerciseId: 'lunges', sets: 3, reps: '12 each leg', restBetweenSets: 90 }
            ],
            restBetweenExercises: 120
          },
          {
            name: 'Accessory',
            duration: 12,
            exercises: [
              { exerciseId: 'calf_raises', sets: 3, reps: '15-20', restBetweenSets: 60 },
              { exerciseId: 'glute_bridges', sets: 3, reps: '15-20', restBetweenSets: 60 }
            ],
            restBetweenExercises: 45
          }
        ],
        totalDuration: 50,
        targetMuscleGroups: ['legs', 'glutes', 'calves'],
        difficulty: 'intermediate'
      },
      // CARDIO/HIIT TEMPLATES
      {
        name: 'HIIT Cardio Blast',
        type: 'hiit',
        structure: [
          {
            name: 'Warm-up',
            duration: 5,
            exercises: [
              { exerciseId: 'jumping_jacks', sets: 2, reps: '30s', restBetweenSets: 30 },
              { exerciseId: 'high_knees', sets: 2, reps: '20s', restBetweenSets: 30 }
            ],
            restBetweenExercises: 30
          },
          {
            name: 'HIIT Circuit',
            duration: 20,
            exercises: [
              { exerciseId: 'burpees', sets: 4, reps: '45s', restBetweenSets: 15 },
              { exerciseId: 'mountain_climbers', sets: 4, reps: '45s', restBetweenSets: 15 },
              { exerciseId: 'jump_squats', sets: 4, reps: '45s', restBetweenSets: 15 },
              { exerciseId: 'pushups', sets: 4, reps: '45s', restBetweenSets: 15 }
            ],
            restBetweenExercises: 60
          },
          {
            name: 'Cool-down',
            duration: 5,
            exercises: [
              { exerciseId: 'walking_in_place', sets: 1, reps: '2 minutes', restBetweenSets: 0 },
              { exerciseId: 'deep_breathing', sets: 1, reps: '2 minutes', restBetweenSets: 0 }
            ],
            restBetweenExercises: 0
          }
        ],
        totalDuration: 30,
        targetMuscleGroups: ['full body'],
        difficulty: 'advanced'
      },
      // BODYWEIGHT TEMPLATES
      {
        name: 'Bodyweight Full Body',
        type: 'strength',
        structure: [
          {
            name: 'Warm-up',
            duration: 5,
            exercises: [
              { exerciseId: 'arm_circles', sets: 1, reps: '10 each direction', restBetweenSets: 30 },
              { exerciseId: 'leg_swings', sets: 1, reps: '10 each leg', restBetweenSets: 30 }
            ],
            restBetweenExercises: 30
          },
          {
            name: 'Main Circuit',
            duration: 25,
            exercises: [
              { exerciseId: 'pushups', sets: 3, reps: '12-20', restBetweenSets: 90 },
              { exerciseId: 'bodyweight_squats', sets: 3, reps: '15-25', restBetweenSets: 90 },
              { exerciseId: 'plank', sets: 3, reps: '30-60s', restBetweenSets: 90 },
              { exerciseId: 'lunges', sets: 3, reps: '12 each leg', restBetweenSets: 90 },
              { exerciseId: 'pike_pushups', sets: 3, reps: '8-12', restBetweenSets: 90 }
            ],
            restBetweenExercises: 60
          }
        ],
        totalDuration: 30,
        targetMuscleGroups: ['full body'],
        difficulty: 'beginner'
      },
      // YOGA/FLEXIBILITY TEMPLATES
      {
        name: 'Yoga Flow',
        type: 'yoga',
        structure: [
          {
            name: 'Centering',
            duration: 5,
            exercises: [
              { exerciseId: 'deep_breathing', sets: 1, reps: '3 minutes', restBetweenSets: 0 },
              { exerciseId: 'mountain_pose', sets: 1, reps: '1 minute', restBetweenSets: 0 }
            ],
            restBetweenExercises: 0
          },
          {
            name: 'Flow Sequence',
            duration: 30,
            exercises: [
              { exerciseId: 'sun_salutation', sets: 5, reps: 'sequence', restBetweenSets: 30 },
              { exerciseId: 'warrior_poses', sets: 1, reps: '1 min each side', restBetweenSets: 30 },
              { exerciseId: 'downward_dog', sets: 3, reps: '1 minute', restBetweenSets: 30 },
              { exerciseId: 'pigeon_pose', sets: 1, reps: '2 min each side', restBetweenSets: 30 }
            ],
            restBetweenExercises: 15
          },
          {
            name: 'Relaxation',
            duration: 5,
            exercises: [
              { exerciseId: 'childs_pose', sets: 1, reps: '2 minutes', restBetweenSets: 0 },
              { exerciseId: 'savasana', sets: 1, reps: '3 minutes', restBetweenSets: 0 }
            ],
            restBetweenExercises: 0
          }
        ],
        totalDuration: 40,
        targetMuscleGroups: ['full body'],
        difficulty: 'beginner'
      }
    ];
  }

  // Main workout generation method
  async generateWorkout(requirements: WorkoutRequirements): Promise<GeneratedWorkout> {
    try {
      console.log('Generating workout with requirements:', requirements);
      
      // Find appropriate template or create custom structure
      const template = this.selectBestTemplate(requirements);
      
      // Generate exercises based on requirements
      const selectedExercises = await this.selectExercises(requirements, template);
      
      // Create workout structure
      const workout = this.assembleWorkout(requirements, template, selectedExercises);
      
      console.log('Generated workout:', workout.title, 'with', workout.exercises.length, 'exercises');
      return workout;
      
    } catch (error) {
      console.error('Error generating workout:', error);
      throw new Error('Failed to generate workout. Please try again.');
    }
  }

  // Select best template based on requirements
  private selectBestTemplate(requirements: WorkoutRequirements): WorkoutTemplate {
    const { focus, level, duration } = requirements;
    
    // Score templates based on how well they match requirements
    let bestTemplate = this.workoutTemplates[0];
    let bestScore = 0;
    
    for (const template of this.workoutTemplates) {
      let score = 0;
      
      // Duration match (within 10 minutes)
      const durationDiff = Math.abs(template.totalDuration - duration);
      if (durationDiff <= 10) score += 3;
      else if (durationDiff <= 20) score += 1;
      
      // Difficulty match
      if (template.difficulty === level) score += 2;
      
      // Focus area match
      const focusLower = focus.toLowerCase();
      if (focusLower.includes('upper') && template.targetMuscleGroups.some(mg => 
        ['chest', 'back', 'shoulders', 'arms'].includes(mg))) {
        score += 3;
      } else if (focusLower.includes('lower') && template.targetMuscleGroups.some(mg => 
        ['legs', 'glutes'].includes(mg))) {
        score += 3;
      } else if (focusLower.includes('full') && template.targetMuscleGroups.includes('full body')) {
        score += 3;
      } else if (focusLower.includes('cardio') && template.type === 'hiit') {
        score += 3;
      } else if (focusLower.includes('yoga') && template.type === 'yoga') {
        score += 3;
      }
      
      // Equipment considerations
      if (requirements.equipment === 'bodyweight' && template.name.includes('Bodyweight')) {
        score += 2;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    }
    
    // If no good match, create dynamic template
    if (bestScore < 3) {
      return this.createDynamicTemplate(requirements);
    }
    
    return bestTemplate;
  }

  // Create dynamic template when no existing template fits well
  private createDynamicTemplate(requirements: WorkoutRequirements): WorkoutTemplate {
    const { duration, focus, level } = requirements;
    
    const warmupDuration = Math.min(8, Math.max(3, Math.round(duration * 0.15)));
    const cooldownDuration = Math.min(5, Math.max(2, Math.round(duration * 0.1)));
    const mainDuration = duration - warmupDuration - cooldownDuration;
    
    let targetMuscleGroups: string[] = [];
    let workoutType: 'strength' | 'cardio' | 'hiit' | 'yoga' | 'flexibility' = 'strength';
    
    const focusLower = focus.toLowerCase();
    if (focusLower.includes('chest')) targetMuscleGroups = ['chest', 'triceps'];
    else if (focusLower.includes('back')) targetMuscleGroups = ['back', 'biceps'];
    else if (focusLower.includes('legs')) targetMuscleGroups = ['legs', 'glutes'];
    else if (focusLower.includes('shoulders')) targetMuscleGroups = ['shoulders'];
    else if (focusLower.includes('arms')) targetMuscleGroups = ['biceps', 'triceps'];
    else if (focusLower.includes('cardio')) {
      targetMuscleGroups = ['full body'];
      workoutType = 'cardio';
    } else if (focusLower.includes('hiit')) {
      targetMuscleGroups = ['full body'];
      workoutType = 'hiit';
    } else {
      targetMuscleGroups = ['full body'];
    }
    
    return {
      name: `Custom ${focus} Workout`,
      type: workoutType,
      structure: [
        {
          name: 'Warm-up',
          duration: warmupDuration,
          exercises: [],
          restBetweenExercises: 30
        },
        {
          name: 'Main',
          duration: mainDuration,
          exercises: [],
          restBetweenExercises: workoutType === 'cardio' ? 30 : 90
        },
        {
          name: 'Cool-down',
          duration: cooldownDuration,
          exercises: [],
          restBetweenExercises: 15
        }
      ],
      totalDuration: duration,
      targetMuscleGroups,
      difficulty: level
    };
  }

  // Select exercises based on requirements and template
  private async selectExercises(requirements: WorkoutRequirements, template: WorkoutTemplate): Promise<Exercise[]> {
    const { equipment, limitations, preferredExercises, excludedExercises } = requirements;
    
    // Determine available equipment
    let availableEquipment: string[] = [];
    switch (equipment.toLowerCase()) {
      case 'gym':
        availableEquipment = ['barbell', 'dumbbells', 'machines', 'cables', 'bench'];
        break;
      case 'home':
        availableEquipment = ['dumbbells', 'resistance bands', 'bench'];
        break;
      case 'minimal':
        availableEquipment = ['dumbbells', 'resistance bands'];
        break;
      case 'bodyweight':
      default:
        availableEquipment = [];
        break;
    }
    
    // Search for exercises matching template requirements
    const exercisePool = await exerciseDatabase.searchExercises('', {
      muscleGroups: template.targetMuscleGroups,
      equipment: availableEquipment.length > 0 ? availableEquipment : undefined,
      difficulty: [template.difficulty],
      excludeInjury: limitations
    });
    
    // Filter out excluded exercises
    const filteredPool = exercisePool.filter(exercise => 
      !excludedExercises?.includes(exercise.id) &&
      !excludedExercises?.some(excluded => exercise.name.toLowerCase().includes(excluded.toLowerCase()))
    );
    
    // Prioritize preferred exercises
    const prioritizedPool = [...filteredPool].sort((a, b) => {
      const aPreferred = preferredExercises?.some(pref => 
        a.id === pref || a.name.toLowerCase().includes(pref.toLowerCase())
      ) ? 1 : 0;
      const bPreferred = preferredExercises?.some(pref => 
        b.id === pref || b.name.toLowerCase().includes(pref.toLowerCase())
      ) ? 1 : 0;
      
      return bPreferred - aPreferred;
    });
    
    return prioritizedPool;
  }

  // Assemble final workout from template and exercises
  private assembleWorkout(
    requirements: WorkoutRequirements, 
    template: WorkoutTemplate, 
    exercisePool: Exercise[]
  ): GeneratedWorkout {
    const selectedExercises: Exercise[] = [];
    const workoutSections: WorkoutSection[] = [];
    
    // Process each section of the template
    for (const section of template.structure) {
      const sectionExercises: Exercise[] = [];
      const sectionSelections: ExerciseSelection[] = [];
      
      if (section.name === 'Warm-up') {
        // Select warm-up exercises
        const warmupExercises = this.selectWarmupExercises(exercisePool, section.duration);
        sectionExercises.push(...warmupExercises);
        
        // Create exercise selections for warm-up
        warmupExercises.forEach(exercise => {
          sectionSelections.push({
            exerciseId: exercise.id,
            sets: 1,
            reps: exercise.category === 'cardio' ? '30-60s' : '10-15',
            restBetweenSets: 30
          });
        });
        
      } else if (section.name === 'Cool-down') {
        // Select cool-down exercises
        const cooldownExercises = this.selectCooldownExercises(exercisePool, section.duration);
        sectionExercises.push(...cooldownExercises);
        
        cooldownExercises.forEach(exercise => {
          sectionSelections.push({
            exerciseId: exercise.id,
            sets: 1,
            reps: '30-90s',
            restBetweenSets: 15
          });
        });
        
      } else {
        // Main workout section
        const mainExercises = this.selectMainExercises(
          exercisePool, 
          template.targetMuscleGroups, 
          section.duration,
          requirements.level
        );
        sectionExercises.push(...mainExercises);
        
        mainExercises.forEach(exercise => {
          const selection = this.createExerciseSelection(exercise, requirements.level, template.type);
          sectionSelections.push(selection);
        });
      }
      
      selectedExercises.push(...sectionExercises);
      
      workoutSections.push({
        ...section,
        exercises: sectionSelections
      });
    }
    
    // Calculate total calories
    const totalCalories = this.calculateWorkoutCalories(selectedExercises, requirements.duration);
    
    // Determine equipment needed
    const equipmentNeeded = Array.from(new Set(
      selectedExercises.flatMap(exercise => exercise.equipment)
    ));
    
    // Create workout description
    const description = this.generateWorkoutDescription(requirements, template, selectedExercises);
    
    return {
      id: `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: template.name,
      description,
      duration: requirements.duration,
      difficulty: requirements.level,
      type: template.type,
      calories: totalCalories,
      exercises: selectedExercises,
      sections: workoutSections,
      tags: [template.type, requirements.level, requirements.focus],
      equipment: equipmentNeeded,
      muscleGroups: template.targetMuscleGroups,
      notes: [
        `Generated for ${requirements.level} level`,
        `Focus: ${requirements.focus}`,
        `Equipment: ${requirements.equipment}`,
        limitations?.length ? `Accommodates: ${limitations.join(', ')}` : ''
      ].filter(Boolean)
    };
  }

  // Helper methods for exercise selection
  private selectWarmupExercises(exercisePool: Exercise[], duration: number): Exercise[] {
    const warmupExercises = exercisePool.filter(exercise => 
      exercise.tags.includes('warm-up') || 
      exercise.category === 'flexibility' ||
      exercise.tags.includes('mobility') ||
      exercise.caloriesPerMinute <= 5
    );
    
    // Select 2-3 warm-up exercises
    return warmupExercises.slice(0, Math.min(3, Math.max(2, Math.floor(duration / 2))));
  }

  private selectCooldownExercises(exercisePool: Exercise[], duration: number): Exercise[] {
    const cooldownExercises = exercisePool.filter(exercise => 
      exercise.category === 'flexibility' ||
      exercise.tags.includes('stretch') ||
      exercise.tags.includes('relaxation') ||
      exercise.caloriesPerMinute <= 3
    );
    
    return cooldownExercises.slice(0, Math.min(2, Math.max(1, Math.floor(duration / 2))));
  }

  private selectMainExercises(
    exercisePool: Exercise[], 
    targetMuscleGroups: string[], 
    duration: number,
    level: string
  ): Exercise[] {
    // Prioritize compound exercises
    const compoundExercises = exercisePool.filter(exercise => 
      exercise.tags.includes('compound') && 
      exercise.muscleGroups.some(group => targetMuscleGroups.includes(group))
    );
    
    const isolationExercises = exercisePool.filter(exercise => 
      exercise.tags.includes('isolation') && 
      exercise.muscleGroups.some(group => targetMuscleGroups.includes(group))
    );
    
    // Calculate number of exercises based on duration
    const exerciseCount = Math.min(8, Math.max(3, Math.floor(duration / 4)));
    
    // Select mix of compound and isolation exercises
    const compoundCount = Math.ceil(exerciseCount * 0.6);
    const isolationCount = exerciseCount - compoundCount;
    
    const selectedExercises: Exercise[] = [];
    
    // Add compound exercises
    selectedExercises.push(...compoundExercises.slice(0, compoundCount));
    
    // Add isolation exercises
    selectedExercises.push(...isolationExercises.slice(0, isolationCount));
    
    // Fill remaining slots with any suitable exercises
    if (selectedExercises.length < exerciseCount) {
      const remaining = exercisePool.filter(exercise => 
        !selectedExercises.includes(exercise) &&
        exercise.muscleGroups.some(group => targetMuscleGroups.includes(group))
      );
      
      selectedExercises.push(...remaining.slice(0, exerciseCount - selectedExercises.length));
    }
    
    return selectedExercises;
  }

  private createExerciseSelection(exercise: Exercise, level: string, workoutType: string): ExerciseSelection {
    let sets = exercise.sets;
    let reps = exercise.reps;
    let restBetweenSets = 60;
    
    // Adjust based on difficulty level
    if (level === 'beginner') {
      sets = Math.max(1, sets - 1);
      if (typeof reps === 'string' && reps.includes('-')) {
        const [min] = reps.split('-');
        reps = `${min}-${parseInt(min) + 3}`;
      }
      restBetweenSets = 90;
    } else if (level === 'advanced') {
      sets = Math.min(6, sets + 1);
      restBetweenSets = workoutType === 'hiit' ? 30 : 75;
    }
    
    // Adjust based on workout type
    if (workoutType === 'hiit') {
      restBetweenSets = Math.min(45, restBetweenSets);
      if (exercise.category === 'cardio') {
        reps = '30-45s';
      }
    } else if (workoutType === 'strength') {
      restBetweenSets = Math.max(60, restBetweenSets);
    }
    
    return {
      exerciseId: exercise.id,
      sets,
      reps,
      weight: exercise.weight,
      duration: exercise.duration,
      restBetweenSets,
      notes: exercise.difficulty === 'advanced' ? 'Focus on form' : undefined
    };
  }

  private calculateWorkoutCalories(exercises: Exercise[], duration: number): number {
    const avgCaloriesPerMinute = exercises.reduce((sum, exercise) => 
      sum + exercise.caloriesPerMinute, 0) / exercises.length;
    
    return Math.round(avgCaloriesPerMinute * duration);
  }

  private generateWorkoutDescription(
    requirements: WorkoutRequirements,
    template: WorkoutTemplate,
    exercises: Exercise[]
  ): string {
    const { duration, focus, level, equipment } = requirements;
    
    const muscleGroups = Array.from(new Set(
      exercises.flatMap(exercise => exercise.muscleGroups)
    )).join(', ');
    
    return `A ${duration}-minute ${level} ${focus} workout targeting ${muscleGroups}. ` +
           `Designed for ${equipment} training with ${exercises.length} carefully selected exercises. ` +
           `This workout follows a ${template.type} approach to help you achieve your fitness goals.`;
  }

  // Generate quick workout suggestions
  async generateQuickSuggestions(
    muscleGroup: string, 
    timeAvailable: number
  ): Promise<GeneratedWorkout[]> {
    const suggestions: GeneratedWorkout[] = [];
    
    // Generate 3 different workout options
    const levels: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
    const equipmentOptions = ['bodyweight', 'minimal', 'gym'];
    
    for (let i = 0; i < 3; i++) {
      const requirements: WorkoutRequirements = {
        duration: timeAvailable,
        focus: muscleGroup,
        equipment: equipmentOptions[i],
        level: levels[i % 3],
        goals: ['strength']
      };
      
      try {
        const workout = await this.generateWorkout(requirements);
        workout.title = `${workout.title} (${requirements.equipment})`;
        suggestions.push(workout);
      } catch (error) {
        console.error('Error generating suggestion:', error);
      }
    }
    
    return suggestions;
  }

  // Generate recovery/deload workout
  async generateRecoveryWorkout(duration: number = 30): Promise<GeneratedWorkout> {
    const requirements: WorkoutRequirements = {
      duration,
      focus: 'recovery',
      equipment: 'bodyweight',
      level: 'beginner',
      goals: ['flexibility', 'recovery']
    };
    
    // Override with recovery-specific template
    const recoveryTemplate: WorkoutTemplate = {
      name: 'Recovery & Mobility',
      type: 'flexibility',
      structure: [
        {
          name: 'Gentle Movement',
          duration: Math.round(duration * 0.3),
          exercises: [],
          restBetweenExercises: 15
        },
        {
          name: 'Stretching',
          duration: Math.round(duration * 0.6),
          exercises: [],
          restBetweenExercises: 30
        },
        {
          name: 'Relaxation',
          duration: Math.round(duration * 0.1),
          exercises: [],
          restBetweenExercises: 0
        }
      ],
      totalDuration: duration,
      targetMuscleGroups: ['full body'],
      difficulty: 'beginner'
    };
    
    const exercisePool = await exerciseDatabase.searchExercises('', {
      category: ['flexibility'],
      difficulty: ['beginner']
    });
    
    return this.assembleWorkout(requirements, recoveryTemplate, exercisePool);
  }
}

export const workoutGenerator = new WorkoutGenerator();
export type { WorkoutRequirements, GeneratedWorkout, WorkoutSection, ExerciseSelection };