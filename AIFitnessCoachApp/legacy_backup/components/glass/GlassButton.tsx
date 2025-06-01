import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { GlassContainer } from './GlassContainer';
import { useThemeStore } from '@/store/themeStore';
import * as Haptics from 'expo-haptics';

interface GlassButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  haptic = true,
  ...props
}) => {
  const { theme } = useThemeStore();

  const handlePress = () => {
    if (haptic && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          gradient: [theme.colors.primary + '20', theme.colors.primary + '10'],
          text: theme.colors.primary,
        };
      case 'secondary':
        return {
          gradient: [theme.colors.secondary + '20', theme.colors.secondary + '10'],
          text: theme.colors.secondary,
        };
      case 'danger':
        return {
          gradient: [theme.colors.error + '20', theme.colors.error + '10'],
          text: theme.colors.error,
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          button: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
          text: { fontSize: 14 },
        };
      case 'medium':
        return {
          button: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
          text: { fontSize: 16 },
        };
      case 'large':
        return {
          button: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
          text: { fontSize: 18 },
        };
    }
  };

  const { gradient, text: textColor } = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.touchable,
        sizeStyles.button,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <GlassContainer
        style={styles.container}
        gradientColors={gradient}
        borderRadius={theme.borderRadius.lg}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              { color: textColor },
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </GlassContainer>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});