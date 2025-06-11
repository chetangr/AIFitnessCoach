import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { modernTheme } from '../config/modernTheme';
import { ModernCard, ModernHeader } from '../components/modern/ModernComponents';
import { useAuthStore } from '../store/authStore';

const ModernProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const stats = [
    { id: 'workouts', value: '24', label: 'Workouts\nCompleted', icon: 'fitness', color: '#4ECDC4' },
    { id: 'minutes', value: '1,240', label: 'Total\nMinutes', icon: 'time', color: '#4DA2FF' },
    { id: 'calories', value: '12,500', label: 'Calories\nBurned', icon: 'flame', color: '#FF6B6B' },
    { id: 'streak', value: '7 days', label: 'Current\nStreak', icon: 'trending-up', color: '#FFD93D' },
  ];

  const menuItems = [
    { icon: 'body', title: 'Measurements', route: 'Measurements' },
    { icon: 'camera', title: 'Progress Photos', route: 'ProgressPhotos' },
    { icon: 'stats-chart', title: 'Statistics', route: 'Stats' },
    { icon: 'download', title: 'Workout Downloads', route: 'WorkoutDownloads' },
    { icon: 'settings', title: 'Settings', route: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader
        title="Profile"
        rightAction={
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={modernTheme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <ModernCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color={modernTheme.colors.textTertiary} />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user?.name || 'demo'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'demo@fitness.com'}</Text>
            <Text style={styles.memberSince}>Member since 2025</Text>
          </View>
        </ModernCard>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <ModernCard key={stat.id} variant="elevated" style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </ModernCard>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route as never)}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={24} color={modernTheme.colors.primary} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={modernTheme.colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium Section */}
        <ModernCard variant="elevated" style={styles.premiumCard}>
          <View style={styles.premiumContent}>
            <View style={styles.premiumIcon}>
              <Ionicons name="star" size={32} color="#FFD700" />
            </View>
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumSubtitle}>
                Unlock advanced features and personalized coaching
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Learn More</Text>
          </TouchableOpacity>
        </ModernCard>
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
  profileCard: {
    marginTop: modernTheme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: modernTheme.spacing.md,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: modernTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: modernTheme.colors.cardBackground,
  },
  userName: {
    ...modernTheme.typography.title2,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.xs,
  },
  userEmail: {
    ...modernTheme.typography.body,
    color: modernTheme.colors.textSecondary,
    marginBottom: modernTheme.spacing.xs,
  },
  memberSince: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textTertiary,
  },
  statsSection: {
    marginTop: modernTheme.spacing.xl,
  },
  sectionTitle: {
    ...modernTheme.typography.title3,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: modernTheme.spacing.sm,
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
    ...modernTheme.typography.title2,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.xs,
  },
  statLabel: {
    ...modernTheme.typography.caption1,
    color: modernTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  menuSection: {
    marginTop: modernTheme.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: modernTheme.spacing.md,
    paddingHorizontal: modernTheme.spacing.md,
    backgroundColor: modernTheme.colors.cardBackground,
    borderRadius: modernTheme.borderRadius.md,
    marginBottom: modernTheme.spacing.sm,
    ...modernTheme.shadows.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modernTheme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.md,
  },
  menuTitle: {
    ...modernTheme.typography.body,
    color: modernTheme.colors.textPrimary,
  },
  premiumCard: {
    marginTop: modernTheme.spacing.xl,
    backgroundColor: modernTheme.colors.primary + '10',
    borderWidth: 1,
    borderColor: modernTheme.colors.primary + '30',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.md,
  },
  premiumIcon: {
    marginRight: modernTheme.spacing.md,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.xs,
  },
  premiumSubtitle: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
  },
  premiumButton: {
    backgroundColor: modernTheme.colors.primary,
    paddingVertical: modernTheme.spacing.sm,
    borderRadius: modernTheme.borderRadius.sm,
    alignItems: 'center',
  },
  premiumButtonText: {
    ...modernTheme.typography.subheadline,
    color: '#FFFFFF',
    fontWeight: '600' as '600',
  },
});

export default ModernProfileScreen;