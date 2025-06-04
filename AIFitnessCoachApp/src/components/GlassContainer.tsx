import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme, getGlassStyle, getGlassProps } from '../config/theme';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'dark' | 'heavy';
  withBorder?: boolean;
  withShadow?: boolean;
  shadowType?: keyof typeof theme.shadows;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  style,
  intensity = 'medium',
  withBorder = true,
  withShadow = true,
  shadowType = 'medium',
}) => {
  const glassProps = getGlassProps(intensity);
  const glassStyle = getGlassStyle(intensity, {
    ...style,
    ...(withShadow && theme.shadows[shadowType]),
  });

  if (!withBorder) {
    delete glassStyle.borderColor;
    delete glassStyle.borderWidth;
  }

  return (
    <View style={[styles.container, glassStyle]}>
      <BlurView
        {...glassProps}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});