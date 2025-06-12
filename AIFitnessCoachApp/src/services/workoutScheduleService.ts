import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { wgerExerciseService } from './wgerExerciseService';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string;
  weight?: string;
  duration?: string;
  equipment?: string[];
  muscleGroups: string[];
  category: 'strength' | 'cardio' | 'flexibility' | 'balance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string[];
  videoUrl?: string;
  imageUrl?: string;
  caloriesPerMinute?: number;
}

interface WorkoutEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'yoga' | 'rest';
  calories: number;
  completed: boolean;
  exercises: Exercise[];
  notes?: string;
  tags?: string[];
  originalDate?: Date; // Track if moved from another date
  createdBy: 'system' | 'user' | 'ai';
  modifiedAt?: Date;
}

interface WeeklySchedule {
  weekStart: Date;
  workouts: { [key: string]: WorkoutEvent }; // key is YYYY-MM-DD format
}

interface UserPreferences {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  availableEquipment: string[];
  workoutDays: number[]; // 0-6, Sunday-Saturday
  preferredWorkoutTime: string;
  sessionDuration: number; // preferred duration in minutes
  injuryLimitations: string[];
  preferredWorkoutTypes: string[];
}

class WorkoutScheduleService {
  private readonly STORAGE_KEYS = {
    WORKOUT_SCHEDULE: '@workout_schedule_v2',
    USER_PREFERENCES: '@user_preferences_v2',
    WORKOUT_TEMPLATES: '@workout_templates_v2',
    SCHEDULE_HISTORY: '@schedule_history_v2',
  };

  // Initialize default workout schedule
  async initializeDefaultSchedule(): Promise<void> {
    try {
      const existingSchedule = await this.getFullSchedule();
      if (Object.keys(existingSchedule).length > 0) {
        console.log('Schedule already exists, skipping initialization');
        return;
      }

      console.log('Initializing default workout schedule...');
      
      // Create a 4-week default schedule
      const schedule: { [key: string]: WorkoutEvent } = {};
      const startDate = moment().startOf('week');

      for (let week = 0; week < 4; week++) {
        for (let day = 0; day < 7; day++) {
          const currentDate = startDate.clone().add(week, 'weeks').add(day, 'days');
          const dateKey = currentDate.format('YYYY-MM-DD');
          
          const workout = this.generateDefaultWorkoutForDay(day, currentDate.toDate());
          if (workout) {
            schedule[dateKey] = workout;
          }
        }
      }

      await this.saveFullSchedule(schedule);
      console.log('Default schedule initialized with', Object.keys(schedule).length, 'workouts');
      
    } catch (error) {
      console.error('Error initializing default schedule:', error);
      throw error;
    }
  }

