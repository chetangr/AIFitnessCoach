import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useAuthStore } from '../store/authStore';
// import measurementsService from '../services/measurementsService';
import { 
  LiquidGlassView, 
  LiquidButton, 
  LiquidCard,
  LiquidEmptyState,
  LiquidLoading,
} from '../components/glass';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface LiquidMeasurementsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

interface Measurement {
  id: string;
  value: number;
  unit: string;
  date: string;
}

interface MeasurementType {
  id: string;
  name: string;
  icon: string;
  unit: string;
  color: string;
  currentValue?: number;
  previousValue?: number;
  measurements: Measurement[];
}

const LiquidMeasurementsScreen: React.FC<LiquidMeasurementsScreenProps> = ({ navigation }) => {
  // const { user } = useAuthStore();
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([
    {
      id: 'weight',
      name: 'Weight',
      icon: 'scale-outline',
      unit: 'kg',
      color: '#007AFF',
      measurements: [],
    },
    {
      id: 'body-fat',
      name: 'Body Fat',
      icon: 'body-outline',
      unit: '%',
      color: '#FF9500',
      measurements: [],
    },
    {
      id: 'muscle-mass',
      name: 'Muscle Mass',
      icon: 'fitness-outline',
      unit: 'kg',
      color: '#4CD964',
      measurements: [],
    },
    {
      id: 'chest',
      name: 'Chest',
      icon: 'man-outline',
      unit: 'cm',
      color: '#FF3B30',
      measurements: [],
    },
    {
      id: 'waist',
      name: 'Waist',
      icon: 'resize-outline',
      unit: 'cm',
      color: '#5856D6',
      measurements: [],
    },
    {
      id: 'arms',
      name: 'Arms',
      icon: 'hand-left-outline',
      unit: 'cm',
      color: '#FF2D55',
      measurements: [],
    },
  ]);

  const [selectedType, setSelectedType] = useState<MeasurementType>(measurementTypes[0]);
  const [isAddingMeasurement, setIsAddingMeasurement] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    setIsLoading(true);
    try {
      // const data = await measurementsService.getMeasurements(user?.id || '');
      // Update measurement types with loaded data
      // This would be properly integrated with the backend
    } catch (error) {
      console.error('Error loading measurements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeasurements();
    setRefreshing(false);
  };

  const addMeasurement = async () => {
    if (!newValue || isNaN(parseFloat(newValue))) {
      Alert.alert(
        'Invalid Value',
        'Please enter a valid number'
      );
      return;
    }

    try {
      const measurement: Measurement = {
        id: Date.now().toString(),
        value: parseFloat(newValue),
        unit: selectedType.unit,
        date: new Date().toISOString(),
      };

      // Update local state
      const updatedTypes = measurementTypes.map(type => {
        if (type.id === selectedType.id) {
          return {
            ...type,
            currentValue: measurement.value,
            previousValue: type.currentValue,
            measurements: [measurement, ...type.measurements],
          };
        }
        return type;
      });

      setMeasurementTypes(updatedTypes);
      setSelectedType(updatedTypes.find(t => t.id === selectedType.id)!);
      setNewValue('');
      setIsAddingMeasurement(false);

      // Save to backend
      // TODO: Save to backend
      // await measurementsService.addMeasurement(user?.id || '', {
      //   type: selectedType.id,
      //   value: measurement.value,
      //   unit: measurement.unit,
      // });

      Alert.alert(
        'Success',
        'Measurement added successfully'
      );
    } catch (error) {
      console.error('Error adding measurement:', error);
      Alert.alert(
        'Error',
        'Failed to add measurement'
      );
    }
  };

  const getChartData = () => {
    const measurements = selectedType.measurements.slice(0, 7).reverse();
    
    if (measurements.length < 2) {
      return null;
    }

    return {
      labels: measurements.map((m, index) => {
        if (index === 0) return 'Start';
        if (index === measurements.length - 1) return 'Now';
        return '';
      }),
      datasets: [{
        data: measurements.map(m => m.value),
        color: (opacity = 1) => selectedType.color,
        strokeWidth: 3,
      }],
    };
  };

  const getChangePercentage = (current?: number, previous?: number) => {
    if (!current || !previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const renderMeasurementType = (type: MeasurementType) => {
    const isSelected = selectedType.id === type.id;
    const change = getChangePercentage(type.currentValue, type.previousValue);

    return (
      <TouchableOpacity
        key={type.id}
        onPress={() => setSelectedType(type)}
        activeOpacity={0.8}
      >
        <LiquidCard 
          style={[
            styles.typeCard,
            ...(isSelected ? [styles.typeCardSelected] : [])
          ] as any}
        >
          <View style={[styles.typeIcon, { backgroundColor: type.color + '20' }]}>
            <Icon name={type.icon} size={24} color={type.color} />
          </View>
          
          <Text style={styles.typeName}>{type.name}</Text>
          
          {type.currentValue && (
            <>
              <Text style={styles.typeValue}>
                {type.currentValue} {type.unit}
              </Text>
              {change !== null && (
                <View style={styles.changeContainer}>
                  <Icon 
                    name={change >= 0 ? 'trending-up' : 'trending-down'} 
                    size={16} 
                    color={change >= 0 ? '#4CD964' : '#FF3B30'} 
                  />
                  <Text style={[
                    styles.changeText,
                    { color: change >= 0 ? '#4CD964' : '#FF3B30' }
                  ]}>
                    {Math.abs(change).toFixed(1)}%
                  </Text>
                </View>
              )}
            </>
          )}
        </LiquidCard>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LiquidLoading message="Loading measurements..." />;
  }

  const chartData = getChartData();

  return (
    <LiquidGlassView style={styles.container} intensity={95}>
      {/* Header */}
      <LiquidGlassView style={styles.header} intensity={90}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Measurements</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ProgressPhotos')}
          style={styles.photosButton}
        >
          <Icon name="camera-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </LiquidGlassView>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFF"
          />
        }
      >
        {/* Measurement Types Grid */}
        <View style={styles.typesGrid}>
          {measurementTypes.map(renderMeasurementType)}
        </View>

        {/* Selected Measurement Details */}
        <LiquidCard style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View>
              <Text style={styles.detailsTitle}>{selectedType.name}</Text>
              <Text style={styles.detailsSubtitle}>
                Track your {selectedType.name.toLowerCase()} over time
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsAddingMeasurement(true)}
              style={styles.addButton}
            >
              <Icon name="add-circle" size={32} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Add Measurement Form */}
          {isAddingMeasurement && (
            <View style={styles.addForm}>
              <LiquidGlassView style={styles.inputContainer} intensity={70}>
                <TextInput
                  value={newValue}
                  onChangeText={setNewValue}
                  placeholder={`Enter ${selectedType.name.toLowerCase()} (${selectedType.unit})`}
                  keyboardType="numeric"
                  autoFocus
                  style={{ color: '#FFF', fontSize: 16 }}
                  placeholderTextColor="#AAA"
                />
              </LiquidGlassView>
              <View style={styles.addActions}>
                <LiquidButton
                  label="Cancel"
                  onPress={() => {
                    setIsAddingMeasurement(false);
                    setNewValue('');
                  }}
                  variant="secondary"
                  style={styles.addActionButton}
                />
                <LiquidButton
                  label="Save"
                  onPress={addMeasurement}
                  style={styles.addActionButton}
                />
              </View>
            </View>
          )}

          {/* Chart */}
          {chartData && (
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={width - 64}
                height={200}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.5})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: selectedType.color,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          )}

          {/* Recent Measurements */}
          {selectedType.measurements.length > 0 ? (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recent Measurements</Text>
              {selectedType.measurements.slice(0, 5).map((measurement, index) => (
                <View key={measurement.id} style={styles.measurementRow}>
                  <Text style={styles.measurementDate}>
                    {new Date(measurement.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.measurementValue}>
                    {measurement.value} {measurement.unit}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <LiquidEmptyState
              icon="analytics-outline"
              title="No Measurements Yet"
              message={`Start tracking your ${selectedType.name.toLowerCase()} to see progress`}
            />
          )}
        </LiquidCard>

        {/* Quick Stats */}
        <LiquidCard style={styles.statsCard}>
          <Text style={styles.statsTitle}>Body Composition</Text>
          <View style={styles.statsGrid}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>BMI</Text>
              <Text style={styles.statValue}>
                {measurementTypes[0].currentValue && measurementTypes[0].currentValue > 0
                  ? (measurementTypes[0].currentValue / (170 / 100) ** 2).toFixed(1)
                  : '—'}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total Change</Text>
              <Text style={styles.statValue}>
                {measurementTypes[0].currentValue && measurementTypes[0].measurements.length > 0
                  ? `${(measurementTypes[0].currentValue - measurementTypes[0].measurements[measurementTypes[0].measurements.length - 1].value).toFixed(1)} kg`
                  : '—'}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Goal</Text>
              <Text style={styles.statValue}>{'—'} kg</Text>
            </View>
          </View>
        </LiquidCard>
      </ScrollView>
    </LiquidGlassView>
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
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  photosButton: {
    padding: 8,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingBottom: 0,
  },
  typeCard: {
    width: (width - 48) / 2,
    padding: 16,
    margin: 4,
    alignItems: 'center',
  },
  typeCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  typeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
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
  detailsCard: {
    margin: 16,
    padding: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  detailsSubtitle: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 4,
  },
  addButton: {
    padding: 4,
  },
  addForm: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
    padding: 12,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addActionButton: {
    flex: 0.48,
  },
  chartContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  recentSection: {
    marginTop: 20,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  measurementDate: {
    fontSize: 14,
    color: '#AAA',
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default LiquidMeasurementsScreen;