import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { workoutScheduleService, WorkoutEvent, Exercise } from './workoutScheduleService';
// import { exerciseDatabase, AlternativeRequest } from './exerciseDatabase';
import { workoutGenerator, WorkoutRequirements } from './workoutGenerator';

// Types for AI Actions
interface AIAction {
  type: string;
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  requiresConfirmation: boolean;
  data?: any;
}

interface ConfirmationPrompt {
  id: string;
  message: string;
  options: ConfirmationOption[];
  data: any;
  timeout?: number;
}

interface ConfirmationOption {
  text: string;
  action: string;
  style: 'primary' | 'secondary' | 'destructive';
  data?: any;
}

// Using imported types from workoutScheduleService

interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  ui?: UIComponent[];
}

interface UIComponent {
  type: 'button' | 'list' | 'card' | 'confirmation';
  props: Record<string, any>;
}

class AIActionService {
  private readonly STORAGE_KEYS = {
    WORKOUT_SCHEDULE: '@workout_schedule',
    USER_PREFERENCES: '@user_preferences',
    PENDING_CONFIRMATIONS: '@pending_confirmations',
  };
  
  private servicesInitialized = false;
  
  private async ensureServicesInitialized(): Promise<void> {
    if (this.servicesInitialized) return;
    
    try {
      console.log('🔧 Initializing AI Action Service dependencies...');
      await Promise.all([
        workoutScheduleService.initializeDefaultSchedule(),
        // exerciseDatabase.initialize()
      ]);
      this.servicesInitialized = true;
      console.log('✅ AI Action Service dependencies initialized');
    } catch (error) {
      console.error('❌ Error initializing AI Action Service dependencies:', error);
      throw error;
    }
  }

  // Analyze user message for actionable intents
  async analyzeMessage(message: string): Promise<AIAction[]> {
    const lowerMessage = message.toLowerCase();
    const actions: AIAction[] = [];

    console.log('🔍 Analyzing message:', message);
    console.log('🔍 Lowercase message:', lowerMessage);

    // 1. Workout Schedule Queries
    const isWorkoutQ = this.isWorkoutQuery(lowerMessage);
    console.log('🔍 Is workout query:', isWorkoutQ);
    if (isWorkoutQ) {
      actions.push({
        type: 'GET_WORKOUT_INFO',
        intent: 'view_workout_schedule',
        entities: this.extractDateEntity(lowerMessage),
        confidence: 0.9,
        requiresConfirmation: false,
      });
    }

    // 2. Rest Day Requests
    const isRestDayReq = this.isRestDayRequest(lowerMessage);
    console.log('🔍 Is rest day request:', isRestDayReq);
    if (isRestDayReq) {
      actions.push({
        type: 'REQUEST_REST_DAY',
        intent: 'change_to_rest_day',
        entities: this.extractDateEntity(lowerMessage),
        confidence: 0.85,
        requiresConfirmation: true,
      });
    }

    // 3. Exercise Substitution
    if (this.isExerciseSubstitution(lowerMessage)) {
      actions.push({
        type: 'SUBSTITUTE_EXERCISE',
        intent: 'replace_exercise',
        entities: this.extractExerciseAndReason(lowerMessage),
        confidence: 0.8,
        requiresConfirmation: true,
      });
    }

    // 4. Workout Creation
    if (this.isWorkoutCreation(lowerMessage)) {
      actions.push({
        type: 'CREATE_WORKOUT',
        intent: 'create_custom_workout',
        entities: this.extractWorkoutRequirements(lowerMessage),
        confidence: 0.75,
        requiresConfirmation: true,
      });
    }

    // 5. Schedule Modification
    if (this.isScheduleModification(lowerMessage)) {
      actions.push({
        type: 'MODIFY_SCHEDULE',
        intent: 'change_workout_schedule',
        entities: this.extractScheduleChange(lowerMessage),
        confidence: 0.8,
        requiresConfirmation: true,
      });
    }

    console.log('🔍 Actions found:', actions.length, actions.map(a => a.type));
    return actions;
  }

