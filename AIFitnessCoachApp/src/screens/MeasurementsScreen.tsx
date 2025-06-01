import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';

const MeasurementsScreen = ({ navigation }: any) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    type: '',
    value: '',
    unit: 'inches',
  });

  const [measurements] = useState([
    {
      id: 1,
      type: 'Weight',
      current: 175,
      previous: 180,
      unit: 'lbs',
      change: -5,
      date: '2024-05-30',
    },
    {
      id: 2,
      type: 'Body Fat',
      current: 15.2,
      previous: 16.8,
      unit: '%',
      change: -1.6,
      date: '2024-05-30',
    },
    {
      id: 3,
      type: 'Chest',
      current: 42,
      previous: 40.5,
      unit: 'inches',
      change: 1.5,
      date: '2024-05-30',
    },
    {
      id: 4,
      type: 'Waist',
      current: 32,
      previous: 34,
      unit: 'inches',
      change: -2,
      date: '2024-05-30',
    },
    {
      id: 5,
      type: 'Arms',
      current: 15.5,
      previous: 14.8,
      unit: 'inches',
      change: 0.7,
      date: '2024-05-30',
    },
    {
      id: 6,
      type: 'Thighs',
      current: 24,
      previous: 23.2,
      unit: 'inches',
      change: 0.8,
      date: '2024-05-30',
    },
  ]);

  const measurementTypes = [
    'Weight', 'Body Fat', 'Chest', 'Waist', 'Arms', 'Thighs', 'Hips', 'Neck'
  ];

  const handleAddMeasurement = () => {
    if (!newMeasurement.type || !newMeasurement.value) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    Alert.alert('Success', 'Measurement added successfully!');
    setShowAddModal(false);
    setNewMeasurement({ type: '', value: '', unit: 'inches' });
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#4CAF50'; // Green for positive
    if (change < 0) return '#f5576c'; // Red for negative
    return 'rgba(255,255,255,0.6)'; // Gray for no change
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return 'trending-up';
    if (change < 0) return 'trending-down';
    return 'remove';
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Measurements</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <BlurView intensity={20} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Progress Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>-5 lbs</Text>
              <Text style={styles.summaryLabel}>Weight Change</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>-1.6%</Text>
              <Text style={styles.summaryLabel}>Body Fat</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>+2.3"</Text>
              <Text style={styles.summaryLabel}>Muscle Gain</Text>
            </View>
          </View>
        </BlurView>

        <Text style={styles.sectionTitle}>Current Measurements</Text>
        
        {measurements.map((measurement) => (
          <BlurView key={measurement.id} intensity={20} style={styles.measurementCard}>
            <View style={styles.measurementHeader}>
              <View style={styles.measurementInfo}>
                <Text style={styles.measurementType}>{measurement.type}</Text>
                <Text style={styles.measurementDate}>
                  {new Date(measurement.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.measurementValues}>
                <Text style={styles.currentValue}>
                  {measurement.current} {measurement.unit}
                </Text>
                <View style={styles.changeContainer}>
                  <Icon 
                    name={getChangeIcon(measurement.change)} 
                    size={16} 
                    color={getChangeColor(measurement.change)} 
                  />
                  <Text style={[styles.changeText, { color: getChangeColor(measurement.change) }]}>
                    {measurement.change > 0 ? '+' : ''}{measurement.change} {measurement.unit}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <Text style={styles.progressLabel}>vs. previous: {measurement.previous} {measurement.unit}</Text>
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.abs(measurement.change) * 10}%`,
                      backgroundColor: getChangeColor(measurement.change)
                    }
                  ]} 
                />
              </View>
            </View>
          </BlurView>
        ))}
      </ScrollView>

      {/* Add Measurement Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Measurement</Text>
              
              <Text style={styles.inputLabel}>Measurement Type</Text>
              <View style={styles.typeSelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {measurementTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newMeasurement.type === type && styles.typeButtonSelected
                      ]}
                      onPress={() => setNewMeasurement(prev => ({ ...prev, type }))}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        newMeasurement.type === type && styles.typeButtonTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <Text style={styles.inputLabel}>Value</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter measurement"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={newMeasurement.value}
                onChangeText={(value) => setNewMeasurement(prev => ({ ...prev, value }))}
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Unit</Text>
              <View style={styles.unitSelector}>
                {['inches', 'cm', 'lbs', 'kg', '%'].map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      newMeasurement.unit === unit && styles.unitButtonSelected
                    ]}
                    onPress={() => setNewMeasurement(prev => ({ ...prev, unit }))}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      newMeasurement.unit === unit && styles.unitButtonTextSelected
                    ]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={handleAddMeasurement}
                >
                  <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.saveGradient}>
                    <Text style={styles.saveButtonText}>Add Measurement</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  measurementCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  measurementInfo: {
    flex: 1,
  },
  measurementType: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  measurementDate: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  measurementValues: {
    alignItems: 'flex-end',
  },
  currentValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressBar: {
    marginTop: 8,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginBottom: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeSelector: {
    marginBottom: 20,
  },
  typeButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  typeButtonSelected: {
    backgroundColor: 'rgba(240, 147, 251, 0.3)',
  },
  typeButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  typeButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    color: 'white',
    fontSize: 16,
  },
  unitSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  unitButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  unitButtonSelected: {
    backgroundColor: 'rgba(240, 147, 251, 0.3)',
  },
  unitButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  unitButtonTextSelected: {
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

export default MeasurementsScreen;