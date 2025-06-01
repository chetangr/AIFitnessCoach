import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { VisionGlass } from './VisionGlass';

const { width, height } = Dimensions.get('window');

interface FloatingElementProps {
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  floatRange?: number; // How much the element floats
  floatDuration?: number; // Duration of float animation
  depth?: number;
  variant?: 'subtle' | 'pronounced' | 'orbital';
  autoFloat?: boolean;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  initialPosition = { x: 0, y: 0 },
  floatRange = 10,
  floatDuration = 3000,
  depth = 1,
  variant = 'subtle',
  autoFloat = true,
}) => {
  const translateX = useSharedValue(initialPosition.x);
  const translateY = useSharedValue(initialPosition.y);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!autoFloat) return;

    switch (variant) {
      case 'subtle':
        // Gentle floating motion
        translateY.value = withRepeat(
          withTiming(floatRange, {
            duration: floatDuration,
            easing: Easing.inOut(Easing.sin),
          }),
          -1,
          true
        );
        break;

      case 'pronounced':
        // More dramatic floating with slight rotation
        translateY.value = withRepeat(
          withTiming(floatRange * 1.5, {
            duration: floatDuration,
            easing: Easing.inOut(Easing.sin),
          }),
          -1,
          true
        );
        rotation.value = withRepeat(
          withTiming(5, {
            duration: floatDuration * 1.2,
            easing: Easing.inOut(Easing.sin),
          }),
          -1,
          true
        );
        break;

      case 'orbital':
        // Circular orbital motion
        const orbitalRadius = floatRange;
        translateX.value = withRepeat(
          withTiming(orbitalRadius, {
            duration: floatDuration,
            easing: Easing.linear,
          }),
          -1,
          false
        );
        translateY.value = withRepeat(
          withTiming(orbitalRadius, {
            duration: floatDuration / 2,
            easing: Easing.linear,
          }),
          -1,
          true
        );
        break;
    }
  }, [autoFloat, variant, floatRange, floatDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    let finalX = translateX.value;
    let finalY = translateY.value;

    // For orbital motion, create circular path
    if (variant === 'orbital') {
      const progress = (Date.now() % floatDuration) / floatDuration;
      finalX = Math.cos(progress * Math.PI * 2) * floatRange;
      finalY = Math.sin(progress * Math.PI * 2) * floatRange;
    }

    return {
      transform: [
        { translateX: finalX },
        { translateY: finalY },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      zIndex: 10 - depth,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};

// Specialized floating components
export const FloatingCard: React.FC<{
  children: React.ReactNode;
  variant?: 'subtle' | 'pronounced' | 'orbital';
  depth?: number;
}> = ({ children, variant = 'subtle', depth = 1 }) => (
  <FloatingElement variant={variant} depth={depth}>
    <VisionGlass depth={depth} floating interactive>
      {children}
    </VisionGlass>
  </FloatingElement>
);

export const FloatingOrb: React.FC<{
  size?: number;
  color?: string;
  variant?: 'subtle' | 'pronounced' | 'orbital';
  depth?: number;
}> = ({ 
  size = 20, 
  color = 'rgba(102,126,234,0.6)', 
  variant = 'orbital',
  depth = 3 
}) => (
  <FloatingElement variant={variant} depth={depth} floatRange={15}>
    <VisionGlass
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
      depth={depth}
      variant="light"
      floating
    >
      <View />
    </VisionGlass>
  </FloatingElement>
);

export const FloatingBadge: React.FC<{
  children: React.ReactNode;
  position: { x: number; y: number };
  variant?: 'subtle' | 'pronounced';
}> = ({ children, position, variant = 'subtle' }) => (
  <FloatingElement
    initialPosition={position}
    variant={variant}
    depth={2}
    floatRange={5}
  >
    <VisionGlass
      variant="thick"
      borderRadius={12}
      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
      floating
    >
      {children}
    </VisionGlass>
  </FloatingElement>
);