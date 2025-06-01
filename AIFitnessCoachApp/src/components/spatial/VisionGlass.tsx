import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface VisionGlassProps {
  children: React.ReactNode;
  style?: ViewStyle;
  depth?: number; // 0-10, affects blur intensity and layering
  intensity?: number; // Base blur intensity
  variant?: 'light' | 'dark' | 'ultraThin' | 'thick';
  interactive?: boolean; // Responds to touch with depth changes
  floating?: boolean; // Adds floating shadow effect
  borderRadius?: number;
}

export const VisionGlass: React.FC<VisionGlassProps> = ({
  children,
  style,
  depth = 0,
  intensity = 25,
  variant = 'light',
  interactive = false,
  floating = false,
  borderRadius = 16,
}) => {
  const pressScale = useSharedValue(1);
  const pressDepth = useSharedValue(0);

  // Calculate blur intensity based on depth
  const blurIntensity = intensity + (depth * 5);
  
  // Get variant-specific colors and settings
  const getVariantConfig = () => {
    switch (variant) {
      case 'light':
        return {
          tint: 'light' as const,
          gradientColors: [
            'rgba(255,255,255,0.25)',
            'rgba(255,255,255,0.05)',
            'rgba(255,255,255,0.15)',
          ] as const,
          borderColor: 'rgba(255,255,255,0.3)',
          shadowColor: 'rgba(0,0,0,0.1)',
        };
      case 'dark':
        return {
          tint: 'dark' as const,
          gradientColors: [
            'rgba(0,0,0,0.4)',
            'rgba(0,0,0,0.2)',
            'rgba(0,0,0,0.3)',
          ] as const,
          borderColor: 'rgba(255,255,255,0.15)',
          shadowColor: 'rgba(0,0,0,0.3)',
        };
      case 'ultraThin':
        return {
          tint: 'light' as const,
          gradientColors: [
            'rgba(255,255,255,0.15)',
            'rgba(255,255,255,0.02)',
            'rgba(255,255,255,0.08)',
          ] as const,
          borderColor: 'rgba(255,255,255,0.15)',
          shadowColor: 'rgba(0,0,0,0.05)',
        };
      case 'thick':
        return {
          tint: 'light' as const,
          gradientColors: [
            'rgba(255,255,255,0.4)',
            'rgba(255,255,255,0.1)',
            'rgba(255,255,255,0.25)',
          ] as const,
          borderColor: 'rgba(255,255,255,0.4)',
          shadowColor: 'rgba(0,0,0,0.15)',
        };
    }
  };

  const config = getVariantConfig();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pressScale.value },
      // React Native doesn't support translateZ, using scale for depth effect
      { scaleX: 1 + (pressDepth.value * 0.001) },
      { scaleY: 1 + (pressDepth.value * 0.001) },
    ],
  }));

  // Use static shadow styles to avoid the error
  const shadowStyles = floating ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: depth + 2,
  } : {};

  const handlePressIn = () => {
    if (interactive) {
      pressScale.value = withTiming(0.98, { duration: 150 });
      pressDepth.value = withTiming(5, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      pressScale.value = withTiming(1, { duration: 150 });
      pressDepth.value = withTiming(0, { duration: 150 });
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderRadius,
          shadowColor: config.shadowColor,
        },
        shadowStyles,
        animatedStyle,
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <BlurView 
        intensity={blurIntensity} 
        tint={config.tint} 
        style={[styles.blur, { borderRadius }]}
      >
        {/* Multi-layer gradient for visionOS effect */}
        <LinearGradient
          colors={config.gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Border gradient */}
        <View
          style={[
            styles.border,
            {
              borderRadius,
              borderColor: config.borderColor,
            },
          ]}
        />
        
        {/* Depth highlight */}
        {depth > 0 && (
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.1)',
              'transparent',
              'rgba(255,255,255,0.05)',
            ]}
            style={[
              StyleSheet.absoluteFillObject,
              { borderRadius },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        
        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  blur: {
    overflow: 'hidden',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});