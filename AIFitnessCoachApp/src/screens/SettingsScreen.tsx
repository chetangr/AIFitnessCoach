import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useAISettingsStore } from '../store/aiSettingsStore';
import { theme } from '../config/theme';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuthStore();
  const { isDarkMode, setDarkMode, autoMode, setAutoMode, themeColor, setThemeColor } = useThemeStore();
  const { isQuantumMode, isTurboMode, toggleQuantumMode, toggleTurboMode, loadSettings } = useAISettingsStore();
  const [notifications, setNotifications] = React.useState(true);
  const [publicProfile, setPublicProfile] = React.useState(false);
  const [biometricAuth, setBiometricAuth] = React.useState(false);
  const [vacationMode, setVacationMode] = React.useState(false);

  React.useEffect(() => {
    loadSettings();
  }, []);

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
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const themeOptions = [
    { name: 'Default', colors: ['#667eea', '#764ba2', '#f093fb'], id: 'default' },
    { name: 'Festival', colors: ['#FF6B6B', '#FFB347', '#FFE66D'], id: 'festival' },
    { name: 'Ocean', colors: ['#4ECDC4', '#44A08D', '#093637'], id: 'ocean' },
    { name: 'Sunset', colors: ['#F97B22', '#F15412', '#D22B2B'], id: 'sunset' },
    { name: 'Forest', colors: ['#2C7744', '#3D8B53', '#4E9F62'], id: 'forest' },
  ];

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
      title: 'Stats & Export',
      items: [
        { icon: 'stats-chart-outline', label: 'View Statistics', onPress: () => navigation.navigate('Stats' as any) },
        { icon: 'download-outline', label: 'Export Data', onPress: () => navigation.navigate('Stats' as any, { openExport: true }) },
        { icon: 'analytics-outline', label: 'Progress Reports', onPress: () => {} },
      ],
    },
    {
      title: 'Appearance',
      items: [
        { 
          icon: 'moon-outline', 
          label: 'Dark Mode', 
          toggle: true, 
          value: isDarkMode, 
          onToggle: (value: boolean) => setDarkMode(value)
        },
        { 
          icon: 'sunny-outline', 
          label: 'Auto Dark Mode', 
          toggle: true, 
          value: autoMode, 
          onToggle: (value: boolean) => {
            setAutoMode(value);
            if (value) {
              Alert.alert(
                'Auto Dark Mode Enabled', 
                'Theme will automatically switch based on sunrise and sunset times.'
              );
            }
          }
        },
      ],
    },
    {
      title: 'AI Settings',
      items: [
        { 
          icon: 'flash-outline', 
          label: 'Turbo Mode', 
          toggle: true, 
          value: isTurboMode, 
          onToggle: toggleTurboMode
        },
        { 
          icon: 'planet-outline', 
          label: 'Quantum Mode', 
          toggle: true, 
          value: isQuantumMode, 
          onToggle: toggleQuantumMode
        },
        { 
          icon: 'notifications-outline', 
          label: 'AI Notifications', 
          toggle: true, 
          value: notifications, 
          onToggle: setNotifications
        },
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
        { icon: 'calendar-outline', label: 'Manage Vacation Days', onPress: () => {} },
        { icon: 'repeat-outline', label: 'Auto-schedule Workouts', toggle: true, value: true, onToggle: () => {} },
      ],
    },
    {
      title: 'Security',
      items: [
        { 
          icon: 'finger-print-outline', 
          label: 'Biometric Auth', 
          toggle: true, 
          value: biometricAuth, 
          onToggle: setBiometricAuth
        },
        { icon: 'eye-outline', label: 'Public Profile', toggle: true, value: publicProfile, onToggle: setPublicProfile },
        { icon: 'shield-outline', label: 'Privacy Policy', onPress: () => {} },
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

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <BlurView intensity={40} tint="dark" style={styles.sectionContainer}>
        {section.items.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.settingItem,
              index < section.items.length - 1 && styles.settingItemBorder
            ]}
            onPress={item.onPress}
            disabled={item.toggle}
          >
            <View style={styles.settingLeft}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.iconContainer}
              >
                <Icon name={item.icon} size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.settingLabel}>{item.label}</Text>
            </View>
            {item.toggle ? (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#667eea' }}
                thumbColor={item.value ? '#f093fb' : '#f4f3f4'}
              />
            ) : (
              <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
            )}
          </TouchableOpacity>
        ))}
      </BlurView>
    </View>
  );

  return (
    <LinearGradient colors={theme.colors.primary.gradient as [string, string, string]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Icon name="settings" size={28} color="#f093fb" />
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Theme Color Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme Colors</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.themeSelector}
          >
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.themeOption,
                  themeColor === option.id && styles.themeOptionSelected
                ]}
                onPress={() => setThemeColor(option.id)}
              >
                <LinearGradient
                  colors={option.colors}
                  style={styles.themePreview}
                />
                <Text style={styles.themeName}>{option.name}</Text>
                {themeColor === option.id && (
                  <Icon name="checkmark-circle" size={20} color="#f093fb" style={styles.themeCheck} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {settingsSections.map(renderSection)}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <BlurView intensity={40} tint="dark" style={styles.logoutBlur}>
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.logoutGradient}
            >
              <Icon name="log-out-outline" size={24} color="white" />
              <Text style={styles.logoutText}>Log Out</Text>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
    marginLeft: 5,
  },
  sectionContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  themeSelector: {
    marginBottom: 10,
  },
  themeOption: {
    marginRight: 12,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionSelected: {
    borderColor: '#f093fb',
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  themeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutBlur: {
    borderRadius: 16,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 20,
  },
});

export default SettingsScreen;