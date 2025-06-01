import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { FloatingOrb } from './FloatingElement';

const { width, height } = Dimensions.get('window');

interface ImmersiveEnvironmentProps {
  environment: 'gym' | 'outdoor' | 'home' | 'focus' | 'cosmic';
  intensity?: number; // 0-1, how immersive the environment is
  children: React.ReactNode;
  animated?: boolean;
}

export const ImmersiveEnvironment: React.FC<ImmersiveEnvironmentProps> = ({
  environment,
  intensity = 0.7,
  children,
  animated = true,
}) => {
  const animationValue = useSharedValue(0);
  const parallax1 = useSharedValue(0);
  const parallax2 = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Continuous gentle animation for dynamic environments
      animationValue.value = withRepeat(
        withTiming(1, {
          duration: 20000,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );

      // Parallax layers
      parallax1.value = withRepeat(
        withTiming(50, {
          duration: 15000,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );

      parallax2.value = withRepeat(
        withTiming(30, {
          duration: 25000,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );
    }
  }, [animated]);

  const getEnvironmentConfig = () => {
    switch (environment) {
      case 'gym':
        return {
          colors: [
            'rgba(20,20,25,0.9)',
            'rgba(40,40,50,0.8)',
            'rgba(60,60,70,0.7)',
          ],
          accentColor: 'rgba(255,100,100,0.3)',
          particleCount: 8,
          particleColor: 'rgba(255,255,255,0.1)',
        };
      
      case 'outdoor':
        return {
          colors: [
            'rgba(135,206,235,0.3)',
            'rgba(100,180,100,0.4)',
            'rgba(80,160,80,0.5)',
          ],
          accentColor: 'rgba(255,223,0,0.4)',
          particleCount: 12,
          particleColor: 'rgba(255,255,255,0.2)',
        };
      
      case 'home':
        return {
          colors: [
            'rgba(139,69,19,0.2)',
            'rgba(160,82,45,0.3)',
            'rgba(205,133,63,0.2)',
          ],
          accentColor: 'rgba(255,165,0,0.3)',
          particleCount: 6,
          particleColor: 'rgba(255,255,255,0.15)',
        };
      
      case 'focus':
        return {
          colors: [
            'rgba(25,25,35,0.95)',
            'rgba(35,35,45,0.9)',
            'rgba(45,45,55,0.85)',
          ],
          accentColor: 'rgba(102,126,234,0.4)',
          particleCount: 4,
          particleColor: 'rgba(102,126,234,0.2)',
        };
      
      case 'cosmic':
        return {
          colors: [
            'rgba(0,0,20,0.9)',
            'rgba(20,0,40,0.8)',
            'rgba(40,0,60,0.7)',
          ],
          accentColor: 'rgba(138,43,226,0.5)',
          particleCount: 15,
          particleColor: 'rgba(255,255,255,0.3)',
        };
    }
  };

  const config = getEnvironmentConfig();

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          animationValue.value,
          [0, 1],
          [1, 1.05]
        ),
      },
    ],
    opacity: intensity,
  }));

  const parallax1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: parallax1.value },
      { translateY: parallax1.value * 0.5 },
    ],
  }));

  const parallax2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -parallax2.value },
      { translateY: parallax2.value * 0.3 },
    ],
  }));

  const renderEnvironmentElements = () => {
    switch (environment) {
      case 'gym':
        return (
          <>
            {/* Equipment silhouettes */}
            <View style={[styles.equipmentSilhouette, { left: '10%', top: '20%' }]} />
            <View style={[styles.equipmentSilhouette, { right: '15%', top: '60%', transform: [{ scale: 0.8 }] }]} />
            <View style={[styles.equipmentSilhouette, { left: '60%', top: '40%', transform: [{ scale: 1.2 }] }]} />
          </>
        );
      
      case 'outdoor':
        return (
          <>
            {/* Tree silhouettes */}
            <Animated.View style={[styles.treeSilhouette, { left: '5%' }, parallax1Style]} />
            <Animated.View style={[styles.treeSilhouette, { right: '10%', transform: [{ scale: 1.3 }] }, parallax2Style]} />
            {/* Cloud effects */}
            <Animated.View style={[styles.cloud, { left: '20%', top: '10%' }, parallax1Style]} />
            <Animated.View style={[styles.cloud, { right: '30%', top: '15%' }, parallax2Style]} />
          </>
        );
      
      case 'cosmic':
        return (
          <>
            {/* Stars */}
            {Array.from({ length: 20 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.star,
                  {
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.8 + 0.2,
                  },
                ]}
              />
            ))}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Environment */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
        <LinearGradient
          colors={config.colors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Environment-specific elements */}
        {renderEnvironmentElements()}
        
        {/* Accent gradient overlay */}
        <LinearGradient
          colors={[
            'transparent',
            config.accentColor,
            'transparent',
          ]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Floating particles */}
      {Array.from({ length: config.particleCount }).map((_, i) => (
        <FloatingOrb
          key={i}
          size={Math.random() * 15 + 5}
          color={config.particleColor}
          variant="orbital"
          depth={Math.floor(Math.random() * 5) + 1}
        />
      ))}

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Atmospheric effects */}
      <BlurView
        intensity={5}
        tint="light"
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: intensity * 0.3 },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  equipmentSilhouette: {
    position: 'absolute',
    width: 60,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  treeSilhouette: {
    position: 'absolute',
    bottom: 0,
    width: 80,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 40,
  },
  cloud: {
    position: 'absolute',
    width: 100,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
});