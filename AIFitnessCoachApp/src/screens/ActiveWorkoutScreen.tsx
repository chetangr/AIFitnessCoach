import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from  '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { LiquidGlassView, LiquidButton, LiquidCard, LiquidInput } from '../components/glass';
import { workoutTrackingService } from '../services/workoutTrackingService';
import { workoutProgressService } from '../services/workoutProgressService';
import { useThemeStore } from '../store/themeStore';
import moment from 'moment';

const { width: screenWidth } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  duration?: string;
  restTime: number;
  equipment?: string;
  muscle?: string;
  instructions?: string[];
}

interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export default function LiquidActiveWorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useThemeStore();
  const { colors } = theme;
  const { workout, date, resumeFromIndex = 0 } = route.params as { 
    workout: { id: string; name: string; exercises: Exercise[] }; 
    date?: string;
    resumeFromIndex?: number;
  };
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(resumeFromIndex);
  const [sets, setSets] = useState<Set[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [workoutStartTime] = useState(new Date());
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingSet, setEditingSet] = useState<Set | null>(null);
  const [tempReps, setTempReps] = useState('');
  const [tempWeight, setTempWeight] = useState('');
  
  const timerAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load previous progress if resuming
    const loadProgress = async () => {
      if (resumeFromIndex > 0 && workout.id && date) {
        const progress = await workoutProgressService.getProgress(workout.id, date);
        if (progress && progress.exerciseSets[currentExercise.id]) {
          // Load saved sets for current exercise
          const savedSets = progress.exerciseSets[currentExercise.id].sets;
          setSets(savedSets.map((set, index) => ({
            id: `set-${index}`,
            ...set
          })));
          return;
        }
      }
      // Initialize sets for current exercise
      if (workout.exercises.length > 0) {
        initializeSets(workout.exercises[currentExerciseIndex]);
      }
    };
    
    loadProgress();
    
    // Start shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isResting && restTimeLeft > 0) {
      // Start pulse animation for rest timer
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      interval = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, restTimeLeft]);

  const initializeSets = (exercise: Exercise) => {
    const newSets: Set[] = [];
    for (let i = 0; i < exercise.sets; i++) {
      newSets.push({
        id: `set-${i}`,
        reps: parseInt(exercise.reps) || 0,
        weight: parseFloat(exercise.weight || '0') || 0,
        completed: false,
      });
    }
    setSets(newSets);
  };

  const currentExercise = workout.exercises[currentExerciseIndex];
  const completedSets = sets.filter(s => s.completed).length;
  const progress = (currentExerciseIndex / workout.exercises.length) * 100;

  // Save progress after each exercise
  const saveProgress = async () => {
    if (!workout.id || !date) return;
    
    const progressData = {
      workoutId: workout.id,
      workoutDate: date,
      currentExerciseIndex,
      completedExercises: workout.exercises.slice(0, currentExerciseIndex).map(ex => ex.id),
      exerciseSets: {
        [currentExercise.id]: {
          sets: sets.map(set => ({
            weight: set.weight,
            reps: set.reps,
            completed: set.completed
          }))
        }
      },
      startTime: workoutStartTime.toISOString(),
      lastUpdateTime: new Date().toISOString(),
      totalRestTime: 0
    };
    
    await workoutProgressService.saveProgress(progressData);
  };

  const completeSet = (setId: string) => {
    setSets(prev => prev.map(s => 
      s.id === setId ? { ...s, completed: true } : s
    ));
    
    const updatedSets = sets.map(s => 
      s.id === setId ? { ...s, completed: true } : s
    );
    
    if (updatedSets.every(s => s.completed)) {
      // All sets completed, move to next exercise
      if (currentExerciseIndex < workout.exercises.length - 1) {
        setIsResting(true);
        setRestTimeLeft(currentExercise.restTime || 60);
        setTimeout(async () => {
          await saveProgress(); // Save progress before moving to next exercise
          setCurrentExerciseIndex(currentExerciseIndex + 1);
          initializeSets(workout.exercises[currentExerciseIndex + 1]);
        }, (currentExercise.restTime || 60) * 1000);
      } else {
        // Workout completed
        completeWorkout();
      }
    } else {
      // Start rest timer
      setIsResting(true);
      setRestTimeLeft(currentExercise.restTime || 60);
    }
  };

  const completeWorkout = () => {
    Alert.alert(
      'Workout Complete! 🎉',
      `Great job! You've completed ${workout.name}.`,
      [
        {
          text: 'Save & Exit',
          onPress: async () => {
            // Save workout data
            workoutTrackingService.finishWorkout({
              workoutId: workout.id,
              duration: Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000),
              exercises: workout.exercises.map((ex) => ({
                ...ex,
                sets: sets,
              })),
            });
            // Clear the progress since workout is completed
            await workoutProgressService.clearProgress();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '20', colors.secondary + '20', colors.background]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <LiquidGlassView intensity={85} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{workout.name}</Text>
        <TouchableOpacity onPress={() => setShowExerciseModal(true)}>
          <Ionicons name="list" size={24} color={colors.text} />
        </TouchableOpacity>
      </LiquidGlassView>

      {/* Progress Bar */}
      <LiquidGlassView intensity={70} style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: colors.primary.main,
                opacity: shimmerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {currentExerciseIndex + 1} of {workout.exercises.length} exercises
        </Text>
      </LiquidGlassView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Exercise Card */}
        <LiquidCard style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Text style={[styles.exerciseName, { color: colors.text }]}>
              {currentExercise.name}
            </Text>
            {currentExercise.equipment && (
              <LiquidGlassView intensity={70} style={styles.equipmentBadge}>
                <Text style={[styles.equipmentText, { color: colors.primary.main }]}>
                  {currentExercise.equipment}
                </Text>
              </LiquidGlassView>
            )}
          </View>
          
          {currentExercise.muscle && (
            <Text style={[styles.muscleText, { color: colors.text + '80' }]}>
              Target: {currentExercise.muscle}
            </Text>
          )}
          
          <View style={styles.setsInfo}>
            <Text style={[styles.setsText, { color: colors.text }]}>
              {completedSets} / {currentExercise.sets} sets completed
            </Text>
          </View>
        </LiquidCard>

        {/* Rest Timer */}
        {isResting && (
          <LiquidCard style={styles.restCard}>
            <Animated.View
              style={[
                styles.restContent,
                {
                  transform: [{ scale: pulseAnimation }],
                },
              ]}
            >
              <Text style={[styles.restTitle, { color: colors.text }]}>Rest Time</Text>
              <Text style={[styles.restTimer, { color: colors.primary.main }]}>
                {formatTime(restTimeLeft)}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsResting(false);
                  setRestTimeLeft(0);
                }}
              >
                <Text style={[styles.skipText, { color: colors.secondary }]}>Skip Rest</Text>
              </TouchableOpacity>
            </Animated.View>
          </LiquidCard>
        )}

        {/* Sets */}
        <View style={styles.setsContainer}>
          {sets.map((set, index) => (
            <LiquidCard
              key={set.id}
              style={[
                styles.setCard,
                set.completed && styles.completedSetCard,
              ] as any}
            >
              <View style={styles.setHeader}>
                <Text style={[styles.setNumber, { color: colors.text }]}>Set {index + 1}</Text>
                {set.completed && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                )}
              </View>
              
              <View style={styles.setDetails}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingSet(set);
                    setTempWeight(set.weight.toString());
                    setTempReps(set.reps.toString());
                  }}
                  style={styles.setInfo}
                >
                  <Text style={[styles.setInfoText, { color: colors.text }]}>
                    {set.weight} kg × {set.reps} reps
                  </Text>
                  <Ionicons name="pencil" size={16} color={colors.text + '60'} />
                </TouchableOpacity>
                
                {!set.completed && (
                  <LiquidButton
                    label="Complete"
                    onPress={() => completeSet(set.id)}
                    style={styles.completeButton}
                  />
                )}
              </View>
            </LiquidCard>
          ))}
        </View>

        {/* Exercise Instructions */}
        {currentExercise.instructions && (
          <LiquidCard style={styles.instructionsCard}>
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>Instructions</Text>
            {currentExercise.instructions.map((instruction, index) => (
              <Text key={index} style={[styles.instructionText, { color: colors.text + '80' }]}>
                {index + 1}. {instruction}
              </Text>
            ))}
          </LiquidCard>
        )}
      </ScrollView>

      {/* Edit Set Modal */}
      <Modal
        visible={editingSet !== null}
        transparent
        animationType="slide"
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditingSet(null)}>
          <LiquidCard style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Set</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Weight (kg)</Text>
              <LiquidGlassView intensity={70} style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={tempWeight}
                  onChangeText={setTempWeight}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.text + '40'}
                />
              </LiquidGlassView>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Reps</Text>
              <LiquidGlassView intensity={70} style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={tempReps}
                  onChangeText={setTempReps}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.text + '40'}
                />
              </LiquidGlassView>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setEditingSet(null)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text + '60' }]}>Cancel</Text>
              </TouchableOpacity>
              
              <LiquidButton
                label="Save"
                onPress={() => {
                  if (editingSet) {
                    setSets(prev => prev.map(s => 
                      s.id === editingSet.id
                        ? { ...s, weight: parseFloat(tempWeight) || 0, reps: parseInt(tempReps) || 0 }
                        : s
                    ));
                  }
                  setEditingSet(null);
                }}
                style={styles.saveButton}
              />
            </View>
          </LiquidCard>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    padding: 20,
    marginBottom: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  equipmentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  equipmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  muscleText: {
    fontSize: 16,
    marginBottom: 16,
  },
  setsInfo: {
    marginTop: 8,
  },
  setsText: {
    fontSize: 16,
    fontWeight: '500',
  },
  restCard: {
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  restContent: {
    alignItems: 'center',
  },
  restTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  setsContainer: {
    marginBottom: 20,
  },
  setCard: {
    padding: 16,
    marginBottom: 12,
  },
  completedSetCard: {
    opacity: 0.7,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  setDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  setInfoText: {
    fontSize: 16,
    marginRight: 8,
  },
  completeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  instructionsCard: {
    padding: 20,
    marginBottom: 40,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    marginBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    padding: 16,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 32,
  },
});