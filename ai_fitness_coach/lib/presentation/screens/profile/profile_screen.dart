import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/user_preferences_provider.dart';
import '../../../services/database_service.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final DatabaseService _databaseService = DatabaseService();
  Map<String, dynamic> _workoutStats = {};
  List<double> _weeklyActivity = [];
  List<Map<String, String>> _achievements = [];
  
  @override
  void initState() {
    super.initState();
    _loadUserStats();
  }
  
  Future<void> _loadUserStats() async {
    final stats = await _databaseService.getWorkoutStats();
    final activity = await _databaseService.getWeeklyActivity();
    final achievements = await _databaseService.getAchievements();
    
    setState(() {
      _workoutStats = stats;
      _weeklyActivity = activity;
      _achievements = achievements;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final userData = ref.watch(userPreferencesProvider);
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Profile',
                    style: TextStyle(
                      fontSize: 34,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      context.push('/settings');
                    },
                    icon: const Icon(
                      Icons.settings_outlined,
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 32),
              
              // Profile Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white.withOpacity(0.1),
                      Colors.white.withOpacity(0.05),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
                child: Row(
                  children: [
                    // Avatar
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: userData.selectedCoach?.gradient ?? const LinearGradient(
                          colors: [Color(0xFF007AFF), Color(0xFF00C7BE)],
                        ),
                      ),
                      child: Center(
                        child: userData.avatarUrl != null 
                            ? ClipOval(
                                child: Image.network(
                                  userData.avatarUrl!,
                                  width: 80,
                                  height: 80,
                                  fit: BoxFit.cover,
                                ),
                              )
                            : Text(
                                userData.name?.isNotEmpty == true 
                                    ? userData.name!.substring(0, 1).toUpperCase()
                                    : 'U',
                                style: const TextStyle(
                                  fontSize: 32,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(width: 20),
                    // Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            userData.name ?? 'Fitness Enthusiast',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Level ${userData.level} • ${userData.xp} XP',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.white.withOpacity(0.7),
                            ),
                          ),
                          if (userData.selectedCoach != null) ...[
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text(
                                  userData.selectedCoach!.avatar,
                                  style: const TextStyle(fontSize: 14),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Coached by ${userData.selectedCoach!.name}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: userData.selectedCoach!.color,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Stats Grid
              const Text(
                'This Week',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 1.5,
                children: [
                  _buildStatCard(
                    icon: Icons.local_fire_department,
                    value: _workoutStats['totalCalories']?.toString() ?? '0',
                    label: 'Calories',
                    color: const Color(0xFFFF9F0A),
                  ),
                  _buildStatCard(
                    icon: Icons.timer_outlined,
                    value: '${(_workoutStats['totalHours'] ?? 0).toStringAsFixed(1)}h',
                    label: 'Time',
                    color: const Color(0xFF30D158),
                  ),
                  _buildStatCard(
                    icon: Icons.fitness_center,
                    value: _workoutStats['workoutCount']?.toString() ?? '0',
                    label: 'Workouts',
                    color: const Color(0xFF007AFF),
                  ),
                  _buildStatCard(
                    icon: Icons.trending_up,
                    value: _workoutStats['streakDays']?.toString() ?? '0',
                    label: 'Streak Days',
                    color: const Color(0xFFBF5AF2),
                  ),
                ],
              ),
              
              const SizedBox(height: 32),
              
              // Activity Chart
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white.withOpacity(0.1),
                      Colors.white.withOpacity(0.05),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Activity',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildActivityChart(),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Achievements
              const Text(
                'Recent Achievements',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              
              SizedBox(
                height: 100,
                child: _achievements.isEmpty 
                    ? Center(
                        child: Text(
                          'Complete workouts to unlock achievements!',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.5),
                          ),
                        ),
                      )
                    : ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: _achievements.length,
                        itemBuilder: (context, index) {
                          final achievement = _achievements[index];
                          return _buildAchievementBadge(
                            achievement['emoji'] ?? '🏆',
                            achievement['title'] ?? 'Achievement',
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withOpacity(0.3),
            color.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(
            icon,
            color: color,
            size: 28,
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  color: color.withOpacity(0.8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActivityChart() {
    final days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    final values = _weeklyActivity.isNotEmpty ? _weeklyActivity : [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    final today = DateTime.now().weekday - 1;

    return SizedBox(
      height: 120,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(days.length, (index) {
          final isToday = index == today;
          final hasActivity = values[index] > 0;
          
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Flexible(
                    child: AnimatedContainer(
                      duration: Duration(milliseconds: 500 + (index * 100)),
                      curve: Curves.easeOutBack,
                      width: double.infinity,
                      height: 80 * values[index],
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: isToday
                              ? [const Color(0xFF007AFF), const Color(0xFF00C7BE)]
                              : hasActivity
                                  ? [Colors.white.withOpacity(0.3), Colors.white.withOpacity(0.1)]
                                  : [Colors.white.withOpacity(0.1), Colors.white.withOpacity(0.05)],
                        ),
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    days[index],
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                      color: isToday ? const Color(0xFF007AFF) : Colors.white.withOpacity(0.5),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildAchievementBadge(String emoji, String title) {
    return Container(
      width: 100,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withOpacity(0.1),
            Colors.white.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            emoji,
            style: const TextStyle(fontSize: 32),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.7),
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}