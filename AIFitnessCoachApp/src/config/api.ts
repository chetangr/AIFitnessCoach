// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'  // Local development server
  : 'https://api.aifitnesscoach.com';  // Production server

export const WGER_API_URL = 'https://wger.de/api/v2';

export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  
  // User
  profile: '/api/users/profile',
  updateProfile: '/api/users/profile',
  
  // Workouts
  workouts: '/api/workouts',
  createWorkout: '/api/workouts',
  updateWorkout: (id: string) => `/api/workouts/${id}`,
  deleteWorkout: (id: string) => `/api/workouts/${id}`,
  
  // Exercises
  exercises: '/api/exercises',
  exerciseById: (id: string) => `/api/exercises/${id}`,
  
  // AI Coach
  aiChat: '/api/ai/chat',
  aiWorkoutGeneration: '/api/ai/generate-workout',
  
  // Progress
  progress: '/api/progress',
  logProgress: '/api/progress/log',
};