  // Execute actions based on type
  async executeAction(action: AIAction): Promise<ActionResult> {
    try {
      // Ensure services are initialized
      await this.ensureServicesInitialized();
      
      switch (action.type) {
        case 'GET_WORKOUT_INFO':
          return await this.getWorkoutInfo(action.entities);
        
        case 'REQUEST_REST_DAY':
          return await this.requestRestDay(action.entities);
        
        case 'SUBSTITUTE_EXERCISE':
          return await this.substituteExercise(action.entities);
        
        case 'CREATE_WORKOUT':
          return await this.createCustomWorkout(action.entities);
        
        case 'MODIFY_SCHEDULE':
          return await this.modifySchedule(action.entities);
        
        default:
          return {
            success: false,
            message: 'Unknown action type'
          };
      }
    } catch (error) {
      console.error('Error executing action:', error);
      return {
        success: false,
        message: 'Failed to execute action. Please try again.'
      };
    }
  }

  // 1. Get Workout Information
  private async getWorkoutInfo(entities: any): Promise<ActionResult> {
    const targetDate = entities.date || new Date();
    const workout = await workoutScheduleService.getWorkoutForDate(targetDate);
    
    if (!workout) {
      return {
        success: true,
        message: `No workout scheduled for ${moment(targetDate).format('dddd, MMMM Do')}. It's a rest day! 🛌`,
        data: { type: 'rest_day', date: targetDate }
      };
    }

    const exerciseList = workout.exercises?.map(ex => 
      `• ${ex.name} (${ex.sets}×${ex.reps})`
    ).join('\n') || 'Exercise details not available';

    return {
      success: true,
      message: `**🏋️ ${workout.title}** - ${moment(targetDate).format('dddd, MMMM Do')}\n⏱️ ${workout.duration} min | 🔥 ${workout.calories} calories\n\n**Exercises:**\n${exerciseList}`,
      data: workout,
      ui: [{
        type: 'card',
        props: {
          workout: workout,
          showActions: true
        }
      }]
    };
  }

  // 2. Request Rest Day
  private async requestRestDay(entities: any): Promise<ActionResult> {
    const targetDate = entities.date || new Date();
    console.log('🗓️ Rest day request for:', moment(targetDate).format('YYYY-MM-DD dddd'));
    
    const currentWorkout = await workoutScheduleService.getWorkoutForDate(targetDate);
    console.log('🏋️ Current workout found:', currentWorkout ? currentWorkout.title : 'None');
    
    if (!currentWorkout) {
      return {
        success: true,
        message: `${moment(targetDate).format('dddd')} is already a rest day! Enjoy your recovery time. 😌`
      };
    }

    // Create confirmation prompt
    const confirmationId = `rest_day_${Date.now()}`;
    const confirmation: ConfirmationPrompt = {
      id: confirmationId,
      message: `I can change your **${currentWorkout.title}** workout to a rest day. This will remove ${currentWorkout.exercises?.length || 0} exercises from ${moment(targetDate).format('dddd')}.\n\nWould you like me to proceed?`,
      options: [
        {
          text: 'Yes, make it a rest day',
          action: 'CONFIRM_REST_DAY',
          style: 'primary',
          data: { date: targetDate, originalWorkout: currentWorkout }
        },
        {
          text: 'No, keep the workout',
          action: 'CANCEL_ACTION',
          style: 'secondary'
        }
      ],
      data: { targetDate, currentWorkout },
      timeout: 30000 // 30 seconds
    };

    await this.storePendingConfirmation(confirmation);

    return {
      success: true,
      message: confirmation.message,
      data: confirmation,
      ui: [{
        type: 'confirmation',
        props: confirmation
      }]
    };
  }

  // 3. Substitute Exercise
  private async substituteExercise(entities: any): Promise<ActionResult> {
    const { exercise, reason } = entities;
    const todaysWorkout = await workoutScheduleService.getWorkoutForDate(new Date());
    
    if (!todaysWorkout || !todaysWorkout.exercises) {
      return {
        success: false,
        message: "No workout scheduled for today to modify."
      };
    }

    // Find the exercise to replace
    const targetExercise = todaysWorkout.exercises.find(ex => 
      ex.name.toLowerCase().includes(exercise.toLowerCase())
    );

    if (!targetExercise) {
      return {
        success: false,
        message: `I couldn't find "${exercise}" in today's workout. Current exercises: ${todaysWorkout.exercises.map(ex => ex.name).join(', ')}`
      };
    }

    // Get alternatives - using mock data for now
    const alternatives = [
      { ...targetExercise, name: "Alternative Exercise 1" },
      { ...targetExercise, name: "Alternative Exercise 2" },
      { ...targetExercise, name: "Alternative Exercise 3" }
    ];

    const confirmationId = `substitute_${Date.now()}`;
    const confirmation: ConfirmationPrompt = {
      id: confirmationId,
      message: `I found these alternatives for **${targetExercise.name}**:`,
      options: alternatives.map((alt: any, index: number) => ({
        text: `${alt.name} (${alt.sets}×${alt.reps})`,
        action: 'CONFIRM_SUBSTITUTION',
        style: index === 0 ? 'primary' : 'secondary',
        data: { original: targetExercise, replacement: alt }
      })),
      data: { targetExercise, alternatives, reason }
    };

    await this.storePendingConfirmation(confirmation);

    return {
      success: true,
      message: confirmation.message,
      data: confirmation,
      ui: [{
        type: 'confirmation',
        props: confirmation
      }]
    };
  }

