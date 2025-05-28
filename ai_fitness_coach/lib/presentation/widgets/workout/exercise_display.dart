import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../glass_widgets.dart';
import '../../../models/workout.dart';

class ExerciseDisplay extends StatelessWidget {
  final Exercise exercise;
  final int currentSet;
  final int totalSets;
  final VoidCallback onInfoTap;

  const ExerciseDisplay({
    Key? key,
    required this.exercise,
    required this.currentSet,
    required this.totalSets,
    required this.onInfoTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final weight = (exercise.metadata['weight'] as String?) ?? 'Bodyweight';
    final reps = (exercise.metadata['reps'] as int?) ?? 12;

    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        children: [
          if (weight != 'Bodyweight') ...[
            Text(
              weight,
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 8),
          ],
          Text(
            exercise.name,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF30D158).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color(0xFF30D158).withOpacity(0.3),
                  ),
                ),
                child: Text(
                  'Set $currentSet/$totalSets • $reps reps',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF30D158),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              GestureDetector(
                onTap: onInfoTap,
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.1),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.2),
                    ),
                  ),
                  child: const Icon(
                    Icons.info_outline,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}