import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutPlan, WorkoutExercise } from '@/types/models';
import workoutService from '@/services/workoutService';

interface WorkoutState {
  workouts: WorkoutPlan[];
  currentWorkout: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWorkouts: () => Promise<void>;
  fetchWorkoutById: (id: string) => Promise<WorkoutPlan | null>;
  createWorkout: (workout: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkoutPlan | null>;
  updateWorkout: (id: string, updates: Partial<WorkoutPlan>) => Promise<boolean>;
  deleteWorkout: (id: string) => Promise<boolean>;
  moveWorkout: (workoutId: string, newDate: Date) => Promise<boolean>;
  completeWorkout: (workoutId: string, metadata?: any) => Promise<boolean>;
  startWorkout: (workout: WorkoutPlan) => void;
  endWorkout: () => void;
  updateCurrentExercise: (exerciseId: string, updates: Partial<WorkoutExercise>) => void;
  clearError: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workouts: [],
      currentWorkout: null,
      isLoading: false,
      error: null,

      fetchWorkouts: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await workoutService.getUserWorkouts();
          
          if (response.success && response.data) {
            set({
              workouts: response.data.items,
              isLoading: false,
            });
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Failed to fetch workouts',
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'An unexpected error occurred',
          });
        }
      },

      fetchWorkoutById: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await workoutService.getWorkoutById(id);
          
          if (response.success && response.data) {
            set({ isLoading: false });
            return response.data;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Failed to fetch workout',
            });
            return null;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'An unexpected error occurred',
          });
          return null;
        }
      },

      createWorkout: async (workoutData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await workoutService.createWorkout(workoutData);
          
          if (response.success && response.data) {
            const workout = response.data;
            set((state) => ({
              workouts: [...state.workouts, workout],
              isLoading: false,
            }));
            return workout;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Failed to create workout',
            });
            return null;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'An unexpected error occurred',
          });
          return null;
        }
      },

      updateWorkout: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await workoutService.updateWorkout(id, updates);
          
          if (response.success) {
            set((state) => ({
              workouts: state.workouts.map((w) =>
                w.id === id ? { ...w, ...updates } : w
              ),
              isLoading: false,
            }));
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Failed to update workout',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'An unexpected error occurred',
          });
          return false;
        }
      },

      deleteWorkout: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await workoutService.deleteWorkout(id);
          
          if (response.success) {
            set((state) => ({
              workouts: state.workouts.filter((w) => w.id !== id),
              isLoading: false,
            }));
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Failed to delete workout',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'An unexpected error occurred',
          });
          return false;
        }
      },

      moveWorkout: async (workoutId, newDate) => {
        const workout = get().workouts.find((w) => w.id === workoutId);
        if (!workout) return false;

        const originalDate = workout.scheduledFor;
        
        // Update locally first for immediate UI feedback
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === workoutId
              ? {
                  ...w,
                  scheduledFor: newDate,
                  originalScheduledDate: originalDate,
                }
              : w
          ),
        }));

        // Then sync with backend
        const success = await get().updateWorkout(workoutId, {
          scheduledFor: newDate,
          originalScheduledDate: originalDate,
        });

        if (!success) {
          // Revert on failure
          set((state) => ({
            workouts: state.workouts.map((w) =>
              w.id === workoutId
                ? { ...w, scheduledFor: originalDate, originalScheduledDate: undefined }
                : w
            ),
          }));
        }

        return success;
      },

      completeWorkout: async (workoutId, metadata) => {
        const success = await get().updateWorkout(workoutId, {
          isCompleted: true,
          completedAt: new Date(),
          metadata,
        });

        if (success) {
          // Update user stats
          const authStore = (await import('./authStore')).useAuthStore.getState();
          authStore.updateUser({
            totalWorkoutsCompleted: (authStore.user?.totalWorkoutsCompleted || 0) + 1,
            currentStreak: (authStore.user?.currentStreak || 0) + 1,
          });
        }

        return success;
      },

      startWorkout: (workout) => {
        set({ currentWorkout: workout });
      },

      endWorkout: () => {
        set({ currentWorkout: null });
      },

      updateCurrentExercise: (exerciseId, updates) => {
        set((state) => {
          if (!state.currentWorkout) return state;

          return {
            ...state,
            currentWorkout: {
              ...state.currentWorkout,
              exercises: state.currentWorkout.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, ...updates } : ex
              ),
            },
          };
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentWorkout: state.currentWorkout,
      }),
    },
  ),
);