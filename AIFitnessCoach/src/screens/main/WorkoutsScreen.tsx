import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import HapticFeedback from 'react-native-haptic-feedback';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useWorkoutStore } from '@/store/workoutStore';
import { useThemeStore } from '@/store/themeStore';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { GlassCard } from '@/components/glass/GlassCard';
import { WorkoutPlan } from '@/types/models';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

interface DaySection {
  date: Date;
  dayName: string;
  workouts: WorkoutPlan[];
  isToday: boolean;
  isPast: boolean;
}

export const WorkoutsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { workouts, fetchWorkouts, moveWorkout, isLoading } = useWorkoutStore();
  const { theme } = useThemeStore();
  
  const [weekSections, setWeekSections] = useState<DaySection[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [draggedWorkoutId, setDraggedWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    // Organize workouts by day
    const startOfWeek = moment().startOf('week');
    const sections: DaySection[] = [];

    for (let i = 0; i < 7; i++) {
      const date = moment(startOfWeek).add(i, 'days');
      const dayWorkouts = workouts.filter((w) =>
        w.scheduledFor && moment(w.scheduledFor).isSame(date, 'day')
      );

      sections.push({
        date: date.toDate(),
        dayName: date.format('dddd'),
        workouts: dayWorkouts,
        isToday: date.isSame(moment(), 'day'),
        isPast: date.isBefore(moment(), 'day'),
      });
    }

    setWeekSections(sections);
  }, [workouts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWorkouts();
    setRefreshing(false);
  }, []);

  const handleWorkoutPress = (workout: WorkoutPlan) => {
    navigation.navigate('ActiveWorkout', { workoutId: workout.id });
  };

  const handleDragEnd = async (data: WorkoutPlan[], from: number, to: number) => {
    if (from !== to && draggedWorkoutId) {
      const targetSection = weekSections[to];
      await moveWorkout(draggedWorkoutId, targetSection.date);
    }
    setDraggedWorkoutId(null);
  };

  const renderWorkoutCard = ({ item, drag, isActive }: RenderItemParams<WorkoutPlan>) => {
    const isCompleted = item.isCompleted;
    const isMoved = item.originalScheduledDate && !moment(item.scheduledFor).isSame(item.originalScheduledDate, 'day');

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={() => {
            HapticFeedback.trigger('impactMedium');
            setDraggedWorkoutId(item.id);
            drag();
          }}
          onPress={() => handleWorkoutPress(item)}
          disabled={isActive}
          activeOpacity={0.8}
        >
          <GlassCard
            style={[
              styles.workoutCard,
              isActive && styles.draggingCard,
              isCompleted && styles.completedCard,
            ]}
            title={item.name}
            subtitle={`${item.durationMinutes} min • ${item.difficulty}`}
            icon={isCompleted ? 'check-circle' : 'dumbbell'}
            iconColor={isCompleted ? theme.colors.success : theme.colors.primary}
            rightElement={
              isMoved && (
                <View style={styles.movedBadge}>
                  <Text style={styles.movedText}>MOVED</Text>
                </View>
              )
            }
          >
            <View style={styles.workoutDetails}>
              <View style={styles.muscleGroups}>
                {item.muscleGroups.slice(0, 3).map((muscle, index) => (
                  <View key={index} style={[styles.muscleBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={[styles.muscleText, { color: theme.colors.primary }]}>
                      {muscle}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.exerciseCount, { color: theme.colors.textSecondary }]}>
                {item.exercises.length} exercises
              </Text>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const renderDaySection = (section: DaySection, index: number) => {
    const isEmpty = section.workouts.length === 0;
    const canDrop = draggedWorkoutId !== null && !section.isPast;

    return (
      <View key={section.date.toISOString()} style={styles.daySection}>
        <View style={styles.dayHeader}>
          <Text style={[
            styles.dayName,
            { color: section.isToday ? theme.colors.primary : theme.colors.text }
          ]}>
            {section.dayName}
          </Text>
          <Text style={[styles.dayDate, { color: theme.colors.textSecondary }]}>
            {moment(section.date).format('MMM D')}
          </Text>
          {section.isToday && (
            <View style={[styles.todayBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.todayText}>TODAY</Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.dayContent,
            canDrop && styles.dropZone,
            isEmpty && styles.emptyDay,
          ]}
        >
          {isEmpty ? (
            <GlassContainer style={styles.emptyContainer}>
              <Icon name="calendar-blank" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {section.isPast ? 'No workout scheduled' : 'Drop workout here'}
              </Text>
            </GlassContainer>
          ) : (
            <DraggableFlatList
              data={section.workouts}
              renderItem={renderWorkoutCard}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data, from, to }) => handleDragEnd(data, from, to)}
              scrollEnabled={false}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={theme.colors.background === '#FFFFFF' 
        ? ['#F9FAFB', '#F3F4F6']
        : ['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Weekly Schedule
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ExerciseLibrary')}
          >
            <Icon name="plus" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          <GlassCard
            style={styles.statsCard}
            icon="chart-line"
            title="This Week"
            subtitle="Keep up the great work!"
          >
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {workouts.filter(w => w.isCompleted).length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Completed
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                  {workouts.filter(w => !w.isCompleted).length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Remaining
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.colors.success }]}>
                  {workouts.reduce((acc, w) => acc + (w.isCompleted ? w.durationMinutes : 0), 0)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Minutes
                </Text>
              </View>
            </View>
          </GlassCard>

          {weekSections.map((section, index) => renderDaySection(section, index))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  statsCard: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  dayDate: {
    fontSize: 14,
  },
  todayBadge: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  dayContent: {
    minHeight: 80,
  },
  dropZone: {
    borderWidth: 2,
    borderColor: 'rgba(79, 70, 229, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 8,
  },
  emptyDay: {
    // Empty day styling
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  workoutCard: {
    marginBottom: 12,
  },
  draggingCard: {
    opacity: 0.8,
    transform: [{ scale: 1.05 }],
  },
  completedCard: {
    opacity: 0.7,
  },
  workoutDetails: {
    marginTop: 8,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  muscleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  muscleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  exerciseCount: {
    fontSize: 12,
  },
  movedBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  movedText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '600',
  },
});