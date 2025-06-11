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
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { useThemeStore } from '../store/themeStore';
import * as Haptics from 'expo-haptics';
import { workoutScheduleService, WorkoutEvent } from '../services/workoutScheduleService';
import { appEventEmitter } from '../utils/eventEmitter';
import { SAFE_BOTTOM_PADDING } from '../constants/layout';
import { Swipeable } from 'react-native-gesture-handler';
import { 
  LiquidGlassView, 
  LiquidButton, 
  LiquidCard,
  LiquidInput
} from '../components/glass';

const { width, height } = Dimensions.get('window');

interface DaySchedule {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  workouts: WorkoutEvent[];
}

const LiquidTimelineScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [weekDays, setWeekDays] = useState<DaySchedule[]>([]);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<{workout: WorkoutEvent, fromDay: Date} | null>(null);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const fabPulse = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

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
    
    // Listen for workout updates from AI actions
    const handleScheduleChange = () => {
      console.log('📅 Schedule changed from AI action - refreshing...');
      generateWeekSchedule();
    };
    
    appEventEmitter.on('schedule_changed', handleScheduleChange);
    appEventEmitter.on('workout_updated', handleScheduleChange);
    appEventEmitter.on('workout_added', handleScheduleChange);
    appEventEmitter.on('workout_removed', handleScheduleChange);
    
    return () => {
      pulseAnimation.stop();
      appEventEmitter.off('schedule_changed', handleScheduleChange);
      appEventEmitter.off('workout_updated', handleScheduleChange);
      appEventEmitter.off('workout_added', handleScheduleChange);
      appEventEmitter.off('workout_removed', handleScheduleChange);
    };
  }, []);

  // Refresh when screen comes into focus (to pick up AI changes)
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Timeline screen focused - refreshing data...');
      generateWeekSchedule();
    }, [currentWeek])
  );

  const generateWeekSchedule = async () => {
    const startOfWeek = currentWeek.clone().startOf('week');
    const days: DaySchedule[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.clone().add(i, 'days');
      const dayWorkouts = await workoutScheduleService.getWorkoutForDate(date.toDate());
      
      days.push({
        date: date.toDate(),
        dayName: date.format('ddd'),
        dayNumber: date.format('D'),
        isToday: date.isSame(moment(), 'day'),
        workouts: dayWorkouts ? [dayWorkouts] : []
      });
    }
    
    setWeekDays(days);
    
    // Animate content in
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate out
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Change week
      setCurrentWeek(direction === 'next' 
        ? currentWeek.clone().add(1, 'week')
        : currentWeek.clone().subtract(1, 'week')
      );
    });
  };

  const handleWorkoutPress = (workout: WorkoutEvent, fromDay: Date) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Alert.alert(
      workout.title,
      `${workout.description || 'No description'}\n\nDuration: ${workout.duration} min\nDifficulty: ${workout.difficulty}`,
      [
        {
          text: 'Start Workout',
          onPress: () => navigation.navigate('ActiveWorkout', { workout }),
          style: 'default'
        },
        {
          text: 'Edit',
          onPress: () => navigation.navigate('WorkoutDetail', { workoutId: workout.id })
        },
        {
          text: 'Close',
          style: 'cancel'
        }
      ]
    );
  };

  const handleDeleteWorkout = async (workout: WorkoutEvent, day: Date) => {
    Alert.alert(
      'Remove Workout',
      `Remove "${workout.title}" from ${moment(day).format('MMM D')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutScheduleService.deleteWorkout(day);
              if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              generateWeekSchedule();
            } catch (error) {
              console.error('Error removing workout:', error);
              Alert.alert('Error', 'Failed to remove workout');
            }
          }
        }
      ]
    );
  };

  const renderWorkoutActions = () => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity style={styles.deleteAction}>
          <Icon name="trash-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDaySchedule = (day: DaySchedule) => {
    const hasWorkouts = day.workouts.length > 0;
    
    return (
      <View key={day.date.toISOString()} style={styles.dayContainer}>
        <View style={styles.dayHeader}>
          <View style={styles.dayInfo}>
            <Text style={[styles.dayName, day.isToday && styles.todayText]}>
              {day.dayName}
            </Text>
            <Text style={[styles.dayNumber, day.isToday && styles.todayText]}>
              {day.dayNumber}
            </Text>
          </View>
          {day.isToday && (
            <View style={styles.todayBadge}>
              <LiquidGlassView intensity={60} >
                <Text style={styles.todayLabel}>TODAY</Text>
              </LiquidGlassView>
            </View>
          )}
        </View>
        
        {hasWorkouts ? (
          <View style={styles.workoutsList}>
            {day.workouts.map((workout, index) => (
              <Swipeable
                key={`${workout.id}-${index}`}
                renderRightActions={renderWorkoutActions}
                onSwipeableRightOpen={() => handleDeleteWorkout(workout, day.date)}
              >
                <TouchableOpacity
                  onPress={() => handleWorkoutPress(workout, day.date)}
                  activeOpacity={0.8}
                >
                  <LiquidCard style={styles.workoutCard}>
                    <View style={styles.workoutContent}>
                      <Icon name="fitness" size={24} color="white" style={styles.workoutIcon} />
                      <View style={styles.workoutInfo}>
                        <Text style={styles.workoutName}>{workout.title}</Text>
                        <View style={styles.workoutMeta}>
                          <View style={styles.workoutStat}>
                            <Icon name="time-outline" size={16} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.workoutStatText}>{workout.duration} min</Text>
                          </View>
                          <View style={styles.workoutStat}>
                            <Icon name="flame-outline" size={16} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.workoutStatText}>{workout.calories} cal</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.difficultyBadge}>
                        <LiquidGlassView intensity={40} >
                          <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                        </LiquidGlassView>
                      </View>
                    </View>
                  </LiquidCard>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </View>
        ) : (
          <View style={styles.noWorkouts}>
            <LiquidGlassView intensity={40} style={styles.noWorkoutsGlass}>
              <Text style={styles.noWorkoutsText}>No workouts scheduled</Text>
            </LiquidGlassView>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient 
        colors={theme.colors.primary.gradient as any} 
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.animatedHeader,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            })
          }
        ]}
      >
        <LiquidGlassView intensity={90} >
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>Timeline</Text>
          </View>
        </LiquidGlassView>
      </Animated.View>
      
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Main Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Your Journey</Text>
            <Text style={styles.headerMainTitle}>Timeline</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setShowDayPicker(!showDayPicker)}
          >
            <LiquidGlassView intensity={60} >
              <View style={styles.profileIcon}>
                <Icon name="calendar-outline" size={24} color="white" />
              </View>
            </LiquidGlassView>
          </TouchableOpacity>
        </View>
        
        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity 
            onPress={() => navigateWeek('prev')}
            style={styles.navButton}
          >
            <LiquidGlassView intensity={50}>
              <Icon name="chevron-back" size={24} color="white" />
            </LiquidGlassView>
          </TouchableOpacity>
          
          <View style={styles.weekLabel}>
            <Text style={styles.weekText}>
              {currentWeek.clone().startOf('week').format('MMM D')} - {currentWeek.clone().endOf('week').format('MMM D, YYYY')}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => navigateWeek('next')}
            style={styles.navButton}
          >
            <LiquidGlassView intensity={50}>
              <Icon name="chevron-forward" size={24} color="white" />
            </LiquidGlassView>
          </TouchableOpacity>
        </View>
        
        {/* Week Schedule */}
        <Animated.View 
          style={[
            styles.scheduleContainer,
            {
              opacity: slideAnim,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}
        >
          {weekDays.map(renderDaySchedule)}
        </Animated.View>
        
        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>
      
      {/* Floating Action Button */}
      <Animated.View 
        style={[
          styles.fab,
          {
            transform: [{ scale: fabPulse }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Discover')}
          activeOpacity={0.8}
        >
          <LiquidGlassView intensity={80} >
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              style={styles.fabGradient}
            >
              <Icon name="add" size={28} color="white" />
            </LinearGradient>
          </LiquidGlassView>
        </TouchableOpacity>
      </Animated.View>
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
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SAFE_BOTTOM_PADDING,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  headerMainTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: {
    flex: 1,
    alignItems: 'center',
  },
  weekText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  scheduleContainer: {
    paddingHorizontal: 20,
  },
  dayContainer: {
    marginBottom: 24,
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dayNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
  },
  todayText: {
    color: '#4ade80',
  },
  todayBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  todayLabel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#4ade80',
  },
  workoutsList: {
    gap: 12,
  },
  workoutCard: {
    overflow: 'hidden',
  },
  workoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  workoutIcon: {
    marginRight: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  difficultyBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  difficultyText: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  noWorkouts: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noWorkoutsGlass: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  noWorkoutsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  swipeActions: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 16,
    marginLeft: 8,
  },
  deleteAction: {
    padding: 20,
  },
  fab: {
    position: 'absolute',
    bottom: SAFE_BOTTOM_PADDING + 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LiquidTimelineScreen;