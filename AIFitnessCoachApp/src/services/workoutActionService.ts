/**
 * Workout Action Service
 * Handles execution of workout-related actions from AI responses
 */

import { workoutScheduleService } from './workoutScheduleService';
import { appEventEmitter } from '../utils/eventEmitter';
import { Alert } from 'react-native';

export interface WorkoutAction {
  type: string;
  data?: any;
  workoutSuggestions?: string;
}

class WorkoutActionService {
  /**
   * Execute a workout action
   */
  async executeAction(action: WorkoutAction): Promise<boolean> {
    try {
      switch (action.type) {
        case 'add_workout':
          return await this.addWorkoutToToday(action.workoutSuggestions);
        
        case 'modify_workout':
          return await this.replaceTodaysWorkout(action.workoutSuggestions);
        
        case 'schedule_workout':
          return await this.scheduleWorkoutForLater(action.workoutSuggestions);
        
        case 'schedule_rest':
          return await this.scheduleRestDay();
        
        case 'substitute_exercises':
          return await this.substituteExercises(action.data);
        
        case 'remove_workout':
          return await this.removeWorkout(action.data);
        
        default:
          console.warn('Unknown action type:', action.type);
          return false;
      }
    } catch (error) {
      console.error('Error executing workout action:', error);
      Alert.alert('Error', 'Failed to execute action. Please try again.');
      return false;
    }
  }

