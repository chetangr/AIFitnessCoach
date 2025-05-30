// User Models
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImageUrl?: string;
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  currentWeight?: number; // kg
  targetWeight?: number; // kg
  height?: number; // cm
  age?: number;
  preferredCoachId: CoachPersonality;
  trainingEquipment: Equipment[];
  dietPreference?: DietPreference;
  mindsetActivities: MindsetActivity[];
  onboardingCompleted: boolean;
  totalWorkoutsCompleted: number;
  currentStreak: number;
  totalCaloriesBurned: number;
  totalMinutesTrained: number;
}

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum Goal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  GENERAL_FITNESS = 'general_fitness',
  STRENGTH = 'strength',
  ATHLETIC_PERFORMANCE = 'athletic_performance',
}

export enum CoachPersonality {
  EMMA = 'emma', // Supportive
  MAX = 'max', // Aggressive
  DR_PROGRESS = 'dr_progress', // Steady Pace
}

export enum Equipment {
  NONE = 'none',
  DUMBBELLS = 'dumbbells',
  BARBELL = 'barbell',
  RESISTANCE_BANDS = 'resistance_bands',
  KETTLEBELL = 'kettlebell',
  PULL_UP_BAR = 'pull_up_bar',
  YOGA_MAT = 'yoga_mat',
  FOAM_ROLLER = 'foam_roller',
  MEDICINE_BALL = 'medicine_ball',
  BENCH = 'bench',
  CABLES = 'cables',
  MACHINES = 'machines',
}

export enum DietPreference {
  NONE = 'none',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  KETO = 'keto',
  PALEO = 'paleo',
  MEDITERRANEAN = 'mediterranean',
  LOW_CARB = 'low_carb',
  HIGH_PROTEIN = 'high_protein',
}

export enum MindsetActivity {
  MEDITATION = 'meditation',
  JOURNALING = 'journaling',
  BREATHING_EXERCISES = 'breathing_exercises',
  VISUALIZATION = 'visualization',
  AFFIRMATIONS = 'affirmations',
  GRATITUDE = 'gratitude',
}

// Workout Models
export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  difficulty: Difficulty;
  durationMinutes: number;
  exercises: WorkoutExercise[];
  equipmentRequired: Equipment[];
  muscleGroups: MuscleGroup[];
  scheduledFor?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  originalScheduledDate?: Date; // For tracking moved workouts
  metadata?: WorkoutMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps?: number;
  duration?: number; // seconds
  restTime: number; // seconds
  weight?: number; // kg
  notes?: string;
  orderIndex: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: MuscleGroup[];
  equipmentRequired: Equipment[];
  difficulty: Difficulty;
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  safetyNotes?: string[];
  variations?: ExerciseVariation[];
  category: ExerciseCategory;
}

export interface ExerciseVariation {
  name: string;
  difficulty: Difficulty;
  description: string;
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  CORE = 'core',
  QUADS = 'quads',
  HAMSTRINGS = 'hamstrings',
  GLUTES = 'glutes',
  CALVES = 'calves',
  FULL_BODY = 'full_body',
}

export enum ExerciseCategory {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  PLYOMETRIC = 'plyometric',
  OLYMPIC = 'olympic',
  POWERLIFTING = 'powerlifting',
  BODYWEIGHT = 'bodyweight',
}

export interface WorkoutMetadata {
  caloriesBurned?: number;
  heartRateAvg?: number;
  notes?: string;
  rating?: number; // 1-5
  aiSuggested?: boolean;
  modifiedFromPlanId?: string;
}

// AI Coach Models
export interface CoachingSession {
  id: string;
  userId: string;
  personalityType: CoachPersonality;
  conversationContext: ConversationContext;
  sessionStart: Date;
  sessionEnd?: Date;
  messageCount: number;
}

export interface CoachingMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: MessageMetadata;
  createdAt: Date;
}

export interface ConversationContext {
  currentGoals: Goal[];
  recentWorkouts: string[];
  userMood?: string;
  injuryStatus?: string[];
  preferences: any;
}

export interface MessageMetadata {
  workoutModification?: WorkoutModification;
  exerciseSuggestion?: string[];
  motivationalTone?: 'high' | 'medium' | 'low';
}

export interface WorkoutModification {
  planId: string;
  changes: ModificationChange[];
  reasoning: string;
}

export interface ModificationChange {
  type: 'add' | 'remove' | 'modify';
  exerciseId?: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
}

// Progress Tracking
export interface UserProgress {
  id: string;
  userId: string;
  metricType: ProgressMetric;
  value: number;
  unit: string;
  recordedAt: Date;
}

export enum ProgressMetric {
  WEIGHT = 'weight',
  BODY_FAT = 'body_fat',
  CHEST = 'chest',
  WAIST = 'waist',
  HIPS = 'hips',
  ARMS = 'arms',
  THIGHS = 'thighs',
  MAX_BENCH = 'max_bench',
  MAX_SQUAT = 'max_squat',
  MAX_DEADLIFT = 'max_deadlift',
  MILE_TIME = 'mile_time',
}

// Authentication
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  username: string; // email or username
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  fitnessLevel?: FitnessLevel;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  message?: string;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Onboarding
export interface OnboardingData {
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  currentWeight?: number;
  targetWeight?: number;
  height?: number;
  age?: number;
  trainingEquipment: Equipment[];
  preferredCoachId: CoachPersonality;
  workoutDays: number[];
  workoutTime?: string; // "morning", "afternoon", "evening"
  dietPreference?: DietPreference;
  injuries?: string[];
  mindsetActivities: MindsetActivity[];
}