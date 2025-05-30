import 'dart:math';

class ExerciseVideoService {
  static final Random _random = Random();
  
  // Simulated video URLs for different exercise types
  static const Map<String, List<String>> _videoTemplates = {
    'push_ups': [
      'https://videos.example.com/push_ups_basic.mp4',
      'https://videos.example.com/push_ups_diamond.mp4',
      'https://videos.example.com/push_ups_wide_grip.mp4',
      'https://videos.example.com/push_ups_archer.mp4',
    ],
    'squats': [
      'https://videos.example.com/squats_basic.mp4',
      'https://videos.example.com/squats_goblet.mp4',
      'https://videos.example.com/squats_jump.mp4',
      'https://videos.example.com/squats_bulgarian.mp4',
    ],
    'planks': [
      'https://videos.example.com/plank_standard.mp4',
      'https://videos.example.com/plank_side.mp4',
      'https://videos.example.com/plank_up_down.mp4',
      'https://videos.example.com/plank_mountain_climber.mp4',
    ],
    'lunges': [
      'https://videos.example.com/lunges_forward.mp4',
      'https://videos.example.com/lunges_reverse.mp4',
      'https://videos.example.com/lunges_walking.mp4',
      'https://videos.example.com/lunges_lateral.mp4',
    ],
    'burpees': [
      'https://videos.example.com/burpees_standard.mp4',
      'https://videos.example.com/burpees_half.mp4',
      'https://videos.example.com/burpees_tuck_jump.mp4',
    ],
    'pull_ups': [
      'https://videos.example.com/pull_ups_standard.mp4',
      'https://videos.example.com/pull_ups_chin_up.mp4',
      'https://videos.example.com/pull_ups_wide_grip.mp4',
      'https://videos.example.com/pull_ups_assisted.mp4',
    ],
    'deadlifts': [
      'https://videos.example.com/deadlift_conventional.mp4',
      'https://videos.example.com/deadlift_romanian.mp4',
      'https://videos.example.com/deadlift_sumo.mp4',
    ],
    'bench_press': [
      'https://videos.example.com/bench_press_flat.mp4',
      'https://videos.example.com/bench_press_incline.mp4',
      'https://videos.example.com/bench_press_decline.mp4',
    ],
    'rows': [
      'https://videos.example.com/rows_bent_over.mp4',
      'https://videos.example.com/rows_cable.mp4',
      'https://videos.example.com/rows_inverted.mp4',
    ],
    'shoulder_press': [
      'https://videos.example.com/shoulder_press_overhead.mp4',
      'https://videos.example.com/shoulder_press_arnold.mp4',
      'https://videos.example.com/shoulder_press_pike.mp4',
    ],
    'curls': [
      'https://videos.example.com/curls_bicep.mp4',
      'https://videos.example.com/curls_hammer.mp4',
      'https://videos.example.com/curls_concentration.mp4',
    ],
    'extensions': [
      'https://videos.example.com/tricep_extensions.mp4',
      'https://videos.example.com/leg_extensions.mp4',
      'https://videos.example.com/skull_crushers.mp4',
    ],
    'jumping_jacks': [
      'https://videos.example.com/jumping_jacks_standard.mp4',
      'https://videos.example.com/jumping_jacks_star.mp4',
    ],
    'mountain_climbers': [
      'https://videos.example.com/mountain_climbers_standard.mp4',
      'https://videos.example.com/mountain_climbers_cross_body.mp4',
    ],
    'stretches': [
      'https://videos.example.com/stretches_hamstring.mp4',
      'https://videos.example.com/stretches_quad.mp4',
      'https://videos.example.com/stretches_chest.mp4',
      'https://videos.example.com/stretches_shoulder.mp4',
    ],
    'yoga': [
      'https://videos.example.com/yoga_downward_dog.mp4',
      'https://videos.example.com/yoga_warrior.mp4',
      'https://videos.example.com/yoga_tree_pose.mp4',
      'https://videos.example.com/yoga_childs_pose.mp4',
    ],
    'kegels': [
      'https://videos.example.com/kegels_basic.mp4',
      'https://videos.example.com/kegels_bridge.mp4',
      'https://videos.example.com/pelvic_floor_breathing.mp4',
    ],
    'generic': [
      'https://videos.example.com/generic_exercise_1.mp4',
      'https://videos.example.com/generic_exercise_2.mp4',
      'https://videos.example.com/generic_exercise_3.mp4',
      'https://videos.example.com/generic_exercise_4.mp4',
      'https://videos.example.com/generic_exercise_5.mp4',
    ],
  };

