import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface FastingPlan {
  id: string;
  name: string;
  hours: number;
  description: string;
  color: string[];
}

interface FastingSession {
  id: string;
  planId: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  actualEndTime?: Date;
}

const FASTING_PLANS: FastingPlan[] = [
  {
    id: '12:12',
    name: '12:12',
    hours: 12,
    description: 'Beginner friendly - 12 hours fasting, 12 hours eating',
    color: ['#4ECDC4', '#44A08D'],
  },
  {
    id: '16:8',
    name: '16:8',
    hours: 16,
    description: 'Most popular - 16 hours fasting, 8 hours eating',
    color: ['#667eea', '#764ba2'],
  },
  {
    id: '18:6',
    name: '18:6',
    hours: 18,
    description: 'Intermediate - 18 hours fasting, 6 hours eating',
    color: ['#FF6B6B', '#FF8E53'],
  },
  {
    id: '20:4',
    name: '20:4',
    hours: 20,
    description: 'Advanced - 20 hours fasting, 4 hours eating',
    color: ['#F44336', '#D32F2F'],
  },
];

const FastingScreen = ({ navigation }: any) => {
  const [selectedPlan, setSelectedPlan] = useState<FastingPlan | null>(null);
  const [isCustomPlan, setIsCustomPlan] = useState(false);
  const [customHours, setCustomHours] = useState(24);
  const [isFasting, setIsFasting] = useState(false);
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [fastingHistory, setFastingHistory] = useState<FastingSession[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadFastingData();
    
    // Start pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isFasting && currentSession) {
      interval = setInterval(() => {
        const now = new Date();
        const end = new Date(currentSession.endTime);
        const remaining = Math.max(0, end.getTime() - now.getTime());
        
        setTimeRemaining(remaining);
        
        // Update progress animation
        const totalTime = end.getTime() - new Date(currentSession.startTime).getTime();
        const elapsed = totalTime - remaining;
        const progress = elapsed / totalTime;
        
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: 300,
          useNativeDriver: false,
        }).start();
        
        if (remaining === 0) {
          completeFasting();
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isFasting, currentSession]);

  const loadFastingData = async () => {
    try {
      const savedSession = await AsyncStorage.getItem('currentFastingSession');
      const history = await AsyncStorage.getItem('fastingHistory');
      
      if (savedSession) {
        const session = JSON.parse(savedSession);
        setCurrentSession(session);
        setIsFasting(true);
        
        // Find the plan
        const plan = FASTING_PLANS.find(p => p.id === session.planId);
        if (plan) setSelectedPlan(plan);
      }
      
      if (history) {
        setFastingHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading fasting data:', error);
    }
  };

  const startFasting = async () => {
    if (!selectedPlan && !isCustomPlan) {
      Alert.alert('Select Plan', 'Please select a fasting plan first');
      return;
    }

    const now = new Date();
    const hours = isCustomPlan ? customHours : selectedPlan!.hours;
    const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    const session: FastingSession = {
      id: Date.now().toString(),
      planId: isCustomPlan ? `custom-${customHours}` : selectedPlan!.id,
      startTime: now,
      endTime: endTime,
      completed: false,
    };

    setCurrentSession(session);
    setIsFasting(true);
    
    // Save to storage
    await AsyncStorage.setItem('currentFastingSession', JSON.stringify(session));
    
    // Start progress animation
    progressAnim.setValue(0);
  };

  const stopFasting = () => {
    Alert.alert(
      'End Fast Early?',
      'Are you sure you want to end your fast early?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Fast', 
          style: 'destructive',
          onPress: async () => {
            if (currentSession) {
              const updatedSession = {
                ...currentSession,
                actualEndTime: new Date(),
                completed: false,
              };
              
              // Add to history
              const newHistory = [...fastingHistory, updatedSession];
              setFastingHistory(newHistory);
              await AsyncStorage.setItem('fastingHistory', JSON.stringify(newHistory));
            }
            
            setIsFasting(false);
            setCurrentSession(null);
            setTimeRemaining(0);
            progressAnim.setValue(0);
            await AsyncStorage.removeItem('currentFastingSession');
          }
        }
      ]
    );
  };

  const completeFasting = async () => {
    Alert.alert(
      '🎉 Congratulations!',
      'You completed your fasting goal!',
      [{ text: 'OK' }]
    );

    if (currentSession) {
      const completedSession = {
        ...currentSession,
        completed: true,
        actualEndTime: new Date(),
      };
      
      // Add to history
      const newHistory = [...fastingHistory, completedSession];
      setFastingHistory(newHistory);
      await AsyncStorage.setItem('fastingHistory', JSON.stringify(newHistory));
    }

    setIsFasting(false);
    setCurrentSession(null);
    setTimeRemaining(0);
    progressAnim.setValue(1);
    await AsyncStorage.removeItem('currentFastingSession');
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!currentSession) return 0;
    
    const total = new Date(currentSession.endTime).getTime() - new Date(currentSession.startTime).getTime();
    const elapsed = total - timeRemaining;
    return (elapsed / total) * 100;
  };

  const getCompletedFasts = () => {
    return fastingHistory.filter(f => f.completed).length;
  };

  const getCurrentStreak = () => {
    let streak = 0;
    const sortedHistory = [...fastingHistory]
      .filter(f => f.completed)
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
    
    for (const fast of sortedHistory) {
      const endDate = new Date(fast.endTime);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fasting</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Fasting Status */}
        {isFasting && currentSession ? (
          <Animated.View style={[styles.fastingCard, { transform: [{ scale: pulseAnim }] }]}>
            <BlurView intensity={30} tint="light" style={styles.fastingCardContent}>
              <Text style={styles.fastingTitle}>Currently Fasting</Text>
              <Text style={styles.timeRemaining}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.fastingSubtitle}>Time Remaining</Text>
              
              {/* Progress Ring */}
              <View style={styles.progressContainer}>
                <View style={styles.progressRing}>
                  <Text style={styles.progressText}>{Math.round(getProgress())}%</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.stopButton} onPress={stopFasting}>
                <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.stopButtonGradient}>
                  <Icon name="stop" size={20} color="white" />
                  <Text style={styles.stopButtonText}>End Fast Early</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        ) : (
          <>
            {/* Fasting Plans */}
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            <View style={styles.plansGrid}>
              {FASTING_PLANS.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan?.id === plan.id && styles.selectedPlanCard,
                  ]}
                  onPress={() => {
                    setSelectedPlan(plan);
                    setIsCustomPlan(false);
                  }}
                >
                  <LinearGradient
                    colors={plan.color}
                    style={styles.planGradient}
                  >
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planHours}>{plan.hours}h</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
              
              {/* Custom Plan Button */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  isCustomPlan && styles.selectedPlanCard,
                ]}
                onPress={() => {
                  setShowCustomModal(true);
                  setIsCustomPlan(true);
                  setSelectedPlan(null);
                }}
              >
                <LinearGradient
                  colors={['#9E9E9E', '#616161']}
                  style={styles.planGradient}
                >
                  <Icon name="create-outline" size={24} color="white" />
                  <Text style={styles.planName}>Custom</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Selected Plan Description */}
            {(selectedPlan || isCustomPlan) && (
              <BlurView intensity={20} tint="light" style={styles.planDescription}>
                <Text style={styles.planDescriptionText}>
                  {isCustomPlan
                    ? `Custom fast for ${customHours} hours`
                    : selectedPlan!.description}
                </Text>
              </BlurView>
            )}

            {/* Start Fasting Button */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={startFasting}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.startButtonGradient}
              >
                <Icon name="play" size={24} color="white" />
                <Text style={styles.startButtonText}>Start Fasting</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <BlurView intensity={20} tint="light" style={styles.statCard}>
              <Icon name="checkmark-circle" size={28} color="#4CAF50" />
              <Text style={styles.statNumber}>{getCompletedFasts()}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </BlurView>
            
            <BlurView intensity={20} tint="light" style={styles.statCard}>
              <Icon name="flame" size={28} color="#FF6B6B" />
              <Text style={styles.statNumber}>{getCurrentStreak()}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </BlurView>
            
            <BlurView intensity={20} tint="light" style={styles.statCard}>
              <Icon name="time" size={28} color="#667eea" />
              <Text style={styles.statNumber}>{fastingHistory.length}</Text>
              <Text style={styles.statLabel}>Total Fasts</Text>
            </BlurView>
          </View>
        </View>

        {/* Recent History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Fasts</Text>
          {fastingHistory.slice(-5).reverse().map((session) => (
            <BlurView
              key={session.id}
              intensity={15}
              tint="light"
              style={styles.historyCard}
            >
              <View style={styles.historyInfo}>
                <Text style={styles.historyPlan}>{session.planId}</Text>
                <Text style={styles.historyDate}>
                  {new Date(session.startTime).toLocaleDateString()}
                </Text>
              </View>
              <Icon
                name={session.completed ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={session.completed ? '#4CAF50' : '#F44336'}
              />
            </BlurView>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Custom Hours Modal */}
      <Modal visible={showCustomModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.modal}>
            <Text style={styles.modalTitle}>Custom Fasting Duration</Text>
            <Text style={styles.modalSubtitle}>Choose hours (1-168)</Text>
            
            <View style={styles.hoursSelector}>
              <TouchableOpacity
                onPress={() => setCustomHours(Math.max(1, customHours - 1))}
                style={styles.hourButton}
              >
                <Icon name="remove" size={24} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.hoursText}>{customHours} hours</Text>
              
              <TouchableOpacity
                onPress={() => setCustomHours(Math.min(168, customHours + 1))}
                style={styles.hourButton}
              >
                <Icon name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowCustomModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowCustomModal(false)}
                style={styles.confirmButton}
              >
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fastingCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  fastingCardContent: {
    padding: 24,
    alignItems: 'center',
  },
  fastingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  timeRemaining: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  fastingSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  stopButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  stopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  planCard: {
    width: (width - 56) / 3,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  selectedPlanCard: {
    borderWidth: 3,
    borderColor: 'white',
  },
  planGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  planHours: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  planDescription: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  planDescriptionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  startButton: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsSection: {
    marginTop: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  historySection: {
    marginTop: 32,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  historyInfo: {
    flex: 1,
  },
  historyPlan: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  historyDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: width * 0.85,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  hoursSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  hourButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    minWidth: 100,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  confirmButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FastingScreen;