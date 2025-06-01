import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

const CreativeHomeScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  // Animation values
  const scrollY = useSharedValue(0);
  const cardAnimations = useSharedValue(0);
  
  const [todayWorkout] = useState({
    name: 'Upper Body Power',
    duration: '45 min',
    exercises: 8,
    difficulty: 'Intermediate',
    progress: 0.35,
    calories: 420,
    type: 'Strength Training',
  });

  const [fitnessRing] = useState({
    move: 0.75,
    exercise: 0.60,
    stand: 0.85,
  });

  const quickActions = [
    { 
      id: 1,
      label: 'Start Workout', 
      icon: 'play-circle', 
      gradient: ['#667eea', '#764ba2'],
      action: () => navigation.navigate('ActiveWorkout', { 
        workout: {
          name: todayWorkout.name,
          type: todayWorkout.type,
          duration: todayWorkout.duration,
          exercises: todayWorkout.exercises,
          difficulty: todayWorkout.difficulty,
          calories: todayWorkout.calories
        }
      }),
    },
    { 
      id: 2,
      label: 'AI Coach', 
      icon: 'chatbubbles-sharp', 
      gradient: ['#f093fb', '#f5576c'],
      action: () => navigation.navigate('Messages'),
    },
    { 
      id: 3,
      label: 'Progress', 
      icon: 'trending-up', 
      gradient: ['#4facfe', '#00f2fe'],
      action: () => navigation.navigate('Profile'),
    },
    { 
      id: 4,
      label: 'Discover', 
      icon: 'compass', 
      gradient: ['#43e97b', '#38f9d7'],
      action: () => navigation.navigate('Discover'),
    },
  ];

  const weeklyStats = [
    { label: 'Workouts', value: '12', change: '+3', icon: 'fitness', color: '#667eea' },
    { label: 'Calories', value: '2.8k', change: '+420', icon: 'flame', color: '#f5576c' },
    { label: 'Minutes', value: '540', change: '+75', icon: 'time', color: '#4facfe' },
    { label: 'Streak', value: '7', change: '+1', icon: 'trending-up', color: '#43e97b' },
  ];

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    setCurrentDate(now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }));

    // Start card animations
    cardAnimations.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.8]);
    const translateY = interpolate(scrollY.value, [0, 100], [0, -20]);
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardAnimations.value,
      transform: [
        { 
          scale: interpolate(cardAnimations.value, [0, 1], [0.9, 1]) 
        },
        { 
          translateY: interpolate(cardAnimations.value, [0, 1], [50, 0]) 
        }
      ],
    };
  });

  const FitnessRing = ({ progress, color, size = 60 }: any) => {
    return (
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <View style={[styles.ringBackground, { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderWidth: 6,
          borderColor: 'rgba(255,255,255,0.2)',
        }]} />
        <View style={[styles.ringProgress, { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderWidth: 6,
          borderColor: color,
          transform: [{ rotate: '-90deg' }],
        }]} />
        <View style={[styles.ringCenter, {
          width: size - 12,
          height: size - 12,
          borderRadius: (size - 12) / 2,
        }]}>
          <Text style={styles.ringText}>{Math.round(progress * 100)}%</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient 
      colors={['#667eea', '#764ba2', '#f093fb']} 
      locations={[0, 0.7, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {/* Animated Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Champion'}</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileAvatar}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.avatarGradient}>
              <Icon name="person" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Fitness Rings Card */}
        <Animated.View style={[cardAnimatedStyle]}>
          <BlurView intensity={25} style={styles.ringsCard}>
            <Text style={styles.cardTitle}>Today's Activity</Text>
            <View style={styles.ringsContainer}>
              <View style={styles.ringItem}>
                <FitnessRing progress={fitnessRing.move} color="#f5576c" />
                <Text style={styles.ringLabel}>Move</Text>
              </View>
              <View style={styles.ringItem}>
                <FitnessRing progress={fitnessRing.exercise} color="#4facfe" />
                <Text style={styles.ringLabel}>Exercise</Text>
              </View>
              <View style={styles.ringItem}>
                <FitnessRing progress={fitnessRing.stand} color="#43e97b" />
                <Text style={styles.ringLabel}>Stand</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Workout Hero Card */}
        <Animated.View style={[cardAnimatedStyle]}>
          <TouchableOpacity 
            style={styles.workoutHeroCard}
            onPress={() => navigation.navigate('ActiveWorkout', { 
              workout: {
                name: todayWorkout.name,
                type: todayWorkout.type,
                duration: todayWorkout.duration,
                exercises: todayWorkout.exercises,
                difficulty: todayWorkout.difficulty,
                calories: todayWorkout.calories
              }
            })}
          >
            <LinearGradient 
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} 
              style={styles.workoutCardGradient}
            >
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutLabel}>Today's Workout</Text>
                  <Text style={styles.workoutName}>{todayWorkout.name}</Text>
                  <Text style={styles.workoutType}>{todayWorkout.type}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.playButtonLarge}
                  onPress={() => navigation.navigate('ActiveWorkout', { 
                    workout: {
                      name: todayWorkout.name,
                      type: todayWorkout.type,
                      duration: todayWorkout.duration,
                      exercises: todayWorkout.exercises,
                      difficulty: todayWorkout.difficulty,
                      calories: todayWorkout.calories
                    }
                  })}
                >
                  <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.playGradient}>
                    <Icon name="play" size={32} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <View style={styles.workoutStats}>
                <View style={styles.statPill}>
                  <Icon name="time" size={16} color="white" />
                  <Text style={styles.statText}>{todayWorkout.duration}</Text>
                </View>
                <View style={styles.statPill}>
                  <Icon name="fitness" size={16} color="white" />
                  <Text style={styles.statText}>{todayWorkout.exercises} exercises</Text>
                </View>
                <View style={styles.statPill}>
                  <Icon name="flame" size={16} color="white" />
                  <Text style={styles.statText}>{todayWorkout.calories} cal</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Progress: {Math.round(todayWorkout.progress * 100)}% complete</Text>
                <View style={styles.progressBar}>
                  <LinearGradient 
                    colors={['#f093fb', '#f5576c']} 
                    style={[styles.progressFill, { width: `${todayWorkout.progress * 100}%` }]} 
                  />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions Grid */}
        <Animated.View style={[cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.action}
              >
                <LinearGradient colors={action.gradient as any} style={styles.quickActionGradient}>
                  <Icon name={action.icon} size={28} color="white" />
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Weekly Stats */}
        <Animated.View style={[cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            {weeklyStats.map((stat, index) => (
              <BlurView key={index} intensity={20} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
                    <Icon name={stat.icon} size={18} color="white" />
                  </View>
                  <Text style={[styles.statChange, { color: '#4CAF50' }]}>
                    {stat.change}
                  </Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </BlurView>
            ))}
          </View>
        </Animated.View>

        {/* Motivational Quote */}
        <Animated.View style={[cardAnimatedStyle]}>
          <BlurView intensity={20} style={styles.quoteCard}>
            <Icon name="heart" size={24} color="#f5576c" style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              "The only impossible journey is the one you never begin."
            </Text>
            <Text style={styles.quoteAuthor}>- Tony Robbins</Text>
          </BlurView>
        </Animated.View>
      </Animated.ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 110 : 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  profileAvatar: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  ringItem: {
    alignItems: 'center',
  },
  ringContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringBackground: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  ringProgress: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ringText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ringLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
  },
  workoutHeroCard: {
    marginBottom: 30,
    borderRadius: 24,
    overflow: 'hidden',
  },
  workoutCardGradient: {
    padding: 24,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  workoutName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutType: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  playButtonLarge: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  playGradient: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressSection: {
    marginTop: 8,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  quoteCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: 12,
  },
  quoteText: {
    color: 'white',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CreativeHomeScreen;