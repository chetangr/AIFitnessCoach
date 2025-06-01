import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Animated,
  Dimensions,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { completeExercisesDatabase, getExerciseById } from '../data/exercisesDatabase';

const { width, height } = Dimensions.get('window');

const EnhancedActiveWorkoutScreen = ({ route, navigation }: any) => {
  const { workout } = route.params || {};
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(60);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [volumeEnabled, setVolumeEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [showAICoach, setShowAICoach] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [calories, setCalories] = useState(0);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Use real exercises from database
  const exercises = [
    getExerciseById('chest_001'), // Push-ups
    getExerciseById('back_001'),  // Pull-ups
    getExerciseById('chest_002'), // Bench Press
    getExerciseById('back_002'),  // Bent-over Rows
    getExerciseById('shoulders_001'), // Overhead Press
    getExerciseById('core_001'),  // Plank
  ].filter(Boolean);

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

  // Heart rate simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(Math.floor(Math.random() * (180 - 120) + 120));
      setCalories(prev => prev + 0.1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Workout timer
  useEffect(() => {
    if (!isPaused && !isResting) {
      const timer = setInterval(() => {
        setWorkoutTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, isResting]);

  // Rest timer
  useEffect(() => {
    if (isResting && restTimer > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setRestTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isResting && restTimer === 0) {
      setIsResting(false);
      setRestTimer(currentExercise?.rest || 60);
    }
  }, [isResting, restTimer, isPaused]);

  // Pulse animation for heart rate
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteExercise = () => {
    // Micro animation for completion
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setIsResting(true);
      setRestTimer(currentExercise?.rest || 60);
    } else {
      handleFinishWorkout();
    }
  };

  const handleFinishWorkout = () => {
    // Send auto message to AI Coach
    console.log('Workout completed! Sending encouraging message to AI Coach...');
    navigation.navigate('MainTabs', { 
      screen: 'Messages',
      params: { 
        autoMessage: `Great job! You just completed ${workout?.name || 'your workout'} in ${formatTime(workoutTimer)}. You burned approximately ${Math.round(calories)} calories! 🔥💪` 
      }
    });
  };

  const handleExitWorkout = () => {
    setShowExitConfirmation(true);
  };

  const confirmExit = () => {
    console.log('User exited workout early. Sending message to AI Coach...');
    setShowExitConfirmation(false);
    navigation.navigate('MainTabs', {
      screen: 'Messages',
      params: {
        autoMessage: `I had to stop my workout early today. Can you help me get back on track? 😅`
      }
    });
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    
    // Micro animation for pause button
    Animated.spring(slideAnim, {
      toValue: isPaused ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  if (!currentExercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      
      {/* Full-screen background video placeholder */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80' }}
        style={styles.backgroundVideo}
        blurRadius={2}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />
      </ImageBackground>

      {/* Transparent Header */}
      <BlurView intensity={80} tint="dark" style={styles.transparentHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleExitWorkout} style={styles.closeButton}>
            <Icon name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.workoutTitle}>{workout?.name || currentExercise.name}</Text>
            <Text style={styles.workoutTime}>{formatTime(workoutTimer)}</Text>
          </View>

          <View style={styles.headerRight}>
            <Animated.View style={[styles.heartRateContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Icon name="heart" size={20} color="#ff6b6b" />
              <Text style={styles.heartRateText}>{heartRate}</Text>
            </Animated.View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { width: `${progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </Text>
        </View>
      </BlurView>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isResting ? (
          <Animated.View style={[styles.exerciseContainer, { opacity: fadeAnim }]}>
            {/* Exercise Info Card */}
            <BlurView intensity={40} tint="dark" style={styles.exerciseCard}>
              <Text style={styles.exerciseLabel}>Current Exercise</Text>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>
              
              <View style={styles.exerciseStats}>
                <View style={styles.statItem}>
                  <Icon name="fitness" size={24} color="#4CAF50" />
                  <Text style={styles.statValue}>3</Text>
                  <Text style={styles.statLabel}>Sets</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Icon name="refresh" size={24} color="#2196F3" />
                  <Text style={styles.statValue}>{currentExercise.difficulty === 'Beginner' ? '8-12' : '6-10'}</Text>
                  <Text style={styles.statLabel}>Reps</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Icon name="time" size={24} color="#FF9800" />
                  <Text style={styles.statValue}>{currentExercise.rest || 60}s</Text>
                  <Text style={styles.statLabel}>Rest</Text>
                </View>
              </View>
            </BlurView>

            {/* Metrics Display */}
            <View style={styles.metricsRow}>
              <BlurView intensity={30} tint="dark" style={styles.metricCard}>
                <Icon name="flame" size={24} color="#ff6b6b" />
                <Text style={styles.metricValue}>{Math.round(calories)}</Text>
                <Text style={styles.metricLabel}>Calories</Text>
              </BlurView>
              
              <BlurView intensity={30} tint="dark" style={styles.metricCard}>
                <Icon name="trending-up" size={24} color="#4CAF50" />
                <Text style={styles.metricValue}>{Math.round(progress)}%</Text>
                <Text style={styles.metricLabel}>Complete</Text>
              </BlurView>
            </View>

            {/* Exercise Instructions */}
            <BlurView intensity={30} tint="dark" style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Instructions</Text>
              {currentExercise.instructions?.map((instruction, index) => (
                <Text key={index} style={styles.instructionText}>
                  {index + 1}. {instruction}
                </Text>
              ))}
            </BlurView>
          </Animated.View>
        ) : (
          /* Rest Screen */
          <View style={styles.restContainer}>
            <BlurView intensity={40} tint="dark" style={styles.restCard}>
              <Icon name="time" size={80} color="#4CAF50" />
              <Text style={styles.restTitle}>Rest Time</Text>
              <Text style={styles.restTimer}>{restTimer}s</Text>
              
              <Text style={styles.nextExerciseLabel}>Next Exercise:</Text>
              <Text style={styles.nextExerciseName}>
                {currentExerciseIndex < exercises.length - 1 
                  ? exercises[currentExerciseIndex + 1]?.name 
                  : 'Workout Complete!'}
              </Text>

              <TouchableOpacity 
                style={styles.skipRestButton}
                onPress={() => {
                  setIsResting(false);
                  setRestTimer(currentExercise?.rest || 60);
                }}
              >
                <Text style={styles.skipRestText}>Skip Rest</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        )}
      </ScrollView>

      {/* Enhanced Bottom Controls */}
      <BlurView intensity={80} tint="dark" style={styles.bottomControls}>
        <View style={styles.controlsContent}>
          <TouchableOpacity 
            style={styles.smallControlButton}
            onPress={() => setVolumeEnabled(!volumeEnabled)}
          >
            <Icon 
              name={volumeEnabled ? "volume-high" : "volume-mute"} 
              size={18} 
              color={volumeEnabled ? "white" : "rgba(255,255,255,0.5)"} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.smallControlButton}
            onPress={() => setMusicEnabled(!musicEnabled)}
          >
            <Icon 
              name={musicEnabled ? "musical-notes" : "musical-notes-outline"} 
              size={18} 
              color={musicEnabled ? "white" : "rgba(255,255,255,0.5)"} 
            />
          </TouchableOpacity>

          {/* Complete Exercise Button */}
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={handleCompleteExercise}
          >
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.completeGradient}>
              <Icon name="checkmark" size={18} color="white" />
              <Text style={styles.completeText}>Complete</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.pauseButton}
            onPress={handlePauseToggle}
          >
            <Icon name={isPaused ? "play" : "pause"} size={24} color="white" />
          </TouchableOpacity>

          {/* AI Coach Button */}
          <TouchableOpacity 
            style={styles.aiCoachButton}
            onPress={() => setShowAICoach(true)}
          >
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.aiCoachGradient}>
              <Icon name="chatbubble-ellipses" size={16} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* AI Coach Modal */}
      <Modal
        visible={showAICoach}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAICoach(false)}
      >
        <BlurView intensity={90} tint="dark" style={styles.modalContainer}>
          <View style={styles.aiCoachModal}>
            <View style={styles.aiCoachHeader}>
              <Text style={styles.aiCoachTitle}>AI Coach</Text>
              <TouchableOpacity onPress={() => setShowAICoach(false)}>
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.aiCoachMessage}>
              "Great work! Keep your form steady and focus on controlled movements. You're doing amazing! 💪"
            </Text>
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => {
                setShowAICoach(false);
                navigation.navigate('MainTabs', { screen: 'Messages' });
              }}
            >
              <Text style={styles.chatButtonText}>Open Full Chat</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExitConfirmation(false)}
      >
        <BlurView intensity={90} tint="dark" style={styles.modalContainer}>
          <View style={styles.exitModal}>
            <Icon name="warning" size={48} color="#FF9800" />
            <Text style={styles.exitTitle}>Exit Workout?</Text>
            <Text style={styles.exitMessage}>
              Are you sure you want to stop your workout? Your progress will be saved.
            </Text>
            <View style={styles.exitButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowExitConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={confirmExit}
              >
                <Text style={styles.confirmButtonText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
  },
  transparentHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  workoutTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    width: 44,
    alignItems: 'center',
  },
  heartRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heartRateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  scrollContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 140 : 120,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  exerciseContainer: {
    flex: 1,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  exerciseLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 8,
  },
  exerciseName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  metricValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  restContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 50,
  },
  restCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    overflow: 'hidden',
  },
  restTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
  },
  restTimer: {
    color: '#4CAF50',
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  nextExerciseLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 8,
  },
  nextExerciseName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  skipRestButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  skipRestText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  controlsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  completeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  completeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  pauseButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiCoachButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  aiCoachGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  aiCoachModal: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 300,
  },
  aiCoachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiCoachTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiCoachMessage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  chatButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exitModal: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  exitTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  exitMessage: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exitButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#ff4757',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
  },
});

export default EnhancedActiveWorkoutScreen;