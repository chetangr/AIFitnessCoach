import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  Alert,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ModernHeader, ModernCard, ModernButton } from '../components/modern/ModernComponents';
import * as Haptics from 'expo-haptics';
import { workoutScheduleService } from '../services/workoutScheduleService';
import moment from 'moment';

const ModernExerciseDetailScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { exercise, selectMode, onSelectExercise } = route.params || {};
  const [showAddModal, setShowAddModal] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [customSets, setCustomSets] = useState('3');
  const [customReps, setCustomReps] = useState('10-12');
  const [customWeight, setCustomWeight] = useState('');
  const [videoStatus, setVideoStatus] = useState<any>({});
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const video = useRef<Video>(null);

  useEffect(() => {
    loadUpcomingWorkouts();
  }, []);

  const loadUpcomingWorkouts = async () => {
    try {
      // Get workouts for the next 7 days
      const upcomingWorkouts = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const workoutForDay = await workoutScheduleService.getWorkoutForDate(date);
        
        if (workoutForDay) {
          upcomingWorkouts.push({
            date,
            workouts: [workoutForDay], // Wrap in array since it returns a single workout
            dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : moment(date).format('dddd'),
          });
        }
      }
      
      setWorkouts(upcomingWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  if (!exercise) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ModernHeader title="Exercise Details" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary }}>Exercise not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToWorkout = () => {
    if (onSelectExercise) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onSelectExercise(exercise);
      navigation.goBack();
    } else {
      // Show modal to select workout
      setShowAddModal(true);
    }
  };

  const handleSelectWorkout = async (workoutDate: Date, workoutData: any) => {
    try {
      // Check if exercise already exists in the workout
      const existingWorkout = workoutData.workouts[0];
      const exerciseExists = existingWorkout.exercises?.some((ex: any) => 
        ex.name.toLowerCase() === exercise.name.toLowerCase()
      );

      if (exerciseExists) {
        Alert.alert(
          'Exercise Already Added',
          `${exercise.name} is already in this workout. Do you want to add it again?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Add Anyway', 
              onPress: () => {
                setSelectedWorkout({ date: workoutDate, data: workoutData });
                setShowAddModal(false);
                setShowCustomizeModal(true);
              }
            }
          ]
        );
      } else {
        setSelectedWorkout({ date: workoutDate, data: workoutData });
        setShowAddModal(false);
        setShowCustomizeModal(true);
      }
    } catch (error) {
      console.error('Error checking workout:', error);
      setSelectedWorkout({ date: workoutDate, data: workoutData });
      setShowAddModal(false);
      setShowCustomizeModal(true);
    }
  };

  const handleAddToSelectedWorkout = async () => {
    try {
      if (!selectedWorkout) return;

      // Convert exercise to the format expected by workoutScheduleService
      const exerciseToAdd = {
        id: `${exercise.id || exercise.name}_${Date.now()}`, // Ensure unique ID
        name: exercise.name,
        sets: parseInt(customSets) || 3,
        reps: customReps || '10-12',
        weight: customWeight || '',
        equipment: exercise.equipment || [],
        muscleGroups: exercise.muscles || [],
        category: exercise.category || 'strength',
        difficulty: exercise.difficulty || 'intermediate',
        instructions: exercise.instructions ? [exercise.instructions] : [],
        imageUrl: exercise.imageUrl,
      };

      await workoutScheduleService.addExerciseToWorkout(selectedWorkout.date, exerciseToAdd);
      
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setShowCustomizeModal(false);
      setSelectedWorkout(null);
      
      Alert.alert(
        'Success',
        `${exercise.name} added to ${moment(selectedWorkout.date).format('dddd')}'s workout!`,
        [
          { 
            text: 'View Workout', 
            onPress: () => {
              navigation.navigate('WorkoutDetail', { 
                date: selectedWorkout.date.toISOString()
              });
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error adding exercise:', error);
      Alert.alert('Error', 'Failed to add exercise to workout');
    }
  };

  const handleCreateNewWorkout = () => {
    setShowAddModal(false);
    // Navigate to create workout screen with this exercise pre-selected
    navigation.navigate('WorkoutOverview', {
      preSelectedExercise: exercise
    });
  };

  const musclesList = exercise.muscles || [];
  const equipmentList = exercise.equipment || [];
  const difficultyLevel = exercise.difficulty || 'intermediate';

  const getDifficultyColor = () => {
    switch (difficultyLevel.toLowerCase()) {
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: selectMode ? 100 : 20,
    },
    imageContainer: {
      height: 300,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain', // Changed from 'cover' to show full image
    },
    video: {
      width: '100%',
      height: '100%',
      backgroundColor: '#000', // Add black background for videos
    },
    imagePlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoDuration: {
      position: 'absolute',
      bottom: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    videoDurationText: {
      ...theme.typography.caption2,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    playButtonOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    floatingAddButton: {
      position: 'absolute',
      bottom: 20,
      right: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    exerciseHeader: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    },
    exerciseName: {
      ...theme.typography.title1,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    exerciseCategory: {
      ...theme.typography.subheadline,
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
    },
    infoCards: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    infoCard: {
      flex: 1,
      padding: theme.spacing.md,
      alignItems: 'center',
    },
    infoIcon: {
      marginBottom: theme.spacing.sm,
    },
    infoTitle: {
      ...theme.typography.caption1,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    infoValue: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    section: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    sectionTitle: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing.md,
    },
    instructionCard: {
      padding: theme.spacing.md,
    },
    instructionStep: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 24,
      marginBottom: theme.spacing.sm,
    },
    descriptionText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    chip: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    chipText: {
      ...theme.typography.footnote,
      color: theme.colors.primary,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    fixedAddButton: {
      position: 'absolute',
      bottom: 30,
      left: theme.spacing.md,
      right: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
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
    fixedAddButtonText: {
      ...theme.typography.body,
      color: '#FFFFFF',
      fontWeight: '700',
      marginLeft: theme.spacing.sm,
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
      paddingTop: theme.spacing.lg,
      paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.lg,
      maxHeight: '80%',
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
    workoutOption: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    workoutOptionDate: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    workoutOptionDetails: {
      ...theme.typography.subheadline,
      color: theme.colors.textSecondary,
    },
    createNewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    createNewText: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl * 2,
      paddingHorizontal: theme.spacing.lg,
    },
    emptyStateText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    customizeSection: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    customizeLabel: {
      ...theme.typography.subheadline,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
    },
    customizeInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    customizeButtonRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    customizeButton: {
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
    confirmButton: {
      backgroundColor: theme.colors.primary,
    },
    cancelButtonText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    confirmButtonText: {
      ...theme.typography.body,
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader 
        title="Exercise Details"
        leftAction={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
        rightAction={
          selectMode && (
            <TouchableOpacity onPress={handleAddToWorkout}>
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )
        }
      />

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise Image/Video */}
        <View style={styles.imageContainer}>
          {exercise.videoUrl ? (
            <>
              <Video
                ref={video}
                style={styles.video}
                source={{ uri: exercise.videoUrl }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay={isVideoPlaying}
                onPlaybackStatusUpdate={(status: any) => {
                  setVideoStatus(status);
                  if (status.isLoaded) {
                    setIsVideoPlaying(status.isPlaying);
                  }
                }}
              />
              {!isVideoPlaying && (
                <TouchableOpacity 
                  style={styles.playButtonOverlay}
                  onPress={() => {
                    video.current?.playAsync();
                    setIsVideoPlaying(true);
                  }}
                >
                  <Ionicons name="play-circle" size={80} color="rgba(255, 255, 255, 0.9)" />
                </TouchableOpacity>
              )}
            </>
          ) : exercise.imageUrl ? (
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => {
                // Could implement image viewer with zoom here
                Alert.alert('Tip', 'Pinch to zoom coming soon!');
              }}
            >
              <Image source={{ uri: exercise.imageUrl }} style={styles.image} />
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={100} color={theme.colors.primary + '40'} />
            </View>
          )}
          {exercise.videoUrl && videoStatus.isLoaded && (
            <View style={styles.videoDuration}>
              <Ionicons name="time-outline" size={16} color="#FFFFFF" />
              <Text style={styles.videoDurationText}>
                {videoStatus.positionMillis ? 
                  `${Math.floor(videoStatus.positionMillis / 1000)}s / ${exercise.videoDuration || '0s'}` :
                  exercise.videoDuration || '0:00'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Exercise Header */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseCategory}>{exercise.category || 'Arms'}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <ModernCard variant="outlined" style={styles.infoCard}>
            <Ionicons name="body" size={24} color={theme.colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Muscles</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {musclesList.length > 0 ? musclesList[0] : 'Multiple'}
            </Text>
          </ModernCard>

          <ModernCard variant="outlined" style={styles.infoCard}>
            <Ionicons name="barbell" size={24} color={theme.colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Equipment</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {equipmentList.length > 0 ? equipmentList[0] : 'None'}
            </Text>
          </ModernCard>

          <ModernCard variant="outlined" style={styles.infoCard}>
            <Ionicons name="speedometer" size={24} color={getDifficultyColor()} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Level</Text>
            <Text style={[styles.infoValue, { color: getDifficultyColor() }]}>
              {difficultyLevel}
            </Text>
          </ModernCard>
        </View>

        {/* How to Perform Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Perform</Text>
          <ModernCard variant="elevated" style={styles.instructionCard}>
            {exercise.instructions ? (
              <Text style={styles.instructionStep}>{exercise.instructions}</Text>
            ) : (
              <>
                <Text style={styles.instructionStep}>1. Start in the proper position with correct form</Text>
                <Text style={styles.instructionStep}>2. Engage your core throughout the movement</Text>
                <Text style={styles.instructionStep}>3. Perform the movement in a controlled manner</Text>
                <Text style={styles.instructionStep}>4. Return to starting position</Text>
              </>
            )}
          </ModernCard>
        </View>

        {/* Description Section */}
        {exercise.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <ModernCard variant="elevated" style={styles.instructionCard}>
              <Text style={styles.descriptionText}>{exercise.description}</Text>
            </ModernCard>
          </View>
        )}

        {/* Muscle Groups */}
        {musclesList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Muscles</Text>
            <View style={styles.chipContainer}>
              {musclesList.map((muscle: string, index: number) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{muscle}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Equipment */}
        {equipmentList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment Needed</Text>
            <View style={styles.chipContainer}>
              {equipmentList.map((item: string, index: number) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Add Button for Select Mode */}
      {selectMode && (
        <TouchableOpacity style={styles.fixedAddButton} onPress={handleAddToWorkout}>
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.fixedAddButtonText}>Add to Workout</Text>
        </TouchableOpacity>
      )}

      {/* Floating Add Button - Always Visible */}
      {!selectMode && (
        <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddToWorkout}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Add to Workout Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Workout</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {workouts.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {workouts.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.workoutOption}
                    onPress={() => handleSelectWorkout(day.date, day)}
                  >
                    <Text style={styles.workoutOptionDate}>{day.dayLabel}</Text>
                    <Text style={styles.workoutOptionDetails}>
                      {day.workouts[0].title} • {day.workouts[0].exercises?.length || 0} exercises
                    </Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity style={styles.createNewButton} onPress={handleCreateNewWorkout}>
                  <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
                  <Text style={styles.createNewText}>Create New Workout</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary + '40'} />
                <Text style={styles.emptyStateText}>
                  No upcoming workouts found.{'\n'}Create a new workout to get started!
                </Text>
                <ModernButton
                  title="Create New Workout"
                  onPress={handleCreateNewWorkout}
                  style={{ marginTop: theme.spacing.lg, paddingHorizontal: theme.spacing.xl }}
                />
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Customize Exercise Modal */}
      <Modal
        visible={showCustomizeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomizeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowCustomizeModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customize Exercise</Text>
              <TouchableOpacity onPress={() => setShowCustomizeModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Exercise Name */}
              <View style={[styles.customizeSection, { marginTop: theme.spacing.md }]}>
                <Text style={styles.customizeLabel}>Exercise</Text>
                <ModernCard variant="elevated" style={{ padding: theme.spacing.md }}>
                  <Text style={styles.exerciseName}>{exercise?.name}</Text>
                </ModernCard>
              </View>

              {/* Sets */}
              <View style={styles.customizeSection}>
                <Text style={styles.customizeLabel}>Number of Sets</Text>
                <TextInput
                  style={styles.customizeInput}
                  value={customSets}
                  onChangeText={setCustomSets}
                  keyboardType="numeric"
                  placeholder="3"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              {/* Reps */}
              <View style={styles.customizeSection}>
                <Text style={styles.customizeLabel}>Reps per Set</Text>
                <TextInput
                  style={styles.customizeInput}
                  value={customReps}
                  onChangeText={setCustomReps}
                  placeholder="10-12"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              {/* Weight */}
              <View style={styles.customizeSection}>
                <Text style={styles.customizeLabel}>Weight (optional)</Text>
                <TextInput
                  style={styles.customizeInput}
                  value={customWeight}
                  onChangeText={setCustomWeight}
                  placeholder="e.g., 135 lbs"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              {/* Buttons */}
              <View style={styles.customizeButtonRow}>
                <TouchableOpacity 
                  style={[styles.customizeButton, styles.cancelButton]}
                  onPress={() => {
                    setShowCustomizeModal(false);
                    setCustomSets('3');
                    setCustomReps('10-12');
                    setCustomWeight('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.customizeButton, styles.confirmButton]}
                  onPress={handleAddToSelectedWorkout}
                >
                  <Text style={styles.confirmButtonText}>Add to Workout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default ModernExerciseDetailScreen;