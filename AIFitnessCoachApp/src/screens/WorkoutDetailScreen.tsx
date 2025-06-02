import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string;
  rest?: number;
  weight?: string;
  duration?: string;
  equipment?: string;
}

interface WorkoutDetailScreenProps {
  route: {
    params: {
      workout: {
        id: string;
        name: string;
        duration: string;
        difficulty: string;
        exercises: Exercise[];
        calories?: number;
      };
    };
  };
  navigation: any;
}

const WorkoutDetailScreen: React.FC<WorkoutDetailScreenProps> = ({ route, navigation }) => {
  const { workout } = route.params;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FFA726';
      case 'advanced':
        return '#EF5350';
      default:
        return '#42A5F5';
    }
  };

  const totalSets = workout.exercises.reduce((sum, exercise) => sum + (exercise.sets || 0), 0);

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-horizontal" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Workout Info Card */}
        <BlurView intensity={25} tint="light" style={styles.infoCard}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="time-outline" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{workout.duration}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="fitness-outline" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{totalSets} sets</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="flame-outline" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{workout.calories || '300'} cal</Text>
            </View>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(workout.difficulty) }]}>
            <Text style={styles.difficultyText}>{workout.difficulty}</Text>
          </View>
        </BlurView>

        {/* Exercise List */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises ({workout.exercises.length})</Text>
          
          {workout.exercises.map((exercise, index) => (
            <BlurView 
              key={exercise.id || index} 
              intensity={20} 
              tint="light" 
              style={styles.exerciseCard}
            >
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  {exercise.equipment && (
                    <Text style={styles.equipmentText}>
                      <Icon name="barbell-outline" size={14} color="rgba(255,255,255,0.7)" />
                      {' '}{exercise.equipment}
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.exerciseDetails}>
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>Sets</Text>
                  <Text style={styles.detailValue}>{exercise.sets}</Text>
                </View>
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>Reps</Text>
                  <Text style={styles.detailValue}>{exercise.reps}</Text>
                </View>
                {exercise.weight && (
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>Weight</Text>
                    <Text style={styles.detailValue}>{exercise.weight}</Text>
                  </View>
                )}
                {exercise.rest && (
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>Rest</Text>
                    <Text style={styles.detailValue}>{exercise.rest}s</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.exerciseAction}>
                <Icon name="information-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.exerciseActionText}>View Form</Text>
              </TouchableOpacity>
            </BlurView>
          ))}
        </View>

        {/* Start Workout Button */}
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('ActiveWorkout', { workout })}
        >
          <LinearGradient
            colors={['#4CAF50', '#45B7D1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Icon name="play-circle" size={28} color="white" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  statText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  exercisesSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  exerciseCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseHeader: {
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
    fontWeight: 'bold',
    fontSize: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  equipmentText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  exerciseAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  exerciseActionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  startButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutDetailScreen;