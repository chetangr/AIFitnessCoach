// Simple interface and data for basic exercise functionality
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
  exercises: string[];
  daysPerWeek: number;
  estimatedCalories: number;
  equipment: string[];
}

// Basic exercises for immediate use
export const basicExercises: Exercise[] = [
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
    id: 'back_001',
    name: 'Pull-ups',
    category: 'Back',
    primaryMuscles: ['Back', 'Biceps'],
    secondaryMuscles: ['Shoulders'],
    equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    description: 'Upper body pulling exercise',
    instructions: [
      'Hang from pull-up bar with arms extended',
      'Pull body up until chin clears the bar',
      'Lower with control to starting position'
    ],
    tips: ['Start with assisted variations if needed', 'Focus on pulling with back muscles']
  }
];

// Basic workout programs
export const workoutPrograms: WorkoutProgram[] = [
  {
    id: '1',
    name: 'Beginner Full Body',
    description: 'Perfect starter program for new fitness enthusiasts',
    duration: '45 min',
    level: 'Beginner',
    category: 'Full Body',
    trainer: 'Coach Maya',
    rating: 4.8,
    exercises: ['chest_001', 'back_001'],
    daysPerWeek: 3,
    estimatedCalories: 300,
    equipment: ['Bodyweight', 'Pull-up Bar']
  }
];

// Simple getExerciseById function
export const getExerciseById = (id: string): Exercise | undefined => {
  return basicExercises.find(exercise => exercise.id === id);
};