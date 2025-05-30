import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../services/auth_service.dart';
import '../../../services/database_service.dart';
import '../../../data/models/user_model.dart';
import '../../widgets/glass_container.dart';

class OnboardingFlowScreen extends ConsumerStatefulWidget {
  const OnboardingFlowScreen({super.key});

  @override
  ConsumerState<OnboardingFlowScreen> createState() => _OnboardingFlowScreenState();
}

class _OnboardingFlowScreenState extends ConsumerState<OnboardingFlowScreen> {
  final PageController _pageController = PageController();
  final AuthService _authService = AuthService();
  final DatabaseService _databaseService = DatabaseService();
  
  int _currentStep = 0;
  final int _totalSteps = 8;
  
  // Step 1 - User Info
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  String? _selectedSex;
  
  // Step 2 - Fitness Goal
  String? _selectedGoal;
  final List<Map<String, dynamic>> _fitnessGoals = [
    {'id': 'lose_fat', 'title': 'Lose Fat', 'icon': Icons.local_fire_department},
    {'id': 'build_strength', 'title': 'Build Strength', 'icon': Icons.fitness_center},
    {'id': 'get_toned', 'title': 'Get Toned', 'icon': Icons.accessibility_new},
    {'id': 'gain_muscle', 'title': 'Gain Muscle', 'icon': Icons.sports_gymnastics},
    {'id': 'stay_healthy', 'title': 'Stay Healthy and Fit', 'icon': Icons.favorite},
    {'id': 'cardio_endurance', 'title': 'Increase Cardio Endurance', 'icon': Icons.directions_run},
    {'id': 'everyday_strength', 'title': 'Everyday Strength and Mobility', 'icon': Icons.accessibility},
  ];
  
  // Step 3 - Why (Goal Reason)
  String? _selectedReason;
  final List<String> _goalReasons = [
    'Look and feel my best',
    'Improve health markers',
    'Boost confidence',
    'Enhance athletic performance',
    'Manage stress better',
    'Have more energy',
    'Age gracefully',
  ];
  
  // Step 4 - When to workout
  List<String> _selectedDays = [];
  final List<String> _weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Step 5 - Training Equipment
  String? _selectedEquipment;
  final List<Map<String, dynamic>> _equipmentOptions = [
    {'id': 'full_gym', 'title': 'Full gym', 'icon': Icons.fitness_center},
    {'id': 'dumbbells', 'title': 'Dumbbells only', 'icon': Icons.fitness_center},
    {'id': 'bodyweight', 'title': 'Bodyweight only', 'icon': Icons.accessibility_new},
    {'id': 'basic', 'title': 'Basic equipment\n(bench, barbells and dumbbells)', 'icon': Icons.fitness_center},
    {'id': 'cable', 'title': 'Cable machine only', 'icon': Icons.cable},
  ];
  
  // Step 6 - Fitness Level
  String? _selectedLevel;
  final List<Map<String, String>> _fitnessLevels = [
    {
      'id': 'beginner',
      'title': 'Beginner or returning to exercise',
      'subtitle': 'Low to moderate cardio and strength fitness',
    },
    {
      'id': 'intermediate',
      'title': 'Intermediate',
      'subtitle': 'Fit and able to handle most workouts',
    },
    {
      'id': 'advanced',
      'title': 'Advanced',
      'subtitle': 'Highly experienced and fit',
    },
  ];
  
  // Step 7 - Diet Preference
  String? _selectedDiet;
  final List<Map<String, dynamic>> _dietOptions = [
    {'id': 'all_foods', 'title': 'Open to All Foods', 'icon': Icons.restaurant},
    {'id': 'vegetarian', 'title': 'Vegetarian', 'icon': Icons.eco},
    {'id': 'vegan', 'title': 'Vegan', 'icon': Icons.eco},
    {'id': 'pescatarian', 'title': 'Pescatarian', 'icon': Icons.set_meal},
  ];
  
  // Step 8 - Mindset Activities
  List<String> _selectedMindsetActivities = [];
  final List<String> _mindsetOptions = [
    'Improve focus and motivation',
    'Increase relaxation',
    'Sleep better',
    'Reduce stress and anxiety',
    'None of the above',
  ];

  @override
  void dispose() {
    _pageController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_validateCurrentStep()) {
      if (_currentStep < _totalSteps - 1) {
        setState(() => _currentStep++);
        _pageController.nextPage(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      } else {
        _completeOnboarding();
      }
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  bool _validateCurrentStep() {
    switch (_currentStep) {
      case 0:
        if (_firstNameController.text.isEmpty || 
            _lastNameController.text.isEmpty || 
            _selectedSex == null) {
          _showError('Please fill in all fields');
          return false;
        }
        return true;
      case 1:
        if (_selectedGoal == null) {
          _showError('Please select a fitness goal');
          return false;
        }
        return true;
      case 2:
        if (_selectedReason == null) {
          _showError('Please select why you want to achieve your goal');
          return false;
        }
        return true;
      case 3:
        if (_selectedDays.isEmpty) {
          _showError('Please select at least one day');
          return false;
        }
        return true;
      case 4:
        if (_selectedEquipment == null) {
          _showError('Please select your available equipment');
          return false;
        }
        return true;
      case 5:
        if (_selectedLevel == null) {
          _showError('Please select your fitness level');
          return false;
        }
        return true;
      case 6:
        if (_selectedDiet == null) {
          _showError('Please select your diet preference');
          return false;
        }
        return true;
      case 7:
        // Mindset activities can be empty (None of the above)
        return true;
      default:
        return true;
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade400,
      ),
    );
  }

  Future<void> _completeOnboarding() async {
    try {
      final currentUser = await _authService.getCurrentUser();
      if (currentUser == null) return;

      final updatedUser = currentUser.copyWith(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        sex: _selectedSex,
        goals: [_selectedGoal!],
        trainingEquipment: _selectedEquipment,
        dietPreference: _selectedDiet,
        fitnessLevel: _selectedLevel!,
        mindsetActivities: _selectedMindsetActivities,
        preferences: {
          ...currentUser.preferences,
          'goalReason': _selectedReason,
          'workoutDays': _selectedDays,
        },
        updatedAt: DateTime.now(),
      );

      await _authService.updateUser(updatedUser);
      
      if (mounted) {
        context.go('/coach-selection');
      }
    } catch (e) {
      _showError('Failed to save onboarding data: $e');
    }
  }

  String _getButtonText() {
    final buttonTexts = [
      'CONTINUE',
      'TAKE THE NEXT STEP',
      'KEEP GOING',
      'ALMOST THERE',
      'POWER THROUGH',
      'STAY STRONG',
      'FINAL STRETCH',
      'FINISH STRONG',
    ];
    return buttonTexts[_currentStep];
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? [const Color(0xFF1a1a2e), const Color(0xFF0f0f1e)]
                : [const Color(0xFF6B73FF), const Color(0xFF000DFF)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Progress bar
              Container(
                height: 4,
                margin: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(2),
                ),
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: (_currentStep + 1) / _totalSteps,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),
              
              // Page content
              Expanded(
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    _buildStep1(),
                    _buildStep2(),
                    _buildStep3(),
                    _buildStep4(),
                    _buildStep5(),
                    _buildStep6(),
                    _buildStep7(),
                    _buildStep8(),
                  ],
                ),
              ),
              
