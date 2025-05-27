import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../../models/workout.dart';
import '../../../data/exercise_database.dart';

// Provider for exercise library
final exerciseLibraryProvider = StateNotifierProvider<ExerciseLibraryNotifier, ExerciseLibraryState>((ref) {
  return ExerciseLibraryNotifier();
});

class ExerciseLibraryState {
  final List<Exercise> allExercises;
  final List<Exercise> filteredExercises;
  final bool isLoading;
  final String? selectedCategory;
  final String? selectedMuscleGroup;
  final String? selectedEquipment;
  final WorkoutDifficulty? selectedDifficulty;
  final String searchQuery;

  ExerciseLibraryState({
    this.allExercises = const [],
    this.filteredExercises = const [],
    this.isLoading = false,
    this.selectedCategory,
    this.selectedMuscleGroup,
    this.selectedEquipment,
    this.selectedDifficulty,
    this.searchQuery = '',
  });

  ExerciseLibraryState copyWith({
    List<Exercise>? allExercises,
    List<Exercise>? filteredExercises,
    bool? isLoading,
    String? selectedCategory,
    String? selectedMuscleGroup,
    String? selectedEquipment,
    WorkoutDifficulty? selectedDifficulty,
    String? searchQuery,
  }) {
    return ExerciseLibraryState(
      allExercises: allExercises ?? this.allExercises,
      filteredExercises: filteredExercises ?? this.filteredExercises,
      isLoading: isLoading ?? this.isLoading,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      selectedMuscleGroup: selectedMuscleGroup ?? this.selectedMuscleGroup,
      selectedEquipment: selectedEquipment ?? this.selectedEquipment,
      selectedDifficulty: selectedDifficulty ?? this.selectedDifficulty,
      searchQuery: searchQuery ?? this.searchQuery,
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
      filteredExercises: exercises.take(100).toList(), // Show first 100 by default
      isLoading: false,
    );
  }

  void searchExercises(String query) {
    state = state.copyWith(searchQuery: query);
    _applyFilters();
  }

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
      filteredExercises: state.allExercises.take(100).toList(),
    );
  }

  void _applyFilters() {
    var filtered = state.allExercises;

    // Apply search query
    if (state.searchQuery.isNotEmpty) {
      final query = state.searchQuery.toLowerCase();
      filtered = filtered.where((exercise) =>
        exercise.name.toLowerCase().contains(query) ||
        exercise.description.toLowerCase().contains(query)
      ).toList();
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

    // Limit results for performance
    state = state.copyWith(
      filteredExercises: filtered.take(200).toList(),
    );
  }
}

class ExerciseLibraryScreen extends ConsumerStatefulWidget {
  const ExerciseLibraryScreen({Key? key}) : super(key: key);

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
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Exercise Library',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  '10,000+ exercises',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                ),
              ],
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
        decoration: AppTheme.glassDecoration(borderRadius: 25),
        child: TextField(
          controller: _searchController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Search exercises...',
            hintStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
            prefixIcon: const Icon(Icons.search, color: Colors.white70),
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear, color: Colors.white70),
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
        itemCount: state.filteredExercises.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                '${state.filteredExercises.length} exercises found',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withOpacity(0.7),
                ),
              ),
            );
          }
          
          final exercise = state.filteredExercises[index - 1];
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
            
            // Arrow
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
      builder: (context) => Container(
        height: 500,
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
            const Text(
              'Filter Exercises',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            
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
            
            const Spacer(),
            
            // Clear filters button
            SizedBox(
              width: double.infinity,
              child: GlassButton(
                text: 'Clear All Filters',
                onPressed: () {
                  ref.read(exerciseLibraryProvider.notifier).clearFilters();
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
                              onPressed: () {
                                Navigator.pop(context);
                                // Add to current workout
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
}