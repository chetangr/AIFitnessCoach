import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../workouts/workouts_screen.dart';
import '../compass/compass_screen.dart';
import '../exercises/exercise_library_screen.dart';
import '../guest_pass/guest_pass_screen.dart';
import '../messages/messages_screen.dart';

class MainScreen extends ConsumerStatefulWidget {
  const MainScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen>
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  late PageController _pageController;
  late AnimationController _fabAnimationController;
  late Animation<double> _fabScaleAnimation;

  final List<BottomNavItem> _navItems = [
    BottomNavItem(
      icon: Icons.fitness_center,
      label: 'Workouts',
      activeColor: const Color(0xFF007AFF),
    ),
    BottomNavItem(
      icon: Icons.explore,
      label: 'Discover',
      activeColor: const Color(0xFF30D158),
    ),
    BottomNavItem(
      icon: Icons.list_alt,
      label: 'Exercises',
      activeColor: const Color(0xFF6C5CE7),
    ),
    BottomNavItem(
      icon: Icons.chat_bubble,
      label: 'Messages',
      activeColor: const Color(0xFFFF375F),
    ),
  ];

  final List<Widget> _screens = [
    const WorkoutsScreen(),
    const CompassScreen(),
    const ExerciseLibraryScreen(),
    const MessagesScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _fabAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fabScaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _fabAnimationController,
        curve: Curves.elasticOut,
      ),
    );
    _fabAnimationController.forward();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _fabAnimationController.dispose();
    super.dispose();
  }

  void _onNavItemTapped(int index) {
    // Add haptic feedback for better micro-interactions
    HapticFeedback.lightImpact();
    
    setState(() {
      _currentIndex = index;
    });
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        children: _screens,
      ),
      floatingActionButton: _currentIndex == 0 ? ScaleTransition(
        scale: _fabScaleAnimation,
        child: FloatingActionButton(
          onPressed: () {
            // Navigate to create workout or quick start
            _showQuickActionBottomSheet();
          },
          backgroundColor: AppTheme.primaryColor,
          elevation: 8,
          child: const Icon(
            Icons.add,
            color: Colors.white,
            size: 28,
          ),
        ),
      ) : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: _buildBottomNavBar(),
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 34), // Extra bottom margin for home indicator
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutBack,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(30),
          child: Container(
            height: 80,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.4),
                  blurRadius: 30,
                  offset: const Offset(0, 15),
                  spreadRadius: 0,
                ),
                BoxShadow(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  blurRadius: 50,
                  offset: const Offset(0, 20),
                  spreadRadius: 5,
                ),
              ],
            ),
            child: Stack(
              children: [
                // Enhanced glass background
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    color: Colors.black.withOpacity(0.3),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.15),
                      width: 1.5,
                    ),
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.white.withOpacity(0.08),
                        Colors.white.withOpacity(0.03),
                      ],
                    ),
                  ),
                ),
                
                // Floating selection indicator
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.elasticOut,
                  left: (_currentIndex * (MediaQuery.of(context).size.width - 40) / _navItems.length) + 20,
                  top: 8,
                  width: (MediaQuery.of(context).size.width - 40) / _navItems.length - 40,
                  height: 64,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: _navItems[_currentIndex].activeColor.withOpacity(0.15),
                      border: Border.all(
                        color: _navItems[_currentIndex].activeColor.withOpacity(0.3),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: _navItems[_currentIndex].activeColor.withOpacity(0.2),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Navigation items
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: List.generate(
                    _navItems.length,
                    (index) => _buildNavItem(index),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index) {
    final item = _navItems[index];
    final isSelected = _currentIndex == index;
    
    return Expanded(
      child: GestureDetector(
        onTap: () => _onNavItemTapped(index),
        child: AnimatedScale(
          scale: isSelected ? 1.0 : 0.9,
          duration: const Duration(milliseconds: 200),
          child: Container(
            height: 80,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Icon with haptic feedback and spring animation
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.elasticOut,
                  padding: EdgeInsets.all(isSelected ? 12 : 8),
                  decoration: BoxDecoration(
                    color: isSelected 
                        ? item.activeColor.withOpacity(0.2)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: isSelected ? [
                      BoxShadow(
                        color: item.activeColor.withOpacity(0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ] : null,
                  ),
                  child: AnimatedRotation(
                    turns: isSelected ? 0 : 0,
                    duration: const Duration(milliseconds: 300),
                    child: Icon(
                      item.icon,
                      color: isSelected 
                          ? item.activeColor 
                          : Colors.white.withOpacity(0.5),
                      size: isSelected ? 26 : 22,
                    ),
                  ),
                ),
                
                // Animated label
                AnimatedOpacity(
                  opacity: isSelected ? 1.0 : 0.6,
                  duration: const Duration(milliseconds: 200),
                  child: AnimatedDefaultTextStyle(
                    duration: const Duration(milliseconds: 200),
                    style: TextStyle(
                      fontSize: isSelected ? 13 : 11,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected 
                          ? item.activeColor 
                          : Colors.white.withOpacity(0.5),
                      letterSpacing: isSelected ? 0.5 : 0,
                    ),
                    child: Text(item.label),
                  ),
                ),
                
                // Selection indicator dot
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.only(top: 4),
                  width: isSelected ? 6 : 0,
                  height: isSelected ? 6 : 0,
                  decoration: BoxDecoration(
                    color: item.activeColor,
                    shape: BoxShape.circle,
                    boxShadow: isSelected ? [
                      BoxShadow(
                        color: item.activeColor.withOpacity(0.6),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ] : null,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showQuickActionBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: 200,
        margin: const EdgeInsets.all(16),
        decoration: AppTheme.glassDecoration(borderRadius: 20),
        child: Column(
          children: [
            const SizedBox(height: 16),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Quick Actions',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildQuickActionButton(
                  icon: Icons.play_arrow,
                  label: 'Quick Start',
                  color: const Color(0xFF30D158),
                  onTap: () {
                    Navigator.pop(context);
                    // Navigate to quick start workout
                  },
                ),
                _buildQuickActionButton(
                  icon: Icons.create,
                  label: 'Create Workout',
                  color: const Color(0xFF007AFF),
                  onTap: () {
                    Navigator.pop(context);
                    // Navigate to create workout
                  },
                ),
                _buildQuickActionButton(
                  icon: Icons.psychology,
                  label: 'Ask Coach',
                  color: const Color(0xFF6C5CE7),
                  onTap: () {
                    Navigator.pop(context);
                    // Navigate to coach chat
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [color, color.withOpacity(0.7)],
              ),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 28,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class BottomNavItem {
  final IconData icon;
  final String label;
  final Color activeColor;

  BottomNavItem({
    required this.icon,
    required this.label,
    required this.activeColor,
  });
}