              // Navigation buttons
              Padding(
                padding: const EdgeInsets.all(24),
                child: Row(
                  children: [
                    if (_currentStep > 0)
                      IconButton(
                        onPressed: _previousStep,
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                      )
                    else
                      const SizedBox(width: 48),
                    const Spacer(),
                    SizedBox(
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _nextStep,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Theme.of(context).primaryColor,
                          padding: const EdgeInsets.symmetric(horizontal: 32),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: Text(
                          _getButtonText(),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
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

  Widget _buildStep1() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Tell us about yourself',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'This helps us personalize your experience',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 40),
          
          GlassContainer(
            child: TextField(
              controller: _firstNameController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'First Name',
                labelStyle: TextStyle(color: Colors.white70),
                border: InputBorder.none,
                contentPadding: EdgeInsets.all(16),
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          GlassContainer(
            child: TextField(
              controller: _lastNameController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Last Name',
                labelStyle: TextStyle(color: Colors.white70),
                border: InputBorder.none,
                contentPadding: EdgeInsets.all(16),
              ),
            ),
          ),
          const SizedBox(height: 24),
          
          const Text(
            'Sex',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _selectedSex = 'Male'),
                  child: GlassContainer(
                    padding: const EdgeInsets.all(20),
                    borderColor: _selectedSex == 'Male' ? Colors.white : null,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.male,
                          color: _selectedSex == 'Male' ? Colors.white : Colors.white70,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Male',
                          style: TextStyle(
                            color: _selectedSex == 'Male' ? Colors.white : Colors.white70,
                            fontWeight: _selectedSex == 'Male' ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _selectedSex = 'Female'),
                  child: GlassContainer(
                    padding: const EdgeInsets.all(20),
                    borderColor: _selectedSex == 'Female' ? Colors.white : null,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.female,
                          color: _selectedSex == 'Female' ? Colors.white : Colors.white70,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Female',
                          style: TextStyle(
                            color: _selectedSex == 'Female' ? Colors.white : Colors.white70,
                            fontWeight: _selectedSex == 'Female' ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          
          const Spacer(),
          
          TextButton(
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Why do we need this?'),
                  content: const Text(
                    'We use this information to:\n\n'
                    '• Personalize your workout recommendations\n'
                    '• Calculate accurate calorie burn estimates\n'
                    '• Provide appropriate exercise modifications\n'
                    '• Track your progress more effectively\n\n'
                    'Your data is kept private and secure.',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Got it'),
                    ),
                  ],
                ),
              );
            },
            child: const Text(
              'Why do we need this?',
              style: TextStyle(
                color: Colors.white70,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'What\'s your main fitness goal?',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose one that best matches your primary objective',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 32),
          
          Expanded(
            child: ListView.builder(
              itemCount: _fitnessGoals.length,
              itemBuilder: (context, index) {
                final goal = _fitnessGoals[index];
                final isSelected = _selectedGoal == goal['id'];
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedGoal = goal['id']),
                    child: GlassContainer(
                      padding: const EdgeInsets.all(20),
                      borderColor: isSelected ? Colors.white : null,
                      child: Row(
                        children: [
                          Icon(
                            goal['icon'],
                            color: isSelected ? Colors.white : Colors.white70,
                            size: 28,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Text(
                              goal['title'],
                              style: TextStyle(
                                fontSize: 18,
                                color: isSelected ? Colors.white : Colors.white70,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ),
                          if (isSelected)
                            const Icon(
                              Icons.check_circle,
                              color: Colors.white,
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep3() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Why do you want to achieve this goal?',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Understanding your motivation helps us keep you on track',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 32),
          
          Expanded(
            child: ListView.builder(
              itemCount: _goalReasons.length,
              itemBuilder: (context, index) {
                final reason = _goalReasons[index];
                final isSelected = _selectedReason == reason;
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedReason = reason),
                    child: GlassContainer(
                      padding: const EdgeInsets.all(20),
                      borderColor: isSelected ? Colors.white : null,
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              reason,
                              style: TextStyle(
                                fontSize: 18,
                                color: isSelected ? Colors.white : Colors.white70,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ),
                          if (isSelected)
                            const Icon(
                              Icons.check_circle,
                              color: Colors.white,
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep4() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'When can you workout?',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Select the days you\'re available for training',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 32),
          
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: _weekDays.map((day) {
              final isSelected = _selectedDays.contains(day);
              
              return GestureDetector(
                onTap: () {
                  setState(() {
                    if (isSelected) {
                      _selectedDays.remove(day);
                    } else {
                      _selectedDays.add(day);
                    }
                  });
                },
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? Colors.white : Colors.white30,
                      width: 2,
                    ),
                    color: isSelected 
                        ? Colors.white.withOpacity(0.2)
                        : Colors.white.withOpacity(0.05),
                  ),
                  child: Center(
                    child: Text(
                      day,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? Colors.white : Colors.white70,
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: Colors.white70),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '${_selectedDays.length} days selected',
                    style: const TextStyle(color: Colors.white70),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep5() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'What equipment do you have access to?',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'We\'ll create workouts based on your available equipment',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 32),
          
          Expanded(
            child: ListView.builder(
              itemCount: _equipmentOptions.length,
              itemBuilder: (context, index) {
                final equipment = _equipmentOptions[index];
                final isSelected = _selectedEquipment == equipment['id'];
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedEquipment = equipment['id']),
                    child: GlassContainer(
                      padding: const EdgeInsets.all(20),
                      borderColor: isSelected ? Colors.white : null,
                      child: Row(
                        children: [
                          Icon(
                            equipment['icon'],
                            color: isSelected ? Colors.white : Colors.white70,
                            size: 28,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Text(
                              equipment['title'],
                              style: TextStyle(
                                fontSize: 16,
                                color: isSelected ? Colors.white : Colors.white70,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ),
                          if (isSelected)
                            const Icon(
                              Icons.check_circle,
                              color: Colors.white,
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep6() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'What\'s your fitness level?',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Be honest - this helps us create safe and effective workouts',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 32),
          
          Expanded(
            child: ListView.builder(
              itemCount: _fitnessLevels.length,
              itemBuilder: (context, index) {
                final level = _fitnessLevels[index];
                final isSelected = _selectedLevel == level['id'];
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedLevel = level['id']),
                    child: GlassContainer(
                      padding: const EdgeInsets.all(20),
                      borderColor: isSelected ? Colors.white : null,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            level['title']!,
                            style: TextStyle(
                              fontSize: 18,
                              color: isSelected ? Colors.white : Colors.white70,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            level['subtitle']!,
                            style: TextStyle(
                              fontSize: 14,
                              color: (isSelected ? Colors.white : Colors.white70).withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep7() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Any dietary preferences?',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'We\'ll provide nutrition tips based on your preferences',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 32),
          
          Expanded(
            child: ListView.builder(
              itemCount: _dietOptions.length,
              itemBuilder: (context, index) {
                final diet = _dietOptions[index];
                final isSelected = _selectedDiet == diet['id'];
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedDiet = diet['id']),
                    child: GlassContainer(
                      padding: const EdgeInsets.all(20),
                      borderColor: isSelected ? Colors.white : null,
                      child: Row(
                        children: [
                          Icon(
                            diet['icon'],
                            color: isSelected ? Colors.white : Colors.white70,
                            size: 28,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Text(
                              diet['title'],
                              style: TextStyle(
                                fontSize: 18,
                                color: isSelected ? Colors.white : Colors.white70,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ),
                          if (isSelected)
                            const Icon(
                              Icons.check_circle,
                              color: Colors.white,
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep8() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Interested in mindset activities?',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Select all that apply to enhance your fitness journey',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 32),
          
          Expanded(
            child: ListView.builder(
              itemCount: _mindsetOptions.length,
              itemBuilder: (context, index) {
                final activity = _mindsetOptions[index];
                final isSelected = _selectedMindsetActivities.contains(activity);
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        if (activity == 'None of the above') {
                          _selectedMindsetActivities.clear();
                          _selectedMindsetActivities.add(activity);
                        } else {
                          _selectedMindsetActivities.remove('None of the above');
                          if (isSelected) {
                            _selectedMindsetActivities.remove(activity);
                          } else {
                            _selectedMindsetActivities.add(activity);
                          }
                        }
                      });
                    },
                    child: GlassContainer(
                      padding: const EdgeInsets.all(20),
                      borderColor: isSelected ? Colors.white : null,
                      child: Row(
                        children: [
                          Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected ? Colors.white : Colors.white70,
                                width: 2,
                              ),
                              color: isSelected 
                                  ? Colors.white
                                  : Colors.transparent,
                            ),
                            child: isSelected
                                ? const Icon(
                                    Icons.check,
                                    size: 16,
                                    color: Colors.black,
                                  )
                                : null,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Text(
                              activity,
                              style: TextStyle(
                                fontSize: 18,
                                color: isSelected ? Colors.white : Colors.white70,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}