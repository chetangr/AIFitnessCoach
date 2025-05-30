import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../../models/workout.dart';
import '../../../data/exercise_database.dart';
import '../../../providers/workout_provider.dart';
import '../../../services/auth_service.dart';
import '../../../services/database_service.dart';

// Provider for exercise library
final exerciseLibraryProvider = StateNotifierProvider<ExerciseLibraryNotifier, ExerciseLibraryState>((ref) {
  return ExerciseLibraryNotifier();
});

class ExerciseLibraryState {
  final List<Exercise> allExercises;
  final List<Exercise> filteredExercises;
  final List<Exercise> displayedExercises;
  final bool isLoading;
  final String? selectedCategory;
  final String? selectedMuscleGroup;
  final String? selectedEquipment;
  final WorkoutDifficulty? selectedDifficulty;
  final String searchQuery;
  final int pageSize;
  final int currentPage;

  ExerciseLibraryState({
    this.allExercises = const [],
    this.filteredExercises = const [],
    this.displayedExercises = const [],
    this.isLoading = false,
    this.selectedCategory,
    this.selectedMuscleGroup,
    this.selectedEquipment,
    this.selectedDifficulty,
    this.searchQuery = '',
    this.pageSize = 100,
    this.currentPage = 0,
  });

  ExerciseLibraryState copyWith({
    List<Exercise>? allExercises,
    List<Exercise>? filteredExercises,
    List<Exercise>? displayedExercises,
    bool? isLoading,
    String? selectedCategory,
    String? selectedMuscleGroup,
    String? selectedEquipment,
    WorkoutDifficulty? selectedDifficulty,
    String? searchQuery,
    int? pageSize,
    int? currentPage,
  }) {
    return ExerciseLibraryState(
      allExercises: allExercises ?? this.allExercises,
      filteredExercises: filteredExercises ?? this.filteredExercises,
      displayedExercises: displayedExercises ?? this.displayedExercises,
      isLoading: isLoading ?? this.isLoading,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      selectedMuscleGroup: selectedMuscleGroup ?? this.selectedMuscleGroup,
      selectedEquipment: selectedEquipment ?? this.selectedEquipment,
      selectedDifficulty: selectedDifficulty ?? this.selectedDifficulty,
      searchQuery: searchQuery ?? this.searchQuery,
      pageSize: pageSize ?? this.pageSize,
      currentPage: currentPage ?? this.currentPage,
    );
  }
}

class ExerciseLibraryNotifier extends StateNotifier<ExerciseLibraryState> {
  ExerciseLibraryNotifier() : super(ExerciseLibraryState());

  Future<void> loadExercises({bool forceReload = false}) async {
    if (state.allExercises.isNotEmpty && !forceReload) {
      print('📚 Exercises already loaded: ${state.allExercises.length}');
      return;
    }

    print('🔄 Loading exercise library...');
    state = state.copyWith(isLoading: true);
    
    // Simulate async loading
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Generate 10,000+ exercises
    final exercises = ExerciseDatabase.generateExercises(count: 10000);
    print('✅ Generated ${exercises.length} individual exercises');
    
    state = state.copyWith(
      allExercises: exercises,
      filteredExercises: exercises,
      displayedExercises: exercises.take(state.pageSize).toList(),
      isLoading: false,
      currentPage: 0,
    );
  }

  void searchExercises(String query) {
    state = state.copyWith(searchQuery: query, currentPage: 0);
    _applyFilters();
  }

  void loadMore() {
    final nextPage = state.currentPage + 1;
    final startIndex = nextPage * state.pageSize;
    final endIndex = (startIndex + state.pageSize).clamp(0, state.filteredExercises.length);
    
    if (startIndex < state.filteredExercises.length) {
      final newExercises = state.filteredExercises.sublist(startIndex, endIndex);
      final updatedDisplayed = [...state.displayedExercises, ...newExercises];
      
      state = state.copyWith(
        displayedExercises: updatedDisplayed,
        currentPage: nextPage,
      );
    }
  }

