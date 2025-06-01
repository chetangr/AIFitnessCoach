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
import { exerciseService } from '../services/exerciseService';
import { WorkoutProgram } from '../data/exercisesDatabase';

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
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'Programs' | 'Exercises'>('Programs');

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
    if (activeTab === 'Exercises') {
      loadExercises();
    } else {
      loadPrograms();
    }
  }, [selectedMuscle, page, activeTab, searchQuery]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await exerciseService.getExercises({
        muscle: selectedMuscle === 'All' ? undefined : selectedMuscle,
        page,
        limit: 20,
        search: searchQuery,
      });
      
      if (page === 1) {
        setExercises(data);
      } else {
        setExercises([...exercises, ...data]);
      }
    } catch (error) {
      console.error('Failed to load exercises', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const data = await exerciseService.getPrograms({
        category: selectedMuscle === 'All' ? undefined : selectedMuscle,
        page,
        limit: 20,
        search: searchQuery,
      });
      
      if (page === 1) {
        setPrograms(data);
      } else {
        setPrograms([...programs, ...data]);
      }
    } catch (error) {
      console.error('Failed to load programs', error);
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
    setPage(1);
    if (activeTab === 'Exercises') {
      loadExercises();
    } else {
      loadPrograms();
    }
  };

  const resetAndLoad = () => {
    setPage(1);
    setExercises([]);
    setPrograms([]);
    if (activeTab === 'Exercises') {
      loadExercises();
    } else {
      loadPrograms();
    }
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

  const renderProgramCard = ({ item }: { item: WorkoutProgram }) => (
    <TouchableOpacity
      onPress={() => {
        console.log('Program Selected', item);
        navigation.navigate('ProgramDetail', { program: item });
      }}
    >
      <BlurView intensity={20} tint="light" style={styles.programCard}>
        <View style={styles.programHeader}>
          <View style={styles.programInfo}>
            <Text style={styles.programName}>{item.name}</Text>
            <Text style={styles.programDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => {
              console.log('Play Program', item);
              navigation.navigate('ActiveWorkout', { program: item });
            }}
          >
            <LinearGradient colors={['#FF6B6B', '#ff5722']} style={styles.playGradient}>
              <Icon name="play" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.programDetails}>
          <View style={styles.programTag}>
            <Icon name="time" size={14} color="white" />
            <Text style={styles.programTagText}>{item.duration}</Text>
          </View>
          <View style={styles.programTag}>
            <Icon name="fitness" size={14} color="white" />
            <Text style={styles.programTagText}>{item.exercises.length} exercises</Text>
          </View>
          <View style={styles.programTag}>
            <Icon name="flame" size={14} color="white" />
            <Text style={styles.programTagText}>{item.estimatedCalories} cal</Text>
          </View>
        </View>
        
        <View style={styles.programMeta}>
          <View style={[styles.levelBadge, { backgroundColor: getDifficultyColor(item.level) }]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
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
      <FlatList
        ListHeaderComponent={
          <>
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
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </BlurView>

      {/* Programs/Exercises Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => {
            setActiveTab('Programs');
            resetAndLoad();
          }}
        >
          <BlurView
            intensity={activeTab === 'Programs' ? 40 : 20}
            tint="light"
            style={[
              styles.tabButton,
              activeTab === 'Programs' && styles.activeTab,
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'Programs' && styles.activeTabText
            ]}>
              Programs
            </Text>
          </BlurView>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            setActiveTab('Exercises');
            resetAndLoad();
          }}
        >
          <BlurView
            intensity={activeTab === 'Exercises' ? 40 : 20}
            tint="light"
            style={[
              styles.tabButton,
              activeTab === 'Exercises' && styles.activeTab,
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'Exercises' && styles.activeTabText
            ]}>
              Exercises
            </Text>
          </BlurView>
        </TouchableOpacity>
      </View>

            {/* Popular Workouts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Workouts</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={popularWorkouts}
                renderItem={({ item, index }) => (
                  <TouchableOpacity key={index}>
                    <BlurView intensity={25} tint="light" style={styles.popularCard}>
                      <LinearGradient
                        colors={[item.color, item.color + 'aa']}
                        style={styles.popularIcon}
                      >
                        <Icon name={item.icon} size={28} color="white" />
                      </LinearGradient>
                      <Text style={styles.popularName}>{item.name}</Text>
                    </BlurView>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>

            {/* Muscle Groups */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.muscleGroupsContainer}
              data={muscleGroups}
              renderItem={({ item: muscle }) => (
                <TouchableOpacity
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
              )}
              keyExtractor={(item) => item}
            />
          </>
        }
        data={activeTab === 'Exercises' ? exercises : programs}
        renderItem={activeTab === 'Exercises' ? renderExerciseCard : renderProgramCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={() => setPage(page + 1)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading && page > 1 ? <ActivityIndicator color="white" /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon 
                name={activeTab === 'Exercises' ? "barbell-outline" : "list-outline"} 
                size={60} 
                color="rgba(255,255,255,0.5)" 
              />
              <Text style={styles.emptyText}>
                No {activeTab.toLowerCase()} found
              </Text>
            </View>
          ) : null
        }
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  activeTab: {
    borderWidth: 2,
    borderColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  contentList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  programCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  programInfo: {
    flex: 1,
    marginRight: 16,
  },
  programName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  programDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
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
  programDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  programTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  programTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  programMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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