import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FitnessMetricsOverlay from '../components/FitnessMetricsOverlay';
import { fitnessMetricsService } from '../services/fitnessMetricsService';

const { width } = Dimensions.get('window');

interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion
}

interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
  targetSets: number;
  targetReps: number;
  lastWeight: number;
}

interface WorkoutSession {
  id: string;
  date: string;
  exercises: Exercise[];
  duration: number;
  totalSets: number;
  totalVolume: number;
}

const WorkoutTrackingScreen = ({ route, navigation }: any) => {
  const { workout } = route.params || {};
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [showRpeModal, setShowRpeModal] = useState(false);
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitReason, setExitReason] = useState('');
  const [workoutRating, setWorkoutRating] = useState(0);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession>({
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    exercises: [],
    duration: 0,
    totalSets: 0,
    totalVolume: 0,
  });
  
  // Fitness metrics state
  const [fitnessMetrics, setFitnessMetrics] = useState({
    heartRate: 70,
    calories: 0,
    activeMinutes: 0,
    distance: 0,
    steps: 0,
    avgHeartRate: 70,
  });

  useEffect(() => {
    initializeWorkout();
    
    // Start workout timer
    const timer = setInterval(() => {
      setWorkoutTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Subscribe to fitness metrics
  useEffect(() => {
    const unsubscribe = fitnessMetricsService.subscribe((metrics) => {
      setFitnessMetrics(metrics);
    });

    // Start tracking when workout begins
    const currentExercise = exercises[currentExerciseIndex];
    if (currentExercise) {
      fitnessMetricsService.startTracking(currentExercise.name, 'medium');
    }

    return () => {
      unsubscribe();
    };
  }, [currentExerciseIndex, exercises]);

  const initializeWorkout = async () => {
    try {
      // Load previous workout data for reference
      const savedWorkouts = await AsyncStorage.getItem('workoutSessions');
      const previousWorkouts = savedWorkouts ? JSON.parse(savedWorkouts) : [];
      
      // Initialize exercises with default sets
      const defaultExercises: Exercise[] = [
        {
          id: '1',
          name: 'Bench',
          targetSets: 3,
          targetReps: 8,
          lastWeight: 135,
          sets: []
        },
        {
          id: '2',
          name: 'Squat',
          targetSets: 3,
          targetReps: 10,
          lastWeight: 185,
          sets: []
        },
        {
          id: '3',
          name: 'Deadlift',
          targetSets: 3,
          targetReps: 5,
          lastWeight: 225,
          sets: []
        },
        {
          id: '4',
          name: 'OH Press',
          targetSets: 3,
          targetReps: 8,
          lastWeight: 95,
          sets: []
        },
      ];

      // Initialize sets for each exercise
      const initializedExercises = defaultExercises.map(exercise => {
        const sets: WorkoutSet[] = [];
        for (let i = 0; i < exercise.targetSets; i++) {
          sets.push({
            id: `${exercise.id}_set_${i + 1}`,
            setNumber: i + 1,
            reps: exercise.targetReps,
            weight: exercise.lastWeight,
            completed: false,
          });
        }
        return { ...exercise, sets };
      });

      setExercises(initializedExercises);
    } catch (error) {
      console.error('Error initializing workout:', error);
    }
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    const set = updatedExercises[exerciseIndex].sets[setIndex];
    
    if (set.reps === 0 || set.weight === 0) {
      Alert.alert('Invalid Set', 'Please enter reps and weight before completing the set.');
      return;
    }

    set.completed = true;
    setExercises(updatedExercises);

    // Show RPE modal
    setSelectedSetIndex(setIndex);
    setShowRpeModal(true);
  };

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    const exercise = updatedExercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    
    const newSet: WorkoutSet = {
      id: `${exercise.id}_set_${exercise.sets.length + 1}`,
      setNumber: exercise.sets.length + 1,
      reps: lastSet ? lastSet.reps : exercise.targetReps,
      weight: lastSet ? lastSet.weight : exercise.lastWeight,
      completed: false,
    };

    exercise.sets.push(newSet);
    setExercises(updatedExercises);
  };

  const finishWorkout = async () => {
    try {
      // Stop fitness tracking
      fitnessMetricsService.stopTracking();
      
      // Calculate session stats
      const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
      const totalVolume = exercises.reduce((sum, ex) => 
        sum + ex.sets.filter(s => s.completed).reduce((setSum, set) => setSum + (set.reps * set.weight), 0), 0
      );

      const session: WorkoutSession = {
        id: workoutSession.id,
        date: workoutSession.date,
        exercises: exercises.map(ex => ({
          ...ex,
          sets: ex.sets.filter(s => s.completed)
        })),
        duration: workoutTimer,
        totalSets,
        totalVolume,
      };

      // Save session
      const savedSessions = await AsyncStorage.getItem('workoutSessions');
      const sessions = savedSessions ? JSON.parse(savedSessions) : [];
      sessions.push(session);
      await AsyncStorage.setItem('workoutSessions', JSON.stringify(sessions));

      // Save individual sets for stats
      const allSets = exercises.flatMap(ex => 
        ex.sets.filter(s => s.completed).map(set => ({
          id: set.id,
          exerciseName: ex.name,
          sets: 1,
          reps: set.reps,
          weight: set.weight,
          date: session.date,
          duration: Math.round(workoutTimer / totalSets), // Average time per set
        }))
      );

      const savedSets = await AsyncStorage.getItem('workoutSets');
      const existingSets = savedSets ? JSON.parse(savedSets) : [];
      const updatedSets = [...existingSets, ...allSets];
      await AsyncStorage.setItem('workoutSets', JSON.stringify(updatedSets));

      Alert.alert(
        'Workout Complete!',
        `Great job! You completed ${totalSets} sets with ${totalVolume}lbs total volume in ${Math.round(workoutTimer / 60)} minutes.`,
        [
          {
            text: 'View Stats',
            onPress: () => navigation.navigate('Stats')
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout data');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackPress = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    if (workoutRating === 0) {
      Alert.alert('Rate Workout', 'Please rate your workout before exiting');
      return;
    }
    
    if (exitReason.trim() === '') {
      Alert.alert('Exit Reason', 'Please tell us why you\'re ending the workout early');
      return;
    }

    // Save partial workout data if any sets were completed
    const completedSets = exercises.flatMap(ex => ex.sets.filter(s => s.completed));
    if (completedSets.length > 0) {
      // Save partial workout with exit reason and rating
      console.log('Saving partial workout:', { 
        completedSets: completedSets.length, 
        reason: exitReason, 
        rating: workoutRating 
      });
    }

    navigation.goBack();
  };

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.container}>
      {/* Fitness Metrics Overlay */}
      <FitnessMetricsOverlay
        heartRate={fitnessMetrics.heartRate}
        calories={fitnessMetrics.calories}
        elapsedTime={formatTime(workoutTimer)}
        activeMinutes={fitnessMetrics.activeMinutes}
        currentExercise={currentExercise?.name}
        setsCompleted={exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)}
        totalSets={exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
        style="minimal"
        position="top"
        theme="dark"
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Workout Tracking</Text>
          <Text style={styles.workoutTimer}>{formatTime(workoutTimer)}</Text>
        </View>
        <TouchableOpacity onPress={finishWorkout}>
          <Icon name="checkmark-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Exercise Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.exerciseNav}
      >
        {exercises.map((exercise, index) => (
          <TouchableOpacity
            key={exercise.id}
            onPress={() => setCurrentExerciseIndex(index)}
            style={[
              styles.exerciseTab,
              currentExerciseIndex === index && styles.activeExerciseTab
            ]}
          >
            <Text 
              style={[
                styles.exerciseTabText,
                currentExerciseIndex === index && styles.activeExerciseTabText
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {exercise.name}
            </Text>
            <Text style={styles.exerciseProgress}>
              {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Current Exercise */}
      {currentExercise && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <BlurView intensity={20} tint="light" style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <TouchableOpacity 
                onPress={() => addSet(currentExerciseIndex)}
                style={styles.addSetButton}
              >
                <Icon name="add-circle" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            
            {/* Previous Best */}
            <View style={styles.previousBest}>
              <Text style={styles.previousBestLabel}>Previous Best:</Text>
              <Text style={styles.previousBestValue}>
                {currentExercise.targetReps} reps @ {currentExercise.lastWeight}lbs
              </Text>
            </View>

            {/* Sets */}
            <View style={styles.setsContainer}>
              <View style={styles.setsHeader}>
                <Text style={styles.setHeaderText}>Set</Text>
                <Text style={styles.setHeaderText}>Reps</Text>
                <Text style={styles.setHeaderText}>Weight</Text>
                <Text style={styles.setHeaderText}>✓</Text>
              </View>

              {currentExercise.sets.map((set, setIndex) => (
                <View key={set.id} style={[
                  styles.setRow,
                  set.completed && styles.completedSetRow
                ]}>
                  <Text style={styles.setNumber}>{set.setNumber}</Text>
                  
                  <TextInput
                    style={[styles.setInput, set.completed && styles.completedInput]}
                    value={set.reps.toString()}
                    onChangeText={(text) => updateSet(currentExerciseIndex, setIndex, 'reps', parseInt(text) || 0)}
                    keyboardType="numeric"
                    editable={!set.completed}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                  
                  <TextInput
                    style={[styles.setInput, set.completed && styles.completedInput]}
                    value={set.weight.toString()}
                    onChangeText={(text) => updateSet(currentExerciseIndex, setIndex, 'weight', parseInt(text) || 0)}
                    keyboardType="numeric"
                    editable={!set.completed}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                  
                  <TouchableOpacity
                    onPress={() => completeSet(currentExerciseIndex, setIndex)}
                    disabled={set.completed}
                    style={[
                      styles.completeButton,
                      set.completed && styles.completedButton
                    ]}
                  >
                    <Icon 
                      name={set.completed ? "checkmark" : "ellipse-outline"} 
                      size={20} 
                      color={set.completed ? "#4CAF50" : "rgba(255,255,255,0.6)"} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </BlurView>

          {/* Rest Timer */}
          <BlurView intensity={15} tint="light" style={styles.restCard}>
            <Text style={styles.restLabel}>Rest Between Sets</Text>
            <Text style={styles.restTime}>90 seconds</Text>
            <TouchableOpacity style={styles.startRestButton}>
              <Text style={styles.startRestText}>Start Rest Timer</Text>
            </TouchableOpacity>
          </BlurView>
        </ScrollView>
      )}

      {/* RPE Modal */}
      <Modal visible={showRpeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.modal}>
            <Text style={styles.modalTitle}>Rate Your Set</Text>
            <Text style={styles.modalSubtitle}>How difficult was that set? (1-10)</Text>
            
            <View style={styles.rpeButtons}>
              {[...Array(10)].map((_, i) => (
                <TouchableOpacity
                  key={i + 1}
                  onPress={() => {
                    // Update RPE for the set
                    const updatedExercises = [...exercises];
                    updatedExercises[currentExerciseIndex].sets[selectedSetIndex].rpe = i + 1;
                    setExercises(updatedExercises);
                    setShowRpeModal(false);
                  }}
                  style={styles.rpeButton}
                >
                  <Text style={styles.rpeButtonText}>{i + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              onPress={() => setShowRpeModal(false)}
              style={styles.skipButton}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal visible={showExitModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.exitModal}>
            <Text style={styles.exitModalTitle}>End Workout Early?</Text>
            <Text style={styles.exitModalSubtitle}>Tell us why you're stopping and rate your session</Text>
            
            {/* Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>How was your workout?</Text>
              <View style={styles.starRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setWorkoutRating(star)}
                  >
                    <Icon 
                      name={star <= workoutRating ? "star" : "star-outline"} 
                      size={32} 
                      color="#FFD700" 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Exit Reason */}
            <View style={styles.reasonSection}>
              <Text style={styles.reasonLabel}>Reason for ending early:</Text>
              <View style={styles.reasonOptions}>
                {['Feeling tired', 'Time constraint', 'Equipment issue', 'Not feeling well', 'Other'].map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    onPress={() => setExitReason(reason)}
                    style={[
                      styles.reasonButton,
                      exitReason === reason && styles.selectedReasonButton
                    ]}
                  >
                    <Text style={[
                      styles.reasonButtonText,
                      exitReason === reason && styles.selectedReasonText
                    ]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.exitModalActions}>
              <TouchableOpacity 
                onPress={() => setShowExitModal(false)}
                style={styles.cancelExitButton}
              >
                <Text style={styles.cancelExitText}>Continue Workout</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={confirmExit}
                style={styles.confirmExitButton}
              >
                <Text style={styles.confirmExitText}>End Workout</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  workoutTimer: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  exerciseNav: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  exerciseTab: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    width: 55,
    height: 40,
    justifyContent: 'center',
  },
  activeExerciseTab: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  exerciseTabText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 10,
  },
  activeExerciseTabText: {
    color: 'white',
  },
  exerciseProgress: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
    marginTop: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addSetButton: {
    padding: 4,
  },
  previousBest: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  previousBestLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  previousBestValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  setsContainer: {
    marginTop: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  setHeaderText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    width: 60,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  completedSetRow: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  setNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    width: 60,
    textAlign: 'center',
  },
  setInput: {
    width: 70,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  completedInput: {
    backgroundColor: 'rgba(76,175,80,0.2)',
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  completedButton: {
    backgroundColor: 'rgba(76,175,80,0.2)',
  },
  restCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 100,
    overflow: 'hidden',
  },
  restLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  restTime: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  startRestButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(103,126,234,0.3)',
    borderRadius: 20,
  },
  startRestText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: width * 0.9,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
    textAlign: 'center',
  },
  rpeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rpeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  rpeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  exitModal: {
    width: width * 0.9,
    maxHeight: '80%',
    padding: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  exitModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  exitModalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  reasonSection: {
    marginBottom: 24,
  },
  reasonLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
  },
  reasonOptions: {
    gap: 8,
  },
  reasonButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectedReasonButton: {
    backgroundColor: 'rgba(103,126,234,0.3)',
    borderColor: '#667eea',
  },
  reasonButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedReasonText: {
    color: 'white',
    fontWeight: '600',
  },
  exitModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelExitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelExitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmExitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F44336',
  },
  confirmExitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default WorkoutTrackingScreen;