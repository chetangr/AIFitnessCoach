import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkoutSet {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  completed: boolean;
  duration?: number;
}

interface WorkoutSession {
  id: string;
  name: string;
  date: Date;
  duration: number;
  exercises: any[];
  totalWeight: number;
  totalSets: number;
  totalReps: number;
  caloriesBurned: number;
  notes: string;
  sets: WorkoutSet[];
}

interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  personalRecords: {
    maxWeight: number;
    maxReps: number;
    maxVolume: number; // weight * reps * sets
    maxOneRM: number; // estimated 1 rep max
  };
  recentSessions: WorkoutSet[];
  progressTrend: 'increasing' | 'stable' | 'decreasing';
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  averageWeight: number;
  strengthScore: number; // calculated score based on progress
}

interface ProgressMetrics {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  averageWorkoutDuration: number;
  totalCaloriesBurned: number;
  strengthGains: number; // percentage improvement
  consistencyScore: number; // based on workout frequency
  exerciseProgress: ExerciseProgress[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
}

interface WeeklyStats {
  weekStart: Date;
  workouts: number;
  volume: number;
  duration: number;
  calories: number;
}

interface MonthlyStats {
  month: string;
  year: number;
  workouts: number;
  volume: number;
  duration: number;
  calories: number;
  strengthGain: number;
}

class WorkoutTrackingService {
  private readonly STORAGE_KEYS = {
    WORKOUT_SESSIONS: '@workout_sessions',
    EXERCISE_PROGRESS: '@exercise_progress',
    PROGRESS_METRICS: '@progress_metrics',
    PERSONAL_RECORDS: '@personal_records',
  };

  // Save a workout session
  async saveWorkoutSession(session: WorkoutSession): Promise<void> {
    try {
      const existingSessions = await this.getWorkoutSessions();
      const updatedSessions = [...existingSessions, session];
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.WORKOUT_SESSIONS,
        JSON.stringify(updatedSessions)
      );

      // Update progress metrics after saving session
      await this.updateProgressMetrics(session);
      
      console.log('Workout session saved:', session.id);
    } catch (error) {
      console.error('Error saving workout session:', error);
      throw new Error('Failed to save workout session');
    }
  }

