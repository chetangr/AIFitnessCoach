import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';

const WorkoutHistoryScreen = ({ navigation }: any) => {
  const workoutHistory = [
    {
      id: 1,
      name: 'Upper Body Strength',
      date: '2024-05-30',
      duration: '45 min',
      calories: 320,
      exercises: 8,
      completed: true,
    },
    {
      id: 2,
      name: 'Core & Cardio',
      date: '2024-05-29',
      duration: '30 min',
      calories: 250,
      exercises: 6,
      completed: true,
    },
    {
      id: 3,
      name: 'Full Body HIIT',
      date: '2024-05-28',
      duration: '35 min',
      calories: 380,
      exercises: 10,
      completed: true,
    },
    {
      id: 4,
      name: 'Lower Body Focus',
      date: '2024-05-27',
      duration: '40 min',
      calories: 290,
      exercises: 7,
      completed: false,
    },
  ];

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {workoutHistory.map((workout) => (
          <BlurView key={workout.id} intensity={20} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDate}>{new Date(workout.date).toLocaleDateString()}</Text>
              </View>
              <View style={[
                styles.statusIcon,
                { backgroundColor: workout.completed ? '#4CAF50' : '#FF9800' }
              ]}>
                <Icon 
                  name={workout.completed ? 'checkmark' : 'time'} 
                  size={16} 
                  color="white" 
                />
              </View>
            </View>
            
            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <Icon name="time-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statText}>{workout.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="flame-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statText}>{workout.calories} cal</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="fitness-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statText}>{workout.exercises} exercises</Text>
              </View>
            </View>
          </BlurView>
        ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  workoutCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default WorkoutHistoryScreen;