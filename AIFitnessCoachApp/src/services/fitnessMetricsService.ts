import AsyncStorage from '@react-native-async-storage/async-storage';

interface FitnessMetrics {
  heartRate: number;
  calories: number;
  activeMinutes: number;
  distance: number;
  steps: number;
  avgHeartRate: number;
}

interface HeartRateZone {
  zone: 'resting' | 'warmup' | 'fatburn' | 'cardio' | 'peak';
  min: number;
  max: number;
  color: string;
}

class FitnessMetricsService {
  private baselineHeartRate: number = 70;
  private userAge: number = 30;
  private userWeight: number = 70; // kg
  private isTracking: boolean = false;
  private metricsInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(metrics: FitnessMetrics) => void> = new Set();
  
  private currentMetrics: FitnessMetrics = {
    heartRate: 70,
    calories: 0,
    activeMinutes: 0,
    distance: 0,
    steps: 0,
    avgHeartRate: 70,
  };

  constructor() {
    this.loadUserProfile();
  }

  private async loadUserProfile() {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        const data = JSON.parse(profile);
        this.userAge = data.age || 30;
        this.userWeight = data.weight || 70;
        this.baselineHeartRate = data.restingHeartRate || 70;
      }
    } catch (error) {
      console.log('Error loading user profile for metrics:', error);
    }
  }

  // Calculate heart rate zones based on age
  getHeartRateZones(): HeartRateZone[] {
    const maxHeartRate = 220 - this.userAge;
    
    return [
      {
        zone: 'resting',
        min: 0,
        max: Math.round(maxHeartRate * 0.5),
        color: '#5AC8FA',
      },
      {
        zone: 'warmup',
        min: Math.round(maxHeartRate * 0.5),
        max: Math.round(maxHeartRate * 0.6),
        color: '#4CD964',
      },
      {
        zone: 'fatburn',
        min: Math.round(maxHeartRate * 0.6),
        max: Math.round(maxHeartRate * 0.7),
        color: '#FFCC00',
      },
      {
        zone: 'cardio',
        min: Math.round(maxHeartRate * 0.7),
        max: Math.round(maxHeartRate * 0.85),
        color: '#FF9500',
      },
      {
        zone: 'peak',
        min: Math.round(maxHeartRate * 0.85),
        max: maxHeartRate,
        color: '#FF3B30',
      },
    ];
  }

  getCurrentZone(heartRate: number): HeartRateZone {
    const zones = this.getHeartRateZones();
    return zones.find(zone => heartRate >= zone.min && heartRate <= zone.max) || zones[0];
  }

  // Simulate heart rate based on exercise type and intensity
  private simulateHeartRate(exerciseType: string, intensity: 'low' | 'medium' | 'high' = 'medium'): number {
    const intensityMultipliers = {
      low: 1.3,
      medium: 1.6,
      high: 1.9,
    };

    const exerciseMultipliers: { [key: string]: number } = {
      'push-ups': 1.4,
      'pull-ups': 1.5,
      'squats': 1.6,
      'deadlifts': 1.7,
      'running': 1.8,
      'cycling': 1.6,
      'plank': 1.2,
      'rest': 0.9,
    };

    const baseMultiplier = exerciseMultipliers[exerciseType.toLowerCase()] || 1.4;
    const intensityMult = intensityMultipliers[intensity];
    
    // Add some randomness for realism
    const randomVariation = 0.9 + Math.random() * 0.2;
    
    const targetHeartRate = this.baselineHeartRate * baseMultiplier * intensityMult * randomVariation;
    
    // Smooth transition to target heart rate
    const diff = targetHeartRate - this.currentMetrics.heartRate;
    this.currentMetrics.heartRate += diff * 0.1;
    
    // Ensure heart rate stays within realistic bounds
    const maxHeartRate = 220 - this.userAge;
    this.currentMetrics.heartRate = Math.min(
      Math.max(60, Math.round(this.currentMetrics.heartRate)),
      maxHeartRate
    );

    return this.currentMetrics.heartRate;
  }

  // Calculate calories burned using MET values
  private calculateCaloriesBurned(exerciseType: string, duration: number): number {
    const metValues: { [key: string]: number } = {
      'push-ups': 8.0,
      'pull-ups': 8.0,
      'squats': 5.0,
      'deadlifts': 6.0,
      'running': 9.8,
      'cycling': 7.5,
      'plank': 3.0,
      'rest': 1.5,
      'walking': 3.5,
    };

    const met = metValues[exerciseType.toLowerCase()] || 4.0;
    const caloriesPerMinute = (met * this.userWeight * 3.5) / 200;
    
    return caloriesPerMinute * (duration / 60); // duration in seconds
  }

  // Start tracking metrics
  startTracking(exerciseType: string = 'general', intensity: 'low' | 'medium' | 'high' = 'medium') {
    if (this.isTracking) return;
    
    this.isTracking = true;
    const startTime = Date.now();
    let lastUpdate = startTime;

    this.metricsInterval = setInterval(() => {
      const now = Date.now();
      const elapsedTotal = (now - startTime) / 1000; // Total elapsed in seconds
      const elapsedSinceLastUpdate = (now - lastUpdate) / 1000; // Elapsed since last update
      
      // Update heart rate
      this.simulateHeartRate(exerciseType, intensity);
      
      // Update calories
      const caloriesBurned = this.calculateCaloriesBurned(exerciseType, elapsedSinceLastUpdate);
      this.currentMetrics.calories += caloriesBurned;
      
      // Update active minutes (if heart rate is above resting zone)
      const zones = this.getHeartRateZones();
      if (this.currentMetrics.heartRate > zones[0].max) {
        this.currentMetrics.activeMinutes = Math.floor(elapsedTotal / 60);
      }
      
      // Update average heart rate
      this.currentMetrics.avgHeartRate = Math.round(
        (this.currentMetrics.avgHeartRate * 0.95) + (this.currentMetrics.heartRate * 0.05)
      );
      
      // Simulate distance for cardio exercises
      if (['running', 'cycling', 'walking'].includes(exerciseType.toLowerCase())) {
        const speedKmh = exerciseType === 'running' ? 10 : exerciseType === 'cycling' ? 20 : 5;
        this.currentMetrics.distance += (speedKmh / 3600) * elapsedSinceLastUpdate;
      }
      
      // Simulate steps
      if (['running', 'walking'].includes(exerciseType.toLowerCase())) {
        const stepsPerMinute = exerciseType === 'running' ? 160 : 100;
        this.currentMetrics.steps += Math.round((stepsPerMinute / 60) * elapsedSinceLastUpdate);
      }
      
      lastUpdate = now;
      
      // Notify all listeners
      this.notifyListeners();
    }, 1000); // Update every second
  }

  // Stop tracking
  stopTracking() {
    this.isTracking = false;
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    // Save session data
    this.saveSession();
  }

  // Pause tracking
  pauseTracking() {
    this.isTracking = false;
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  // Resume tracking
  resumeTracking(exerciseType: string = 'general', intensity: 'low' | 'medium' | 'high' = 'medium') {
    if (!this.isTracking) {
      this.startTracking(exerciseType, intensity);
    }
  }

  // Change exercise type during workout
  changeExercise(exerciseType: string, intensity: 'low' | 'medium' | 'high' = 'medium') {
    if (this.isTracking) {
      // Don't restart, just update the exercise type for the simulation
      // The next interval will use the new exercise type
    }
  }

  // Get current metrics
  getCurrentMetrics(): FitnessMetrics {
    return { ...this.currentMetrics };
  }

  // Reset metrics
  resetMetrics() {
    this.currentMetrics = {
      heartRate: this.baselineHeartRate,
      calories: 0,
      activeMinutes: 0,
      distance: 0,
      steps: 0,
      avgHeartRate: this.baselineHeartRate,
    };
    this.notifyListeners();
  }

  // Subscribe to metrics updates
  subscribe(listener: (metrics: FitnessMetrics) => void) {
    this.listeners.add(listener);
    // Immediately send current metrics
    listener(this.getCurrentMetrics());
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    const metrics = this.getCurrentMetrics();
    this.listeners.forEach(listener => listener(metrics));
  }

  // Save workout session
  private async saveSession() {
    try {
      const session = {
        date: new Date().toISOString(),
        duration: this.currentMetrics.activeMinutes * 60,
        calories: Math.round(this.currentMetrics.calories),
        avgHeartRate: this.currentMetrics.avgHeartRate,
        maxHeartRate: this.currentMetrics.heartRate,
        distance: this.currentMetrics.distance,
        steps: this.currentMetrics.steps,
      };

      const sessions = await AsyncStorage.getItem('workoutSessions');
      const sessionList = sessions ? JSON.parse(sessions) : [];
      sessionList.push(session);
      
      // Keep only last 100 sessions
      if (sessionList.length > 100) {
        sessionList.shift();
      }
      
      await AsyncStorage.setItem('workoutSessions', JSON.stringify(sessionList));
    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  }

  // Get historical data
  async getHistoricalSessions() {
    try {
      const sessions = await AsyncStorage.getItem('workoutSessions');
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error loading historical sessions:', error);
      return [];
    }
  }
}

export const fitnessMetricsService = new FitnessMetricsService();
export default fitnessMetricsService;