import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, G } from 'react-native-svg';
import measurementsService, { FastingSession, FastingStats } from '../services/measurementsService';

const { width, height } = Dimensions.get('window');

interface FastingPlan {
  id: string;
  name: string;
  hours: number;
  description: string;
}

const FASTING_PLANS: FastingPlan[] = [
  { id: '12:12', name: '12:12', hours: 12, description: 'Fast for 12 hours, eat within 12 hours' },
  { id: '16:8', name: '16:8', hours: 16, description: 'Fast for 16 hours, eat within 8 hours' },
  { id: '18:6', name: '18:6', hours: 18, description: 'Fast for 18 hours, eat within 6 hours' },
  { id: '20:4', name: '20:4', hours: 20, description: 'Fast for 20 hours, eat within 4 hours' },
  { id: 'custom', name: 'Custom', hours: 24, description: 'Create your own fasting duration' },
];

const EnhancedFastingScreen = ({ navigation }: any) => {
  const [selectedPlan, setSelectedPlan] = useState<FastingPlan>(FASTING_PLANS[1]);
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null);
  const [fastingHistory, setFastingHistory] = useState<FastingSession[]>([]);
  const [fastingStats, setFastingStats] = useState<FastingStats | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadFastingData();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentSession && !currentSession.ended_at) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(currentSession.started_at!).getTime()) / 1000);
        setElapsedSeconds(elapsed);
        
        // Check if fast is complete
        if (elapsed >= currentSession.planned_duration_hours * 3600) {
          completeFast();
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [currentSession]);

  const loadFastingData = async () => {
    try {
      setLoading(true);
      
      // Load current fasting session
      const current = await measurementsService.getCurrentFasting();
      setCurrentSession(current);
      
      if (current && !current.ended_at) {
        // Calculate elapsed time
        const elapsed = Math.floor((Date.now() - new Date(current.started_at!).getTime()) / 1000);
        setElapsedSeconds(elapsed);
        
        // Set the selected plan based on current session
        const plan = FASTING_PLANS.find(p => p.name === current.fasting_type) || FASTING_PLANS[1];
        setSelectedPlan(plan);
      }
      
      // Load fasting history
      const history = await measurementsService.getFastingHistory(10);
      setFastingHistory(history);
      
      // Load fasting stats
      const stats = await measurementsService.getFastingStats();
      setFastingStats(stats);
      
    } catch (error) {
      console.error('Error loading fasting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startFast = async () => {
    try {
      setLoading(true);
      
      const session = await measurementsService.startFasting({
        fasting_type: selectedPlan.name,
        planned_duration_hours: selectedPlan.hours,
        notes: `Started ${selectedPlan.name} fast`,
      });
      
      setCurrentSession(session);
      setElapsedSeconds(0);
      
      // Refresh stats
      const stats = await measurementsService.getFastingStats();
      setFastingStats(stats);
      
      // Animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start fasting session');
    } finally {
      setLoading(false);
    }
  };

  const stopFast = () => {
    Alert.alert(
      'End Fast?',
      'Are you sure you want to end your fast early?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Fast',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const completedSession = await measurementsService.stopFasting();
              
              // Update UI
              setCurrentSession(null);
              setElapsedSeconds(0);
              
              // Reload data
              await loadFastingData();
              
              // Show completion message
              if (completedSession.completed_successfully) {
                Alert.alert(
                  '✅ Fast Completed',
                  `You fasted for ${completedSession.actual_duration_hours?.toFixed(1)} hours!`
                );
              } else {
                Alert.alert(
                  'Fast Ended Early',
                  `You fasted for ${completedSession.actual_duration_hours?.toFixed(1)} hours.`
                );
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to stop fasting session');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const completeFast = async () => {
    try {
      const completedSession = await measurementsService.stopFasting();
      
      setCurrentSession(null);
      setElapsedSeconds(0);
      
      // Reload data
      await loadFastingData();
      
      Alert.alert(
        '🎉 Congratulations!',
        `You've completed your ${selectedPlan.name} fast!`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    } catch (error) {
      console.error('Error completing fast:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getProgress = () => {
    if (!currentSession || currentSession.ended_at) return 0;
    return Math.min((elapsedSeconds / (currentSession.planned_duration_hours * 3600)) * 100, 100);
  };

  const getRemainingTime = () => {
    if (!currentSession || currentSession.ended_at) return 0;
    const totalSeconds = currentSession.planned_duration_hours * 3600;
    return Math.max(totalSeconds - elapsedSeconds, 0);
  };

  const renderProgressRing = () => {
    const size = width * 0.65;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = getProgress();
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={styles.progressContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#4CAF50"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        
        <View style={styles.timerContainer}>
          <Text style={styles.timeElapsed}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.timeLabel}>Elapsed</Text>
          
          {currentSession && !currentSession.ended_at && (
            <>
              <View style={styles.timeDivider} />
              <Text style={styles.timeRemaining}>{formatTime(getRemainingTime())}</Text>
              <Text style={styles.timeLabel}>Remaining</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderStats = () => {
    if (!fastingStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Fasting Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.statValue}>{fastingStats.current_streak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="trophy" size={24} color="#FFD93D" />
            <Text style={styles.statValue}>{fastingStats.longest_streak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{fastingStats.completed_sessions}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="time" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{fastingStats.average_duration_hours.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
        </View>
        
        {fastingStats.favorite_fasting_type && (
          <Text style={styles.favoriteType}>
            Favorite: {fastingStats.favorite_fasting_type}
          </Text>
        )}
      </View>
    );
  };

  const renderHistory = () => {
    if (fastingHistory.length === 0) return null;

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Recent Fasts</Text>
        
        {fastingHistory.slice(0, 5).map((session, index) => (
          <View key={session.id} style={styles.historyItem}>
            <View style={styles.historyInfo}>
              <Text style={styles.historyType}>{session.fasting_type}</Text>
              <Text style={styles.historyDate}>
                {new Date(session.started_at!).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.historyStats}>
              <Text style={styles.historyDuration}>
                {session.actual_duration_hours?.toFixed(1) || '0'}h
              </Text>
              {session.completed_successfully && (
                <Icon name="checkmark-circle" size={20} color="#4CAF50" />
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPlanPicker = () => (
    <View style={styles.planPickerContainer}>
      <TouchableOpacity 
        style={styles.planPickerHeader}
        onPress={() => setShowPlanPicker(!showPlanPicker)}
        disabled={!!currentSession && !currentSession.ended_at}
      >
        <View>
          <Text style={styles.currentPlanLabel}>Fasting Plan</Text>
          <Text style={styles.currentPlanName}>{selectedPlan.name}</Text>
        </View>
        <Icon 
          name={showPlanPicker ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="rgba(255,255,255,0.6)" 
        />
      </TouchableOpacity>
      
      {showPlanPicker && (
        <View style={styles.planOptions}>
          {FASTING_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planOption,
                selectedPlan.id === plan.id && styles.planOptionSelected
              ]}
              onPress={() => {
                setSelectedPlan(plan);
                setShowPlanPicker(false);
              }}
              disabled={!!currentSession && !currentSession.ended_at}
            >
              <View>
                <Text style={styles.planOptionName}>{plan.name}</Text>
                <Text style={styles.planOptionDesc}>{plan.description}</Text>
              </View>
              {selectedPlan.id === plan.id && (
                <Icon name="checkmark" size={20} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient colors={['#1a1a2e', '#0f0f1e']} style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.title}>Intermittent Fasting</Text>
            
            <View style={{ width: 40 }} />
          </View>

          {/* Plan Picker */}
          {(!currentSession || currentSession.ended_at) && renderPlanPicker()}

          {/* Progress Ring */}
          {renderProgressRing()}

          {/* Control Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              currentSession && !currentSession.ended_at ? styles.stopButton : styles.startButton,
            ]}
            onPress={currentSession && !currentSession.ended_at ? stopFast : startFast}
            disabled={loading}
          >
            <LinearGradient
              colors={currentSession && !currentSession.ended_at ? ['#FF6B6B', '#FF4757'] : ['#4CAF50', '#45B7A8']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Loading...' : (currentSession && !currentSession.ended_at ? 'End Fast' : 'Start Fast')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Stats */}
          {renderStats()}

          {/* History */}
          {renderHistory()}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planPickerContainer: {
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    overflow: 'hidden',
  },
  planPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  currentPlanLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planOptions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  planOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  planOptionSelected: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  planOptionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planOptionDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  timerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeElapsed: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timeRemaining: {
    fontSize: 28,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  timeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  timeDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 10,
  },
  controlButton: {
    marginTop: 20,
    marginBottom: 40,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  stopButton: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  favoriteType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 10,
  },
  historyContainer: {
    marginBottom: 30,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  historyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});

export default EnhancedFastingScreen;