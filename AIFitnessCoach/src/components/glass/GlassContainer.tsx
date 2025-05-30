import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeStore } from '@/store/themeStore';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurAmount?: number;
  borderRadius?: number;
  borderWidth?: number;
  gradientColors?: string[];
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  style,
  blurAmount = 10,
  borderRadius = 16,
  borderWidth = 1,
  gradientColors,
}) => {
  const { theme } = useThemeStore();
  
  const defaultGradientColors = theme.colors.glass.includes('255')
    ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
    : ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)'];

  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    ...style,
  };

  const glassStyle: ViewStyle = {
    flex: 1,
    borderRadius,
    borderWidth,
    borderColor: theme.colors.glass,
  };

  if (Platform.OS === 'ios') {
    return (
      <View style={containerStyle}>
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType={theme.colors.background === '#FFFFFF' ? 'light' : 'dark'}
          blurAmount={blurAmount}
        />
        <LinearGradient
          colors={gradientColors || defaultGradientColors}
          style={glassStyle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  // Android fallback with just gradient
  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={gradientColors || defaultGradientColors}
        style={[
          glassStyle,
          {
            backgroundColor: theme.colors.glass,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});