import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../../models/workout.dart';
import '../../../data/workout_generator.dart';

// Provider for workout discovery
final workoutDiscoveryProvider = StateNotifierProvider<WorkoutDiscoveryNotifier, WorkoutDiscoveryState>((ref) {
  return WorkoutDiscoveryNotifier();
});

class WorkoutDiscoveryState {
  final List<WorkoutPlan> allWorkouts;
  final List<WorkoutPlan> filteredWorkouts;
  final bool isLoading;
  final String? selectedCategory;
  final WorkoutDifficulty? selectedDifficulty;
  final WorkoutType? selectedType;
  final String searchQuery;

  WorkoutDiscoveryState({
    this.allWorkouts = const [],
    this.filteredWorkouts = const [],
    this.isLoading = false,
    this.selectedCategory,
    this.selectedDifficulty,
    this.selectedType,
    this.searchQuery = '',
  });

  WorkoutDiscoveryState copyWith({
    List<WorkoutPlan>? allWorkouts,
    List<WorkoutPlan>? filteredWorkouts,
    bool? isLoading,
    String? selectedCategory,
    WorkoutDifficulty? selectedDifficulty,
    WorkoutType? selectedType,
    String? searchQuery,
  }) {
    return WorkoutDiscoveryState(
      allWorkouts: allWorkouts ?? this.allWorkouts,
      filteredWorkouts: filteredWorkouts ?? this.filteredWorkouts,
      isLoading: isLoading ?? this.isLoading,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      selectedDifficulty: selectedDifficulty ?? this.selectedDifficulty,
      selectedType: selectedType ?? this.selectedType,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class WorkoutDiscoveryNotifier extends StateNotifier<WorkoutDiscoveryState> {
  WorkoutDiscoveryNotifier() : super(WorkoutDiscoveryState());

  Future<void> loadWorkouts({bool forceReload = false}) async {
    if (state.allWorkouts.isNotEmpty && !forceReload) {
      print('📊 Workouts already loaded: ${state.allWorkouts.length}');
      return;
    }

    print('🔄 Starting to load workouts...');
    state = state.copyWith(isLoading: true);
    
    // Simulate async loading
    await Future.delayed(const Duration(milliseconds: 300));
    
    // Generate 10,000 workouts with improved variety
    final workouts = WorkoutGenerator.generateWorkouts(count: 10000);
    print('✅ Generated ${workouts.length} workouts');
    print('🔍 Sample workout names: ${workouts.take(5).map((w) => w.name).join(", ")}');
    
    // Check for Kegel exercises
    final kegelWorkouts = workouts.where((w) => 
      w.name.toLowerCase().contains('kegel') || 
      w.description.toLowerCase().contains('pelvic') ||
      w.exercises.any((e) => e.name.toLowerCase().contains('kegel'))
    ).toList();
    print('🏃‍♀️ Found ${kegelWorkouts.length} pelvic floor/Kegel related workouts');
    
    state = state.copyWith(
      allWorkouts: workouts,
      filteredWorkouts: workouts.take(100).toList(), // Show first 100 by default
      isLoading: false,
    );
  }

  void searchWorkouts(String query) {
    print('🔍 Searching for: "$query"');
    state = state.copyWith(searchQuery: query);
    _applyFilters();
  }

  void filterByCategory(String? category) {
    print('📁 Filtering by category: $category');
    state = state.copyWith(selectedCategory: category);
    _applyFilters();
  }

  void filterByDifficulty(WorkoutDifficulty? difficulty) {
    print('💪 Filtering by difficulty: ${difficulty?.name}');
    state = state.copyWith(selectedDifficulty: difficulty);
    _applyFilters();
  }

  void filterByType(WorkoutType? type) {
    print('🏃 Filtering by type: ${type?.name}');
    state = state.copyWith(selectedType: type);
    _applyFilters();
  }

  void clearFilters() {
    print('🧹 Clearing all filters');
    state = state.copyWith(
      selectedCategory: null,
      selectedDifficulty: null,
      selectedType: null,
      searchQuery: '',
      filteredWorkouts: state.allWorkouts.take(50).toList(),
    );
  }

  void _applyFilters() {
    var filtered = state.allWorkouts;

    // Apply search query
    if (state.searchQuery.isNotEmpty) {
      final query = state.searchQuery.toLowerCase();
      filtered = filtered.where((workout) {
        // Check workout name and description
        if (workout.name.toLowerCase().contains(query) ||
            workout.description.toLowerCase().contains(query)) {
          return true;
        }
        
        // Check exercise names
        return workout.exercises.any((exercise) =>
          exercise.name.toLowerCase().contains(query)
        );
      }).toList();
    }

    // Apply category filter
    if (state.selectedCategory != null) {
      final category = state.selectedCategory!;
      filtered = filtered.where((workout) {
        // Check metadata
        final bodyPart = workout.metadata['bodyPart'] as String?;
        final equipment = workout.metadata['equipment'] as String?;
        final goal = workout.metadata['goal'] as String?;
        
        // Check if category matches any metadata
        if (bodyPart?.contains(category) == true ||
            equipment?.contains(category) == true ||
            goal?.contains(category) == true) {
          return true;
        }
        
        // Check workout name and description
        if (workout.name.contains(category) ||
            workout.description.contains(category)) {
          return true;
        }
        
        // Check workout type
        if (category == 'Cardio' && workout.type == WorkoutType.cardio) return true;
        if (category == 'Strength' && workout.type == WorkoutType.strength) return true;
        if (category == 'HIIT' && workout.type == WorkoutType.hiit) return true;
        if (category == 'Yoga' && workout.type == WorkoutType.yoga) return true;
        if (category == 'Flexibility' && workout.type == WorkoutType.flexibility) return true;
        
        // Check exercises for body part mentions
        return workout.exercises.any((exercise) =>
          exercise.name.contains(category) ||
          exercise.muscleGroups.any((muscle) => muscle.contains(category))
        );
      }).toList();
    }

    // Apply difficulty filter
    if (state.selectedDifficulty != null) {
      filtered = filtered.where((workout) =>
        workout.difficulty == state.selectedDifficulty
      ).toList();
    }

    // Apply type filter
    if (state.selectedType != null) {
      filtered = filtered.where((workout) =>
        workout.type == state.selectedType
      ).toList();
    }

    print('📊 Filtered results: ${filtered.length} workouts');
    
    // Limit to 100 results for performance
    state = state.copyWith(
      filteredWorkouts: filtered.take(100).toList(),
    );
  }
}

class CompassScreen extends ConsumerStatefulWidget {
  const CompassScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<CompassScreen> createState() => _CompassScreenState();
}

class _CompassScreenState extends ConsumerState<CompassScreen>
    with TickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late AnimationController _animationController;
  
  final List<String> _categories = [
    'All', 'Full Body', 'Upper Body', 'Lower Body', 'Core', 'Back',
    'Chest', 'Shoulders', 'Arms', 'Legs', 'Abs', 'Glutes',
    'Cardio', 'Strength', 'HIIT', 'Yoga', 'Flexibility', 'Pelvic Floor'
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _animationController.forward();
    
    // Load workouts when screen initializes
    Future.microtask(() {
      ref.read(workoutDiscoveryProvider.notifier).loadWorkouts();
    });
    
    // Add scroll listener for performance
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    // Could implement lazy loading here if needed
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
    final state = ref.watch(workoutDiscoveryProvider);
    
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
                    : _buildWorkoutGrid(state),
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
                colors: [Color(0xFF30D158), Color(0xFF32E17D)],
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF30D158).withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const Icon(
              Icons.explore,
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
                  'Discover Workouts',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  '10,000+ workouts to explore',
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
            hintText: 'Search workouts...',
            hintStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
            prefixIcon: const Icon(Icons.search, color: Colors.white70),
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear, color: Colors.white70),
                    onPressed: () {
                      _searchController.clear();
                      ref.read(workoutDiscoveryProvider.notifier).searchWorkouts('');
                    },
                  )
                : null,
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 14),
          ),
          onChanged: (value) {
            if (value.isNotEmpty) {
              HapticFeedback.selectionClick();
            }
            ref.read(workoutDiscoveryProvider.notifier).searchWorkouts(value);
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
          final state = ref.watch(workoutDiscoveryProvider);
          final isSelected = category == 'All' 
              ? state.selectedCategory == null 
              : state.selectedCategory == category;
          
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                if (category == 'All') {
                  ref.read(workoutDiscoveryProvider.notifier).clearFilters();
                } else if (isSelected) {
                  ref.read(workoutDiscoveryProvider.notifier).filterByCategory(null);
                } else {
                  ref.read(workoutDiscoveryProvider.notifier).filterByCategory(category);
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

  Widget _buildWorkoutGrid(WorkoutDiscoveryState state) {
    if (state.filteredWorkouts.isEmpty) {
      return _buildEmptyState();
    }

    return RefreshIndicator(
      onRefresh: () async {
        HapticFeedback.mediumImpact();
        await ref.read(workoutDiscoveryProvider.notifier).loadWorkouts(forceReload: true);
      },
      color: AppTheme.primaryColor,
      backgroundColor: Colors.black.withOpacity(0.8),
      child: CustomScrollView(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        cacheExtent: 500,
        slivers: [
        SliverPadding(
          padding: const EdgeInsets.all(20),
          sliver: SliverToBoxAdapter(
            child: Text(
              '${state.filteredWorkouts.length} workouts found',
              style: TextStyle(
                fontSize: 14,
                color: Colors.white.withOpacity(0.7),
              ),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 0.75,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final workout = state.filteredWorkouts[index];
                return AnimatedScale(
                  scale: 1.0,
                  duration: Duration(milliseconds: 300 + (index * 50).clamp(0, 1000)),
                  curve: Curves.elasticOut,
                  child: _buildWorkoutCard(workout),
                );
              },
              childCount: state.filteredWorkouts.length,
            ),
          ),
        ),
        const SliverPadding(
          padding: EdgeInsets.only(bottom: 100),
        ),
      ],
      ),
    );
  }

  Widget _buildWorkoutCard(WorkoutPlan workout) {
    final rating = workout.metadata['rating'] as double? ?? 4.5;
    final completions = workout.metadata['completions'] as int? ?? 0;
    
    return GlassCard(
        onTap: () {
          print('🎯 Selected workout: ${workout.name}');
          _showWorkoutDetails(workout);
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          // Difficulty badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: workout.difficulty.color.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: workout.difficulty.color.withOpacity(0.3),
                  ),
                ),
                child: Text(
                  workout.difficulty.name.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: workout.difficulty.color,
                  ),
                ),
              ),
              Icon(
                workout.type.icon,
                color: Colors.white.withOpacity(0.6),
                size: 20,
              ),
            ],
          ),
          
          const Spacer(),
          
          // Workout name
          Text(
            workout.name,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          
          const SizedBox(height: 4),
          
          // Description
          Text(
            workout.description,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.7),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          
          const SizedBox(height: 8),
          
          // Duration and calories
          Row(
            children: [
              Icon(
                Icons.timer,
                size: 14,
                color: Colors.white.withOpacity(0.6),
              ),
              const SizedBox(width: 4),
              Text(
                workout.duration,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withOpacity(0.6),
                ),
              ),
              const SizedBox(width: 12),
              Icon(
                Icons.local_fire_department,
                size: 14,
                color: Colors.white.withOpacity(0.6),
              ),
              const SizedBox(width: 4),
              Text(
                workout.calories,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withOpacity(0.6),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 8),
          
          // Rating and completions
          Row(
            children: [
              ...List.generate(5, (index) {
                return Icon(
                  index < rating.floor() ? Icons.star : Icons.star_border,
                  size: 12,
                  color: const Color(0xFFFF9F0A),
                );
              }),
              const SizedBox(width: 8),
              Text(
                '${completions.toString()}',
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.white.withOpacity(0.6),
                ),
              ),
            ],
          ),
        ],
        ),
      );
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
            'Loading 10,000 workouts...',
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
            'No workouts found',
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
        height: 400,
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
              'Filter Workouts',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            
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
              spacing: 12,
              children: WorkoutDifficulty.values.map((difficulty) {
                final state = ref.watch(workoutDiscoveryProvider);
                final isSelected = state.selectedDifficulty == difficulty;
                
                return GestureDetector(
                  onTap: () {
                    if (isSelected) {
                      ref.read(workoutDiscoveryProvider.notifier).filterByDifficulty(null);
                    } else {
                      ref.read(workoutDiscoveryProvider.notifier).filterByDifficulty(difficulty);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? difficulty.color
                          : difficulty.color.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: difficulty.color.withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      difficulty.name,
                      style: TextStyle(
                        color: isSelected ? Colors.white : difficulty.color,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            
            const SizedBox(height: 24),
            
            // Type filter
            const Text(
              'Workout Type',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: WorkoutType.values.map((type) {
                final state = ref.watch(workoutDiscoveryProvider);
                final isSelected = state.selectedType == type;
                
                return GestureDetector(
                  onTap: () {
                    if (isSelected) {
                      ref.read(workoutDiscoveryProvider.notifier).filterByType(null);
                    } else {
                      ref.read(workoutDiscoveryProvider.notifier).filterByType(type);
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
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          type.icon,
                          size: 16,
                          color: isSelected ? Colors.white : Colors.white70,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          type.name,
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.white70,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
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
                  ref.read(workoutDiscoveryProvider.notifier).clearFilters();
                  Navigator.pop(context);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showWorkoutDetails(WorkoutPlan workout) {
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
                      // Workout title
                      Text(
                        workout.name,
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      
                      // Description
                      Text(
                        workout.description,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Workout stats
                      Row(
                        children: [
                          _buildStatChip(
                            icon: Icons.timer,
                            label: workout.duration,
                            color: AppTheme.primaryColor,
                          ),
                          const SizedBox(width: 12),
                          _buildStatChip(
                            icon: Icons.local_fire_department,
                            label: workout.calories,
                            color: const Color(0xFFFF6B35),
                          ),
                          const SizedBox(width: 12),
                          _buildStatChip(
                            icon: Icons.fitness_center,
                            label: workout.difficulty.name,
                            color: workout.difficulty.color,
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Exercises section
                      const Text(
                        'Exercises',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Exercise list
                      ...workout.exercises.map((exercise) => Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.1),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: workout.difficulty.color.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                workout.type.icon,
                                color: workout.difficulty.color,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 16),
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
                                    '${exercise.metadata['sets']} sets × ${exercise.metadata['reps']} reps',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.white.withOpacity(0.7),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )).toList(),
                      
                      const SizedBox(height: 24),
                      
                      // Action buttons
                      Row(
                        children: [
                          Expanded(
                            child: GlassButton(
                              text: 'Start Workout',
                              isPrimary: true,
                              onPressed: () {
                                Navigator.pop(context);
                                // Navigate to active workout
                                print('🚀 Starting workout: ${workout.name}');
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          GlassButton(
                            text: 'Save',
                            icon: Icons.bookmark_border,
                            onPressed: () {
                              // Save workout
                              print('💾 Saving workout: ${workout.name}');
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
}