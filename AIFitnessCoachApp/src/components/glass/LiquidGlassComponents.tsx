import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Glass View - Simple blur container
interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const GlassView: React.FC<GlassViewProps> = ({
  children,
  style,
  intensity = 80,
}) => {
  return (
    <BlurView intensity={intensity} style={[styles.glassContainer, style]}>
      <View style={styles.glassContent}>{children}</View>
    </BlurView>
  );
};

// Glass Card - Card with glass effect
interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <BlurView intensity={80} style={styles.cardBlur}>
        <View style={styles.cardContent}>{children}</View>
      </BlurView>
    </View>
  );
};

// Glass Button - Simple button with glass effect
interface GlassButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  icon,
}) => {
  const buttonColors = {
    primary: ['#007AFF', '#0051D5'],
    secondary: ['#5856D6', '#3634A3'],
    danger: ['#FF3B30', '#D70015'],
  };

  const heights = {
    small: 36,
    medium: 44,
    large: 52,
  };

  const fontSizes = {
    small: 14,
    medium: 16,
    large: 18,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[{ height: heights[size] }, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? ['#8E8E93', '#636366'] : buttonColors[variant] as [string, string, ...string[]]}
        style={[styles.button, { opacity: disabled ? 0.6 : 1 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <View style={styles.buttonContent}>
            {icon && (
              <Ionicons
                name={icon as any}
                size={fontSizes[size] + 2}
                color="white"
                style={styles.buttonIcon}
              />
            )}
            <Text style={[styles.buttonText, { fontSize: fontSizes[size] }]}>
              {label}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Glass Input - Simple input field
interface GlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const GlassInput: React.FC<GlassInputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  style,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.5)"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
};

// Loading Component
interface GlassLoadingProps {
  message?: string;
}

export const GlassLoading: React.FC<GlassLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.loadingContainer}>
      <GlassCard style={styles.loadingCard}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{message}</Text>
      </GlassCard>
    </View>
  );
};

// Empty State Component
interface GlassEmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const GlassEmptyState: React.FC<GlassEmptyStateProps> = ({
  icon = 'folder-open-outline',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon as any} size={64} color="rgba(255,255,255,0.5)" />
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
      {actionLabel && onAction && (
        <GlassButton
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.emptyButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Glass View
  glassContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  glassContent: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Glass Card
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cardBlur: {
    flex: 1,
  },
  cardContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // Glass Button
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },

  // Glass Input
  inputContainer: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  loadingCard: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 32,
  },
});

// Export aliases for compatibility
export const LiquidGlassView = GlassView;
export const LiquidButton = GlassButton;
export const LiquidCard = GlassCard;
export const LiquidInput = GlassInput;
export const LiquidLoading = GlassLoading;
export const LiquidEmptyState = GlassEmptyState;
export const LiquidFocusRing = View; // Dummy component for compatibility

// Export all components
export default {
  View: GlassView,
  Card: GlassCard,
  Button: GlassButton,
  Input: GlassInput,
  Loading: GlassLoading,
  EmptyState: GlassEmptyState,
};