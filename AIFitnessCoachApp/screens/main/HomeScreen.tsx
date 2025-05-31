import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '@/navigation/AppNavigator';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassContainer } from '@/components/glass/GlassContainer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<MainTabParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { workouts, fetchWorkouts, isLoading } = useWorkoutStore();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const todayWorkout = workouts.find(w => 
    w.scheduledFor && moment(w.scheduledFor).isSame(moment(), 'day')
  );

  const weeklyStats = {
    workoutsCompleted: workouts.filter(w => w.isCompleted).length,
    totalWorkouts: workouts.length,
    caloriesBurned: workouts.reduce((acc, w) => acc + (w.metadata?.caloriesBurned || 0), 0),
    minutesTrained: workouts.reduce((acc, w) => acc + (w.isCompleted ? w.durationMinutes : 0), 0),
  };

  const quickActions = [
    {
      id: '1',
      title: 'Start Workout',
      icon: 'play-circle',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('Workouts'),
    },
    {
      id: '2',
      title: 'Exercise Library',
      icon: 'book-open',
      color: theme.colors.success,
      onPress: () => {}, // Will navigate to exercise library
    },
    {
      id: '3',
      title: 'AI Coach',
      icon: 'robot',
      color: theme.colors.info,
      onPress: () => navigation.navigate('Messages'),
    },
    {
      id: '4',
      title: 'Progress',
      icon: 'chart-line',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return (
    <LinearGradient
      colors={theme.colors.background === '#FFFFFF' 
        ? ['#F9FAFB', '#F3F4F6', '#E5E7EB']
        : ['#0F172A', '#1E293B', '#334155']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
                Good {moment().format('A') === 'AM' ? 'Morning' : 'Evening'},
              </Text>
              <Text style={[styles.name, { color: theme.colors.text }]}>
                {user?.firstName || 'Athlete'}! 💪
              </Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <GlassContainer style={styles.notificationContainer}>
                <Icon name="bell-outline" size={24} color={theme.colors.text} />
              </GlassContainer>
            </TouchableOpacity>
          </View>

          {/* Today's Workout Card */}
          {todayWorkout && (
            <GlassCard
              style={styles.todayWorkoutCard}
              title="Today's Workout"
              subtitle={`${todayWorkout.durationMinutes} min • ${todayWorkout.difficulty}`}
              icon="calendar-today"
              iconColor={theme.colors.primary}
              onPress={() => navigation.navigate('Workouts')}
            >
              <Text style={[styles.workoutName, { color: theme.colors.text }]}>
                {todayWorkout.name}
              </Text>
              <View style={styles.muscleGroups}>
                {todayWorkout.muscleGroups.slice(0, 3).map((muscle, index) => (
                  <View key={index} style={[styles.muscleBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={[styles.muscleText, { color: theme.colors.primary }]}>
                      {muscle}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.startButtonText}>Start Now</Text>
                <Icon name="arrow-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </GlassCard>
          )}

          {/* Weekly Stats */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            This Week's Progress
          </Text>
          <View style={styles.statsGrid}>
            <GlassContainer style={styles.statCard}>
              <Icon name="check-circle" size={32} color={theme.colors.success} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {weeklyStats.workoutsCompleted}/{weeklyStats.totalWorkouts}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Workouts
              </Text>
            </GlassContainer>

            <GlassContainer style={styles.statCard}>
              <Icon name="fire" size={32} color={theme.colors.warning} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {weeklyStats.caloriesBurned}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Calories
              </Text>
            </GlassContainer>

            <GlassContainer style={styles.statCard}>
              <Icon name="clock-outline" size={32} color={theme.colors.info} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {weeklyStats.minutesTrained}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Minutes
              </Text>
            </GlassContainer>

            <GlassContainer style={styles.statCard}>
              <Icon name="lightning-bolt" size={32} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {user?.currentStreak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Day Streak
              </Text>
            </GlassContainer>
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={action.onPress}
              >
                <GlassContainer style={styles.quickActionContent}>
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                    <Icon name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
                    {action.title}
                  </Text>
                </GlassContainer>
              </TouchableOpacity>
            ))}
          </View>

          {/* Motivational Quote */}
          <GlassCard
            style={styles.quoteCard}
            icon="format-quote-open"
            iconColor={theme.colors.secondary}
          >
            <Text style={[styles.quoteText, { color: theme.colors.text }]}>
              "The only bad workout is the one that didn't happen."
            </Text>
            <Text style={[styles.quoteAuthor, { color: theme.colors.textSecondary }]}>
              - Your AI Coach
            </Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 4,
  },
  notificationContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayWorkoutCard: {
    marginBottom: 24,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  muscleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  muscleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  quickActionButton: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  quickActionContent: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quoteCard: {
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    textAlign: 'right',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});