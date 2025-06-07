import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import measurementsService, {
  BodyMeasurement,
  ProgressPhoto,
  MeasurementTrends,
  UserSettings,
} from '../services/measurementsService';

const { width: screenWidth } = Dimensions.get('window');

const MeasurementInput = ({ 
  label, 
  value, 
  onChangeText, 
  unit,
  placeholder = '0'
}: any) => (
  <View style={styles.measurementItem}>
    <Text style={styles.measurementLabel}>{label}</Text>
    <View style={styles.measurementInputContainer}>
      <TextInput
        style={styles.measurementInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.3)"
      />
      <Text style={styles.measurementUnit}>{unit}</Text>
    </View>
  </View>
);

const EnhancedMeasurementsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'measurements' | 'photos' | 'trends'>('measurements');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Measurements state
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');
  const [hips, setHips] = useState('');
  const [neck, setNeck] = useState('');
  const [notes, setNotes] = useState('');
  
  // Data state
  const [latestMeasurement, setLatestMeasurement] = useState<BodyMeasurement | null>(null);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [trends, setTrends] = useState<MeasurementTrends | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user settings
      const settings = await measurementsService.getSettings();
      setUserSettings(settings);
      
      // Load latest measurement
      const latest = await measurementsService.getLatestMeasurement();
      if (latest) {
        setLatestMeasurement(latest);
        // Pre-fill form with latest values
        setWeight(latest.weight?.toString() || '');
        setBodyFat(latest.body_fat_percentage?.toString() || '');
        setWaist(latest.waist_circumference?.toString() || '');
        setChest(latest.chest_circumference?.toString() || '');
        setArms(latest.arm_circumference?.toString() || '');
        setThighs(latest.thigh_circumference?.toString() || '');
        setHips(latest.hip_circumference?.toString() || '');
        setNeck(latest.neck_circumference?.toString() || '');
      }
      
      // Load progress photos
      const photos = await measurementsService.getProgressPhotos();
      setProgressPhotos(photos);
      
      // Load trends
      const trendsData = await measurementsService.getMeasurementTrends();
      setTrends(trendsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMeasurements = async () => {
    try {
      setSaving(true);
      
      const measurement: BodyMeasurement = {
        weight: weight ? parseFloat(weight) : undefined,
        body_fat_percentage: bodyFat ? parseFloat(bodyFat) : undefined,
        waist_circumference: waist ? parseFloat(waist) : undefined,
        chest_circumference: chest ? parseFloat(chest) : undefined,
        arm_circumference: arms ? parseFloat(arms) : undefined,
        thigh_circumference: thighs ? parseFloat(thighs) : undefined,
        hip_circumference: hips ? parseFloat(hips) : undefined,
        neck_circumference: neck ? parseFloat(neck) : undefined,
        notes: notes || undefined,
      };
      
      await measurementsService.createMeasurement(measurement);
      
      Alert.alert('Success', 'Measurements saved successfully!');
      
      // Reload data
      await loadData();
      
      // Clear notes
      setNotes('');
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save measurements');
    } finally {
      setSaving(false);
    }
  };

  const takeProgressPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take progress photos');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      uploadProgressPhoto(result.assets[0]);
    }
  };

  const uploadProgressPhoto = async (photo: any) => {
    Alert.alert(
      'Photo Angle',
      'Select the angle of this photo',
      [
        { text: 'Front', onPress: () => savePhoto(photo, 'front') },
        { text: 'Side', onPress: () => savePhoto(photo, 'side') },
        { text: 'Back', onPress: () => savePhoto(photo, 'back') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const savePhoto = async (photo: any, angle: string) => {
    try {
      setSaving(true);
      
      await measurementsService.uploadProgressPhoto(photo, angle);
      
      Alert.alert('Success', 'Progress photo uploaded successfully!');
      
      // Reload photos
      const photos = await measurementsService.getProgressPhotos();
      setProgressPhotos(photos);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload photo');
    } finally {
      setSaving(false);
    }
  };

  const renderMeasurementsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.measurementsContainer}>
        <Text style={styles.sectionTitle}>Body Measurements</Text>
        
        <MeasurementInput
          label="Weight"
          value={weight}
          onChangeText={setWeight}
          unit={userSettings?.unit_system === 'imperial' ? 'lbs' : 'kg'}
        />
        
        <MeasurementInput
          label="Body Fat"
          value={bodyFat}
          onChangeText={setBodyFat}
          unit="%"
        />
        
        <MeasurementInput
          label="Waist"
          value={waist}
          onChangeText={setWaist}
          unit={userSettings?.unit_system === 'imperial' ? 'in' : 'cm'}
        />
        
        <MeasurementInput
          label="Chest"
          value={chest}
          onChangeText={setChest}
          unit={userSettings?.unit_system === 'imperial' ? 'in' : 'cm'}
        />
        
        <MeasurementInput
          label="Arms"
          value={arms}
          onChangeText={setArms}
          unit={userSettings?.unit_system === 'imperial' ? 'in' : 'cm'}
        />
        
        <MeasurementInput
          label="Thighs"
          value={thighs}
          onChangeText={setThighs}
          unit={userSettings?.unit_system === 'imperial' ? 'in' : 'cm'}
        />
        
        <MeasurementInput
          label="Hips"
          value={hips}
          onChangeText={setHips}
          unit={userSettings?.unit_system === 'imperial' ? 'in' : 'cm'}
        />
        
        <MeasurementInput
          label="Neck"
          value={neck}
          onChangeText={setNeck}
          unit={userSettings?.unit_system === 'imperial' ? 'in' : 'cm'}
        />
        
        <View style={styles.notesContainer}>
          <Text style={styles.measurementLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
          />
        </View>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveMeasurements}
          disabled={saving}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Measurements'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPhotosTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.photosContainer}>
        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={takeProgressPhoto}
        >
          <Icon name="camera" size={32} color="#667eea" />
          <Text style={styles.addPhotoText}>Take Progress Photo</Text>
        </TouchableOpacity>
        
        <View style={styles.photosGrid}>
          {progressPhotos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoItem}
              onPress={() => {
                // TODO: Open photo viewer
              }}
            >
              <Image
                source={{ uri: photo.photo_url }}
                style={styles.photoImage}
              />
              <View style={styles.photoInfo}>
                <Text style={styles.photoAngle}>{photo.angle}</Text>
                <Text style={styles.photoDate}>
                  {new Date(photo.taken_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderTrendsTab = () => {
    if (!trends || trends.weight_trend.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="analytics-outline" size={48} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyText}>No trend data available yet</Text>
          <Text style={styles.emptySubtext}>Add more measurements to see trends</Text>
        </View>
      );
    }

    const chartData = {
      labels: trends.weight_trend.slice(-7).map(d => 
        new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        data: trends.weight_trend.slice(-7).map(d => d.value),
      }],
    };

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.trendsContainer}>
          <Text style={styles.sectionTitle}>Weight Trend</Text>
          
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'rgba(255,255,255,0.05)',
              backgroundGradientTo: 'rgba(255,255,255,0.05)',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#667eea',
              },
            }}
            bezier
            style={styles.chart}
          />
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Change</Text>
              <Text style={[
                styles.statValue,
                trends.total_weight_change > 0 ? styles.statPositive : styles.statNegative
              ]}>
                {trends.total_weight_change > 0 ? '+' : ''}{trends.total_weight_change.toFixed(1)} {userSettings?.unit_system === 'imperial' ? 'lbs' : 'kg'}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Weekly Average</Text>
              <Text style={[
                styles.statValue,
                trends.average_weekly_change > 0 ? styles.statPositive : styles.statNegative
              ]}>
                {trends.average_weekly_change > 0 ? '+' : ''}{trends.average_weekly_change.toFixed(1)} {userSettings?.unit_system === 'imperial' ? 'lbs' : 'kg'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#0f0f1e']} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Body Measurements</Text>
          
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'measurements' && styles.tabActive]}
            onPress={() => setActiveTab('measurements')}
          >
            <Text style={[styles.tabText, activeTab === 'measurements' && styles.tabTextActive]}>
              Measurements
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'photos' && styles.tabActive]}
            onPress={() => setActiveTab('photos')}
          >
            <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>
              Photos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trends' && styles.tabActive]}
            onPress={() => setActiveTab('trends')}
          >
            <Text style={[styles.tabText, activeTab === 'trends' && styles.tabTextActive]}>
              Trends
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'measurements' && renderMeasurementsTab()}
          {activeTab === 'photos' && renderPhotosTab()}
          {activeTab === 'trends' && renderTrendsTab()}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  measurementsContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  measurementItem: {
    marginBottom: 20,
  },
  measurementLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  measurementInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  measurementInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    paddingVertical: 12,
  },
  measurementUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  photosContainer: {
    paddingBottom: 20,
  },
  addPhotoButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(102,126,234,0.3)',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 16,
    color: '#667eea',
    marginTop: 10,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  photoImage: {
    width: '100%',
    height: 200,
  },
  photoInfo: {
    padding: 10,
  },
  photoAngle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  photoDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  trendsContainer: {
    paddingBottom: 20,
  },
  chart: {
    marginVertical: 20,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statPositive: {
    color: '#4CAF50',
  },
  statNegative: {
    color: '#FF6B6B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
});

export default EnhancedMeasurementsScreen;