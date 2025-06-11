import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageBackground,
  Animated,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStaggeredEntrance, useFadeIn } from '../utils/animations';
import { useThemeStore } from '../store/themeStore';
import { 
  LiquidGlassView, 
  LiquidButton, 
  LiquidCard
} from '../components/glass';
import { wgerExercises, WgerExercise } from '../data/wgerExerciseDatabase';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Use WgerExercise type from the database
type Exercise = WgerExercise;

interface ActivityType {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string[];
  category?: string;
}

interface Program {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  duration: string;
  difficulty: string;
  gradient: string[];
}

const LiquidDiscoverScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const { colors } = theme;
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useFadeIn(0);
  const itemAnimations = useStaggeredEntrance(8);
  const [activeTab, setActiveTab] = useState('Explore');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [recommendedExercises, setRecommendedExercises] = useState<Exercise[]>([]);
  const [savedExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [programs, setPrograms] = useState<Program[]>([]);

  // Enhanced activity types with proper categories
  const activityTypes: ActivityType[] = [
    { id: '1', name: 'Strength', icon: 'barbell', gradient: ['#FF6B6B', '#FF5252'], color: '#FF6B6B', category: 'strength' },
    { id: '2', name: 'Cardio', icon: 'bicycle', gradient: ['#4ECDC4', '#44A08D'], color: '#4ECDC4', category: 'cardio' },
    { id: '3', name: 'Yoga', icon: 'body', gradient: ['#A8E6CF', '#7FD8BE'], color: '#A8E6CF', category: 'flexibility' },
    { id: '4', name: 'HIIT', icon: 'flash', gradient: ['#FFD93D', '#F6BD60'], color: '#FFD93D', category: 'hiit' },
    { id: '5', name: 'Core', icon: 'fitness', gradient: ['#6C5CE7', '#5F3DC4'], color: '#6C5CE7', category: 'core' },
    { id: '6', name: 'Recovery', icon: 'leaf', gradient: ['#81C784', '#66BB6A'], color: '#81C784', category: 'recovery' },
  ];

  const collections = [
    { id: '1', title: 'Quick Workouts', count: 25 },
    { id: '2', title: 'No Equipment', count: 40 },
    { id: '3', title: 'Gym Essentials', count: 60 },
  ];

  // Helper functions for exercise data
  const getExercisesByCategory = (category: string): Exercise[] => {
    return wgerExercises.filter((exercise) => {
      const categoryLower = category.toLowerCase();
      if (categoryLower === 'strength') {
        return exercise.category.toLowerCase() === 'arms' || 
               exercise.category.toLowerCase() === 'chest' || 
               exercise.category.toLowerCase() === 'shoulders' ||
               exercise.category.toLowerCase() === 'back';
      }
      if (categoryLower === 'cardio') {
        return exercise.category.toLowerCase() === 'cardio';
      }
      if (categoryLower === 'core') {
        return exercise.category.toLowerCase() === 'abs' || 
               exercise.category.toLowerCase() === 'core';
      }
      if (categoryLower === 'flexibility' || categoryLower === 'recovery') {
        return exercise.category.toLowerCase() === 'stretching' || 
               exercise.category.toLowerCase() === 'flexibility';
      }
      if (categoryLower === 'hiit') {
        return exercise.category.toLowerCase() === 'plyometrics' || 
               exercise.difficulty === 'Advanced';
      }
      return exercise.category.toLowerCase() === categoryLower;
    });
  };

  const getRandomExercises = (count: number): Exercise[] => {
    const shuffled = [...wgerExercises].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Load exercises and programs from local database
  useEffect(() => {
    loadExercises();
    loadPrograms();
    loadRecommendedExercises();
  }, [selectedCategory]);

  const loadExercises = () => {
    setLoading(true);
    try {
      let loadedExercises: Exercise[] = [];
      
      if (selectedCategory) {
        loadedExercises = getExercisesByCategory(selectedCategory);
      } else {
        loadedExercises = getRandomExercises(20);
      }
      
      setExercises(loadedExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendedExercises = () => {
    try {
      const recommended = getRandomExercises(5);
      setRecommendedExercises(recommended);
    } catch (error) {
      console.error('Error loading recommended exercises:', error);
    }
  };

  const loadPrograms = () => {
    const samplePrograms: Program[] = [
      {
        id: '1',
        title: 'Beginner Strength',
        subtitle: '3 days/week',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
        duration: '4 weeks',
        difficulty: 'Beginner',
        gradient: ['#667eea', '#764ba2'],
      },
      {
        id: '2',
        title: 'HIIT Challenge',
        subtitle: '5 days/week',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a',
        duration: '6 weeks',
        difficulty: 'Advanced',
        gradient: ['#f093fb', '#f5576c'],
      },
      {
        id: '3',
        title: 'Yoga Flow',
        subtitle: '7 days/week',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
        duration: '30 days',
        difficulty: 'All Levels',
        gradient: ['#4facfe', '#00f2fe'],
      },
    ];
    setPrograms(samplePrograms);
  };

  const handleTabChange = (tab: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const handleActivityPress = (activity: ActivityType) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(activity.category || '');
  };

  const renderActivityType = ({ item, index }: { item: ActivityType; index: number }) => (
    <Animated.View
      style={[
        { 
          opacity: itemAnimations[index % itemAnimations.length],
          transform: [{
            translateY: itemAnimations[index % itemAnimations.length].interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          }],
        }
      ]}
    >
      <TouchableOpacity onPress={() => handleActivityPress(item)}>
        <LiquidGlassView 
          intensity={60} 
          
          
          style={styles.activityCard}
        >
          <LinearGradient
            colors={item.gradient as [string, string, ...string[]]}
            style={styles.activityGradient}
          >
            <Icon name={item.icon} size={32} color="white" />
          </LinearGradient>
          <Text style={styles.activityName}>{item.name}</Text>
        </LiquidGlassView>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
      activeOpacity={0.8}
    >
      <LiquidCard style={styles.exerciseCard} >
        <View style={styles.exerciseContent}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseMuscles}>
              {item.primaryMuscles.join(', ')}
            </Text>
            <View style={styles.exerciseTags}>
              {item.equipment && item.equipment.length > 0 ? (
                item.equipment.slice(0, 2).map((equip, index) => (
                  <View key={index} style={styles.tag}>
                    <LiquidGlassView intensity={40} >
                      <Text style={styles.tagText}>{equip}</Text>
                    </LiquidGlassView>
                  </View>
                ))
              ) : (
                <View style={styles.tag}>
                  <LiquidGlassView intensity={40} >
                    <Text style={styles.tagText}>{item.category}</Text>
                  </LiquidGlassView>
                </View>
              )}
            </View>
          </View>
          <Icon name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
        </View>
      </LiquidCard>
    </TouchableOpacity>
  );

  const renderProgram = ({ item }: { item: Program }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProgramDetail', { program: item })}
      activeOpacity={0.8}
      style={styles.programCard}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.programImage}
        imageStyle={styles.programImageStyle}
      >
        <LiquidGlassView 
          intensity={70} 
          
          
          style={styles.programOverlay}
        >
          <View style={styles.programContent}>
            <Text style={styles.programTitle}>{item.title}</Text>
            <Text style={styles.programSubtitle}>{item.subtitle}</Text>
            <View style={styles.programMeta}>
              <View style={styles.programBadge}>
                <Icon name="time-outline" size={14} color="white" />
                <Text style={styles.programBadgeText}>{item.duration}</Text>
              </View>
              <View style={styles.programBadge}>
                <Icon name="fitness-outline" size={14} color="white" />
                <Text style={styles.programBadgeText}>{item.difficulty}</Text>
              </View>
            </View>
          </View>
        </LiquidGlassView>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'For You':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {recommendedExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    onPress={() => navigation.navigate('ExerciseDetail', { exercise })}
                    style={styles.recommendedCard}
                  >
                    <LiquidCard style={styles.recommendedCardInner}>
                      <Icon name="fitness" size={32} color={colors.primary.main} />
                      <Text style={styles.recommendedTitle}>{exercise.name}</Text>
                      <Text style={styles.recommendedMuscles}>
                        {exercise.primaryMuscles[0] || exercise.category}
                      </Text>
                    </LiquidCard>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Programs</Text>
              <FlatList
                data={programs}
                renderItem={renderProgram}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              />
            </View>
          </View>
        );
      
      case 'Explore':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity Types</Text>
              <FlatList
                data={activityTypes}
                renderItem={renderActivityType}
                keyExtractor={(item) => item.id}
                numColumns={3}
                columnWrapperStyle={styles.activityGrid}
                scrollEnabled={false}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {selectedCategory ? `${selectedCategory} Exercises` : 'Popular Exercises'}
              </Text>
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary.main} />
              ) : (
                <FlatList
                  data={exercises}
                  renderItem={renderExercise}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          </View>
        );
      
      case 'Library':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Collections</Text>
              {collections.map((collection) => (
                <TouchableOpacity key={collection.id}>
                  <LiquidCard style={styles.collectionCard}>
                    <View style={styles.collectionContent}>
                      <Text style={styles.collectionTitle}>{collection.title}</Text>
                      <Text style={styles.collectionCount}>{collection.count} workouts</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                  </LiquidCard>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saved Exercises</Text>
              {savedExercises.length === 0 ? (
                <LiquidGlassView intensity={40} style={styles.emptyState}>
                  <Icon name="bookmark-outline" size={48} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyText}>No saved exercises yet</Text>
                </LiquidGlassView>
              ) : (
                <FlatList
                  data={savedExercises}
                  renderItem={renderExercise}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background */}
      <LinearGradient 
        colors={colors.primary.gradient as [string, string, ...string[]]} 
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.animatedHeader,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            })
          }
        ]}
      >
        <LiquidGlassView intensity={90} >
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>Discover</Text>
          </View>
        </LiquidGlassView>
      </Animated.View>
      
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <Text style={styles.title}>Discover</Text>
        </Animated.View>
        
        {/* Tabs */}
        <View style={styles.tabs}>
          {['For You', 'Explore', 'Library'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabChange(tab)}
              style={styles.tabButton}
            >
              <LiquidGlassView 
                intensity={activeTab === tab ? 70 : 40} 
                
                
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab
                ] as any}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}>
                  {tab}
                </Text>
              </LiquidGlassView>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Content */}
        {renderTabContent()}
        
        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBar: {
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 10,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tabButton: {
    flex: 1,
  },
  tab: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  activityGrid: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  activityCard: {
    width: (width - 56) / 3,
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
  },
  recommendedCard: {
    marginRight: 16,
  },
  recommendedCardInner: {
    width: 160,
    padding: 20,
    alignItems: 'center',
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  recommendedMuscles: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  exerciseCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  exerciseMuscles: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  tagText: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 12,
    color: 'white',
  },
  programCard: {
    marginRight: 16,
    width: width * 0.75,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
  },
  programImage: {
    width: '100%',
    height: '100%',
  },
  programImageStyle: {
    borderRadius: 20,
  },
  programOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  programContent: {
    gap: 8,
  },
  programTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  programSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  programMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  programBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  programBadgeText: {
    fontSize: 12,
    color: 'white',
  },
  collectionCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collectionContent: {
    flex: 1,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  emptyState: {
    marginHorizontal: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
  },
});

export default LiquidDiscoverScreen;