import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LiquidGlassView, LiquidCard, LiquidEmptyState } from '../components/glass';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../config/dynamicTheme';
import { ModernHeader, ModernCard } from '../components/modern/ModernComponents';

const { width } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscles: string[];
  muscles_secondary: string[];
  equipment: string[];
  images: string[];
  description?: string;
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
        <LiquidGlassView
          intensity={selected ? 85 : 65}
          style={styles.filterChip as any}
          
        >
          <Text
            style={[
              styles.filterChipText,
              { color: selected ? colors.primary : colors.textPrimary } as any,
            ]}
          >
            {label}
          </Text>
        </LiquidGlassView>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: () => void;
  index: number;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);
  
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(rotateAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.exerciseCardContainer,
          {
            transform: [
              {
                rotateY: rotateAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '3deg'],
                }),
              },
              {
                perspective: 1000,
              },
            ],
          },
        ]}
      >
        <LiquidCard
          style={[styles.exerciseCard, isPressed && styles.exerciseCardPressed] as any}
        >
          <View style={styles.exerciseContent}>
            {/* Exercise Image */}
            {exercise.images && exercise.images.length > 0 ? (
              <View style={styles.exerciseImageContainer}>
                <Image
                  source={{ uri: exercise.images[0] }}
                  style={styles.exerciseImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={[styles.exerciseImagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="fitness" size={32} color={colors.primary} />
              </View>
            )}
            
            {/* Exercise Info */}
            <View style={styles.exerciseInfo}>
              <Text style={[styles.exerciseName, { color: colors.textPrimary }]} numberOfLines={2}>
                {exercise.name}
              </Text>
              
              {/* Category Badge */}
              <LiquidGlassView intensity={60} style={styles.categoryBadge}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {exercise.category}
                </Text>
              </LiquidGlassView>
              
              {/* Muscles */}
              <View style={styles.musclesContainer}>
                <Ionicons name="body" size={14} color={colors.textPrimary + '60'} />
                <Text style={[styles.musclesText, { color: colors.textPrimary + '80' }]} numberOfLines={1}>
                  {exercise.muscles.join(', ')}
                </Text>
              </View>
              
              {/* Equipment */}
              {exercise.equipment && exercise.equipment.length > 0 && (
                <View style={styles.equipmentContainer}>
                  <Ionicons name="barbell" size={14} color={colors.textPrimary + '60'} />
                  <Text style={[styles.equipmentText, { color: colors.textPrimary + '80' }]} numberOfLines={1}>
                    {exercise.equipment.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LiquidCard>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function LiquidExerciseLibraryScreen() {
  console.log('[OLD ExerciseLibraryScreen] This is the OLD screen - should NOT be shown!');
  console.trace('[OLD ExerciseLibraryScreen] Stack trace');
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors } = theme;
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const categories = ['Strength', 'Cardio', 'Flexibility', 'Balance', 'Plyometrics'];
  const muscles = ['Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs'];
  const equipment = ['Barbell', 'Dumbbell', 'Bodyweight', 'Cable', 'Machine', 'Bands'];
  
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadExercises();
    
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedCategory, selectedMuscle, selectedEquipment, exercises]);

  const loadExercises = async () => {
    try {
      const wgerData = await import('../data/wgerExerciseDatabase');
      const allExercises = wgerData.wgerExercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        muscles: ex.primaryMuscles,
        muscles_secondary: ex.secondaryMuscles,
        equipment: ex.equipment,
        images: ex.images,
        description: ex.description
      }));
      setExercises(allExercises);
      setFilteredExercises(allExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(ex => 
        ex.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Muscle filter
    if (selectedMuscle) {
      filtered = filtered.filter(ex => 
        ex.muscles.some(m => m.toLowerCase().includes(selectedMuscle.toLowerCase()))
      );
    }
    
    // Equipment filter
    if (selectedEquipment) {
      filtered = filtered.filter(ex => 
        ex.equipment?.some(e => e.toLowerCase().includes(selectedEquipment.toLowerCase()))
      );
    }
    
    setFilteredExercises(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedMuscle(null);
    setSelectedEquipment(null);
    setSearchQuery('');
  };

  const renderExercise = ({ item, index }: { item: Exercise; index: number }) => (
    <ExerciseCard
      exercise={item}
      onPress={() => (navigation as any).navigate('ExerciseDetail', { exercise: item })}
      index={index}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '20', colors.primary + '20', colors.background]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <LiquidGlassView intensity={75} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Exercise Library</Text>
        <View style={{ width: 40 }} />
      </LiquidGlassView>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <LiquidGlassView intensity={60} style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textPrimary + '60'} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textPrimary + '40'}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textPrimary + '60'} />
            </TouchableOpacity>
          )}
        </LiquidGlassView>
      </View>
      
      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {/* Clear Filters */}
        {(selectedCategory || selectedMuscle || selectedEquipment) && (
          <TouchableOpacity onPress={clearFilters}>
            <LiquidGlassView intensity={75} style={styles.clearFiltersChip}>
              <Ionicons name="close" size={16} color={colors.textPrimary} />
              <Text style={[styles.clearFiltersText, { color: colors.textPrimary }]}>Clear</Text>
            </LiquidGlassView>
          </TouchableOpacity>
        )}
        
        {/* Category Filters */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterSectionTitle, { color: colors.textPrimary + '60' }]}>Category</Text>
          <View style={styles.filterChips}>
            {categories.map(category => (
              <FilterChip
                key={category}
                label={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
              />
            ))}
          </View>
        </View>
        
        {/* Muscle Filters */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterSectionTitle, { color: colors.textPrimary + '60' }]}>Muscle</Text>
          <View style={styles.filterChips}>
            {muscles.map(muscle => (
              <FilterChip
                key={muscle}
                label={muscle}
                selected={selectedMuscle === muscle}
                onPress={() => setSelectedMuscle(selectedMuscle === muscle ? null : muscle)}
              />
            ))}
          </View>
        </View>
        
        {/* Equipment Filters */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterSectionTitle, { color: colors.textPrimary + '60' }]}>Equipment</Text>
          <View style={styles.filterChips}>
            {equipment.map(equip => (
              <FilterChip
                key={equip}
                label={equip}
                selected={selectedEquipment === equip}
                onPress={() => setSelectedEquipment(selectedEquipment === equip ? null : equip)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: colors.textPrimary + '80' }]}>
          {filteredExercises.length} exercises found
        </Text>
      </View>
      
      {/* Exercise List */}
      <Animated.View style={[styles.listContainer, { opacity: fadeAnimation }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            renderItem={renderExercise}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filtersContainer: {
    maxHeight: 120,
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterSection: {
    marginRight: 24,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearFiltersChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseCardContainer: {
    marginBottom: 16,
  },
  exerciseCard: {
    padding: 16,
  },
  exerciseCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  exerciseContent: {
    flexDirection: 'row',
  },
  exerciseImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exerciseImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  musclesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  musclesText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
});