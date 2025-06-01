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
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { VisionGlass } from './VisionGlass';
import { FloatingElement } from './FloatingElement';
import { spatialHaptics } from '../../services/spatialHaptics';

const { width, height } = Dimensions.get('window');

interface ContextualInfo {
  id: string;
  content: string;
  type: 'tip' | 'warning' | 'info' | 'success' | 'form' | 'nutrition';
  position: { x: number; y: number };
  targetElement?: string;
  duration?: number; // Auto-hide after duration (ms)
  persistent?: boolean; // Don't auto-hide
  icon?: string;
}

interface ContextualOverlayProps {
  infos: ContextualInfo[];
  onInfoDismiss?: (id: string) => void;
  onInfoTap?: (info: ContextualInfo) => void;
}

export const ContextualOverlay: React.FC<ContextualOverlayProps> = ({
  infos,
  onInfoDismiss,
  onInfoTap,
}) => {
  const [visibleInfos, setVisibleInfos] = useState<ContextualInfo[]>([]);

  useEffect(() => {
    // Show new infos with staggered animation
    infos.forEach((info, index) => {
      if (!visibleInfos.find(vi => vi.id === info.id)) {
        setTimeout(() => {
          setVisibleInfos(prev => [...prev, info]);
          spatialHaptics.aiCoachMessage();
        }, index * 200);
      }
    });

    // Auto-hide infos with duration
    infos.forEach(info => {
      if (info.duration && !info.persistent) {
        setTimeout(() => {
          handleDismiss(info.id);
        }, info.duration);
      }
    });
  }, [infos]);

  const handleDismiss = (id: string) => {
    setVisibleInfos(prev => prev.filter(info => info.id !== id));
    onInfoDismiss?.(id);
  };

  const handleInfoTap = (info: ContextualInfo) => {
    spatialHaptics.floatingElementTouch();
    onInfoTap?.(info);
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {visibleInfos.map((info, index) => (
        <ContextualInfoBubble
          key={info.id}
          info={info}
          index={index}
          onDismiss={() => handleDismiss(info.id)}
          onTap={() => handleInfoTap(info)}
        />
      ))}
    </View>
  );
};

const ContextualInfoBubble: React.FC<{
  info: ContextualInfo;
  index: number;
  onDismiss: () => void;
  onTap: () => void;
}> = ({ info, index, onDismiss, onTap }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(20);

  useEffect(() => {
    // Entrance animation
    opacity.value = withDelay(
      index * 100,
      withTiming(1, { duration: 300 })
    );
    scale.value = withDelay(
      index * 100,
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    translateY.value = withDelay(
      index * 100,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
  }, []);

  const getTypeConfig = () => {
    switch (info.type) {
      case 'tip':
        return {
          colors: ['rgba(76,175,80,0.9)', 'rgba(139,195,74,0.7)'],
          icon: 'bulb-outline',
          borderColor: '#4CAF50',
        };
      case 'warning':
        return {
          colors: ['rgba(255,152,0,0.9)', 'rgba(255,193,7,0.7)'],
          icon: 'warning-outline',
          borderColor: '#FF9800',
        };
      case 'info':
        return {
          colors: ['rgba(33,150,243,0.9)', 'rgba(103,58,183,0.7)'],
          icon: 'information-circle-outline',
          borderColor: '#2196F3',
        };
      case 'success':
        return {
          colors: ['rgba(76,175,80,0.9)', 'rgba(139,195,74,0.7)'],
          icon: 'checkmark-circle-outline',
          borderColor: '#4CAF50',
        };
      case 'form':
        return {
          colors: ['rgba(255,87,34,0.9)', 'rgba(255,152,0,0.7)'],
          icon: 'body-outline',
          borderColor: '#FF5722',
        };
      case 'nutrition':
        return {
          colors: ['rgba(139,69,19,0.9)', 'rgba(205,133,63,0.7)'],
          icon: 'nutrition-outline',
          borderColor: '#8B4513',
        };
      default:
        return {
          colors: ['rgba(102,126,234,0.9)', 'rgba(118,75,162,0.7)'],
          icon: 'help-circle-outline',
          borderColor: '#667eea',
        };
    }
  };

  const config = getTypeConfig();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const exit = () => {
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.8, { duration: 200 });
    translateY.value = withTiming(-20, { duration: 200 }, () => {
      runOnJS(onDismiss)();
    });
  };

  return (
    <Animated.View
      style={[
        styles.infoBubble,
        {
          left: Math.max(20, Math.min(width - 250, info.position.x)),
          top: Math.max(100, Math.min(height - 150, info.position.y)),
        },
        animatedStyle,
      ]}
    >
      <FloatingElement variant="subtle" depth={1}>
        <TouchableOpacity onPress={onTap} activeOpacity={0.9}>
          <VisionGlass
            variant="thick"
            depth={2}
            floating
            interactive
            style={[styles.bubbleContent, { borderColor: config.borderColor }]}
          >
            <View style={styles.bubbleHeader}>
              <Icon name={config.icon} size={16} color="white" />
              <TouchableOpacity onPress={exit} style={styles.closeButton}>
                <Icon name="close" size={14} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.bubbleText}>{info.content}</Text>
            
            {/* Connection line to target element */}
            <View style={[styles.connectionLine, { backgroundColor: config.borderColor }]} />
            
            {/* Pulse indicator for important tips */}
            {info.type === 'form' && (
              <View style={[styles.pulseIndicator, { backgroundColor: config.borderColor }]} />
            )}
          </VisionGlass>
        </TouchableOpacity>
      </FloatingElement>
    </Animated.View>
  );
};

