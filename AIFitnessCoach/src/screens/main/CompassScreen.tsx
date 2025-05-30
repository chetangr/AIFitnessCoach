import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/glass/GlassCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export const CompassScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  const insights = [
    {
      id: '1',
      title: 'Weekly Progress',
      value: '85%',
      change: '+12%',
      icon: 'trending-up',
      color: '#10B981',
    },
    {
      id: '2',
      title: 'Calories Burned',
      value: '2,450',
      change: '+320',
      icon: 'fire',
      color: '#F59E0B',
    },
    {
      id: '3',
      title: 'Active Days',
      value: '5/7',
      change: 'Great!',
      icon: 'calendar-check',
      color: '#3B82F6',
    },
    {
      id: '4',
      title: 'Current Streak',
      value: `${user?.currentStreak || 0}`,
      change: 'days',
      icon: 'lightning-bolt',
      color: '#8B5CF6',
    },
  ];

  return (
    <LinearGradient
      colors={theme.colors.background === '#FFFFFF' 
        ? ['#F9FAFB', '#F3F4F6']
        : ['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
                Welcome back,
              </Text>
              <Text style={[styles.name, { color: theme.colors.text }]}>
                {user?.firstName || 'Athlete'}! 👋
              </Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Icon name="bell-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <GlassCard
            style={styles.motivationCard}
            title="Today's Focus"
            subtitle="Push your limits!"
            icon="target"
            iconColor={theme.colors.primary}
          >
            <Text style={[styles.motivationText, { color: theme.colors.text }]}>
              You're on fire! Keep up the momentum and crush today's workout. 
              Remember, every rep counts towards your goals!
            </Text>
          </GlassCard>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Your Insights
          </Text>

          <View style={styles.insightsGrid}>
            {insights.map((insight) => (
              <TouchableOpacity key={insight.id} style={styles.insightCard}>
                <GlassCard>
                  <View style={styles.insightContent}>
                    <View style={[styles.iconCircle, { backgroundColor: insight.color + '20' }]}>
                      <Icon name={insight.icon} size={24} color={insight.color} />
                    </View>
                    <Text style={[styles.insightTitle, { color: theme.colors.textSecondary }]}>
                      {insight.title}
                    </Text>
                    <Text style={[styles.insightValue, { color: theme.colors.text }]}>
                      {insight.value}
                    </Text>
                    <Text style={[styles.insightChange, { color: insight.color }]}>
                      {insight.change}
                    </Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recommended Actions
          </Text>

          <GlassCard
            style={styles.actionCard}
            title="Hydration Reminder"
            subtitle="Stay hydrated!"
            icon="water"
            iconColor="#3B82F6"
            onPress={() => {}}
          >
            <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
              Don't forget to drink water throughout your workout
            </Text>
          </GlassCard>

          <GlassCard
            style={styles.actionCard}
            title="Rest Day Tomorrow"
            subtitle="Recovery is important"
            icon="bed"
            iconColor="#8B5CF6"
            onPress={() => {}}
          >
            <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
              Your body needs time to recover and grow stronger
            </Text>
          </GlassCard>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationCard: {
    marginBottom: 24,
  },
  motivationText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  insightCard: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  insightContent: {
    alignItems: 'center',
    padding: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionCard: {
    marginBottom: 16,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});