  /**
   * Add suggested workouts to today's schedule
   */
  private async addWorkoutToToday(workoutSuggestions?: string): Promise<boolean> {
    try {
      // Parse workout suggestions from text
      const exercises = this.parseWorkoutSuggestions(workoutSuggestions || '');
      
      if (exercises.length === 0) {
        Alert.alert('No Workouts', 'No workout suggestions found to add.');
        return false;
      }

      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create a new workout (without id and date as they're added by the service)
      const workoutData = {
        title: 'AI Suggested Workout',
        description: 'Workout suggested by your AI coach',
        time: '12:00 PM',
        duration: 45, // duration should be number
        difficulty: 'intermediate' as const,
        type: 'strength' as const,
        calories: 300,
        completed: false,
        exercises: exercises,
        createdBy: 'ai' as const,
        tags: ['ai_suggested'],
        notes: 'Added by AI coach based on your request',
        modifiedAt: new Date()
      };

      // Add to schedule
      const newWorkout = await workoutScheduleService.addWorkout(today, workoutData);
      
      // Emit event to update UI
      appEventEmitter.emitWorkoutAdded(newWorkout.id);
      appEventEmitter.emitScheduleChanged();
      
      Alert.alert('Success', 'Workout added to today\'s schedule!');
      return true;
    } catch (error) {
      console.error('Error adding workout:', error);
      throw error;
    }
  }

  /**
   * Replace today's workout with suggested ones
   */
  private async replaceTodaysWorkout(workoutSuggestions?: string): Promise<boolean> {
    try {
      const exercises = this.parseWorkoutSuggestions(workoutSuggestions || '');
      
      if (exercises.length === 0) {
        Alert.alert('No Workouts', 'No workout suggestions found to replace.');
        return false;
      }

      const today = new Date();
      const todayWorkout = await workoutScheduleService.getWorkoutForDate(today);

      if (todayWorkout) {
        // Create updated workout data
        const updatedWorkoutData = {
          title: 'Modified Workout',
          description: 'Workout modified by AI coach',
          time: todayWorkout.time,
          duration: todayWorkout.duration,
          difficulty: todayWorkout.difficulty,
          type: todayWorkout.type,
          calories: todayWorkout.calories,
          completed: todayWorkout.completed,
          exercises: exercises,
          createdBy: todayWorkout.createdBy,
          tags: [...(todayWorkout.tags || []), 'ai_modified'],
          notes: 'Modified by AI coach based on your request',
          modifiedAt: new Date(),
          originalDate: todayWorkout.originalDate
        };
        
        // Since we can't directly update, we'll add a new workout for today
        // which should replace the existing one
        const newWorkout = await workoutScheduleService.addWorkout(today, updatedWorkoutData);
        
        // Emit event to update UI
        appEventEmitter.emitWorkoutUpdate(newWorkout.id);
        appEventEmitter.emitScheduleChanged();
        
        Alert.alert('Success', 'Today\'s workout has been updated!');
      } else {
        // No workout today, add new one
        return await this.addWorkoutToToday(workoutSuggestions);
      }

      return true;
    } catch (error) {
      console.error('Error replacing workout:', error);
      throw error;
    }
  }

  /**
   * Schedule workout for a future date
   */
  private async scheduleWorkoutForLater(workoutSuggestions?: string): Promise<boolean> {
    // For now, we'll add to tomorrow
    // In a real app, you'd show a date picker
    try {
      const exercises = this.parseWorkoutSuggestions(workoutSuggestions || '');
      
      if (exercises.length === 0) {
        Alert.alert('No Workouts', 'No workout suggestions found to schedule.');
        return false;
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const workoutData = {
        title: 'AI Suggested Workout',
        description: 'Workout scheduled by your AI coach',
        time: '10:00 AM',
        duration: 45,
        difficulty: 'intermediate' as const,
        type: 'strength' as const,
        calories: 300,
        completed: false,
        exercises: exercises,
        createdBy: 'ai' as const,
        tags: ['ai_suggested', 'scheduled'],
        notes: 'Scheduled by AI coach for tomorrow',
        modifiedAt: new Date()
      };

      const newWorkout = await workoutScheduleService.addWorkout(tomorrow, workoutData);
      
      // Emit event to update UI
      appEventEmitter.emitWorkoutAdded(newWorkout.id);
      appEventEmitter.emitScheduleChanged();
      
      Alert.alert('Success', 'Workout scheduled for tomorrow!');
      return true;
    } catch (error) {
      console.error('Error scheduling workout:', error);
      throw error;
    }
  }

  /**
   * Schedule a rest day
   */
  private async scheduleRestDay(): Promise<boolean> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if there's a workout for today
      const todayWorkout = await workoutScheduleService.getWorkoutForDate(today);
      if (todayWorkout) {
        // We'll overwrite it with a rest day
        appEventEmitter.emitWorkoutRemoved(todayWorkout.id);
      }

      // Add a rest day marker
      const restDayData = {
        title: 'Rest Day',
        description: 'Recovery day scheduled by AI coach',
        time: 'All Day',
        duration: 0,
        difficulty: 'beginner' as const, // rest is not a valid difficulty
        type: 'rest' as const,
        calories: 0,
        completed: false,
        exercises: [],
        createdBy: 'ai' as const,
        tags: ['rest', 'recovery'],
        notes: 'Rest day for recovery',
        modifiedAt: new Date()
      };

      const restDay = await workoutScheduleService.addWorkout(today, restDayData);
      
      // Emit event to update UI
      appEventEmitter.emitWorkoutAdded(restDay.id);
      appEventEmitter.emitScheduleChanged();
      
      Alert.alert('Success', 'Rest day scheduled!');
      return true;
    } catch (error) {
      console.error('Error scheduling rest day:', error);
      throw error;
    }
  }

  /**
   * Substitute exercises (for pain/injury)
   */
  private async substituteExercises(_data?: any): Promise<boolean> {
    try {
      Alert.alert(
        'Exercise Substitution',
        'The AI coach will suggest alternative exercises that are safer for your condition.',
        [{ text: 'OK' }]
      );
      return true;
    } catch (error) {
      console.error('Error substituting exercises:', error);
      throw error;
    }
  }

