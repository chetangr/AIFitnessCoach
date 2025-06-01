import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { VisionGlass } from './VisionGlass';
import { FloatingElement } from './FloatingElement';

const { width, height } = Dimensions.get('window');

interface SpatialAICoachProps {
  isVisible?: boolean;
  currentMessage?: string;
  isThinking?: boolean;
  onAvatarPress?: () => void;
  personality?: 'supportive' | 'motivational' | 'analytical';
}

export const SpatialAICoach: React.FC<SpatialAICoachProps> = ({
  isVisible = true,
  currentMessage,
  isThinking = false,
  onAvatarPress,
  personality = 'supportive',
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [contextualTips] = useState<string[]>([]);

  // Animation values
  const avatarScale = useSharedValue(1);
  const avatarRotation = useSharedValue(0);
  const messageOpacity = useSharedValue(0);
  const thinkingDots = useSharedValue(0);
  const orbitRadius = useSharedValue(50);

  useEffect(() => {
    if (currentMessage) {
      setShowMessage(true);
      messageOpacity.value = withSpring(1);
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        messageOpacity.value = withTiming(0, {}, () => {
          runOnJS(setShowMessage)(false);
        });
      }, 5000);
    }
  }, [currentMessage]);

  useEffect(() => {
    if (isThinking) {
      thinkingDots.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      thinkingDots.value = withTiming(0);
    }
  }, [isThinking]);

  useEffect(() => {
    // Continuous gentle floating
    avatarScale.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );

    avatarRotation.value = withRepeat(
      withTiming(5, { duration: 4000 }),
      -1,
      true
    );

    orbitRadius.value = withRepeat(
      withTiming(60, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const getPersonalityConfig = () => {
    switch (personality) {
      case 'supportive':
        return {
          avatar: '🤗',
          colors: ['rgba(76,175,80,0.8)', 'rgba(139,195,74,0.6)'] as const,
          accentColor: '#4CAF50',
        };
      case 'motivational':
        return {
          avatar: '💪',
          colors: ['rgba(255,87,34,0.8)', 'rgba(255,152,0,0.6)'] as const,
          accentColor: '#FF5722',
        };
      case 'analytical':
        return {
          avatar: '🧠',
          colors: ['rgba(63,81,181,0.8)', 'rgba(103,58,183,0.6)'] as const,
          accentColor: '#3F51B5',
        };
    }
  };

  const config = getPersonalityConfig();

  // Floating avatar style
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: avatarScale.value },
      { rotate: `${avatarRotation.value}deg` },
    ],
  }));

  // Message bubble style
  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [
      {
        scale: interpolate(
          messageOpacity.value,
          [0, 1],
          [0.8, 1]
        ),
      },
    ],
  }));

  // Thinking indicator style
  const thinkingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(thinkingDots.value, [0, 1], [0.3, 1]),
    transform: [
      {
        scale: interpolate(thinkingDots.value, [0, 1], [1, 1.2]),
      },
    ],
  }));

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Main AI Avatar */}
      <FloatingElement
        variant="pronounced"
        depth={1}
        floatRange={15}
        initialPosition={{ x: width - 100, y: height / 2 - 100 }}
      >
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
          <Animated.View style={[styles.avatar, avatarStyle]}>
            <VisionGlass
              variant="thick"
              depth={1}
              floating
              interactive
              borderRadius={35}
            >
              <LinearGradient
                colors={config.colors}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarEmoji}>{config.avatar}</Text>
                
                {/* Pulse ring */}
                <View style={[styles.pulseRing, { borderColor: config.accentColor }]} />
                
                {/* Status indicator */}
                <View style={[styles.statusDot, { backgroundColor: config.accentColor }]} />
              </LinearGradient>
            </VisionGlass>
          </Animated.View>
        </TouchableOpacity>
      </FloatingElement>

      {/* Thinking Indicator */}
      {isThinking && (
        <FloatingElement
          variant="subtle"
          depth={2}
          initialPosition={{ x: width - 150, y: height / 2 - 150 }}
        >
          <Animated.View style={[styles.thinkingBubble, thinkingStyle]}>
            <VisionGlass variant="ultraThin" borderRadius={20}>
              <View style={styles.thinkingDots}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </VisionGlass>
          </Animated.View>
        </FloatingElement>
      )}

      {/* Floating Message */}
      {showMessage && currentMessage && (
        <FloatingElement
          variant="subtle"
          depth={2}
          initialPosition={{ x: width - 280, y: height / 2 - 80 }}
        >
          <Animated.View style={[styles.messageBubble, messageStyle]}>
            <VisionGlass variant="light" depth={2} floating>
              <View style={styles.messageContent}>
                <Text style={styles.messageText}>{currentMessage}</Text>
                <View style={[styles.messageArrow, { borderTopColor: 'rgba(255,255,255,0.2)' }]} />
              </View>
            </VisionGlass>
          </Animated.View>
        </FloatingElement>
      )}

      {/* Contextual Tips Orbiting Around Avatar */}
      {contextualTips.map((tip, index) => (
        <FloatingElement
          key={index}
          variant="orbital"
          depth={3}
          floatRange={80 + index * 20}
          initialPosition={{ x: width - 100, y: height / 2 - 100 }}
        >
          <VisionGlass variant="ultraThin" borderRadius={8}>
            <Text style={styles.tipText}>{tip}</Text>
          </VisionGlass>
        </FloatingElement>
      ))}

      {/* Energy Particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <FloatingElement
          key={i}
          variant="orbital"
          depth={4}
          floatRange={100 + i * 10}
          initialPosition={{ x: width - 100, y: height / 2 - 100 }}
        >
          <View
            style={[
              styles.energyParticle,
              {
                backgroundColor: config.accentColor,
                opacity: 0.6 - i * 0.1,
              },
            ]}
          />
        </FloatingElement>
      ))}
    </View>
  );
};

// Hook for managing AI coach interactions
export const useSpatialAICoach = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | undefined>();
  const [isThinking, setIsThinking] = useState(false);

  const showCoach = () => setIsVisible(true);
  const hideCoach = () => setIsVisible(false);
  
  const sendMessage = (message: string) => {
    setCurrentMessage(message);
  };

  const startThinking = () => setIsThinking(true);
  const stopThinking = () => setIsThinking(false);

  const showContextualTip = (tip: string) => {
    // Implementation for contextual tips
    console.log('Contextual tip:', tip);
  };

  return {
    isVisible,
    currentMessage,
    isThinking,
    showCoach,
    hideCoach,
    sendMessage,
    startThinking,
    stopThinking,
    showContextualTip,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  avatar: {
    width: 70,
    height: 70,
  },
  avatarGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    opacity: 0.3,
  },
  statusDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  thinkingBubble: {
    padding: 8,
  },
  thinkingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 2,
  },
  messageBubble: {
    maxWidth: 200,
  },
  messageContent: {
    padding: 12,
    position: 'relative',
  },
  messageText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 18,
  },
  messageArrow: {
    position: 'absolute',
    right: -8,
    top: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'rgba(255,255,255,0.2)',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  tipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    padding: 4,
  },
  energyParticle: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});