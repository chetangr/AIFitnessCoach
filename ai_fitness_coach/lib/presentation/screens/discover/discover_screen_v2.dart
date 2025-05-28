import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/workout.dart';
import '../workout_player/workout_player_screen.dart';
import '../trainer/trainer_selection_screen.dart';

class DiscoverScreenV2 extends ConsumerStatefulWidget {
  const DiscoverScreenV2({Key? key}) : super(key: key);

  @override
  ConsumerState<DiscoverScreenV2> createState() => _DiscoverScreenV2State();
}

class _DiscoverScreenV2State extends ConsumerState<DiscoverScreenV2> {
  final List<String> _tabs = ['For You', 'Explore', 'Library'];
  int _selectedTabIndex = 0;

  final List<Map<String, dynamic>> _workoutCategories = [
    {
      'title': 'Strength',
      'subtitle': 'MORE OF WHAT YOU DO',
      'tags': ['10MIN', 'UPPER BODY', 'GREGG', 'JENN'],
      'workouts': [
        {
          'title': 'Upper Body Burn',
          'trainer': 'Gregg',
          'duration': '30 min',
          'isNew': true,
        },
        {
          'title': 'Core Crusher',
          'trainer': 'Jenn',
          'duration': '20 min',
          'isNew': false,
        },
      ],
    },
    {
      'title': 'HIIT',
      'subtitle': 'HIGH INTENSITY WORKOUTS',
      'tags': ['CARDIO', 'FAT BURN', 'KIM', 'BAKARI'],
      'workouts': [
        {
          'title': 'HIIT with Kim',
          'trainer': 'Kim',
          'duration': '25 min',
          'isNew': true,
        },
        {
          'title': 'Cardio Blast',
          'trainer': 'Bakari',
          'duration': '30 min',
          'isNew': false,
        },
      ],
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildTabs(),
            Expanded(
              child: _buildContent(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Fitness+',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.search, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      height: 44,
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        children: List.generate(
          _tabs.length,
          (index) => Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedTabIndex = index;
                });
                HapticFeedback.lightImpact();
              },
              child: Container(
                margin: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: _selectedTabIndex == index
                      ? Colors.grey[800]
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Center(
                  child: Text(
                    _tabs[index],
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _selectedTabIndex == index
                          ? Colors.white
                          : Colors.grey[400],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_selectedTabIndex == 0) {
      return _buildForYouContent();
    } else if (_selectedTabIndex == 1) {
      return _buildExploreContent();
    } else {
      return _buildLibraryContent();
    }
  }

  Widget _buildForYouContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Featured workout
          _buildFeaturedWorkout(),
          const SizedBox(height: 32),
          
          // Workout categories
          ..._workoutCategories.map((category) => _buildCategorySection(category)),
        ],
      ),
    );
  }

  Widget _buildFeaturedWorkout() {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        final workout = WorkoutPlan(
          id: 'featured_1',
          name: 'HIIT with Kim',
          description: 'Hip-Hop/R&B',
          duration: '10min',
          calories: '150',
          difficulty: WorkoutDifficulty.medium,
          type: WorkoutType.hiit,
          imagePath: '',
          isCompleted: false,
          scheduledFor: DateTime.now(),
          exercises: [],
          metadata: {
            'trainer': 'Kim',
            'music': 'Hip-Hop/R&B',
          },
        );
        
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => WorkoutPlayerScreen(workout: workout),
          ),
        );
      },
      child: Container(
        height: 400,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          image: const DecorationImage(
            image: AssetImage('assets/images/featured_workout.jpg'),
            fit: BoxFit.cover,
          ),
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.transparent,
                Colors.black.withOpacity(0.8),
              ],
            ),
          ),
          child: Stack(
            children: [
              // VIEW PLAN button
              Positioned(
                top: 16,
                left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF32D74B),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(
                        Icons.calendar_today,
                        size: 12,
                        color: Colors.black,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'VIEW PLAN',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              // Workout info
              Positioned(
                left: 20,
                right: 20,
                bottom: 80,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'FOR TODAY',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF32D74B),
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'HIIT with Kim',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '10min • Hip-Hop/R&B',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withOpacity(0.8),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Let's Go button
              Positioned(
                left: 20,
                right: 20,
                bottom: 20,
                child: ElevatedButton(
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    // Start workout
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF32D74B),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    "Let's Go",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategorySection(Map<String, dynamic> category) {
    return Container(
      margin: const EdgeInsets.only(bottom: 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            category['title'] as String,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            category['subtitle'] as String,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.grey[400],
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            (category['tags'] as List<String>).join(' • '),
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: (category['workouts'] as List).length,
              itemBuilder: (context, index) {
                final workout = (category['workouts'] as List)[index];
                return _buildWorkoutCard(workout);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWorkoutCard(Map<String, dynamic> workout) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        // Navigate to workout
      },
      child: Container(
        width: 280,
        margin: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          image: const DecorationImage(
            image: AssetImage('assets/images/workout_thumbnail.jpg'),
            fit: BoxFit.cover,
          ),
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.transparent,
                Colors.black.withOpacity(0.7),
              ],
            ),
          ),
          child: Stack(
            children: [
              if (workout['isNew'] as bool)
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'NEW',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                  ),
                ),
              Positioned(
                left: 16,
                bottom: 16,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      workout['title'] as String,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${workout['trainer']} • ${workout['duration']}',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withOpacity(0.8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildExploreContent() {
    return GridView.builder(
      padding: const EdgeInsets.all(20),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.0,
      ),
      itemCount: 10,
      itemBuilder: (context, index) {
        final categories = [
          'Strength', 'HIIT', 'Yoga', 'Core', 'Dance',
          'Cycling', 'Treadmill', 'Rowing', 'Mindful Cooldown', 'Pilates'
        ];
        
        return GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const TrainerSelectionScreen(),
              ),
            );
          },
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              gradient: LinearGradient(
                colors: [
                  Colors.primaries[index % Colors.primaries.length],
                  Colors.primaries[index % Colors.primaries.length].withOpacity(0.7),
                ],
              ),
            ),
            child: Center(
              child: Text(
                categories[index],
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLibraryContent() {
    return const Center(
      child: Text(
        'Your saved workouts',
        style: TextStyle(
          fontSize: 18,
          color: Colors.white54,
        ),
      ),
    );
  }
}