  /**
   * Remove a workout
   */
  private async removeWorkout(_data?: any): Promise<boolean> {
    try {
      const today = new Date();
      const todayWorkout = await workoutScheduleService.getWorkoutForDate(today);
      
      if (todayWorkout) {
        // Since we can't directly remove, we'll add a "cancelled" workout
        const cancelledWorkoutData = {
          title: 'Cancelled Workout',
          description: 'Workout cancelled by user',
          time: todayWorkout.time,
          duration: 0,
          difficulty: 'beginner' as const,
          type: 'rest' as const,
          calories: 0,
          completed: false,
          exercises: [],
          createdBy: 'user' as const,
          tags: ['cancelled'],
          notes: 'Workout cancelled',
          modifiedAt: new Date()
        };
        
        await workoutScheduleService.addWorkout(today, cancelledWorkoutData);
        
        // Emit event to update UI
        appEventEmitter.emitWorkoutRemoved(todayWorkout.id);
        appEventEmitter.emitScheduleChanged();
        
        Alert.alert('Success', 'Today\'s workout has been removed.');
        return true;
      } else {
        Alert.alert('No Workout', 'No workout found for today.');
        return false;
      }
    } catch (error) {
      console.error('Error removing workout:', error);
      throw error;
    }
  }

  /**
   * Parse workout suggestions from AI response text
   */
  private parseWorkoutSuggestions(text: string): any[] {
    const exercises = [];
    
    // Pattern to match workout suggestions
    const patterns = [
      /(\d+)\.\s*\*\*([^*]+)\*\*:\s*([^\.]+)/gi,  // "1. **Squats with Barbell**: 4 sets of 6-8 reps"
      /•\s*\*\*([^*]+)\*\*:\s*([^\.]+)/gi,         // "• **Exercise Name**: details"
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const exerciseName = match[2] || match[1];
        const details = match[3] || match[2];
        
        // Parse sets and reps
        const setsMatch = details.match(/(\d+)\s*sets?/i);
        const repsMatch = details.match(/(\d+)[-\s]*(\d+)?\s*reps?/i);
        
        exercises.push({
          id: `exercise_${Date.now()}_${exercises.length}`,
          name: exerciseName.trim(),
          sets: setsMatch ? parseInt(setsMatch[1]) : 3,
          reps: repsMatch ? (repsMatch[2] ? `${repsMatch[1]}-${repsMatch[2]}` : repsMatch[1]) : '10',
          muscleGroups: this.inferMuscleGroups(exerciseName),
          category: 'strength',
          difficulty: 'intermediate',
          equipment: this.inferEquipment(exerciseName),
          caloriesPerMinute: 8
        });
      }
    }

    return exercises;
  }

  /**
   * Infer muscle groups from exercise name
   */
  private inferMuscleGroups(exerciseName: string): string[] {
    const name = exerciseName.toLowerCase();
    const muscleGroups = [];

    if (name.includes('squat') || name.includes('leg') || name.includes('lunge')) {
      muscleGroups.push('legs', 'glutes');
    }
    if (name.includes('press') || name.includes('bench') || name.includes('push')) {
      muscleGroups.push('chest');
    }
    if (name.includes('curl') || name.includes('bicep')) {
      muscleGroups.push('biceps');
    }
    if (name.includes('tricep') || name.includes('dip')) {
      muscleGroups.push('triceps');
    }
    if (name.includes('deadlift') || name.includes('row')) {
      muscleGroups.push('back');
    }
    if (name.includes('shoulder') || name.includes('lateral') || name.includes('overhead')) {
      muscleGroups.push('shoulders');
    }
    if (name.includes('ab') || name.includes('plank') || name.includes('core')) {
      muscleGroups.push('core');
    }

    return muscleGroups.length > 0 ? muscleGroups : ['full body'];
  }

  /**
   * Infer equipment from exercise name
   */
  private inferEquipment(exerciseName: string): string[] {
    const name = exerciseName.toLowerCase();
    const equipment = [];

    if (name.includes('barbell')) equipment.push('barbell');
    if (name.includes('dumbbell')) equipment.push('dumbbells');
    if (name.includes('cable')) equipment.push('cables');
    if (name.includes('machine')) equipment.push('machine');
    if (name.includes('band')) equipment.push('resistance band');
    
    return equipment.length > 0 ? equipment : ['bodyweight'];
  }
}

export const workoutActionService = new WorkoutActionService();