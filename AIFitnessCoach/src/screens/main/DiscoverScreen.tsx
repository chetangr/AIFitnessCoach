import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeStore } from '@/store/themeStore';
import { GlassCard } from '@/components/glass/GlassCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const DiscoverScreen: React.FC = () => {
  const { theme } = useThemeStore();

  const categories = [
    { id: '1', name: 'HIIT', icon: 'timer', color: '#EF4444' },
    { id: '2', name: 'Strength', icon: 'dumbbell', color: '#3B82F6' },
    { id: '3', name: 'Yoga', icon: 'yoga', color: '#10B981' },
    { id: '4', name: 'Cardio', icon: 'run', color: '#F59E0B' },
    { id: '5', name: 'Flexibility', icon: 'human', color: '#8B5CF6' },
    { id: '6', name: 'Recovery', icon: 'spa', color: '#EC4899' },
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
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Discover
            </Text>
            <TouchableOpacity style={styles.searchButton}>
              <Icon name="magnify" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Browse Categories
          </Text>

          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <GlassCard>
                  <View style={styles.categoryContent}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                      <Icon name={category.icon} size={32} color={category.color} />
                    </View>
                    <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                      {category.name}
                    </Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Trending Workouts
          </Text>

          <GlassCard
            style={styles.workoutCard}
            title="30-Minute Full Body Blast"
            subtitle="High Intensity • No Equipment"
            icon="fire"
            iconColor="#EF4444"
            onPress={() => {}}
          >
            <View style={styles.workoutStats}>
              <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
                <Icon name="clock-outline" size={14} /> 30 min
              </Text>
              <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
                <Icon name="fire" size={14} /> 350 cal
              </Text>
              <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
                <Icon name="account-multiple" size={14} /> 2.3k
              </Text>
            </View>
          </GlassCard>

          <GlassCard
            style={styles.workoutCard}
            title="Morning Yoga Flow"
            subtitle="Flexibility • Beginner Friendly"
            icon="yoga"
            iconColor="#10B981"
            onPress={() => {}}
          >
            <View style={styles.workoutStats}>
              <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
                <Icon name="clock-outline" size={14} /> 20 min
              </Text>
              <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
                <Icon name="fire" size={14} /> 120 cal
              </Text>
              <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
                <Icon name="account-multiple" size={14} /> 1.8k
              </Text>
            </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  categoryCard: {
    width: '31%',
    marginHorizontal: '1.16%',
    marginBottom: 16,
  },
  categoryContent: {
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  workoutCard: {
    marginBottom: 16,
  },
  workoutStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  stat: {
    fontSize: 12,
  },
});