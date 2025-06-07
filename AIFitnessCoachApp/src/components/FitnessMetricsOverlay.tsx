import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface MetricItem {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
  showPulse?: boolean;
}

interface FitnessMetricsOverlayProps {
  heartRate?: number;
  calories?: number;
  elapsedTime?: string;
  activeMinutes?: number;
  distance?: number;
  pace?: string;
  position?: 'top' | 'bottom';
  style?: 'minimal' | 'full' | 'compact';
  theme?: 'dark' | 'light';
  showRings?: boolean;
  currentExercise?: string;
  setsCompleted?: number;
  totalSets?: number;
}

const FitnessMetricsOverlay: React.FC<FitnessMetricsOverlayProps> = ({
  heartRate = 0,
  calories = 0,
  elapsedTime = '0:00',
  activeMinutes = 0,
  distance = 0,
  pace = '--',
  position = 'top',
  style = 'full',
  theme = 'dark',
  showRings = true,
  currentExercise,
  setsCompleted = 0,
  totalSets = 0,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ringProgress = useRef(new Animated.Value(0)).current;

  // Metrics configuration
  const getMetrics = (): MetricItem[] => {
    const baseMetrics: MetricItem[] = [
      {
        label: 'Heart Rate',
        value: heartRate,
        unit: 'BPM',
        icon: 'heart',
        color: '#FF3B30',
        showPulse: true,
      },
      {
        label: 'Calories',
        value: Math.round(calories),
        unit: 'CAL',
        icon: 'flame',
        color: '#FF9500',
      },
      {
        label: 'Time',
        value: elapsedTime,
        icon: 'time',
        color: '#5AC8FA',
      },
    ];

    if (style === 'full') {
      return [
        ...baseMetrics,
        {
          label: 'Active',
          value: activeMinutes,
          unit: 'MIN',
          icon: 'fitness',
          color: '#4CD964',
        },
        {
          label: 'Distance',
          value: distance.toFixed(2),
          unit: 'KM',
          icon: 'navigate',
          color: '#007AFF',
        },
        {
          label: 'Pace',
          value: pace,
          unit: 'MIN/KM',
          icon: 'speedometer',
          color: '#5856D6',
        },
      ];
    }

    if (style === 'compact') {
      return baseMetrics.slice(0, 2);
    }

    return baseMetrics;
  };

  // Animations
  useEffect(() => {
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Heart rate pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Ring progress animation
    if (showRings) {
      Animated.timing(ringProgress, {
        toValue: (setsCompleted / totalSets) || 0,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }

    return () => pulse.stop();
  }, [heartRate, setsCompleted, totalSets]);

  const metrics = getMetrics();

  const renderMinimalStyle = () => (
    <Animated.View
      style={[
        styles.minimalContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
        position === 'bottom' && styles.bottomPosition,
      ]}
    >
      <BlurView
        intensity={theme === 'dark' ? 80 : 60}
        tint={theme}
        style={styles.minimalBlur}
      >
        <View style={styles.minimalContent}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.minimalMetric}>
              <Icon name={metric.icon} size={16} color={metric.color} />
              <Text style={[styles.minimalValue, theme === 'light' && styles.lightText]}>
                {metric.value}
              </Text>
              {metric.unit && (
                <Text style={[styles.minimalUnit, theme === 'light' && styles.lightText]}>
                  {metric.unit}
                </Text>
              )}
            </View>
          ))}
        </View>
      </BlurView>
    </Animated.View>
  );

  const renderCompactStyle = () => (
    <Animated.View
      style={[
        styles.compactContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
        position === 'bottom' && styles.bottomPosition,
      ]}
    >
      <BlurView
        intensity={theme === 'dark' ? 80 : 60}
        tint={theme}
        style={styles.compactBlur}
      >
        <LinearGradient
          colors={theme === 'dark' 
            ? ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']
            : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']
          }
          style={styles.compactGradient}
        >
          {currentExercise && (
            <Text style={[styles.exerciseName, theme === 'light' && styles.lightText]}>
              {currentExercise}
            </Text>
          )}
          <View style={styles.compactMetrics}>
            {metrics.map((metric, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.compactMetricItem,
                  metric.showPulse && {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Icon name={metric.icon} size={20} color={metric.color} />
                <Text style={[styles.compactValue, theme === 'light' && styles.lightText]}>
                  {metric.value}
                </Text>
                {metric.unit && (
                  <Text style={[styles.compactUnit, theme === 'light' && styles.lightText]}>
                    {metric.unit}
                  </Text>
                )}
              </Animated.View>
            ))}
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );

  const renderFullStyle = () => (
    <Animated.View
      style={[
        styles.fullContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
        position === 'bottom' && styles.bottomPosition,
      ]}
    >
      <BlurView
        intensity={theme === 'dark' ? 90 : 70}
        tint={theme}
        style={styles.fullBlur}
      >
        <LinearGradient
          colors={theme === 'dark'
            ? ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)']
            : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']
          }
          style={styles.fullGradient}
        >
          {/* Activity Rings */}
          {showRings && (
            <View style={styles.ringsContainer}>
              <View style={styles.ring}>
                <Animated.View
                  style={[
                    styles.ringProgress,
                    {
                      backgroundColor: '#FF3B30',
                      width: ringProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.ringStat, theme === 'light' && styles.lightText]}>
                {setsCompleted}/{totalSets} Sets
              </Text>
            </View>
          )}

          {/* Current Exercise */}
          {currentExercise && (
            <View style={styles.exerciseContainer}>
              <Text style={[styles.exerciseLabel, theme === 'light' && styles.lightText]}>
                NOW PLAYING
              </Text>
              <Text style={[styles.exerciseNameFull, theme === 'light' && styles.lightText]}>
                {currentExercise}
              </Text>
            </View>
          )}

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.metricCard,
                  metric.showPulse && {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
                  <Icon name={metric.icon} size={24} color={metric.color} />
                </View>
                <Text style={[styles.metricLabel, theme === 'light' && styles.lightText]}>
                  {metric.label}
                </Text>
                <View style={styles.metricValueContainer}>
                  <Text style={[styles.metricValue, theme === 'light' && styles.lightText]}>
                    {metric.value}
                  </Text>
                  {metric.unit && (
                    <Text style={[styles.metricUnit, theme === 'light' && styles.lightText]}>
                      {metric.unit}
                    </Text>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );

  // Render based on style prop
  if (style === 'minimal') return renderMinimalStyle();
  if (style === 'compact') return renderCompactStyle();
  return renderFullStyle();
};

const styles = StyleSheet.create({
  // Minimal Style
  minimalContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  minimalBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  minimalContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  minimalMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  minimalValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  minimalUnit: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },

  // Compact Style
  compactContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  compactBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  compactGradient: {
    padding: 16,
  },
  exerciseName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.9,
  },
  compactMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactMetricItem: {
    alignItems: 'center',
  },
  compactValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  compactUnit: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },

  // Full Style
  fullContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  fullBlur: {
    overflow: 'hidden',
  },
  fullGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  ringsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ring: {
    width: width - 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  ringProgress: {
    height: '100%',
    borderRadius: 2,
  },
  ringStat: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  exerciseContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  exerciseLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },
  exerciseNameFull: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricUnit: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginLeft: 2,
  },

  // Common
  bottomPosition: {
    top: undefined,
    bottom: Platform.OS === 'ios' ? 100 : 80,
  },
  lightText: {
    color: '#000',
  },
});

export default FitnessMetricsOverlay;