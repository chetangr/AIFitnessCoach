import * as Haptics from 'expo-haptics';

export class SpatialHapticService {
  private static instance: SpatialHapticService;
  private isEnabled: boolean = true;

  static getInstance(): SpatialHapticService {
    if (!SpatialHapticService.instance) {
      SpatialHapticService.instance = new SpatialHapticService();
    }
    return SpatialHapticService.instance;
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // visionOS-inspired spatial haptics
  spatialDepthChange(depth: number) {
    if (!this.isEnabled) return;
    
    // Different intensity based on depth
    const intensityMap = {
      0: 'impactLight',
      1: 'impactMedium', 
      2: 'impactHeavy',
      3: 'notificationSuccess',
    };
    
    const hapticType = intensityMap[depth as keyof typeof intensityMap] || 'impactLight';
    this.trigger(hapticType as any);
  }

  // Floating element interactions
  floatingElementTouch() {
    if (!this.isEnabled) return;
    this.trigger('impactLight');
  }

  floatingElementLift() {
    if (!this.isEnabled) return;
    this.trigger('impactMedium');
  }

  floatingElementDrop() {
    if (!this.isEnabled) return;
    this.trigger('impactHeavy');
  }

  // Workout-specific haptics
  workoutStart() {
    if (!this.isEnabled) return;
    this.playSequence([
      { type: 'impactMedium', delay: 0 },
      { type: 'impactLight', delay: 100 },
      { type: 'impactLight', delay: 200 },
    ]);
  }

  workoutComplete() {
    if (!this.isEnabled) return;
    this.playSequence([
      { type: 'notificationSuccess', delay: 0 },
      { type: 'impactMedium', delay: 200 },
      { type: 'impactLight', delay: 400 },
    ]);
  }

  exerciseRepComplete() {
    if (!this.isEnabled) return;
    this.trigger('impactLight');
  }

  exerciseSetComplete() {
    if (!this.isEnabled) return;
    this.trigger('impactMedium');
  }

  // AI Coach interaction haptics
  aiCoachAppear() {
    if (!this.isEnabled) return;
    this.playSequence([
      { type: 'impactLight', delay: 0 },
      { type: 'impactMedium', delay: 150 },
    ]);
  }

  aiCoachMessage() {
    if (!this.isEnabled) return;
    this.trigger('impactLight');
  }

  aiCoachThinking() {
    if (!this.isEnabled) return;
    // Gentle pulse pattern
    this.playSequence([
      { type: 'impactLight', delay: 0 },
      { type: 'impactLight', delay: 500 },
      { type: 'impactLight', delay: 1000 },
    ]);
  }

  // Navigation haptics
  spatialNavigation() {
    if (!this.isEnabled) return;
    this.trigger('impactLight');
  }

  deepNavigation() {
    if (!this.isEnabled) return;
    this.trigger('impactMedium');
  }

  // Progress haptics
  progressIncrement(percentage: number) {
    if (!this.isEnabled) return;
    
    // Different haptics based on milestone
    if (percentage >= 100) {
      this.workoutComplete();
    } else if (percentage % 25 === 0) {
      this.trigger('notificationSuccess');
    } else if (percentage % 10 === 0) {
      this.trigger('impactMedium');
    } else {
      this.trigger('impactLight');
    }
  }

  // Achievement haptics
  achievementUnlocked() {
    if (!this.isEnabled) return;
    this.playSequence([
      { type: 'notificationSuccess', delay: 0 },
      { type: 'impactMedium', delay: 200 },
      { type: 'impactMedium', delay: 400 },
      { type: 'impactLight', delay: 600 },
    ]);
  }

  // Gesture haptics
  pinchGesture() {
    if (!this.isEnabled) return;
    this.trigger('impactLight');
  }

  rotateGesture() {
    if (!this.isEnabled) return;
    this.trigger('impactLight');
  }

  swipeGesture() {
    if (!this.isEnabled) return;
    this.trigger('impactLight');
  }

  // Error and warning haptics
  error() {
    if (!this.isEnabled) return;
    this.playSequence([
      { type: 'notificationError', delay: 0 },
      { type: 'impactMedium', delay: 100 },
    ]);
  }

  warning() {
    if (!this.isEnabled) return;
    this.trigger('notificationWarning');
  }

  // Form check haptics
  formCorrect() {
    if (!this.isEnabled) return;
    this.trigger('notificationSuccess');
  }

  formIncorrect() {
    if (!this.isEnabled) return;
    this.trigger('notificationWarning');
  }

  // Timing haptics for workouts
  countdownTick() {
    if (!this.isEnabled) return;
    this.trigger('impactLight');
  }

  countdownFinal() {
    if (!this.isEnabled) return;
    this.trigger('impactHeavy');
  }

  // Rhythmic haptics for tempo
  rhythmBeat(intensity: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!this.isEnabled) return;
    const type = intensity === 'light' ? 'impactLight' : 
                 intensity === 'medium' ? 'impactMedium' : 'impactHeavy';
    this.trigger(type);
  }

  // Private methods
  private async trigger(type: string) {
    if (!this.isEnabled) return;
    
    try {
      switch (type) {
        case 'impactLight':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'impactMedium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'impactHeavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'notificationSuccess':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'notificationWarning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'notificationError':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  private playSequence(sequence: Array<{ type: string; delay: number }>) {
    sequence.forEach(({ type, delay }) => {
      setTimeout(async () => {
        await this.trigger(type);
      }, delay);
    });
  }

  // Directional haptics (for form guidance)
  directionalPulse(direction: 'left' | 'right' | 'up' | 'down') {
    if (!this.isEnabled) return;
    
    // Simulate directional feedback with different patterns
    switch (direction) {
      case 'left':
        this.playSequence([
          { type: 'impactLight', delay: 0 },
          { type: 'impactMedium', delay: 100 },
        ]);
        break;
      case 'right':
        this.playSequence([
          { type: 'impactMedium', delay: 0 },
          { type: 'impactLight', delay: 100 },
        ]);
        break;
      case 'up':
        this.playSequence([
          { type: 'impactLight', delay: 0 },
          { type: 'impactLight', delay: 50 },
          { type: 'impactMedium', delay: 100 },
        ]);
        break;
      case 'down':
        this.playSequence([
          { type: 'impactMedium', delay: 0 },
          { type: 'impactLight', delay: 50 },
          { type: 'impactLight', delay: 100 },
        ]);
        break;
    }
  }

  // Environment change haptics
  environmentTransition(fromEnv: string, toEnv: string) {
    if (!this.isEnabled) return;
    
    // Different patterns for different environment transitions
    const environmentHaptics: Record<string, string> = {
      'gym': 'impactHeavy',
      'outdoor': 'impactMedium',
      'home': 'impactLight',
      'focus': 'notificationSuccess',
      'cosmic': 'notificationWarning',
    };

    this.playSequence([
      { type: environmentHaptics[fromEnv] || 'impactMedium', delay: 0 },
      { type: environmentHaptics[toEnv] || 'impactMedium', delay: 300 },
    ]);
  }
}

// Export singleton instance
export const spatialHaptics = SpatialHapticService.getInstance();