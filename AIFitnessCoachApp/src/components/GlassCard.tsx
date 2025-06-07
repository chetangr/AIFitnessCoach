import React from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../config/theme';
import { useFadeIn } from '../utils/animations';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'dark' | 'heavy';
  colors?: string[];
  animate?: boolean;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 'medium',
  colors,
  animate = true,
  delay = 0,
}) => {
  const fadeOpacity = useFadeIn(delay);
  const glassEffect = theme.glassEffects[intensity];
  const glassStyle = theme.getGlassStyle(intensity);
  
  const gradientColors = colors || [
    theme.colors.glass.lightOverlay,
    'rgba(255,255,255,0.05)'
  ];
  
  const content = (
    <View style={[styles.container, glassStyle, style]}>
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <BlurView 
        intensity={glassEffect.intensity}
        tint={glassEffect.tint}
        style={styles.blur}
      >
        {children}
      </BlurView>
    </View>
  );
  
  return animate ? (
    <Animated.View style={{ opacity: fadeOpacity }}>
      {content}
    </Animated.View>
  ) : content;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  blur: {
    padding: theme.spacing.md,
  },
});