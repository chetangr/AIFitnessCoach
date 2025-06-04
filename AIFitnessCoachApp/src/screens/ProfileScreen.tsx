import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
// Logger temporarily removed - was causing import errors

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [notifications, setNotifications] = React.useState(true);

  const stats = [
    { label: 'Total Workouts', value: '156' },
    { label: 'Hours Trained', value: '234' },
    { label: 'Calories Burned', value: '45.2K' },
    { label: 'Current Streak', value: '12 days' },
  ];

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', action: 'editProfile' },
    { icon: 'fitness-outline', label: 'Fitness Goals', action: 'goals' },
    { icon: 'analytics-outline', label: 'Progress Reports', action: 'reports' },
    { icon: 'calendar-outline', label: 'Workout History', action: 'history' },
    { icon: 'trophy-outline', label: 'Achievements', action: 'achievements' },
    { icon: 'help-circle-outline', label: 'Help & Support', action: 'help' },
  ];

  const handleMenuAction = (action: string) => {
    console.log('Profile Menu Action', { action });
    // Handle navigation based on action
  };

  const handleLogout = async () => {
    console.log('Logout');
    await logout();
  };

  const gradientColors = isDarkMode 
    ? ['#0f0c29', '#302b63', '#24243e'] as const
    : ['#667eea', '#764ba2', '#f093fb'] as const;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <BlurView intensity={30} tint="light" style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.name || 'Fitness Warrior'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@fitness.com'}</Text>
          
          <View style={styles.membershipBadge}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.membershipText}>Premium Member</Text>
          </View>
        </BlurView>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <BlurView key={index} intensity={30} tint="light" style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </BlurView>
          ))}
        </View>

        {/* Settings */}
        <BlurView intensity={30} tint="light" style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Quick Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="moon-outline" size={24} color="white" />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#667eea' }}
              thumbColor="white"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications-outline" size={24} color="white" />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#667eea' }}
              thumbColor="white"
            />
          </View>
        </BlurView>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleMenuAction(item.action)}
            >
              <BlurView intensity={30} tint="light" style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <Icon name={item.icon} size={24} color="white" />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout}>
          <BlurView intensity={30} tint="light" style={styles.logoutButton}>
            <Icon name="log-out-outline" size={24} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: Platform.OS === 'ios' ? 90 : 80 }} />
      </ScrollView>
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
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  profileCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  membershipText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  statCard: {
    width: '48%',
    padding: 20,
    margin: '1%',
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  settingsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    color: 'white',
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;