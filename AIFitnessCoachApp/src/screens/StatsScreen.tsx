import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ThemedGlassCard, ThemedGlassContainer } from '../components/glass/ThemedGlassComponents';
import { theme } from '../config/theme';

const { width } = Dimensions.get('window');

interface WorkoutSet {
  id: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
  duration: number;
}

interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalSets: number;
  averageWorkoutTime: number;
  favoriteExercise: string;
  currentStreak: number;
  totalCaloriesBurned: number;
}

const StatsScreen = ({ navigation }: any) => {
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>([]);
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 24,
    totalMinutes: 1240,
    totalSets: 156,
    averageWorkoutTime: 52,
    favoriteExercise: 'Push-ups',
    currentStreak: 7,
    totalCaloriesBurned: 12500,
  });

  useEffect(() => {
    loadWorkoutData();
  }, []);

  const loadWorkoutData = async () => {
    try {
      const savedSets = await AsyncStorage.getItem('workoutSets');
      if (savedSets) {
        const sets = JSON.parse(savedSets);
        setWorkoutSets(sets);
        calculateStats(sets);
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
    }
  };

  const calculateStats = (sets: WorkoutSet[]) => {
    if (sets.length === 0) return;

    const totalSets = sets.length;
    const totalMinutes = sets.reduce((sum, set) => sum + set.duration, 0);
    const uniqueWorkouts = [...new Set(sets.map(set => set.date))].length;
    
    // Calculate favorite exercise
    const exerciseCounts = sets.reduce((acc, set) => {
      acc[set.exerciseName] = (acc[set.exerciseName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteExercise = Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Push-ups';

    setStats({
      totalWorkouts: uniqueWorkouts,
      totalMinutes,
      totalSets,
      averageWorkoutTime: Math.round(totalMinutes / uniqueWorkouts) || 0,
      favoriteExercise,
      currentStreak: 7, // This would be calculated based on dates
      totalCaloriesBurned: Math.round(totalMinutes * 8.5), // Rough estimate
    });
  };

  const exportToHevy = async () => {
    try {
      if (workoutSets.length === 0) {
        Alert.alert('No Data', 'No workout data to export');
        return;
      }

      // Create Hevy-compatible CSV format
      const csvHeader = 'Date,Workout Name,Exercise Name,Set Order,Weight,Reps,RPE,Notes\n';
      const csvData = workoutSets.map((set, index) => 
        `${set.date},"Workout ${index + 1}","${set.exerciseName}",1,${set.weight},${set.reps},,`
      ).join('\n');

      const csvContent = csvHeader + csvData;
      
      // Save to file
      const fileUri = FileSystem.documentDirectory + 'hevy_export.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export to Hevy',
      });

      Alert.alert('Success', 'Workout data exported to Hevy format!');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const exportToJSON = async () => {
    try {
      if (workoutSets.length === 0) {
        Alert.alert('No Data', 'No workout data to export');
        return;
      }

      const exportData = {
        stats,
        workoutSets,
        exportDate: new Date().toISOString(),
      };

      const fileUri = FileSystem.documentDirectory + 'workout_data.json';
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Workout Data',
      });

      Alert.alert('Success', 'Workout data exported as JSON!');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const _addSampleWorkout = async () => {
    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      exerciseName: 'Bench Press',
      sets: 3,
      reps: 10,
      weight: 135,
      date: new Date().toISOString().split('T')[0],
      duration: 45,
    };

    const updatedSets = [...workoutSets, newSet];
    setWorkoutSets(updatedSets);
    
    await AsyncStorage.setItem('workoutSets', JSON.stringify(updatedSets));
    calculateStats(updatedSets);
    
    Alert.alert('Added', 'Sample workout added!');
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <BlurView intensity={20} tint="light" style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </BlurView>
  );

  return (
    <LinearGradient colors={theme.colors.primary.gradient as [string, string, string]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stats & Export</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Total Workouts" 
              value={stats.totalWorkouts} 
              icon="fitness" 
              color="#4CAF50" 
            />
            <StatCard 
              title="Total Minutes" 
              value={stats.totalMinutes.toLocaleString()} 
              icon="time" 
              color="#2196F3" 
            />
            <StatCard 
              title="Total Sets" 
              value={stats.totalSets} 
              icon="barbell" 
              color="#FF5722" 
            />
            <StatCard 
              title="Current Streak" 
              value={`${stats.currentStreak} days`} 
              icon="flame" 
              color="#FF9800" 
            />
            <StatCard 
              title="Avg Workout" 
              value={`${stats.averageWorkoutTime} min`} 
              icon="speedometer" 
              color="#9C27B0" 
            />
            <StatCard 
              title="Calories Burned" 
              value={stats.totalCaloriesBurned.toLocaleString()} 
              icon="flash" 
              color="#E91E63" 
            />
          </View>
        </View>

        {/* Favorite Exercise */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Exercise</Text>
          <BlurView intensity={20} tint="light" style={styles.favoriteCard}>
            <Icon name="trophy" size={32} color="#FFD700" />
            <Text style={styles.favoriteExercise}>{stats.favoriteExercise}</Text>
            <Text style={styles.favoriteSubtext}>Most performed exercise</Text>
          </BlurView>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Data</Text>
          
          <TouchableOpacity onPress={exportToHevy} style={styles.exportButton}>
            <BlurView intensity={25} tint="light" style={styles.exportButtonContent}>
              <View style={styles.exportIconContainer}>
                <Icon name="download" size={24} color="#4CAF50" />
              </View>
              <View style={styles.exportTextContainer}>
                <Text style={styles.exportTitle}>Export to Hevy</Text>
                <Text style={styles.exportSubtitle}>CSV format for Hevy app</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={exportToJSON} style={styles.exportButton}>
            <BlurView intensity={25} tint="light" style={styles.exportButtonContent}>
              <View style={styles.exportIconContainer}>
                <Icon name="document-text" size={24} color="#2196F3" />
              </View>
              <View style={styles.exportTextContainer}>
                <Text style={styles.exportTitle}>Export as JSON</Text>
                <Text style={styles.exportSubtitle}>Complete data backup</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('WorkoutDownloads')} 
            style={styles.exportButton}
          >
            <BlurView intensity={25} tint="light" style={styles.exportButtonContent}>
              <View style={styles.exportIconContainer}>
                <Icon name="cloud-download" size={24} color="#9C27B0" />
              </View>
              <View style={styles.exportTextContainer}>
                <Text style={styles.exportTitle}>Download Workouts</Text>
                <Text style={styles.exportSubtitle}>Save workouts offline</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Recent Sets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sets</Text>
          {workoutSets.length > 0 ? (
            workoutSets.slice(-5).reverse().map((set) => (
              <BlurView key={set.id} intensity={15} tint="light" style={styles.setItem}>
                <View style={styles.setInfo}>
                  <Text style={styles.setExercise}>{set.exerciseName}</Text>
                  <Text style={styles.setDetails}>
                    {set.sets} sets × {set.reps} reps @ {set.weight}lbs
                  </Text>
                  <Text style={styles.setDate}>{set.date}</Text>
                </View>
              </BlurView>
            ))
          ) : (
            <BlurView intensity={15} tint="light" style={styles.emptyState}>
              <Icon name="barbell-outline" size={48} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>No workout data yet</Text>
              <Text style={styles.emptySubtext}>Start tracking your sets!</Text>
            </BlurView>
          )}
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    marginBottom: 15,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statIconContainer: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  favoriteCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  favoriteExercise: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  favoriteSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  exportButton: {
    marginBottom: 12,
  },
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exportTextContainer: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  exportSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  setItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  setInfo: {
    flex: 1,
  },
  setExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  setDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  setDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
});

export default StatsScreen;