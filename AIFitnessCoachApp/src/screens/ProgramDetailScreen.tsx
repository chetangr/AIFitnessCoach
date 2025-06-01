import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { exerciseService } from '../services/exerciseService';
import { WorkoutProgram, Exercise } from '../data/exercisesDatabase';

const { width } = Dimensions.get('window');

interface ProgramDetailScreenProps {
  navigation: any;
  route: {
    params: {
      program: WorkoutProgram;
    };
  };
}

const ProgramDetailScreen: React.FC<ProgramDetailScreenProps> = ({ navigation, route }) => {
  const { program } = route.params;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    loadProgramExercises();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadProgramExercises = async () => {
    try {
      setLoading(true);
      const programDetails = await exerciseService.getProgramById(program.id);
      if (programDetails?.exerciseDetails) {
        setExercises(programDetails.exerciseDetails);
      }
    } catch (error) {
      console.error('Failed to load program exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#667eea';
    }
  };

  const toggleExerciseExpansion = (exerciseId: string) => {
    setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId);
  };

  const startWorkout = () => {
    navigation.navigate('ActiveWorkout', { 
      program,
      exercises: exercises.map(ex => ex.id) 
    });
  };

  const renderExercise = (exercise: Exercise, index: number) => {
    const isExpanded = expandedExercise === exercise.id;
    
    return (
      <Animated.View
        key={exercise.id}
        style={[
          styles.exerciseCard,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50],
                extrapolate: 'clamp',
              })
            }]
          }
        ]}
      >
        <BlurView intensity={25} tint="light" style={styles.exerciseContainer}>
          <TouchableOpacity
            onPress={() => toggleExerciseExpansion(exercise.id)}
            style={styles.exerciseHeader}
          >
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.exerciseMeta}>
                <View style={styles.exerciseTag}>
                  <Icon name="body" size={12} color="white" />
                  <Text style={styles.exerciseTagText}>
                    {exercise.primaryMuscles.join(', ')}
                  </Text>
                </View>
                <View style={styles.exerciseTag}>
                  <Icon name="barbell" size={12} color="white" />
                  <Text style={styles.exerciseTagText}>{exercise.equipment}</Text>
                </View>
              </View>
            </View>

            <View style={styles.exerciseRight}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
                <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
              </View>
              <Icon 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="white" 
                style={styles.expandIcon}
              />
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <Animated.View style={styles.exerciseDetails}>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              
              {exercise.instructions && exercise.instructions.length > 0 && (
                <View style={styles.instructionsSection}>
                  <Text style={styles.sectionTitle}>Instructions:</Text>
                  {exercise.instructions.map((instruction, idx) => (
                    <Text key={idx} style={styles.instructionText}>
                      {idx + 1}. {instruction}
                    </Text>
                  ))}
                </View>
              )}

              {exercise.tips && exercise.tips.length > 0 && (
                <View style={styles.tipsSection}>
                  <Text style={styles.sectionTitle}>Tips:</Text>
                  {exercise.tips.map((tip, idx) => (
                    <Text key={idx} style={styles.tipText}>
                      • {tip}
                    </Text>
                  ))}
                </View>
              )}

              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <View style={styles.musclesSection}>
                  <Text style={styles.sectionTitle}>Secondary Muscles:</Text>
                  <Text style={styles.musclesText}>
                    {exercise.secondaryMuscles.join(', ')}
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Program Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Program Overview */}
        <Animated.View
          style={[
            styles.programOverview,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <BlurView intensity={30} tint="light" style={styles.overviewContainer}>
            <Text style={styles.programName}>{program.name}</Text>
            <Text style={styles.programDescription}>{program.description}</Text>
            
            <View style={styles.programStats}>
              <View style={styles.statItem}>
                <Icon name="time" size={20} color="#4CAF50" />
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{program.duration}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="fitness" size={20} color="#2196F3" />
                <Text style={styles.statLabel}>Exercises</Text>
                <Text style={styles.statValue}>{program.exercises.length}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="flame" size={20} color="#FF6B6B" />
                <Text style={styles.statLabel}>Calories</Text>
                <Text style={styles.statValue}>{program.estimatedCalories}</Text>
              </View>
            </View>

            <View style={styles.programMeta}>
              <View style={[styles.levelBadge, { backgroundColor: getDifficultyColor(program.level) }]}>
                <Text style={styles.levelText}>{program.level}</Text>
              </View>
              
              <View style={styles.trainerInfo}>
                <Icon name="person" size={16} color="white" />
                <Text style={styles.trainerText}>{program.trainer}</Text>
              </View>
              
              <View style={styles.ratingInfo}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{program.rating}</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Exercise List */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionHeader}>Exercises ({exercises.length})</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Icon name="fitness" size={60} color="rgba(255,255,255,0.5)" />
              <Text style={styles.loadingText}>Loading exercises...</Text>
            </View>
          ) : (
            <View style={styles.exercisesList}>
              {exercises.map((exercise, index) => renderExercise(exercise, index))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Start Workout Button */}
      <View style={styles.startButtonContainer}>
        <BlurView intensity={90} tint="light" style={styles.startButtonWrapper}>
          <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.startGradient}>
              <Icon name="play" size={24} color="white" />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  programOverview: {
    marginBottom: 30,
  },
  overviewContainer: {
    borderRadius: 20,
    padding: 25,
    overflow: 'hidden',
  },
  programName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  programDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 25,
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  programMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trainerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exercisesSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    marginBottom: 12,
  },
  exerciseContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  exerciseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  exerciseTagText: {
    color: 'white',
    fontSize: 11,
  },
  exerciseRight: {
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  expandIcon: {
    marginTop: 4,
  },
  exerciseDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  exerciseDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  instructionsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  tipsSection: {
    marginBottom: 16,
  },
  tipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  musclesSection: {
    marginBottom: 8,
  },
  musclesText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 12,
  },
  startButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
  },
  startButtonWrapper: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProgramDetailScreen;