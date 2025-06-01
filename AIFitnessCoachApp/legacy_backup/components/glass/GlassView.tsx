import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  gradient?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
  borderWidth?: number;
  borderColor?: string;
}

export const GlassView: React.FC<GlassViewProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
  gradient = true,
  gradientColors = ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] as const,
  borderWidth = 1,
  borderColor = 'rgba(255,255,255,0.2)',
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView 
        intensity={intensity} 
        tint={tint} 
        style={StyleSheet.absoluteFillObject}
      />
      {gradient && (
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <View 
        style={[
          styles.content, 
          { 
            borderWidth, 
            borderColor,
          }
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    borderRadius: 20,
  },
});