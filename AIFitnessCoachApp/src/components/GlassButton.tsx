import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

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
  
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          isPrimary
            ? ['rgba(102,126,234,0.8)', 'rgba(118,75,162,0.8)']
            : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
        }
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
          <Text style={[styles.text, textStyle]}>{title}</Text>
        )}
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  blur: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});