  bool get hasMore => (state.currentPage + 1) * state.pageSize < state.filteredExercises.length;

  void filterByCategory(String? category) {
    state = state.copyWith(selectedCategory: category);
    _applyFilters();
  }

  void filterByMuscleGroup(String? muscleGroup) {
    state = state.copyWith(selectedMuscleGroup: muscleGroup);
    _applyFilters();
  }

  void filterByEquipment(String? equipment) {
    state = state.copyWith(selectedEquipment: equipment);
    _applyFilters();
  }

  void filterByDifficulty(WorkoutDifficulty? difficulty) {
    state = state.copyWith(selectedDifficulty: difficulty);
    _applyFilters();
  }

  void clearFilters() {
    state = state.copyWith(
      selectedCategory: null,
      selectedMuscleGroup: null,
      selectedEquipment: null,
      selectedDifficulty: null,
      searchQuery: '',
    );
    _applyFilters();
  }

  void _applyFilters() {
    var filtered = state.allExercises;

    // Apply search query with partial matching
    if (state.searchQuery.isNotEmpty) {
      final query = state.searchQuery.toLowerCase().trim();
      filtered = filtered.where((exercise) {
        final name = exercise.name.toLowerCase();
        final description = exercise.description.toLowerCase();
        
        // Check if query matches any part of the name or description
        if (name.contains(query) || description.contains(query)) {
          return true;
        }
        
        // Also check if query matches individual words
        final queryWords = query.split(' ');
        for (final word in queryWords) {
          if (word.isNotEmpty && (name.contains(word) || description.contains(word))) {
            return true;
          }
        }
        
        // Check muscle groups
        for (final muscle in exercise.muscleGroups) {
          if (muscle.toLowerCase().contains(query)) {
            return true;
          }
        }
        
        return false;
      }).toList();
    }

    // Apply category filter
    if (state.selectedCategory != null) {
      filtered = filtered.where((exercise) =>
        exercise.metadata['category'] == state.selectedCategory
      ).toList();
    }

    // Apply muscle group filter
    if (state.selectedMuscleGroup != null) {
      filtered = filtered.where((exercise) =>
        exercise.muscleGroups.contains(state.selectedMuscleGroup)
      ).toList();
    }

    // Apply equipment filter
    if (state.selectedEquipment != null) {
      filtered = filtered.where((exercise) =>
        exercise.equipment.contains(state.selectedEquipment)
      ).toList();
    }

    // Apply difficulty filter
    if (state.selectedDifficulty != null) {
      filtered = filtered.where((exercise) =>
        exercise.difficulty == state.selectedDifficulty
      ).toList();
    }

    // Update filtered exercises and reset pagination
    final displayedExercises = filtered.take(state.pageSize).toList();
    
    state = state.copyWith(
      filteredExercises: filtered,
      displayedExercises: displayedExercises,
      currentPage: 0,
    );
  }
}

class ExerciseLibraryScreen extends ConsumerStatefulWidget {
  final bool addToWorkoutMode;
  final String? workoutId;
  
  const ExerciseLibraryScreen({
    Key? key,
    this.addToWorkoutMode = false,
    this.workoutId,
  }) : super(key: key);

  @override
  ConsumerState<ExerciseLibraryScreen> createState() => _ExerciseLibraryScreenState();
}

