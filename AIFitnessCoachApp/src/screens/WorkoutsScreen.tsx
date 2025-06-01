import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
// Logger temporarily removed - was causing import errors

const { width } = Dimensions.get('window');

interface Workout {
  id: string;
  name: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  exercises: number;
  equipment: string[];
  scheduled?: string;
}

const WorkoutsScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Flexibility'];
  
  const workouts: Workout[] = [
    {
      id: '1',
      name: 'Upper Body Blast',
      duration: '45 min',
      difficulty: 'Intermediate',
      category: 'Strength',
      exercises: 8,
      equipment: ['Dumbbells', 'Bench'],
      scheduled: 'Today',
    },
    {
      id: '2',
      name: 'Morning Cardio Burn',
      duration: '30 min',
      difficulty: 'Beginner',
      category: 'Cardio',
      exercises: 6,
      equipment: ['None'],
      scheduled: 'Tomorrow',
    },
    {
      id: '3',
      name: 'Full Body HIIT',
      duration: '35 min',
      difficulty: 'Advanced',
      category: 'HIIT',
      exercises: 10,
      equipment: ['Kettlebell'],
    },
    {
      id: '4',
      name: 'Power Yoga Flow',
      duration: '60 min',
      difficulty: 'Intermediate',
      category: 'Yoga',
      exercises: 15,
      equipment: ['Yoga Mat'],
    },
    {
      id: '5',
      name: 'Leg Day Destroyer',
      duration: '50 min',
      difficulty: 'Advanced',
      category: 'Strength',
      exercises: 9,
      equipment: ['Barbell', 'Squat Rack'],
    },
    {
      id: '6',
      name: 'Core & Abs Focus',
      duration: '25 min',
      difficulty: 'Intermediate',
      category: 'Strength',
      exercises: 12,
      equipment: ['Mat'],
    },
    {
      id: '7',
      name: 'Flexibility & Mobility',
      duration: '40 min',
      difficulty: 'Beginner',
      category: 'Flexibility',
      exercises: 20,
      equipment: ['Foam Roller', 'Resistance Band'],
    },
    {
      id: '8',
      name: 'Boxing Cardio',
      duration: '45 min',
      difficulty: 'Intermediate',
      category: 'Cardio',
      exercises: 8,
      equipment: ['Boxing Gloves', 'Heavy Bag'],
    },
  ];

  const filteredWorkouts = selectedCategory === 'All' 
    ? workouts 
    : workouts.filter(w => w.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#667eea';
    }
  };

  const handleWorkoutPress = (workout: Workout) => {
    console.log('Workout Selected', workout);
    navigation.navigate('ActiveWorkout', { workout });
  };

  const weekDays = [
    { name: 'Mon', isRest: false },
    { name: 'Tue', isRest: false },
    { name: 'Wed', isRest: false },
    { name: 'Thu', isRest: false },
    { name: 'Fri', isRest: false },
    { name: 'Sat', isRest: true },  // Active recovery
    { name: 'Sun', isRest: true }   // Full rest
  ];
  const currentDay = new Date().getDay();

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Workouts</Text>
        <TouchableOpacity>
          <Icon name="add-circle" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Week Calendar */}
      <View style={styles.weekCalendar}>
        {weekDays.map((day, index) => {
          const isToday = (index + 1) % 7 === currentDay;
          return (
            <TouchableOpacity key={day.name}>
              <BlurView
                intensity={isToday ? 40 : 20}
                tint="light"
                style={[
                  styles.dayCard, 
                  isToday && styles.todayCard,
                  day.isRest && styles.restDayCard
                ]}
              >
                <Text style={[
                  styles.dayText,
                  day.isRest && styles.restDayText
                ]}>
                  {day.name}
                </Text>
                {day.isRest && (
                  <Icon name="bed-outline" size={12} color="rgba(255,255,255,0.6)" />
                )}
                {isToday && <View style={styles.todayDot} />}
              </BlurView>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => {
              setSelectedCategory(category);
              console.log('Category Selected', { category });
            }}
          >
            <BlurView
              intensity={selectedCategory === category ? 40 : 20}
              tint="light"
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip,
              ]}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workouts List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.workoutsList}
      >
        {filteredWorkouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            onPress={() => handleWorkoutPress(workout)}
          >
            <BlurView intensity={25} tint="light" style={styles.workoutCard}>
              {workout.scheduled && (
                <View style={styles.scheduledBadge}>
                  <Text style={styles.scheduledText}>{workout.scheduled}</Text>
                </View>
              )}
              
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutCategory}>{workout.category}</Text>
                </View>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(workout.difficulty) },
                  ]}
                >
                  <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                </View>
              </View>

              <View style={styles.workoutDetails}>
                <View style={styles.detailItem}>
                  <Icon name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.detailText}>{workout.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="fitness-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.detailText}>{workout.exercises} exercises</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="barbell-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.detailText}>{workout.equipment.join(', ')}</Text>
                </View>
              </View>

              <View style={styles.workoutActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="play-circle" size={24} color="white" />
                  <Text style={styles.actionText}>Start</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="calendar-outline" size={24} color="white" />
                  <Text style={styles.actionText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="pencil-outline" size={24} color="white" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  weekCalendar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  dayCard: {
    width: (width - 60) / 7,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  todayCard: {
    borderWidth: 2,
    borderColor: 'white',
  },
  restDayCard: {
    backgroundColor: 'rgba(128,128,128,0.3)',
  },
  dayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  restDayText: {
    color: 'rgba(255,255,255,0.6)',
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginTop: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    overflow: 'hidden',
  },
  selectedCategoryChip: {
    borderWidth: 2,
    borderColor: 'white',
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  workoutsList: {
    paddingHorizontal: 20,
  },
  workoutCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  scheduledBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduledText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  workoutCategory: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 4,
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});

export default WorkoutsScreen;