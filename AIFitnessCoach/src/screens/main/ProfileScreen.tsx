import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const stats = [
    { label: 'Workouts', value: user?.totalWorkoutsCompleted || 0 },
    { label: 'Streak', value: `${user?.currentStreak || 0} days` },
    { label: 'Calories', value: `${(user?.totalCaloriesBurned || 0).toLocaleString()}` },
    { label: 'Minutes', value: user?.totalMinutesTrained || 0 },
  ];

  const menuItems = [
    { icon: 'account-edit', label: 'Edit Profile', onPress: () => {} },
    { icon: 'target', label: 'Goals & Preferences', onPress: () => {} },
    { icon: 'chart-line', label: 'Progress History', onPress: () => {} },
    { icon: 'dumbbell', label: 'My Workouts', onPress: () => {} },
    { icon: 'cog', label: 'Settings', onPress: () => navigation.navigate('Settings') },
    { icon: 'help-circle', label: 'Help & Support', onPress: () => {} },
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
              Profile
            </Text>
          </View>

          <GlassCard style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                {user?.profileImageUrl ? (
                  <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                      {user?.firstName?.[0] || user?.username?.[0] || '?'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user?.displayName || `${user?.firstName} ${user?.lastName}`.trim() || user?.username}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                {user?.email}
              </Text>
              <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.levelText, { color: theme.colors.primary }]}>
                  {user?.fitnessLevel?.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </GlassCard>

          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <GlassCard>
                  <View style={styles.menuItemContent}>
                    <Icon name={item.icon} size={24} color={theme.colors.primary} />
                    <Text style={[styles.menuItemLabel, { color: theme.colors.text }]}>
                      {item.label}
                    </Text>
                    <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>

          <GlassButton
            title="Sign Out"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileCard: {
    marginBottom: 24,
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    marginBottom: 24,
  },
});