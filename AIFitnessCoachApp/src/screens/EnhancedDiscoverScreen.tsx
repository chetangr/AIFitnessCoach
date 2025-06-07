import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
  Modal,
  Dimensions,
  Platform,
  SectionList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { searchExercises, comprehensiveExerciseDatabase, Exercise } from '../data/comprehensiveExerciseDatabase';
import { SAFE_BOTTOM_PADDING } from '../constants/layout';
import { useThemeStore } from '../store/themeStore';

const { width } = Dimensions.get('window');

const programs = [
  {
    id: '1',
    title: '12 Week Transformation',
    description: 'Complete body transformation program',
    duration: '12 weeks',
    level: 'Intermediate',
    image: 'https://via.placeholder.com/300x200',
    trainer: 'Mike Johnson',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Beginner Strength',
    description: 'Build foundational strength',
    duration: '8 weeks',
    level: 'Beginner',
    image: 'https://via.placeholder.com/300x200',
    trainer: 'Sarah Davis',
    rating: 4.9,
  },
  {
    id: '3',
    title: 'HIIT Shred',
    description: 'High intensity fat burning',
    duration: '6 weeks',
    level: 'Advanced',
    image: 'https://via.placeholder.com/300x200',
    trainer: 'Alex Chen',
    rating: 4.7,
  },
];

const muscleGroups = [
  { id: '1', name: 'Chest', icon: '💪' },
  { id: '2', name: 'Back', icon: '🔙' },
  { id: '3', name: 'Shoulders', icon: '🦾' },
  { id: '4', name: 'Arms', icon: '💪' },
  { id: '5', name: 'Legs', icon: '🦵' },
  { id: '6', name: 'Core', icon: '🎯' },
];

const EnhancedDiscoverScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search exercises when query or filters change
  React.useEffect(() => {
    if (activeTab === 'exercises') {
      handleExerciseSearch();
    }
  }, [searchQuery, selectedMuscle, activeTab]);

  const handleExerciseSearch = () => {
    setIsSearching(true);
    
    const filters: any = {};
    if (selectedMuscle !== 'all') {
      filters.muscleGroup = selectedMuscle;
    }

    const results = searchExercises(searchQuery, filters);
    // Limit results to first 50 for performance
    setSearchResults(results.slice(0, 50));
    setIsSearching(false);
  };

  const renderProgram = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.programCard}
      onPress={() => navigation.navigate('ProgramDetail', { 
        program: {
          id: item.id,
          name: item.title,
          description: item.description,
          duration: item.duration,
          level: item.level,
          trainer: item.trainer,
          rating: item.rating,
          image: item.image
        }
      })}
    >
      <Image source={{ uri: item.image }} style={styles.programImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.programGradient}
      >
        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>{item.title}</Text>
          <Text style={styles.programDescription}>{item.description}</Text>
          <View style={styles.programMeta}>
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={14} color="#fff" />
              <Text style={styles.metaText}>{item.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="bar-chart-outline" size={14} color="#fff" />
              <Text style={styles.metaText}>{item.level}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.metaText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
    >
      <BlurView intensity={40} tint="dark" style={styles.exerciseContent}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseIcon}>
            <Icon name="fitness" size={24} color={theme.colors.primary.main} />
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.exerciseCategory}>{item.category}</Text>
          </View>
          <View style={styles.exerciseMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.difficultyText}>{item.difficulty[0]}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.exerciseDetails}>
          <View style={styles.exerciseDetailRow}>
            <Icon name="body" size={14} color="rgba(0,0,0,0.6)" />
            <Text style={styles.exerciseDetailText}>
              {item.primaryMuscles.slice(0, 2).join(', ')}
            </Text>
          </View>
          <View style={styles.exerciseDetailRow}>
            <Icon name="barbell" size={14} color="rgba(0,0,0,0.6)" />
            <Text style={styles.exerciseDetailText}>{item.equipment}</Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return theme.colors.success;
      case 'Intermediate': return theme.colors.warning;
      case 'Advanced': return theme.colors.error;
      default: return theme.colors.primary.main;
    }
  };

  return (
    <LinearGradient colors={theme.colors.primary.gradient as [string, string, string]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>10,000+ Exercises & Programs</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <BlurView intensity={40} tint="dark" style={styles.tabBlurContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'programs' && styles.activeTab]}
            onPress={() => setActiveTab('programs')}
          >
            <Text style={[styles.tabText, activeTab === 'programs' && styles.activeTabText]}>
              Programs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'exercises' && styles.activeTab]}
            onPress={() => setActiveTab('exercises')}
          >
            <Text style={[styles.tabText, activeTab === 'exercises' && styles.activeTabText]}>
              Exercises
            </Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <BlurView intensity={40} tint="dark" style={styles.searchBar}>
          <Icon name="search" size={20} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </BlurView>
      </View>

      {activeTab === 'programs' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SAFE_BOTTOM_PADDING }}>
          {/* Custom Programs Button */}
          <TouchableOpacity 
            style={styles.customProgramsButton}
            onPress={() => navigation.navigate('Programs')}
          >
            <LinearGradient
              colors={[theme.colors.primary.gradient[0], theme.colors.primary.gradient[1]]}
              style={styles.customProgramsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="create-outline" size={24} color="white" />
              <Text style={styles.customProgramsText}>Create & Manage Custom Programs</Text>
              <Icon name="chevron-forward" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Featured Programs</Text>
          <FlatList
            horizontal
            data={programs}
            renderItem={renderProgram}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.programList}
            scrollEnabled={false}
          />

          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.categoryGrid}>
            {['Strength', 'Cardio', 'Yoga', 'Flexibility'].map((category) => (
              <TouchableOpacity 
                key={category} 
                style={styles.categoryCard}
                onPress={() => {
                  setSearchQuery(category.toLowerCase());
                  setActiveTab('exercises');
                  console.log(`Filter by category: ${category}`);
                }}
              >
                <BlurView intensity={40} tint="dark" style={styles.categoryGradient}>
                  <Text style={styles.categoryText}>{category}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={searchResults}
            renderItem={renderExercise}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.exerciseRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: SAFE_BOTTOM_PADDING }}
            ListHeaderComponent={
              <>
                <Text style={styles.sectionTitle}>Filter by Muscle Group</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleFilter}>
                  <TouchableOpacity onPress={() => setSelectedMuscle('all')}>
                    <BlurView
                      intensity={selectedMuscle === 'all' ? 60 : 40}
                      tint="dark"
                      style={[styles.muscleChip, selectedMuscle === 'all' && styles.muscleChipActive]}
                    >
                      <Text style={[styles.muscleChipText, selectedMuscle === 'all' && styles.muscleChipTextActive]}>
                        All
                      </Text>
                    </BlurView>
                  </TouchableOpacity>
                  {muscleGroups.map((muscle) => (
                    <TouchableOpacity
                      key={muscle.id}
                      onPress={() => setSelectedMuscle(muscle.id)}
                    >
                      <BlurView
                        intensity={selectedMuscle === muscle.id ? 60 : 40}
                        tint="dark"
                        style={[styles.muscleChip, selectedMuscle === muscle.id && styles.muscleChipActive]}
                      >
                        <Text style={styles.muscleIcon}>{muscle.icon}</Text>
                        <Text style={[styles.muscleChipText, selectedMuscle === muscle.id && styles.muscleChipTextActive]}>
                          {muscle.name}
                        </Text>
                      </BlurView>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>
                  Exercise Library ({searchResults.length} exercises)
                </Text>
                {isSearching && (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Searching exercises...</Text>
                  </View>
                )}
              </>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search" size={60} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No exercises found' : 'Start typing to search exercises'}
                </Text>
              </View>
            }
          />
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  tabContainer: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  tabBlurContainer: {
    flexDirection: 'row',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    borderWidth: 2,
    borderColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  programList: {
    paddingLeft: 20,
  },
  programCard: {
    width: width * 0.7,
    height: 200,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  programImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  programGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 15,
  },
  programInfo: {
    
  },
  programTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  programDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    height: 80,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  categoryGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  muscleFilter: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  muscleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  muscleChipActive: {
    borderWidth: 2,
    borderColor: 'white',
  },
  muscleIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  muscleChipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  muscleChipTextActive: {
    color: '#fff',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
  },
  exerciseCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  exerciseContent: {
    padding: 15,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#666',
  },
  exerciseMeta: {
    alignItems: 'center',
  },
  difficultyBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  exerciseDetails: {
    gap: 6,
  },
  exerciseDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseDetailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  exerciseRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  customProgramsButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  customProgramsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  customProgramsText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    marginHorizontal: 12,
  },
});

export default EnhancedDiscoverScreen;