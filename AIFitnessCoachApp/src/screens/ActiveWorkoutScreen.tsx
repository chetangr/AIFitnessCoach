import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import FitnessMetricsOverlay from '../components/FitnessMetricsOverlay';
import { fitnessMetricsService } from '../services/fitnessMetricsService';
// Logger temporarily removed - was causing import errors

const ActiveWorkoutScreen = ({ route, navigation }: any) => {
  const { workout } = route.params || {};
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(60);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [volumeEnabled, setVolumeEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalSets, setTotalSets] = useState(0);
  
  // Fitness metrics state
  const [fitnessMetrics, setFitnessMetrics] = useState({
    heartRate: 70,
    calories: 0,
    activeMinutes: 0,
    distance: 0,
    steps: 0,
    avgHeartRate: 70,
  });

  const exercises = [
    { name: 'Push-ups', sets: 3, reps: 12, rest: 60 },
    { name: 'Pull-ups', sets: 3, reps: 8, rest: 90 },
    { name: 'Dumbbell Press', sets: 3, reps: 10, rest: 60 },
    { name: 'Bent-Over Rows', sets: 3, reps: 10, rest: 60 },
    { name: 'Shoulder Press', sets: 3, reps: 10, rest: 60 },
    { name: 'Plank', sets: 3, reps: '30s', rest: 45 },
  ];

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setWorkoutTimer((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused]);

  useEffect(() => {
    if (isResting && restTimer > 0) {
      const timer = setTimeout(() => {
        setRestTimer((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isResting && restTimer === 0) {
      setIsResting(false);
      setRestTimer(currentExercise.rest);
    }
  }, [isResting, restTimer]);

  // Initialize total sets
  useEffect(() => {
    const total = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    setTotalSets(total);
  }, []);

  // Subscribe to fitness metrics
  useEffect(() => {
    const unsubscribe = fitnessMetricsService.subscribe((metrics) => {
      setFitnessMetrics(metrics);
    });

    // Start tracking when workout begins
    if (!isPaused && !isResting) {
      const intensity = currentExercise.name.includes('Plank') ? 'low' : 'medium';
      fitnessMetricsService.startTracking(currentExercise.name, intensity);
    } else if (isPaused) {
      fitnessMetricsService.pauseTracking();
    } else if (isResting) {
      fitnessMetricsService.changeExercise('rest', 'low');
    }

    return () => {
      unsubscribe();
    };
  }, [isPaused, isResting, currentExercise]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setIsResting(true);
      console.log('Exercise Completed', { 
        exercise: currentExercise.name,
        index: currentExerciseIndex 
      });
    } else {
      handleFinishWorkout();
    }
  };

  const handleFinishWorkout = () => {
    console.log('Workout Completed', { 
      duration: workoutTimer,
      exercisesCompleted: currentExerciseIndex + 1 
    });
    // Stop fitness tracking
    fitnessMetricsService.stopTracking();
    navigation.navigate('MainTabs');
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Fitness Metrics Overlay */}
      <FitnessMetricsOverlay
        heartRate={fitnessMetrics.heartRate}
        calories={fitnessMetrics.calories}
        elapsedTime={formatTime(workoutTimer)}
        activeMinutes={fitnessMetrics.activeMinutes}
        currentExercise={currentExercise.name}
        setsCompleted={currentSet}
        totalSets={totalSets}
        style="compact"
        position="top"
        showRings={true}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={32} color="white" />
        </TouchableOpacity>
        <Text style={styles.workoutName}>{workout?.name || 'Upper Body Workout'}</Text>
        <Text style={styles.timer}>{formatTime(workoutTimer)}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#4CAF50', '#45B7D1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentExerciseIndex + 1} of {exercises.length} exercises
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {!isResting ? (
          <>
            {/* Exercise Display */}
            <BlurView intensity={30} tint="light" style={styles.exerciseCard}>
              <Text style={styles.exerciseNumber}>Exercise {currentExerciseIndex + 1}</Text>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              
              <View style={styles.exerciseDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Sets</Text>
                  <Text style={styles.detailValue}>{currentExercise.sets}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Reps</Text>
                  <Text style={styles.detailValue}>{currentExercise.reps}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Rest</Text>
                  <Text style={styles.detailValue}>{currentExercise.rest}s</Text>
                </View>
              </View>
            </BlurView>

            {/* Exercise Animation Placeholder */}
            <BlurView intensity={20} tint="light" style={styles.animationContainer}>
              <Icon name="fitness" size={100} color="white" />
              <Text style={styles.animationText}>Exercise Animation</Text>
            </BlurView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={handleNextExercise}
              >
                <Text style={styles.completeButtonText}>Complete Exercise</Text>
                <Icon name="checkmark-circle" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.helpButton}
                onPress={() => {
                  // Show exercise instructions
                  console.log('Show instructions for:', currentExercise.name);
                  // Could implement a modal with exercise instructions
                }}
              >
                <Icon name="help-circle" size={24} color="white" />
                <Text style={styles.helpButtonText}>View Instructions</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Rest Screen */}
            <BlurView intensity={30} tint="light" style={styles.restCard}>
              <Icon name="time" size={60} color="white" />
              <Text style={styles.restTitle}>Rest Time</Text>
              <Text style={styles.restTimer}>{restTimer}s</Text>
              
              <Text style={styles.nextExerciseLabel}>Next Exercise:</Text>
              <Text style={styles.nextExerciseName}>
                {currentExerciseIndex < exercises.length - 1 
                  ? exercises[currentExerciseIndex + 1].name 
                  : 'Workout Complete!'}
              </Text>

              <TouchableOpacity 
                style={styles.skipButton}
                onPress={() => {
                  setIsResting(false);
                  setRestTimer(currentExercise.rest);
                }}
              >
                <Text style={styles.skipButtonText}>Skip Rest</Text>
              </TouchableOpacity>
            </BlurView>
          </>
        )}
      </ScrollView>

      {/* Bottom Controls */}
      <BlurView intensity={80} tint="dark" style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setVolumeEnabled(!volumeEnabled)}
        >
          <Icon 
            name={volumeEnabled ? "volume-high" : "volume-mute"} 
            size={28} 
            color={volumeEnabled ? "white" : "rgba(255,255,255,0.5)"} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setMusicEnabled(!musicEnabled)}
        >
          <Icon 
            name={musicEnabled ? "musical-notes" : "musical-notes-outline"} 
            size={28} 
            color={musicEnabled ? "white" : "rgba(255,255,255,0.5)"} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.pauseButton}
          onPress={() => {
            setIsPaused(!isPaused);
            console.log('Workout', isPaused ? 'Resumed' : 'Paused');
          }}
        >
          <Icon name={isPaused ? "play" : "pause"} size={32} color="white" />
        </TouchableOpacity>
      </BlurView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  exerciseNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  animationContainer: {
    height: 200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  animationText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 16,
  },
  actionButtons: {
    gap: 12,
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  helpButtonText: {
    color: 'white',
    fontSize: 16,
  },
  restCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  restTimer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
  nextExerciseLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  nextExerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
  skipButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  skipButtonText: {
    color: 'white',
    fontSize: 16,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActiveWorkoutScreen;