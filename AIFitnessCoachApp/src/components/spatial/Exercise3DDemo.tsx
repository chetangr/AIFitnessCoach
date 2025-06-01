import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { VisionGlass } from './VisionGlass';
import { FloatingElement } from './FloatingElement';
import { spatialHaptics } from '../../services/spatialHaptics';

const { width, height } = Dimensions.get('window');

interface Exercise3DView {
  angle: 'front' | 'side' | 'back' | 'top';
  image: string;
  description: string;
  keyPoints: string[];
}

interface Exercise3DData {
  id: string;
  name: string;
  views: Exercise3DView[];
  muscles: string[];
  equipment: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  reps: string;
}

interface Exercise3DDemoProps {
  exercise: Exercise3DData;
  autoRotate?: boolean;
  showKeyPoints?: boolean;
  onAngleChange?: (angle: string) => void;
}

export const Exercise3DDemo: React.FC<Exercise3DDemoProps> = ({
  exercise,
  autoRotate = false,
  showKeyPoints = true,
  onAngleChange,
}) => {
  const [currentAngle, setCurrentAngle] = useState<'front' | 'side' | 'back' | 'top'>('front');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Animation values
  const rotationY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const highlightScale = useSharedValue(1);

  useEffect(() => {
    if (autoRotate) {
      startAutoRotation();
    }
  }, [autoRotate]);

  const startAutoRotation = () => {
    setIsPlaying(true);
    const angles: Array<'front' | 'side' | 'back' | 'top'> = ['front', 'side', 'back', 'top'];
    let currentIndex = 0;

    const rotateToNext = () => {
      currentIndex = (currentIndex + 1) % angles.length;
      setCurrentAngle(angles[currentIndex]);
      onAngleChange?.(angles[currentIndex]);
      
      if (isPlaying) {
        setTimeout(rotateToNext, 3000);
      }
    };

    setTimeout(rotateToNext, 3000);
  };

  const stopAutoRotation = () => {
    setIsPlaying(false);
  };

  const handleAngleChange = (angle: 'front' | 'side' | 'back' | 'top') => {
    spatialHaptics.floatingElementTouch();
    setCurrentAngle(angle);
    onAngleChange?.(angle);
    
    // Animate rotation based on angle
    const rotationMap = {
      front: 0,
      side: 90,
      back: 180,
      top: 270,
    };
    
    rotationY.value = withSpring(rotationMap[angle]);
    scale.value = withSpring(1.05, {}, () => {
      scale.value = withSpring(1);
    });
  };

  const getCurrentView = (): Exercise3DView => {
    return exercise.views.find(view => view.angle === currentAngle) || exercise.views[0];
  };

  const getDifficultyColor = () => {
    switch (exercise.difficulty) {
      case 'Beginner': return ['#4CAF50', '#81C784'];
      case 'Intermediate': return ['#FF9800', '#FFB74D'];
      case 'Advanced': return ['#F44336', '#E57373'];
      default: return ['#667eea', '#764ba2'];
    }
  };

  // Main 3D display animation
  const mainDisplayStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotationY.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  // Highlight animation for key points
  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: highlightScale.value }],
  }));

  const currentView = getCurrentView();

  return (
    <VisionGlass variant="light" depth={2} floating style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.metaInfo}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor()[0] }]}>
              <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
            </View>
            <Text style={styles.duration}>{exercise.duration}</Text>
            <Text style={styles.reps}>{exercise.reps}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={isPlaying ? stopAutoRotation : startAutoRotation}
          style={styles.playButton}
        >
          <LinearGradient
            colors={getDifficultyColor()}
            style={styles.playButtonGradient}
          >
            <Icon 
              name={isPlaying ? 'pause' : 'play'} 
              size={20} 
              color="white" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 3D Exercise Display */}
      <View style={styles.exerciseDisplay}>
        <Animated.View style={[styles.mainDisplay, mainDisplayStyle]}>
          <FloatingElement variant="subtle" depth={1}>
            <VisionGlass variant="ultraThin" style={styles.imageContainer}>
              <Image 
                source={{ uri: currentView.image || 'https://via.placeholder.com/300x400?text=Exercise+Demo' }}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
              
              {/* Muscle highlights overlay */}
              <View style={styles.muscleOverlay}>
                {exercise.muscles.map((muscle, index) => (
                  <Animated.View 
                    key={muscle}
                    style={[
                      styles.muscleHighlight,
                      highlightStyle,
                      {
                        top: `${20 + index * 15}%`,
                        left: `${10 + index * 20}%`,
                        backgroundColor: getDifficultyColor()[0],
                      }
                    ]}
                  >
                    <Text style={styles.muscleText}>{muscle}</Text>
                  </Animated.View>
                ))}
              </View>
              
              {/* Form guide lines */}
              <View style={styles.formGuides}>
                <View style={[styles.guideLine, styles.verticalGuide]} />
                <View style={[styles.guideLine, styles.horizontalGuide]} />
              </View>
            </VisionGlass>
          </FloatingElement>
        </Animated.View>

        {/* Angle Selector */}
        <View style={styles.angleSelector}>
          {(['front', 'side', 'back', 'top'] as const).map((angle, index) => (
            <FloatingElement key={angle} variant="subtle" depth={2}>
              <TouchableOpacity
                onPress={() => handleAngleChange(angle)}
                style={[
                  styles.angleButton,
                  currentAngle === angle && styles.angleButtonActive
                ]}
              >
                <VisionGlass 
                  variant={currentAngle === angle ? "thick" : "ultraThin"}
                  interactive
                  style={styles.angleButtonContent}
                >
                  <Icon 
                    name={
                      angle === 'front' ? 'person-outline' :
                      angle === 'side' ? 'arrow-forward-outline' :
                      angle === 'back' ? 'arrow-back-outline' : 
                      'arrow-up-outline'
                    }
                    size={16}
                    color={currentAngle === angle ? '#667eea' : 'rgba(255,255,255,0.7)'}
                  />
                  <Text style={[
                    styles.angleButtonText,
                    currentAngle === angle && styles.angleButtonTextActive
                  ]}>
                    {angle.charAt(0).toUpperCase() + angle.slice(1)}
                  </Text>
                </VisionGlass>
              </TouchableOpacity>
            </FloatingElement>
          ))}
        </View>
      </View>

      {/* Current View Info */}
      <VisionGlass variant="ultraThin" style={styles.viewInfo}>
        <Text style={styles.viewTitle}>
          {currentView.angle.charAt(0).toUpperCase() + currentView.angle.slice(1)} View
        </Text>
        <Text style={styles.viewDescription}>{currentView.description}</Text>
      </VisionGlass>

      {/* Key Points */}
      {showKeyPoints && (
        <View style={styles.keyPointsContainer}>
          <Text style={styles.keyPointsTitle}>Key Points:</Text>
          {currentView.keyPoints.map((point, index) => (
            <FloatingElement key={index} variant="subtle" depth={3}>
              <View style={styles.keyPoint}>
                <VisionGlass variant="ultraThin" style={styles.keyPointContent}>
                  <View style={[styles.keyPointDot, { backgroundColor: getDifficultyColor()[0] }]} />
                  <Text style={styles.keyPointText}>{point}</Text>
                </VisionGlass>
              </View>
            </FloatingElement>
          ))}
        </View>
      )}

      {/* Equipment Required */}
      <View style={styles.equipmentContainer}>
        <Text style={styles.equipmentTitle}>Equipment:</Text>
        <View style={styles.equipmentList}>
          {exercise.equipment.map((item, index) => (
            <VisionGlass key={index} variant="ultraThin" style={styles.equipmentTag}>
              <Text style={styles.equipmentText}>{item}</Text>
            </VisionGlass>
          ))}
        </View>
      </View>
    </VisionGlass>
  );
};

// Sample exercise data
export const sampleExerciseData: Exercise3DData = {
  id: 'pushup',
  name: 'Push-ups',
  difficulty: 'Intermediate',
  duration: '3 sets',
  reps: '10-15 reps',
  muscles: ['Chest', 'Triceps', 'Shoulders'],
  equipment: ['None'],
  views: [
    {
      angle: 'front',
      image: 'https://via.placeholder.com/300x400?text=Push-up+Front',
      description: 'Start position with arms extended, body straight',
      keyPoints: [
        'Keep body in straight line',
        'Arms shoulder-width apart',
        'Core engaged throughout'
      ]
    },
    {
      angle: 'side',
      image: 'https://via.placeholder.com/300x400?text=Push-up+Side',
      description: 'Side view showing proper body alignment',
      keyPoints: [
        'Straight line from head to heels',
        'No sagging hips',
        'Controlled movement'
      ]
    },
    {
      angle: 'back',
      image: 'https://via.placeholder.com/300x400?text=Push-up+Back',
      description: 'Back view showing hand and shoulder alignment',
      keyPoints: [
        'Shoulders over wrists',
        'Even weight distribution',
        'Elbows track over hands'
      ]
    },
    {
      angle: 'top',
      image: 'https://via.placeholder.com/300x400?text=Push-up+Top',
      description: 'Top view showing hand placement and body width',
      keyPoints: [
        'Hands slightly wider than shoulders',
        'Fingers spread for stability',
        'Body maintains width'
      ]
    }
  ]
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  exerciseName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  duration: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginRight: 8,
  },
  reps: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainDisplay: {
    width: width * 0.7,
    height: width * 0.9,
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  muscleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  muscleHighlight: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    opacity: 0.8,
  },
  muscleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  formGuides: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  guideLine: {
    position: 'absolute',
    backgroundColor: 'rgba(102,126,234,0.3)',
  },
  verticalGuide: {
    width: 1,
    height: '100%',
    left: '50%',
  },
  horizontalGuide: {
    height: 1,
    width: '100%',
    top: '50%',
  },
  angleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  angleButton: {
    margin: 4,
  },
  angleButtonContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  angleButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  angleButtonTextActive: {
    color: '#667eea',
  },
  viewInfo: {
    padding: 12,
    marginBottom: 16,
  },
  viewTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  viewDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 18,
  },
  keyPointsContainer: {
    marginBottom: 16,
  },
  keyPointsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  keyPoint: {
    marginBottom: 8,
  },
  keyPointContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  keyPointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  keyPointText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    flex: 1,
  },
  equipmentContainer: {
    marginTop: 8,
  },
  equipmentTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  equipmentText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
});