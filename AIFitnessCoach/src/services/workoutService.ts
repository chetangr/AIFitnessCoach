import api from './api';
import {
  WorkoutPlan,
  Exercise,
  PaginatedResponse,
  ApiResponse,
} from '@/types/models';

interface CreateWorkoutData {
  name: string;
  description?: string;
  difficulty: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps?: number;
    duration?: number;
    restTime: number;
    weight?: number;
    notes?: string;
  }>;
  scheduledFor?: Date;
}

interface WorkoutStats {
  totalWorkouts: number;
  completedWorkouts: number;
  totalDuration: number;
  totalCaloriesBurned: number;
  currentStreak: number;
  longestStreak: number;
}

class WorkoutService {
  async getUserWorkouts(
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ApiResponse<PaginatedResponse<WorkoutPlan>>> {
    return api.get<PaginatedResponse<WorkoutPlan>>('/workouts/plans', {
      params: { page, page_size: pageSize },
    });
  }

  async getWorkoutById(id: string): Promise<ApiResponse<WorkoutPlan>> {
    return api.get<WorkoutPlan>(`/workouts/plans/${id}`);
  }

  async createWorkout(data: CreateWorkoutData): Promise<ApiResponse<WorkoutPlan>> {
    return api.post<WorkoutPlan>('/workouts/plans', data);
  }

  async updateWorkout(
    id: string,
    updates: Partial<WorkoutPlan>,
  ): Promise<ApiResponse<WorkoutPlan>> {
    return api.put<WorkoutPlan>(`/workouts/plans/${id}`, updates);
  }

  async deleteWorkout(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/workouts/plans/${id}`);
  }

  async duplicateWorkout(id: string): Promise<ApiResponse<WorkoutPlan>> {
    return api.post<WorkoutPlan>(`/workouts/plans/${id}/duplicate`);
  }

  async getWorkoutVersions(
    planId: string,
  ): Promise<ApiResponse<Array<{ version: number; createdAt: Date; changes: string }>>> {
    return api.get(`/workouts/plans/${planId}/versions`);
  }

  async revertWorkout(
    planId: string,
    version: number,
  ): Promise<ApiResponse<WorkoutPlan>> {
    return api.post<WorkoutPlan>(`/workouts/plans/${planId}/revert`, { version });
  }

  async getScheduledWorkouts(
    startDate: Date,
    endDate: Date,
  ): Promise<ApiResponse<WorkoutPlan[]>> {
    return api.get<WorkoutPlan[]>('/workouts/scheduled', {
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
  }

  async startWorkoutSession(
    workoutId: string,
  ): Promise<ApiResponse<{ sessionId: string }>> {
    return api.post<{ sessionId: string }>('/workouts/sessions/start', {
      workout_id: workoutId,
    });
  }

  async completeWorkoutSession(
    sessionId: string,
    data: {
      duration: number;
      exercisesCompleted: any[];
      notes?: string;
      rating?: number;
    },
  ): Promise<ApiResponse<void>> {
    return api.post(`/workouts/sessions/${sessionId}/complete`, data);
  }

  async getWorkoutStats(): Promise<ApiResponse<WorkoutStats>> {
    return api.get<WorkoutStats>('/workouts/stats');
  }

  async getRecommendedWorkouts(
    goals?: string[],
    equipment?: string[],
  ): Promise<ApiResponse<WorkoutPlan[]>> {
    return api.get<WorkoutPlan[]>('/workouts/recommended', {
      params: { goals, equipment },
    });
  }

  async generateAIWorkout(
    preferences: {
      duration: number;
      difficulty: string;
      focusAreas: string[];
      equipment: string[];
    },
  ): Promise<ApiResponse<WorkoutPlan>> {
    return api.post<WorkoutPlan>('/workouts/generate', preferences);
  }
}

export default new WorkoutService();