// Hook for managing contextual information
export const useContextualInfo = () => {
  const [infos, setInfos] = useState<ContextualInfo[]>([]);

  const showInfo = (info: Omit<ContextualInfo, 'id'>) => {
    const newInfo: ContextualInfo = {
      ...info,
      id: `info_${Date.now()}_${Math.random()}`,
    };
    setInfos(prev => [...prev, newInfo]);
    return newInfo.id;
  };

  const hideInfo = (id: string) => {
    setInfos(prev => prev.filter(info => info.id !== id));
  };

  const clearAll = () => {
    setInfos([]);
  };

  // Preset info types
  const showTip = (content: string, position: { x: number; y: number }) =>
    showInfo({ content, type: 'tip', position, duration: 5000 });

  const showWarning = (content: string, position: { x: number; y: number }) =>
    showInfo({ content, type: 'warning', position, duration: 8000 });

  const showFormTip = (content: string, position: { x: number; y: number }) =>
    showInfo({ content, type: 'form', position, persistent: true });

  const showNutritionTip = (content: string, position: { x: number; y: number }) =>
    showInfo({ content, type: 'nutrition', position, duration: 6000 });

  const showSuccess = (content: string, position: { x: number; y: number }) =>
    showInfo({ content, type: 'success', position, duration: 3000 });

  return {
    infos,
    showInfo,
    hideInfo,
    clearAll,
    showTip,
    showWarning,
    showFormTip,
    showNutritionTip,
    showSuccess,
  };
};

// Smart contextual info that appears based on user behavior
export const SmartContextualProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const contextualInfo = useContextualInfo();

  // Monitor user behavior and show contextual tips
  useEffect(() => {
    // Example: Show form tips during workouts
    const showFormTips = () => {
      contextualInfo.showFormTip(
        "Keep your core engaged throughout the movement",
        { x: width / 2, y: height * 0.3 }
      );
    };

    // Example: Show nutrition tips after workouts
    const showNutritionTips = () => {
      contextualInfo.showNutritionTip(
        "Don't forget to eat protein within 30 minutes post-workout",
        { x: width * 0.8, y: height * 0.2 }
      );
    };

    // Set up smart triggers
    // These would be connected to actual user actions
    
    return () => {
      contextualInfo.clearAll();
    };
  }, []);

  return (
    <View style={styles.container}>
      {children}
      <ContextualOverlay
        infos={contextualInfo.infos}
        onInfoDismiss={contextualInfo.hideInfo}
        onInfoTap={(info) => {
          // Handle info tap - could navigate to related content
          console.log('Info tapped:', info);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  infoBubble: {
    position: 'absolute',
    maxWidth: 220,
    zIndex: 1001,
  },
  bubbleContent: {
    padding: 12,
    borderWidth: 1,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  bubbleText: {
    color: 'white',
    fontSize: 12,
    lineHeight: 16,
  },
  connectionLine: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    width: 2,
    height: 8,
  },
  pulseIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
});