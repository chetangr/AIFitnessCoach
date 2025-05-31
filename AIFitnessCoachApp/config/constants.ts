// API Configuration
export const API_CONFIG = {
  // Use localhost for iOS simulator, 10.0.2.2 for Android emulator
  BASE_URL: __DEV__ 
    ? Platform.OS === 'ios'
      ? 'http://localhost:8000/api'
      : 'http://10.0.2.2:8000/api'
    : 'https://your-production-api.com/api',
  TIMEOUT: 30000,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'AI Fitness Coach',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@aifitnesscoach.com',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@ai_fitness_coach:auth_token',
  USER_DATA: '@ai_fitness_coach:user_data',
  THEME_PREFERENCE: '@ai_fitness_coach:theme',
  COACH_PREFERENCE: '@ai_fitness_coach:coach',
  WORKOUT_HISTORY: '@ai_fitness_coach:workout_history',
};

// Exercise Categories
export const EXERCISE_CATEGORIES = [
  { id: 'strength', name: 'Strength Training', icon: 'dumbbell' },
  { id: 'cardio', name: 'Cardio', icon: 'run' },
  { id: 'flexibility', name: 'Flexibility', icon: 'yoga' },
  { id: 'balance', name: 'Balance', icon: 'scale-balance' },
  { id: 'sports', name: 'Sports', icon: 'basketball' },
  { id: 'core', name: 'Core', icon: 'circle-slice-8' },
];

// Workout Difficulties
export const WORKOUT_DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner', color: '#10B981' },
  { value: 'intermediate', label: 'Intermediate', color: '#F59E0B' },
  { value: 'advanced', label: 'Advanced', color: '#EF4444' },
  { value: 'expert', label: 'Expert', color: '#7C3AED' },
];

// Muscle Groups
export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Core',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Full Body',
];

// Equipment Types
export const EQUIPMENT_TYPES = [
  'None (Bodyweight)',
  'Dumbbells',
  'Barbell',
  'Kettlebell',
  'Resistance Bands',
  'Cable Machine',
  'Pull-up Bar',
  'Bench',
  'Medicine Ball',
  'Foam Roller',
];

import { Platform } from 'react-native';