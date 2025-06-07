import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';
import { workoutTrackingService } from '../services/workoutTrackingService';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const ImprovedProfileScreen = ({ navigation }: any) => {
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

  const profileStats = [
    { label: 'Workouts Completed', value: '24', icon: 'fitness' },
    { label: 'Total Minutes', value: '1,240', icon: 'time' },
    { label: 'Calories Burned', value: '12,500', icon: 'flame' },
    { label: 'Current Streak', value: '7 days', icon: 'trending-up' },
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
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerButton}>
              <Icon name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
              <Icon name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <BlurView intensity={25} style={styles.profileCard}>
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
        </BlurView>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {profileStats.map((stat, index) => (
              <BlurView key={index} intensity={20} style={styles.statCard}>
                <Icon name={stat.icon} size={24} color="white" style={styles.statIcon} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </BlurView>
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
              <BlurView intensity={20} style={styles.menuItem}>
                <View style={styles.menuItemContent}>
                  <Icon name={item.icon} size={20} color="white" />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <Icon name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: '#1a1a2e' }]}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={editName}
                onChangeText={setEditName}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={handleSaveProfile}
                >
                  <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.saveGradient}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Goals Modal */}
      <Modal visible={showGoalsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: '#1a1a2e' }]}>
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
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowGoalsModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={handleSaveGoals}
                >
                  <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.saveGradient}>
                    <Text style={styles.saveButtonText}>Save Goals</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
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
  logoutButton: {
    padding: 8,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    overflow: 'hidden',
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
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    overflow: 'hidden',
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
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
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
  settingsContainer: {
    marginBottom: 20,
  },
  settingItem: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingText: {
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
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 40,
    backgroundColor: '#1a1a2e',
  },
  modalBlur: {
    flex: 1,
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
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: 'white',
    fontSize: 16,
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
    backgroundColor: 'rgba(240, 147, 251, 0.3)',
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
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ImprovedProfileScreen;