import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface SpatialWorkoutCardProps {
  workout: {
    id: string;
    name: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    category: string;
    exercises: number;
    equipment: string[];
  };
  index: number;
  onPress: () => void;
  scrollY?: Animated.SharedValue<number>;
}

export const SpatialWorkoutCard: React.FC<SpatialWorkoutCardProps> = ({
  workout,
  index,
  onPress,
  scrollY,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotateY = useSharedValue(0);

  // visionOS-inspired depth layering
  const baseDepth = index * 10;
  const depthIntensity = 20 + index * 5; // Blur intensity based on depth

  // Parallax effect based on scroll
  const parallaxStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    
    const parallaxOffset = interpolate(
      scrollY.value,
      [-height, 0, height],
      [height * 0.5, 0, -height * 0.5]
    );
    
    const depthScale = interpolate(
      scrollY.value,
      [-height, 0, height],
      [0.8, 1, 0.8]
    );
    
    return {
      transform: [
        { translateY: parallaxOffset * (index * 0.1) },
        { scale: depthScale },
      ],
    };
  });

  // Spatial interaction handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(1.05);
      rotateY.value = withSpring(5);
    },
    onActive: (event) => {
      translateX.value = event.translationX * 0.5;
      translateY.value = event.translationY * 0.5;
    },
    onEnd: () => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      rotateY.value = withSpring(0);
    },
  });

  // visionOS-inspired floating animation
  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { perspective: 1000 },
      { rotateY: `${rotateY.value}deg` },
    ],
    zIndex: baseDepth,
  }));

  const getDifficultyColor = () => {
    switch (workout.difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#667eea';
    }
  };

  const getCategoryIcon = () => {
    const icons: Record<string, string> = {
      'Strength': 'barbell-outline',
      'Cardio': 'heart-outline',
      'HIIT': 'flash-outline',
      'Yoga': 'leaf-outline',
      'Flexibility': 'body-outline',
    };
    return icons[workout.category] || 'fitness-outline';
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, floatingStyle, parallaxStyle]}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
          {/* visionOS-inspired glass material with depth */}
          <BlurView intensity={depthIntensity} tint="light" style={styles.cardBlur}>
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.25)',
                'rgba(255,255,255,0.05)',
                'rgba(255,255,255,0.15)',
              ]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Depth shadow */}
            <View style={[styles.depthShadow, { opacity: 0.1 + (index * 0.05) }]} />
            
            <View style={styles.cardContent}>
              {/* Header with floating elements */}
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <BlurView intensity={40} tint="dark" style={styles.badgeBlur}>
                    <Icon 
                      name={getCategoryIcon()} 
                      size={16} 
                      color="white" 
                      style={styles.categoryIcon}
                    />
                    <Text style={styles.categoryText}>{workout.category}</Text>
                  </BlurView>
                </View>
                
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
                  <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                </View>
              </View>

              {/* Main content with spatial hierarchy */}
              <View style={styles.mainContent}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutMeta}>
                  {workout.duration} • {workout.exercises} exercises
                </Text>
              </View>

              {/* Equipment tags floating at bottom */}
              <View style={styles.equipmentContainer}>
                {workout.equipment.slice(0, 3).map((equipment, equipIndex) => (
                  <View key={equipIndex} style={styles.equipmentTag}>
                    <BlurView intensity={15} tint="light" style={styles.equipmentBlur}>
                      <Text style={styles.equipmentText}>{equipment}</Text>
                    </BlurView>
                  </View>
                ))}
                {workout.equipment.length > 3 && (
                  <Text style={styles.moreEquipment}>
                    +{workout.equipment.length - 3} more
                  </Text>
                )}
              </View>

              {/* visionOS-inspired interaction hint */}
              <View style={styles.interactionHint}>
                <Icon name="hand-left-outline" size={12} color="rgba(255,255,255,0.4)" />
                <Text style={styles.hintText}>Tap or drag to interact</Text>
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardBlur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  depthShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    zIndex: -1,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  mainContent: {
    marginVertical: 8,
  },
  workoutName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    alignItems: 'center',
  },
  equipmentTag: {
    marginRight: 6,
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  equipmentBlur: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  equipmentText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  moreEquipment: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontStyle: 'italic',
  },
  interactionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    opacity: 0.6,
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginLeft: 4,
  },
});