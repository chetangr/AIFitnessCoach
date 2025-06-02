import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { useThemeStore } from '../store/themeStore';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface WorkoutEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'workout' | 'rest';
  calories: number;
  completed: boolean;
  originalDate?: Date;
}

interface DaySchedule {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  workouts: WorkoutEvent[];
}

const TimelineScreen = ({ navigation }: any) => {
  const { isDarkMode } = useThemeStore();
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [weekDays, setWeekDays] = useState<DaySchedule[]>([]);
  const [draggedWorkout, setDraggedWorkout] = useState<WorkoutEvent | null>(null);
  const [draggedFromDay, setDraggedFromDay] = useState<Date | null>(null);
  const [dropTargetDay, setDropTargetDay] = useState<Date | null>(null);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const dragPositionY = useRef(new Animated.Value(0)).current;
  const dragOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    generateWeekSchedule();
  }, [currentWeek]);

  const generateWeekSchedule = () => {
    const startOfWeek = currentWeek.clone().startOf('week');
    const days: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.clone().add(i, 'days');
      const isToday = date.isSame(moment(), 'day');
      
      // Generate workouts based on the day
      const dayWorkouts: WorkoutEvent[] = [];
      
      // Example workout schedule
      if (i === 0 || i === 2 || i === 4) { // Mon, Wed, Fri
        dayWorkouts.push({
          id: `workout-${date.format('YYYY-MM-DD')}-1`,
          title: ['Chest & Triceps', 'Back & Biceps', 'Legs & Glutes'][i === 0 ? 0 : i === 2 ? 1 : 2],
          time: '9:00 AM',
          duration: '45 min',
          difficulty: 'Intermediate',
          type: 'workout',
          calories: 350,
          completed: date.isBefore(moment(), 'day'),
        });
      }
      
      if (i === 1 || i === 3) { // Tue, Thu
        dayWorkouts.push({
          id: `workout-${date.format('YYYY-MM-DD')}-2`,
          title: i === 1 ? 'Shoulders & Abs' : 'Full Body HIIT',
          time: '6:00 PM',
          duration: '30 min',
          difficulty: i === 1 ? 'Intermediate' : 'Advanced',
          type: 'workout',
          calories: i === 1 ? 280 : 400,
          completed: date.isBefore(moment(), 'day'),
        });
      }
      
      if (i === 5) { // Saturday
        dayWorkouts.push({
          id: `workout-${date.format('YYYY-MM-DD')}-3`,
          title: 'Yoga & Stretching',
          time: '10:00 AM',
          duration: '60 min',
          difficulty: 'Beginner',
          type: 'workout',
          calories: 150,
          completed: date.isBefore(moment(), 'day'),
        });
      }
      
      if (i === 6) { // Sunday
        dayWorkouts.push({
          id: `rest-${date.format('YYYY-MM-DD')}`,
          title: 'Rest Day',
          time: 'All Day',
          duration: '-',
          difficulty: 'Beginner',
          type: 'rest',
          calories: 0,
          completed: false,
        });
      }

      days.push({
        date: date.toDate(),
        dayName: date.format('ddd'),
        dayNumber: date.format('D'),
        isToday,
        workouts: dayWorkouts,
      });
    }

    setWeekDays(days);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    // Animation
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: direction === 'next' ? -width : width,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    if (direction === 'prev') {
      setCurrentWeek(currentWeek.clone().subtract(1, 'week'));
    } else {
      setCurrentWeek(currentWeek.clone().add(1, 'week'));
    }
  };

  const getWeekRange = () => {
    const start = currentWeek.clone().startOf('week');
    const end = currentWeek.clone().endOf('week');
    return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
  };

  const handleWorkoutPress = (workout: WorkoutEvent) => {
    if (workout.type === 'workout') {
      // Create a workout object with exercises based on the workout type
      const workoutExercises = getWorkoutExercises(workout.title);
      
      navigation.navigate('WorkoutDetail', { 
        workout: {
          id: workout.id,
          name: workout.title,
          duration: workout.duration,
          difficulty: workout.difficulty,
          exercises: workoutExercises,
          calories: workout.calories,
        }
      });
    }
  };
  
  const getWorkoutExercises = (workoutTitle: string) => {
    // Define exercises for each workout type
    const workoutMap: { [key: string]: any[] } = {
      'Chest & Triceps': [
        { id: 'bench_press', name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s' },
        { id: 'incline_db', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s' },
        { id: 'cable_fly', name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '45s' },
        { id: 'dips', name: 'Dips', sets: 3, reps: '8-12', rest: '60s' },
        { id: 'tricep_pushdown', name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '45s' },
        { id: 'overhead_ext', name: 'Overhead Tricep Extension', sets: 3, reps: '10-12', rest: '45s' },
      ],
      'Back & Biceps': [
        { id: 'deadlift', name: 'Deadlifts', sets: 4, reps: '6-8', rest: '120s' },
        { id: 'pullups', name: 'Pull-ups', sets: 3, reps: '8-12', rest: '90s' },
        { id: 'bb_row', name: 'Barbell Rows', sets: 3, reps: '8-10', rest: '60s' },
        { id: 'lat_pulldown', name: 'Lat Pulldowns', sets: 3, reps: '10-12', rest: '45s' },
        { id: 'bb_curl', name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '45s' },
        { id: 'hammer_curl', name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '45s' },
      ],
      'Legs & Glutes': [
        { id: 'squat', name: 'Barbell Squats', sets: 4, reps: '8-10', rest: '120s' },
        { id: 'leg_press', name: 'Leg Press', sets: 3, reps: '10-12', rest: '90s' },
        { id: 'lunges', name: 'Walking Lunges', sets: 3, reps: '12 each', rest: '60s' },
        { id: 'rdl', name: 'Romanian Deadlifts', sets: 3, reps: '10-12', rest: '60s' },
        { id: 'leg_curl', name: 'Leg Curls', sets: 3, reps: '12-15', rest: '45s' },
        { id: 'calf_raise', name: 'Calf Raises', sets: 4, reps: '15-20', rest: '30s' },
      ],
      'Shoulders & Abs': [
        { id: 'military_press', name: 'Military Press', sets: 4, reps: '8-10', rest: '90s' },
        { id: 'lateral_raise', name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '45s' },
        { id: 'rear_delt', name: 'Rear Delt Flyes', sets: 3, reps: '12-15', rest: '45s' },
        { id: 'face_pulls', name: 'Face Pulls', sets: 3, reps: '15-20', rest: '45s' },
        { id: 'plank', name: 'Plank', sets: 3, reps: '60s', rest: '30s' },
        { id: 'ab_wheel', name: 'Ab Wheel Rollouts', sets: 3, reps: '10-15', rest: '45s' },
      ],
      'Full Body HIIT': [
        { id: 'burpees', name: 'Burpees', sets: 4, reps: '10', rest: '30s' },
        { id: 'mountain_climbers', name: 'Mountain Climbers', sets: 4, reps: '20', rest: '30s' },
        { id: 'jump_squats', name: 'Jump Squats', sets: 4, reps: '15', rest: '30s' },
        { id: 'push_ups', name: 'Push-ups', sets: 4, reps: '12', rest: '30s' },
        { id: 'high_knees', name: 'High Knees', sets: 4, reps: '30s', rest: '30s' },
        { id: 'plank_jacks', name: 'Plank Jacks', sets: 4, reps: '15', rest: '30s' },
      ],
      'Yoga & Stretching': [
        { id: 'sun_salutation', name: 'Sun Salutation', sets: 3, reps: '5 flows', rest: '60s' },
        { id: 'warrior_one', name: 'Warrior I Pose', sets: 2, reps: '30s each side', rest: '30s' },
        { id: 'downward_dog', name: 'Downward Dog', sets: 3, reps: '45s', rest: '30s' },
        { id: 'pigeon_pose', name: 'Pigeon Pose', sets: 2, reps: '60s each side', rest: '30s' },
        { id: 'child_pose', name: 'Child\'s Pose', sets: 3, reps: '60s', rest: '30s' },
        { id: 'corpse_pose', name: 'Corpse Pose', sets: 1, reps: '5 min', rest: '0s' },
      ]
    };

    return workoutMap[workoutTitle] || [];
  };

  const handleDragStart = (workout: WorkoutEvent, fromDay: Date) => {
    setDraggedWorkout(workout);
    setDraggedFromDay(fromDay);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDragEnd = (gestureState: any) => {
    if (draggedWorkout && draggedFromDay) {
      // Determine drop target based on drag position
      const { absoluteY } = gestureState.nativeEvent;
      const targetDay = findDayFromPosition(absoluteY);
      
      if (targetDay && !moment(targetDay).isSame(draggedFromDay, 'day')) {
        // Move workout to new day
        moveWorkout(draggedWorkout, draggedFromDay, targetDay);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    
    // Reset drag state
    setDraggedWorkout(null);
    setDraggedFromDay(null);
    setDropTargetDay(null);
    
    // Reset animations
    Animated.timing(dragOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const findDayFromPosition = (absoluteY: number): Date | null => {
    // Simple approximation - you might want to measure actual positions
    const headerHeight = 150; // Approximate header + navigation height
    const dayHeight = 150; // Approximate height per day
    const relativeY = absoluteY - headerHeight;
    const dayIndex = Math.floor(relativeY / dayHeight);
    
    if (dayIndex >= 0 && dayIndex < weekDays.length) {
      return weekDays[dayIndex].date;
    }
    return null;
  };

  const moveWorkout = (workout: WorkoutEvent, fromDay: Date, toDay: Date) => {
    if (moment(fromDay).isSame(toDay, 'day')) return;
    
    Alert.alert(
      'Move Workout',
      `Move "${workout.title}" from ${moment(fromDay).format('ddd, MMM D')} to ${moment(toDay).format('ddd, MMM D')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move',
          onPress: () => {
            // Update the workouts in your state management
            // For now, just regenerate the schedule
            generateWeekSchedule();
          },
        },
      ]
    );
  };

  const renderWorkoutCard = (workout: WorkoutEvent, day: DaySchedule) => {
    const isDragging = draggedWorkout?.id === workout.id;
    const isDropTarget = dropTargetDay && moment(dropTargetDay).isSame(day.date, 'day');
    
    if (workout.type === 'rest') {
      return (
        <View
          key={workout.id}
          style={[
            styles.restDayCard,
            day.isToday && styles.todayCard
          ]}
        >
          <BlurView intensity={10} tint="light" style={styles.restDayContent}>
            <Icon name="bed" size={24} color="rgba(255,255,255,0.6)" />
            <Text style={styles.restDayText}>Rest Day</Text>
            <Text style={styles.restDaySubtext}>Recovery is important</Text>
          </BlurView>
        </View>
      );
    }

    return (
      <PanGestureHandler
        key={workout.id}
        onGestureEvent={(event) => {
          dragPositionY.setValue(event.nativeEvent.translationY);
          
          // Update drop target during drag
          if (draggedWorkout) {
            const targetDay = findDayFromPosition(event.nativeEvent.absoluteY);
            if (targetDay) {
              setDropTargetDay(targetDay);
            }
          }
        }}
        onHandlerStateChange={(event) => {
          if (event.nativeEvent.state === State.BEGAN) {
            handleDragStart(workout, day.date);
            Animated.timing(dragOpacity, {
              toValue: 0.7,
              duration: 200,
              useNativeDriver: true,
            }).start();
          } else if (event.nativeEvent.state === State.END) {
            handleDragEnd(event);
          }
        }}
      >
        <Animated.View
          style={[
            isDragging && {
              opacity: dragOpacity,
              transform: [{ translateY: dragPositionY }],
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => handleWorkoutPress(workout)}
            activeOpacity={0.8}
          >
            <BlurView
              intensity={day.isToday ? 25 : 15}
              tint="light"
              style={[
                styles.workoutCard,
                workout.completed && styles.completedCard,
                isDropTarget && styles.dropTargetCard,
              ]}
            >
              <View style={styles.workoutHeader}>
                <View style={styles.workoutTitleRow}>
                  <Icon 
                    name={workout.completed ? "checkmark-circle" : "fitness"} 
                    size={20} 
                    color={workout.completed ? "#4CAF50" : "white"} 
                  />
                  <Text style={[
                    styles.workoutTitle,
                    workout.completed && styles.completedText
                  ]} numberOfLines={1} ellipsizeMode="tail">
                    {workout.title}
                  </Text>
                </View>
                <TouchableOpacity style={styles.dragHandle}>
                  <Icon name="reorder-three" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.workoutDetails}>
                <View style={styles.workoutStat}>
                  <Icon name="time" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.workoutStatText}>{workout.duration}</Text>
                </View>
                
                {workout.calories > 0 && (
                  <View style={styles.workoutStat}>
                    <Icon name="flame" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.workoutStatText}>{workout.calories} cal</Text>
                  </View>
                )}
                
                <View style={[styles.difficultyBadge, getDifficultyStyle(workout.difficulty)]}>
                  <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return { backgroundColor: 'rgba(76, 175, 80, 0.3)' };
      case 'Intermediate':
        return { backgroundColor: 'rgba(255, 152, 0, 0.3)' };
      case 'Advanced':
        return { backgroundColor: 'rgba(244, 67, 54, 0.3)' };
      default:
        return { backgroundColor: 'rgba(158, 158, 158, 0.3)' };
    }
  };

  const gradientColors = isDarkMode 
    ? ['#0f0c29', '#302b63', '#24243e'] 
    : ['#667eea', '#764ba2', '#f093fb'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient colors={gradientColors} style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Your Journey</Text>
            <Text style={styles.headerTitle}>Timeline</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
            <LinearGradient colors={['rgba(240, 147, 251, 0.2)', 'rgba(102, 126, 234, 0.2)']} style={styles.settingsGradient}>
              <Icon name="settings-outline" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateWeek('prev')}
          >
            <Icon name="chevron-back" size={20} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.weekRange}>{getWeekRange()}</Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateWeek('next')}
          >
            <Icon name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Week View with Draggable Workouts */}
        <ScrollView 
          style={styles.weeklyView} 
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {weekDays.map((day) => {
            const isDropTarget = dropTargetDay && moment(dropTargetDay).isSame(day.date, 'day');
            
            return (
              <View 
                key={day.date.toISOString()} 
                style={[
                  styles.daySection,
                  isDropTarget && styles.dropTargetSection
                ]}
              >
                {/* Day Header */}
                <View style={styles.dayHeader}>
                  <View style={styles.dayInfo}>
                    <Text style={[
                      styles.dayName,
                      day.isToday && styles.todayText
                    ]}>
                      {day.dayName}
                    </Text>
                    <Text style={[
                      styles.dayNumber,
                      day.isToday && styles.todayNumber
                    ]}>
                      {day.dayNumber}
                    </Text>
                  </View>
                  {day.isToday && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>TODAY</Text>
                    </View>
                  )}
                </View>

                {/* Workouts */}
                <View style={styles.dayWorkouts}>
                  {day.workouts.length > 0 ? (
                    day.workouts.map((workout) => renderWorkoutCard(workout, day))
                  ) : (
                    <View key="empty-day" style={styles.emptyDay}>
                      <Text style={styles.emptyDayText}>No workouts scheduled</Text>
                    </View>
                  )}
                  
                  {/* Drop Zone Indicator */}
                  {isDropTarget && draggedWorkout && (
                    <View style={styles.dropZone}>
                      <Icon name="add-circle-outline" size={24} color="rgba(255,255,255,0.5)" />
                      <Text style={styles.dropZoneText}>Drop here</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  settingsGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekRange: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  weeklyView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  daySection: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dropTargetSection: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  todayText: {
    color: '#4CAF50',
  },
  todayNumber: {
    color: '#4CAF50',
  },
  todayBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  dayWorkouts: {
    gap: 10,
  },
  workoutCard: {
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  completedCard: {
    opacity: 0.7,
  },
  dropTargetCard: {
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  dragHandle: {
    padding: 4,
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  restDayCard: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  restDayContent: {
    padding: 20,
    alignItems: 'center',
  },
  restDayText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  restDaySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  emptyDay: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  dropZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.4)',
    borderStyle: 'dashed',
  },
  dropZoneText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  todayCard: {
    transform: [{ scale: 1.02 }],
  },
});

export default TimelineScreen;