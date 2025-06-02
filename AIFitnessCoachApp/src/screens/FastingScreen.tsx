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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, G, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface FastingPlan {
  id: string;
  name: string;
  hours: number;
  description: string;
}

const FASTING_PLANS: FastingPlan[] = [
  { id: '16:8', name: '16:8', hours: 16, description: 'Fast for 16 hours, eat within 8 hours' },
  { id: '18:6', name: '18:6', hours: 18, description: 'Fast for 18 hours, eat within 6 hours' },
  { id: '20:4', name: '20:4', hours: 20, description: 'Fast for 20 hours, eat within 4 hours' },
  { id: '24', name: '24h', hours: 24, description: 'Fast for 24 hours' },
];

const FastingScreen = ({ navigation }: any) => {
  const [selectedPlan, setSelectedPlan] = useState<FastingPlan>(FASTING_PLANS[0]);
  const [isFasting, setIsFasting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadFastingState();
    
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
    
    if (isFasting && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);
        
        // Check if fast is complete
        if (elapsed >= selectedPlan.hours * 3600) {
          completeFast();
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isFasting, startTime, selectedPlan]);

  const loadFastingState = async () => {
    try {
      const state = await AsyncStorage.getItem('fastingState');
      if (state) {
        const { isFasting: savedFasting, startTime: savedStart, planId } = JSON.parse(state);
        if (savedFasting && savedStart) {
          setIsFasting(savedFasting);
          setStartTime(new Date(savedStart));
          const plan = FASTING_PLANS.find(p => p.id === planId) || FASTING_PLANS[0];
          setSelectedPlan(plan);
        }
      }
    } catch (error) {
      console.error('Error loading fasting state:', error);
    }
  };

  const saveFastingState = async () => {
    try {
      const state = {
        isFasting,
        startTime,
        planId: selectedPlan.id,
      };
      await AsyncStorage.setItem('fastingState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving fasting state:', error);
    }
  };

  const startFast = () => {
    const now = new Date();
    setStartTime(now);
    setIsFasting(true);
    setElapsedSeconds(0);
    saveFastingState();
    
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
          onPress: () => {
            setIsFasting(false);
            setStartTime(null);
            setElapsedSeconds(0);
            AsyncStorage.removeItem('fastingState');
          },
        },
      ]
    );
  };

  const completeFast = async () => {
    setIsFasting(false);
    setStartTime(null);
    setElapsedSeconds(0);
    await AsyncStorage.removeItem('fastingState');
    
    Alert.alert(
      '🎉 Congratulations!',
      `You've completed your ${selectedPlan.name} fast!`,
      [{ text: 'Awesome!', style: 'default' }]
    );
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
    if (!isFasting || !selectedPlan) return 0;
    return Math.min((elapsedSeconds / (selectedPlan.hours * 3600)) * 100, 100);
  };

  const getRemainingTime = () => {
    if (!isFasting || !selectedPlan) return 0;
    const totalSeconds = selectedPlan.hours * 3600;
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
          
          {isFasting && (
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
              disabled={isFasting}
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
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Intermittent Fasting</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Ring */}
        {renderProgressRing()}

        {/* Plan Picker */}
        {!isFasting && renderPlanPicker()}

        {/* Status Info */}
        {isFasting && (
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Icon name="restaurant" size={20} color="#4CAF50" />
                <Text style={styles.statusText}>Eating window starts at</Text>
                <Text style={styles.statusTime}>
                  {startTime && new Date(startTime.getTime() + selectedPlan.hours * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, isFasting && styles.stopButton]}
          onPress={isFasting ? stopFast : startFast}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isFasting ? ['#EF5350', '#E53935'] : ['#4CAF50', '#388E3C']}
            style={styles.actionButtonGradient}
          >
            <Icon name={isFasting ? "stop" : "play"} size={24} color="white" />
            <Text style={styles.actionButtonText}>
              {isFasting ? 'End Fast' : 'Start Fasting'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Streak Display */}
        {!isFasting && (
          <View style={styles.streakSection}>
            <Text style={styles.sectionTitle}>🔥 Your Progress</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>7</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>42</Text>
                <Text style={styles.statLabel}>Total Fasts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>168</Text>
                <Text style={styles.statLabel}>Hours Fasted</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Fasts */}
        {!isFasting && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>📊 Recent Fasts</Text>
            <View style={styles.historyList}>
              {[
                { date: 'Today', duration: '16:8', completed: true },
                { date: 'Yesterday', duration: '16:8', completed: true },
                { date: '2 days ago', duration: '18:6', completed: true },
                { date: '3 days ago', duration: '16:8', completed: false },
              ].map((fast, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>{fast.date}</Text>
                    <Text style={styles.historyDuration}>{fast.duration} Fast</Text>
                  </View>
                  <Icon 
                    name={fast.completed ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={fast.completed ? "#4CAF50" : "#EF5350"} 
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipsText}>
            • Stay hydrated during your fast{'\n'}
            • Black coffee and tea are allowed{'\n'}
            • Break your fast gently with light foods{'\n'}
            • Listen to your body and adjust as needed
          </Text>
        </View>
        
        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  timerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeElapsed: {
    fontSize: 42,
    fontWeight: '300',
    color: 'white',
    marginBottom: 4,
  },
  timeRemaining: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  timeDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
  },
  planPickerContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
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
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  planOptions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  planOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  planOptionSelected: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  planOptionName: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },
  planOptionDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  statusContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 16,
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  actionButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  stopButton: {
    marginTop: 20,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  tipsContainer: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  streakSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  historySection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },
  historyDuration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
});

export default FastingScreen;