  // 4. Create Custom Workout
  private async createCustomWorkout(entities: any): Promise<ActionResult> {
    const { duration, bodyPart, equipment, intensity } = entities;
    
    // Generate workout using the workout generator
    const requirements: WorkoutRequirements = {
      duration: duration || 30,
      focus: bodyPart || 'full body',
      equipment: equipment || 'bodyweight',
      level: (intensity || 'intermediate') as 'beginner' | 'intermediate' | 'advanced'
    };
    
    const generatedWorkout = await workoutGenerator.generateWorkout(requirements);
    
    // Convert to WorkoutEvent format
    const customWorkout: WorkoutEvent = {
      id: generatedWorkout.id,
      title: generatedWorkout.title,
      description: generatedWorkout.description,
      date: new Date(),
      time: '6:00 PM',
      duration: generatedWorkout.duration,
      difficulty: generatedWorkout.difficulty,
      type: generatedWorkout.type,
      calories: generatedWorkout.calories,
      completed: false,
      exercises: generatedWorkout.exercises.map(ex => ({
        ...ex,
        category: (['strength', 'cardio', 'flexibility', 'balance'].includes(ex.category) 
          ? ex.category 
          : ex.category === 'sports' 
            ? 'cardio' 
            : 'strength') as 'strength' | 'cardio' | 'flexibility' | 'balance',
        duration: ex.duration ? String(ex.duration) : undefined,
        difficulty: (['beginner', 'intermediate', 'advanced'].includes(ex.difficulty) 
          ? ex.difficulty 
          : 'intermediate') as 'beginner' | 'intermediate' | 'advanced'
      })),
      notes: generatedWorkout.notes?.join('. '),
      tags: generatedWorkout.tags,
      createdBy: 'ai'
    };

    const confirmationId = `create_workout_${Date.now()}`;
    const confirmation: ConfirmationPrompt = {
      id: confirmationId,
      message: `I've created a **${customWorkout.duration}min ${customWorkout.title}** for you:`,
      options: [
        {
          text: 'Add to today\'s schedule',
          action: 'CONFIRM_ADD_WORKOUT',
          style: 'primary',
          data: { workout: customWorkout, date: new Date() }
        },
        {
          text: 'Schedule for tomorrow',
          action: 'CONFIRM_ADD_WORKOUT',
          style: 'secondary',
          data: { workout: customWorkout, date: moment().add(1, 'day').toDate() }
        },
        {
          text: 'Modify workout',
          action: 'MODIFY_WORKOUT',
          style: 'secondary',
          data: { workout: customWorkout }
        }
      ],
      data: { customWorkout }
    };

    await this.storePendingConfirmation(confirmation);

    const exerciseList = customWorkout.exercises?.map(ex => 
      `• ${ex.name} (${ex.sets}×${ex.reps})`
    ).join('\n') || 'No exercises generated';

    return {
      success: true,
      message: `${confirmation.message}\n\n**Exercises:**\n${exerciseList}\n\nWhat would you like to do?`,
      data: confirmation,
      ui: [{
        type: 'confirmation',
        props: confirmation
      }]
    };
  }

  // Public method for testing - wraps executeConfirmedAction
  async confirmAction(action: string, data: any): Promise<ActionResult> {
    return this.executeConfirmedAction('test-confirmation', action, data);
  }

