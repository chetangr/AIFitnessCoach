import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { VisionGlass } from '../components/spatial/VisionGlass';

interface SimpleExerciseDetailScreenProps {
  route?: {
    params?: {
      exercise?: any;
    };
  };
  navigation?: any;
}

const SimpleExerciseDetailScreen: React.FC<SimpleExerciseDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { exercise } = route?.params || {};
  const [currentView, setCurrentView] = useState('instructions');

  const renderContent = () => {
    switch (currentView) {
      case 'instructions':
        return (
          <VisionGlass variant="light" style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Exercise Instructions</Text>
            
            <View style={styles.stepContainer}>
              {[
                'Start in a plank position with hands shoulder-width apart',
                'Lower your body until chest nearly touches the floor',
                'Push back up to starting position with control',
                'Keep your core engaged throughout the movement',
                'Maintain a straight line from head to heels'
              ].map((step, index) => (
                <View key={index} style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.safetyContainer}>
              <Icon name="shield-checkmark-outline" size={20} color="#4CAF50" />
              <Text style={styles.safetyTitle}>Safety Tips</Text>
            </View>
            
            <Text style={styles.safetyText}>
              • Stop if you feel pain in wrists, shoulders, or back{'\n'}
              • Modify on knees if full push-ups are too difficult{'\n'}
              • Focus on form over speed or quantity
            </Text>
          </VisionGlass>
        );
      
      case 'variations':
        return (
          <VisionGlass variant="light" style={styles.variationsContainer}>
            <Text style={styles.variationsTitle}>Exercise Variations</Text>
            
            {[
              { name: 'Knee Push-ups', difficulty: 'Beginner', description: 'Perform on knees for reduced difficulty' },
              { name: 'Incline Push-ups', difficulty: 'Beginner', description: 'Hands elevated on bench or step' },
              { name: 'Diamond Push-ups', difficulty: 'Advanced', description: 'Hands form diamond shape for tricep focus' },
              { name: 'One-arm Push-ups', difficulty: 'Expert', description: 'Single arm variation for advanced users' }
            ].map((variation, index) => (
              <View key={index} style={styles.variationCard}>
                <VisionGlass variant="ultraThin" style={styles.variationContent}>
                  <View style={styles.variationHeader}>
                    <Text style={styles.variationName}>{variation.name}</Text>
                    <View style={[styles.difficultyBadge, {
                      backgroundColor: 
                        variation.difficulty === 'Beginner' ? '#4CAF50' :
                        variation.difficulty === 'Advanced' ? '#FF9800' :
                        '#F44336'
                    }]}>
                      <Text style={styles.difficultyText}>{variation.difficulty}</Text>
                    </View>
                  </View>
                  <Text style={styles.variationDescription}>{variation.description}</Text>
                </VisionGlass>
              </View>
            ))}
          </VisionGlass>
        );
      
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <VisionGlass variant="thick" interactive>
            <Icon name="arrow-back" size={24} color="white" />
          </VisionGlass>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {exercise?.name || 'Push-ups'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Full Exercise Guide
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['instructions', 'variations'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setCurrentView(tab)}
            style={styles.tabButton}
          >
            <VisionGlass
              variant={currentView === tab ? "thick" : "ultraThin"}
              interactive
              style={styles.tabButtonContent}
            >
              <Icon
                name={tab === 'instructions' ? 'list-outline' : 'fitness-outline'}
                size={16}
                color={currentView === tab ? '#667eea' : 'rgba(255,255,255,0.7)'}
              />
              <Text style={[
                styles.tabButtonText,
                currentView === tab && styles.tabButtonTextActive
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </VisionGlass>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {renderContent()}
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.startButton}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.startButtonGradient}
          >
            <Icon name="play" size={24} color="white" />
            <Text style={styles.startButtonText}>Start Exercise</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    marginRight: 12,
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginLeft: 6,
  },
  tabButtonTextActive: {
    color: '#667eea',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  instructionsContainer: {
    padding: 20,
    borderRadius: 16,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepContainer: {
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  safetyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  safetyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
  },
  variationsContainer: {
    padding: 20,
    borderRadius: 16,
  },
  variationsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  variationCard: {
    marginBottom: 12,
  },
  variationContent: {
    padding: 16,
  },
  variationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  variationName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  variationDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 16,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SimpleExerciseDetailScreen;