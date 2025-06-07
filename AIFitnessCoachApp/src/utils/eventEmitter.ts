/**
 * Global Event Emitter for app-wide events
 */

import { EventEmitter } from 'events';

class AppEventEmitter extends EventEmitter {
  // Event names as constants
  static WORKOUT_UPDATED = 'workout_updated';
  static WORKOUT_ADDED = 'workout_added';
  static WORKOUT_REMOVED = 'workout_removed';
  static SCHEDULE_CHANGED = 'schedule_changed';
  static PROFILE_UPDATED = 'profile_updated';
  static COACH_CHANGED = 'coach_changed';
  
  constructor() {
    super();
    this.setMaxListeners(20); // Increase max listeners to prevent warnings
  }
  
  /**
   * Emit workout update event
   */
  emitWorkoutUpdate(workoutId?: string) {
    this.emit(AppEventEmitter.WORKOUT_UPDATED, { workoutId });
  }
  
  /**
   * Emit workout added event
   */
  emitWorkoutAdded(workoutId: string) {
    this.emit(AppEventEmitter.WORKOUT_ADDED, { workoutId });
  }
  
  /**
   * Emit workout removed event
   */
  emitWorkoutRemoved(workoutId: string) {
    this.emit(AppEventEmitter.WORKOUT_REMOVED, { workoutId });
  }
  
  /**
   * Emit schedule changed event
   */
  emitScheduleChanged() {
    this.emit(AppEventEmitter.SCHEDULE_CHANGED);
  }
}

export const appEventEmitter = new AppEventEmitter();