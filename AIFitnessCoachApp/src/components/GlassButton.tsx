import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../config/theme';
import { usePressAnimation } from '../utils/animations';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  variant = 'primary',
  disabled = false,
}) => {
  const isPrimary = variant === 'primary';
  const { onPressIn, onPressOut, animatedStyle } = usePressAnimation();
  
  const getColors = () => {
    if (isPrimary) {
      return [theme.colors.primary.purple + 'CC', theme.colors.primary.purpleDark + 'CC'];
    }
    return ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'];
  };
  
  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getColors() as [string, string]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <BlurView
          intensity={isPrimary ? 30 : 20}
          tint={isPrimary ? 'dark' : 'light'}
          style={styles.blur}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={[styles.text, theme.typography.headline, textStyle]}>{title}</Text>
          )}
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glass.lightOverlay,
    ...theme.shadows.md,
  },
  blur: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.neutral.white,
  },
});