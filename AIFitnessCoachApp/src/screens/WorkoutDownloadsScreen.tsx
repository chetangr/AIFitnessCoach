import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DownloadableWorkout {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  exerciseCount: number;
  rating: number;
  downloads: number;
  size: string;
  isDownloaded: boolean;
  isPremium: boolean;
}

const WorkoutDownloadsScreen = ({ navigation }: any) => {
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');

  const availableWorkouts: DownloadableWorkout[] = [
    {
      id: '1',
      name: '30-Day Transformation Challenge',
      description: 'Complete body transformation program with progressive difficulty',
      duration: '30 days',
      level: 'Intermediate',
      category: 'Full Body',
      exerciseCount: 90,
      rating: 4.8,
      downloads: 15420,
      size: '2.5 MB',
      isDownloaded: false,
      isPremium: false,
    },
    {
      id: '2',
      name: 'Beginner Strength Foundation',
      description: 'Build foundational strength with basic compound movements',
      duration: '8 weeks',
      level: 'Beginner',
      category: 'Strength',
      exerciseCount: 45,
      rating: 4.9,
      downloads: 28350,
      size: '1.8 MB',
      isDownloaded: true,
      isPremium: false,
    },
    {
      id: '3',
      name: 'Advanced HIIT Shred',
      description: 'High-intensity interval training for fat loss and conditioning',
      duration: '6 weeks',
      level: 'Advanced',
      category: 'Cardio',
      exerciseCount: 60,
      rating: 4.7,
      downloads: 12890,
      size: '3.1 MB',
      isDownloaded: false,
      isPremium: true,
    },
    {
      id: '4',
      name: 'Yoga Flow Fundamentals',
      description: 'Gentle yoga flows for flexibility and mindfulness',
      duration: '4 weeks',
      level: 'Beginner',
      category: 'Flexibility',
      exerciseCount: 25,
      rating: 4.6,
      downloads: 9650,
      size: '1.2 MB',
      isDownloaded: false,
      isPremium: false,
    },
    {
      id: '5',
      name: 'Powerlifting Mastery',
      description: 'Master the big three: squat, bench, deadlift',
      duration: '12 weeks',
      level: 'Advanced',
      category: 'Powerlifting',
      exerciseCount: 75,
      rating: 4.9,
      downloads: 7230,
      size: '4.2 MB',
      isDownloaded: false,
      isPremium: true,
    },
    {
      id: '6',
      name: 'Home Bodyweight Circuit',
      description: 'Effective workouts using only bodyweight exercises',
      duration: '6 weeks',
      level: 'Intermediate',
      category: 'Bodyweight',
      exerciseCount: 40,
      rating: 4.5,
      downloads: 18750,
      size: '1.5 MB',
      isDownloaded: false,
      isPremium: false,
    },
  ];

  const filteredWorkouts = availableWorkouts.filter(workout => {
    if (filter === 'free') return !workout.isPremium;
    if (filter === 'premium') return workout.isPremium;
    return true;
  });

  const handleDownload = async (workout: DownloadableWorkout) => {
    if (workout.isPremium) {
      Alert.alert(
        'Premium Workout',
        'This is a premium workout. Upgrade to access premium content.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => handleUpgrade() },
        ]
      );
      return;
    }

    setDownloadingIds(prev => [...prev, workout.id]);

    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save workout to local storage
      const downloadedWorkouts = await getDownloadedWorkouts();
      downloadedWorkouts.push(workout);
      await AsyncStorage.setItem('@downloaded_workouts', JSON.stringify(downloadedWorkouts));
      
      // Update workout state
      workout.isDownloaded = true;
      
      Alert.alert('Success', `${workout.name} downloaded successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to download workout. Please try again.');
    } finally {
      setDownloadingIds(prev => prev.filter(id => id !== workout.id));
    }
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Premium features include:\n• Advanced workout programs\n• Detailed video instructions\n• Personalized coaching\n• Progress analytics\n\nOnly $9.99/month',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe', onPress: () => {
          Alert.alert('Coming Soon', 'Premium subscriptions will be available soon!');
        }},
      ]
    );
  };

  const getDownloadedWorkouts = async (): Promise<DownloadableWorkout[]> => {
    try {
      const data = await AsyncStorage.getItem('@downloaded_workouts');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  };

  const handleRemoveDownload = async (workout: DownloadableWorkout) => {
    Alert.alert(
      'Remove Download',
      `Remove ${workout.name} from downloads?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            const downloadedWorkouts = await getDownloadedWorkouts();
            const updatedWorkouts = downloadedWorkouts.filter(w => w.id !== workout.id);
            await AsyncStorage.setItem('@downloaded_workouts', JSON.stringify(updatedWorkouts));
            workout.isDownloaded = false;
            Alert.alert('Success', 'Workout removed from downloads');
          } catch (error) {
            Alert.alert('Error', 'Failed to remove workout');
          }
        }},
      ]
    );
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#667eea';
    }
  };

  const renderWorkout = ({ item }: { item: DownloadableWorkout }) => {
    const isDownloading = downloadingIds.includes(item.id);

    return (
      <BlurView intensity={20} tint="light" style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{item.name}</Text>
            <Text style={styles.workoutDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          
          {item.isPremium && (
            <View style={styles.premiumBadge}>
              <Icon name="diamond" size={16} color="#FFD700" />
              <Text style={styles.premiumText}>PRO</Text>
            </View>
          )}
        </View>

        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Icon name="time" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="fitness" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.metaText}>{item.exerciseCount} exercises</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: getDifficultyColor(item.level) }]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>

        <View style={styles.workoutStats}>
          <View style={styles.statItem}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.statText}>{item.rating}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="download" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>{item.downloads.toLocaleString()}</Text>
          </View>
          <Text style={styles.sizeText}>{item.size}</Text>
        </View>

        <View style={styles.actionRow}>
          {item.isDownloaded ? (
            <>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => navigation.navigate('ProgramDetail', { program: item })}
              >
                <Icon name="play" size={16} color="white" />
                <Text style={styles.playButtonText}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveDownload(item)}
              >
                <Icon name="trash" size={16} color="#F44336" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.downloadButton, isDownloading && styles.downloadingButton]}
              onPress={() => handleDownload(item)}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="cloud-download" size={16} color="white" />
              )}
              <Text style={styles.downloadButtonText}>
                {isDownloading ? 'Downloading...' : 'Download'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Download Workouts</Text>
        <TouchableOpacity onPress={handleUpgrade}>
          <Icon name="diamond" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'free', 'premium'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterTab, filter === filterType && styles.activeFilterTab]}
            onPress={() => setFilter(filterType as any)}
          >
            <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Workouts List */}
      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterText: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
  },
  workoutCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  sizeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginLeft: 'auto',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  downloadingButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.5)',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WorkoutDownloadsScreen;