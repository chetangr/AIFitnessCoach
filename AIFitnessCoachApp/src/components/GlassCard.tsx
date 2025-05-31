import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  colors?: string[];
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 25,
  colors = ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
}) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  blur: {
    padding: 16,
  },
});