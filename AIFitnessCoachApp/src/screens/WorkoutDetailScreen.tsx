import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import {
  LiquidGlassView,
  LiquidButton,
  LiquidCard,
} from '../components/glass';
import * as Haptics from 'expo-haptics';

// const { width } = Dimensions.get('window');

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
        description?: string;
      };
    };
  };
  navigation: any;
}

const LiquidWorkoutDetailScreen: React.FC<WorkoutDetailScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { workout } = route.params || {};
  const scrollY = useRef(new Animated.Value(0)).current;
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  
  // Add safety check for workout data
  if (!workout || !workout.exercises) {
    return (
      <View style={[styles.container, { paddingTop: 100 }]}>
        <Text style={styles.errorText}>Workout data not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return ['#4CAF50', '#45a049'];
      case 'intermediate':
        return ['#FFA726', '#FB8C00'];
      case 'advanced':
        return ['#EF5350', '#E53935'];
      default:
        return ['#42A5F5', '#2196F3'];
    }
  };

  const totalSets = (workout.exercises || []).reduce((sum, exercise) => sum + (exercise.sets || 0), 0);
  const totalExercises = (workout.exercises || []).length;

  const handleStartWorkout = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    navigation.navigate('ActiveWorkout', { workout });
  };

  const handleExercisePress = (exerciseId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId);
  };

  const renderExercise = (exercise: Exercise, index: number) => {
    const isExpanded = expandedExercise === exercise.id;

    return (
      <Animated.View
        key={exercise.id}
        style={{
          opacity: scrollY.interpolate({
            inputRange: [0, 50 * index, 50 * index + 100],
            outputRange: [0.3, 0.3, 1],
            extrapolate: 'clamp',
          }),
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 50 * index, 50 * index + 100],
              outputRange: [30, 30, 0],
              extrapolate: 'clamp',
            }),
          }],
        }}
      >
        <TouchableOpacity
          onPress={() => handleExercisePress(exercise.id)}
          activeOpacity={0.8}
        >
          <LiquidCard style={styles.exerciseCard} >
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNumber}>
                <LiquidGlassView intensity={40} >
                  <Text style={styles.exerciseIndex}>{index + 1}</Text>
                </LiquidGlassView>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseMeta}>
                  <Text style={styles.exerciseMetaText}>
                    {exercise.sets} sets × {exercise.reps} reps
                  </Text>
                  {exercise.weight && (
                    <>
                      <Text style={styles.metaSeparator}>•</Text>
                      <Text style={styles.exerciseMetaText}>{exercise.weight}</Text>
                    </>
                  )}
                  {exercise.rest && (
                    <>
                      <Text style={styles.metaSeparator}>•</Text>
                      <Text style={styles.exerciseMetaText}>{exercise.rest}s rest</Text>
                    </>
                  )}
                </View>
              </View>
              <Icon 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="rgba(255,255,255,0.5)" 
              />
            </View>
            
            {isExpanded && (
              <Animated.View style={styles.exerciseDetails}>
                <View style={styles.detailRow}>
                  <Icon name="barbell-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>
                    Equipment: {exercise.equipment || 'None required'}
                  </Text>
                </View>
                {exercise.duration && (
                  <View style={styles.detailRow}>
                    <Icon name="time-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.detailText}>Duration: {exercise.duration}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.exerciseAction}>
                  <LiquidGlassView intensity={60} >
                    <View style={styles.actionContent}>
                      <Icon name="play-circle-outline" size={20} color="white" />
                      <Text style={styles.actionText}>Demo Video</Text>
                    </View>
                  </LiquidGlassView>
                </TouchableOpacity>
              </Animated.View>
            )}
          </LiquidCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']} 
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.animatedHeader,
          { opacity: headerOpacity }
        ]}
      >
        <LiquidGlassView intensity={90} >
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{workout.name}</Text>
            <TouchableOpacity>
              <Icon name="heart-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </LiquidGlassView>
      </Animated.View>
      
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <LiquidGlassView intensity={60} >
              <View style={styles.backButtonContent}>
                <Icon name="arrow-back" size={28} color="white" />
              </View>
            </LiquidGlassView>
          </TouchableOpacity>
        </View>

        {/* Workout Info Card */}
        <LiquidCard style={styles.infoCard}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          {workout.description && (
            <Text style={styles.workoutDescription}>{workout.description}</Text>
          )}
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="time-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{workout.duration}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="fitness-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{totalSets}</Text>
              <Text style={styles.statLabel}>Total Sets</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icon name="flame-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{workout.calories || '300'}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
          
          <View style={styles.difficultyWrapper}>
            <LinearGradient
              colors={getDifficultyColor(workout.difficulty) as [string, string, ...string[]]}
              style={styles.difficultyBadge}
            >
              <Text style={styles.difficultyText}>{workout.difficulty}</Text>
            </LinearGradient>
          </View>
        </LiquidCard>

        {/* Exercise List */}
        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises ({totalExercises})</Text>
            <TouchableOpacity>
              <LiquidGlassView intensity={50} >
                <View style={styles.editButton}>
                  <Icon name="create-outline" size={20} color="white" />
                  <Text style={styles.editText}>Edit</Text>
                </View>
              </LiquidGlassView>
            </TouchableOpacity>
          </View>
          
          {workout.exercises.map((exercise, index) => renderExercise(exercise, index))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <LiquidButton
            onPress={handleStartWorkout}
            label="Start Workout"
            icon="play"
            variant="primary"
            size="large"
            style={styles.startButton}
          />
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton}>
              <LiquidGlassView intensity={60} >
                <View style={styles.secondaryButtonContent}>
                  <Icon name="share-outline" size={24} color="white" />
                  <Text style={styles.secondaryButtonText}>Share</Text>
                </View>
              </LiquidGlassView>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <LiquidGlassView intensity={60} >
                <View style={styles.secondaryButtonContent}>
                  <Icon name="download-outline" size={24} color="white" />
                  <Text style={styles.secondaryButtonText}>Save</Text>
                </View>
              </LiquidGlassView>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 48,
    height: 48,
  },
  backButtonContent: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 24,
  },
  workoutName: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 8,
  },
  difficultyWrapper: {
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  difficultyText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  exercisesSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
  },
  editText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  exerciseCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  exerciseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  exerciseIndex: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseMetaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  metaSeparator: {
    marginHorizontal: 8,
    color: 'rgba(255,255,255,0.4)',
  },
  exerciseDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: 16,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  exerciseAction: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  startButton: {
    marginBottom: 16,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  secondaryButtonContent: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  errorText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default LiquidWorkoutDetailScreen;