import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';
import { usePressAnimation, useFadeInAnimation, useSlideInAnimation } from '../utils/animations';

const { width } = Dimensions.get('window');

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [todayWorkout] = useState({
    name: 'Upper Body Strength',
    duration: '45 min',
    exercises: 6,
    difficulty: 'Intermediate',
  });

  // Animation values
  const notificationScale = useRef(new Animated.Value(1)).current;
  const startButtonScale = useRef(new Animated.Value(1)).current;
  const headerFade = useFadeInAnimation(0, 300);
  const statsSlide = useSlideInAnimation('bottom', 100);
  const workoutCardSlide = useSlideInAnimation('right', 200);

  const stats = [
    { label: 'Workouts', value: '24', icon: 'fitness' },
    { label: 'Calories', value: '12.5k', icon: 'flame' },
    { label: 'Minutes', value: '1,240', icon: 'time' },
    { label: 'Streak', value: '7 days', icon: 'trending-up' },
  ];

  const quickActions = [
    { label: 'Start Workout', icon: 'play-circle', color: '#667eea' },
    { label: 'Track Progress', icon: 'analytics', color: '#764ba2' },
    { label: 'AI Coach', icon: 'chatbubble-ellipses', color: '#f093fb' },
    { label: 'Schedule', icon: 'calendar', color: '#4facfe' },
  ];

  useEffect(() => {
    console.log('Home Screen Loaded', { user: user?.email });
  }, []);

  const handleQuickAction = (action: string) => {
    console.log('Quick Action Pressed', { action });
    switch (action) {
      case 'Start Workout':
        navigation.navigate('ActiveWorkout');
        break;
      case 'AI Coach':
        navigation.navigate('Messages');
        break;
      case 'Track Progress':
        navigation.navigate('Profile');
        break;
      case 'Schedule':
        navigation.navigate('Workouts');
        break;
    }
  };

  const animateNotificationBell = () => {
    Animated.sequence([
      Animated.timing(notificationScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(notificationScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateStartButton = () => {
    Animated.sequence([
      Animated.timing(startButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(startButtonScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('ActiveWorkout');
    });
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, headerFade.animatedStyle]}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Fitness Warrior'}! 💪</Text>
          </View>
          <TouchableOpacity onPress={animateNotificationBell} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale: notificationScale }] }}>
              <Icon name="notifications-outline" size={28} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Section */}
        <Animated.View style={[styles.statsContainer, statsSlide.animatedStyle]}>
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </Animated.View>

        {/* Today's Workout */}
        <Animated.View style={workoutCardSlide.animatedStyle}>
          <BlurView intensity={30} tint="light" style={styles.todayWorkoutCard}>
            <View style={styles.todayWorkoutHeader}>
              <Text style={styles.todayWorkoutTitle}>Today's Workout</Text>
              <Icon name="arrow-forward" size={24} color="white" />
            </View>
            
            <Text style={styles.workoutName}>{todayWorkout.name}</Text>
            
            <View style={styles.workoutDetails}>
              <View style={styles.workoutDetailItem}>
                <Icon name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.workoutDetailText}>{todayWorkout.duration}</Text>
              </View>
              <View style={styles.workoutDetailItem}>
                <Icon name="barbell-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.workoutDetailText}>{todayWorkout.exercises} exercises</Text>
              </View>
              <View style={styles.workoutDetailItem}>
                <Icon name="speedometer-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.workoutDetailText}>{todayWorkout.difficulty}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                console.log('Start Today Workout', todayWorkout);
                animateStartButton();
              }}
              activeOpacity={0.9}
            >
              <Animated.View style={[styles.startButton, { transform: [{ scale: startButtonScale }] }]}>
                <Text style={styles.startButtonText}>Start Now</Text>
                <Icon name="play" size={20} color="#667eea" />
              </Animated.View>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              action={action}
              index={index}
              onPress={() => handleQuickAction(action.label)}
            />
          ))}
        </View>

        {/* Recent Achievements */}
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <AchievementCard />

        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: Platform.OS === 'ios' ? 90 : 80 }} />
      </ScrollView>
    </LinearGradient>
  );
};

// Animated Stat Card Component
const StatCard = ({ stat, index }: { stat: any; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <AnimatedBlurView
      intensity={20}
      tint="light"
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Icon name={stat.icon} size={24} color="white" />
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </AnimatedBlurView>
  );
};

// Animated Quick Action Card
const QuickActionCard = ({ action, index, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 300 + index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <AnimatedBlurView
        intensity={25}
        tint="light"
        style={[
          styles.quickActionCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[action.color, action.color + 'aa']}
          style={styles.quickActionIcon}
        >
          <Icon name={action.icon} size={28} color="white" />
        </LinearGradient>
        <Text style={styles.quickActionLabel}>{action.label}</Text>
      </AnimatedBlurView>
    </TouchableOpacity>
  );
};

// Animated Achievement Card
const AchievementCard = () => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <AnimatedBlurView
        intensity={20}
        tint="light"
        style={[
          styles.achievementCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={styles.achievementIcon}>
          <Text style={styles.achievementEmoji}>🏆</Text>
        </View>
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle}>Week Warrior</Text>
          <Text style={styles.achievementDescription}>
            Completed 7 workouts this week!
          </Text>
        </View>
      </AnimatedBlurView>
    </TouchableOpacity>
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
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  statCard: {
    width: (width - 40) / 2,
    padding: 20,
    margin: 5,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  todayWorkoutCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  todayWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayWorkoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  workoutDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutDetailText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 6,
  },
  startButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
    marginTop: 30,
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  quickActionCard: {
    width: (width - 40) / 2,
    padding: 20,
    margin: 5,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default HomeScreen;