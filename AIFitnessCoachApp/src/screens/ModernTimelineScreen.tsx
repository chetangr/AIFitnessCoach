console.log('[ModernTimelineScreen] Starting imports...');

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

console.log('[ModernTimelineScreen] Importing useTheme...');
import { useTheme } from '../contexts/ThemeContext';
console.log('[ModernTimelineScreen] Importing ModernComponents...');
import {
  ModernCard,
  ModernHeader,
} from '../components/modern/ModernComponents';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { workoutScheduleService, WorkoutEvent } from '../services/workoutScheduleService';

console.log('[ModernTimelineScreen] All imports complete');

const ModernTimelineScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [workouts, setWorkouts] = useState<{ [key: string]: WorkoutEvent }>({});
  const [loading, setLoading] = useState(true);

  const startOfWeek = currentWeek.clone().startOf('week');
  const endOfWeek = currentWeek.clone().endOf('week');

  // Fetch workouts when the week changes
  useEffect(() => {
    loadWorkoutsForWeek();
  }, [currentWeek]);

  // Initialize default schedule on first load
  useEffect(() => {
    initializeSchedule();
  }, []);

  const initializeSchedule = async () => {
    try {
      await workoutScheduleService.initializeDefaultSchedule();
    } catch (error) {
      console.error('Error initializing schedule:', error);
    }
  };

  const loadWorkoutsForWeek = async () => {
    try {
      setLoading(true);
      const weekWorkouts = await workoutScheduleService.getWorkoutsForDateRange(
        startOfWeek.toDate(),
        endOfWeek.toDate()
      );

      // Convert array to object with date keys
      const workoutsObject: { [key: string]: WorkoutEvent } = {};
      weekWorkouts.forEach(workout => {
        const dateKey = moment(workout.date).format('YYYY-MM-DD');
        workoutsObject[dateKey] = workout;
      });

      setWorkouts(workoutsObject);
    } catch (error) {
      console.error('Error loading workouts:', error);
      Alert.alert('Error', 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(currentWeek.clone().subtract(1, 'week'));
    } else {
      setCurrentWeek(currentWeek.clone().add(1, 'week'));
    }
  };

  const getDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.clone().add(i, 'days'));
    }
    return days;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    weekHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    weekNavButton: {
      padding: theme.spacing.sm,
    },
    weekRange: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 100,
    },
    dayContainer: {
      marginTop: theme.spacing.lg,
    },
    dayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    dayName: {
      ...theme.typography.subheadline,
      color: theme.colors.textSecondary,
      width: 40,
    },
    dayNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      marginLeft: theme.spacing.sm,
    },
    todayNumber: {
      backgroundColor: theme.colors.primary,
    },
    dayNumberText: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
    },
    todayNumberText: {
      color: '#FFFFFF',
    },
    todayLabel: {
      ...theme.typography.caption1,
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
      fontWeight: '600' as '600',
    },
    workoutCard: {
      marginBottom: 0,
    },
    workoutHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    workoutTypeIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    workoutInfo: {
      flex: 1,
    },
    workoutTitle: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    workoutMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    metaText: {
      ...theme.typography.footnote,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    difficultyBadge: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    difficultyText: {
      ...theme.typography.caption1,
      color: theme.colors.primary,
      fontWeight: '600' as '600',
      textTransform: 'capitalize' as 'capitalize',
    },
    workoutTime: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    timeText: {
      ...theme.typography.footnote,
      color: theme.colors.textTertiary,
      marginLeft: theme.spacing.xs,
    },
    emptyDay: {
      height: 100,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    emptyDayText: {
      ...theme.typography.footnote,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    swipeActionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: '100%',
      paddingHorizontal: theme.spacing.md,
    },
    swipeAction: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginHorizontal: theme.spacing.xs,
    },
    swipeActionRest: {
      backgroundColor: theme.colors.warning,
    },
    swipeActionMove: {
      backgroundColor: theme.colors.primary,
    },
    swipeActionText: {
      ...theme.typography.footnote,
      color: '#FFFFFF',
      fontWeight: '600' as '600',
      marginTop: theme.spacing.xs,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl,
    },
    loadingText: {
      ...theme.typography.footnote,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
    },
  });

  const renderRightActions = () => (
    <View style={styles.swipeActionContainer}>
      <TouchableOpacity style={[styles.swipeAction, styles.swipeActionRest]}>
        <Ionicons name="bed-outline" size={20} color="#FFFFFF" />
        <Text style={styles.swipeActionText}>Rest Day</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.swipeActionContainer}>
      <TouchableOpacity style={[styles.swipeAction, styles.swipeActionMove]}>
        <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
        <Text style={styles.swipeActionText}>Move</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSwipe = async (direction: 'left' | 'right', date: string) => {
    if (direction === 'right') {
      Alert.alert(
        'Move to Rest Day',
        'Would you like to make this a rest day?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Yes', 
            onPress: async () => {
              try {
                await workoutScheduleService.deleteWorkout(moment(date).toDate());
                await loadWorkoutsForWeek(); // Refresh the display
              } catch (error) {
                console.error('Error deleting workout:', error);
                Alert.alert('Error', 'Failed to remove workout');
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Move Workout',
        'Select a day to move this workout to',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Tomorrow', 
            onPress: async () => {
              try {
                const tomorrow = moment(date).add(1, 'day').toDate();
                await workoutScheduleService.moveWorkout(moment(date).toDate(), tomorrow);
                await loadWorkoutsForWeek(); // Refresh the display
              } catch (error) {
                console.error('Error moving workout:', error);
                Alert.alert('Error', 'Failed to move workout');
              }
            }
          },
          { 
            text: 'Next Available',
            onPress: async () => {
              try {
                // Find next available day without a workout
                let nextDate = moment(date).add(1, 'day');
                while (workouts[nextDate.format('YYYY-MM-DD')]) {
                  nextDate.add(1, 'day');
                }
                await workoutScheduleService.moveWorkout(moment(date).toDate(), nextDate.toDate());
                await loadWorkoutsForWeek(); // Refresh the display
              } catch (error) {
                console.error('Error moving workout:', error);
                Alert.alert('Error', 'Failed to move workout');
              }
            }
          }
        ]
      );
    }
  };

  const renderWorkoutCard = (date: string, workout: WorkoutEvent) => {
    // Get workout type icon
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

    return (
      <Swipeable
        key={date}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        onSwipeableOpen={(direction) => handleSwipe(direction as 'left' | 'right', date)}
      >
        <ModernCard
          variant="elevated"
          style={styles.workoutCard}
          onPress={() => (navigation as any).navigate('WorkoutDetail', { workout, date })}
        >
          <View style={styles.workoutHeader}>
            <View style={styles.workoutTypeIcon}>
              <Ionicons name={getWorkoutIcon() as any} size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutTitle}>{workout.title}</Text>
              <View style={styles.workoutMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.metaText}>{workout.duration} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="flame-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.metaText}>{workout.calories} cal</Text>
                </View>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                </View>
              </View>
              {workout.completed && (
                <View style={styles.metaItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={[styles.metaText, { color: theme.colors.success }]}>Completed</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.workoutTime}>
            <Ionicons name="alarm-outline" size={16} color={theme.colors.textTertiary} />
            <Text style={styles.timeText}>{workout.time}</Text>
          </View>
        </ModernCard>
      </Swipeable>
    );
  };

  const renderDay = (day: moment.Moment) => {
    const dateKey = day.format('YYYY-MM-DD');
    const isToday = day.isSame(moment(), 'day');
    const dayWorkouts = workouts[dateKey];

    return (
      <View key={dateKey} style={styles.dayContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayName}>{day.format('ddd')}</Text>
          <View style={[styles.dayNumber, isToday && styles.todayNumber]}>
            <Text style={[styles.dayNumberText, isToday && styles.todayNumberText]}>
              {day.format('D')}
            </Text>
          </View>
          {isToday && <Text style={styles.todayLabel}>TODAY</Text>}
        </View>
        
        {dayWorkouts ? (
          renderWorkoutCard(dateKey, dayWorkouts)
        ) : (
          <TouchableOpacity
            style={styles.emptyDay}
            onPress={() => (navigation as any).navigate('Discover')}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme.colors.textTertiary} />
            <Text style={styles.emptyDayText}>Add workout</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ModernHeader
          title="Your Journey"
        />

        <View style={styles.weekHeader}>
          <TouchableOpacity
            onPress={() => navigateWeek('prev')}
            style={styles.weekNavButton}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.weekRange}>
            {startOfWeek.format('MMM D')} - {endOfWeek.format('MMM D, YYYY')}
          </Text>
          
          <TouchableOpacity
            onPress={() => navigateWeek('next')}
            style={styles.weekNavButton}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading your workout schedule...</Text>
            </View>
          ) : (
            getDaysOfWeek().map(renderDay)
          )}
        </ScrollView>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ModernTimelineScreen;