  /// Generates a video URL for an exercise based on its name
  static String generateVideoUrl(String exerciseName) {
    final normalizedName = exerciseName.toLowerCase();
    
    // Try to match exercise name to video category
    String category = 'generic';
    
    if (normalizedName.contains('push') || normalizedName.contains('push-up')) {
      category = 'push_ups';
    } else if (normalizedName.contains('squat')) {
      category = 'squats';
    } else if (normalizedName.contains('plank')) {
      category = 'planks';
    } else if (normalizedName.contains('lunge')) {
      category = 'lunges';
    } else if (normalizedName.contains('burpee')) {
      category = 'burpees';
    } else if (normalizedName.contains('pull') || normalizedName.contains('chin')) {
      category = 'pull_ups';
    } else if (normalizedName.contains('deadlift')) {
      category = 'deadlifts';
    } else if (normalizedName.contains('bench') || normalizedName.contains('press')) {
      category = 'bench_press';
    } else if (normalizedName.contains('row')) {
      category = 'rows';
    } else if (normalizedName.contains('shoulder') && normalizedName.contains('press')) {
      category = 'shoulder_press';
    } else if (normalizedName.contains('curl')) {
      category = 'curls';
    } else if (normalizedName.contains('extension')) {
      category = 'extensions';
    } else if (normalizedName.contains('jumping') || normalizedName.contains('jack')) {
      category = 'jumping_jacks';
    } else if (normalizedName.contains('mountain') || normalizedName.contains('climber')) {
      category = 'mountain_climbers';
    } else if (normalizedName.contains('stretch') || normalizedName.contains('fold')) {
      category = 'stretches';
    } else if (normalizedName.contains('yoga') || normalizedName.contains('pose') || 
               normalizedName.contains('warrior') || normalizedName.contains('dog')) {
      category = 'yoga';
    } else if (normalizedName.contains('kegel') || normalizedName.contains('pelvic')) {
      category = 'kegels';
    }
    
    final videoList = _videoTemplates[category] ?? _videoTemplates['generic']!;
    return videoList[_random.nextInt(videoList.length)];
  }

  /// Generates a thumbnail URL for an exercise video
  static String generateThumbnailUrl(String videoUrl) {
    // Convert video URL to thumbnail URL
    return videoUrl.replaceAll('.mp4', '_thumb.jpg');
  }

  /// Gets the video duration in seconds (simulated)
  static int getVideoDuration(String exerciseName) {
    final normalizedName = exerciseName.toLowerCase();
    
    // Different exercise types have different typical durations
    if (normalizedName.contains('stretch') || normalizedName.contains('yoga')) {
      return 45 + _random.nextInt(46); // 45-90 seconds for stretches
    } else if (normalizedName.contains('plank') || normalizedName.contains('hold')) {
      return 30 + _random.nextInt(31); // 30-60 seconds for holds
    } else if (normalizedName.contains('hiit') || normalizedName.contains('tabata')) {
      return 20 + _random.nextInt(21); // 20-40 seconds for HIIT
    } else {
      return 25 + _random.nextInt(36); // 25-60 seconds for regular exercises
    }
  }

  /// Gets video quality options
  static List<String> getVideoQualities(String videoUrl) {
    final baseUrl = videoUrl.replaceAll('.mp4', '');
    return [
      '${baseUrl}_480p.mp4',
      '${baseUrl}_720p.mp4',
      '${baseUrl}_1080p.mp4',
    ];
  }

  /// Checks if video is available (simulated - always returns true for demo)
  static Future<bool> isVideoAvailable(String videoUrl) async {
    // Simulate network check delay
    await Future.delayed(const Duration(milliseconds: 100));
    
    // In real implementation, this would ping the video URL
    // For demo purposes, we'll simulate 95% availability
    return _random.nextDouble() > 0.05;
  }

  /// Gets related exercise videos
  static List<String> getRelatedVideos(String exerciseName, {int count = 3}) {
    final videos = <String>[];
    
    for (int i = 0; i < count; i++) {
      // Generate slight variations of the exercise name for related videos
      final variations = [
        '${exerciseName} Variation ${i + 1}',
        '${exerciseName} Advanced',
        '${exerciseName} Beginner',
        '${exerciseName} Modified',
      ];
      
      final variationName = variations[_random.nextInt(variations.length)];
      videos.add(generateVideoUrl(variationName));
    }
    
    return videos;
  }
}