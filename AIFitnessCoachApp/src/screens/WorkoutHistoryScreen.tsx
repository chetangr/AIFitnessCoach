import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SectionList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { 
  LiquidGlassView, 
  LiquidButton, 
  LiquidCard,
  LiquidEmptyState,
  LiquidLoading,
  showLiquidAlert
} from '../components/glass';

const { width } = Dimensions.get('window');

interface LiquidWorkoutHistoryScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

interface WorkoutSession {
  id: string;
  workoutName: string;
  date: string;
  duration: number;
  exercises: number;
  volume: number;
  caloriesBurned: number;
}

interface WorkoutSection {
  title: string;
  data: WorkoutSession[];
}

const LiquidWorkoutHistoryScreen: React.FC<LiquidWorkoutHistoryScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [workoutSections, setWorkoutSections] = useState<WorkoutSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const { theme } = useThemeStore();
  const { colors } = theme;

  // Mock data
  const mockWorkouts: WorkoutSession[] = [
    {
      id: '1',
      workoutName: 'Upper Body Strength',
      date: new Date().toISOString(),
      duration: 45,
      exercises: 6,
      volume: 12500,
      caloriesBurned: 320,
    },
    {
      id: '2',
      workoutName: 'Leg Day',
      date: new Date(Date.now() - 86400000).toISOString(),
      duration: 60,
      exercises: 8,
      volume: 18000,
      caloriesBurned: 450,
    },
    {
      id: '3',
      workoutName: 'Full Body Circuit',
      date: new Date(Date.now() - 172800000).toISOString(),
      duration: 40,
      exercises: 10,
      volume: 8000,
      caloriesBurned: 380,
    },
  ];

  useEffect(() => {
    loadWorkoutHistory();
  }, [selectedPeriod]);

  const loadWorkoutHistory = async () => {
    setIsLoading(true);
    try {
      // Group workouts by date
      const sections = groupWorkoutsByDate(mockWorkouts);
      setWorkoutSections(sections);
    } catch (error) {
      console.error('Error loading workout history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupWorkoutsByDate = (workouts: WorkoutSession[]): WorkoutSection[] => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const thisWeek = new Date(Date.now() - 7 * 86400000);
    
    const sections: WorkoutSection[] = [];
    const todayWorkouts: WorkoutSession[] = [];
    const yesterdayWorkouts: WorkoutSession[] = [];
    const thisWeekWorkouts: WorkoutSession[] = [];
    const olderWorkouts: WorkoutSession[] = [];

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      if (workoutDate.toDateString() === today.toDateString()) {
        todayWorkouts.push(workout);
      } else if (workoutDate.toDateString() === yesterday.toDateString()) {
        yesterdayWorkouts.push(workout);
      } else if (workoutDate > thisWeek) {
        thisWeekWorkouts.push(workout);
      } else {
        olderWorkouts.push(workout);
      }
    });

    if (todayWorkouts.length > 0) {
      sections.push({ title: 'Today', data: todayWorkouts });
    }
    if (yesterdayWorkouts.length > 0) {
      sections.push({ title: 'Yesterday', data: yesterdayWorkouts });
    }
    if (thisWeekWorkouts.length > 0) {
      sections.push({ title: 'This Week', data: thisWeekWorkouts });
    }
    if (olderWorkouts.length > 0) {
      sections.push({ title: 'Older', data: olderWorkouts });
    }

    return sections;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkoutHistory();
    setRefreshing(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatVolume = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)}t`;
    }
    return `${kg}kg`;
  };

  const renderWorkoutSession = ({ item }: { item: WorkoutSession }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('WorkoutDetail', { sessionId: item.id })}
      activeOpacity={0.8}
    >
      <LiquidCard style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <View>
            <Text style={styles.workoutName}>{item.workoutName}</Text>
            <Text style={styles.workoutDate}>
              {new Date(item.date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#8E8E93" />
        </View>

        <View style={styles.workoutStats}>
          <View style={styles.stat}>
            <Icon name="time-outline" size={16} color="#007AFF" />
            <Text style={styles.statValue}>{formatDuration(item.duration)}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="list-outline" size={16} color="#4CD964" />
            <Text style={styles.statValue}>{item.exercises}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="barbell-outline" size={16} color="#FF9500" />
            <Text style={styles.statValue}>{formatVolume(item.volume)}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="flame-outline" size={16} color="#FF3B30" />
            <Text style={styles.statValue}>{item.caloriesBurned}</Text>
          </View>
        </View>
      </LiquidCard>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: WorkoutSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length} workouts</Text>
    </View>
  );

  const getStats = () => {
    const totalWorkouts = mockWorkouts.length;
    const totalDuration = mockWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const totalVolume = mockWorkouts.reduce((sum, w) => sum + w.volume, 0);
    const totalCalories = mockWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

    return {
      workouts: totalWorkouts,
      duration: totalDuration,
      volume: totalVolume,
      calories: totalCalories,
    };
  };

  if (isLoading) {
    return <LiquidLoading message="Loading workout history..." />;
  }

  const stats = getStats();

  return (
    <LiquidGlassView style={styles.container} intensity={95}>
      {/* Header */}
      <LiquidGlassView style={styles.header} intensity={90}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Workout History</Text>
        <TouchableOpacity
          onPress={() => showLiquidAlert('Export Successful', 'Your workout history has been exported successfully.')}
          style={styles.exportButton}
        >
          <Icon name="download-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </LiquidGlassView>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year'] as const).map(period => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedPeriod(period)}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
          >
            <LiquidGlassView 
              style={styles.periodGlass}
              intensity={selectedPeriod === period ? 90 : 70}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </LiquidGlassView>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Summary */}
      <LiquidCard style={styles.statsCard}>
        <Text style={styles.statsTitle}>
          {selectedPeriod === 'week' ? 'This Week' : 
           selectedPeriod === 'month' ? 'This Month' : 'This Year'}
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>{stats.workouts}</Text>
            <Text style={styles.statItemLabel}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>{formatDuration(stats.duration)}</Text>
            <Text style={styles.statItemLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>{formatVolume(stats.volume)}</Text>
            <Text style={styles.statItemLabel}>Volume</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>{stats.calories}</Text>
            <Text style={styles.statItemLabel}>Calories</Text>
          </View>
        </View>
      </LiquidCard>

      {/* Workout List */}
      {workoutSections.length === 0 ? (
        <LiquidEmptyState
          icon="barbell-outline"
          title="No Workouts Yet"
          message="Start tracking your workouts to see them here"
        />
      ) : (
        <SectionList
          sections={workoutSections}
          renderItem={renderWorkoutSession}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFF"
            />
          }
        />
      )}
    </LiquidGlassView>
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
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  exportButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  periodButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  periodButtonActive: {
    transform: [{ scale: 1.02 }],
  },
  periodGlass: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodText: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  statsCard: {
    margin: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statItemValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  statItemLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  sectionCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  workoutCard: {
    marginBottom: 12,
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  workoutDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default LiquidWorkoutHistoryScreen;