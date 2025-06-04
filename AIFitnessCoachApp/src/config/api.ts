// API Configuration
// Use your computer's IP address for mobile/simulator access
// For Android emulator use: http://10.0.2.2:8000
// For iOS simulator use: http://localhost:8000
// For physical device use: http://YOUR_MACHINE_IP:8000
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || (__DEV__ 
  ? 'http://192.168.1.187:8000'  // Update with your machine's IP
  : 'https://api.aifitnesscoach.com');  // Production server

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