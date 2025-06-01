import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { workoutPrograms } from '../data/exercisesDatabase';

const { width } = Dimensions.get('window');

interface WorkoutEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: 'workout' | 'rest' | 'active';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  calories: number;
  completed?: boolean;
}

interface DayData {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  workouts: WorkoutEvent[];
}

const TimelineScreen = ({ navigation }: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<DayData[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Animation values
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);
  const fabPulse = new Animated.Value(1);

  useEffect(() => {
    generateWeekData();
    
    // Start FAB pulse animation
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
    
    return () => pulseAnimation.stop();
  }, [selectedWeek]);

  const generateWeekData = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (selectedWeek * 7));

    const weekData: DayData[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const isToday = date.toDateString() === today.toDateString();
      
      const dayData: DayData = {
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday,
        workouts: generateWorkoutsForDay(date, i),
      };
      
      weekData.push(dayData);
    }
    
    setWeekDays(weekData);
    
    // If today is in this week, select it
    const todayInWeek = weekData.find(day => day.isToday);
    if (todayInWeek) {
      setSelectedDate(todayInWeek.date);
    }
  };

  const generateWorkoutsForDay = (date: Date, dayIndex: number): WorkoutEvent[] => {
    const workouts: WorkoutEvent[] = [];
    const dayOfWeek = date.getDay();
    
    // Generate different workout patterns based on day
    if (dayOfWeek === 0) { // Sunday - Rest day
      workouts.push({
        id: `rest-${date.getTime()}`,
        title: 'Rest Day',
        time: 'All Day',
        duration: 'Recovery',
        type: 'rest',
        difficulty: 'Beginner',
        calories: 0,
      });
    } else if (dayOfWeek === 6) { // Saturday - Active recovery
      workouts.push({
        id: `active-${date.getTime()}`,
        title: 'Morning Walk',
        time: '8:00 AM',
        duration: '30 min',
        type: 'active',
        difficulty: 'Beginner',
        calories: 150,
      });
    } else {
      // Weekdays - Regular workouts
      const program = workoutPrograms[dayIndex % workoutPrograms.length];
      const isCompleted = date < new Date() && Math.random() > 0.3; // 70% completion rate for past days
      
      workouts.push({
        id: `workout-${date.getTime()}`,
        title: program.name,
        time: '6:30 AM',
        duration: program.duration,
        type: 'workout',
        difficulty: program.level,
        calories: program.estimatedCalories,
        completed: isCompleted,
      });
      
      // Sometimes add evening workouts
      if (Math.random() > 0.7) {
        workouts.push({
          id: `evening-${date.getTime()}`,
          title: 'Evening Cardio',
          time: '6:00 PM',
          duration: '20 min',
          type: 'workout',
          difficulty: 'Beginner',
          calories: 200,
          completed: isCompleted && Math.random() > 0.5,
        });
      }
    }
    
    return workouts;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4ECDC4';
      case 'Intermediate': return '#FFD93D';
      case 'Advanced': return '#FF6B6B';
      default: return '#667eea';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workout': return 'fitness';
      case 'rest': return 'bed';
      case 'active': return 'walk';
      default: return 'ellipse';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedWeek(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  const selectDay = (day: DayData) => {
    setSelectedDate(day.date);
    
    // Animate selection
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0);
    });
  };

  const handleWorkoutPress = (workout: WorkoutEvent) => {
    if (workout.type === 'workout') {
      // Find the program for this workout
      const program = workoutPrograms.find(p => p.name === workout.title);
      if (program) {
        navigation.navigate('ProgramDetail', { program });
      }
    }
  };

  const selectedDayData = weekDays.find(day => 
    day.date.toDateString() === selectedDate.toDateString()
  );

  const getWeekRange = () => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0].date;
    const end = weekDays[6].date;
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    }
  };

  const renderWorkoutCard = (workout: WorkoutEvent) => (
    <TouchableOpacity
      key={workout.id}
      style={[
        styles.workoutCard,
        workout.completed && styles.completedWorkout,
        workout.type === 'rest' && styles.restWorkout,
      ]}
      onPress={() => handleWorkoutPress(workout)}
    >
      <BlurView intensity={25} tint="light" style={styles.workoutContent}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutIcon}>
            <Icon 
              name={getTypeIcon(workout.type)} 
              size={20} 
              color={workout.type === 'rest' ? '#9E9E9E' : '#667eea'} 
            />
          </View>
          
          <View style={styles.workoutInfo}>
            <Text style={[
              styles.workoutTitle,
              workout.type === 'rest' && styles.restText
            ]}>
              {workout.title}
            </Text>
            <Text style={[
              styles.workoutTime,
              workout.type === 'rest' && styles.restText
            ]}>
              {workout.time}
            </Text>
          </View>
          
          <View style={styles.workoutMeta}>
            {workout.type !== 'rest' && (
              <>
                <View style={[
                  styles.difficultyBadge, 
                  { backgroundColor: getDifficultyColor(workout.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>{workout.difficulty[0]}</Text>
                </View>
                {workout.completed && (
                  <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </>
            )}
          </View>
        </View>
        
        <View style={styles.workoutDetails}>
          <View style={styles.workoutStat}>
            <Icon name="time" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.workoutStatText}>{workout.duration}</Text>
          </View>
          
          {workout.calories > 0 && (
            <View style={styles.workoutStat}>
              <Icon name="flame" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.workoutStatText}>{workout.calories} cal</Text>
            </View>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timeline</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateWeek('prev')}
        >
          <Icon name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.weekRange}>{getWeekRange()}</Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateWeek('next')}
        >
          <Icon name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Full Week View - All Days with Activities */}
      <ScrollView style={styles.weeklyView} showsVerticalScrollIndicator={false}>
        {weekDays.map((day) => (
          <View key={day.date.toISOString()} style={styles.daySection}>
            {/* Day Header */}
            <View style={[
              styles.dayHeader,
              day.isToday && styles.todayHeader
            ]}>
              <View style={styles.dayInfo}>
                <Text style={[
                  styles.dayName,
                  day.isToday && styles.todayText
                ]}>
                  {day.dayName}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  day.isToday && styles.todayText
                ]}>
                  {day.dayNumber}
                </Text>
              </View>
              
              {day.isToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>TODAY</Text>
                </View>
              )}
            </View>
            
            {/* Day's Workouts */}
            <View style={styles.dayWorkouts}>
              {day.workouts.length > 0 ? (
                day.workouts.map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    style={[
                      styles.compactWorkoutCard,
                      workout.completed && styles.completedWorkout,
                      workout.type === 'rest' && styles.restDay
                    ]}
                    onPress={() => handleWorkoutPress(workout)}
                  >
                    <BlurView intensity={20} tint="light" style={styles.compactWorkoutContent}>
                      <Icon 
                        name={getTypeIcon(workout.type)} 
                        size={20} 
                        color={workout.type === 'rest' ? '#9E9E9E' : '#667eea'} 
                      />
                      <View style={styles.compactWorkoutInfo}>
                        <Text style={[
                          styles.compactWorkoutTitle,
                          workout.type === 'rest' && styles.restText
                        ]}>
                          {workout.title}
                        </Text>
                        <Text style={[
                          styles.compactWorkoutTime,
                          workout.type === 'rest' && styles.restText
                        ]}>
                          {workout.time} • {workout.duration}
                        </Text>
                      </View>
                      {workout.type !== 'rest' && (
                        <View style={[
                          styles.difficultyIndicator,
                          { backgroundColor: getDifficultyColor(workout.difficulty) }
                        ]} />
                      )}
                      {workout.completed && (
                        <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                      )}
                    </BlurView>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayText}>No activities scheduled</Text>
                </View>
              )}
            </View>
          </View>
        ))}
        
        {/* Add some bottom padding for FABs */}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Quick Actions FABs */}
      <View style={styles.fabContainer}>
        <Animated.View style={{ transform: [{ scale: fabPulse }] }}>
          <TouchableOpacity 
            style={[styles.fab, styles.secondaryFab]}
            onPress={() => navigation.navigate('WorkoutOverview')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.fabGradient}>
              <Icon name="barbell" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: fabPulse }] }}>
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => navigation.navigate('Discover')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.fabGradient}>
              <Icon name="add" size={28} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekRange: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  weeklyView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  daySection: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  todayHeader: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  dayName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 24,
    fontWeight: 'bold',
  },
  todayText: {
    color: '#FFD700',
  },
  todayBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    color: '#333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dayWorkouts: {
    gap: 8,
  },
  compactWorkoutCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  restDay: {
    opacity: 0.7,
  },
  compactWorkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  compactWorkoutInfo: {
    flex: 1,
  },
  compactWorkoutTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactWorkoutTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  difficultyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  emptyDay: {
    padding: 20,
    alignItems: 'center',
  },
  emptyDayText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontStyle: 'italic',
  },
  workoutsList: {
    gap: 12,
    paddingBottom: 100,
  },
  workoutCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  completedWorkout: {
    opacity: 0.8,
  },
  restWorkout: {
    opacity: 0.7,
  },
  workoutContent: {
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  restText: {
    color: 'rgba(255,255,255,0.6)',
  },
  workoutMeta: {
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workoutDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  noWorkouts: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noWorkoutsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    marginTop: 12,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    marginBottom: 12,
  },
  secondaryFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TimelineScreen;