import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { exerciseService } from '../services/exerciseService';
import { AppLogger } from '../../utils/logger';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscles: string[];
  equipment: string;
  difficulty: string;
  description?: string;
  images?: string[];
}

const ExerciseLibraryScreen = ({ navigation }: any) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const muscleGroups = [
    { id: '', name: 'All', icon: 'body-outline' },
    { id: 'Chest', name: 'Chest', icon: 'shield-outline' },
    { id: 'Back', name: 'Back', icon: 'expand-outline' },
    { id: 'Shoulders', name: 'Shoulders', icon: 'resize-outline' },
    { id: 'Arms', name: 'Arms', icon: 'fitness-outline' },
    { id: 'Legs', name: 'Legs', icon: 'walk-outline' },
    { id: 'Core', name: 'Core', icon: 'disc-outline' },
    { id: 'Glutes', name: 'Glutes', icon: 'ellipse-outline' },
  ];

  useEffect(() => {
    loadExercises();
  }, [selectedMuscle, searchQuery]);

  const loadExercises = async (isLoadMore = false) => {
    try {
      setLoading(!isLoadMore);
      const currentPage = isLoadMore ? page + 1 : 1;
      
      const result = await exerciseService.getExercises({
        muscle: selectedMuscle,
        search: searchQuery,
        page: currentPage,
        limit: 20,
      });

      if (isLoadMore) {
        setExercises([...exercises, ...result]);
      } else {
        setExercises(result);
      }

      setPage(currentPage);
      setHasMore(result.length === 20);
      AppLogger.info('Exercises Loaded', { count: result.length });
    } catch (error) {
      AppLogger.error('Failed to load exercises', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadExercises(true);
    }
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
    >
      <BlurView intensity={25} tint="light" style={styles.exerciseCard}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <View style={styles.exerciseTags}>
              <View style={styles.tag}>
                <Icon name="body-outline" size={12} color="white" />
                <Text style={styles.tagText}>{item.muscles[0]}</Text>
              </View>
              <View style={styles.tag}>
                <Icon name="barbell-outline" size={12} color="white" />
                <Text style={styles.tagText}>{item.equipment}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
        {item.description && (
          <Text style={styles.exerciseDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </BlurView>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#667eea';
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <TouchableOpacity>
          <Icon name="add-circle" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <BlurView intensity={20} tint="light" style={styles.searchContainer}>
        <Icon name="search" size={20} color="rgba(255,255,255,0.8)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search 10,000+ exercises..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </BlurView>

      {/* Muscle Groups */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.muscleGroupsContainer}
      >
        {muscleGroups.map((muscle) => (
          <TouchableOpacity
            key={muscle.id}
            onPress={() => setSelectedMuscle(muscle.id)}
          >
            <BlurView
              intensity={selectedMuscle === muscle.id ? 40 : 20}
              tint="light"
              style={[
                styles.muscleGroupChip,
                selectedMuscle === muscle.id && styles.selectedMuscleGroup,
              ]}
            >
              <Icon
                name={muscle.icon}
                size={20}
                color={selectedMuscle === muscle.id ? 'white' : 'rgba(255,255,255,0.8)'}
              />
              <Text style={styles.muscleGroupText}>{muscle.name}</Text>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise List */}
      {loading && exercises.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.exerciseList}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator style={styles.loadMoreIndicator} color="white" />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="barbell-outline" size={60} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>No exercises found</Text>
            </View>
          }
        />
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: 'white',
  },
  muscleGroupsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  muscleGroupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    overflow: 'hidden',
  },
  selectedMuscleGroup: {
    borderWidth: 2,
    borderColor: 'white',
  },
  muscleGroupText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  exerciseList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  exerciseCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
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
  exerciseDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 12,
  },
  loadMoreIndicator: {
    marginVertical: 20,
  },
});

export default ExerciseLibraryScreen;