import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';
// Logger removed - causing import errors

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [todayWorkout] = useState({
    name: 'Upper Body Strength',
    duration: '45 min',
    exercises: 6,
    difficulty: 'Intermediate',
  });

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

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Fitness Warrior'}! 💪</Text>
          </View>
          <TouchableOpacity>
            <Icon name="notifications-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <BlurView key={index} intensity={20} tint="light" style={styles.statCard}>
              <Icon name={stat.icon} size={24} color="white" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </BlurView>
          ))}
        </View>

        {/* Today's Workout */}
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
            style={styles.startButton}
            onPress={() => {
              console.log('Start Today Workout', todayWorkout);
              navigation.navigate('ActiveWorkout');
            }}
          >
            <Text style={styles.startButtonText}>Start Now</Text>
            <Icon name="play" size={20} color="#667eea" />
          </TouchableOpacity>
        </BlurView>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleQuickAction(action.label)}
            >
              <BlurView intensity={25} tint="light" style={styles.quickActionCard}>
                <LinearGradient
                  colors={[action.color, action.color + 'aa']}
                  style={styles.quickActionIcon}
                >
                  <Icon name={action.icon} size={28} color="white" />
                </LinearGradient>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Achievements */}
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <BlurView intensity={20} tint="light" style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Text style={styles.achievementEmoji}>🏆</Text>
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>Week Warrior</Text>
            <Text style={styles.achievementDescription}>
              Completed 7 workouts this week!
            </Text>
          </View>
        </BlurView>

        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: Platform.OS === 'ios' ? 90 : 80 }} />
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