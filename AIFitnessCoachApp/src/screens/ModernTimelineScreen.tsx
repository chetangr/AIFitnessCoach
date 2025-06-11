import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { modernTheme } from '../config/modernTheme';
import {
  ModernCard,
  ModernButton,
  ModernHeader,
  ModernContainer,
} from '../components/modern/ModernComponents';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const ModernTimelineScreen = () => {
  const navigation = useNavigation();
  const [currentWeek, setCurrentWeek] = useState(moment());

  const startOfWeek = currentWeek.clone().startOf('week');
  const endOfWeek = currentWeek.clone().endOf('week');

  const workouts = {
    [moment().add(1, 'day').format('YYYY-MM-DD')]: {
      title: 'Chest & Triceps Power',
      duration: 45,
      calories: 350,
      difficulty: 'intermediate',
      type: 'strength',
      time: '7:00 AM',
    },
    [moment().format('YYYY-MM-DD')]: {
      title: 'Shoulders & Core',
      duration: 35,
      calories: 280,
      difficulty: 'intermediate',
      type: 'strength',
      time: '6:30 AM',
    },
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

  const handleSwipe = (direction: 'left' | 'right', workout: any, date: string) => {
    if (direction === 'right') {
      Alert.alert(
        'Move to Rest Day',
        'Would you like to make this a rest day?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: () => console.log('Moved to rest day') }
        ]
      );
    } else {
      Alert.alert(
        'Move Workout',
        'Select a day to move this workout to',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Tomorrow', onPress: () => console.log('Moved to tomorrow') },
          { text: 'Next Available', onPress: () => console.log('Moved to next available') }
        ]
      );
    }
  };

  const renderWorkoutCard = (date: string, workout: any) => (
    <Swipeable
      key={date}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableOpen={(direction) => handleSwipe(direction as 'left' | 'right', workout, date)}
    >
      <ModernCard
        variant="elevated"
        style={styles.workoutCard}
        onPress={() => navigation.navigate('WorkoutDetail' as never)}
      >
        <View style={styles.workoutHeader}>
          <View style={styles.workoutTypeIcon}>
            <Ionicons name="barbell" size={24} color={modernTheme.colors.primary} />
          </View>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutTitle}>{workout.title}</Text>
            <View style={styles.workoutMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={modernTheme.colors.textSecondary} />
                <Text style={styles.metaText}>{workout.duration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={16} color={modernTheme.colors.textSecondary} />
                <Text style={styles.metaText}>{workout.calories} cal</Text>
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{workout.difficulty}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.workoutTime}>
          <Ionicons name="alarm-outline" size={16} color={modernTheme.colors.textTertiary} />
          <Text style={styles.timeText}>{workout.time}</Text>
        </View>
      </ModernCard>
    </Swipeable>
  );

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
            onPress={() => navigation.navigate('Discover' as never)}
          >
            <Ionicons name="add-circle-outline" size={24} color={modernTheme.colors.textTertiary} />
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
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('Calendar' as never)}>
            <Ionicons name="calendar-outline" size={24} color={modernTheme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.weekHeader}>
        <TouchableOpacity
          onPress={() => navigateWeek('prev')}
          style={styles.weekNavButton}
        >
          <Ionicons name="chevron-back" size={24} color={modernTheme.colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.weekRange}>
          {startOfWeek.format('MMM D')} - {endOfWeek.format('MMM D, YYYY')}
        </Text>
        
        <TouchableOpacity
          onPress={() => navigateWeek('next')}
          style={styles.weekNavButton}
        >
          <Ionicons name="chevron-forward" size={24} color={modernTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {getDaysOfWeek().map(renderDay)}
      </ScrollView>

    </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: modernTheme.spacing.md,
    paddingVertical: modernTheme.spacing.md,
    backgroundColor: modernTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.border,
  },
  weekNavButton: {
    padding: modernTheme.spacing.sm,
  },
  weekRange: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: modernTheme.spacing.md,
    paddingBottom: 100,
  },
  dayContainer: {
    marginTop: modernTheme.spacing.lg,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.sm,
  },
  dayName: {
    ...modernTheme.typography.subheadline,
    color: modernTheme.colors.textSecondary,
    width: 40,
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: modernTheme.colors.surface,
    marginLeft: modernTheme.spacing.sm,
  },
  todayNumber: {
    backgroundColor: modernTheme.colors.primary,
  },
  dayNumberText: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
  },
  todayNumberText: {
    color: '#FFFFFF',
  },
  todayLabel: {
    ...modernTheme.typography.caption1,
    color: modernTheme.colors.primary,
    marginLeft: modernTheme.spacing.sm,
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
    backgroundColor: modernTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.xs,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: modernTheme.spacing.md,
  },
  metaText: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
    marginLeft: modernTheme.spacing.xs,
  },
  difficultyBadge: {
    backgroundColor: modernTheme.colors.surface,
    paddingHorizontal: modernTheme.spacing.sm,
    paddingVertical: 2,
    borderRadius: modernTheme.borderRadius.sm,
  },
  difficultyText: {
    ...modernTheme.typography.caption1,
    color: modernTheme.colors.primary,
    fontWeight: '600' as '600',
    textTransform: 'capitalize' as 'capitalize',
  },
  workoutTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: modernTheme.spacing.sm,
    paddingTop: modernTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.border,
  },
  timeText: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textTertiary,
    marginLeft: modernTheme.spacing.xs,
  },
  emptyDay: {
    height: 100,
    borderRadius: modernTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: modernTheme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: modernTheme.colors.surface,
  },
  emptyDayText: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textTertiary,
    marginTop: modernTheme.spacing.xs,
  },
  swipeActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingHorizontal: modernTheme.spacing.md,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: modernTheme.spacing.lg,
    paddingVertical: modernTheme.spacing.md,
    borderRadius: modernTheme.borderRadius.md,
    marginHorizontal: modernTheme.spacing.xs,
  },
  swipeActionRest: {
    backgroundColor: modernTheme.colors.warning,
  },
  swipeActionMove: {
    backgroundColor: modernTheme.colors.primary,
  },
  swipeActionText: {
    ...modernTheme.typography.footnote,
    color: '#FFFFFF',
    fontWeight: '600' as '600',
    marginTop: modernTheme.spacing.xs,
  },
});

export default ModernTimelineScreen;