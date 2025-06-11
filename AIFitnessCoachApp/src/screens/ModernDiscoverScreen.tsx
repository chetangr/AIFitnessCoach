import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { modernTheme } from '../config/modernTheme';
import {
  ModernCard,
  ModernTabs,
  ModernHeader,
} from '../components/modern/ModernComponents';

const ModernDiscoverScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('forYou');

  const activityTypes = [
    { id: 'strength', name: 'Strength', icon: 'barbell', color: '#FF6B6B' },
    { id: 'cardio', name: 'Cardio', icon: 'bicycle', color: '#4ECDC4' },
    { id: 'yoga', name: 'Yoga', icon: 'body', color: '#95E1D3' },
    { id: 'hiit', name: 'HIIT', icon: 'flash', color: '#FFD93D' },
    { id: 'core', name: 'Core', icon: 'fitness', color: '#6C5CE7' },
    { id: 'recovery', name: 'Recovery', icon: 'leaf', color: '#6BCF7F' },
  ];

  const popularExercises = [
    {
      id: '1',
      name: 'Barbell Bench Press',
      primaryMuscle: 'Chest',
      secondaryMuscles: ['Triceps', 'Shoulders'],
      difficulty: 'intermediate',
      equipment: 'Barbell',
      image: 'bench-press',
    },
    {
      id: '2',
      name: 'Deadlift',
      primaryMuscle: 'Back',
      secondaryMuscles: ['Glutes', 'Hamstrings'],
      difficulty: 'advanced',
      equipment: 'Barbell',
      image: 'deadlift',
    },
    {
      id: '3',
      name: 'Pull-ups',
      primaryMuscle: 'Back',
      secondaryMuscles: ['Biceps'],
      difficulty: 'intermediate',
      equipment: 'Pull-up Bar',
      image: 'pullups',
    },
  ];

  const featuredWorkouts = [
    {
      id: '1',
      title: 'Full Body Strength',
      duration: 45,
      difficulty: 'intermediate',
      exercises: 8,
      image: 'strength-workout',
    },
    {
      id: '2',
      title: 'HIIT Cardio Blast',
      duration: 30,
      difficulty: 'advanced',
      exercises: 6,
      image: 'hiit-workout',
    },
    {
      id: '3',
      title: 'Morning Yoga Flow',
      duration: 20,
      difficulty: 'beginner',
      exercises: 10,
      image: 'yoga-workout',
    },
  ];

  const tabs = [
    { key: 'forYou', title: 'For You' },
    { key: 'explore', title: 'Explore' },
    { key: 'library', title: 'Library' },
  ];

  const renderActivityType = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => (navigation as any).navigate('ExerciseLibrary', { category: item.id })}
    >
      <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={32} color={item.color} />
      </View>
      <Text style={styles.activityName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderExercise = (exercise: any) => (
    <ModernCard
      key={exercise.id}
      variant="elevated"
      style={styles.exerciseCard}
      onPress={() => (navigation as any).navigate('ExerciseDetail', { exerciseId: exercise.id })}
    >
      <View style={styles.exerciseContent}>
        <View style={styles.exerciseImagePlaceholder}>
          <Ionicons name="fitness" size={32} color={modernTheme.colors.textTertiary} />
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseMuscle}>{exercise.primaryMuscle}</Text>
          <View style={styles.exerciseTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exercise.equipment}</Text>
            </View>
            <View style={[styles.tag, styles.difficultyTag]}>
              <Text style={styles.tagText}>{exercise.difficulty}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={modernTheme.colors.textTertiary} />
      </View>
    </ModernCard>
  );

  const renderWorkout = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => (navigation as any).navigate('WorkoutDetail', { workoutId: item.id })}
    >
      <View style={styles.workoutImageContainer}>
        <View style={styles.workoutImagePlaceholder}>
          <Ionicons name="barbell" size={40} color={modernTheme.colors.textTertiary} />
        </View>
        <View style={styles.workoutDuration}>
          <Text style={styles.durationText}>{item.duration} min</Text>
        </View>
      </View>
      <Text style={styles.workoutTitle}>{item.title}</Text>
      <View style={styles.workoutMeta}>
        <Text style={styles.workoutMetaText}>{item.exercises} exercises</Text>
        <Text style={styles.workoutDifficulty}>{item.difficulty}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderForYouContent = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Workouts</Text>
        <FlatList
          data={featuredWorkouts}
          renderItem={renderWorkout}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Exercises</Text>
        {popularExercises.slice(0, 3).map(renderExercise)}
      </View>
    </>
  );

  const renderExploreContent = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Types</Text>
        <FlatList
          data={activityTypes}
          renderItem={renderActivityType}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.activityRow}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Exercises</Text>
        {popularExercises.map(renderExercise)}
      </View>
    </>
  );

  const renderLibraryContent = () => (
    <View style={styles.section}>
      <View style={styles.libraryStats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Saved Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>Exercises Learned</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.libraryItem}>
        <Ionicons name="bookmark" size={24} color={modernTheme.colors.primary} />
        <Text style={styles.libraryItemText}>Saved Workouts</Text>
        <Ionicons name="chevron-forward" size={20} color={modernTheme.colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.libraryItem}>
        <Ionicons name="time" size={24} color={modernTheme.colors.primary} />
        <Text style={styles.libraryItemText}>Workout History</Text>
        <Ionicons name="chevron-forward" size={20} color={modernTheme.colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.libraryItem}>
        <Ionicons name="create" size={24} color={modernTheme.colors.primary} />
        <Text style={styles.libraryItemText}>Create Custom Workout</Text>
        <Ionicons name="chevron-forward" size={20} color={modernTheme.colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader
        title="Discover"
        rightAction={
          <TouchableOpacity onPress={() => (navigation as any).navigate('Search')}>
            <Ionicons name="search" size={24} color={modernTheme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.tabContainer}>
        <ModernTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'forYou' && renderForYouContent()}
        {activeTab === 'explore' && renderExploreContent()}
        {activeTab === 'library' && renderLibraryContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background,
  },
  tabContainer: {
    paddingHorizontal: modernTheme.spacing.md,
    paddingBottom: modernTheme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: modernTheme.spacing.xxl,
  },
  section: {
    marginTop: modernTheme.spacing.lg,
    paddingHorizontal: modernTheme.spacing.md,
  },
  sectionTitle: {
    ...modernTheme.typography.title2,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.md,
  },
  horizontalList: {
    paddingRight: modernTheme.spacing.md,
  },
  activityRow: {
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.md,
  },
  activityCard: {
    width: '31%',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.md,
  },
  activityIcon: {
    width: 80,
    height: 80,
    borderRadius: modernTheme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: modernTheme.spacing.sm,
  },
  activityName: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textPrimary,
    fontWeight: '600' as '600',
  },
  exerciseCard: {
    marginBottom: modernTheme.spacing.sm,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: modernTheme.borderRadius.sm,
    backgroundColor: modernTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.xs,
  },
  exerciseMuscle: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
    marginBottom: modernTheme.spacing.sm,
  },
  exerciseTags: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: modernTheme.colors.surface,
    paddingHorizontal: modernTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: modernTheme.borderRadius.sm,
    marginRight: modernTheme.spacing.sm,
  },
  difficultyTag: {
    backgroundColor: modernTheme.colors.primary + '20',
  },
  tagText: {
    ...modernTheme.typography.caption1,
    color: modernTheme.colors.textSecondary,
    fontWeight: '500' as '500',
  },
  workoutCard: {
    width: 200,
    marginRight: modernTheme.spacing.md,
  },
  workoutImageContainer: {
    width: '100%',
    height: 140,
    borderRadius: modernTheme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: modernTheme.spacing.sm,
  },
  workoutImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: modernTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutDuration: {
    position: 'absolute',
    top: modernTheme.spacing.sm,
    right: modernTheme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: modernTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: modernTheme.borderRadius.sm,
  },
  durationText: {
    ...modernTheme.typography.caption1,
    color: '#FFFFFF',
    fontWeight: '600' as '600',
  },
  workoutTitle: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.xs,
  },
  workoutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutMetaText: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
  },
  workoutDifficulty: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.primary,
    fontWeight: '600' as '600',
    textTransform: 'capitalize' as 'capitalize',
  },
  libraryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: modernTheme.colors.surface,
    padding: modernTheme.spacing.lg,
    borderRadius: modernTheme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: modernTheme.spacing.xs,
  },
  statNumber: {
    ...modernTheme.typography.largeTitle,
    color: modernTheme.colors.primary,
    marginBottom: modernTheme.spacing.xs,
  },
  statLabel: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
    textAlign: 'center',
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: modernTheme.spacing.md,
    paddingHorizontal: modernTheme.spacing.md,
    backgroundColor: modernTheme.colors.cardBackground,
    borderRadius: modernTheme.borderRadius.md,
    marginBottom: modernTheme.spacing.sm,
    ...modernTheme.shadows.sm,
  },
  libraryItemText: {
    ...modernTheme.typography.body,
    color: modernTheme.colors.textPrimary,
    flex: 1,
    marginLeft: modernTheme.spacing.md,
  },
});

export default ModernDiscoverScreen;