  // Generate default workout based on day of week
  private generateDefaultWorkoutForDay(dayOfWeek: number, date: Date): WorkoutEvent | null {
    const workoutTemplates = {
      1: { // Monday - Chest & Triceps
        title: 'Chest & Triceps Power',
        type: 'strength',
        duration: 45,
        difficulty: 'intermediate',
        calories: 350,
        exercises: [
          {
            id: 'bench_press',
            name: 'Bench Press',
            sets: 4,
            reps: '8-10',
            weight: '70-80% 1RM',
            muscleGroups: ['chest', 'triceps', 'shoulders'],
            category: 'strength',
            difficulty: 'intermediate',
            equipment: ['barbell', 'bench'],
            instructions: ['Lie on bench', 'Grip bar shoulder-width apart', 'Lower to chest', 'Press up explosively'],
            caloriesPerMinute: 8
          },
          {
            id: 'incline_db_press',
            name: 'Incline Dumbbell Press',
            sets: 3,
            reps: '10-12',
            weight: '65-75% 1RM',
            muscleGroups: ['chest', 'shoulders', 'triceps'],
            category: 'strength',
            difficulty: 'intermediate',
            equipment: ['dumbbells', 'incline bench'],
            caloriesPerMinute: 7
          },
          {
            id: 'chest_flyes',
            name: 'Chest Flyes',
            sets: 3,
            reps: '12-15',
            muscleGroups: ['chest'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: ['dumbbells', 'bench'],
            caloriesPerMinute: 6
          },
          {
            id: 'tricep_dips',
            name: 'Tricep Dips',
            sets: 3,
            reps: '12-15',
            muscleGroups: ['triceps', 'shoulders'],
            category: 'strength',
            difficulty: 'intermediate',
            equipment: ['dip station', 'bench'],
            caloriesPerMinute: 7
          },
          {
            id: 'overhead_tricep_ext',
            name: 'Overhead Tricep Extension',
            sets: 3,
            reps: '10-12',
            muscleGroups: ['triceps'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: ['dumbbell'],
            caloriesPerMinute: 5
          },
          {
            id: 'pushups',
            name: 'Push-ups',
            sets: 3,
            reps: 'max',
            muscleGroups: ['chest', 'triceps', 'shoulders'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: [],
            caloriesPerMinute: 8
          }
        ]
      },
      2: { // Tuesday - Shoulders & Abs
        title: 'Shoulders & Core',
        type: 'strength',
        duration: 35,
        difficulty: 'intermediate',
        calories: 280,
        exercises: [
          {
            id: 'overhead_press',
            name: 'Overhead Press',
            sets: 4,
            reps: '8-10',
            muscleGroups: ['shoulders', 'triceps', 'core'],
            category: 'strength',
            difficulty: 'intermediate',
            equipment: ['barbell'],
            caloriesPerMinute: 7
          },
          {
            id: 'lateral_raises',
            name: 'Lateral Raises',
            sets: 3,
            reps: '12-15',
            muscleGroups: ['shoulders'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: ['dumbbells'],
            caloriesPerMinute: 5
          },
          {
            id: 'rear_delt_flyes',
            name: 'Rear Delt Flyes',
            sets: 3,
            reps: '12-15',
            muscleGroups: ['shoulders', 'upper back'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: ['dumbbells'],
            caloriesPerMinute: 5
          },
          {
            id: 'plank',
            name: 'Plank',
            sets: 3,
            reps: '30-60s',
            duration: '30-60s',
            muscleGroups: ['core', 'shoulders'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: [],
            caloriesPerMinute: 6
          },
          {
            id: 'russian_twists',
            name: 'Russian Twists',
            sets: 3,
            reps: '20',
            muscleGroups: ['core', 'obliques'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: [],
            caloriesPerMinute: 7
          },
          {
            id: 'mountain_climbers',
            name: 'Mountain Climbers',
            sets: 3,
            reps: '30s',
            duration: '30s',
            muscleGroups: ['core', 'shoulders', 'legs'],
            category: 'cardio',
            difficulty: 'intermediate',
            equipment: [],
            caloriesPerMinute: 10
          }
        ]
      },
      3: { // Wednesday - Back & Biceps
        title: 'Back & Biceps Power',
        type: 'strength',
        duration: 45,
        difficulty: 'intermediate',
        calories: 340,
        exercises: [
          {
            id: 'pullups',
            name: 'Pull-ups/Lat Pulldowns',
            sets: 4,
            reps: '8-10',
            muscleGroups: ['back', 'biceps'],
            category: 'strength',
            difficulty: 'intermediate',
            equipment: ['pull-up bar', 'lat pulldown machine'],
            caloriesPerMinute: 8
          },
          {
            id: 'bent_over_rows',
            name: 'Bent-over Rows',
            sets: 3,
            reps: '10-12',
            muscleGroups: ['back', 'biceps', 'rear delts'],
            category: 'strength',
            difficulty: 'intermediate',
            equipment: ['barbell', 'dumbbells'],
            caloriesPerMinute: 7
          },
          {
            id: 'seated_cable_rows',
            name: 'Seated Cable Rows',
            sets: 3,
            reps: '12-15',
            muscleGroups: ['back', 'biceps'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: ['cable machine'],
            caloriesPerMinute: 6
          },
          {
            id: 'bicep_curls',
            name: 'Bicep Curls',
            sets: 3,
            reps: '12-15',
            muscleGroups: ['biceps'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: ['dumbbells', 'barbell'],
            caloriesPerMinute: 5
          },
          {
            id: 'hammer_curls',
            name: 'Hammer Curls',
            sets: 3,
            reps: '10-12',
            muscleGroups: ['biceps', 'forearms'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: ['dumbbells'],
            caloriesPerMinute: 5
          },
          {
            id: 'face_pulls',
            name: 'Face Pulls',
            sets: 3,
            reps: '15-20',
            muscleGroups: ['rear delts', 'upper back'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: ['cable machine', 'resistance band'],
            caloriesPerMinute: 6
          }
        ]
      },
      4: { // Thursday - Full Body HIIT
        title: 'Full Body HIIT',
        type: 'hiit',
        duration: 30,
        difficulty: 'advanced',
        calories: 400,
        exercises: [
          {
            id: 'burpees',
            name: 'Burpees',
            sets: 4,
            reps: '10',
            muscleGroups: ['full body'],
            category: 'cardio',
            difficulty: 'advanced',
            equipment: [],
            caloriesPerMinute: 15
          },
          {
            id: 'jump_squats',
            name: 'Jump Squats',
            sets: 4,
            reps: '15',
            muscleGroups: ['legs', 'glutes'],
            category: 'cardio',
            difficulty: 'intermediate',
            equipment: [],
            caloriesPerMinute: 12
          },
          {
            id: 'pushup_to_t',
            name: 'Push-up to T',
            sets: 4,
            reps: '10',
            muscleGroups: ['chest', 'core', 'shoulders'],
            category: 'strength',
            difficulty: 'advanced',
            equipment: [],
            caloriesPerMinute: 10
          },
          {
            id: 'high_knees',
            name: 'High Knees',
            sets: 4,
            reps: '30s',
            duration: '30s',
            muscleGroups: ['legs', 'core'],
            category: 'cardio',
            difficulty: 'intermediate',
            equipment: [],
            caloriesPerMinute: 14
          },
          {
            id: 'plank_jacks',
            name: 'Plank Jacks',
            sets: 4,
            reps: '15',
            muscleGroups: ['core', 'shoulders'],
            category: 'cardio',
            difficulty: 'intermediate',
            equipment: [],
            caloriesPerMinute: 11
          },
          {
            id: 'mountain_climbers_hiit',
            name: 'Mountain Climbers',
            sets: 4,
            reps: '30s',
            duration: '30s',
            muscleGroups: ['core', 'shoulders', 'legs'],
            category: 'cardio',
            difficulty: 'intermediate',
            equipment: [],
            caloriesPerMinute: 13
          }
        ]
      },
      5: { // Friday - Legs & Glutes
        title: 'Legs & Glutes Power',
        type: 'strength',
        duration: 50,
        difficulty: 'intermediate',
        calories: 380,
        exercises: [
          {
            id: 'squats',
            name: 'Squats',
            sets: 4,
            reps: '8-10',
            muscleGroups: ['legs', 'glutes'],
            category: 'strength',
            difficulty: 'intermediate',
            equipment: ['barbell', 'squat rack'],
            caloriesPerMinute: 8
          },
          {
            id: 'romanian_deadlifts',
            name: 'Romanian Deadlifts',
            sets: 3,
            reps: '10-12',
            muscleGroups: ['hamstrings', 'glutes', 'lower back'],
            category: 'strength',
            difficulty: 'intermediate',
            equipment: ['barbell', 'dumbbells'],
            caloriesPerMinute: 8
          },
          {
            id: 'bulgarian_split_squats',
            name: 'Bulgarian Split Squats',
            sets: 3,
            reps: '12 each leg',
            muscleGroups: ['legs', 'glutes'],
            category: 'strength',
            difficulty: 'intermediate',
            equipment: ['dumbbells', 'bench'],
            caloriesPerMinute: 7
          },
          {
            id: 'hip_thrusts',
            name: 'Hip Thrusts',
            sets: 3,
            reps: '12-15',
            muscleGroups: ['glutes', 'hamstrings'],
            category: 'strength',
            difficulty: 'intermediate',
            equipment: ['barbell', 'bench'],
            caloriesPerMinute: 7
          },
          {
            id: 'calf_raises',
            name: 'Calf Raises',
            sets: 3,
            reps: '15-20',
            muscleGroups: ['calves'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: ['dumbbells'],
            caloriesPerMinute: 5
          },
          {
            id: 'leg_curls',
            name: 'Leg Curls',
            sets: 3,
            reps: '12-15',
            muscleGroups: ['hamstrings'],
            category: 'strength',
            difficulty: 'beginner',
            equipment: ['leg curl machine', 'resistance band'],
            caloriesPerMinute: 6
          }
        ]
      },
      6: { // Saturday - Yoga & Stretching
        title: 'Yoga & Mobility',
        type: 'yoga',
        duration: 40,
        difficulty: 'beginner',
        calories: 160,
        exercises: [
          {
            id: 'sun_salutation',
            name: 'Sun Salutation',
            sets: 5,
            reps: 'rounds',
            muscleGroups: ['full body'],
            category: 'flexibility',
            difficulty: 'beginner',
            equipment: ['yoga mat'],
            caloriesPerMinute: 4
          },
          {
            id: 'warrior_poses',
            name: 'Warrior Poses',
            sets: 1,
            reps: '30s each',
            duration: '30s each',
            muscleGroups: ['legs', 'core', 'arms'],
            category: 'flexibility',
            difficulty: 'beginner',
            equipment: ['yoga mat'],
            caloriesPerMinute: 3
          },
          {
            id: 'downward_dog',
            name: 'Downward Dog',
            sets: 1,
            reps: '60s',
            duration: '60s',
            muscleGroups: ['shoulders', 'hamstrings', 'calves'],
            category: 'flexibility',
            difficulty: 'beginner',
            equipment: ['yoga mat'],
            caloriesPerMinute: 3
          },
          {
            id: 'childs_pose',
            name: 'Child\'s Pose',
            sets: 1,
            reps: '60s',
            duration: '60s',
            muscleGroups: ['back', 'hips'],
            category: 'flexibility',
            difficulty: 'beginner',
            equipment: ['yoga mat'],
            caloriesPerMinute: 2
          },
          {
            id: 'pigeon_pose',
            name: 'Pigeon Pose',
            sets: 1,
            reps: '30s each side',
            duration: '30s each side',
            muscleGroups: ['hips', 'glutes'],
            category: 'flexibility',
            difficulty: 'intermediate',
            equipment: ['yoga mat'],
            caloriesPerMinute: 3
          },
          {
            id: 'savasana',
            name: 'Savasana',
            sets: 1,
            reps: '5 minutes',
            duration: '5 minutes',
            muscleGroups: ['full body'],
            category: 'flexibility',
            difficulty: 'beginner',
            equipment: ['yoga mat'],
            caloriesPerMinute: 1
          }
        ]
      }
    };

    const template = workoutTemplates[dayOfWeek as keyof typeof workoutTemplates];
    if (!template) return null;

    return {
      id: `default_${dayOfWeek}_${moment(date).format('YYYYMMDD')}`,
      title: template.title,
      description: `Default ${template.title} workout`,
      date: date,
      time: '6:00 PM',
      duration: template.duration,
      difficulty: template.difficulty as 'beginner' | 'intermediate' | 'advanced',
      type: template.type as 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'yoga' | 'rest',
      calories: template.calories,
      completed: moment(date).isBefore(moment(), 'day'),
      exercises: template.exercises,
      createdBy: 'system',
      tags: ['default', template.type],
      notes: `Generated default ${template.title} workout`
    };
  }

  // Get workout for specific date
  async getWorkoutForDate(date: Date): Promise<WorkoutEvent | null> {
    try {
      const schedule = await this.getFullSchedule();
      const dateKey = moment(date).format('YYYY-MM-DD');
      return schedule[dateKey] || null;
    } catch (error) {
      console.error('Error getting workout for date:', error);
      return null;
    }
  }

  // Get workouts for date range
  async getWorkoutsForDateRange(startDate: Date, endDate: Date): Promise<WorkoutEvent[]> {
    try {
      const schedule = await this.getFullSchedule();
      const workouts: WorkoutEvent[] = [];
      
      let currentDate = moment(startDate);
      const end = moment(endDate);
      
      while (currentDate.isSameOrBefore(end, 'day')) {
        const dateKey = currentDate.format('YYYY-MM-DD');
        if (schedule[dateKey]) {
          workouts.push(schedule[dateKey]);
        }
        currentDate.add(1, 'day');
      }
      
      return workouts.sort((a, b) => moment(a.date).diff(moment(b.date)));
    } catch (error) {
      console.error('Error getting workouts for date range:', error);
      return [];
    }
  }

  // Get current week's schedule
  async getCurrentWeekSchedule(): Promise<WorkoutEvent[]> {
    const startOfWeek = moment().startOf('week').toDate();
    const endOfWeek = moment().endOf('week').toDate();
    return this.getWorkoutsForDateRange(startOfWeek, endOfWeek);
  }

  // Add or update workout
  async saveWorkout(workout: WorkoutEvent): Promise<void> {
    try {
      const schedule = await this.getFullSchedule();
      const dateKey = moment(workout.date).format('YYYY-MM-DD');
      
      // Add modification timestamp
      workout.modifiedAt = new Date();
      
      schedule[dateKey] = workout;
      await this.saveFullSchedule(schedule);
      
      // Save to history for undo functionality
      await this.saveToHistory('save_workout', { workout, dateKey });
      
      console.log('Workout saved for', dateKey, ':', workout.title);
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  }

  // Delete workout (make it a rest day)
  async deleteWorkout(date: Date): Promise<WorkoutEvent | null> {
    try {
      const schedule = await this.getFullSchedule();
      const dateKey = moment(date).format('YYYY-MM-DD');
      const deletedWorkout = schedule[dateKey] || null;
      
      if (deletedWorkout) {
        delete schedule[dateKey];
        await this.saveFullSchedule(schedule);
        
        // Save to history for undo functionality
        await this.saveToHistory('delete_workout', { workout: deletedWorkout, dateKey });
        
        console.log('Workout deleted for', dateKey);
      }
      
      return deletedWorkout;
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  }

  // Move workout from one date to another
  async moveWorkout(fromDate: Date, toDate: Date): Promise<boolean> {
    try {
      const schedule = await this.getFullSchedule();
      const fromKey = moment(fromDate).format('YYYY-MM-DD');
      const toKey = moment(toDate).format('YYYY-MM-DD');
      
      const workoutToMove = schedule[fromKey];
      if (!workoutToMove) {
        console.warn('No workout found on', fromKey);
        return false;
      }
      
      // Update workout date and mark as moved
      workoutToMove.date = toDate;
      workoutToMove.originalDate = fromDate;
      workoutToMove.modifiedAt = new Date();
      
      // Check if target date has existing workout
      const existingWorkout = schedule[toKey];
      if (existingWorkout) {
        console.warn('Target date already has workout, swapping...');
        // Swap workouts
        existingWorkout.date = fromDate;
        existingWorkout.originalDate = toDate;
        existingWorkout.modifiedAt = new Date();
        schedule[fromKey] = existingWorkout;
      } else {
        delete schedule[fromKey];
      }
      
      schedule[toKey] = workoutToMove;
      await this.saveFullSchedule(schedule);
      
      // Save to history for undo functionality
      await this.saveToHistory('move_workout', { 
        from: { workout: workoutToMove, dateKey: fromKey },
        to: { workout: workoutToMove, dateKey: toKey },
        existingWorkout: existingWorkout
      });
      
      console.log('Workout moved from', fromKey, 'to', toKey);
      return true;
    } catch (error) {
      console.error('Error moving workout:', error);
      throw error;
    }
  }

  // Replace exercise in a workout
  async replaceExerciseInWorkout(date: Date, oldExerciseId: string, newExercise: Exercise): Promise<boolean> {
    try {
      const workout = await this.getWorkoutForDate(date);
      if (!workout) {
        console.warn('No workout found for date:', moment(date).format('YYYY-MM-DD'));
        return false;
      }
      
      const exerciseIndex = workout.exercises.findIndex(ex => ex.id === oldExerciseId);
      if (exerciseIndex === -1) {
        console.warn('Exercise not found in workout:', oldExerciseId);
        return false;
      }
      
      const oldExercise = workout.exercises[exerciseIndex];
      workout.exercises[exerciseIndex] = { ...newExercise };
      workout.modifiedAt = new Date();
      
      await this.saveWorkout(workout);
      
      // Save to history for undo functionality
      await this.saveToHistory('replace_exercise', { 
        workout, 
        oldExercise, 
        newExercise, 
        exerciseIndex 
      });
      
      console.log('Exercise replaced:', oldExercise.name, '->', newExercise.name);
      return true;
    } catch (error) {
      console.error('Error replacing exercise:', error);
      throw error;
    }
  }

  // Add exercise to workout
  async addExerciseToWorkout(date: Date, exercise: Exercise): Promise<boolean> {
    try {
      const workout = await this.getWorkoutForDate(date);
      if (!workout) {
        console.warn('No workout found for date:', moment(date).format('YYYY-MM-DD'));
        return false;
      }
      
      workout.exercises.push(exercise);
      workout.modifiedAt = new Date();
      
      // Recalculate duration and calories
      const additionalDuration = this.calculateExerciseDuration(exercise);
      workout.duration += additionalDuration;
      workout.calories += Math.round(additionalDuration * (exercise.caloriesPerMinute || 6));
      
      await this.saveWorkout(workout);
      
      // Save to history for undo functionality
      await this.saveToHistory('add_exercise', { workout, exercise });
      
      console.log('Exercise added to workout:', exercise.name);
      return true;
    } catch (error) {
      console.error('Error adding exercise to workout:', error);
      throw error;
    }
  }

  // Remove exercise from workout
  async removeExerciseFromWorkout(date: Date, exerciseId: string): Promise<boolean> {
    try {
      const workout = await this.getWorkoutForDate(date);
      if (!workout) {
        console.warn('No workout found for date:', moment(date).format('YYYY-MM-DD'));
        return false;
      }
      
      const exerciseIndex = workout.exercises.findIndex(ex => ex.id === exerciseId);
      if (exerciseIndex === -1) {
        console.warn('Exercise not found in workout:', exerciseId);
        return false;
      }
      
      const removedExercise = workout.exercises[exerciseIndex];
      workout.exercises.splice(exerciseIndex, 1);
      workout.modifiedAt = new Date();
      
      // Recalculate duration and calories
      const removedDuration = this.calculateExerciseDuration(removedExercise);
      workout.duration = Math.max(10, workout.duration - removedDuration);
      workout.calories = Math.max(50, workout.calories - Math.round(removedDuration * (removedExercise.caloriesPerMinute || 6)));
      
      await this.saveWorkout(workout);
      
      // Save to history for undo functionality
      await this.saveToHistory('remove_exercise', { workout, removedExercise, exerciseIndex });
      
      console.log('Exercise removed from workout:', removedExercise.name);
      return true;
    } catch (error) {
      console.error('Error removing exercise from workout:', error);
      throw error;
    }
  }

  // Mark workout as completed
  async markWorkoutCompleted(date: Date, notes?: string): Promise<boolean> {
    try {
      const workout = await this.getWorkoutForDate(date);
      if (!workout) {
        console.warn('No workout found for date:', moment(date).format('YYYY-MM-DD'));
        return false;
      }
      
      workout.completed = true;
      workout.modifiedAt = new Date();
      if (notes) {
        workout.notes = notes;
      }
      
      await this.saveWorkout(workout);
      console.log('Workout marked as completed for', moment(date).format('YYYY-MM-DD'));
      return true;
    } catch (error) {
      console.error('Error marking workout as completed:', error);
      throw error;
    }
  }

  // Get workout statistics
  async getWorkoutStats(startDate?: Date, endDate?: Date): Promise<{
    totalWorkouts: number;
    completedWorkouts: number;
    totalCalories: number;
    totalDuration: number;
    averageDuration: number;
    completionRate: number;
    workoutsByType: { [key: string]: number };
    weeklyAverage: number;
  }> {
    try {
      const start = startDate || moment().subtract(30, 'days').toDate();
      const end = endDate || new Date();
      
      const workouts = await this.getWorkoutsForDateRange(start, end);
      
      const totalWorkouts = workouts.length;
      const completedWorkouts = workouts.filter(w => w.completed).length;
      const totalCalories = workouts.reduce((sum, w) => sum + (w.completed ? w.calories : 0), 0);
      const totalDuration = workouts.reduce((sum, w) => sum + (w.completed ? w.duration : 0), 0);
      const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
      const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
      
      const workoutsByType: { [key: string]: number } = {};
      workouts.forEach(w => {
        workoutsByType[w.type] = (workoutsByType[w.type] || 0) + 1;
      });
      
      const daysDiff = moment(end).diff(moment(start), 'days') + 1;
      const weeks = daysDiff / 7;
      const weeklyAverage = weeks > 0 ? completedWorkouts / weeks : 0;
      
      return {
        totalWorkouts,
        completedWorkouts,
        totalCalories,
        totalDuration,
        averageDuration,
        completionRate,
        workoutsByType,
        weeklyAverage
      };
    } catch (error) {
      console.error('Error getting workout stats:', error);
      throw error;
    }
  }

  // Helper methods
  private calculateExerciseDuration(exercise: Exercise): number {
    // Estimate duration based on sets and type
    let baseDuration = 0;
    
    if (exercise.category === 'cardio') {
      baseDuration = exercise.sets * 1.5; // 1.5 minutes per set for cardio
    } else if (exercise.category === 'strength') {
      baseDuration = exercise.sets * 2; // 2 minutes per set for strength
    } else {
      baseDuration = exercise.sets * 1; // 1 minute per set for flexibility
    }
    
    return Math.round(baseDuration);
  }

  private async getFullSchedule(): Promise<{ [key: string]: WorkoutEvent }> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_SCHEDULE);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading workout schedule:', error);
      return {};
    }
  }

  private async saveFullSchedule(schedule: { [key: string]: WorkoutEvent }): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.WORKOUT_SCHEDULE, JSON.stringify(schedule));
    } catch (error) {
      console.error('Error saving workout schedule:', error);
      throw error;
    }
  }

  private async saveToHistory(action: string, data: any): Promise<void> {
    try {
      const historyData = await AsyncStorage.getItem(this.STORAGE_KEYS.SCHEDULE_HISTORY);
      const history = historyData ? JSON.parse(historyData) : [];
      
      history.unshift({
        id: Date.now().toString(),
        action,
        data,
        timestamp: new Date(),
      });
      
      // Keep only last 50 history items
      if (history.length > 50) {
        history.splice(50);
      }
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.SCHEDULE_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }

  // User preferences management
  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return null;
    }
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      console.log('User preferences saved');
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  // Add a new workout to the schedule
  async addWorkout(date: Date, workoutData: Omit<WorkoutEvent, 'id' | 'date'>): Promise<WorkoutEvent> {
    try {
      const schedule = await this.getFullSchedule();
      const dateKey = moment(date).format('YYYY-MM-DD');
      
      // Create new workout with generated ID
      const newWorkout: WorkoutEvent = {
        ...workoutData,
        id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: date,
        completed: false,
        modifiedAt: new Date()
      };
      
      // Add to schedule
      schedule[dateKey] = newWorkout;
      
      // Save updated schedule
      await AsyncStorage.setItem(this.STORAGE_KEYS.WORKOUT_SCHEDULE, JSON.stringify(schedule));
      
      console.log('Added new workout for', dateKey, ':', newWorkout.title);
      return newWorkout;
    } catch (error) {
      console.error('Error adding workout:', error);
      throw error;
    }
  }

  // Generate workout using Wger data
  async generateWorkoutWithWgerData(
    type: string,
    targetMuscles: string[],
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<WorkoutEvent> {
    try {
      // Get exercises from Wger data
      const wgerExercises = wgerExerciseService.generateWorkout(targetMuscles, 6);
      
      // Convert to our Exercise format
      const exercises: Exercise[] = wgerExercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets || 3,
        reps: ex.reps || '10-12',
        weight: ex.weight,
        equipment: ex.equipment,
        muscleGroups: [...ex.muscles, ...(ex.musclesSecondary || [])],
        category: this.mapCategory(ex.category),
        difficulty: ex.difficulty,
        instructions: ex.instructions,
        imageUrl: ex.imageUrl,
        caloriesPerMinute: this.estimateCalories(ex.category)
      }));

      // Calculate total duration
      const totalDuration = exercises.reduce((sum, ex) => sum + this.calculateExerciseDuration(ex), 0);
      const totalCalories = exercises.reduce((sum, ex) => sum + (ex.caloriesPerMinute || 5) * this.calculateExerciseDuration(ex), 0);

      const workout: WorkoutEvent = {
        id: `workout_${Date.now()}`,
        title: `${targetMuscles.join(' & ')} Workout`,
        description: `Custom workout targeting ${targetMuscles.join(', ')}`,
        date: new Date(),
        time: '09:00',
        duration: totalDuration,
        difficulty: difficulty,
        type: type as any,
        calories: totalCalories,
        completed: false,
        exercises: exercises,
        createdBy: 'system',
        tags: targetMuscles
      };

      return workout;
    } catch (error) {
      console.error('Error generating workout with Wger data:', error);
      throw error;
    }
  }

  private mapCategory(category: string): 'strength' | 'cardio' | 'flexibility' | 'balance' {
    const categoryMap: { [key: string]: 'strength' | 'cardio' | 'flexibility' | 'balance' } = {
      'arms': 'strength',
      'legs': 'strength',
      'abs': 'strength',
      'chest': 'strength',
      'back': 'strength',
      'shoulders': 'strength',
      'cardio': 'cardio',
      'stretching': 'flexibility',
      'yoga': 'flexibility',
      'balance': 'balance'
    };
    
    return categoryMap[category.toLowerCase()] || 'strength';
  }

  private estimateCalories(category: string): number {
    const calorieMap: { [key: string]: number } = {
      'cardio': 12,
      'strength': 6,
      'flexibility': 3,
      'balance': 4,
      'arms': 5,
      'legs': 7,
      'abs': 6,
      'chest': 6,
      'back': 6,
      'shoulders': 5
    };
    
    return calorieMap[category.toLowerCase()] || 5;
  }

  // Generate fresh workouts with Wger data for specific days
  async generateWeeklyWorkoutsWithWgerData(): Promise<void> {
    try {
      const workoutConfigs = [
        { dayOffset: 0, type: 'strength', muscles: ['chest', 'triceps'], title: 'Chest & Triceps Power' },
        { dayOffset: 2, type: 'strength', muscles: ['back', 'biceps'], title: 'Back & Biceps Power' },
        { dayOffset: 4, type: 'strength', muscles: ['legs', 'glutes'], title: 'Leg Day' },
        { dayOffset: 1, type: 'cardio', muscles: ['full body'], title: 'HIIT Cardio' },
        { dayOffset: 3, type: 'strength', muscles: ['shoulders', 'abs'], title: 'Shoulders & Core' }
      ];

      for (const config of workoutConfigs) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + config.dayOffset);
        
        // Check if workout already exists for this date
        const existingWorkout = await this.getWorkoutForDate(targetDate);
        if (existingWorkout) {
          console.log('Workout already exists for', moment(targetDate).format('YYYY-MM-DD'));
          continue;
        }

        // Generate workout with Wger data
        const workout = await this.generateWorkoutWithWgerData(
          config.type,
          config.muscles,
          'intermediate'
        );
        
        workout.title = config.title;
        workout.date = targetDate;
        
        // Save the workout
        await this.saveWorkout(workout);
        console.log('Generated workout for', moment(targetDate).format('YYYY-MM-DD'), ':', config.title);
      }

      console.log('Generated weekly workouts with Wger data');
    } catch (error) {
      console.error('Error generating weekly workouts:', error);
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.WORKOUT_SCHEDULE,
        this.STORAGE_KEYS.USER_PREFERENCES,
        this.STORAGE_KEYS.WORKOUT_TEMPLATES,
        this.STORAGE_KEYS.SCHEDULE_HISTORY,
      ]);
      console.log('All workout schedule data cleared');
    } catch (error) {
      console.error('Error clearing workout schedule data:', error);
      throw error;
    }
  }
}

export const workoutScheduleService = new WorkoutScheduleService();
export type { WorkoutEvent, Exercise, UserPreferences, WeeklySchedule };