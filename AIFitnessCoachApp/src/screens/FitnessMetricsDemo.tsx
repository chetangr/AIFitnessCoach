import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import FitnessMetricsOverlay from '../components/FitnessMetricsOverlay';

const FitnessMetricsDemo = ({ navigation }: any) => {
  const [heartRate, setHeartRate] = useState(120);
  const [calories, setCalories] = useState(156);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(12);
  const [distance, setDistance] = useState(2.5);
  const [pace, setPace] = useState('5:45');
  const [currentExercise, setCurrentExercise] = useState('Push-ups');
  const [setsCompleted, setSetsCompleted] = useState(2);
  const [totalSets] = useState(4);
  
  // Configuration state
  const [style, setStyle] = useState<'minimal' | 'full' | 'compact'>('full');
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showRings, setShowRings] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // Simulate workout data
  useEffect(() => {
    if (isRunning) {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        setHeartRate(Math.floor(120 + Math.random() * 40));
        setCalories(prev => prev + 0.15);
        setDistance(prev => prev + 0.001);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exercises = ['Push-ups', 'Squats', 'Burpees', 'Lunges', 'Plank', 'Mountain Climbers'];

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Demo Overlay */}
        <FitnessMetricsOverlay
          heartRate={heartRate}
          calories={calories}
          elapsedTime={formatTime(elapsedTime)}
          activeMinutes={activeMinutes}
          distance={distance}
          pace={pace}
          position={position}
          style={style}
          theme={theme}
          showRings={showRings}
          currentExercise={currentExercise}
          setsCompleted={setsCompleted}
          totalSets={totalSets}
        />

        {/* Controls */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Fitness Metrics Overlay Demo</Text>
          
          {/* Playback Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Control</Text>
            <TouchableOpacity
              style={[styles.playButton, isRunning && styles.stopButton]}
              onPress={() => setIsRunning(!isRunning)}
            >
              <Icon name={isRunning ? 'pause' : 'play'} size={24} color="white" />
              <Text style={styles.playButtonText}>
                {isRunning ? 'Pause Workout' : 'Start Workout'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Style Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overlay Style</Text>
            <View style={styles.buttonGroup}>
              {(['minimal', 'compact', 'full'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.button, style === s && styles.activeButton]}
                  onPress={() => setStyle(s)}
                >
                  <Text style={[styles.buttonText, style === s && styles.activeButtonText]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Position Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Position</Text>
            <View style={styles.buttonGroup}>
              {(['top', 'bottom'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.button, position === p && styles.activeButton]}
                  onPress={() => setPosition(p)}
                >
                  <Text style={[styles.buttonText, position === p && styles.activeButtonText]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theme</Text>
            <View style={styles.buttonGroup}>
              {(['dark', 'light'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.button, theme === t && styles.activeButton]}
                  onPress={() => setTheme(t)}
                >
                  <Text style={[styles.buttonText, theme === t && styles.activeButtonText]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Exercise Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Exercise</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.exerciseGroup}>
                {exercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise}
                    style={[styles.exerciseButton, currentExercise === exercise && styles.activeExerciseButton]}
                    onPress={() => setCurrentExercise(exercise)}
                  >
                    <Text style={[styles.exerciseButtonText, currentExercise === exercise && styles.activeButtonText]}>
                      {exercise}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Toggle Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Show Activity Rings</Text>
              <Switch
                value={showRings}
                onValueChange={setShowRings}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={showRings ? '#667eea' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Manual Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manual Controls</Text>
            <View style={styles.manualControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setSetsCompleted(Math.max(0, setsCompleted - 1))}
              >
                <Icon name="remove" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.controlText}>Sets: {setsCompleted}/{totalSets}</Text>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setSetsCompleted(Math.min(totalSets, setsCompleted + 1))}
              >
                <Icon name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="white" />
            <Text style={styles.backButtonText}>Back to App</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 180, // Space for overlay
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#667eea',
  },
  buttonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  activeButtonText: {
    color: 'white',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
  },
  stopButton: {
    backgroundColor: '#FF9800',
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  exerciseButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeExerciseButton: {
    backgroundColor: '#667eea',
  },
  exerciseButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleLabel: {
    color: 'white',
    fontSize: 16,
  },
  manualControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FitnessMetricsDemo;