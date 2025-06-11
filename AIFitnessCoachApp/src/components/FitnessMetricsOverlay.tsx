import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';

interface FitnessMetricsOverlayProps {
  heartRate: number;
  calories: number;
  elapsedTime: string;
  activeMinutes: number;
  currentExercise?: string;
  setsCompleted?: number;
  totalSets?: number;
  style?: 'minimal' | 'full' | 'compact';
  theme?: 'light' | 'dark';
  showRings?: boolean;
  position?: 'top' | 'bottom';
  customStyle?: ViewStyle;
}

const FitnessMetricsOverlay: React.FC<FitnessMetricsOverlayProps> = ({
  heartRate,
  calories,
  elapsedTime,
  activeMinutes,
  currentExercise = '',
  setsCompleted = 0,
  totalSets = 0,
  style = 'full',
  theme = 'dark',
  showRings = false,
  position = 'top',
  customStyle,
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? 'white' : 'black';
  const secondaryTextColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

  // Format numbers properly
  const formatNumber = (num: number, decimals: number = 0): string => {
    if (isNaN(num) || !isFinite(num)) return '0';
    return num.toFixed(decimals);
  };

  const formatMinutes = (minutes: number): string => {
    if (isNaN(minutes) || !isFinite(minutes)) return '0:00';
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (style === 'minimal') {
    return (
      <BlurView
        intensity={isDark ? 80 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.minimalContainer,
          position === 'bottom' && styles.bottomPosition,
          customStyle,
        ]}
      >
        <View style={styles.minimalContent}>
          <View style={styles.minimalMetric}>
            <Icon name="heart" size={16} color="#FF6B6B" />
            <Text style={[styles.minimalValue, { color: textColor }]}>
              {formatNumber(heartRate)}
            </Text>
          </View>
          <View style={styles.minimalDivider} />
          <View style={styles.minimalMetric}>
            <Icon name="flame" size={16} color="#FF9800" />
            <Text style={[styles.minimalValue, { color: textColor }]}>
              {formatNumber(calories)}
            </Text>
          </View>
          <View style={styles.minimalDivider} />
          <View style={styles.minimalMetric}>
            <Icon name="time" size={16} color="#4CAF50" />
            <Text style={[styles.minimalValue, { color: textColor }]}>
              {elapsedTime}
            </Text>
          </View>
        </View>
      </BlurView>
    );
  }

  if (style === 'compact') {
    return (
      <BlurView
        intensity={isDark ? 80 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.compactContainer,
          position === 'bottom' && styles.bottomPosition,
          customStyle,
        ]}
      >
        <View style={styles.compactContent}>
          <Text style={[styles.compactExercise, { color: textColor }]}>
            {currentExercise}
          </Text>
          <View style={styles.compactMetrics}>
            <View style={styles.compactMetric}>
              <Icon name="heart" size={20} color="#FF6B6B" />
              <Text style={[styles.compactValue, { color: textColor }]}>
                {formatNumber(heartRate)}
              </Text>
              <Text style={[styles.compactLabel, { color: secondaryTextColor }]}>BPM</Text>
            </View>
            <View style={styles.compactMetric}>
              <Icon name="flame" size={20} color="#FF9800" />
              <Text style={[styles.compactValue, { color: textColor }]}>
                {formatNumber(calories)}
              </Text>
              <Text style={[styles.compactLabel, { color: secondaryTextColor }]}>CAL</Text>
            </View>
            <View style={styles.compactMetric}>
              <Icon name="time" size={20} color="#4CAF50" />
              <Text style={[styles.compactValue, { color: textColor }]}>
                {formatMinutes(activeMinutes)}
              </Text>
              <Text style={[styles.compactLabel, { color: secondaryTextColor }]}>MIN</Text>
            </View>
          </View>
        </View>
      </BlurView>
    );
  }

  // Full style
  return (
    <BlurView
      intensity={isDark ? 80 : 60}
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.fullContainer,
        position === 'bottom' && styles.bottomPosition,
        customStyle,
      ]}
    >
      <View style={styles.fullHeader}>
        <Text style={[styles.nowPlaying, { color: secondaryTextColor }]}>
          NOW PLAYING
        </Text>
        <Text style={[styles.setsProgress, { color: secondaryTextColor }]}>
          {setsCompleted}/{totalSets} Sets
        </Text>
      </View>

      <Text style={[styles.exerciseName, { color: textColor }]}>
        {currentExercise}
      </Text>

      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Icon name="heart" size={32} color="#FF6B6B" />
          <Text style={[styles.metricTitle, { color: secondaryTextColor }]}>
            Heart Rate
          </Text>
          <View style={styles.metricValueRow}>
            <Text style={[styles.metricValue, { color: textColor }]}>
              {formatNumber(heartRate)}
            </Text>
            <Text style={[styles.metricUnit, { color: secondaryTextColor }]}>
              BPM
            </Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Icon name="flame" size={32} color="#FF9800" />
          <Text style={[styles.metricTitle, { color: secondaryTextColor }]}>
            Calories
          </Text>
          <View style={styles.metricValueRow}>
            <Text style={[styles.metricValue, { color: textColor }]}>
              {formatNumber(calories)}
            </Text>
            <Text style={[styles.metricUnit, { color: secondaryTextColor }]}>
              CAL
            </Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Icon name="time" size={32} color="#4CAF50" />
          <Text style={[styles.metricTitle, { color: secondaryTextColor }]}>
            Time
          </Text>
          <Text style={[styles.metricValue, { color: textColor }]}>
            {elapsedTime}
          </Text>
        </View>
      </View>

      <View style={styles.secondaryMetrics}>
        <View style={styles.secondaryItem}>
          <Icon name="trending-up" size={20} color="#4CAF50" />
          <Text style={[styles.secondaryValue, { color: textColor }]}>
            {formatMinutes(activeMinutes)}
          </Text>
          <Text style={[styles.secondaryLabel, { color: secondaryTextColor }]}>
            Active
          </Text>
        </View>

        <View style={styles.secondaryItem}>
          <Icon name="location" size={20} color="#2196F3" />
          <Text style={[styles.secondaryValue, { color: textColor }]}>0.00</Text>
          <Text style={[styles.secondaryLabel, { color: secondaryTextColor }]}>
            Distance
          </Text>
        </View>

        <View style={styles.secondaryItem}>
          <Icon name="speedometer" size={20} color="#9C27B0" />
          <Text style={[styles.secondaryValue, { color: textColor }]}>--</Text>
          <Text style={[styles.secondaryLabel, { color: secondaryTextColor }]}>
            Pace
          </Text>
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  // Minimal Style
  minimalContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  minimalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  minimalMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  minimalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  minimalDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },

  // Compact Style
  compactContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  compactContent: {
    padding: 16,
  },
  compactExercise: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  compactMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactMetric: {
    alignItems: 'center',
  },
  compactValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  compactLabel: {
    fontSize: 12,
    marginTop: 2,
  },

  // Full Style
  fullContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
  },
  fullHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nowPlaying: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  setsProgress: {
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  secondaryItem: {
    alignItems: 'center',
  },
  secondaryValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  secondaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  bottomPosition: {
    top: 'auto',
    bottom: 100,
  },
});

export default FitnessMetricsOverlay;