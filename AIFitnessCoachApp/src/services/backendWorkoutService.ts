import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface WorkoutSession {
  id: string;
  workout_plan_id?: string;
  workout_name: string;
  started_at: string;
  ended_at?: string;
  total_duration_minutes?: number;
  total_sets: number;
  total_reps: number;
  total_volume: number;
  rating?: number;
  notes?: string;
}

export interface ExercisePerformance {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  exercise_name: string;
  order_in_workout: number;
  total_sets: number;
  total_reps: number;
  total_volume: number;
  average_rpe?: number;
  max_weight?: number;
  notes?: string;
}

export interface SetPerformance {
  id: string;
  exercise_performance_id: string;
  set_number: number;
  target_reps?: number;
  actual_reps: number;
  weight?: number;
  rpe?: number;
  is_warmup: boolean;
  is_drop_set: boolean;
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  exercise_id: string;
  exercise_name: string;
  pr_type: string;
  value: number;
  workout_session_id?: string;
  achieved_at: string;
}

export interface WorkoutSchedule {
  id: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

class BackendWorkoutService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Workout Sessions
  async startWorkoutSession(
    workoutName: string,
    workoutPlanId?: string,
    notes?: string
  ): Promise<WorkoutSession> {
    const response = await fetch(`${API_BASE_URL}/api/workout-sessions/start`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        workout_name: workoutName,
        workout_plan_id: workoutPlanId,
        notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start workout session');
    }

    return response.json();
  }

  async addExerciseToSession(
    sessionId: string,
    exerciseId: string,
    orderInWorkout: number,
    notes?: string
  ): Promise<ExercisePerformance> {
    const response = await fetch(
      `${API_BASE_URL}/api/workout-sessions/${sessionId}/exercise`,
      {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          exercise_id: exerciseId,
          order_in_workout: orderInWorkout,
          notes,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add exercise to session');
    }

    return response.json();
  }

  async recordSet(
    sessionId: string,
    exercisePerformanceId: string,
    setData: {
      set_number: number;
      target_reps?: number;
      actual_reps: number;
      weight?: number;
      rpe?: number;
      is_warmup?: boolean;
      is_drop_set?: boolean;
      notes?: string;
    }
  ): Promise<SetPerformance> {
    const response = await fetch(
      `${API_BASE_URL}/api/workout-sessions/${sessionId}/set`,
      {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          exercise_performance_id: exercisePerformanceId,
          ...setData,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to record set');
    }

    return response.json();
  }

  async updateSet(
    sessionId: string,
    setId: string,
    updates: {
      actual_reps?: number;
      weight?: number;
      rpe?: number;
      notes?: string;
    }
  ): Promise<SetPerformance> {
    const response = await fetch(
      `${API_BASE_URL}/api/workout-sessions/${sessionId}/set/${setId}`,
      {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update set');
    }

    return response.json();
  }

  async completeWorkoutSession(
    sessionId: string,
    rating?: number,
    notes?: string
  ): Promise<WorkoutSession> {
    const response = await fetch(
      `${API_BASE_URL}/api/workout-sessions/${sessionId}/complete`,
      {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ rating, notes }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to complete workout session');
    }

    return response.json();
  }

  async getWorkoutSessions(limit = 20, offset = 0): Promise<WorkoutSession[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/workout-sessions?limit=${limit}&offset=${offset}`,
      {
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch workout sessions');
    }

    return response.json();
  }

  async getWorkoutSessionDetails(sessionId: string): Promise<{
    session: WorkoutSession;
    exercises: Array<{
      performance: ExercisePerformance;
      sets: SetPerformance[];
    }>;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/workout-sessions/${sessionId}`,
      {
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch workout session details');
    }

    return response.json();
  }

  async deleteWorkoutSession(sessionId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/workout-sessions/${sessionId}`,
      {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete workout session');
    }
  }

  // Personal Records
  async getPersonalRecords(limit = 50, offset = 0): Promise<PersonalRecord[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/personal-records?limit=${limit}&offset=${offset}`,
      {
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch personal records');
    }

    return response.json();
  }

  async getExercisePersonalRecords(exerciseId: string): Promise<PersonalRecord[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/personal-records/exercise/${exerciseId}`,
      {
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exercise personal records');
    }

    return response.json();
  }

  async getRecentPersonalRecords(days = 30): Promise<PersonalRecord[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/personal-records/recent?days=${days}`,
      {
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recent personal records');
    }

    return response.json();
  }

  async calculatePersonalRecords(forceRecalculate = false): Promise<{
    message: string;
    records_created: number;
    records_updated: number;
    exercises_analyzed: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/personal-records/calculate`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ force_recalculate: forceRecalculate }),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate personal records');
    }

    return response.json();
  }

  // Workout Schedule
  async getWorkoutSchedule(): Promise<WorkoutSchedule> {
    const response = await fetch(`${API_BASE_URL}/api/workout-schedule`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workout schedule');
    }

    return response.json();
  }

  async updateWorkoutSchedule(schedule: Partial<WorkoutSchedule>): Promise<WorkoutSchedule> {
    const response = await fetch(`${API_BASE_URL}/api/workout-schedule`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(schedule),
    });

    if (!response.ok) {
      throw new Error('Failed to update workout schedule');
    }

    return response.json();
  }

  async moveWorkout(fromDay: string, toDay: string, swap = false): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/workout-schedule/move`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        from_day: fromDay,
        to_day: toDay,
        swap,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to move workout');
    }
  }

  async markRestDay(day: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/workout-schedule/rest-day`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ day }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark rest day');
    }
  }
}

export default new BackendWorkoutService();