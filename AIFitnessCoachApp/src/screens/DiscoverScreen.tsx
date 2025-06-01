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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
// Logger temporarily removed - was causing import errors
import { exerciseService } from '../services/exerciseService';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscles: string[];
  equipment: string;
  difficulty: string;
}

const DiscoverScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [page, setPage] = useState(1);

  const muscleGroups = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Arms',
    'Legs',
    'Core',
    'Glutes',
  ];

  const popularWorkouts = [
    { name: 'Push Day', icon: 'trending-up', color: '#FF6B6B' },
    { name: 'Pull Day', icon: 'trending-down', color: '#4ECDC4' },
    { name: 'Leg Day', icon: 'footsteps', color: '#45B7D1' },
    { name: 'Core Blast', icon: 'body', color: '#96CEB4' },
  ];

  useEffect(() => {
    loadExercises();
  }, [selectedMuscle, page]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await exerciseService.getExercises({
        muscle: selectedMuscle === 'All' ? undefined : selectedMuscle,
        page,
        limit: 20,
      });
      
      if (page === 1) {
        setExercises(data);
      } else {
        setExercises([...exercises, ...data]);
      }
    } catch (error) {
      console.error('Failed to load exercises', error);
      // Use sample data as fallback
      setExercises(getSampleExercises());
    } finally {
      setLoading(false);
    }
  };

  const getSampleExercises = (): Exercise[] => {
    return [
      { id: '1', name: 'Bench Press', category: 'Chest', muscles: ['Chest', 'Triceps'], equipment: 'Barbell', difficulty: 'Intermediate' },
      { id: '2', name: 'Squats', category: 'Legs', muscles: ['Quads', 'Glutes'], equipment: 'Barbell', difficulty: 'Intermediate' },
      { id: '3', name: 'Deadlifts', category: 'Back', muscles: ['Back', 'Hamstrings'], equipment: 'Barbell', difficulty: 'Advanced' },
      { id: '4', name: 'Pull-ups', category: 'Back', muscles: ['Lats', 'Biceps'], equipment: 'Pull-up Bar', difficulty: 'Intermediate' },
      { id: '5', name: 'Shoulder Press', category: 'Shoulders', muscles: ['Shoulders'], equipment: 'Dumbbells', difficulty: 'Beginner' },
      { id: '6', name: 'Bicep Curls', category: 'Arms', muscles: ['Biceps'], equipment: 'Dumbbells', difficulty: 'Beginner' },
      { id: '7', name: 'Tricep Dips', category: 'Arms', muscles: ['Triceps'], equipment: 'Dip Station', difficulty: 'Intermediate' },
      { id: '8', name: 'Plank', category: 'Core', muscles: ['Core'], equipment: 'None', difficulty: 'Beginner' },
      { id: '9', name: 'Mountain Climbers', category: 'Core', muscles: ['Core', 'Cardio'], equipment: 'None', difficulty: 'Beginner' },
      { id: '10', name: 'Lunges', category: 'Legs', muscles: ['Quads', 'Glutes'], equipment: 'None', difficulty: 'Beginner' },
    ];
  };

  const handleSearch = () => {
    console.log('Exercise Search', { query: searchQuery });
    // Implement search functionality
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      onPress={() => {
        console.log('Exercise Selected', item);
        navigation.navigate('ExerciseDetail', { exercise: item });
      }}
    >
      <BlurView intensity={20} tint="light" style={styles.exerciseCard}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Icon name="chevron-forward" size={20} color="white" />
        </View>
        
        <View style={styles.exerciseDetails}>
          <View style={styles.exerciseTag}>
            <Icon name="body" size={14} color="white" />
            <Text style={styles.exerciseTagText}>{item.muscles.join(', ')}</Text>
          </View>
          <View style={styles.exerciseTag}>
            <Icon name="barbell" size={14} color="white" />
            <Text style={styles.exerciseTagText}>{item.equipment}</Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>10,000+ Exercises</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ExerciseLibrary')}>
          <BlurView intensity={20} tint="light" style={styles.libraryButton}>
            <Icon name="library-outline" size={20} color="white" />
            <Text style={styles.libraryButtonText}>Full Library</Text>
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <BlurView intensity={30} tint="light" style={styles.searchContainer}>
        <Icon name="search" size={20} color="rgba(255,255,255,0.6)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </BlurView>

      {/* Popular Workouts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Workouts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {popularWorkouts.map((workout, index) => (
            <TouchableOpacity key={index}>
              <BlurView intensity={25} tint="light" style={styles.popularCard}>
                <LinearGradient
                  colors={[workout.color, workout.color + 'aa']}
                  style={styles.popularIcon}
                >
                  <Icon name={workout.icon} size={28} color="white" />
                </LinearGradient>
                <Text style={styles.popularName}>{workout.name}</Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Muscle Groups */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.muscleGroupsContainer}
      >
        {muscleGroups.map((muscle) => (
          <TouchableOpacity
            key={muscle}
            onPress={() => {
              setSelectedMuscle(muscle);
              setPage(1);
              console.log('Muscle Group Selected', { muscle });
            }}
          >
            <BlurView
              intensity={selectedMuscle === muscle ? 40 : 20}
              tint="light"
              style={[
                styles.muscleChip,
                selectedMuscle === muscle && styles.selectedMuscleChip,
              ]}
            >
              <Text style={styles.muscleText}>{muscle}</Text>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercises List */}
      <View style={styles.exercisesList}>
        {loading && page === 1 ? (
          <ActivityIndicator size="large" color="white" style={styles.loader} />
        ) : (
          <FlatList
            data={exercises}
            renderItem={renderExerciseCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            onEndReached={() => setPage(page + 1)}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              loading && page > 1 ? <ActivityIndicator color="white" /> : null
            }
          />
        )}
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
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
    marginBottom: 12,
  },
  popularCard: {
    width: 120,
    padding: 16,
    marginLeft: 20,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  popularIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  popularName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  muscleGroupsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  muscleChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    overflow: 'hidden',
  },
  selectedMuscleChip: {
    borderWidth: 2,
    borderColor: 'white',
  },
  muscleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    padding: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  exerciseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseTagText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  loader: {
    marginTop: 50,
  },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    gap: 6,
  },
  libraryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DiscoverScreen;