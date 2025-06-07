import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../config/theme';
import { usePressAnimation, useFadeIn, useScale } from '../../utils/animations';

// Glass Container with animation support
interface GlassContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'dark' | 'heavy';
  animated?: boolean;
  delay?: number;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  style,
  intensity = 'medium',
  animated = false,
  delay = 0,
}) => {
  const opacity = animated ? useFadeIn(delay) : 1;
  const scale = animated ? useScale(0.95, delay) : 1;
  const effect = theme.glassEffects[intensity];
  
  const content = (
    <BlurView
      intensity={effect.intensity}
      tint={effect.tint}
      style={[
        styles.glassContainer,
        { backgroundColor: effect.backgroundColor },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
  
  if (animated) {
    return (
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        {content}
      </Animated.View>
    );
  }
  
  return content;
};

// Glass Button with gradient and press animation
interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
}) => {
  const { scale, handlePressIn, handlePressOut } = usePressAnimation();
  
  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 12, paddingHorizontal: 24 },
    large: { paddingVertical: 16, paddingHorizontal: 32 },
  };
  
  const textSizes = {
    small: theme.typography.footnote,
    medium: theme.typography.callout,
    large: theme.typography.headline,
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={isDisabled ? [theme.colors.neutral.gray400, theme.colors.neutral.gray500] : theme.colors.primary.gradient as [string, string, string]}
            style={[
              styles.glassButton,
              sizeStyles[size],
              isDisabled && styles.disabledButton,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                {icon && <Icon name={icon} size={20} color="white" style={styles.buttonIcon} />}
                <Text style={[styles.buttonText, textSizes[size]]}>
                  {title}
                </Text>
              </View>
            )}
          </LinearGradient>
        ) : (
          <BlurView
            intensity={80}
            tint={variant === 'secondary' ? 'light' : 'default'}
            style={[
              styles.glassButton,
              styles.secondaryButton,
              sizeStyles[size],
              isDisabled && styles.disabledButton,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.primary.purple} size="small" />
            ) : (
              <View style={styles.buttonContent}>
                {icon && <Icon name={icon} size={20} color={theme.colors.primary.purple} style={styles.buttonIcon} />}
                <Text style={[
                  styles.buttonText,
                  styles.secondaryButtonText,
                  textSizes[size],
                ]}>
                  {title}
                </Text>
              </View>
            )}
          </BlurView>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Glass Text Input
interface GlassTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  error?: string;
  style?: ViewStyle;
}

export const GlassTextInput: React.FC<GlassTextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  style,
}) => {
  const fadeIn = useFadeIn(200);
  
  return (
    <Animated.View style={[{ opacity: fadeIn }, style]}>
      <BlurView
        intensity={70}
        tint="light"
        style={[
          styles.inputContainer,
          error && styles.inputError,
        ]}
      >
        {icon && (
          <Icon 
            name={icon} 
            size={20} 
            color={error ? theme.colors.semantic.error : theme.colors.neutral.gray600}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.neutral.gray500}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[styles.input, theme.typography.body]}
        />
      </BlurView>
      {error && (
        <Text style={[styles.errorText, theme.typography.caption1]}>
          {error}
        </Text>
      )}
    </Animated.View>
  );
};

// Glass Card with hover effect
interface GlassCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'dark';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  onPress,
  style,
  intensity = 'medium',
}) => {
  const { scale, handlePressIn, handlePressOut } = usePressAnimation();
  const effect = theme.glassEffects[intensity];
  
  const content = (
    <BlurView
      intensity={effect.intensity}
      tint={effect.tint}
      style={[
        styles.glassCard,
        { backgroundColor: effect.backgroundColor },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
  
  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }
  
  return content;
};

// Glass Badge
interface GlassBadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  icon?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  label,
  variant = 'default',
  icon,
}) => {
  const colors = {
    default: theme.colors.primary.purple,
    success: theme.colors.semantic.success,
    warning: theme.colors.semantic.warning,
    error: theme.colors.semantic.error,
  };
  
  return (
    <BlurView
      intensity={80}
      tint="light"
      style={[
        styles.glassBadge,
        { borderColor: colors[variant] },
      ]}
    >
      {icon && (
        <Icon name={icon} size={14} color={colors[variant]} style={styles.badgeIcon} />
      )}
      <Text style={[
        styles.badgeText,
        theme.typography.caption1,
        { color: colors[variant] },
      ]}>
        {label}
      </Text>
    </BlurView>
  );
};

// Glass Section Header
interface GlassSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const GlassSectionHeader: React.FC<GlassSectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Text style={[styles.sectionTitle, theme.typography.title2]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.sectionSubtitle, theme.typography.subheadline]}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={[styles.actionText, theme.typography.callout]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Container
  glassContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  
  // Button
  glassButton: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.glass.lightOverlay,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: theme.colors.primary.purple,
  },
  disabledButton: {
    opacity: 0.5,
  },
  
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    borderWidth: 1,
    borderColor: theme.colors.glass.lightOverlay,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: theme.colors.semantic.error,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.neutral.gray900,
    padding: 0,
  },
  errorText: {
    color: theme.colors.semantic.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  
  // Card
  glassCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  
  // Badge
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    overflow: 'hidden',
  },
  badgeIcon: {
    marginRight: theme.spacing.xs,
  },
  badgeText: {
    fontWeight: '600',
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.neutral.gray900,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: theme.colors.neutral.gray600,
    marginTop: theme.spacing.xs,
  },
  actionText: {
    color: theme.colors.primary.purple,
    fontWeight: '600',
  },
});

export default {
  GlassContainer,
  GlassButton,
  GlassTextInput,
  GlassCard,
  GlassBadge,
  GlassSectionHeader,
};