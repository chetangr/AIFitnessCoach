import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface Program {
  id: number;
  name: string;
  description: string;
  difficulty_level: string;
  duration_weeks: number;
  category: string;
  target_goals: string[];
  equipment_needed: string[];
  workouts_per_week: number;
  is_public: boolean;
  is_mine: boolean;
  created_at: string;
}

interface ProgramFormData {
  name: string;
  description: string;
  difficulty_level: string;
  duration_weeks: string;
  category: string;
  target_goals: string;
  equipment_needed: string;
  workouts_per_week: string;
  is_public: boolean;
}

const ProgramsScreen = ({ navigation }: any) => {
  const { isDarkMode } = useThemeStore();
  const { getAuthToken } = useAuthStore();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'mine'>('all');
  const [formData, setFormData] = useState<ProgramFormData>({
    name: '',
    description: '',
    difficulty_level: 'intermediate',
    duration_weeks: '4',
    category: 'general',
    target_goals: '',
    equipment_needed: '',
    workouts_per_week: '3',
    is_public: false,
  });

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    // Animate modal appearance
    if (showCreateModal) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [showCreateModal]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/programs/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs);
      } else {
        console.error('Failed to fetch programs');
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      Alert.alert('Error', 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const createProgram = async () => {
    try {
      const token = await getAuthToken();
      
      const programData = {
        name: formData.name,
        description: formData.description,
        difficulty_level: formData.difficulty_level,
        duration_weeks: parseInt(formData.duration_weeks),
        category: formData.category,
        target_goals: formData.target_goals.split(',').map(g => g.trim()).filter(g => g),
        equipment_needed: formData.equipment_needed.split(',').map(e => e.trim()).filter(e => e),
        workouts_per_week: parseInt(formData.workouts_per_week),
        is_public: formData.is_public,
        weekly_schedule: {},
      };

      const response = await fetch(`${API_BASE_URL}/api/programs/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Program created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchPrograms();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to create program');
      }
    } catch (error) {
      console.error('Error creating program:', error);
      Alert.alert('Error', 'Failed to create program');
    }
  };

  const subscribeToProgram = async (programId: number) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/programs/${programId}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Successfully subscribed to program!');
        // Update local storage with active program
        await AsyncStorage.setItem('active_program_id', programId.toString());
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to subscribe to program');
      }
    } catch (error) {
      console.error('Error subscribing to program:', error);
      Alert.alert('Error', 'Failed to subscribe to program');
    }
  };

  const duplicateProgram = async (programId: number) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/programs/${programId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Program duplicated successfully!');
        fetchPrograms();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to duplicate program');
      }
    } catch (error) {
      console.error('Error duplicating program:', error);
      Alert.alert('Error', 'Failed to duplicate program');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      difficulty_level: 'intermediate',
      duration_weeks: '4',
      category: 'general',
      target_goals: '',
      equipment_needed: '',
      workouts_per_week: '3',
      is_public: false,
    });
  };

  const filteredPrograms = selectedTab === 'mine' 
    ? programs.filter(p => p.is_mine)
    : programs;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const gradientColors = isDarkMode 
    ? ['#0f0c29', '#302b63', '#24243e'] as const
    : ['#667eea', '#764ba2', '#f093fb'] as const;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Training Programs</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.createButton}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            All Programs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'mine' && styles.activeTab]}
          onPress={() => setSelectedTab('mine')}
        >
          <Text style={[styles.tabText, selectedTab === 'mine' && styles.activeTabText]}>
            My Programs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Programs List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <ScrollView style={styles.programsList} showsVerticalScrollIndicator={false}>
          {filteredPrograms.map((program) => (
            <TouchableOpacity
              key={program.id}
              onPress={() => navigation.navigate('ProgramDetail', { programId: program.id })}
            >
              <BlurView intensity={20} tint="light" style={styles.programCard}>
                <View style={styles.programHeader}>
                  <Text style={styles.programName}>{program.name}</Text>
                  {program.is_mine && (
                    <View style={styles.myBadge}>
                      <Text style={styles.myBadgeText}>MINE</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.programDescription} numberOfLines={2}>
                  {program.description}
                </Text>
                
                <View style={styles.programMeta}>
                  <View style={styles.metaItem}>
                    <Icon name="calendar" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.metaText}>{program.duration_weeks} weeks</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="barbell" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.metaText}>{program.workouts_per_week}x/week</Text>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(program.difficulty_level) + '30' }]}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(program.difficulty_level) }]}>
                      {program.difficulty_level}
                    </Text>
                  </View>
                </View>

                <View style={styles.programActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => subscribeToProgram(program.id)}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.actionButtonGradient}
                    >
                      <Icon name="play" size={16} color="white" />
                      <Text style={styles.actionButtonText}>Start</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  {!program.is_mine && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => duplicateProgram(program.id)}
                    >
                      <View style={styles.secondaryActionButton}>
                        <Icon name="copy" size={16} color="#667eea" />
                        <Text style={styles.secondaryActionText}>Copy</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Create Program Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <BlurView intensity={100} tint="dark" style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Program</Text>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  style={styles.input}
                  placeholder="Program Name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                />
                
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Duration (weeks)"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={formData.duration_weeks}
                    onChangeText={(text) => setFormData({ ...formData, duration_weeks: text })}
                    keyboardType="numeric"
                  />
                  
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Workouts/week"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={formData.workouts_per_week}
                    onChangeText={(text) => setFormData({ ...formData, workouts_per_week: text })}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.difficultySelector}>
                  <Text style={styles.inputLabel}>Difficulty Level</Text>
                  <View style={styles.difficultyOptions}>
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.difficultyOption,
                          formData.difficulty_level === level && styles.selectedDifficulty,
                        ]}
                        onPress={() => setFormData({ ...formData, difficulty_level: level })}
                      >
                        <Text style={[
                          styles.difficultyOptionText,
                          formData.difficulty_level === level && styles.selectedDifficultyText,
                        ]}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="Target Goals (comma separated)"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.target_goals}
                  onChangeText={(text) => setFormData({ ...formData, target_goals: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Equipment Needed (comma separated)"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.equipment_needed}
                  onChangeText={(text) => setFormData({ ...formData, equipment_needed: text })}
                />
                
                <TouchableOpacity
                  style={styles.publicToggle}
                  onPress={() => setFormData({ ...formData, is_public: !formData.is_public })}
                >
                  <Text style={styles.publicToggleText}>Make Public</Text>
                  <Icon
                    name={formData.is_public ? 'checkbox' : 'square-outline'}
                    size={24}
                    color="#667eea"
                  />
                </TouchableOpacity>
              </ScrollView>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.createProgramButton}
                  onPress={createProgram}
                  disabled={!formData.name || !formData.description}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.createProgramGradient}
                  >
                    <Text style={styles.createProgramText}>Create Program</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  createButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 22,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  programsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  programCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  programName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  myBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  myBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  programDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  programActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#667eea',
    gap: 8,
  },
  secondaryActionText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: 'white',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  difficultySelector: {
    marginBottom: 16,
  },
  difficultyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectedDifficulty: {
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    borderColor: '#667eea',
  },
  difficultyOptionText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  selectedDifficultyText: {
    color: 'white',
  },
  publicToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  publicToggleText: {
    fontSize: 16,
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  createProgramButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createProgramGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createProgramText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ProgramsScreen;