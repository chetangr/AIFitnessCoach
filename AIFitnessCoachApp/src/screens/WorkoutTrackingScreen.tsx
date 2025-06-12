import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { workoutTrackingService } from '../services/workoutTrackingService';
import { workoutProgressService } from '../services/workoutProgressService';
import { 
  LiquidGlassView,
  LiquidButton,
  LiquidCard,
  showLiquidAlert
} from '../components/glass';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WorkoutTrackingScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
}

interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

interface TrackedExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: ExerciseSet[];
  targetSets?: number;
  targetReps?: number;
}

const WorkoutTrackingScreen: React.FC<WorkoutTrackingScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { workout: workoutTemplate, date, resumeFromIndex = 0 } = route.params || {};
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { colors } = theme;
  
  const [trackedExercises, setTrackedExercises] = useState<TrackedExercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(resumeFromIndex);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (workoutTemplate?.exercises) {
      const initialExercises = workoutTemplate.exercises.map((exercise: any) => ({
        id: `tracked-${exercise.id}`,
        exerciseId: exercise.id,
        name: exercise.name,
        targetSets: exercise.sets || 3,
        targetReps: exercise.reps || 12,
        sets: Array(exercise.sets || 3).fill(null).map((_, index) => ({
          id: `set-${exercise.id}-${index}`,
          weight: 0,
          reps: exercise.reps || 12,
          completed: false,
        })),
      }));
      setTrackedExercises(initialExercises);
    }
  }, [workoutTemplate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    // Calculate workout progress
    const totalSets = trackedExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completedSets = trackedExercises.reduce((acc, ex) => 
      acc + ex.sets.filter(set => set.completed).length, 0
    );
    const progress = totalSets > 0 ? completedSets / totalSets : 0;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [trackedExercises]);

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const updatedExercises = [...trackedExercises];
    const numValue = parseFloat(value) || 0;
    updatedExercises[exerciseIndex].sets[setIndex][field] = numValue;
    setTrackedExercises(updatedExercises);
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedExercises = [...trackedExercises];
    updatedExercises[exerciseIndex].sets[setIndex].completed = 
      !updatedExercises[exerciseIndex].sets[setIndex].completed;
    setTrackedExercises(updatedExercises);
  };

  const addSet = (exerciseIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedExercises = [...trackedExercises];
    const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
    updatedExercises[exerciseIndex].sets.push({
      id: `set-${Date.now()}`,
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 12,
      completed: false,
    });
    setTrackedExercises(updatedExercises);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedExercises = [...trackedExercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setTrackedExercises(updatedExercises);
  };

  const saveWorkout = async () => {
    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      const completedExercises = trackedExercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        sets: exercise.sets.filter(set => set.completed).map(set => ({
          id: set.id,
          weight: set.weight,
          reps: set.reps,
          setNumber: exercise.sets.indexOf(set) + 1,
        })),
      })).filter(ex => ex.sets.length > 0);

      const totalVolume = completedExercises.reduce((total, exercise) => 
        total + exercise.sets.reduce((vol, set) => vol + (set.weight * set.reps), 0), 0
      );

      const totalSets = completedExercises.reduce((total, exercise) => 
        total + exercise.sets.length, 0
      );

      const totalReps = completedExercises.reduce((total, exercise) => 
        total + exercise.sets.reduce((reps, set) => reps + set.reps, 0), 0
      );

      const workoutSession: any = {
        id: `workout-${Date.now()}`,
        date: new Date().toISOString(),
        workoutName: workoutTemplate?.name || 'Quick Workout',
        duration: elapsedTime,
        exercises: completedExercises,
        totalWeight: totalVolume,
        totalSets,
        totalReps,
        caloriesBurned: Math.round((elapsedTime / 60) * 8), // Rough estimate
        notes: '',
        mood: 5,
        energyLevel: 5,
      };

      await workoutTrackingService.saveWorkoutSession(workoutSession);
      
      showLiquidAlert(
        'Workout Complete! 💪',
        `Great job! You completed ${totalSets} sets with a total volume of ${totalVolume.toFixed(0)}kg.`
      );
      
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Error saving workout:', error);
      showLiquidAlert(
        'Error',
        'Failed to save workout. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <BlurView intensity={80} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: colors.text }]}>
              {workoutTemplate?.name || 'Workout'}
            </Text>
            <View style={styles.timerContainer}>
              <Icon name="time-outline" size={16} color={colors.primary.main} />
              <Text style={[styles.timer, { color: colors.primary.main }]}>
                {formatTime(elapsedTime)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="ellipsis-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: colors.primary.main,
                }
              ]}
            />
          </View>
        </View>
      </BlurView>

      {/* Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {trackedExercises.map((exercise, exerciseIndex) => (
          <LiquidCard key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={[styles.exerciseName, { color: colors.text }]}>
                {exercise.name}
              </Text>
              <Text style={[styles.exerciseTarget, { color: colors.textSecondary }]}>
                {exercise.targetSets} × {exercise.targetReps}
              </Text>
            </View>
            
            <View style={styles.setsContainer}>
              {exercise.sets.map((set, setIndex) => (
                <Animated.View key={set.id} style={styles.setRow}>
                  <Text style={[styles.setNumber, { color: colors.textSecondary }]}>
                    {setIndex + 1}
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.setInput, { 
                        color: colors.text,
                        backgroundColor: colors.surface + '20',
                        borderColor: set.completed ? colors.success : colors.border
                      }]}
                      value={set.weight.toString()}
                      onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'weight', value)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      kg
                    </Text>
                  </View>
                  
                  <Text style={[styles.separator, { color: colors.textSecondary }]}>×</Text>
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.setInput, { 
                        color: colors.text,
                        backgroundColor: colors.surface + '20',
                        borderColor: set.completed ? colors.success : colors.border
                      }]}
                      value={set.reps.toString()}
                      onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'reps', value)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      reps
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => toggleSetComplete(exerciseIndex, setIndex)}
                    style={[
                      styles.checkButton,
                      set.completed && { backgroundColor: colors.success + '20' }
                    ]}
                  >
                    <Icon 
                      name={set.completed ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={set.completed ? colors.success : colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  {exercise.sets.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removeSet(exerciseIndex, setIndex)}
                      style={styles.deleteButton}
                    >
                      <Icon name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </Animated.View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.addSetButton}
              onPress={() => addSet(exerciseIndex)}
            >
              <Icon name="add-circle-outline" size={20} color={colors.primary.main} />
              <Text style={[styles.addSetText, { color: colors.primary.main }]}>
                Add Set
              </Text>
            </TouchableOpacity>
          </LiquidCard>
        ))}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer */}
      <BlurView intensity={80} style={styles.footer}>
        <LiquidButton
          label="Complete Workout"
          onPress={saveWorkout}
          loading={isSaving}
          variant="primary"
          size="large"
          style={styles.completeButton}
        />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timer: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  exerciseCard: {
    marginBottom: 16,
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  exerciseTarget: {
    fontSize: 14,
    fontWeight: '500',
  },
  setsContainer: {
    gap: 12,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setNumber: {
    width: 24,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setInput: {
    width: 60,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 'auto',
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  completeButton: {
    width: '100%',
    height: 56,
  },
});

export default WorkoutTrackingScreen;