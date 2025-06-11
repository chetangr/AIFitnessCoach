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
import { useTheme } from '../contexts/ThemeContext';
import {
  ModernCard,
  ModernHeader,
} from '../components/modern/ModernComponents';

const ModernDiscoverScreen = () => {
  const { theme } = useTheme();
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    tabContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
    },
    section: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
    },
    sectionTitle: {
      ...theme.typography.title2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    horizontalList: {
      paddingRight: theme.spacing.md,
    },
    activityRow: {
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    activityCard: {
      width: '31%',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    activityIcon: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    activityName: {
      ...theme.typography.footnote,
      color: theme.colors.textPrimary,
      fontWeight: '600' as '600',
    },
    exerciseCard: {
      marginBottom: theme.spacing.sm,
    },
    exerciseContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    exerciseImagePlaceholder: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    exerciseMuscle: {
      ...theme.typography.footnote,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    exerciseTags: {
      flexDirection: 'row',
    },
    tag: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm,
    },
    difficultyTag: {
      backgroundColor: theme.colors.primary + '20',
    },
    tagText: {
      ...theme.typography.caption1,
      color: theme.colors.textSecondary,
      fontWeight: '500' as '500',
    },
    workoutCard: {
      width: 200,
      marginRight: theme.spacing.md,
    },
    workoutImageContainer: {
      width: '100%',
      height: 140,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      marginBottom: theme.spacing.sm,
    },
    workoutImagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    workoutDuration: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    durationText: {
      ...theme.typography.caption1,
      color: '#FFFFFF',
      fontWeight: '600' as '600',
    },
    workoutTitle: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    workoutMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    workoutMetaText: {
      ...theme.typography.footnote,
      color: theme.colors.textSecondary,
    },
    workoutDifficulty: {
      ...theme.typography.footnote,
      color: theme.colors.primary,
      fontWeight: '600' as '600',
      textTransform: 'capitalize' as 'capitalize',
    },
    libraryStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginHorizontal: theme.spacing.xs,
    },
    statNumber: {
      ...theme.typography.largeTitle,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      ...theme.typography.footnote,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    libraryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    libraryItemText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      ...theme.typography.callout,
      color: theme.colors.textSecondary,
      fontWeight: '600' as '600',
    },
    tabTextActive: {
      color: '#FFFFFF',
    },
  });

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
          <Ionicons name="fitness" size={32} color={theme.colors.textTertiary} />
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
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
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
          <Ionicons name="barbell" size={40} color={theme.colors.textTertiary} />
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
        <Ionicons name="bookmark" size={24} color={theme.colors.primary} />
        <Text style={styles.libraryItemText}>Saved Workouts</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.libraryItem}>
        <Ionicons name="time" size={24} color={theme.colors.primary} />
        <Text style={styles.libraryItemText}>Workout History</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.libraryItem}>
        <Ionicons name="create" size={24} color={theme.colors.primary} />
        <Text style={styles.libraryItemText}>Create Custom Workout</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader
        title="Discover"
        rightAction={
          <TouchableOpacity onPress={() => (navigation as any).navigate('Search')}>
            <Ionicons name="search" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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

export default ModernDiscoverScreen;