  // Execute confirmed actions
  async executeConfirmedAction(confirmationId: string, action: string, data: any): Promise<ActionResult> {
    try {
      switch (action) {
        case 'CONFIRM_REST_DAY':
          return await this.confirmRestDay(data);
        
        case 'CONFIRM_SUBSTITUTION':
          return await this.confirmSubstitution(data);
        
        case 'CONFIRM_ADD_WORKOUT':
          return await this.confirmAddWorkout(data);
        
        case 'CANCEL_ACTION':
          return {
            success: true,
            message: 'Action cancelled. Your workout schedule remains unchanged.'
          };
        
        default:
          return {
            success: false,
            message: 'Unknown confirmation action'
          };
      }
    } finally {
      // Clean up pending confirmation
      await this.removePendingConfirmation(confirmationId);
    }
  }

  // Helper methods for intent recognition
  private isWorkoutQuery(message: string): boolean {
    const patterns = [
      'what.*workout.*today', 'today.*workout', 'what.*on.*today',
      'show.*schedule', 'what.*exercises', 'what.*training',
      'what.*gym.*today', 'workout.*schedule', 'chest.*triceps.*today',
      'see.*chest', 'what.*today', 'today.*schedule', 'scheduled.*today',
      'chest.*today', 'triceps.*today', 'i.*see.*chest', 'workout.*scheduled'
    ];
    
    // Debug individual pattern matches
    const matches = patterns.map(pattern => ({
      pattern,
      matches: new RegExp(pattern, 'i').test(message)
    }));
    
    const foundMatch = matches.find(m => m.matches);
    if (foundMatch) {
      console.log('🎯 Workout query pattern matched:', foundMatch.pattern);
    } else {
      console.log('❌ No workout query pattern matched for:', message);
    }
    
    return matches.some(m => m.matches);
  }

  private isRestDayRequest(message: string): boolean {
    const patterns = [
      'rest day', 'make.*rest.*day', 'want.*rest', 'need.*rest', 'skip.*workout',
      'cancel.*workout', 'no workout.*today', 'take.*day.*off', 'can\'t.*workout',
      'unable.*workout', 'make.*today.*rest', 'today.*rest.*day'
    ];
    
    // Debug individual pattern matches
    const matches = patterns.map(pattern => ({
      pattern,
      matches: new RegExp(pattern, 'i').test(message)
    }));
    
    const foundMatch = matches.find(m => m.matches);
    if (foundMatch) {
      console.log('🎯 Rest day pattern matched:', foundMatch.pattern);
    } else {
      console.log('❌ No rest day pattern matched for:', message);
    }
    
    return matches.some(m => m.matches);
  }

  private isExerciseSubstitution(message: string): boolean {
    const patterns = [
      'replace.*', 'substitute.*', 'instead.*of', 'can\'t.*do',
      'instead.*', 'swap.*', 'change.*exercise', 'alternative.*'
    ];
    return patterns.some(pattern => new RegExp(pattern).test(message));
  }

  private isWorkoutCreation(message: string): boolean {
    const patterns = [
      'create.*workout', 'make.*workout', 'design.*workout',
      'new.*workout', 'custom.*workout', 'build.*workout'
    ];
    return patterns.some(pattern => new RegExp(pattern).test(message));
  }

  private isScheduleModification(message: string): boolean {
    const patterns = [
      'move.*workout', 'reschedule.*', 'change.*schedule',
      'shift.*workout', 'postpone.*', 'earlier.*workout'
    ];
    return patterns.some(pattern => new RegExp(pattern).test(message));
  }

  // Entity extraction methods
  private extractDateEntity(message: string): { date: Date } {
    const today = new Date();
    
    if (message.includes('today')) return { date: today };
    if (message.includes('tomorrow')) return { date: moment().add(1, 'day').toDate() };
    if (message.includes('yesterday')) return { date: moment().subtract(1, 'day').toDate() };
    
    // Default to today
    return { date: today };
  }

  private extractExerciseAndReason(message: string): { exercise: string; reason: string } {
    // Simple extraction - can be enhanced with NLP
    const exercises = ['bench press', 'squats', 'deadlift', 'push-ups', 'pull-ups', 'bicep curls'];
    const reasons = ['injury', 'pain', 'equipment', 'difficulty', 'time'];
    
    let exercise = '';
    let reason = '';
    
    for (const ex of exercises) {
      if (message.includes(ex)) {
        exercise = ex;
        break;
      }
    }
    
    for (const r of reasons) {
      if (message.includes(r)) {
        reason = r;
        break;
      }
    }
    
    return { exercise, reason };
  }

