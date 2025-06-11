import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { modernTheme } from '../config/modernTheme';
import {
  ModernCard,
  ModernButton,
  ModernHeader,
  ModernContainer,
} from '../components/modern/ModernComponents';
import moment from 'moment';

const { width } = Dimensions.get('window');

const ModernFastingScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState('16:8');
  const [isFasting, setIsFasting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const fastingPlans = [
    { id: '12:12', name: '12:12', fasting: 12, eating: 12, difficulty: 'Beginner' },
    { id: '16:8', name: '16:8', fasting: 16, eating: 8, difficulty: 'Popular' },
    { id: '18:6', name: '18:6', fasting: 18, eating: 6, difficulty: 'Moderate' },
    { id: '20:4', name: '20:4', fasting: 20, eating: 4, difficulty: 'Advanced' },
  ];

  const stats = [
    { icon: 'flame', value: '7', label: 'Day Streak', color: '#FF6B6B' },
    { icon: 'checkmark-circle', value: '24', label: 'Total Fasts', color: '#4ECDC4' },
    { icon: 'trophy', value: '168', label: 'Hours Fasted', color: '#FFD93D' },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFasting && startTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime.getTime();
        setElapsedTime(Math.floor(elapsed / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  const toggleFasting = () => {
    if (isFasting) {
      // End fast
      setIsFasting(false);
      setElapsedTime(0);
      setStartTime(null);
    } else {
      // Start fast
      setIsFasting(true);
      setStartTime(new Date());
      setElapsedTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const plan = fastingPlans.find(p => p.id === selectedPlan);
    if (!plan || !isFasting) return 0;
    const targetSeconds = plan.fasting * 3600;
    return Math.min((elapsedTime / targetSeconds) * 100, 100);
  };

  const getNextPhase = () => {
    if (!isFasting || !startTime) return null;
    const plan = fastingPlans.find(p => p.id === selectedPlan);
    if (!plan) return null;
    
    const endTime = moment(startTime).add(plan.fasting, 'hours');
    return endTime.format('h:mm A');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader title="Intermittent Fasting" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ModernCard variant="default" style={styles.planSelector}>
          <Text style={styles.sectionTitle}>Fasting Plan</Text>
          <View style={styles.planGrid}>
            {fastingPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardActive,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <Text style={[
                  styles.planName,
                  selectedPlan === plan.id && styles.planNameActive,
                ]}>
                  {plan.name}
                </Text>
                <Text style={[
                  styles.planDifficulty,
                  selectedPlan === plan.id && styles.planDifficultyActive,
                ]}>
                  {plan.difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[
              styles.customPlanCard,
              selectedPlan === 'custom' && styles.customPlanCardActive,
            ]}
            onPress={() => setSelectedPlan('custom')}
          >
            <Ionicons 
              name="time-outline" 
              size={20} 
              color={selectedPlan === 'custom' ? '#FFFFFF' : modernTheme.colors.primary} 
            />
            <Text style={[
              styles.customPlanText,
              selectedPlan === 'custom' && styles.customPlanTextActive,
            ]}>
              Custom Duration
            </Text>
          </TouchableOpacity>
        </ModernCard>

        <View style={styles.timerSection}>
          <View style={styles.timerContainer}>
            <View style={styles.progressRing}>
              <View style={[styles.progressFill, { height: `${getProgress()}%` }]} />
              <View style={styles.timerContent}>
                <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                <Text style={styles.timerLabel}>
                  {isFasting ? 'Elapsed' : 'Start your fast'}
                </Text>
              </View>
            </View>
          </View>

          {isFasting && getNextPhase() && (
            <View style={styles.phaseInfo}>
              <Ionicons name="restaurant-outline" size={20} color={modernTheme.colors.textSecondary} />
              <Text style={styles.phaseText}>Eating window opens at {getNextPhase()}</Text>
            </View>
          )}

          <ModernButton
            title={isFasting ? 'End Fasting' : 'Start Fasting'}
            onPress={toggleFasting}
            variant={isFasting ? 'danger' : 'primary'}
            size="large"
            fullWidth
            icon={
              <Ionicons 
                name={isFasting ? 'stop' : 'play'} 
                size={20} 
                color="#FFFFFF" 
              />
            }
          />
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <ModernCard key={index} variant="elevated" style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </ModernCard>
            ))}
          </View>
        </View>

        <ModernCard variant="default" style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={24} color={modernTheme.colors.warning} />
            <Text style={styles.tipsTitle}>Today's Tip</Text>
          </View>
          <Text style={styles.tipsText}>
            Stay hydrated during your fast! Water, black coffee, and plain tea are all 
            great options that won't break your fast.
          </Text>
        </ModernCard>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent Fasts</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ModernCard variant="outlined" style={styles.historyItem}>
            <View style={styles.historyDate}>
              <Text style={styles.historyDay}>Yesterday</Text>
              <Text style={styles.historyTime}>16h 32m</Text>
            </View>
            <View style={styles.historySuccess}>
              <Ionicons name="checkmark-circle" size={20} color={modernTheme.colors.success} />
              <Text style={styles.historyStatus}>Completed</Text>
            </View>
          </ModernCard>

          <ModernCard variant="outlined" style={styles.historyItem}>
            <View style={styles.historyDate}>
              <Text style={styles.historyDay}>Monday</Text>
              <Text style={styles.historyTime}>18h 15m</Text>
            </View>
            <View style={styles.historySuccess}>
              <Ionicons name="checkmark-circle" size={20} color={modernTheme.colors.success} />
              <Text style={styles.historyStatus}>Completed</Text>
            </View>
          </ModernCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: modernTheme.spacing.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...modernTheme.typography.title3,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.md,
  },
  planSelector: {
    marginTop: modernTheme.spacing.lg,
  },
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -modernTheme.spacing.xs,
  },
  planCard: {
    minWidth: 65,
    maxWidth: 75,
    margin: modernTheme.spacing.xs / 2,
    paddingVertical: modernTheme.spacing.sm,
    paddingHorizontal: modernTheme.spacing.xs,
    borderRadius: modernTheme.borderRadius.md,
    backgroundColor: modernTheme.colors.surface,
    alignItems: 'center',
  },
  planCardActive: {
    backgroundColor: modernTheme.colors.primary,
  },
  planName: {
    ...modernTheme.typography.subheadline,
    fontSize: 14,
    fontWeight: '600' as '600',
    color: modernTheme.colors.textPrimary,
    marginBottom: 2,
  },
  planNameActive: {
    color: '#FFFFFF',
  },
  planDifficulty: {
    ...modernTheme.typography.caption2,
    fontSize: 11,
    color: modernTheme.colors.textSecondary,
  },
  planDifficultyActive: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  timerSection: {
    alignItems: 'center',
    marginTop: modernTheme.spacing.xl,
  },
  timerContainer: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: modernTheme.spacing.lg,
  },
  progressRing: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.3,
    backgroundColor: modernTheme.colors.surface,
    borderWidth: 3,
    borderColor: modernTheme.colors.border,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: modernTheme.colors.primary + '20',
    borderTopWidth: 3,
    borderTopColor: modernTheme.colors.primary,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    ...modernTheme.typography.largeTitle,
    fontSize: 48,
    color: modernTheme.colors.textPrimary,
    fontWeight: '300' as '300',
  },
  timerLabel: {
    ...modernTheme.typography.subheadline,
    color: modernTheme.colors.textSecondary,
    marginTop: modernTheme.spacing.sm,
  },
  phaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.lg,
    paddingHorizontal: modernTheme.spacing.md,
    paddingVertical: modernTheme.spacing.sm,
    backgroundColor: modernTheme.colors.surface,
    borderRadius: modernTheme.borderRadius.sm,
  },
  phaseText: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
    marginLeft: modernTheme.spacing.sm,
  },
  statsSection: {
    marginTop: modernTheme.spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: -modernTheme.spacing.xs,
  },
  statCard: {
    flex: 1,
    margin: modernTheme.spacing.xs,
    alignItems: 'center',
    paddingVertical: modernTheme.spacing.lg,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: modernTheme.spacing.sm,
  },
  statValue: {
    ...modernTheme.typography.title1,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.xs,
  },
  statLabel: {
    ...modernTheme.typography.caption1,
    color: modernTheme.colors.textSecondary,
    textAlign: 'center',
  },
  tipsCard: {
    marginTop: modernTheme.spacing.lg,
    backgroundColor: modernTheme.colors.warning + '10',
    borderWidth: 1,
    borderColor: modernTheme.colors.warning + '30',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.sm,
  },
  tipsTitle: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
    marginLeft: modernTheme.spacing.sm,
  },
  tipsText: {
    ...modernTheme.typography.body,
    color: modernTheme.colors.textSecondary,
    lineHeight: 22,
  },
  historySection: {
    marginTop: modernTheme.spacing.xl,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.md,
  },
  viewAllText: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.primary,
    fontWeight: '600' as '600',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.sm,
  },
  historyDate: {
    flex: 1,
  },
  historyDay: {
    ...modernTheme.typography.body,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.xs,
  },
  historyTime: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
  },
  historySuccess: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyStatus: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.success,
    marginLeft: modernTheme.spacing.xs,
    fontWeight: '600' as '600',
  },
  customPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: modernTheme.spacing.md,
    paddingVertical: modernTheme.spacing.md,
    paddingHorizontal: modernTheme.spacing.lg,
    borderRadius: modernTheme.borderRadius.md,
    backgroundColor: modernTheme.colors.surface,
    borderWidth: 1,
    borderColor: modernTheme.colors.border,
  },
  customPlanCardActive: {
    backgroundColor: modernTheme.colors.primary,
    borderColor: modernTheme.colors.primary,
  },
  customPlanText: {
    ...modernTheme.typography.body,
    color: modernTheme.colors.primary,
    fontWeight: '600' as '600',
    marginLeft: modernTheme.spacing.sm,
  },
  customPlanTextActive: {
    color: '#FFFFFF',
  },
});

export default ModernFastingScreen;