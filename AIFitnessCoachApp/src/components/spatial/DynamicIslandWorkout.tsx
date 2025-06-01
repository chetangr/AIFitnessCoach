import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { VisionGlass } from './VisionGlass';
import { spatialHaptics } from '../../services/spatialHaptics';

const { width } = Dimensions.get('window');

interface WorkoutState {
  isActive: boolean;
  exercise: string;
  currentSet: number;
  totalSets: number;
  currentRep: number;
  totalReps: number;
  restTime: number; // seconds
  workoutTime: number; // seconds
  heartRate?: number;
  calories?: number;
}

interface DynamicIslandWorkoutProps {
  workoutState: WorkoutState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNextSet: () => void;
  onShowWorkout: () => void;
}

export const DynamicIslandWorkout: React.FC<DynamicIslandWorkoutProps> = ({
  workoutState,
  onPause,
  onResume,
  onStop,
  onNextSet,
  onShowWorkout,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDynamicIslandDevice, setIsDynamicIslandDevice] = useState(false);
  const [isInRestMode, setIsInRestMode] = useState(false);

  // Animation values
  const islandWidth = useSharedValue(120);
  const islandHeight = useSharedValue(37);
  const progressWidth = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Check if device supports Dynamic Island
    checkDynamicIslandSupport();
    
    // Update progress based on workout state
    updateProgress();
    
    // Handle rest mode
    if (workoutState.restTime > 0 && workoutState.isActive) {
      setIsInRestMode(true);
      startRestAnimation();
    } else {
      setIsInRestMode(false);
    }
  }, [workoutState]);

  const checkDynamicIslandSupport = () => {
    if (Platform.OS === 'ios') {
      // For demo purposes, assume all iOS devices support Dynamic Island
      // In production, you would check the actual device model
      setIsDynamicIslandDevice(true);
    }
  };

  const updateProgress = () => {
    if (workoutState.totalReps > 0) {
      const progress = workoutState.currentRep / workoutState.totalReps;
      progressWidth.value = withSpring(progress * 100);
    }
  };

  const startRestAnimation = () => {
    pulseScale.value = withRepeat(
      withSpring(1.05, { damping: 15 }),
      -1,
      true
    );
  };

  const handleExpand = () => {
    spatialHaptics.floatingElementTouch();
    setIsExpanded(!isExpanded);
    
    if (!isExpanded) {
      // Expand to full controls
      islandWidth.value = withSpring(width - 40);
      islandHeight.value = withSpring(120);
    } else {
      // Collapse to compact view
      islandWidth.value = withSpring(120);
      islandHeight.value = withSpring(37);
    }
  };

  const handleAction = (action: () => void) => {
    spatialHaptics.floatingElementTouch();
    action();
  };

  // Animated styles
  const islandStyle = useAnimatedStyle(() => ({
    width: islandWidth.value,
    height: islandHeight.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCompactView = () => (
    <TouchableOpacity onPress={handleExpand} style={styles.compactContainer}>
      <View style={styles.compactContent}>
        {/* Activity indicator */}
        <View style={[styles.activityDot, {
          backgroundColor: workoutState.isActive ? '#4CAF50' : '#FF9800'
        }]} />
        
        {/* Exercise name */}
        <Text style={styles.compactExercise} numberOfLines={1}>
          {workoutState.exercise}
        </Text>
        
        {/* Progress indicator */}
        <Text style={styles.compactProgress}>
          {workoutState.currentSet}/{workoutState.totalSets}
        </Text>
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>
    </TouchableOpacity>
  );

  const renderExpandedView = () => (
    <View style={styles.expandedContainer}>
      {/* Header */}
      <View style={styles.expandedHeader}>
        <TouchableOpacity onPress={handleExpand} style={styles.collapseButton}>
          <Icon name="chevron-down" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.expandedTitle}>Workout Active</Text>
        <TouchableOpacity onPress={() => handleAction(onShowWorkout)} style={styles.fullScreenButton}>
          <Icon name="expand-outline" size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>
      
      {/* Main content */}
      <View style={styles.expandedContent}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{workoutState.exercise}</Text>
          <Text style={styles.setInfo}>
            Set {workoutState.currentSet} of {workoutState.totalSets}
          </Text>
        </View>
        
        <View style={styles.repsInfo}>
          <Text style={styles.repsCount}>
            {workoutState.currentRep}/{workoutState.totalReps}
          </Text>
          <Text style={styles.repsLabel}>reps</Text>
        </View>
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.statText}>{formatTime(workoutState.workoutTime)}</Text>
        </View>
        
        {workoutState.heartRate && (
          <View style={styles.statItem}>
            <Icon name="heart-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>{workoutState.heartRate} BPM</Text>
          </View>
        )}
        
        {workoutState.calories && (
          <View style={styles.statItem}>
            <Icon name="flame-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>{workoutState.calories} cal</Text>
          </View>
        )}
      </View>
      
      {/* Rest timer */}
      {isInRestMode && (
        <View style={styles.restContainer}>
          <Icon name="pause-circle" size={20} color="#FF9800" />
          <Text style={styles.restText}>Rest: {formatTime(workoutState.restTime)}</Text>
        </View>
      )}
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={() => handleAction(workoutState.isActive ? onPause : onResume)}
          style={[styles.controlButton, styles.primaryButton]}
        >
          <LinearGradient
            colors={workoutState.isActive ? ['#FF9800', '#FFB74D'] : ['#4CAF50', '#81C784']}
            style={styles.controlButtonGradient}
          >
            <Icon
              name={workoutState.isActive ? 'pause' : 'play'}
              size={18}
              color="white"
            />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleAction(onNextSet)}
          style={[styles.controlButton, styles.secondaryButton]}
        >
          <Icon name="play-forward" size={16} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleAction(onStop)}
          style={[styles.controlButton, styles.dangerButton]}
        >
          <Icon name="stop" size={16} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Don't render if not iOS or not active
  if (Platform.OS !== 'ios' || !workoutState.isActive) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      isDynamicIslandDevice ? styles.dynamicIslandPosition : styles.fallbackPosition
    ]}>
      <Animated.View style={[styles.island, islandStyle]}>
        <VisionGlass
          variant="dark"
          depth={1}
          floating
          style={styles.islandContent}
        >
          {isExpanded ? renderExpandedView() : renderCompactView()}
        </VisionGlass>
      </Animated.View>
    </View>
  );
};

