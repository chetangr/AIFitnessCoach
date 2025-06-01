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

const { width } = Dimensions.get('window');

const ImprovedHomeScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [todayWorkout] = useState({
    name: 'Upper Body Strength',
    duration: '45 min',
    exercises: 6,
    difficulty: 'Intermediate',
    progress: 0.3,
  });

  const stats = [
    { label: 'Workouts', value: '24', icon: 'fitness', change: '+3' },
    { label: 'Calories', value: '12.5k', icon: 'flame', change: '+450' },
    { label: 'Minutes', value: '1,240', icon: 'time', change: '+75' },
    { label: 'Streak', value: '7', icon: 'trending-up', change: '+1' },
  ];

  const quickActions = [
    { label: 'Start Workout', icon: 'play-circle', gradient: ['#667eea', '#764ba2'] },
    { label: 'AI Coach', icon: 'chatbubble-ellipses', gradient: ['#f093fb', '#f5576c'] },
    { label: 'Progress', icon: 'analytics', gradient: ['#4facfe', '#00f2fe'] },
    { label: 'Discover', icon: 'compass', gradient: ['#43e97b', '#38f9d7'] },
  ];

  const recentWorkouts = [
    { name: 'Full Body HIIT', date: 'Yesterday', duration: '30 min', completed: true },
    { name: 'Core Strength', date: '2 days ago', duration: '20 min', completed: true },
    { name: 'Cardio Blast', date: '3 days ago', duration: '25 min', completed: false },
  ];

  useEffect(() => {
    console.log('Improved Home Screen Loaded', { user: user?.email });
  }, []);

  const handleQuickAction = (action: string) => {
    console.log('Quick Action Pressed', { action });
    switch (action) {
      case 'Start Workout':
        navigation.navigate('Workouts');
        break;
      case 'AI Coach':
        navigation.navigate('Messages');
        break;
      case 'Progress':
        navigation.navigate('Profile');
        break;
      case 'Discover':
        navigation.navigate('Discover');
        break;
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </Text>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Fitness Enthusiast'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <BlurView intensity={20} style={styles.profileBlur}>
              <Icon name="person-circle" size={32} color="white" />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Today's Workout Card */}
        <BlurView intensity={25} style={styles.workoutCard}>
          <View style={styles.workoutHeader}>
            <View>
              <Text style={styles.workoutLabel}>Today's Workout</Text>
              <Text style={styles.workoutName}>{todayWorkout.name}</Text>
            </View>
            <TouchableOpacity style={styles.playButton}>
              <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.playGradient}>
                <Icon name="play" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.workoutDetails}>
            <View style={styles.workoutStat}>
              <Icon name="time-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.workoutStatText}>{todayWorkout.duration}</Text>
            </View>
            <View style={styles.workoutStat}>
              <Icon name="fitness-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.workoutStatText}>{todayWorkout.exercises} exercises</Text>
            </View>
            <View style={styles.workoutStat}>
              <Icon name="trending-up-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.workoutStatText}>{todayWorkout.difficulty}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progress: 30% complete</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${todayWorkout.progress * 100}%` }]} />
            </View>
          </View>
        </BlurView>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionItem}
                onPress={() => handleQuickAction(action.label)}
              >
                <LinearGradient colors={action.gradient as any} style={styles.quickActionGradient}>
                  <Icon name={action.icon} size={24} color="white" />
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <BlurView key={index} intensity={20} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Icon name={stat.icon} size={20} color="white" />
                  <Text style={styles.statChange}>+{stat.change}</Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </BlurView>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {recentWorkouts.map((workout, index) => (
            <BlurView key={index} intensity={20} style={styles.recentItem}>
              <View style={styles.recentContent}>
                <View style={styles.recentLeft}>
                  <Icon 
                    name={workout.completed ? "checkmark-circle" : "time-outline"} 
                    size={20} 
                    color={workout.completed ? "#4CAF50" : "rgba(255,255,255,0.6)"} 
                  />
                  <View style={styles.recentText}>
                    <Text style={styles.recentName}>{workout.name}</Text>
                    <Text style={styles.recentMeta}>{workout.date} • {workout.duration}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.recentAction}>
                  <Icon name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </BlurView>
          ))}
        </View>
      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileBlur: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  workoutName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  playGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutStatText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f093fb',
    borderRadius: 2,
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statChange: {
    color: '#4CAF50',
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
  recentContainer: {
    marginBottom: 20,
  },
  recentItem: {
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  recentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentText: {
    marginLeft: 12,
    flex: 1,
  },
  recentName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentMeta: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  recentAction: {
    padding: 4,
  },
});

export default ImprovedHomeScreen;