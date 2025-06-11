import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useThemeStore } from '../store/themeStore';
import { LiquidGlassView, LiquidButton, LiquidCard } from '../components/glass';

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

const LiquidStatsScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
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

  const scrollAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    loadWorkoutData();
    
    // Entrance animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animate cards in sequence
    cardAnimations.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    });
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

      // Create CSV content in Hevy format
      let csvContent = 'Date,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Name,Workout Notes\n';
      
      workoutSets.forEach((set, index) => {
        const date = new Date(set.date).toISOString().split('T')[0];
        csvContent += `${date},${set.exerciseName},${index + 1},${set.weight},${set.reps},0,0,"","Workout",""\n`;
      });

      // Save to file
      const fileName = `hevy_export_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csvContent);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Success', 'File saved to device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
      console.error(error);
    }
  };

  const exportToJSON = async () => {
    try {
      const exportData = {
        stats,
        workouts: workoutSets,
        exportDate: new Date().toISOString(),
      };

      const fileName = `fitness_data_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Success', 'File saved to device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
      console.error(error);
    }
  };

  const statCards = [
    { 
      title: 'Total Workouts', 
      value: stats.totalWorkouts.toString(), 
      icon: 'fitness', 
      color: theme.colors.primary,
      index: 0 
    },
    { 
      title: 'Total Minutes', 
      value: stats.totalMinutes.toString(), 
      icon: 'time', 
      color: '#4FC3F7',
      index: 1 
    },
    { 
      title: 'Current Streak', 
      value: `${stats.currentStreak} days`, 
      icon: 'flame', 
      color: theme.colors.error,
      index: 2 
    },
    { 
      title: 'Calories Burned', 
      value: stats.totalCaloriesBurned.toLocaleString(), 
      icon: 'flash', 
      color: theme.colors.warning,
      index: 3 
    },
    { 
      title: 'Average Duration', 
      value: `${stats.averageWorkoutTime} min`, 
      icon: 'stopwatch', 
      color: '#7E57C2',
      index: 4 
    },
    { 
      title: 'Favorite Exercise', 
      value: stats.favoriteExercise, 
      icon: 'star', 
      color: '#FFD700',
      index: 5 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{
              translateY: scrollAnimation.interpolate({
                inputRange: [0, 100],
                outputRange: [0, -20],
                extrapolate: 'clamp',
              })
            }],
            opacity: scrollAnimation.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0.9],
              extrapolate: 'clamp',
            })
          }
        ]}
      >
        <LiquidGlassView intensity={90} style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Stats</Text>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => {
              Alert.alert(
                'Export Data',
                'Choose export format',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Hevy Format', onPress: exportToHevy },
                  { text: 'JSON Format', onPress: exportToJSON },
                ]
              );
            }}
          >
            <Icon name="download-outline" size={24} color="white" />
          </TouchableOpacity>
        </LiquidGlassView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollAnimation } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Stats */}
        <View style={styles.heroSection}>
          <LiquidCard style={styles.heroCard}>
            <Icon name="trophy" size={48} color={theme.colors.warning} />
            <Text style={styles.heroTitle}>Great Progress!</Text>
            <Text style={styles.heroSubtitle}>
              You've completed {stats.totalWorkouts} workouts and burned {stats.totalCaloriesBurned.toLocaleString()} calories
            </Text>
          </LiquidCard>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((card) => (
            <Animated.View
              key={card.title}
              style={[
                styles.statCardWrapper,
                {
                  opacity: cardAnimations[card.index],
                  transform: [{
                    translateY: cardAnimations[card.index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }, {
                    scale: cardAnimations[card.index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }]
                }
              ]}
            >
              <LiquidCard style={styles.statCard}>
                <Icon name={card.icon} size={32} color={card.color} style={styles.statIcon} />
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statTitle}>{card.title}</Text>
              </LiquidCard>
            </Animated.View>
          ))}
        </View>

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <LiquidCard style={styles.progressCard}>
            <View style={styles.weekDays}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                const isActive = index < 5; // Example: active on weekdays
                return (
                  <View key={index} style={styles.dayColumn}>
                    <View
                      style={[
                        styles.dayBar,
                        isActive && styles.dayBarActive,
                        { height: isActive ? `${(index + 1) * 15}%` : '10%' }
                      ]}
                    />
                    <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </LiquidCard>
        </View>

        {/* Export Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Your Data</Text>
          <LiquidCard style={styles.exportCard}>
            <Icon name="document-text" size={48} color={theme.colors.primary} />
            <Text style={styles.exportTitle}>Export to Hevy or JSON</Text>
            <Text style={styles.exportDescription}>
              Export your workout data to import into other fitness apps or for your records
            </Text>
            <View style={styles.exportButtons}>
              <LiquidButton
                label="Hevy Format"
                icon="logo-google"
                size="medium"
                variant="primary"
                onPress={exportToHevy}
                style={styles.exportBtn}
              />
              <LiquidButton
                label="JSON Format"
                icon="code-slash"
                size="medium"
                variant="secondary"
                onPress={exportToJSON}
                style={styles.exportBtn}
              />
            </View>
          </LiquidCard>
        </View>

        <View style={{ height: Platform.OS === 'ios' ? 120 : 100 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  exportButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
    paddingHorizontal: 20,
  },
  heroSection: {
    marginBottom: 30,
  },
  heroCard: {
    padding: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  statCard: {
    padding: 20,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  progressCard: {
    padding: 20,
    height: 200,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dayBar: {
    width: '60%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  dayBarActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.8)',
  },
  dayText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  dayTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  exportCard: {
    padding: 30,
    alignItems: 'center',
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  exportDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportBtn: {
    minWidth: 120,
  },
});

export default LiquidStatsScreen;