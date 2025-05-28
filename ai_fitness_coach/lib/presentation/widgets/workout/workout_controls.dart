import 'package:flutter/material.dart';
import '../glass_widgets.dart';

class WorkoutControls extends StatelessWidget {
  final VoidCallback onOverview;
  final VoidCallback? onPrevious;
  final VoidCallback onNext;

  const WorkoutControls({
    Key? key,
    required this.onOverview,
    this.onPrevious,
    required this.onNext,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Row(
        children: [
          Expanded(
            child: GlassMorphicButton(
              text: 'Overview',
              icon: Icons.list,
              onPressed: onOverview,
              height: 48,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: GlassMorphicButton(
              text: 'Previous',
              icon: Icons.skip_previous,
              onPressed: onPrevious,
              height: 48,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: GlassMorphicButton(
              text: 'Next',
              icon: Icons.skip_next,
              isPrimary: true,
              onPressed: onNext,
              height: 48,
            ),
          ),
        ],
      ),
    );
  }
}