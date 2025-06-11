import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Animated,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useAISettingsStore } from '../store/aiSettingsStore';
import { LiquidGlassView, LiquidButton, LiquidCard } from '../components/glass';

const LiquidSettingsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuthStore();
  const { theme, isDarkMode, setDarkMode, autoMode, setAutoMode, themeColor, setThemeColor } = useThemeStore();
  const { isQuantumMode, isTurboMode, toggleQuantumMode, toggleTurboMode, loadSettings } = useAISettingsStore();
  const [notifications, setNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [vacationMode, setVacationMode] = useState(false);

  const scrollAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    loadSettings();
    
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
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
        { 
          icon: 'stats-chart-outline', 
          label: 'View Statistics', 
          onPress: () => {
            navigation.navigate('Stats' as never);
          }
        },
        { 
          icon: 'download-outline', 
          label: 'Export Data', 
          onPress: () => {
            (navigation.navigate as any)('Stats', { openExport: true });
          }
        },
        { icon: 'analytics-outline', label: 'Progress Reports', onPress: () => {} },
      ],
    },
    {
      title: 'Privacy',
      items: [
        { icon: 'shield-outline', label: 'Privacy Settings', onPress: () => {} },
        { icon: 'eye-off-outline', label: 'Blocked Users', onPress: () => {} },
        { icon: 'document-text-outline', label: 'Data Policy', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help Center', onPress: () => {} },
        { icon: 'chatbubble-outline', label: 'Contact Support', onPress: () => {} },
        { icon: 'bug-outline', label: 'Report a Bug', onPress: () => {} },
      ],
    },
  ];

  const renderSwitch = (value: boolean, onValueChange: (value: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: 'rgba(255,255,255,0.2)', true: theme.colors.primary.main }}
      thumbColor={value ? 'white' : 'rgba(255,255,255,0.8)'}
      ios_backgroundColor="rgba(255,255,255,0.2)"
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{
              translateY: scrollAnimation.interpolate({
                inputRange: [0, 100],
                outputRange: [0, -20],
                extrapolate: 'clamp',
              })
            }],
            opacity: scrollAnimation.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0.9],
              extrapolate: 'clamp',
            })
          }
        ]}
      >
        <LiquidGlassView intensity={90} style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </LiquidGlassView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollAnimation } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <LiquidCard style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="moon-outline" size={24} color="white" />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              {renderSwitch(isDarkMode, setDarkMode)}
            </View>
          </LiquidCard>

          <LiquidCard style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="sunny-outline" size={24} color="white" />
                <Text style={styles.settingLabel}>Auto Mode</Text>
              </View>
              {renderSwitch(autoMode, setAutoMode)}
            </View>
          </LiquidCard>

          {/* Theme Color Selection */}
          <LiquidCard style={styles.themeCard}>
            <Text style={styles.themeTitle}>Theme Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.themeOption,
                    themeColor === option.id && styles.themeOptionSelected
                  ]}
                  onPress={() => setThemeColor(option.id as any)}
                >
                  <View style={styles.themePreview}>
                    {option.colors.map((color, index) => (
                      <View
                        key={index}
                        style={[styles.themeColorBar, { backgroundColor: color }]}
                      />
                    ))}
                  </View>
                  <Text style={styles.themeName}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LiquidCard>
        </View>

        {/* AI Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Coach Settings</Text>
          
          <LiquidCard style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="flash-outline" size={24} color="#FF9800" />
                <View>
                  <Text style={styles.settingLabel}>Turbo Mode</Text>
                  <Text style={styles.settingDescription}>Faster responses, hybrid actions</Text>
                </View>
              </View>
              {renderSwitch(isTurboMode, toggleTurboMode)}
            </View>
          </LiquidCard>

          <LiquidCard style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="planet-outline" size={24} color={theme.colors.primary.main} />
                <View>
                  <Text style={styles.settingLabel}>Quantum Mode</Text>
                  <Text style={styles.settingDescription}>Pure AI actions, advanced insights</Text>
                </View>
              </View>
              {renderSwitch(isQuantumMode, toggleQuantumMode)}
            </View>
          </LiquidCard>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <LiquidCard style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="notifications-outline" size={24} color="white" />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              {renderSwitch(notifications, setNotifications)}
            </View>
          </LiquidCard>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <LiquidCard style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="globe-outline" size={24} color="white" />
                <Text style={styles.settingLabel}>Public Profile</Text>
              </View>
              {renderSwitch(publicProfile, setPublicProfile)}
            </View>
          </LiquidCard>

          <LiquidCard style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="finger-print-outline" size={24} color="white" />
                <Text style={styles.settingLabel}>Biometric Auth</Text>
              </View>
              {renderSwitch(biometricAuth, setBiometricAuth)}
            </View>
          </LiquidCard>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity activeOpacity={0.7}>
            <LiquidCard style={styles.menuCard}>
              <View style={styles.menuRow}>
                <View style={styles.menuLeft}>
                  <Icon name="person-outline" size={22} color="white" />
                  <Text style={styles.menuLabel}>Edit Profile</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
              </View>
            </LiquidCard>
          </TouchableOpacity>
          
          <TouchableOpacity activeOpacity={0.7}>
            <LiquidCard style={styles.menuCard}>
              <View style={styles.menuRow}>
                <View style={styles.menuLeft}>
                  <Icon name="notifications-outline" size={22} color="white" />
                  <Text style={styles.menuLabel}>Notification Preferences</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
              </View>
            </LiquidCard>
          </TouchableOpacity>
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Settings</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <LiquidCard style={styles.menuCard}>
              <View style={styles.menuRow}>
                <View style={styles.menuLeft}>
                  <Icon name="settings-outline" size={22} color="white" />
                  <Text style={styles.menuLabel}>Advanced Options</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
              </View>
            </LiquidCard>
          </TouchableOpacity>
        </View>

        {/* Hide the old settings sections
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <LiquidCard style={styles.menuCard}>
                  <View style={styles.menuRow}>
                    <View style={styles.menuLeft}>
                      <Icon name={item.icon} size={22} color="white" />
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                  </View>
                </LiquidCard>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Vacation Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Modes</Text>
          
          <LiquidCard style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="airplane-outline" size={24} color="#4FC3F7" />
                <View>
                  <Text style={styles.settingLabel}>Vacation Mode</Text>
                  <Text style={styles.settingDescription}>Pause workout reminders</Text>
                </View>
              </View>
              {renderSwitch(vacationMode, setVacationMode)}
            </View>
          </LiquidCard>
        </View>

        {/* Log Out Button */}
        <View style={styles.section}>
          <LiquidButton
            label="Log Out"
            icon="log-out-outline"
            variant="danger"
            size="large"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>

        <View style={{ height: Platform.OS === 'ios' ? 120 : 100 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  settingCard: {
    padding: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  settingDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  themeCard: {
    padding: 16,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 12,
  },
  themeScroll: {
    marginHorizontal: -8,
  },
  themeOption: {
    marginHorizontal: 8,
    alignItems: 'center',
  },
  themeOptionSelected: {
    transform: [{ scale: 1.1 }],
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeColorBar: {
    flex: 1,
  },
  themeName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  menuCard: {
    padding: 16,
    marginBottom: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: 'white',
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default LiquidSettingsScreen;