  private extractWorkoutRequirements(message: string): any {
    const duration = message.match(/(\d+).*min/)?.[1] || '30';
    
    const bodyParts = ['chest', 'back', 'legs', 'arms', 'shoulders', 'abs', 'full body'];
    let bodyPart = 'full body';
    for (const part of bodyParts) {
      if (message.includes(part)) {
        bodyPart = part;
        break;
      }
    }
    
    return { duration: parseInt(duration), bodyPart };
  }

  private extractScheduleChange(_message: string): any {
    // Extract schedule modification details
    return {};
  }

  // Data management methods
  private async getWorkoutSchedule(): Promise<Record<string, WorkoutEvent>> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_SCHEDULE);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading workout schedule:', error);
      return {};
    }
  }

  async storePendingConfirmation(confirmation: ConfirmationPrompt): Promise<void> {
    try {
      const pending = await AsyncStorage.getItem(this.STORAGE_KEYS.PENDING_CONFIRMATIONS);
      const confirmations = pending ? JSON.parse(pending) : {};
      confirmations[confirmation.id] = confirmation;
      await AsyncStorage.setItem(this.STORAGE_KEYS.PENDING_CONFIRMATIONS, JSON.stringify(confirmations));
    } catch (error) {
      console.error('Error storing pending confirmation:', error);
    }
  }

  private async removePendingConfirmation(confirmationId: string): Promise<void> {
    try {
      const pending = await AsyncStorage.getItem(this.STORAGE_KEYS.PENDING_CONFIRMATIONS);
      if (pending) {
        const confirmations = JSON.parse(pending);
        delete confirmations[confirmationId];
        await AsyncStorage.setItem(this.STORAGE_KEYS.PENDING_CONFIRMATIONS, JSON.stringify(confirmations));
      }
    } catch (error) {
      console.error('Error removing pending confirmation:', error);
    }
  }

  // Action execution methods
  private async confirmRestDay(data: any): Promise<ActionResult> {
    const { date, originalWorkout } = data;
    
    // Use the workout schedule service to delete the workout
    const deletedWorkout = await workoutScheduleService.deleteWorkout(date);
    
    if (deletedWorkout) {
      return {
        success: true,
        message: `✅ Done! ${moment(date).format('dddd')} is now a rest day. Your **${originalWorkout.title}** workout has been removed. Enjoy your recovery time! 🛌`,
        data: { date, type: 'rest_day_confirmed' }
      };
    }
    
    return {
      success: false,
      message: 'Failed to make rest day. Please try again.'
    };
  }

  private async confirmSubstitution(data: any): Promise<ActionResult> {
    const { original, replacement } = data;
    
    // Use the workout schedule service to replace the exercise
    const success = await workoutScheduleService.replaceExerciseInWorkout(
      new Date(), 
      original.id, 
      replacement
    );
    
    if (success) {
      return {
        success: true,
        message: `✅ Perfect! I've replaced **${original.name}** with **${replacement.name}** in today's workout. Your updated plan is ready!`,
        data: { original, replacement }
      };
    }
    
    return {
      success: false,
      message: 'Failed to update workout. Please try again.'
    };
  }

  private async confirmAddWorkout(data: any): Promise<ActionResult> {
    const { workout, date } = data;
    
    // Set the correct date for the workout
    workout.date = date;
    
    // Use the workout schedule service to save the workout
    await workoutScheduleService.saveWorkout(workout);
    
    return {
      success: true,
      message: `✅ Excellent! Your **${workout.title}** is now scheduled for ${moment(date).format('dddd, MMMM Do')}. Get ready to crush it! 💪`,
      data: { workout, date }
    };
  }

  private async modifySchedule(entities: any): Promise<ActionResult> {
    // Implementation for schedule modifications (move workouts, reschedule, etc.)
    const { fromDate, toDate, action } = entities;
    
    if (action === 'move' && fromDate && toDate) {
      const success = await workoutScheduleService.moveWorkout(
        new Date(fromDate), 
        new Date(toDate)
      );
      
      if (success) {
        return {
          success: true,
          message: `✅ Workout moved from ${moment(fromDate).format('dddd')} to ${moment(toDate).format('dddd')}!`
        };
      }
    }
    
    return {
      success: false,
      message: 'Schedule modification failed. Please try again.'
    };
  }
}

// Create singleton instance
const aiActionService = new AIActionService();

// Export both the instance and the class for testing
export { aiActionService, AIActionService };
export type { AIAction, ConfirmationPrompt, ActionResult, WorkoutEvent, Exercise };