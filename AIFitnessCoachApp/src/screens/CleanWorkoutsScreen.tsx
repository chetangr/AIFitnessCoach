import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import { VisionGlass } from '../components/spatial/VisionGlass';
import { ProgressOrb } from '../components/spatial/ProgressOrb';
import { spatialHaptics } from '../services/spatialHaptics';
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface Workout {
  id: string;
  name: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  exercises: number;
  progress?: number;
  isScheduled?: boolean;
}

const CleanWorkoutsScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const scrollY = useSharedValue(0);

  const categories = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga'];
  
  const workouts: Workout[] = [
    {
      id: '1',
      name: 'Upper Body Blast',
      duration: '45 min',
      difficulty: 'Intermediate',
      category: 'Strength',
      exercises: 8,
      progress: 0.75,
      isScheduled: true,
    },
    {
      id: '2',
      name: 'Morning Cardio',
      duration: '30 min',
      difficulty: 'Beginner',
      category: 'Cardio',
      exercises: 6,
      progress: 0.3,
    },
    {
      id: '3',
      name: 'Full Body HIIT',
      duration: '35 min',
      difficulty: 'Advanced',
      category: 'HIIT',
      exercises: 10,
      progress: 0.9,
    },
    {
      id: '4',
      name: 'Power Yoga Flow',
      duration: '60 min',
      difficulty: 'Intermediate',
      category: 'Yoga',
      exercises: 15,
      progress: 0.5,
    },
  ];

  const filteredWorkouts = workouts.filter(workout => 
    selectedCategory === 'All' || workout.category === selectedCategory
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 150],
          [0, -100],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        ),
      },
    ],
    opacity: interpolate(
      scrollY.value,
      [0, 150],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    ),
  }));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#667eea';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Strength': 'barbell-outline',
      'Cardio': 'heart-outline',
      'HIIT': 'flash-outline',
      'Yoga': 'leaf-outline',
    };
    return icons[category] || 'fitness-outline';
  };

  const handleWorkoutPress = (workout: Workout) => {
    spatialHaptics.floatingElementTouch();
    navigation.navigate('ActiveWorkout', { workout });
  };

  const handleCategoryPress = (category: string) => {
    spatialHaptics.spatialNavigation();
    setSelectedCategory(category);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <VisionGlass variant="light" depth={0} floating style={styles.headerGlass}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Workouts</Text>
            <Text style={styles.headerSubtitle}>Ready to get stronger?</Text>
          </View>
        </VisionGlass>
      </Animated.View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => handleCategoryPress(category)}
              style={styles.categoryButton}
            >
              <VisionGlass
                variant={selectedCategory === category ? "thick" : "ultraThin"}
                depth={selectedCategory === category ? 1 : 0}
                interactive
                style={styles.categoryGlass}
              >
                <View style={styles.categoryContent}>
                  <Icon 
                    name={getCategoryIcon(category)} 
                    size={16} 
                    color={selectedCategory === category ? 'white' : 'rgba(255,255,255,0.7)'} 
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive
                  ]}>
                    {category}
                  </Text>
                </View>
              </VisionGlass>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Workouts List */}
      <AnimatedScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredWorkouts.map((workout, index) => (
          <TouchableOpacity
            key={workout.id}
            onPress={() => handleWorkoutPress(workout)}
            style={[styles.workoutItem, { marginTop: index === 0 ? 0 : 20 }]}
            activeOpacity={0.8}
          >
            <VisionGlass
              variant="light"
              depth={1}
              interactive
              floating
              style={styles.workoutCard}
            >
              <View style={styles.workoutContent}>
                {/* Header Row */}
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutTitleContainer}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutMeta}>
                      {workout.duration} • {workout.exercises} exercises
                    </Text>
                  </View>
                  
                  {/* Scheduled indicator */}
                  {workout.isScheduled && (
                    <View style={styles.scheduledBadge}>
                      <Icon name="time-outline" size={12} color="white" />
                      <Text style={styles.scheduledText}>Today</Text>
                    </View>
                  )}
                </View>

                {/* Details Row */}
                <View style={styles.workoutDetails}>
                  {/* Category & Difficulty */}
                  <View style={styles.badgesContainer}>
                    <View style={styles.categoryBadge}>
                      <Icon 
                        name={getCategoryIcon(workout.category)} 
                        size={12} 
                        color="rgba(255,255,255,0.8)" 
                      />
                      <Text style={styles.badgeText}>{workout.category}</Text>
                    </View>
                    
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(workout.difficulty) }
                    ]}>
                      <Text style={styles.badgeText}>{workout.difficulty}</Text>
                    </View>
                  </View>

                  {/* Progress Orb */}
                  {workout.progress !== undefined && (
                    <ProgressOrb
                      progress={workout.progress}
                      title=""
                      color={[getDifficultyColor(workout.difficulty), getDifficultyColor(workout.difficulty)]}
                      size={40}
                      animated
                    />
                  )}
                </View>
              </View>
            </VisionGlass>
          </TouchableOpacity>
        ))}

        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: Platform.OS === 'ios' ? 90 : 80 }} />
      </AnimatedScrollView>

      {/* Quick Action Button */}
      <View style={styles.quickActionContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('QuickWorkout')}
          style={styles.quickActionButton}
        >
          <VisionGlass variant="thick" depth={2} floating style={styles.quickActionGlass}>
            <Icon name="flash-outline" size={24} color="white" />
            <Text style={styles.quickActionText}>Quick Start</Text>
          </VisionGlass>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerGlass: {
    padding: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  categoriesContainer: {
    paddingVertical: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    marginRight: 12,
  },
  categoryGlass: {
    borderRadius: 16,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  categoryTextActive: {
    color: 'white',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  workoutItem: {
    // Empty - styling handled by VisionGlass
  },
  workoutCard: {
    padding: 20,
  },
  workoutContent: {
    // Empty - children handle their own layout
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workoutTitleContainer: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  scheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102,126,234,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scheduledText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  quickActionContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 110 : 100, // Position above tab bar
    right: 20,
  },
  quickActionButton: {
    // Styling handled by VisionGlass
  },
  quickActionGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CleanWorkoutsScreen;