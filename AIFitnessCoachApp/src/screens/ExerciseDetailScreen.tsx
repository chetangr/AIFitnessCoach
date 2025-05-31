import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppLogger } from '../../utils/logger';

const { width } = Dimensions.get('window');

const ExerciseDetailScreen = ({ route, navigation }: any) => {
  const { exercise } = route.params || {};

  if (!exercise) {
    return null;
  }

  const handleAddToWorkout = () => {
    AppLogger.workout('Exercise Added to Workout', exercise);
    // Add to workout logic
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="bookmark-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Exercise Info */}
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseCategory}>{exercise.category}</Text>
        </View>

        {/* Main Image */}
        <BlurView intensity={20} tint="light" style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Icon name="image-outline" size={100} color="rgba(255,255,255,0.5)" />
          </View>
        </BlurView>

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <BlurView intensity={25} tint="light" style={styles.infoCard}>
            <Icon name="body" size={24} color="white" />
            <Text style={styles.infoLabel}>Muscles</Text>
            <Text style={styles.infoValue}>{exercise.muscles?.join(', ') || 'Multiple'}</Text>
          </BlurView>
          
          <BlurView intensity={25} tint="light" style={styles.infoCard}>
            <Icon name="barbell" size={24} color="white" />
            <Text style={styles.infoLabel}>Equipment</Text>
            <Text style={styles.infoValue}>{exercise.equipment || 'None'}</Text>
          </BlurView>
          
          <BlurView intensity={25} tint="light" style={styles.infoCard}>
            <Icon name="speedometer" size={24} color="white" />
            <Text style={styles.infoLabel}>Level</Text>
            <Text style={styles.infoValue}>{exercise.difficulty || 'All Levels'}</Text>
          </BlurView>
        </View>

        {/* Instructions */}
        <BlurView intensity={20} tint="light" style={styles.section}>
          <Text style={styles.sectionTitle}>How to Perform</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instruction}>1. Start in the proper position with correct form</Text>
            <Text style={styles.instruction}>2. Engage your core throughout the movement</Text>
            <Text style={styles.instruction}>3. Perform the movement in a controlled manner</Text>
            <Text style={styles.instruction}>4. Return to starting position</Text>
            <Text style={styles.instruction}>5. Repeat for desired number of repetitions</Text>
          </View>
        </BlurView>

        {/* Tips */}
        <BlurView intensity={20} tint="light" style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tip}>
              <Icon name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>Focus on proper form over heavy weight</Text>
            </View>
            <View style={styles.tip}>
              <Icon name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>Breathe properly throughout the movement</Text>
            </View>
            <View style={styles.tip}>
              <Icon name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>Start with lighter weight to master the technique</Text>
            </View>
          </View>
        </BlurView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleAddToWorkout}
          >
            <Icon name="add-circle" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Add to Workout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Icon name="play-circle" size={24} color="#667eea" />
            <Text style={styles.secondaryButtonText}>Watch Tutorial</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
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
  exerciseInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  exerciseCategory: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  imageContainer: {
    marginHorizontal: 20,
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickInfo: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
  },
  infoValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instruction: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
  },
  tipsList: {
    gap: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    flex: 1,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 22,
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ExerciseDetailScreen;