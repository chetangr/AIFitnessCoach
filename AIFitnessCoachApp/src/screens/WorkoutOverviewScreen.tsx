import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface TodaysWorkout {
  id: string;
  name: string;
  duration: string;
  exercises: Exercise[];
  estimatedCalories: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  equipment: string;
  primaryMuscles: string[];
}

const WorkoutOverviewScreen = ({ navigation }: any) => {
  const [todaysWorkout] = useState<TodaysWorkout>({
    id: 'workout_today',
    name: "Today's Push Day",
    duration: '45-60 min',
    estimatedCalories: 350,
    difficulty: 'Intermediate',
    exercises: [
      {
        id: '1',
        name: 'Bench Press',
        sets: 3,
        reps: '8-10',
        equipment: 'Barbell',
        primaryMuscles: ['Chest', 'Triceps']
      },
      {
        id: '2',
        name: 'Overhead Press',
        sets: 3,
        reps: '8-10',
        equipment: 'Barbell',
        primaryMuscles: ['Shoulders', 'Triceps']
      },
      {
        id: '3',
        name: 'Incline Dumbbell Press',
        sets: 3,
        reps: '10-12',
        equipment: 'Dumbbells',
        primaryMuscles: ['Upper Chest', 'Shoulders']
      },
      {
        id: '4',
        name: 'Tricep Dips',
        sets: 3,
        reps: '12-15',
        equipment: 'Bodyweight',
        primaryMuscles: ['Triceps', 'Chest']
      },
      {
        id: '5',
        name: 'Push-ups',
        sets: 2,
        reps: 'To failure',
        equipment: 'Bodyweight',
        primaryMuscles: ['Chest', 'Triceps']
      }
    ]
  });

  const startWorkout = () => {
    navigation.navigate('WorkoutTracking', { workout: todaysWorkout });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4ECDC4';
      case 'Intermediate': return '#FFD93D';
      case 'Advanced': return '#FF6B6B';
      default: return '#667eea';
    }
  };

  const ExerciseCard = ({ exercise }: { exercise: Exercise }) => (
    <BlurView intensity={30} tint="dark" style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseDetails}>
            {exercise.sets} sets × {exercise.reps} reps
          </Text>
          <View style={styles.muscleGroup}>
            <Icon name="body" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.muscleText}>
              {exercise.primaryMuscles.join(', ')}
            </Text>
          </View>
        </View>
        <View style={styles.equipmentBadge}>
          <Icon name="barbell" size={14} color="white" />
          <Text style={styles.equipmentText}>{exercise.equipment}</Text>
        </View>
      </View>
    </BlurView>
  );

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BlurView intensity={20} tint="dark" style={styles.backButtonBlur}>
            <Icon name="arrow-back" size={24} color="white" />
          </BlurView>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>Ready to crush it?</Text>
          <Text style={styles.headerTitle}>Today's Workout</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
          <Icon name="settings-outline" size={24} color="#f093fb" />
        </TouchableOpacity>
      </View>

      {/* Workout Overview Card */}
      <View style={styles.workoutOverview}>
        <BlurView intensity={20} tint="light" style={styles.overviewCard}>
          <View style={styles.workoutHeader}>
            <View style={styles.workoutTitle}>
              <Text style={styles.workoutName}>{todaysWorkout.name}</Text>
              <View style={styles.workoutMeta}>
                <View style={styles.metaItem}>
                  <Icon name="time" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>{todaysWorkout.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="flame" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>{todaysWorkout.estimatedCalories} cal</Text>
                </View>
              </View>
            </View>
            <View style={[
              styles.difficultyBadge, 
              { backgroundColor: getDifficultyColor(todaysWorkout.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>{todaysWorkout.difficulty}</Text>
            </View>
          </View>

          {/* Exercise Count Summary */}
          <View style={styles.workoutSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{todaysWorkout.exercises.length}</Text>
              <Text style={styles.summaryLabel}>Exercises</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {todaysWorkout.exercises.reduce((total, ex) => total + ex.sets, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Total Sets</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {[...new Set(todaysWorkout.exercises.flatMap(ex => ex.primaryMuscles))].length}
              </Text>
              <Text style={styles.summaryLabel}>Muscle Groups</Text>
            </View>
          </View>
        </BlurView>
      </View>

      {/* Exercise List */}
      <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Exercises ({todaysWorkout.exercises.length})</Text>
        {todaysWorkout.exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseWrapper}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseContent}>
              <ExerciseCard exercise={exercise} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Start Workout Button */}
      <View style={styles.startWorkoutContainer}>
        <TouchableOpacity onPress={startWorkout} style={styles.startWorkoutButton} activeOpacity={0.9}>
          <LinearGradient colors={['#f093fb', '#667eea', '#764ba2']} style={styles.startButtonGradient}>
            <Icon name="play" size={24} color="white" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('ExerciseLibrary')} 
          style={styles.customizeButton}
        >
          <BlurView intensity={25} tint="light" style={styles.customizeButtonContent}>
            <Icon name="create-outline" size={20} color="white" />
            <Text style={styles.customizeButtonText}>Customize</Text>
          </BlurView>
        </TouchableOpacity>
      </View>
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
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    padding: 8,
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(240, 147, 251, 0.8)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: '#f093fb',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  settingsButton: {
    padding: 8,
  },
  workoutOverview: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  overviewCard: {
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  workoutTitle: {
    flex: 1,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workoutSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  exerciseWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(240, 147, 251, 0.2)',
    backgroundColor: 'rgba(48, 43, 99, 0.5)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  muscleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  muscleText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  equipmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  equipmentText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  startWorkoutContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 12,
  },
  startWorkoutButton: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  startButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customizeButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  customizeButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  customizeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WorkoutOverviewScreen;