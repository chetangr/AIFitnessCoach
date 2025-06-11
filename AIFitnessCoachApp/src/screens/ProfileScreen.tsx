import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';
import { workoutTrackingService } from '../services/workoutTrackingService';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useThemeStore } from '../store/themeStore';
import { LiquidGlassView, LiquidButton, LiquidCard, LiquidInput } from '../components/glass';

const LiquidProfileScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  
  // Edit profile state
  const [editName, setEditName] = useState(user?.email?.split('@')[0] || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  
  // Goals state
  const [selectedGoals, setSelectedGoals] = useState([
    'Weight Loss', 'Muscle Gain'
  ]);

  // Animation values
  const scrollAnimation = useRef(new Animated.Value(0)).current;
  const statsAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate stats on mount
    Animated.stagger(100, [
      Animated.spring(statsAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, []);

  const profileStats = [
    { label: 'Workouts Completed', value: '24', icon: 'fitness', color: theme.colors.success },
    { label: 'Total Minutes', value: '1,240', icon: 'time', color: theme.colors.primary.main },
    { label: 'Calories Burned', value: '12,500', icon: 'flame', color: theme.colors.error },
    { label: 'Current Streak', value: '7 days', icon: 'trending-up', color: theme.colors.warning },
  ];

  const menuItems = [
    { label: 'Edit Profile', icon: 'person-outline', action: () => {
      console.log('Edit Profile clicked');
      setShowEditModal(true);
    }},
    { label: 'Fitness Goals', icon: 'flag-outline', action: () => setShowGoalsModal(true) },
    { label: 'Change AI Coach', icon: 'chatbubble-ellipses-outline', action: () => navigation.navigate('TrainerSelection') },
    { label: 'Workout History', icon: 'time-outline', action: () => navigation.navigate('WorkoutHistory') },
    { label: 'Progress Photos', icon: 'camera-outline', action: () => navigation.navigate('ProgressPhotos') },
    { label: 'Measurements', icon: 'resize-outline', action: () => navigation.navigate('EnhancedMeasurements') },
    { label: 'Download Workouts', icon: 'cloud-download-outline', action: () => navigation.navigate('WorkoutDownloads') },
    { label: 'Export Data', icon: 'download-outline', action: () => handleExportData() },
  ];

  const fitnessGoals = [
    'Weight Loss', 'Muscle Gain', 'Endurance', 'Strength', 
    'Flexibility', 'General Fitness', 'Rehabilitation', 'Sport Specific'
  ];

  const handleSaveProfile = async () => {
    try {
      // Update the user in the auth store
      const updatedUser = {
        ...user!,
        name: editName,
        email: editEmail
      };
      
      // Update in AsyncStorage and auth store
      await useAuthStore.getState().login(updatedUser);
      
      Alert.alert('Success', 'Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSaveGoals = () => {
    // TODO: Implement actual goals update
    Alert.alert('Success', 'Fitness goals updated successfully!');
    setShowGoalsModal(false);
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Hevy Format', onPress: () => exportToHevy() },
        { text: 'JSON Format', onPress: () => exportToJSON() },
      ]
    );
  };

  const exportToHevy = async () => {
    try {
      const csvData = await workoutTrackingService.exportToHevyFormat();
      const fileName = `fitness_data_hevy_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvData);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', 'Data exported to device storage');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const exportToJSON = async () => {
    try {
      const data = await workoutTrackingService.exportWorkoutData();
      const fileName = `fitness_data_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', 'Data exported to device storage');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            // Navigation should be handled by AppNavigator auth state change
          }
        }
      ]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerButton}>
              <Icon name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
              <Icon name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LiquidGlassView>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollAnimation } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Profile Info */}
        <LiquidCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Icon name="person" size={40} color="white" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.email?.split('@')[0] || 'Fitness Enthusiast'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.memberSince}>Member since {new Date().getFullYear()}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editButton}>
              <Icon name="pencil" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </LiquidCard>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {profileStats.map((stat, index) => (
              <Animated.View
                key={index}
                style={[
                  {
                    opacity: statsAnimation,
                    transform: [{
                      translateY: statsAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      })
                    }, {
                      scale: statsAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      })
                    }]
                  }
                ]}
              >
                <LiquidCard style={styles.statCard}>
                  <Icon name={stat.icon} size={24} color={stat.color} style={styles.statIcon} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LiquidCard>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Profile & Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={item.action}
              activeOpacity={0.7}
              style={styles.menuTouchable}
            >
              <LiquidCard style={styles.menuItem} >
                <View style={styles.menuItemContent}>
                  <Icon name={item.icon} size={20} color="white" />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <Icon name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
                </View>
              </LiquidCard>
            </TouchableOpacity>
          ))}
        </View>

      </Animated.ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LiquidCard style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              
              <LiquidInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Display Name"
                style={styles.modalInput}
              />
              
              <LiquidInput
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Email"
                style={styles.modalInput}
              />
              
              <View style={styles.modalButtons}>
                <LiquidButton
                  label="Cancel"
                  variant="secondary"
                  size="medium"
                  onPress={() => setShowEditModal(false)}
                  style={styles.modalButton}
                />
                
                <LiquidButton
                  label="Save"
                  variant="primary"
                  size="medium"
                  onPress={handleSaveProfile}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </LiquidCard>
        </View>
      </Modal>

      {/* Goals Modal */}
      <Modal visible={showGoalsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LiquidCard style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Fitness Goals</Text>
              <Text style={styles.modalSubtitle}>Select your fitness goals</Text>
              
              <View style={styles.goalsGrid}>
                {fitnessGoals.map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalItem,
                      selectedGoals.includes(goal) && styles.goalItemSelected
                    ]}
                    onPress={() => toggleGoal(goal)}
                  >
                    <Text style={[
                      styles.goalText,
                      selectedGoals.includes(goal) && styles.goalTextSelected
                    ]}>
                      {goal}
                    </Text>
                    {selectedGoals.includes(goal) && (
                      <Icon name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.modalButtons}>
                <LiquidButton
                  label="Cancel"
                  variant="secondary"
                  size="medium"
                  onPress={() => setShowGoalsModal(false)}
                  style={styles.modalButton}
                />
                
                <LiquidButton
                  label="Save Goals"
                  variant="primary"
                  size="medium"
                  onPress={handleSaveGoals}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </LiquidCard>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
  },
  profileCard: {
    marginBottom: 30,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 2,
  },
  memberSince: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuItem: {
    marginBottom: 8,
  },
  menuTouchable: {
    marginBottom: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  goalItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalItemSelected: {
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.5)',
  },
  goalText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  goalTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default LiquidProfileScreen;