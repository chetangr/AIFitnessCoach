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
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { useThemeStore } from '../store/themeStore';
import * as Haptics from 'expo-haptics';
import { workoutScheduleService, WorkoutEvent } from '../services/workoutScheduleService';
import { SAFE_BOTTOM_PADDING } from '../constants/layout';
import { Swipeable } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

// Remove duplicate interface since we're importing from service
// interface WorkoutEvent is already imported

interface DaySchedule {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  workouts: (WorkoutEvent & { duration: string })[];
}

const TimelineScreen = ({ navigation }: any) => {
  const { isDarkMode } = useThemeStore();
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [weekDays, setWeekDays] = useState<DaySchedule[]>([]);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<{workout: WorkoutEvent, fromDay: Date} | null>(null);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const fabPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    generateWeekSchedule();
  }, [currentWeek]);
  
  useEffect(() => {
    // Create a pulsing animation for FAB
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, []);

  // Refresh when screen comes into focus (to pick up AI changes)
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Timeline screen focused - refreshing data...');
      generateWeekSchedule();
    }, [currentWeek])
  );

  const generateWeekSchedule = async () => {
    try {
      console.log('🔄 Generating week schedule from workout service...');
      
      // Initialize services if needed
      await workoutScheduleService.initializeDefaultSchedule();
      
      const startOfWeek = currentWeek.clone().startOf('week');
      const endOfWeek = currentWeek.clone().endOf('week');
      
      // Get actual workouts from the service
      const weekWorkouts = await workoutScheduleService.getWorkoutsForDateRange(
        startOfWeek.toDate(),
        endOfWeek.toDate()
      );
      
      console.log('📋 Found', weekWorkouts.length, 'workouts for this week');
      
      const days: DaySchedule[] = [];

      for (let i = 0; i < 7; i++) {
        const date = startOfWeek.clone().add(i, 'days');
        const isToday = date.isSame(moment(), 'day');
        
        // Find workouts for this specific day and format them for UI
        const dayWorkouts = weekWorkouts
          .filter(workout => moment(workout.date).isSame(date, 'day'))
          .map(workout => ({
            ...workout,
            // Convert duration from number to string format expected by UI
            duration: typeof workout.duration === 'number' ? `${workout.duration} min` : workout.duration,
            // Ensure difficulty matches expected format
            difficulty: workout.difficulty as 'Beginner' | 'Intermediate' | 'Advanced'
          }));
        
        console.log(`📅 ${date.format('ddd D')}:`, dayWorkouts.length, 'workouts');
        
        days.push({
          date: date.toDate(),
          dayName: date.format('ddd'),
          dayNumber: date.format('D'),
          isToday,
          workouts: dayWorkouts as unknown as (WorkoutEvent & { duration: string })[],
        });
      }

      setWeekDays(days);
      
      // Scroll to today after a small delay to ensure layout is complete
      setTimeout(() => {
        scrollToToday(days);
      }, 500);
    } catch (error) {
      console.error('❌ Error generating week schedule:', error);
      // Fallback to empty schedule
      setWeekDays([]);
    }
  };
  
  const scrollToToday = (days: DaySchedule[]) => {
    const todayIndex = days.findIndex(day => day.isToday);
    if (todayIndex !== -1 && scrollViewRef.current) {
      // Calculate position based on approximate height of each day section
      const approximateDayHeight = 200; // Adjust based on your actual day section height
      const scrollPosition = todayIndex * approximateDayHeight;
      
      scrollViewRef.current.scrollTo({
        y: scrollPosition,
        animated: true
      });
    }
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
    if (workout.type !== 'rest') {
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


  const swapWorkouts = async (workout1: WorkoutEvent, day1: Date, workout2: WorkoutEvent | null, day2: Date) => {
    if (moment(day1).isSame(day2, 'day')) return;
    
    try {
      console.log('Swapping workouts:', workout1.title, 'with', workout2?.title || 'rest day');
      
      // Get both workouts
      const targetDayWorkout = await workoutScheduleService.getWorkoutForDate(day2);
      
      // Delete both workouts
      await workoutScheduleService.deleteWorkout(day1);
      await workoutScheduleService.deleteWorkout(day2);
      
      // Add workout1 to day2
      const movedWorkout1 = {
        ...workout1,
        date: day2
      };
      await workoutScheduleService.addWorkout(day2, movedWorkout1);
      
      // If there was a workout on day2, add it to day1
      if (targetDayWorkout && targetDayWorkout.type !== 'rest') {
        const movedWorkout2 = {
          ...targetDayWorkout,
          date: day1
        };
        await workoutScheduleService.addWorkout(day1, movedWorkout2);
      }
      
      // Regenerate the schedule to reflect changes
      generateWeekSchedule();
      
      // Show success feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error swapping workouts:', error);
      Alert.alert('Error', 'Failed to swap workouts. Please try again.');
    }
  };

  const renderWorkoutCard = (workout: WorkoutEvent & { duration: string }, day: DaySchedule) => {
    // Create animated values directly without useRef inside render
    const scaleValue = new Animated.Value(1);
    let swipeableRef: Swipeable | null = null;
    
    const animatePress = () => {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    };
    
    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => {
      const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-80, 0],
      });
      
      return (
        <Animated.View style={[styles.swipeAction, { transform: [{ translateX }] }]}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.swipeLeftGradient}
          >
            <Icon name="swap-horizontal" size={24} color="white" />
            <Text style={styles.swipeActionText}>Reschedule</Text>
          </LinearGradient>
        </Animated.View>
      );
    };
    
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
      const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [80, 0],
      });
      
      return (
        <Animated.View style={[styles.swipeAction, { transform: [{ translateX }] }]}>
          <LinearGradient
            colors={['#f44336', '#ff6b6b']}
            style={styles.swipeRightGradient}
          >
            <Icon name="bed" size={24} color="white" />
            <Text style={styles.swipeActionText}>Rest Day</Text>
          </LinearGradient>
        </Animated.View>
      );
    };
    
    const handleSwipeLeft = () => {
      swipeableRef?.close();
      setSelectedWorkout({ workout, fromDay: day.date });
      setShowDayPicker(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };
    
    const handleSwipeRight = async () => {
      swipeableRef?.close();
      Alert.alert(
        'Make Rest Day',
        `Convert "${workout.title}" to a rest day?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Rest Day',
            style: 'destructive',
            onPress: async () => {
              try {
                await workoutScheduleService.deleteWorkout(day.date);
                generateWeekSchedule();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (error) {
                Alert.alert('Error', 'Failed to update workout');
              }
            },
          },
        ]
      );
    };
    
    if (workout.type === 'rest') {
      return (
        <Animated.View
          style={[
            styles.restDayCard,
            day.isToday && styles.todayCard,
            { transform: [{ scale: scaleValue }] }
          ]}
        >
          <BlurView intensity={10} tint="light" style={styles.restDayContent}>
            <Icon name="bed" size={24} color="rgba(255,255,255,0.6)" />
            <Text style={styles.restDayText}>Rest Day</Text>
            <Text style={styles.restDaySubtext}>Recovery is important</Text>
          </BlurView>
        </Animated.View>
      );
    }
    
    const handleLongPress = () => {
      setSelectedWorkout({ workout, fromDay: day.date });
      setShowDayPicker(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };
    
    const handlePress = () => {
      animatePress();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      handleWorkoutPress(workout);
    };

    return (
      <Swipeable
        ref={(ref) => { swipeableRef = ref; }}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableLeftOpen={handleSwipeLeft}
        onSwipeableRightOpen={handleSwipeRight}
        overshootLeft={false}
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={1}
        >
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <BlurView
                intensity={day.isToday ? 25 : 15}
                tint="light"
                style={[
                  styles.workoutCard,
                  workout.completed && styles.completedCard
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
          </Animated.View>
        </TouchableOpacity>
      </Swipeable>
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
    ? ['#0f0c29', '#302b63', '#24243e'] as const
    : ['#667eea', '#764ba2', '#f093fb'] as const;

  return (
    <>
      <LinearGradient colors={gradientColors} style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Your Journey</Text>
            <Text style={styles.headerTitle}>Timeline</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={generateWeekSchedule} style={styles.refreshButton}>
              <LinearGradient colors={['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.3)']} style={styles.refreshGradient}>
                <Icon name="refresh" size={20} color="#4CAF50" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
          ref={scrollViewRef}
          style={styles.weeklyView} 
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: SAFE_BOTTOM_PADDING }}
        >
          {weekDays.map((day) => {
            
            return (
              <View 
                key={day.date.toISOString()}
                style={styles.daySection}
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
                    day.workouts.map((workout) => (
                      <React.Fragment key={workout.id}>
                        {renderWorkoutCard(workout, day)}
                      </React.Fragment>
                    ))
                  ) : (
                    <View style={styles.emptyDay}>
                      <Text style={styles.emptyDayText}>No workouts scheduled</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Floating Workout Tracking Button */}
        <Animated.View style={[styles.floatingButton, { transform: [{ scale: fabPulse }] }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('WorkoutTracking')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ff4757']}
              style={styles.floatingButtonGradient}
            >
              <Icon name="barbell" size={28} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Day Selection Modal */}
      <Modal
        visible={showDayPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDayPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <BlurView intensity={100} tint="dark" style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Move "{selectedWorkout?.workout.title}" to:
              </Text>
              
              <ScrollView style={styles.dayList}>
                {weekDays.map((d) => {
                  const hasWorkout = d.workouts.some(w => w.type !== 'rest');
                  const workoutName = hasWorkout ? d.workouts.find(w => w.type !== 'rest')?.title : 'Rest Day';
                  const isCurrentDay = selectedWorkout && moment(d.date).isSame(selectedWorkout.fromDay, 'day');
                  
                  return (
                    <TouchableOpacity
                      key={d.date.toISOString()}
                      style={[styles.dayOption, isCurrentDay && styles.currentDayOption]}
                      onPress={async () => {
                        if (selectedWorkout && !isCurrentDay) {
                          const targetWorkout = d.workouts.find(w => w.type !== 'rest') || null;
                          await swapWorkouts(
                            selectedWorkout.workout, 
                            selectedWorkout.fromDay, 
                            targetWorkout, 
                            d.date
                          );
                          setShowDayPicker(false);
                          setSelectedWorkout(null);
                        }
                      }}
                      disabled={isCurrentDay || false}
                    >
                      <View style={styles.dayOptionContent}>
                        <Text style={[styles.dayOptionDate, isCurrentDay && styles.disabledText]}>
                          {d.dayName} {d.dayNumber}
                        </Text>
                        <Text style={[styles.dayOptionWorkout, isCurrentDay && styles.disabledText]}>
                          {workoutName}
                        </Text>
                      </View>
                      {d.isToday && (
                        <View style={styles.todayIndicator}>
                          <Text style={styles.todayIndicatorText}>TODAY</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDayPicker(false);
                  setSelectedWorkout(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </View>
      </Modal>
    </>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  refreshGradient: {
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
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 46, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  dayList: {
    maxHeight: 400,
  },
  dayOption: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  currentDayOption: {
    opacity: 0.5,
  },
  dayOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayOptionDate: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  dayOptionWorkout: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  disabledText: {
    color: 'rgba(255,255,255,0.4)',
  },
  todayIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  swipeLeftGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginRight: 8,
  },
  swipeRightGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginLeft: 8,
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default TimelineScreen;