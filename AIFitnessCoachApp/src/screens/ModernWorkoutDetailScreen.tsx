import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ModernHeader, ModernCard } from '../components/modern/ModernComponents';
import * as Haptics from 'expo-haptics';
import { workoutScheduleService } from '../services/workoutScheduleService';
import moment from 'moment';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { workoutProgressService } from '../services/workoutProgressService';

const ModernWorkoutDetailScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { workout: initialWorkout, date } = route.params || {};
  const [workout, setWorkout] = useState(initialWorkout);
  const scrollY = useRef(new Animated.Value(0)).current;
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editSets, setEditSets] = useState('');
  const [editReps, setEditReps] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [restBetweenSets, setRestBetweenSets] = useState('60');
  const [restBetweenExercises, setRestBetweenExercises] = useState('120');
  const [showRestSettings, setShowRestSettings] = useState(false);
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false);
  
  // Reload workout data when screen focuses to get latest modifications
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      console.log('WorkoutDetail focused, date:', date);
      
      // Check if there's an active workout for this workout
      if (workout?.id && date) {
        const progress = await workoutProgressService.getProgress(workout.id, date);
        setHasActiveWorkout(!!progress);
      }
      
      if (date) {
        try {
          // Parse the date string properly to avoid timezone issues
          const workoutDate = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
          console.log('Parsing date:', date, 'to:', workoutDate);
          const updatedWorkout = await workoutScheduleService.getWorkoutForDate(workoutDate);
          console.log('Reloaded workout:', updatedWorkout);
          if (updatedWorkout) {
            setWorkout(updatedWorkout);
          }
        } catch (error) {
          console.error('Error reloading workout:', error);
        }
      }
    });

    return unsubscribe;
  }, [navigation, date]);
  
  // Add safety check for workout data and ensure exercises is an array
  if (!workout) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ModernHeader title="Workout Details" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl }}>
          <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
            Workout data not found
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.primary
            }}
          >
            <Text style={{ ...theme.typography.body, color: '#FFFFFF', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Ensure exercises is always an array
  if (!workout.exercises) {
    workout.exercises = [];
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return theme.colors.success;
      case 'intermediate':
        return theme.colors.warning;
      case 'advanced':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getWorkoutIcon = () => {
    switch (workout.type) {
      case 'cardio':
        return 'fitness';
      case 'yoga':
        return 'body';
      case 'hiit':
        return 'flash';
      case 'flexibility':
        return 'accessibility';
      case 'rest':
        return 'bed';
      default:
        return 'barbell';
    }
  };

  const totalSets = (workout.exercises || []).reduce((sum: number, exercise: any) => {
    // Parse sets in case it's a string
    const sets = typeof exercise.sets === 'string' ? parseInt(exercise.sets) : (exercise.sets || 0);
    return sum + (isNaN(sets) ? 0 : sets);
  }, 0);
  const totalExercises = (workout.exercises || []).length;
  const workoutName = workout.title || workout.name || 'Workout';

  const handleStartWorkout = async () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    let resumeFromIndex = 0;
    if (hasActiveWorkout && workout?.id && date) {
      const progress = await workoutProgressService.getProgress(workout.id, date);
      if (progress) {
        resumeFromIndex = progress.currentExerciseIndex;
      }
    }
    
    navigation.navigate('WorkoutTracking', { 
      workout, 
      date,
      resumeFromIndex 
    });
  };

  const handleExercisePress = (exercise: any) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Navigate to exercise detail screen
    navigation.navigate('ExerciseDetail', { 
      exercise,
      selectMode: false // Not in select mode when viewing from workout
    });
  };

  const handleDeleteExercise = async (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      'Delete Exercise',
      `Remove "${exerciseName}" from this workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove the exercise from the workout
              const updatedExercises = workout.exercises.filter((ex: any) => 
                (ex.id || workout.exercises.indexOf(ex).toString()) !== exerciseId
              );
              
              const updatedWorkout = {
                ...workout,
                exercises: updatedExercises,
                modifiedAt: new Date(),
                notes: workout.notes || 'Modified in workout details'
              };
              
              setWorkout(updatedWorkout);
              
              // Save to backend
              if (date) {
                updatedWorkout.date = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
                await workoutScheduleService.saveWorkout(updatedWorkout);
              }
              
              // Close the swipeable
              if (swipeableRefs.current[exerciseId]) {
                swipeableRefs.current[exerciseId]?.close();
              }
              
              if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert('Error', 'Failed to delete exercise');
            }
          }
        }
      ]
    );
  };

  const handleAddExercise = () => {
    navigation.navigate('ExerciseLibrary', {
      selectMode: true,
      onSelectExercise: async (exercise: any) => {
        try {
          const newExercise = {
            ...exercise,
            sets: 3,
            reps: '10-12',
            id: `ex_${Date.now()}`
          };
          
          const updatedWorkout = {
            ...workout,
            exercises: [...workout.exercises, newExercise],
            modifiedAt: new Date(),
            notes: workout.notes || 'Modified in workout details'
          };
          
          setWorkout(updatedWorkout);
          
          // Save to backend
          if (date) {
            updatedWorkout.date = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
            await workoutScheduleService.saveWorkout(updatedWorkout);
          }
          
          navigation.goBack();
          
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch (error) {
          console.error('Error adding exercise:', error);
          Alert.alert('Error', 'Failed to add exercise');
        }
      }
    });
  };

  const handleSwapExercise = (exerciseId: string, exerciseIndex: number) => {
    navigation.navigate('ExerciseLibrary', {
      selectMode: true,
      swapMode: true,
      onSelectExercise: async (newExercise: any) => {
        try {
          const updatedExercises = [...workout.exercises];
          updatedExercises[exerciseIndex] = {
            ...newExercise,
            sets: workout.exercises[exerciseIndex].sets || 3,
            reps: workout.exercises[exerciseIndex].reps || '10-12',
            id: exerciseId
          };
          
          const updatedWorkout = {
            ...workout,
            exercises: updatedExercises,
            modifiedAt: new Date(),
            notes: workout.notes || 'Modified in workout details'
          };
          
          setWorkout(updatedWorkout);
          
          // Save to backend
          if (date) {
            updatedWorkout.date = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
            await workoutScheduleService.saveWorkout(updatedWorkout);
          }
          
          // Close the swipeable
          if (swipeableRefs.current[exerciseId]) {
            swipeableRefs.current[exerciseId]?.close();
          }
          
          navigation.goBack();
          
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch (error) {
          console.error('Error swapping exercise:', error);
          Alert.alert('Error', 'Failed to swap exercise');
        }
      }
    });
  };

  const handleEditExercise = (exercise: any, index: number) => {
    setEditingExercise(exercise);
    setEditingIndex(index);
    setEditSets(exercise.sets?.toString() || '3');
    setEditReps(exercise.reps?.toString() || '10-12');
    // Only use the weight if it's not a percentage/RPE value
    const weightValue = exercise.weight || '';
    const isPercentageOrRPE = weightValue.includes('%') || weightValue.includes('RPE') || weightValue.includes('1RM');
    setEditWeight(isPercentageOrRPE ? '' : weightValue);
    setRestBetweenSets(workout.restBetweenSets?.toString() || '60');
    setRestBetweenExercises(workout.restBetweenExercises?.toString() || '120');
    setShowEditModal(true);
  };

  const handleSaveExerciseEdit = async () => {
    try {
      const updatedExercises = [...workout.exercises];
      updatedExercises[editingIndex] = {
        ...editingExercise,
        sets: parseInt(editSets) || 3,
        reps: editReps || '10-12',
        weight: editWeight,
      };
      
      const updatedWorkout = {
        ...workout,
        exercises: updatedExercises,
        restBetweenSets: parseInt(restBetweenSets) || 60,
        restBetweenExercises: parseInt(restBetweenExercises) || 120,
        modifiedAt: new Date(),
      };
      
      setWorkout(updatedWorkout);
      
      // Save to backend
      if (date) {
        updatedWorkout.date = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
        await workoutScheduleService.saveWorkout(updatedWorkout);
      }
      
      setShowEditModal(false);
      
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      Alert.alert('Error', 'Failed to update exercise');
    }
  };

  const handleRefreshWithWgerData = async () => {
    Alert.alert(
      'Refresh with Real Data',
      'Replace current exercises with real exercises from Wger database?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          onPress: async () => {
            try {
              // Determine muscle groups based on workout title
              let targetMuscles: string[] = [];
              const title = workout.title.toLowerCase();
              
              if (title.includes('chest')) targetMuscles.push('chest');
              if (title.includes('tricep')) targetMuscles.push('triceps');
              if (title.includes('back')) targetMuscles.push('back');
              if (title.includes('bicep')) targetMuscles.push('biceps');
              if (title.includes('leg')) targetMuscles.push('legs');
              if (title.includes('shoulder')) targetMuscles.push('shoulders');
              if (title.includes('core') || title.includes('abs')) targetMuscles.push('abs');
              
              // Default to full body if no specific muscles found
              if (targetMuscles.length === 0) {
                targetMuscles = ['chest', 'back', 'legs'];
              }

              // Generate new workout with Wger data
              const newWorkout = await workoutScheduleService.generateWorkoutWithWgerData(
                workout.type || 'strength',
                targetMuscles,
                workout.difficulty || 'intermediate'
              );

              // Update current workout with new exercises
              const updatedWorkout = {
                ...workout,
                exercises: newWorkout.exercises,
                duration: newWorkout.duration,
                calories: newWorkout.calories,
                modifiedAt: new Date(),
                notes: 'Refreshed with Wger exercise database'
              };

              setWorkout(updatedWorkout);

              // Save to backend
              if (date) {
                updatedWorkout.date = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
                await workoutScheduleService.saveWorkout(updatedWorkout);
              }

              if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }

              Alert.alert('Success', 'Workout refreshed with real exercise data!');
            } catch (error) {
              console.error('Error refreshing with Wger data:', error);
              Alert.alert('Error', 'Failed to refresh workout');
            }
          }
        }
      ]
    );
  };

  const renderRightActions = (exerciseId: string, exerciseName: string) => {
    return (
      <View style={styles.swipeActionContainer}>
        <TouchableOpacity 
          style={[styles.swipeAction, styles.swipeActionDelete]}
          onPress={() => handleDeleteExercise(exerciseId, exerciseName)}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLeftActions = (exerciseId: string, exerciseIndex: number) => {
    return (
      <View style={styles.swipeActionContainer}>
        <TouchableOpacity 
          style={[styles.swipeAction, styles.swipeActionSwap]}
          onPress={() => handleSwapExercise(exerciseId, exerciseIndex)}
        >
          <Ionicons name="swap-horizontal-outline" size={20} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Swap</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    headerCard: {
      margin: theme.spacing.md,
      padding: theme.spacing.lg,
    },
    headerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    workoutIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    workoutTitle: {
      flex: 1,
    },
    workoutName: {
      ...theme.typography.title2,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    workoutType: {
      ...theme.typography.footnote,
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '30',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      ...theme.typography.title2,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    statLabel: {
      ...theme.typography.caption2,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    difficultyBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: getDifficultyColor(workout.difficulty),
    },
    difficultyText: {
      ...theme.typography.caption1,
      color: '#FFFFFF',
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    modifiedBanner: {
      backgroundColor: theme.colors.info + '20',
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.info + '30',
    },
    modifiedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    modifiedTitle: {
      ...theme.typography.subheadline,
      color: theme.colors.info,
      marginLeft: theme.spacing.sm,
      fontWeight: '600',
    },
    modifiedText: {
      ...theme.typography.footnote,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    exerciseSection: {
      marginTop: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    addExerciseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    addExerciseText: {
      ...theme.typography.footnote,
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: theme.spacing.xs,
    },
    exerciseCard: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      overflow: 'hidden',
    },
    exerciseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    exerciseIndex: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
      overflow: 'hidden',
    },
    exerciseThumbnail: {
      width: '100%',
      height: '100%',
    },
    exerciseIndexText: {
      ...theme.typography.footnote,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    exerciseDetails: {
      ...theme.typography.caption1,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    chevron: {
      marginLeft: theme.spacing.sm,
    },
    startButton: {
      position: 'absolute',
      bottom: 30,
      right: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    swipeActionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    swipeAction: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginLeft: theme.spacing.xs,
      height: '90%',
      alignSelf: 'center',
    },
    swipeActionDelete: {
      backgroundColor: theme.colors.error,
    },
    swipeActionSwap: {
      backgroundColor: theme.colors.primary,
    },
    swipeActionText: {
      ...theme.typography.footnote,
      color: '#FFFFFF',
      fontWeight: '600',
      marginTop: theme.spacing.xs,
    },
    editButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.xs,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingTop: theme.spacing.md,
      paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.lg,
      maxHeight: '60%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    modalTitle: {
      ...theme.typography.title2,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    inputSection: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    inputLabel: {
      ...theme.typography.subheadline,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    modalButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    cancelButtonText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    saveButtonText: {
      ...theme.typography.body,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    restTimeSection: {
      position: 'relative',
    },
    restTimeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    restTimeLabel: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    restTimeValue: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '600',
      marginRight: theme.spacing.sm,
    },
  });

  const getModificationDetails = () => {
    if (!workout.modifiedAt) return null;
    
    const modifiedDate = moment(workout.modifiedAt).format('MMM D, YYYY [at] h:mm A');
    const originalExerciseCount = workout.originalExerciseCount || 6; // Default to 6 if not stored
    const currentExerciseCount = workout.exercises.length;
    
    return {
      date: modifiedDate,
      removed: Math.max(0, originalExerciseCount - currentExerciseCount),
      added: Math.max(0, currentExerciseCount - originalExerciseCount),
      notes: workout.notes || 'Modified by AI Coach'
    };
  };

  const modificationDetails = getModificationDetails();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ModernHeader 
          title="Workout Details" 
          rightAction={
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <TouchableOpacity onPress={handleRefreshWithWgerData}>
                <Ionicons name="refresh-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowRestSettings(true)}>
                <Ionicons name="timer-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          }
        />
        
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Header Card */}
          <ModernCard variant="elevated" style={styles.headerCard}>
            <View style={styles.headerInfo}>
              <View style={styles.workoutIcon}>
                <Ionicons name={getWorkoutIcon() as any} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.workoutTitle}>
                <Text style={styles.workoutName}>{workoutName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={styles.workoutType}>{workout.type || 'strength'}</Text>
                  <Text style={styles.workoutType}> • </Text>
                  <View style={[styles.difficultyBadge, { position: 'relative', marginTop: 0 }]}>
                    <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalExercises}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalSets}</Text>
                <Text style={styles.statLabel}>Total Sets</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{workout.duration || '45 min'}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            </View>
          </ModernCard>

          {/* Exercises Section */}
          <View style={styles.exerciseSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exercises</Text>
              <TouchableOpacity 
                style={styles.addExerciseButton}
                onPress={handleAddExercise}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.addExerciseText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>
            
            {workout.exercises.map((exercise: any, index: number) => {
              const exerciseId = exercise.id || index.toString();
              // Use index as key to ensure uniqueness even with duplicate exercises
              return (
                <Swipeable
                  key={`${exerciseId}_${index}`}
                  ref={(ref) => { swipeableRefs.current[exerciseId] = ref; }}
                  renderRightActions={() => renderRightActions(exerciseId, exercise.name)}
                  renderLeftActions={() => renderLeftActions(exerciseId, index)}
                  onSwipeableOpen={(direction) => {
                    if (direction === 'right') {
                      // Delete immediately on right swipe (swipe towards left)
                      handleDeleteExercise(exerciseId, exercise.name);
                    } else if (direction === 'left') {
                      // Swap immediately on left swipe (swipe towards right)
                      handleSwapExercise(exerciseId, index);
                    }
                  }}
                  overshootRight={false}
                  overshootLeft={false}
                  friction={2}
                >
                  <TouchableOpacity
                    onPress={() => handleExercisePress(exercise)}
                    activeOpacity={0.7}
                  >
                    <ModernCard variant="elevated" style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseIndex}>
                          {exercise.imageUrl ? (
                            <Image 
                              source={{ uri: exercise.imageUrl }} 
                              style={styles.exerciseThumbnail}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                          )}
                        </View>
                        <View style={styles.exerciseInfo}>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          <Text style={styles.exerciseDetails}>
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight && ` @ ${exercise.weight}`}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleEditExercise(exercise, index)}
                          style={styles.editButton}
                        >
                          <Ionicons 
                            name="create-outline" 
                            size={20} 
                            color={theme.colors.primary} 
                          />
                        </TouchableOpacity>
                        <Ionicons 
                          name="chevron-forward" 
                          size={20} 
                          color={theme.colors.textSecondary} 
                          style={styles.chevron}
                        />
                      </View>
                    </ModernCard>
                  </TouchableOpacity>
                </Swipeable>
              );
            })}
          </View>

          {/* AI Modified Banner - At Bottom */}
          {modificationDetails && (
            <View style={[styles.modifiedBanner, { marginTop: theme.spacing.lg }]}>
              <View style={styles.modifiedHeader}>
                <Ionicons name="sparkles" size={24} color={theme.colors.info} />
                <Text style={styles.modifiedTitle}>AI Modified Workout</Text>
              </View>
              <Text style={styles.modifiedText}>
                {modificationDetails.notes}
              </Text>
              <Text style={styles.modifiedText}>
                Modified on {modificationDetails.date}
              </Text>
              {modificationDetails.removed > 0 && (
                <Text style={styles.modifiedText}>
                  • {modificationDetails.removed} exercises removed for injury accommodation
                </Text>
              )}
              {modificationDetails.added > 0 && (
                <Text style={styles.modifiedText}>
                  • {modificationDetails.added} exercises added
                </Text>
              )}
            </View>
          )}
        </Animated.ScrollView>

        {/* Start/Resume Workout FAB */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name={hasActiveWorkout ? "play-forward" : "play"} size={28} color="#FFFFFF" />
            {hasActiveWorkout && (
              <Text style={{ color: '#FFFFFF', fontSize: 10, marginTop: -4 }}>Resume</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Edit Exercise Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1}
            onPress={() => setShowEditModal(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Exercise</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Exercise Name - Compact */}
              <View style={[styles.inputSection, { marginTop: theme.spacing.sm }]}>
                <ModernCard variant="elevated" style={{ padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="barbell-outline" size={20} color={theme.colors.primary} style={{ marginRight: theme.spacing.sm }} />
                  <Text style={styles.exerciseName}>{editingExercise?.name}</Text>
                </ModernCard>
              </View>

              {/* Sets and Reps on same line */}
              <View style={styles.inputSection}>
                <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Sets</Text>
                    <TextInput
                      style={styles.input}
                      value={editSets}
                      onChangeText={setEditSets}
                      keyboardType="numeric"
                      placeholder="3"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                      style={styles.input}
                      value={editReps}
                      onChangeText={setEditReps}
                      placeholder="10-12"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                </View>
              </View>

              {/* Weight and Rest Times on same line */}
              <View style={styles.inputSection}>
                <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.inputLabel}>Weight (kg/lbs)</Text>
                    <TextInput
                      style={styles.input}
                      value={editWeight}
                      onChangeText={setEditWeight}
                      placeholder="e.g. 135 lbs"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Rest (sets)</Text>
                    <TextInput
                      style={styles.input}
                      value={restBetweenSets}
                      onChangeText={setRestBetweenSets}
                      keyboardType="numeric"
                      placeholder="60"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Rest (ex)</Text>
                    <TextInput
                      style={styles.input}
                      value={restBetweenExercises}
                      onChangeText={setRestBetweenExercises}
                      keyboardType="numeric"
                      placeholder="120"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveExerciseEdit}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Rest Settings Modal */}
        <Modal
          visible={showRestSettings}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRestSettings(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1}
            onPress={() => setShowRestSettings(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Rest Timer Settings</Text>
                <TouchableOpacity onPress={() => setShowRestSettings(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Rest Times on same line */}
                <View style={styles.inputSection}>
                  <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Between Sets</Text>
                      <View style={styles.restTimeSection}>
                        <TextInput
                          style={styles.input}
                          value={restBetweenSets}
                          onChangeText={setRestBetweenSets}
                          keyboardType="numeric"
                          placeholder="60"
                          placeholderTextColor={theme.colors.textSecondary}
                        />
                        <Text style={[styles.inputLabel, { position: 'absolute', right: theme.spacing.md, top: '50%', transform: [{ translateY: -10 }], color: theme.colors.textSecondary }]}>sec</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Between Exercises</Text>
                      <View style={styles.restTimeSection}>
                        <TextInput
                          style={styles.input}
                          value={restBetweenExercises}
                          onChangeText={setRestBetweenExercises}
                          keyboardType="numeric"
                          placeholder="120"
                          placeholderTextColor={theme.colors.textSecondary}
                        />
                        <Text style={[styles.inputLabel, { position: 'absolute', right: theme.spacing.md, top: '50%', transform: [{ translateY: -10 }], color: theme.colors.textSecondary }]}>sec</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Info */}
                <View style={[styles.inputSection, { backgroundColor: theme.colors.info + '20', padding: theme.spacing.md, borderRadius: theme.borderRadius.md }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="information-circle" size={20} color={theme.colors.info} />
                    <Text style={[styles.inputLabel, { marginLeft: theme.spacing.sm, marginBottom: 0 }]}>Rest Timer Info</Text>
                  </View>
                  <Text style={[styles.restTimeLabel, { marginTop: theme.spacing.sm, color: theme.colors.textSecondary }]}>
                    These rest times will be used when you start the workout. The timer will automatically count down between sets and exercises.
                  </Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={() => {
                      setShowRestSettings(false);
                      // Save rest settings to workout
                      const updatedWorkout = {
                        ...workout,
                        restBetweenSets: parseInt(restBetweenSets) || 60,
                        restBetweenExercises: parseInt(restBetweenExercises) || 120,
                      };
                      setWorkout(updatedWorkout);
                    }}
                  >
                    <Text style={styles.saveButtonText}>Save Settings</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ModernWorkoutDetailScreen;