// Hook for managing workout state
export const useWorkoutState = () => {
  const [workoutState, setWorkoutState] = useState<WorkoutState>({
    isActive: false,
    exercise: '',
    currentSet: 0,
    totalSets: 0,
    currentRep: 0,
    totalReps: 0,
    restTime: 0,
    workoutTime: 0,
  });

  const startWorkout = (exercise: string, sets: number, reps: number) => {
    setWorkoutState({
      isActive: true,
      exercise,
      currentSet: 1,
      totalSets: sets,
      currentRep: 0,
      totalReps: reps,
      restTime: 0,
      workoutTime: 0,
    });
  };

  const pauseWorkout = () => {
    setWorkoutState(prev => ({ ...prev, isActive: false }));
  };

  const resumeWorkout = () => {
    setWorkoutState(prev => ({ ...prev, isActive: true }));
  };

  const stopWorkout = () => {
    setWorkoutState({
      isActive: false,
      exercise: '',
      currentSet: 0,
      totalSets: 0,
      currentRep: 0,
      totalReps: 0,
      restTime: 0,
      workoutTime: 0,
    });
  };

  const nextSet = () => {
    setWorkoutState(prev => ({
      ...prev,
      currentSet: Math.min(prev.currentSet + 1, prev.totalSets),
      currentRep: 0,
      restTime: 60, // 1 minute rest between sets
    }));
  };

  const updateRep = (rep: number) => {
    setWorkoutState(prev => ({ ...prev, currentRep: rep }));
  };

  const updateTime = (time: number) => {
    setWorkoutState(prev => ({ ...prev, workoutTime: time }));
  };

  const updateRestTime = (time: number) => {
    setWorkoutState(prev => ({ ...prev, restTime: time }));
  };

  const updateStats = (heartRate?: number, calories?: number) => {
    setWorkoutState(prev => ({ ...prev, heartRate, calories }));
  };

  return {
    workoutState,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    stopWorkout,
    nextSet,
    updateRep,
    updateTime,
    updateRestTime,
    updateStats,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  dynamicIslandPosition: {
    top: 15, // Near actual Dynamic Island position
    left: width / 2 - 60,
  },
  fallbackPosition: {
    top: 60, // Below status bar for older devices
    left: width / 2 - 60,
  },
  island: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  islandContent: {
    width: '100%',
    height: '100%',
  },
  compactContainer: {
    padding: 8,
    height: '100%',
    justifyContent: 'center',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  compactExercise: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  compactProgress: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '500',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#4CAF50',
  },
  expandedContainer: {
    padding: 12,
    height: '100%',
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collapseButton: {
    padding: 4,
  },
  expandedTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fullScreenButton: {
    padding: 4,
  },
  expandedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  setInfo: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  repsInfo: {
    alignItems: 'center',
  },
  repsCount: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  repsLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginLeft: 4,
  },
  restContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,152,0,0.2)',
    borderRadius: 8,
  },
  restText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    overflow: 'hidden',
  },
  controlButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dangerButton: {
    backgroundColor: 'rgba(244,67,54,0.2)',
  },
});