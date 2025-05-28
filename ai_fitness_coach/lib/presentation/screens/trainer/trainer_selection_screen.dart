import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../models/coach.dart';

class TrainerSelectionScreen extends ConsumerStatefulWidget {
  const TrainerSelectionScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<TrainerSelectionScreen> createState() => _TrainerSelectionScreenState();
}

class _TrainerSelectionScreenState extends ConsumerState<TrainerSelectionScreen> {
  final List<Coach> _coaches = [
    Coach(
      id: 'alex_thunder',
      name: 'Alex Thunder',
      personality: CoachPersonality.aggressive,
      description: 'High-energy coach who pushes you to your limits',
      avatar: '⚡',
      motivationStyle: 'Intense & Demanding',
      catchphrase: 'No limits, no excuses!',
      color: const Color(0xFFFF6B35),
      gradient: const LinearGradient(
        colors: [Color(0xFFFF6B35), Color(0xFFFF8E53)],
      ),
    ),
    Coach(
      id: 'maya_zen',
      name: 'Maya Zen',
      personality: CoachPersonality.supportive,
      description: 'Patient and encouraging coach who builds your confidence',
      avatar: '🌸',
      motivationStyle: 'Supportive & Encouraging',
      catchphrase: 'Progress, not perfection!',
      color: const Color(0xFF6C5CE7),
      gradient: const LinearGradient(
        colors: [Color(0xFF6C5CE7), Color(0xFF8A84FF)],
      ),
    ),
    Coach(
      id: 'ryan_steady',
      name: 'Ryan Steady',
      personality: CoachPersonality.steadyPace,
      description: 'Methodical coach focused on sustainable progress',
      avatar: '🎯',
      motivationStyle: 'Steady & Consistent',
      catchphrase: 'One step at a time!',
      color: const Color(0xFF30D158),
      gradient: const LinearGradient(
        colors: [Color(0xFF30D158), Color(0xFF32E17D)],
      ),
    ),
  ];

  int _selectedCoachIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            const SizedBox(height: 20),
            _buildLevelIndicator(),
            const SizedBox(height: 24),
            _buildTrainerCard(),
            const SizedBox(height: 24),
            _buildProgramsList(),
            const Spacer(),
            _buildSelectButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(8),
            ),
            child: IconButton(
              icon: const Icon(Icons.menu, color: Colors.white),
              onPressed: () {},
            ),
          ),
          Row(
            children: [
              const Text(
                'Level ',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const Text(
                '9',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(width: 16),
              CircleAvatar(
                radius: 20,
                backgroundColor: Colors.grey[300],
                backgroundImage: const AssetImage('assets/images/profile.jpg'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLevelIndicator() {
    return const Text(
      'Select a trainer',
      style: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w300,
        color: Colors.black87,
      ),
    );
  }

  Widget _buildTrainerCard() {
    final coach = _coaches[_selectedCoachIndex];
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 40),
      height: 300,
      child: Stack(
        children: [
          // Background card with gradient
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: coach.gradient,
            ),
          ),
          
          // Coach avatar
          Positioned(
            bottom: 0,
            right: 20,
            child: Container(
              width: 180,
              height: 250,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
              ),
              child: Center(
                child: Text(
                  coach.avatar,
                  style: const TextStyle(
                    fontSize: 120,
                  ),
                ),
              ),
            ),
          ),
          
          // Coach name
          Positioned(
            left: 20,
            bottom: 60,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  coach.name.split(' ')[0],
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  coach.name.split(' ')[1],
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          
          // Coach personality
          Positioned(
            left: 20,
            bottom: 20,
            child: Text(
              coach.personality.name,
              style: TextStyle(
                fontSize: 14,
                color: Colors.white.withOpacity(0.9),
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
          
          // Heart and plus buttons
          Positioned(
            left: 20,
            top: 20,
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.favorite_border,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.add,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgramsList() {
    final coach = _coaches[_selectedCoachIndex];
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "${coach.name.split(' ')[0]}'s Specialties",
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          _buildSpecialtyItem(
            icon: coach.avatar,
            title: coach.motivationStyle,
            description: coach.catchphrase,
          ),
          _buildSpecialtyItem(
            icon: '💭',
            title: 'Coaching Style',
            description: coach.description,
          ),
        ],
      ),
    );
  }

  Widget _buildSpecialtyItem({
    required String icon,
    required String title,
    required String description,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: _coaches[_selectedCoachIndex].color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                icon,
                style: const TextStyle(fontSize: 24),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectButton() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: ElevatedButton(
        onPressed: () {
          HapticFeedback.lightImpact();
          Navigator.pop(context);
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black,
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Text(
              'Select',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            SizedBox(width: 8),
            Icon(
              Icons.arrow_forward,
              color: Colors.white,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}