import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import backendWorkoutService, {
  WorkoutSession,
  ExercisePerformance,
  SetPerformance,
} from '../services/backendWorkoutService';
import { exercises } from '../data/exerciseDatabase';

interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  targetReps: number;
  exercisePerformanceId?: string;
  completedSets: SetPerformance[];
}

const EnhancedWorkoutTrackingScreen = ({ navigation, route }: any) => {
  const { workoutPlan } = route.params || {};
  
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form inputs
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (workoutPlan) {
      initializeWorkout();
    }
  }, [workoutPlan]);

  const initializeWorkout = async () => {
    try {
      setLoading(true);
      
      // Start workout session
      const session = await backendWorkoutService.startWorkoutSession(
        workoutPlan.name,
        workoutPlan.id
      );
      setActiveSession(session);
      
      // Initialize exercises
      const exerciseList: WorkoutExercise[] = workoutPlan.exercises.map((ex: any) => ({
        exerciseId: ex.exerciseId,
        exerciseName: exercises.find(e => e.id === ex.exerciseId)?.name || 'Unknown Exercise',
        sets: ex.sets || 3,
        targetReps: ex.reps || 10,
        completedSets: [],
      }));
      
      setWorkoutExercises(exerciseList);
      
      // Add exercises to session
      for (let i = 0; i < exerciseList.length; i++) {
        const performance = await backendWorkoutService.addExerciseToSession(
          session.id,
          exerciseList[i].exerciseId,
          i + 1
        );
        exerciseList[i].exercisePerformanceId = performance.id;
      }
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start workout');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const recordSet = async () => {
    if (!weight || !reps) {
      Alert.alert('Error', 'Please enter weight and reps');
      return;
    }
    
    const currentExercise = workoutExercises[currentExerciseIndex];
    
    if (!currentExercise.exercisePerformanceId || !activeSession) {
      Alert.alert('Error', 'Session not properly initialized');
      return;
    }
    
    try {
      setSaving(true);
      
      const setData = {
        set_number: currentSetIndex + 1,
        target_reps: currentExercise.targetReps,
        actual_reps: parseInt(reps),
        weight: parseFloat(weight),
        rpe: rpe ? parseInt(rpe) : undefined,
        is_warmup: false,
        notes: notes || undefined,
      };
      
      const recordedSet = await backendWorkoutService.recordSet(
        activeSession.id,
        currentExercise.exercisePerformanceId,
        setData
      );
      
      // Update local state
      const updatedExercises = [...workoutExercises];
      updatedExercises[currentExerciseIndex].completedSets.push(recordedSet);
      setWorkoutExercises(updatedExercises);
      
      // Move to next set or exercise
      if (currentSetIndex < currentExercise.sets - 1) {
        setCurrentSetIndex(currentSetIndex + 1);
      } else if (currentExerciseIndex < workoutExercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
      } else {
        // Workout complete
        completeWorkout();
      }
      
      // Clear form
      setWeight('');
      setReps('');
      setRpe('');
      setNotes('');
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record set');
    } finally {
      setSaving(false);
    }
  };

  const completeWorkout = () => {
    Alert.alert(
      'Workout Complete!',
      'Great job! How would you rate this workout?',
      [
        { text: '1 - Too Easy', onPress: () => finishWorkout(1) },
        { text: '2 - Easy', onPress: () => finishWorkout(2) },
        { text: '3 - Moderate', onPress: () => finishWorkout(3) },
        { text: '4 - Hard', onPress: () => finishWorkout(4) },
        { text: '5 - Too Hard', onPress: () => finishWorkout(5) },
      ]
    );
  };

  const finishWorkout = async (rating: number) => {
    if (!activeSession) return;
    
    try {
      setLoading(true);
      
      await backendWorkoutService.completeWorkoutSession(
        activeSession.id,
        rating,
        'Workout completed successfully'
      );
      
      // Navigate to stats screen
      navigation.replace('Stats');
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete workout');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    const totalSets = workoutExercises.reduce((sum, ex) => sum + ex.sets, 0);
    const completedSets = workoutExercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Initializing workout...</Text>
      </View>
    );
  }

  const currentExercise = workoutExercises[currentExerciseIndex];

  return (
    <LinearGradient colors={['#1a1a2e', '#0f0f1e']} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.workoutTitle}>{workoutPlan?.name || 'Workout'}</Text>
            
            <TouchableOpacity onPress={() => {}}>
              <Icon name="timer-outline" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={[styles.progressFill, { width: `${getProgress()}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(getProgress())}% Complete</Text>
          </View>

          {/* Current Exercise */}
          {currentExercise && (
            <View style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{currentExercise.exerciseName}</Text>
              <Text style={styles.setInfo}>
                Set {currentSetIndex + 1} of {currentExercise.sets}
              </Text>
              
              {/* Previous Sets */}
              {currentExercise.completedSets.length > 0 && (
                <View style={styles.previousSets}>
                  <Text style={styles.previousSetsTitle}>Previous Sets:</Text>
                  {currentExercise.completedSets.map((set, index) => (
                    <Text key={set.id} style={styles.previousSetText}>
                      Set {index + 1}: {set.weight}kg × {set.actual_reps} reps
                      {set.rpe && ` @ RPE ${set.rpe}`}
                    </Text>
                  ))}
                </View>
              )}

              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <TextInput
                    style={styles.input}
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>RPE</Text>
                  <TextInput
                    style={styles.input}
                    value={rpe}
                    onChangeText={setRpe}
                    keyboardType="numeric"
                    placeholder="1-10"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>

              {/* Notes */}
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes (optional)"
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
              />

              {/* Record Button */}
              <TouchableOpacity
                style={styles.recordButton}
                onPress={recordSet}
                disabled={saving}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.recordButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.recordButtonText}>
                    {saving ? 'Saving...' : 'Record Set'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Exercise List */}
          <View style={styles.exerciseList}>
            <Text style={styles.exerciseListTitle}>Exercises</Text>
            {workoutExercises.map((exercise, index) => (
              <TouchableOpacity
                key={exercise.exerciseId}
                style={[
                  styles.exerciseListItem,
                  index === currentExerciseIndex && styles.exerciseListItemActive,
                ]}
                onPress={() => {
                  setCurrentExerciseIndex(index);
                  setCurrentSetIndex(0);
                }}
              >
                <View style={styles.exerciseListInfo}>
                  <Text style={[
                    styles.exerciseListName,
                    index === currentExerciseIndex && styles.exerciseListNameActive,
                  ]}>
                    {exercise.exerciseName}
                  </Text>
                  <Text style={styles.exerciseListSets}>
                    {exercise.completedSets.length}/{exercise.sets} sets
                  </Text>
                </View>
                {exercise.completedSets.length === exercise.sets && (
                  <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  setInfo: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 20,
  },
  previousSets: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  previousSetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  previousSetText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 20,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  recordButton: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  recordButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseList: {
    paddingHorizontal: 20,
  },
  exerciseListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  exerciseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  exerciseListItemActive: {
    backgroundColor: 'rgba(102,126,234,0.2)',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  exerciseListInfo: {
    flex: 1,
  },
  exerciseListName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  exerciseListNameActive: {
    fontWeight: '600',
  },
  exerciseListSets: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
});

export default EnhancedWorkoutTrackingScreen;