  // Get all workout sessions
  async getWorkoutSessions(): Promise<WorkoutSession[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading workout sessions:', error);
      return [];
    }
  }

  // Save individual exercise set
  async saveExerciseSet(set: WorkoutSet): Promise<void> {
    try {
      const existingSets = await this.getExerciseSets(set.exerciseId);
      const updatedSets = [...existingSets, set];
      
      await AsyncStorage.setItem(
        `@exercise_sets_${set.exerciseId}`,
        JSON.stringify(updatedSets)
      );

      // Update exercise progress
      await this.updateExerciseProgress(set.exerciseId);
      
      console.log('Exercise set saved:', set);
    } catch (error) {
      console.error('Error saving exercise set:', error);
      throw new Error('Failed to save exercise set');
    }
  }

  // Get sets for specific exercise
  async getExerciseSets(exerciseId: string): Promise<WorkoutSet[]> {
    try {
      const data = await AsyncStorage.getItem(`@exercise_sets_${exerciseId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading exercise sets:', error);
      return [];
    }
  }

  // Update exercise progress after new set
  private async updateExerciseProgress(exerciseId: string): Promise<void> {
    try {
      const sets = await this.getExerciseSets(exerciseId);
      if (sets.length === 0) return;

      const progress = this.calculateExerciseProgress(exerciseId, sets);
      
      const existingProgress = await this.getExerciseProgress();
      const updatedProgress = existingProgress.filter(p => p.exerciseId !== exerciseId);
      updatedProgress.push(progress);

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.EXERCISE_PROGRESS,
        JSON.stringify(updatedProgress)
      );
    } catch (error) {
      console.error('Error updating exercise progress:', error);
    }
  }

  // Calculate progress metrics for specific exercise
  private calculateExerciseProgress(exerciseId: string, sets: WorkoutSet[]): ExerciseProgress {
    const completedSets = sets.filter(set => set.completed);
    
    if (completedSets.length === 0) {
      return {
        exerciseId,
        exerciseName: '', // Should be filled from exercise database
        personalRecords: {
          maxWeight: 0,
          maxReps: 0,
          maxVolume: 0,
          maxOneRM: 0,
        },
        recentSessions: [],
        progressTrend: 'stable',
        totalVolume: 0,
        totalSets: 0,
        totalReps: 0,
        averageWeight: 0,
        strengthScore: 0,
      };
    }

    // Calculate personal records
    const maxWeight = Math.max(...completedSets.map(set => set.weight));
    const maxReps = Math.max(...completedSets.map(set => set.reps));
    const volumes = completedSets.map(set => set.weight * set.reps);
    const maxVolume = Math.max(...volumes);
    const maxOneRM = this.calculateOneRepMax(maxWeight, maxReps);

    // Calculate totals
    const totalVolume = volumes.reduce((sum, volume) => sum + volume, 0);
    const totalSets = completedSets.length;
    const totalReps = completedSets.reduce((sum, set) => sum + set.reps, 0);
    const averageWeight = completedSets.reduce((sum, set) => sum + set.weight, 0) / totalSets;

    // Calculate progress trend (comparing last 5 sessions vs previous 5)
    const recentSets = completedSets.slice(-5);
    const previousSets = completedSets.slice(-10, -5);
    const progressTrend = this.calculateProgressTrend(recentSets, previousSets);

    // Calculate strength score (0-100 based on volume and consistency)
    const strengthScore = this.calculateStrengthScore(completedSets, totalVolume, maxOneRM);

    return {
      exerciseId,
      exerciseName: '', // Should be filled from exercise database
      personalRecords: {
        maxWeight,
        maxReps,
        maxVolume,
        maxOneRM,
      },
      recentSessions: recentSets,
      progressTrend,
      totalVolume,
      totalSets,
      totalReps,
      averageWeight,
      strengthScore,
    };
  }

  // Calculate estimated 1 rep max using Epley formula
  private calculateOneRepMax(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
  }

  // Calculate progress trend
  private calculateProgressTrend(recentSets: WorkoutSet[], previousSets: WorkoutSet[]): 'increasing' | 'stable' | 'decreasing' {
    if (previousSets.length === 0) return 'stable';

    const recentAvgVolume = recentSets.reduce((sum, set) => sum + (set.weight * set.reps), 0) / recentSets.length;
    const previousAvgVolume = previousSets.reduce((sum, set) => sum + (set.weight * set.reps), 0) / previousSets.length;

    const changePercent = ((recentAvgVolume - previousAvgVolume) / previousAvgVolume) * 100;

    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  }

  // Calculate strength score (0-100)
  private calculateStrengthScore(sets: WorkoutSet[], totalVolume: number, maxOneRM: number): number {
    const consistencyScore = Math.min(sets.length * 2, 50); // Max 50 points for consistency
    const strengthScore = Math.min(maxOneRM / 10, 30); // Max 30 points for strength
    const volumeScore = Math.min(totalVolume / 1000, 20); // Max 20 points for volume

    return Math.round(consistencyScore + strengthScore + volumeScore);
  }

  // Get exercise progress data
  async getExerciseProgress(): Promise<ExerciseProgress[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.EXERCISE_PROGRESS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading exercise progress:', error);
      return [];
    }
  }

  // Update overall progress metrics
  private async updateProgressMetrics(newSession: WorkoutSession): Promise<void> {
    try {
      const allSessions = await this.getWorkoutSessions();
      const exerciseProgress = await this.getExerciseProgress();

      const metrics: ProgressMetrics = {
        totalWorkouts: allSessions.length,
        totalVolume: allSessions.reduce((sum, session) => sum + session.totalWeight, 0),
        totalSets: allSessions.reduce((sum, session) => sum + session.totalSets, 0),
        totalReps: allSessions.reduce((sum, session) => sum + session.totalReps, 0),
        averageWorkoutDuration: allSessions.reduce((sum, session) => sum + session.duration, 0) / allSessions.length,
        totalCaloriesBurned: allSessions.reduce((sum, session) => sum + session.caloriesBurned, 0),
        strengthGains: this.calculateStrengthGains(exerciseProgress),
        consistencyScore: this.calculateConsistencyScore(allSessions),
        exerciseProgress,
        weeklyStats: this.calculateWeeklyStats(allSessions),
        monthlyStats: this.calculateMonthlyStats(allSessions),
      };

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.PROGRESS_METRICS,
        JSON.stringify(metrics)
      );
    } catch (error) {
      console.error('Error updating progress metrics:', error);
    }
  }

  // Calculate overall strength gains
  private calculateStrengthGains(exerciseProgress: ExerciseProgress[]): number {
    if (exerciseProgress.length === 0) return 0;

    const increasingCount = exerciseProgress.filter(ep => ep.progressTrend === 'increasing').length;
    return Math.round((increasingCount / exerciseProgress.length) * 100);
  }

  // Calculate consistency score based on workout frequency
  private calculateConsistencyScore(sessions: WorkoutSession[]): number {
    if (sessions.length === 0) return 0;

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentSessions = sessions.filter(session => session.date >= last30Days);
    const expectedWorkouts = 12; // 3 workouts per week for 4 weeks
    
    return Math.min(Math.round((recentSessions.length / expectedWorkouts) * 100), 100);
  }

  // Calculate weekly statistics
  private calculateWeeklyStats(sessions: WorkoutSession[]): WeeklyStats[] {
    const weeklyStats: WeeklyStats[] = [];
    const last12Weeks = new Date();
    last12Weeks.setDate(last12Weeks.getDate() - 84); // 12 weeks ago

    const recentSessions = sessions.filter(session => session.date >= last12Weeks);

    // Group sessions by week
    const weeklyGroups: { [key: string]: WorkoutSession[] } = {};
    
    recentSessions.forEach(session => {
      const weekStart = this.getWeekStart(session.date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = [];
      }
      weeklyGroups[weekKey].push(session);
    });

    // Calculate stats for each week
    Object.entries(weeklyGroups).forEach(([weekKey, sessions]) => {
      const weekStart = new Date(weekKey);
      weeklyStats.push({
        weekStart,
        workouts: sessions.length,
        volume: sessions.reduce((sum, s) => sum + s.totalWeight, 0),
        duration: sessions.reduce((sum, s) => sum + s.duration, 0),
        calories: sessions.reduce((sum, s) => sum + s.caloriesBurned, 0),
      });
    });

    return weeklyStats.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }

  // Calculate monthly statistics
  private calculateMonthlyStats(sessions: WorkoutSession[]): MonthlyStats[] {
    const monthlyStats: MonthlyStats[] = [];
    const last12Months = new Date();
    last12Months.setMonth(last12Months.getMonth() - 12);

    const recentSessions = sessions.filter(session => session.date >= last12Months);

    // Group sessions by month
    const monthlyGroups: { [key: string]: WorkoutSession[] } = {};
    
    recentSessions.forEach(session => {
      const monthKey = `${session.date.getFullYear()}-${session.date.getMonth()}`;
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey].push(session);
    });

    // Calculate stats for each month
    Object.entries(monthlyGroups).forEach(([monthKey, sessions]) => {
      const [year, month] = monthKey.split('-');
      const monthName = new Date(parseInt(year), parseInt(month)).toLocaleDateString('en-US', { month: 'long' });
      
      // Calculate strength gain for this month (simplified)
      const strengthGain = Math.random() * 10; // TODO: Implement proper calculation
      
      monthlyStats.push({
        month: monthName,
        year: parseInt(year),
        workouts: sessions.length,
        volume: sessions.reduce((sum, s) => sum + s.totalWeight, 0),
        duration: sessions.reduce((sum, s) => sum + s.duration, 0),
        calories: sessions.reduce((sum, s) => sum + s.caloriesBurned, 0),
        strengthGain,
      });
    });

    return monthlyStats.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(`${a.month} 1, ${a.year}`).getMonth() - new Date(`${b.month} 1, ${b.year}`).getMonth();
    });
  }

  // Get week start date (Monday)
  private getWeekStart(date: Date): Date {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  // Get progress metrics
  async getProgressMetrics(): Promise<ProgressMetrics | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.PROGRESS_METRICS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading progress metrics:', error);
      return null;
    }
  }

  // Export data for external apps
  async exportWorkoutData(): Promise<{
    sessions: WorkoutSession[];
    exerciseProgress: ExerciseProgress[];
    metrics: ProgressMetrics | null;
  }> {
    try {
      const sessions = await this.getWorkoutSessions();
      const exerciseProgress = await this.getExerciseProgress();
      const metrics = await this.getProgressMetrics();

      return {
        sessions,
        exerciseProgress,
        metrics,
      };
    } catch (error) {
      console.error('Error exporting workout data:', error);
      throw new Error('Failed to export workout data');
    }
  }

  // Format data for Hevy export
  async exportToHevyFormat(): Promise<string> {
    try {
      const sessions = await this.getWorkoutSessions();
      
      // Hevy CSV format
      const headers = ['Date', 'Workout Name', 'Exercise Name', 'Set Order', 'Weight', 'Reps', 'Distance', 'Seconds', 'Notes', 'Workout Notes', 'RPE'];
      
      const csvRows = [headers.join(',')];
      
      sessions.forEach(session => {
        session.sets.forEach((set, index) => {
          const row = [
            session.date.toISOString().split('T')[0],
            session.name,
            set.exerciseId, // Should be exercise name
            (index + 1).toString(),
            set.weight.toString(),
            set.reps.toString(),
            '', // Distance (for cardio)
            set.duration?.toString() || '',
            '', // Notes
            session.notes,
            '', // RPE
          ];
          csvRows.push(row.join(','));
        });
      });

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting to Hevy format:', error);
      throw new Error('Failed to export to Hevy format');
    }
  }

  // Clear all workout data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.WORKOUT_SESSIONS,
        this.STORAGE_KEYS.EXERCISE_PROGRESS,
        this.STORAGE_KEYS.PROGRESS_METRICS,
        this.STORAGE_KEYS.PERSONAL_RECORDS,
      ]);
      
      console.log('All workout data cleared');
    } catch (error) {
      console.error('Error clearing workout data:', error);
      throw new Error('Failed to clear workout data');
    }
  }

  // Finish/Complete a workout (alias for saveWorkoutSession)
  async finishWorkout(workoutData: {
    workoutId: string;
    duration: number;
    exercises: any[];
  }): Promise<void> {
    try {
      const session: WorkoutSession = {
        id: workoutData.workoutId,
        name: 'Workout Session',
        date: new Date(),
        duration: workoutData.duration,
        exercises: workoutData.exercises,
        totalWeight: 0,
        totalSets: 0,
        totalReps: 0,
        caloriesBurned: Math.round(workoutData.duration / 60 * 8),
        notes: '',
        sets: []
      };
      
      await this.saveWorkoutSession(session);
    } catch (error) {
      console.error('Error finishing workout:', error);
      throw error;
    }
  }

  // Get exercises for a specific workout (mock implementation)
  async getExercisesForWorkout(workoutId: string): Promise<any[]> {
    // This is a placeholder - in a real app, this would fetch from the database
    return [
      {
        id: 'ex1',
        name: 'Bench Press',
        sets: 3,
        reps: 10,
        weight: 135
      },
      {
        id: 'ex2',
        name: 'Squats',
        sets: 3,
        reps: 12,
        weight: 185
      },
      {
        id: 'ex3',
        name: 'Deadlifts',
        sets: 3,
        reps: 8,
        weight: 225
      }
    ];
  }
}

export const workoutTrackingService = new WorkoutTrackingService();
export type { ExerciseProgress, ProgressMetrics, WeeklyStats, MonthlyStats };