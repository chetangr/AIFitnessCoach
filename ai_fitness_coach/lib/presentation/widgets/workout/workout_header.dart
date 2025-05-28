import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class WorkoutHeader extends StatelessWidget {
  final String remainingTime;
  final bool soundEnabled;
  final bool audioEnabled;
  final bool isPaused;
  final VoidCallback onClose;
  final VoidCallback onToggleSound;
  final VoidCallback onToggleAudio;
  final VoidCallback onTogglePause;

  const WorkoutHeader({
    Key? key,
    required this.remainingTime,
    required this.soundEnabled,
    required this.audioEnabled,
    required this.isPaused,
    required this.onClose,
    required this.onToggleSound,
    required this.onToggleAudio,
    required this.onTogglePause,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildButton(
            onTap: onClose,
            icon: Icons.close,
          ),
          _buildTimeChip(),
          Row(
            children: [
              _buildButton(
                onTap: onToggleAudio,
                icon: audioEnabled ? Icons.record_voice_over : Icons.voice_over_off,
              ),
              const SizedBox(width: 8),
              _buildButton(
                onTap: onToggleSound,
                icon: soundEnabled ? Icons.volume_up : Icons.volume_off,
              ),
              const SizedBox(width: 8),
              _buildButton(
                onTap: onTogglePause,
                icon: isPaused ? Icons.play_arrow : Icons.pause,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildButton({required VoidCallback onTap, required IconData icon}) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withOpacity(0.1),
          border: Border.all(
            color: Colors.white.withOpacity(0.2),
          ),
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 20,
        ),
      ),
    );
  }

  Widget _buildTimeChip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
        ),
      ),
      child: Text(
        remainingTime,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
    );
  }
}