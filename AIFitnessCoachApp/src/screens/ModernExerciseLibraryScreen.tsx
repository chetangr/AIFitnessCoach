import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../config/dynamicTheme';
import {
  ModernCard,
  ModernHeader,
} from '../components/modern/ModernComponents';
import { exerciseService } from '../services/exerciseService';
import { wgerExerciseService } from '../services/wgerExerciseService';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscles: string[];
  equipment: string[];
  difficulty: string;
  description: string;
  instructions: string;
  imageUrl?: string;
  videoUrl?: string;
}

const ModernExerciseLibraryScreen = ({ route }: any) => {
  console.log('[ModernExerciseLibraryScreen] Rendering...');
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get select mode and callback from route params
  const selectMode = route?.params?.selectMode || false;
  const swapMode = route?.params?.swapMode || false;
  const onSelectExercise = route?.params?.onSelectExercise;

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'arms', name: 'Arms', icon: 'barbell' },
    { id: 'legs', name: 'Legs', icon: 'walk' },
    { id: 'abs', name: 'Abs', icon: 'body' },
    { id: 'chest', name: 'Chest', icon: 'shield' },
    { id: 'back', name: 'Back', icon: 'swap-vertical' },
    { id: 'shoulders', name: 'Shoulders', icon: 'resize' },
    { id: 'cardio', name: 'Cardio', icon: 'bicycle' },
  ];

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedCategory, exercises]);

  const loadExercises = async () => {
    try {
      // Load exercises from Wger data
      const wgerExercises = wgerExerciseService.getAllExercises();
      console.log('Loaded', wgerExercises.length, 'exercises from Wger');
      
      // Convert to the format expected by the screen
      const formattedExercises = wgerExercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        muscles: ex.muscles,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        description: ex.description || '',
        instructions: ex.instructions?.join(' ') || '',
        imageUrl: ex.imageUrl
      }));
      
      setExercises(formattedExercises);
      setFilteredExercises(formattedExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      // Fallback to old service if needed
      try {
        const result = await exerciseService.getExercises({ limit: 100 });
        setExercises(result);
        setFilteredExercises(result);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ex.equipment.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex =>
        ex.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredExercises(filtered);
  };

  const handleExercisePress = (exercise: Exercise) => {
    // Always navigate to detail page, regardless of select mode
    (navigation as any).navigate('ExerciseDetail', { 
      exercise, 
      selectMode,
      onSelectExercise 
    });
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      onPress={() => handleExercisePress(item)}
    >
      <ModernCard variant="outlined" style={styles.exerciseCard}>
        <View style={styles.exerciseContent}>
          <View style={[styles.exerciseIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            {item.imageUrl ? (
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.exerciseImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="fitness" size={24} color={theme.colors.primary} />
            )}
            {item.videoUrl && (
              <View style={styles.videoIndicator}>
                <Ionicons name="play-circle" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.exerciseMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="body" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{item.muscles[0] || 'Various'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="barbell" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{item.equipment[0] || 'Bodyweight'}</Text>
              </View>
            </View>
          </View>
          {selectMode ? (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={(e) => {
                e.stopPropagation();
                if (onSelectExercise) {
                  onSelectExercise(item);
                }
              }}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>{swapMode ? 'Swap' : 'Add'}</Text>
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          )}
        </View>
      </ModernCard>
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader
        title={selectMode ? (swapMode ? "Select Exercise to Swap" : "Add Exercise") : "Exercise Library"}
        leftAction={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.searchInput}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.id ? '#FFFFFF' : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredExercises.length} exercises found
        </Text>
      </View>

      {/* Exercise List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  categoriesWrapper: {
    height: 60,
    paddingVertical: theme.spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    marginLeft: theme.spacing.xs,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  resultsText: {
    ...theme.typography.caption1,
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseCard: {
    marginBottom: 0,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    padding: 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  metaText: {
    ...theme.typography.caption1,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.sm,
  },
  addButtonText: {
    ...theme.typography.footnote,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
});

export default ModernExerciseLibraryScreen;