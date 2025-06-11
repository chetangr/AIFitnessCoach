import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { ModernCard, ModernHeader } from '../components/modern/ModernComponents';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useAISettingsStore } from '../store/aiSettingsStore';

const ModernProfileScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const { isDarkMode, setDarkMode, autoMode, setAutoMode, themeColor, setThemeColor } = useThemeStore();
  const { isQuantumMode, isTurboMode, toggleQuantumMode, toggleTurboMode } = useAISettingsStore();
  const [notifications, setNotifications] = useState(true);

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
  ];

  const themeOptions = [
    { name: 'Default', colors: ['#667eea', '#764ba2'], id: 'default' },
    { name: 'Festival', colors: ['#FF6B6B', '#FFB347'], id: 'festival' },
    { name: 'Ocean', colors: ['#4ECDC4', '#44A08D'], id: 'ocean' },
    { name: 'Sunset', colors: ['#F97B22', '#F15412'], id: 'sunset' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => logout()
        },
      ]
    );
  };

  const renderSwitch = (value: boolean, onValueChange: (value: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: 'rgba(120,120,120,0.3)', true: theme.colors.primary + '60' }}
      thumbColor={value ? theme.colors.primary : '#f4f3f4'}
      ios_backgroundColor="rgba(120,120,120,0.3)"
    />
  );

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader
        title="Profile"
        rightAction={
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.primary} />
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
              <Ionicons name="person-circle" size={80} color={theme.colors.textTertiary} />
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
                  <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Appearance Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={24} color={theme.colors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            {renderSwitch(isDarkMode, setDarkMode)}
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="sunny-outline" size={24} color={theme.colors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={styles.settingLabel}>Auto Mode</Text>
            </View>
            {renderSwitch(autoMode, setAutoMode)}
          </View>

          {/* Theme Colors */}
          <View style={styles.themeSection}>
            <Text style={styles.settingLabel}>Theme Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
              {themeOptions.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeOption,
                    themeColor === theme.id && styles.themeOptionActive
                  ]}
                  onPress={() => setThemeColor(theme.id)}
                >
                  <View style={[styles.themePreview, { backgroundColor: theme.colors[0] }]}>
                    <View style={[styles.themeAccent, { backgroundColor: theme.colors[1] }]} />
                  </View>
                  <Text style={styles.themeName}>{theme.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* AI Coach Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>AI Coach Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="flash-outline" size={24} color="#FFD93D" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Turbo Mode</Text>
                <Text style={styles.settingDescription}>Faster responses, hybrid actions</Text>
              </View>
            </View>
            {renderSwitch(isTurboMode, toggleTurboMode)}
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="rocket-outline" size={24} color="#4DA2FF" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Quantum Mode</Text>
                <Text style={styles.settingDescription}>Pure AI actions, advanced insights</Text>
              </View>
            </View>
            {renderSwitch(isQuantumMode, toggleQuantumMode)}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={styles.settingLabel}>Workout Reminders</Text>
            </View>
            {renderSwitch(notifications, setNotifications)}
          </View>
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

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 120,
  },
  profileCard: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.cardBackground,
  },
  userName: {
    ...theme.typography.title2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  memberSince: {
    ...theme.typography.footnote,
    color: theme.colors.textTertiary,
  },
  statsSection: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.title3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    ...theme.typography.title2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  menuSection: {
    marginTop: theme.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuTitle: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  premiumCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  premiumIcon: {
    marginRight: theme.spacing.md,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    ...theme.typography.headline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  premiumSubtitle: {
    ...theme.typography.footnote,
    color: theme.colors.textSecondary,
  },
  premiumButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  premiumButtonText: {
    ...theme.typography.subheadline,
    color: '#FFFFFF',
    fontWeight: '600' as '600',
  },
  settingsSection: {
    marginTop: theme.spacing.xl,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '500' as '500',
  },
  settingDescription: {
    ...theme.typography.caption1,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  themeSection: {
    marginTop: theme.spacing.md,
  },
  themeScroll: {
    marginTop: theme.spacing.sm,
    marginHorizontal: -theme.spacing.sm,
  },
  themeOption: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
    opacity: 0.7,
  },
  themeOptionActive: {
    opacity: 1,
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  themeAccent: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  themeName: {
    ...theme.typography.caption1,
    color: theme.colors.textSecondary,
  },
});

export default ModernProfileScreen;