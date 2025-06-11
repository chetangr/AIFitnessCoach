import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { 
  LiquidGlassView, 
  LiquidButton, 
  LiquidCard,
  LiquidEmptyState,
  LiquidLoading,
  LiquidProgressIndicator
} from '../components/glass';

const { width } = Dimensions.get('window');

interface LiquidProgramsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

interface Program {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  image: string;
  workoutsPerWeek: number;
  totalWorkouts: number;
  completedWorkouts: number;
  isActive: boolean;
}

const mockPrograms: Program[] = [
  {
    id: '1',
    name: 'Strength Builder',
    description: 'Build muscle and increase strength with progressive overload',
    duration: '12 weeks',
    difficulty: 'intermediate',
    category: 'Strength',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    workoutsPerWeek: 4,
    totalWorkouts: 48,
    completedWorkouts: 12,
    isActive: true,
  },
  {
    id: '2',
    name: 'Fat Loss Accelerator',
    description: 'High-intensity workouts designed for maximum fat burn',
    duration: '8 weeks',
    difficulty: 'advanced',
    category: 'Weight Loss',
    image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400',
    workoutsPerWeek: 5,
    totalWorkouts: 40,
    completedWorkouts: 0,
    isActive: false,
  },
  {
    id: '3',
    name: 'Beginner Fitness',
    description: 'Perfect starting point for your fitness journey',
    duration: '6 weeks',
    difficulty: 'beginner',
    category: 'General Fitness',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
    workoutsPerWeek: 3,
    totalWorkouts: 18,
    completedWorkouts: 0,
    isActive: false,
  },
  {
    id: '4',
    name: 'Muscle Definition',
    description: 'Sculpt and define your muscles with targeted training',
    duration: '10 weeks',
    difficulty: 'intermediate',
    category: 'Bodybuilding',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    workoutsPerWeek: 5,
    totalWorkouts: 50,
    completedWorkouts: 0,
    isActive: false,
  },
];

const LiquidProgramsScreen: React.FC<LiquidProgramsScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['All', 'Strength', 'Weight Loss', 'General Fitness', 'Bodybuilding'];

  const filteredPrograms = programs.filter(program => 
    selectedCategory === 'All' || program.category === selectedCategory
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CD964';
      case 'intermediate': return '#FF9500';
      case 'advanced': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const startProgram = (program: Program) => {
    // Update active program
    const updatedPrograms = programs.map(p => ({
      ...p,
      isActive: p.id === program.id
    }));
    setPrograms(updatedPrograms);
    
    navigation.navigate('ProgramDetail', { program });
  };

  const renderProgram = ({ item }: { item: Program }) => {
    const progress = item.totalWorkouts > 0 
      ? item.completedWorkouts / item.totalWorkouts 
      : 0;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProgramDetail', { program: item })}
        activeOpacity={0.8}
      >
        <LiquidCard style={styles.programCard}>
          {/* Program Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.programImage} />
            {item.isActive && (
              <LiquidGlassView style={styles.activeBadge} intensity={95}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </LiquidGlassView>
            )}
            <LiquidGlassView style={styles.difficultyBadge} intensity={90}>
              <View 
                style={[
                  styles.difficultyDot, 
                  { backgroundColor: getDifficultyColor(item.difficulty) }
                ]} 
              />
              <Text style={styles.difficultyText}>
                {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
              </Text>
            </LiquidGlassView>
          </View>

          {/* Program Info */}
          <View style={styles.programInfo}>
            <Text style={styles.programName}>{item.name}</Text>
            <Text style={styles.programDescription} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Program Stats */}
            <View style={styles.programStats}>
              <View style={styles.stat}>
                <Icon name="calendar-outline" size={16} color="#8E8E93" />
                <Text style={styles.statText}>{item.duration}</Text>
              </View>
              <View style={styles.stat}>
                <Icon name="barbell-outline" size={16} color="#8E8E93" />
                <Text style={styles.statText}>{item.workoutsPerWeek}x/week</Text>
              </View>
            </View>

            {/* Progress */}
            {item.isActive && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>Progress</Text>
                  <Text style={styles.progressValue}>
                    {item.completedWorkouts}/{item.totalWorkouts}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
              </View>
            )}

            {/* Action Button */}
            <LiquidButton
              label={item.isActive ? 'Continue' : 'Start Program'}
              onPress={() => startProgram(item)}
              style={styles.actionButton}
              variant={item.isActive ? 'primary' : 'secondary'}
              size="small"
            />
          </View>
        </LiquidCard>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LiquidLoading message="Loading programs..." />;
  }

  return (
    <LiquidGlassView style={styles.container} intensity={95}>
      {/* Header */}
      <LiquidGlassView style={styles.header} intensity={90}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Programs</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="options-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </LiquidGlassView>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
          >
            <LiquidGlassView 
              style={styles.categoryGlass}
              intensity={selectedCategory === category ? 90 : 70}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </LiquidGlassView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Programs List */}
      {filteredPrograms.length === 0 ? (
        <LiquidEmptyState
          icon="barbell-outline"
          title="No Programs Found"
          message="Try selecting a different category"
        />
      ) : (
        <FlatList
          data={filteredPrograms}
          renderItem={renderProgram}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFF"
            />
          }
        />
      )}

      {/* Create Custom Program Button */}
      <TouchableOpacity style={styles.fab}>
        <LiquidGlassView style={styles.fabGlass} intensity={95}>
          <Icon name="add" size={28} color="#FFF" />
        </LiquidGlassView>
      </TouchableOpacity>
    </LiquidGlassView>
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
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  filterButton: {
    padding: 8,
  },
  categoryContainer: {
    maxHeight: 50,
    marginTop: 8,
  },
  categoryContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    marginRight: 12,
  },
  categoryButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  categoryGlass: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  programCard: {
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
  },
  programImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  activeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CD964',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  programInfo: {
    padding: 16,
  },
  programName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  programDescription: {
    fontSize: 14,
    color: '#AAA',
    lineHeight: 20,
    marginBottom: 12,
  },
  programStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#AAA',
  },
  progressValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  actionButton: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fabGlass: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LiquidProgramsScreen;