import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface Trainer {
  id: string;
  name: string;
  personality: 'aggressive' | 'supportive' | 'steady';
  avatar: string;
  description: string;
  specialties: string[];
  catchphrase: string;
  color: string;
}

const trainers: Trainer[] = [
  {
    id: '1',
    name: 'Sergeant Steel',
    personality: 'aggressive',
    avatar: '💪',
    description: 'Former military drill instructor who will push you beyond your limits.',
    specialties: ['Strength Training', 'HIIT', 'Mental Toughness'],
    catchphrase: 'Pain is weakness leaving the body!',
    color: '#FF6B6B',
  },
  {
    id: '2',
    name: 'Coach Maya',
    personality: 'supportive',
    avatar: '🤗',
    description: 'Encouraging mentor who celebrates every small victory with you.',
    specialties: ['Yoga', 'Recovery', 'Mind-Body Connection'],
    catchphrase: 'You\'re stronger than you think!',
    color: '#4ECDC4',
  },
  {
    id: '3',
    name: 'Dr. Pace',
    personality: 'steady',
    avatar: '🧘',
    description: 'Sports scientist focused on sustainable, long-term progress.',
    specialties: ['Endurance', 'Form', 'Progressive Overload'],
    catchphrase: 'Consistency beats perfection.',
    color: '#667EEA',
  },
];

const TrainerSelectionScreen = ({ navigation }: any) => {
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const selectTrainer = async (trainer: Trainer) => {
    setSelectedTrainer(trainer.id);
    
    // Save selected trainer
    await AsyncStorage.setItem('selectedTrainer', JSON.stringify(trainer));
    
    // Animate selection
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('Messages', { 
        newTrainer: trainer,
        showIntroduction: true 
      });
    });
  };

  const renderTrainerCard = (trainer: Trainer, index: number) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const cardFadeAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    }, []);

    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '2deg'],
    });

    return (
      <Animated.View
        key={trainer.id}
        style={[
          styles.trainerCardContainer,
          {
            opacity: cardFadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => selectTrainer(trainer)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[trainer.color, trainer.color + 'CC']}
            style={styles.trainerGradient}
          >
            <BlurView intensity={20} tint="light" style={styles.trainerCard}>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>{trainer.avatar}</Text>
              </View>

              {/* Trainer Info */}
              <Text style={styles.trainerName}>{trainer.name}</Text>
              <Text style={styles.trainerPersonality}>
                {trainer.personality.charAt(0).toUpperCase() + trainer.personality.slice(1)} Coach
              </Text>
              
              <Text style={styles.trainerDescription}>{trainer.description}</Text>

              {/* Specialties */}
              <View style={styles.specialtiesContainer}>
                {trainer.specialties.map((specialty, idx) => (
                  <BlurView
                    key={idx}
                    intensity={30}
                    tint="light"
                    style={styles.specialtyBadge}
                  >
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </BlurView>
                ))}
              </View>

              {/* Catchphrase */}
              <View style={styles.catchphraseContainer}>
                <Icon name="chatbubble-outline" size={16} color="white" />
                <Text style={styles.catchphrase}>"{trainer.catchphrase}"</Text>
              </View>

              {/* Select Button */}
              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Choose {trainer.name}</Text>
                <Icon name="arrow-forward" size={20} color={trainer.color} />
              </View>
            </BlurView>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Choose Your Coach</Text>
          <Text style={styles.subtitle}>
            Select a training personality that matches your style
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={width - 40}
        decelerationRate="fast"
      >
        {trainers.map((trainer, index) => renderTrainerCard(trainer, index))}
      </ScrollView>

      {/* Page Indicator */}
      <View style={styles.pageIndicator}>
        {trainers.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              selectedTrainer === trainers[index].id && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Skip Option */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate('Messages')}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  trainerCardContainer: {
    width: width - 40,
    height: height * 0.65,
    paddingHorizontal: 10,
  },
  trainerGradient: {
    flex: 1,
    borderRadius: 30,
    padding: 2,
  },
  trainerCard: {
    flex: 1,
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    fontSize: 60,
  },
  trainerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  trainerPersonality: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  trainerDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  specialtyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    overflow: 'hidden',
  },
  specialtyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  catchphraseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  catchphrase: {
    fontSize: 18,
    color: 'white',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  selectButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 24,
  },
  skipButton: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
});

export default TrainerSelectionScreen;