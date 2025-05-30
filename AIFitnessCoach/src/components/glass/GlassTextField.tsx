import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { GlassContainer } from './GlassContainer';
import { useThemeStore } from '@/store/themeStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface GlassTextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const GlassTextField: React.FC<GlassTextFieldProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...props
}) => {
  const { theme } = useThemeStore();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const handleFocus = () => {
    setIsFocused(true);
    props.onFocus?.(null as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    props.onBlur?.(null as any);
  };

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <GlassContainer
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.errorContainer,
        ]}
        borderWidth={isFocused ? 2 : 1}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={theme.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text },
            icon && styles.inputWithIcon,
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecureEntry} style={styles.rightIconButton}>
            <Icon
              name={isSecure ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
          >
            <Icon
              name={rightIcon}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </GlassContainer>
      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  focused: {
    borderColor: 'rgba(79, 70, 229, 0.5)',
  },
  errorContainer: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  rightIconButton: {
    marginLeft: 12,
    padding: 4,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});