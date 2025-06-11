import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
// import { useAuthStore } from '../store/authStore';
// import { useThemeStore } from '../store/themeStore';
// import backendWorkoutService from '../services/backendWorkoutService';

// const { width } = Dimensions.get('window');

type RootStackParamList = {
  ProgramDetail: { programId: string };
  WorkoutDetail: { workoutId: string };
  ActiveWorkout: { workoutId: string };
};

type ProgramDetailRouteProp = RouteProp<RootStackParamList, 'ProgramDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface WorkoutDay {
  id: string;
  day: string;
  name: string;
  exercises: number;
  duration: string;
  focus: string[];
  completed?: boolean;
}

interface Program {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: string;
  goal: string;
  daysPerWeek: number;
  equipment: string[];
  currentWeek: number;
  totalWeeks: number;
  progress: number;
  workouts: WorkoutDay[];
}

const LiquidProgramDetailScreen: React.FC = () => {
  const route = useRoute<ProgramDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { programId } = route.params;
  // const { token } = useAuthStore();
  // const { theme } = useThemeStore();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProgramDetails();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [programId]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the backend
      // For now, using mock data
      const mockProgram: Program = {
        id: programId,
        name: 'Strength & Hypertrophy',
        description: 'A comprehensive 12-week program designed to build muscle mass and increase strength through progressive overload and strategic periodization.',
        duration: '12 weeks',
        level: 'Intermediate',
        goal: 'Build Muscle',
        daysPerWeek: 4,
        equipment: ['Barbell', 'Dumbbell', 'Cable Machine', 'Pull-up Bar'],
        currentWeek: 3,
        totalWeeks: 12,
        progress: 25,
        workouts: [
          {
            id: '1',
            day: 'Monday',
            name: 'Upper Power',
            exercises: 6,
            duration: '60 min',
            focus: ['Chest', 'Back', 'Shoulders'],
            completed: true,
          },
          {
            id: '2',
            day: 'Tuesday',
            name: 'Lower Power',
            exercises: 5,
            duration: '55 min',
            focus: ['Quads', 'Hamstrings', 'Glutes'],
            completed: true,
          },
          {
            id: '3',
            day: 'Thursday',
            name: 'Upper Hypertrophy',
            exercises: 8,
            duration: '70 min',
            focus: ['Chest', 'Back', 'Arms'],
            completed: false,
          },
          {
            id: '4',
            day: 'Friday',
            name: 'Lower Hypertrophy',
            exercises: 7,
            duration: '65 min',
            focus: ['Legs', 'Calves', 'Core'],
            completed: false,
          },
        ],
      };
      setProgram(mockProgram);
    } catch (error) {
      console.error('Error fetching program details:', error);
      Alert.alert('Error', 'Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = (workout: WorkoutDay) => {
    navigation.navigate('ActiveWorkout', { workoutId: workout.id });
  };

  const handleViewWorkout = (workout: WorkoutDay) => {
    navigation.navigate('WorkoutDetail', { workoutId: workout.id });
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0.95, 1],
    extrapolate: 'clamp',
  });

  const renderWeekSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.weekSelector}
      contentContainerStyle={styles.weekSelectorContent}
    >
      {Array.from({ length: program?.totalWeeks || 12 }, (_, i) => i + 1).map((week) => (
        <TouchableOpacity
          key={week}
          onPress={() => setSelectedWeek(week)}
          style={[
            styles.weekTab,
            selectedWeek === week && styles.weekTabActive,
            week === program?.currentWeek && styles.weekTabCurrent,
          ]}
        >
          <BlurView
            intensity={selectedWeek === week ? 100 : 60}
            tint={true ? 'dark' : 'light'}
            style={styles.weekTabBlur}
          >
            <Text style={[
              styles.weekTabText,
              selectedWeek === week && styles.weekTabTextActive,
            ]}>
              Week {week}
            </Text>
            {week === program?.currentWeek && (
              <View style={styles.currentWeekDot} />
            )}
          </BlurView>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderWorkoutCard = (workout: WorkoutDay) => (
    <TouchableOpacity
      key={workout.id}
      onPress={() => handleViewWorkout(workout)}
      style={styles.workoutCard}
      activeOpacity={0.8}
    >
      <BlurView
        intensity={80}
        tint={true ? 'dark' : 'light'}
        style={styles.workoutCardBlur}
      >
        <LinearGradient
          colors={workout.completed 
            ? ['rgba(76,217,100,0.1)', 'rgba(76,217,100,0.05)']
            : ['rgba(0,122,255,0.1)', 'rgba(0,122,255,0.05)']}
          style={styles.workoutCardGradient}
        >
          <View style={styles.workoutHeader}>
            <View>
              <Text style={styles.workoutDay}>{workout.day}</Text>
              <Text style={styles.workoutName}>{workout.name}</Text>
            </View>
            {workout.completed && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
              </View>
            )}
          </View>

          <View style={styles.workoutDetails}>
            <View style={styles.workoutDetailItem}>
              <Ionicons name="fitness" size={16} color="#999" />
              <Text style={styles.workoutDetailText}>{workout.exercises} exercises</Text>
            </View>
            <View style={styles.workoutDetailItem}>
              <Ionicons name="time" size={16} color="#999" />
              <Text style={styles.workoutDetailText}>{workout.duration}</Text>
            </View>
          </View>

          <View style={styles.focusAreas}>
            {workout.focus.map((area, index) => (
              <View key={index} style={styles.focusTag}>
                <Text style={styles.focusTagText}>{area}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => handleStartWorkout(workout)}
            style={[
              styles.startButton,
              workout.completed && styles.startButtonCompleted,
            ]}
          >
            <BlurView
              intensity={100}
              tint={true ? 'dark' : 'light'}
              style={styles.startButtonBlur}
            >
              <Text style={styles.startButtonText}>
                {workout.completed ? 'Do Again' : 'Start Workout'}
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={workout.completed ? '#4CD964' : '#007AFF'} 
              />
            </BlurView>
          </TouchableOpacity>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!program) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Program not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={true 
          ? ['#000000', '#1a1a1a', '#000000']
          : ['#f8f9fa', '#ffffff', '#f8f9fa']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ scale: headerScale }],
          },
        ]}
      >
        <BlurView
          intensity={100}
          tint={true ? 'dark' : 'light'}
          style={styles.headerBlur}
        >
          <SafeAreaView edges={['top']} style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={true ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{program.name}</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color={true ? '#fff' : '#000'} />
            </TouchableOpacity>
          </SafeAreaView>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <SafeAreaView edges={['top']}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={styles.heroBackButton}
              >
                <BlurView
                  intensity={80}
                  tint={true ? 'dark' : 'light'}
                  style={styles.heroBackButtonBlur}
                >
                  <Ionicons name="arrow-back" size={24} color={true ? '#fff' : '#000'} />
                </BlurView>
              </TouchableOpacity>
            </SafeAreaView>

            <View style={styles.heroContent}>
              <Text style={styles.programName}>{program.name}</Text>
              <Text style={styles.programDescription}>{program.description}</Text>

              {/* Program Stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <BlurView
                    intensity={80}
                    tint={true ? 'dark' : 'light'}
                    style={styles.statItemBlur}
                  >
                    <Ionicons name="calendar" size={24} color="#007AFF" />
                    <Text style={styles.statValue}>{program.duration}</Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </BlurView>
                </View>

                <View style={styles.statItem}>
                  <BlurView
                    intensity={80}
                    tint={true ? 'dark' : 'light'}
                    style={styles.statItemBlur}
                  >
                    <Ionicons name="trending-up" size={24} color="#34C759" />
                    <Text style={styles.statValue}>{program.level}</Text>
                    <Text style={styles.statLabel}>Level</Text>
                  </BlurView>
                </View>

                <View style={styles.statItem}>
                  <BlurView
                    intensity={80}
                    tint={true ? 'dark' : 'light'}
                    style={styles.statItemBlur}
                  >
                    <Ionicons name="fitness" size={24} color="#FF9500" />
                    <Text style={styles.statValue}>{program.daysPerWeek}</Text>
                    <Text style={styles.statLabel}>Days/Week</Text>
                  </BlurView>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Overall Progress</Text>
                  <Text style={styles.progressPercentage}>{program.progress}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <LinearGradient
                    colors={['#007AFF', '#0051D5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBar, { width: `${program.progress}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  Week {program.currentWeek} of {program.totalWeeks}
                </Text>
              </View>
            </View>
          </View>

          {/* Week Selector */}
          {renderWeekSelector()}

          {/* Workouts Section */}
          <View style={styles.workoutsSection}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            {program.workouts.map(renderWorkoutCard)}
          </View>

          {/* Equipment Section */}
          <View style={styles.equipmentSection}>
            <Text style={styles.sectionTitle}>Required Equipment</Text>
            <View style={styles.equipmentGrid}>
              {program.equipment.map((item, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <BlurView
                    intensity={80}
                    tint={true ? 'dark' : 'light'}
                    style={styles.equipmentItemBlur}
                  >
                    <Ionicons name="barbell" size={20} color="#007AFF" />
                    <Text style={styles.equipmentText}>{item}</Text>
                  </BlurView>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  moreButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  heroBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  heroBackButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  programName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  programDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  statItemBlur: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  weekSelector: {
    marginBottom: 20,
  },
  weekSelectorContent: {
    paddingHorizontal: 20,
  },
  weekTab: {
    marginRight: 10,
  },
  weekTabBlur: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  weekTabActive: {
    transform: [{ scale: 1.05 }],
  },
  weekTabCurrent: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 20,
  },
  weekTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  weekTabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  currentWeekDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  workoutsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  workoutCard: {
    marginBottom: 15,
  },
  workoutCardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  workoutCardGradient: {
    padding: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  workoutDay: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  completedBadge: {
    backgroundColor: 'rgba(76,217,100,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  workoutDetails: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  workoutDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  workoutDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  focusTag: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  focusTagText: {
    fontSize: 12,
    color: '#666',
  },
  startButton: {
    alignSelf: 'flex-start',
  },
  startButtonCompleted: {
    opacity: 0.8,
  },
  startButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
  },
  equipmentSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentItem: {
    marginRight: 10,
    marginBottom: 10,
  },
  equipmentItemBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  equipmentText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
});

export default LiquidProgramDetailScreen;