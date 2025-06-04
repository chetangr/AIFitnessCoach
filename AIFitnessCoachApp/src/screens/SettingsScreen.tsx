import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuthStore();
  const { isDarkMode, theme, setDarkMode, autoMode, setAutoMode } = useThemeStore();
  const [notifications, setNotifications] = React.useState(true);
  const [publicProfile, setPublicProfile] = React.useState(false);
  const [biometricAuth, setBiometricAuth] = React.useState(false);
  const [vacationMode, setVacationMode] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will automatically redirect to login screen
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
        { icon: 'lock-closed-outline', label: 'Change Password', onPress: () => {} },
        { icon: 'mail-outline', label: 'Email Preferences', onPress: () => {} },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: 'moon-outline', 
          label: 'Dark Mode', 
          toggle: true, 
          value: isDarkMode, 
          onToggle: (value: boolean) => {
            console.log('Dark mode toggle:', value, 'Current:', isDarkMode);
            setDarkMode(value);
          }
        },
        { 
          icon: 'sunny-outline', 
          label: 'Auto Dark Mode (Sunrise/Sunset)', 
          toggle: true, 
          value: autoMode, 
          onToggle: (value: boolean) => {
            console.log('Auto dark mode toggle:', value);
            setAutoMode(value);
            if (value) {
              Alert.alert(
                'Auto Dark Mode Enabled', 
                'Theme will automatically switch based on sunrise and sunset times in your location.'
              );
            }
          }
        },
        { icon: 'notifications-outline', label: 'Push Notifications', toggle: true, value: notifications, onToggle: setNotifications },
        { icon: 'finger-print-outline', label: 'Biometric Authentication', toggle: true, value: biometricAuth, onToggle: setBiometricAuth },
        { icon: 'language-outline', label: 'Language', value: 'English', onPress: () => {} },
      ],
    },
    {
      title: 'Workout Settings',
      items: [
        { 
          icon: 'airplane-outline', 
          label: 'Vacation Mode', 
          toggle: true, 
          value: vacationMode, 
          onToggle: (value: boolean) => {
            setVacationMode(value);
            if (value) {
              Alert.alert('Vacation Mode', 'Your workouts will be paused. Enjoy your time off!');
            }
          }
        },
        { icon: 'calendar-outline', label: 'Manage Vacation Days', onPress: () => Alert.alert('Coming Soon', 'Vacation day management will be available soon!') },
        { icon: 'repeat-outline', label: 'Auto-schedule Workouts', toggle: true, value: true, onToggle: () => {} },
      ],
    },
    {
      title: 'Privacy',
      items: [
        { icon: 'eye-outline', label: 'Public Profile', toggle: true, value: publicProfile, onToggle: setPublicProfile },
        { icon: 'shield-outline', label: 'Privacy Policy', onPress: () => {} },
        { icon: 'document-text-outline', label: 'Terms of Service', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help Center', onPress: () => {} },
        { icon: 'chatbubble-outline', label: 'Contact Us', onPress: () => {} },
        { icon: 'star-outline', label: 'Rate App', onPress: () => {} },
      ],
    },
  ];

  const gradientColors = isDarkMode 
    ? ['#0f0c29', '#302b63', '#24243e'] as const
    : ['#667eea', '#764ba2', '#f093fb'] as const;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: isDarkMode ? theme.colors.surface : '#f5f5f5' }]} 
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? theme.colors.textSecondary : '#666' }]}>{section.title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: isDarkMode ? theme.colors.background : '#fff' }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.settingItem}
                  onPress={item.onPress}
                  disabled={item.toggle}
                >
                  <View style={styles.settingLeft}>
                    <Icon name={item.icon} size={22} color={isDarkMode ? theme.colors.primary : "#667eea"} />
                    <Text style={[styles.settingLabel, { color: isDarkMode ? theme.colors.text : '#333' }]}>{item.label}</Text>
                  </View>
                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#E0E0E0', true: '#667eea' }}
                      thumbColor={item.value ? '#fff' : '#f4f3f4'}
                    />
                  ) : item.value ? (
                    <Text style={styles.settingValue}>{item.value}</Text>
                  ) : (
                    <Icon name="chevron-forward" size={20} color="#999" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Debug Theme Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#4ECDC4' : '#667eea', marginBottom: 10 }]} 
          onPress={() => {
            console.log('Manual theme toggle clicked. Current:', isDarkMode);
            setDarkMode(!isDarkMode);
          }}
        >
          <Text style={styles.logoutText}>
            {isDarkMode ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: isDarkMode ? theme.colors.textSecondary : '#999' }]}>
            Version 2.0.0 {isDarkMode ? '🌙' : '☀️'}
          </Text>
          <Text style={[styles.debugText, { color: isDarkMode ? theme.colors.textSecondary : '#999' }]}>
            Theme: {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 20,
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  settingValue: {
    fontSize: 14,
    color: '#999',
    marginRight: 5,
  },
  logoutButton: {
    backgroundColor: '#ff4757',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default SettingsScreen;