import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUT_PROGRESS_KEY = 'workout_progress';

export interface WorkoutProgress {
  workoutId: string;
  workoutDate: string;
  currentExerciseIndex: number;
  completedExercises: string[];
  exerciseSets: {
    [exerciseId: string]: {
      sets: Array<{
        weight: number;
        reps: number;
        completed: boolean;
      }>;
    };
  };
  startTime: string;
  lastUpdateTime: string;
  totalRestTime: number;
}

class WorkoutProgressService {
  async saveProgress(progress: WorkoutProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(WORKOUT_PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving workout progress:', error);
    }
  }

  async getProgress(workoutId: string, workoutDate: string): Promise<WorkoutProgress | null> {
    try {
      const savedProgress = await AsyncStorage.getItem(WORKOUT_PROGRESS_KEY);
      if (savedProgress) {
        const progress: WorkoutProgress = JSON.parse(savedProgress);
        // Check if it's the same workout and same date
        if (progress.workoutId === workoutId && progress.workoutDate === workoutDate) {
          return progress;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting workout progress:', error);
      return null;
    }
  }

  async clearProgress(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WORKOUT_PROGRESS_KEY);
    } catch (error) {
      console.error('Error clearing workout progress:', error);
    }
  }

  async hasActiveWorkout(): Promise<boolean> {
    try {
      const progress = await AsyncStorage.getItem(WORKOUT_PROGRESS_KEY);
      return progress !== null;
    } catch (error) {
      console.error('Error checking active workout:', error);
      return false;
    }
  }

  async getActiveWorkout(): Promise<WorkoutProgress | null> {
    try {
      const savedProgress = await AsyncStorage.getItem(WORKOUT_PROGRESS_KEY);
      if (savedProgress) {
        return JSON.parse(savedProgress);
      }
      return null;
    } catch (error) {
      console.error('Error getting active workout:', error);
      return null;
    }
  }
}

export const workoutProgressService = new WorkoutProgressService();