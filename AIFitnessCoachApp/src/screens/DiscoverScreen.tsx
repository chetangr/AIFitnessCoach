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
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { exerciseService } from '../services/exerciseService';
import { WorkoutProgram } from '../data/exercisesDatabase';
import { useThemeStore } from '../store/themeStore';

const { width } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscles: string[];
  equipment: string;
  difficulty: string;
}

const DiscoverScreen = ({ navigation }: any) => {
  const { isDarkMode } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'Programs' | 'Exercises'>('Programs');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [trendingAnimValue] = useState(new Animated.Value(0));
  const [challengeAnimValue] = useState(new Animated.Value(0));

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

  const trendingWorkouts = [
    { 
      name: 'HIIT Fusion', 
      icon: 'flash', 
      color: ['#FF6B6B', '#ff8787'], 
      difficulty: 'Intermediate',
      duration: '20 min',
      participants: '12.3k',
      trend: '+15%'
    },
    { 
      name: 'Strength Builder', 
      icon: 'barbell', 
      color: ['#4ECDC4', '#6fdddc'], 
      difficulty: 'Beginner',
      duration: '35 min',
      participants: '8.7k',
      trend: '+8%'
    },
    { 
      name: 'Core Crusher', 
      icon: 'body', 
      color: ['#45B7D1', '#74c7e3'], 
      difficulty: 'Advanced',
      duration: '15 min',
      participants: '15.2k',
      trend: '+22%'
    },
    { 
      name: 'Cardio Blast', 
      icon: 'heart', 
      color: ['#96CEB4', '#a8d4c2'], 
      difficulty: 'Intermediate',
      duration: '25 min',
      participants: '9.8k',
      trend: '+11%'
    },
  ];

  const challenges = [
    {
      id: '1',
      title: '30-Day Push-Up Challenge',
      description: 'Build upper body strength with progressive push-ups',
      participants: '25.6k',
      daysLeft: 12,
      progress: 0.6,
      reward: '🏆 Badge',
      color: ['#667eea', '#764ba2'],
    },
    {
      id: '2',
      title: 'Plank Masters',
      description: 'Hold planks longer and strengthen your core',
      participants: '18.2k',
      daysLeft: 8,
      progress: 0.8,
      reward: '🎖️ Medal',
      color: ['#f093fb', '#f5576c'],
    },
  ];

  const aiSuggestions = [
    {
      id: '1',
      title: 'Morning Energy Boost',
      subtitle: 'Based on your sleep pattern',
      icon: 'sunny',
      color: ['#ffeaa7', '#fdcb6e'],
      exercises: 5,
      duration: '10 min'
    },
    {
      id: '2',
      title: 'Stress Relief Flow',
      subtitle: 'Recommended for today',
      icon: 'leaf',
      color: ['#00b894', '#00a085'],
      exercises: 8,
      duration: '15 min'
    },
  ];

  useEffect(() => {
    if (activeTab === 'Exercises') {
      loadExercises();
    } else {
      loadPrograms();
    }
  }, [selectedMuscle, page, activeTab, searchQuery]);

  useEffect(() => {
    // Start trending animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(trendingAnimValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(trendingAnimValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start challenge animation
    Animated.loop(
      Animated.timing(challengeAnimValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

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

  const _getSampleExercises = (): Exercise[] => {
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

  const renderTrendingCard = ({ item, index }: { item: any, index: number }) => {
    const scale = trendingAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.trendingCard,
          { transform: [{ scale: index === 0 ? scale : 1 }] }
        ]}
      >
        <TouchableOpacity
          onPress={() => console.log('Trending workout selected:', item.name)}
        >
          <LinearGradient colors={item.color} style={styles.trendingGradient}>
            <BlurView intensity={25} tint="light" style={styles.trendingContent}>
              <View style={styles.trendingHeader}>
                <View style={styles.trendingIconContainer}>
                  <Icon name={item.icon} size={24} color="white" />
                </View>
                <View style={styles.trendingBadge}>
                  <Text style={styles.trendingText}>{item.trend}</Text>
                  <Icon name="trending-up" size={12} color="#4CAF50" />
                </View>
              </View>
              
              <Text style={styles.trendingName}>{item.name}</Text>
              
              <View style={styles.trendingStats}>
                <View style={styles.trendingStatItem}>
                  <Icon name="time" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.trendingStatText}>{item.duration}</Text>
                </View>
                <View style={styles.trendingStatItem}>
                  <Icon name="people" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.trendingStatText}>{item.participants}</Text>
                </View>
              </View>
              
              <View style={[styles.difficultyPill, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                <Text style={styles.difficultyPillText}>{item.difficulty}</Text>
              </View>
            </BlurView>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderChallengeCard = ({ item }: { item: any }) => {
    const progressAnimation = challengeAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, item.progress],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity style={styles.challengeCard}>
        <LinearGradient colors={item.color} style={styles.challengeGradient}>
          <BlurView intensity={30} tint="light" style={styles.challengeContent}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{item.title}</Text>
                <Text style={styles.challengeDescription}>{item.description}</Text>
              </View>
              <Text style={styles.challengeReward}>{item.reward}</Text>
            </View>
            
            <View style={styles.challengeStats}>
              <View style={styles.challengeStatItem}>
                <Text style={styles.challengeStatLabel}>Participants</Text>
                <Text style={styles.challengeStatValue}>{item.participants}</Text>
              </View>
              <View style={styles.challengeStatItem}>
                <Text style={styles.challengeStatLabel}>Days Left</Text>
                <Text style={styles.challengeStatValue}>{item.daysLeft}</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { 
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      })
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{Math.round(item.progress * 100)}% Complete</Text>
            </View>
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderAISuggestion = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.aiSuggestionCard}>
      <LinearGradient colors={item.color} style={styles.aiSuggestionGradient}>
        <BlurView intensity={25} tint="light" style={styles.aiSuggestionContent}>
          <View style={styles.aiSuggestionHeader}>
            <View style={styles.aiIconContainer}>
              <Icon name={item.icon} size={20} color="white" />
            </View>
            <View style={styles.aiLabel}>
              <Icon name="sparkles" size={12} color="#FFD700" />
              <Text style={styles.aiLabelText}>AI</Text>
            </View>
          </View>
          
          <Text style={styles.aiSuggestionTitle}>{item.title}</Text>
          <Text style={styles.aiSuggestionSubtitle}>{item.subtitle}</Text>
          
          <View style={styles.aiSuggestionFooter}>
            <View style={styles.aiSuggestionStat}>
              <Icon name="fitness" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.aiSuggestionStatText}>{item.exercises} exercises</Text>
            </View>
            <View style={styles.aiSuggestionStat}>
              <Icon name="time" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.aiSuggestionStatText}>{item.duration}</Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSearchModal = () => (
    <Modal
      visible={showSearchModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSearchModal(false)}
    >
      <View style={styles.searchModalOverlay}>
        <BlurView intensity={80} tint={isDarkMode ? "dark" : "light"} style={styles.searchModalContainer}>
          <View style={styles.searchModalHeader}>
            <Text style={styles.searchModalTitle}>Search {activeTab}</Text>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search for ${activeTab.toLowerCase()}...`}
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => {
              handleSearch();
              setShowSearchModal(false);
            }}
          >
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.searchButtonGradient}>
              <Text style={styles.searchButtonText}>Search</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );

  const gradientColors = isDarkMode 
    ? ['#0f0c29', '#302b63', '#24243e'] as const
    : ['#667eea', '#764ba2'] as const;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Fitness</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ExerciseLibrary')}>
            <BlurView intensity={25} tint="light" style={styles.libraryButton}>
              <Icon name="library-outline" size={20} color="white" />
              <Text style={styles.libraryButtonText}>Full Library</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Compact Search & Toggle Row */}
        <View style={styles.compactSearchRow}>
          <TouchableOpacity 
            onPress={() => setShowSearchModal(true)}
            style={styles.searchButtonContainer}
          >
            <BlurView intensity={30} tint="light" style={styles.searchButtonContent}>
              <Icon name="search" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.searchInputText}>Search {activeTab.toLowerCase()}...</Text>
            </BlurView>
          </TouchableOpacity>

          <BlurView intensity={30} tint="light" style={styles.compactTabContainer}>
            <TouchableOpacity
              onPress={() => {
                setActiveTab('Programs');
                resetAndLoad();
              }}
              style={[
                styles.compactTabButton,
                activeTab === 'Programs' && styles.activeCompactTab,
              ]}
            >
              <Text style={[
                styles.compactTabText,
                activeTab === 'Programs' && styles.activeCompactTabText,
              ]}>Programs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                setActiveTab('Exercises');
                resetAndLoad();
              }}
              style={[
                styles.compactTabButton,
                activeTab === 'Exercises' && styles.activeCompactTab,
              ]}
            >
              <Text style={[
                styles.compactTabText,
                activeTab === 'Exercises' && styles.activeCompactTabText,
              ]}>Exercises</Text>
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* AI Suggestions */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>AI Suggestions</Text>
            <View style={styles.aiIconBadge}>
              <Icon name="sparkles" size={14} color="#FFD700" />
            </View>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={aiSuggestions}
            renderItem={renderAISuggestion}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Trending Now */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <View style={styles.trendingBadgeSmall}>
              <Icon name="trending-up" size={14} color="#4CAF50" />
              <Text style={styles.trendingBadgeText}>HOT</Text>
            </View>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={trendingWorkouts}
            renderItem={renderTrendingCard}
            keyExtractor={(_item, index) => index.toString()}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Active Challenges */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={challenges}
            renderItem={renderChallengeCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Muscle Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Muscle Groups</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
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
                  intensity={selectedMuscle === muscle ? 40 : 25}
                  tint="light"
                  style={[
                    styles.muscleChip,
                    selectedMuscle === muscle && styles.selectedMuscleChip,
                  ]}
                >
                  <Text style={[
                    styles.muscleText,
                    selectedMuscle === muscle && styles.selectedMuscleText
                  ]}>{muscle}</Text>
                </BlurView>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Main Content */}
        <View style={styles.mainContentSection}>
          <Text style={styles.sectionTitle}>
            {activeTab} {selectedMuscle !== 'All' ? `• ${selectedMuscle}` : ''}
          </Text>
          
          {loading && page === 1 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Loading {activeTab.toLowerCase()}...</Text>
            </View>
          ) : (
            <View style={styles.contentGrid}>
              {(activeTab === 'Exercises' ? exercises : programs).map((item, _index) => (
                <View key={item.id}>
                  {activeTab === 'Exercises' 
                    ? renderExerciseCard({ item: item as Exercise })
                    : renderProgramCard({ item: item as WorkoutProgram })
                  }
                </View>
              ))}
              
              {loading && page > 1 && (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator color="white" />
                  <Text style={styles.loadMoreText}>Loading more...</Text>
                </View>
              )}
              
              {!loading && (activeTab === 'Exercises' ? exercises : programs).length === 0 && (
                <View style={styles.emptyContainer}>
                  <Icon 
                    name={activeTab === 'Exercises' ? "barbell-outline" : "list-outline"} 
                    size={60} 
                    color="rgba(255,255,255,0.5)" 
                  />
                  <Text style={styles.emptyText}>
                    No {activeTab.toLowerCase()} found
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Try adjusting your search or filters
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {renderSearchModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
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
  compactSearchRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  searchButtonContainer: {
    flex: 1,
  },
  searchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchInputText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  compactTabContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 2,
  },
  compactTabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  activeCompactTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  compactTabText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  activeCompactTabText: {
    color: 'white',
    fontWeight: '600',
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
  
  // New Modern Styles
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  aiIconBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendingBadgeText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  
  // Trending Cards
  trendingCard: {
    width: width * 0.4,
    marginRight: 16,
  },
  trendingGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  trendingContent: {
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trendingText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendingName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  trendingStats: {
    gap: 8,
    marginBottom: 12,
  },
  trendingStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendingStatText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  difficultyPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  difficultyPillText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Challenge Cards
  challengeCard: {
    width: width * 0.8,
    marginRight: 16,
  },
  challengeGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  challengeContent: {
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  challengeInfo: {
    flex: 1,
    marginRight: 12,
  },
  challengeTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  challengeDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  challengeReward: {
    fontSize: 24,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  challengeStatItem: {
    alignItems: 'center',
  },
  challengeStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  challengeStatValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    gap: 8,
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  
  // AI Suggestion Cards
  aiSuggestionCard: {
    width: width * 0.45,
    marginRight: 16,
  },
  aiSuggestionGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiSuggestionContent: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiSuggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  aiLabelText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
  },
  aiSuggestionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiSuggestionSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 12,
  },
  aiSuggestionFooter: {
    gap: 6,
  },
  aiSuggestionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiSuggestionStatText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  
  // Search Modal
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  searchModalContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchModalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  searchButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Main Content
  mainContentSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  contentGrid: {
    gap: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 12,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadMoreText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedMuscleText: {
    fontWeight: 'bold',
  },
});

export default DiscoverScreen;