import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/glass_container.dart';

class PerformanceScreen extends ConsumerStatefulWidget {
  const PerformanceScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<PerformanceScreen> createState() => _PerformanceScreenState();
}

class _PerformanceScreenState extends ConsumerState<PerformanceScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late List<Animation<Offset>> _slideAnimations;
  late Animation<double> _fadeAnimation;

  final List<HeartRateZone> _heartRateZones = [
    HeartRateZone(zone: 1, percentage: 2, color: const Color(0xFF36D1DC)),
    HeartRateZone(zone: 2, percentage: 6, color: const Color(0xFF30D158)),
    HeartRateZone(zone: 3, percentage: 52, color: const Color(0xFFFF9F0A)),
    HeartRateZone(zone: 4, percentage: 34, color: const Color(0xFFFF6B35)),
    HeartRateZone(zone: 5, percentage: 6, color: const Color(0xFFFF375F)),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.3, curve: Curves.easeOut),
      ),
    );
    
    _slideAnimations = List.generate(
      6, // Header + 5 zones
      (index) => Tween<Offset>(
        begin: const Offset(0, 0.3),
        end: Offset.zero,
      ).animate(
        CurvedAnimation(
          parent: _animationController,
          curve: Interval(
            0.1 + (index * 0.1),
            0.4 + (index * 0.1),
            curve: Curves.easeOutBack,
          ),
        ),
      ),
    );
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 24),
                _buildWorkoutTitle(),
                const SizedBox(height: 24),
                _buildPerformanceSection(),
                const SizedBox(height: 24),
                _buildHeartRateChart(),
                const SizedBox(height: 24),
                _buildHeartRateZones(),
                const SizedBox(height: 100), // Bottom padding
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return SlideTransition(
      position: _slideAnimations[0],
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => Navigator.pop(context),
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
                child: const Icon(
                  Icons.arrow_back,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
            
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF30D158).withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: const Color(0xFF30D158).withOpacity(0.3),
                ),
              ),
              child: const Text(
                'WORKOUT COMPLETED\nTODAY 3:24 PM',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF30D158),
                ),
              ),
            ),
            
            GestureDetector(
              onTap: () {
                // Share workout results
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
                child: const Icon(
                  Icons.share,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkoutTitle() {
    return SlideTransition(
      position: _slideAnimations[1],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Two Days Until Hawaii 🏝️',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'San Francisco',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceSection() {
    return SlideTransition(
      position: _slideAnimations[2],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Performance',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              GestureDetector(
                onTap: () {
                  // Share performance data
                },
                child: const Icon(
                  Icons.share,
                  color: AppTheme.primaryColor,
                  size: 20,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  icon: Icons.timer,
                  label: 'TIME',
                  value: '45:43',
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildMetricCard(
                  icon: Icons.local_fire_department,
                  label: 'CALORIES',
                  value: '620',
                  color: const Color(0xFFFF6B35),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                color: color,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withOpacity(0.7),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeartRateChart() {
    return SlideTransition(
      position: _slideAnimations[3],
      child: GlassCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'HEART RATE',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.white70,
              ),
            ),
            const SizedBox(height: 16),
            
            // Heart rate chart placeholder
            Container(
              height: 120,
              child: CustomPaint(
                painter: HeartRateChartPainter(),
                size: const Size(double.infinity, 120),
              ),
            ),
            
            const SizedBox(height: 16),
            const Text(
              '137 BPM AVG',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            Text(
              'MAX 165 MIN 95',
              style: TextStyle(
                fontSize: 12,
                color: Colors.white.withOpacity(0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeartRateZones() {
    return SlideTransition(
      position: _slideAnimations[4],
      child: Column(
        children: _heartRateZones.map((zone) => _buildZoneCard(zone)).toList(),
      ),
    );
  }

  Widget _buildZoneCard(HeartRateZone zone) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        child: Row(
          children: [
            // Zone indicator
            Container(
              width: 8,
              height: 32,
              decoration: BoxDecoration(
                color: zone.color,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            
            const SizedBox(width: 16),
            
            // Zone info
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'ZONE ${zone.zone}',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    '${zone.percentage}%',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: zone.color,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(width: 16),
            
            // Progress bar
            Container(
              width: 60,
              height: 4,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(2),
                color: Colors.white.withOpacity(0.2),
              ),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: zone.percentage / 100,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(2),
                    color: zone.color,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HeartRateZone {
  final int zone;
  final int percentage;
  final Color color;

  HeartRateZone({
    required this.zone,
    required this.percentage,
    required this.color,
  });
}

class HeartRateChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    // Create a simple heart rate curve
    final path = Path();
    final points = _generateHeartRateData(size.width.toInt());
    
    for (int i = 0; i < points.length; i++) {
      final x = (i / (points.length - 1)) * size.width;
      final y = size.height - (points[i] * size.height);
      
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    // Draw gradient
    final gradient = LinearGradient(
      begin: Alignment.bottomCenter,
      end: Alignment.topCenter,
      colors: [
        const Color(0xFF36D1DC),
        const Color(0xFF30D158),
        const Color(0xFFFF9F0A),
        const Color(0xFFFF6B35),
        const Color(0xFFFF375F),
      ],
    );

    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    paint.shader = gradient.createShader(rect);
    
    canvas.drawPath(path, paint);
  }

  List<double> _generateHeartRateData(int points) {
    final data = <double>[];
    for (int i = 0; i < points; i++) {
      // Generate some realistic heart rate variation
      final baseRate = 0.3 + (i / points) * 0.4;
      final noise = (i % 5) * 0.05;
      data.add((baseRate + noise).clamp(0.0, 1.0));
    }
    return data;
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}