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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedGlassCard, ThemedGlassContainer } from '../components/glass/ThemedGlassComponents';
import { theme } from '../config/theme';

const { width } = Dimensions.get('window');

interface FastingPlan {
  id: string;
  name: string;
  hours: number;
  description: string;
}

interface FastingSession {
  id?: string;
  fasting_type: string;
  planned_duration_hours: number;
  started_at?: string;
  ended_at?: string | null;
  actual_duration_hours?: number | null;
  notes?: string;
  completed_successfully?: boolean;
}

const FASTING_PLANS: FastingPlan[] = [
  { id: '12:12', name: '12:12', hours: 12, description: 'Fast for 12 hours, eat within 12 hours' },
  { id: '16:8', name: '16:8', hours: 16, description: 'Fast for 16 hours, eat within 8 hours' },
  { id: '18:6', name: '18:6', hours: 18, description: 'Fast for 18 hours, eat within 6 hours' },
  { id: '20:4', name: '20:4', hours: 20, description: 'Fast for 20 hours, eat within 4 hours' },
  { id: 'custom', name: 'Custom', hours: 24, description: 'Create your own fasting duration' },
];

const FixedEnhancedFastingScreen = ({ navigation }: any) => {
  const [selectedPlan, setSelectedPlan] = useState<FastingPlan>(FASTING_PLANS[1]);
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fastingHistory, setFastingHistory] = useState<FastingSession[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Load from AsyncStorage
    loadLocalFastingData();
    
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
    const interval = setInterval(() => {
      if (currentSession && !currentSession.ended_at) {
        setElapsedSeconds(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const loadLocalFastingData = async () => {
    try {
      // Load current session
      const sessionData = await AsyncStorage.getItem('@current_fasting_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        setCurrentSession(session);
        
        if (session.started_at) {
          const elapsed = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
          setElapsedSeconds(elapsed);
        }
      }
      
      // Load history
      const historyData = await AsyncStorage.getItem('@fasting_history');
      if (historyData) {
        const history = JSON.parse(historyData);
        setFastingHistory(history);
        calculateStreak(history);
      }
    } catch (error) {
      console.error('Error loading fasting data:', error);
    }
  };
  
  const calculateStreak = (history: FastingSession[]) => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < history.length; i++) {
      const sessionDate = new Date(history[i].started_at!);
      sessionDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === i && history[i].completed_successfully) {
        streak++;
      } else {
        break;
      }
    }
    
    setCurrentStreak(streak);
  };

  const startFast = async () => {
    try {
      setLoading(true);
      
      const session: FastingSession = {
        id: Date.now().toString(),
        fasting_type: selectedPlan.name,
        planned_duration_hours: selectedPlan.hours,
        started_at: new Date().toISOString(),
        ended_at: null,
        notes: `Started ${selectedPlan.name} fast`,
      };
      
      await AsyncStorage.setItem('@current_fasting_session', JSON.stringify(session));
      setCurrentSession(session);
      setElapsedSeconds(0);
      
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
      
    } catch (error) {
      Alert.alert('Error', 'Failed to start fasting session');
    } finally {
      setLoading(false);
    }
  };

  const stopFast = async () => {
    if (!currentSession) return;
    
    try {
      setLoading(true);
      
      const updatedSession = {
        ...currentSession,
        ended_at: new Date().toISOString(),
        actual_duration_hours: elapsedSeconds / 3600,
        completed_successfully: elapsedSeconds >= (currentSession.planned_duration_hours * 3600 * 0.95),
      };
      
      // Save to history
      const historyKey = '@fasting_history';
      const historyData = await AsyncStorage.getItem(historyKey);
      const history = historyData ? JSON.parse(historyData) : [];
      history.unshift(updatedSession);
      await AsyncStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50))); // Keep last 50
      
      // Clear current session
      await AsyncStorage.removeItem('@current_fasting_session');
      setCurrentSession(null);
      setElapsedSeconds(0);
      
      Alert.alert(
        'Fast Completed!',
        `You fasted for ${formatTime(elapsedSeconds)}. Great job!`
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to end fasting session');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!currentSession) return 0;
    const targetSeconds = currentSession.planned_duration_hours * 3600;
    return Math.min((elapsedSeconds / targetSeconds) * 100, 100);
  };

  const getRemainingTime = (): number => {
    if (!currentSession) return 0;
    const targetSeconds = currentSession.planned_duration_hours * 3600;
    return Math.max(targetSeconds - elapsedSeconds, 0);
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
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
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

  const renderPlanPicker = () => (
    <View style={styles.planPickerContainer}>
      <TouchableOpacity
        style={styles.planPickerHeader}
        onPress={() => setShowPlanPicker(!showPlanPicker)}
      >
        <View>
          <Text style={styles.currentPlanLabel}>Fasting Plan</Text>
          <Text style={styles.currentPlanName}>{selectedPlan.name}</Text>
        </View>
        <Icon 
          name={showPlanPicker ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>
      
      {showPlanPicker && (
        <View style={styles.planOptions}>
          {FASTING_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planOption,
                selectedPlan.id === plan.id && styles.planOptionSelected,
              ]}
              onPress={() => {
                setSelectedPlan(plan);
                setShowPlanPicker(false);
              }}
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
    <LinearGradient colors={theme.colors.primary.gradient as [string, string, string]} style={styles.container}>
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
              colors={currentSession && !currentSession.ended_at ? ['#FF6B6B', '#FF4757'] : ['#4CAF50', '#45B649']}
              style={styles.buttonGradient}
            >
              <Icon 
                name={currentSession && !currentSession.ended_at ? 'stop' : 'play'} 
                size={24} 
                color="#FFFFFF" 
              />
              <Text style={styles.controlButtonText}>
                {currentSession && !currentSession.ended_at ? 'End Fast' : 'Start Fasting'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Icon name="flame" size={24} color="#FF6B6B" />
                <Text style={styles.statValue}>{currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.statValue}>{fastingHistory.filter(s => s.completed_successfully).length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="trophy" size={24} color="#FFD700" />
                <Text style={styles.statValue}>
                  {fastingHistory.length > 0 
                    ? Math.max(...fastingHistory.map(s => s.actual_duration_hours || 0)).toFixed(0) 
                    : '0'}h
                </Text>
                <Text style={styles.statLabel}>Longest Fast</Text>
              </View>
            </View>
          </View>

          {/* History Section */}
          {fastingHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Recent Fasts</Text>
              {fastingHistory.slice(0, 5).map((session, index) => (
                <View key={session.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyType}>{session.fasting_type}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(session.started_at!).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={[
                      styles.historyDuration,
                      session.completed_successfully && styles.successText
                    ]}>
                      {session.actual_duration_hours?.toFixed(1) || '0'}h
                    </Text>
                    {session.completed_successfully && (
                      <Icon name="checkmark" size={16} color="#4CAF50" />
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Bottom spacing */}
          <View style={{ height: Platform.OS === 'ios' ? 90 : 80 }} />
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
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    marginHorizontal: 20,
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
    marginHorizontal: 40,
    marginTop: 20,
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  startButton: {
    elevation: 5,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  stopButton: {
    elevation: 5,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  statsSection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  historySection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  historyItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    flex: 1,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDuration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
    marginRight: 8,
  },
  successText: {
    color: '#4CAF50',
  },
});

export default FixedEnhancedFastingScreen;