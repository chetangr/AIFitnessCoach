import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { GlassContainer } from './GlassContainer';
import { useThemeStore } from '@/store/themeStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
  rightElement,
}) => {
  const { theme } = useThemeStore();

  const CardWrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

  return (
    <CardWrapper {...wrapperProps} style={style}>
      <GlassContainer style={styles.container}>
        {(title || icon) && (
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {icon && (
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' || theme.colors.primary + '20' }]}>
                  <Icon
                    name={icon}
                    size={24}
                    color={iconColor || theme.colors.primary}
                  />
                </View>
              )}
              <View style={styles.titleContainer}>
                {title && (
                  <Text style={[styles.title, { color: theme.colors.text }]}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    {subtitle}
                  </Text>
                )}
              </View>
            </View>
            {rightElement && (
              <View style={styles.headerRight}>{rightElement}</View>
            )}
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </GlassContainer>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    // Content styling
  },
});