class _ExerciseLibraryScreenState extends ConsumerState<ExerciseLibraryScreen>
    with TickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late AnimationController _animationController;
  
  final List<String> _categories = [
    'All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes',
    'Full Body', 'Cardio', 'Olympic', 'Powerlifting', 'Calisthenics',
    'Stretching', 'Mobility', 'Balance', 'Plyometric', 'Pelvic Floor'
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _animationController.forward();
    
    // Load exercises when screen initializes
    Future.microtask(() {
      ref.read(exerciseLibraryProvider.notifier).loadExercises();
    });
  }

  void _addExerciseToWorkout(Exercise exercise) async {
    if (widget.workoutId == null) return;
    
    try {
      final workoutNotifier = ref.read(workoutProvider.notifier);
      await workoutNotifier.addExerciseToWorkout(widget.workoutId!, exercise);
      
      HapticFeedback.lightImpact();
      
      // Show success message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${exercise.name} added to workout'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      HapticFeedback.heavyImpact();
      
      // Show error message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add exercise: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(exerciseLibraryProvider);
    
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              _buildSearchBar(),
              _buildFilterChips(),
              Expanded(
                child: state.isLoading
                    ? _buildLoadingIndicator()
                    : _buildExerciseList(state),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                colors: [Color(0xFF007AFF), Color(0xFF0051D5)],
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF007AFF).withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const Icon(
              Icons.fitness_center,
              color: Colors.white,
              size: 26,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Exercise Library',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  '${ref.watch(exerciseLibraryProvider).allExercises.length}+ exercises',
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () {
              _showCreateCustomExerciseDialog(context);
            },
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.add,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.filter_list, color: Colors.white),
            onPressed: _showFilterBottomSheet,
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Container(
        height: 50,
        decoration: AppTheme.glassDecoration(borderRadius: 25, isTextInput: true),
        child: TextField(
          controller: _searchController,
          style: const TextStyle(color: Colors.black87),
          decoration: InputDecoration(
            hintText: 'Search exercises...',
            hintStyle: TextStyle(color: Colors.black54),
            prefixIcon: const Icon(Icons.search, color: Colors.black54),
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear, color: Colors.black54),
                    onPressed: () {
                      _searchController.clear();
                      ref.read(exerciseLibraryProvider.notifier).searchExercises('');
                    },
                  )
                : null,
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 14),
          ),
          onChanged: (value) {
            HapticFeedback.selectionClick();
            ref.read(exerciseLibraryProvider.notifier).searchExercises(value);
          },
        ),
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 50,
      margin: const EdgeInsets.only(top: 16),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          final state = ref.watch(exerciseLibraryProvider);
          final isSelected = category == 'All' 
              ? state.selectedCategory == null 
              : state.selectedCategory == category;
          
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                if (category == 'All') {
                  ref.read(exerciseLibraryProvider.notifier).clearFilters();
                } else if (isSelected) {
                  ref.read(exerciseLibraryProvider.notifier).filterByCategory(null);
                } else {
                  ref.read(exerciseLibraryProvider.notifier).filterByCategory(category);
                }
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppTheme.primaryColor
                      : Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected
                        ? AppTheme.primaryColor
                        : Colors.white.withOpacity(0.2),
                  ),
                ),
                child: Text(
                  category,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildExerciseList(ExerciseLibraryState state) {
    if (state.filteredExercises.isEmpty) {
      return _buildEmptyState();
    }

    return RefreshIndicator(
      onRefresh: () async {
        HapticFeedback.mediumImpact();
        await ref.read(exerciseLibraryProvider.notifier).loadExercises(forceReload: true);
      },
      color: AppTheme.primaryColor,
      backgroundColor: Colors.black.withOpacity(0.8),
      child: ListView.builder(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(20),
        itemCount: state.displayedExercises.length + 2, // +1 for header, +1 for load more button
        itemBuilder: (context, index) {
          if (index == 0) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                '${state.filteredExercises.length} exercises found (showing ${state.displayedExercises.length})',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withOpacity(0.7),
                ),
              ),
            );
          }
          
          // Load more button
          if (index == state.displayedExercises.length + 1) {
            final notifier = ref.read(exerciseLibraryProvider.notifier);
            if (notifier.hasMore) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Center(
                  child: ElevatedButton(
                    onPressed: () => notifier.loadMore(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    ),
                    child: Text(
                      'Load More (${state.filteredExercises.length - state.displayedExercises.length} remaining)',
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                ),
              );
            } else {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Center(
                  child: Text(
                    'All exercises loaded',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                    ),
                  ),
                ),
              );
            }
          }
          
          final exercise = state.displayedExercises[index - 1];
          return _buildExerciseCard(exercise, index - 1);
        },
      ),
    );
  }

  Widget _buildExerciseCard(Exercise exercise, int index) {
    return AnimatedScale(
      scale: 1.0,
      duration: Duration(milliseconds: 200 + (index * 20).clamp(0, 500)),
      curve: Curves.elasticOut,
      child: GlassCard(
        margin: const EdgeInsets.only(bottom: 12),
        onTap: () {
          _showExerciseDetails(exercise);
        },
        child: Row(
          children: [
            // Exercise icon/indicator
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: exercise.difficulty.color.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: exercise.difficulty.color.withOpacity(0.3),
                ),
              ),
              child: Icon(
                _getIconForCategory(exercise.metadata['category'] as String),
                color: exercise.difficulty.color,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            
            // Exercise info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    exercise.name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    exercise.muscleGroups.join(' • '),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      // Equipment
                      Icon(
                        Icons.fitness_center,
                        size: 12,
                        color: Colors.white.withOpacity(0.5),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        exercise.equipment.join(', '),
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.white.withOpacity(0.5),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Difficulty
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: exercise.difficulty.color.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          exercise.difficulty.name.toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: exercise.difficulty.color,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            // Add to workout button or arrow
            if (widget.addToWorkoutMode)
              IconButton(
                onPressed: () => _addExerciseToWorkout(exercise),
                icon: Icon(
                  Icons.add_circle,
                  color: Colors.green,
                  size: 32,
                ),
              )
            else
              Icon(
                Icons.chevron_right,
                color: Colors.white.withOpacity(0.3),
              ),
          ],
        ),
      ),
    );
  }

  IconData _getIconForCategory(String category) {
    switch (category) {
      case 'Chest':
        return Icons.fitness_center;
      case 'Back':
        return Icons.rowing;
      case 'Shoulders':
        return Icons.sports_gymnastics;
      case 'Arms':
        return Icons.sports_handball;
      case 'Legs':
        return Icons.directions_run;
      case 'Core':
        return Icons.self_improvement;
      case 'Cardio':
        return Icons.favorite;
      case 'Olympic':
        return Icons.sports;
      case 'Calisthenics':
        return Icons.accessibility_new;
      case 'Stretching':
      case 'Mobility':
        return Icons.accessibility;
      case 'Pelvic Floor':
        return Icons.pregnant_woman;
      default:
        return Icons.fitness_center;
    }
  }

  Widget _buildLoadingIndicator() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
          ),
          const SizedBox(height: 16),
          Text(
            'Loading 10,000+ exercises...',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 80,
            color: Colors.white.withOpacity(0.3),
          ),
          const SizedBox(height: 16),
          Text(
            'No exercises found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your filters',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withOpacity(0.5),
            ),
          ),
        ],
      ),
    );
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(20),
        decoration: AppTheme.glassDecoration(borderRadius: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Filter Exercises',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    ref.read(exerciseLibraryProvider.notifier).clearFilters();
                    Navigator.pop(context);
                  },
                  child: const Text(
                    'Clear All',
                    style: TextStyle(color: Colors.blue),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
            
            // Muscle groups filter
            const Text(
              'Muscle Groups',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Chest', 'Lats', 'Shoulders', 'Biceps', 'Triceps',
                'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs'
              ].map((muscle) {
                final state = ref.watch(exerciseLibraryProvider);
                final isSelected = state.selectedMuscleGroup == muscle;
                
                return GestureDetector(
                  onTap: () {
                    if (isSelected) {
                      ref.read(exerciseLibraryProvider.notifier).filterByMuscleGroup(null);
                    } else {
                      ref.read(exerciseLibraryProvider.notifier).filterByMuscleGroup(muscle);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppTheme.primaryColor
                          : Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? AppTheme.primaryColor
                            : Colors.white.withOpacity(0.2),
                      ),
                    ),
                    child: Text(
                      muscle,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.white70,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            
            const SizedBox(height: 24),
            
            // Equipment filter
            const Text(
              'Equipment',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Bodyweight', 'Barbell', 'Dumbbell', 'Cable', 'Machine'
              ].map((equipment) {
                final state = ref.watch(exerciseLibraryProvider);
                final isSelected = state.selectedEquipment == equipment;
                
                return GestureDetector(
                  onTap: () {
                    if (isSelected) {
                      ref.read(exerciseLibraryProvider.notifier).filterByEquipment(null);
                    } else {
                      ref.read(exerciseLibraryProvider.notifier).filterByEquipment(equipment);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppTheme.primaryColor
                          : Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? AppTheme.primaryColor
                            : Colors.white.withOpacity(0.2),
                      ),
                    ),
                    child: Text(
                      equipment,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.white70,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            
            const SizedBox(height: 24),
            
            // Difficulty filter
            const Text(
              'Difficulty',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: WorkoutDifficulty.values.map((difficulty) {
                final state = ref.watch(exerciseLibraryProvider);
                final isSelected = state.selectedDifficulty == difficulty;
                
                return GestureDetector(
                  onTap: () {
                    if (isSelected) {
                      ref.read(exerciseLibraryProvider.notifier).filterByDifficulty(null);
                    } else {
                      ref.read(exerciseLibraryProvider.notifier).filterByDifficulty(difficulty);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? difficulty.color
                          : Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? difficulty.color
                            : Colors.white.withOpacity(0.2),
                      ),
                    ),
                    child: Text(
                      difficulty.name,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.white70,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            
            const SizedBox(height: 24),
            
            // Category filter
            const Text(
              'Exercise Category',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Bodyweight', 'Strength', 'Cardio', 'Olympic', 
                'Powerlifting', 'Calisthenics', 'Stretching', 
                'Mobility', 'Balance', 'Plyometric', 'Kegels'
              ].map((category) {
                final state = ref.watch(exerciseLibraryProvider);
                final isSelected = state.selectedCategory == category;
                
                return GestureDetector(
                  onTap: () {
                    if (isSelected) {
                      ref.read(exerciseLibraryProvider.notifier).filterByCategory(null);
                    } else {
                      ref.read(exerciseLibraryProvider.notifier).filterByCategory(category);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppTheme.primaryColor
                          : Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? AppTheme.primaryColor
                            : Colors.white.withOpacity(0.2),
                      ),
                    ),
                    child: Text(
                      category,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.white70,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
                  ],
                ),
              ),
            ),
            
            // Apply filters button
            SizedBox(
              width: double.infinity,
              child: GlassButton(
                text: 'Apply Filters',
                isPrimary: true,
                onPressed: () {
                  Navigator.pop(context);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showExerciseDetails(Exercise exercise) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        builder: (context, scrollController) => Container(
          margin: const EdgeInsets.all(16),
          decoration: AppTheme.glassDecoration(borderRadius: 20),
          child: Column(
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 20),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Exercise title
                      Text(
                        exercise.name,
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      
                      // Description
                      Text(
                        exercise.description,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Exercise stats
                      Row(
                        children: [
                          _buildStatChip(
                            icon: Icons.fitness_center,
                            label: exercise.equipment.join(', '),
                            color: AppTheme.primaryColor,
                          ),
                          const SizedBox(width: 12),
                          _buildStatChip(
                            icon: Icons.speed,
                            label: exercise.difficulty.name,
                            color: exercise.difficulty.color,
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Muscle groups
                      const Text(
                        'Target Muscles',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: exercise.muscleGroups.map((muscle) =>
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: AppTheme.primaryColor.withOpacity(0.3),
                              ),
                            ),
                            child: Text(
                              muscle,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: AppTheme.primaryColor,
                              ),
                            ),
                          ),
                        ).toList(),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Instructions
                      const Text(
                        'Instructions',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      ...exercise.instructions.asMap().entries.map((entry) =>
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor.withOpacity(0.2),
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    '${entry.key + 1}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.primaryColor,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  entry.value,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.white.withOpacity(0.8),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ).toList(),
                      
                      const SizedBox(height: 24),
                      
                      // Sets and reps info
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.1),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildInfoColumn('Sets', '${exercise.metadata['sets']}'),
                            _buildInfoColumn('Reps', '${exercise.metadata['reps']}'),
                            _buildInfoColumn('Rest', '${exercise.metadata['rest']}s'),
                            _buildInfoColumn('Tempo', '${exercise.metadata['tempo'] ?? '2-0-2-0'}'),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Action buttons
                      Row(
                        children: [
                          Expanded(
                            child: GlassButton(
                              text: 'Add to Workout',
                              isPrimary: true,
                              onPressed: () async {
                                Navigator.pop(context);
                                // Get the current day's workout
                                final now = DateTime.now();
                                final workouts = ref.read(workoutProvider);
                                final todayWorkout = workouts.firstWhere(
                                  (w) => w.scheduledFor.year == now.year &&
                                        w.scheduledFor.month == now.month &&
                                        w.scheduledFor.day == now.day,
                                  orElse: () => workouts.isNotEmpty ? workouts.first : throw Exception('No workouts available'),
                                );
                                
                                // Add exercise to today's workout
                                final updatedExercises = [...todayWorkout.exercises, exercise];
                                final updatedWorkout = todayWorkout.copyWith(
                                  exercises: updatedExercises,
                                );
                                
                                // Update the workout in the provider
                                await ref.read(workoutProvider.notifier).updateWorkout(todayWorkout.id, updatedWorkout);
                                
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Added ${exercise.name} to today\'s workout'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          GlassButton(
                            text: 'Save',
                            icon: Icons.bookmark_border,
                            onPressed: () {
                              // Save exercise
                            },
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatChip({
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoColumn(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withOpacity(0.6),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  void _showCreateCustomExerciseDialog(BuildContext context) {
    final nameController = TextEditingController();
    final descriptionController = TextEditingController();
    String selectedMuscleGroup = 'Chest';
    String selectedEquipment = 'None';
    WorkoutDifficulty selectedDifficulty = WorkoutDifficulty.easy;
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.9,
        decoration: const BoxDecoration(
          color: Color(0xFF1A1F2E),
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        child: Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Create Custom Exercise',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Exercise Name
                      GlassContainer(
                        child: TextField(
                          controller: nameController,
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(
                            labelText: 'Exercise Name',
                            labelStyle: TextStyle(color: Colors.white70),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.all(16),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Description
                      GlassContainer(
                        child: TextField(
                          controller: descriptionController,
                          style: const TextStyle(color: Colors.white),
                          maxLines: 3,
                          decoration: const InputDecoration(
                            labelText: 'Description',
                            labelStyle: TextStyle(color: Colors.white70),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.all(16),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Muscle Group Selection
                      const Text(
                        'Primary Muscle Group',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes']
                            .map((muscle) => GestureDetector(
                                  onTap: () {
                                    selectedMuscleGroup = muscle;
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: selectedMuscleGroup == muscle
                                          ? Colors.blue
                                          : Colors.white.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      muscle,
                                      style: const TextStyle(color: Colors.white),
                                    ),
                                  ),
                                ))
                            .toList(),
                      ),
                      const SizedBox(height: 32),
                      
                      // Save Button
                      GlassButton(
                        text: 'Create Exercise',
                        isPrimary: true,
                        onPressed: () async {
                          if (nameController.text.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Please enter an exercise name'),
                                backgroundColor: Colors.red,
                              ),
                            );
                            return;
                          }
                          
                          // Create the custom exercise
                          final customExercise = Exercise(
                            id: DateTime.now().millisecondsSinceEpoch.toString(),
                            name: nameController.text,
                            description: descriptionController.text,
                            muscleGroups: [selectedMuscleGroup],
                            equipment: [selectedEquipment],
                            difficulty: selectedDifficulty,
                            instructions: ['Custom exercise created by user'],
                            metadata: {
                              'sets': 3,
                              'reps': 12,
                              'rest': 60,
                              'isCustom': true,
                            },
                          );
                          
                          // Save to database
                          final authService = AuthService();
                          final user = await authService.getCurrentUser();
                          if (user != null) {
                            final databaseService = DatabaseService();
                            await databaseService.saveCustomExercise(user.id, customExercise.toJson());
                          }
                          
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Custom exercise created successfully!'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}