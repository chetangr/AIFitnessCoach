import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ScrollView,
  Platform,
} from 'react-native';
import { modernTheme } from '../../config/modernTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Modern Card Component
interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children, 
  style,
  onPress,
  variant = 'default',
}) => {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.cardElevated,
    variant === 'outlined' && styles.cardOutlined,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

// Modern Button Component
interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  icon,
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'ghost' && styles.buttonGhost,
    variant === 'danger' && styles.buttonDanger,
    size === 'small' && styles.buttonSmall,
    size === 'medium' && styles.buttonMedium,
    size === 'large' && styles.buttonLarge,
    fullWidth && styles.buttonFullWidth,
    disabled && styles.buttonDisabled,
  ];

  const textStyles = [
    styles.buttonText,
    variant === 'primary' && styles.buttonTextPrimary,
    variant === 'secondary' && styles.buttonTextSecondary,
    variant === 'ghost' && styles.buttonTextGhost,
    variant === 'danger' && styles.buttonTextDanger,
    size === 'small' && styles.buttonTextSmall,
    size === 'medium' && styles.buttonTextMedium,
    size === 'large' && styles.buttonTextLarge,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {icon && <View style={styles.buttonIcon}>{icon}</View>}
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

// Modern Tab Component
interface Tab {
  key: string;
  title: string;
}

interface ModernTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (key: string) => void;
  style?: ViewStyle;
}

export const ModernTabs: React.FC<ModernTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style,
}) => {
  return (
    <View style={[styles.tabContainer, style]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.tabActive,
          ]}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Modern Header Component
interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'large' | 'transparent';
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  variant = 'default',
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.header, 
      variant === 'transparent' && styles.headerTransparent,
      { paddingTop: insets.top + modernTheme.spacing.sm }
    ]}>
      <View style={styles.headerLeft}>{leftAction}</View>
      <View style={styles.headerCenter}>
        <Text style={[
          styles.headerTitle,
          variant === 'large' && styles.headerTitleLarge
        ]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.headerRight}>{rightAction}</View>
    </View>
  );
};

// Modern List Item Component
interface ModernListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'compact';
}

export const ModernListItem: React.FC<ModernListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightContent,
  onPress,
  variant = 'default',
}) => {
  const content = (
    <>
      {leftIcon && <View style={styles.listItemIcon}>{leftIcon}</View>}
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
      </View>
      {rightContent && <View style={styles.listItemRight}>{rightContent}</View>}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.listItem, variant === 'compact' && styles.listItemCompact]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.listItem, variant === 'compact' && styles.listItemCompact]}>
      {content}
    </View>
  );
};

// Modern Container Component
interface ModernContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scroll?: boolean;
}

export const ModernContainer: React.FC<ModernContainerProps> = ({
  children,
  style,
  scroll = false,
}) => {
  if (scroll) {
    return (
      <ScrollView
        style={[styles.container, style]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: modernTheme.colors.cardBackground,
    borderRadius: modernTheme.borderRadius.md,
    padding: modernTheme.spacing.md,
    marginVertical: modernTheme.spacing.sm,
  },
  cardElevated: {
    ...modernTheme.shadows.md,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: modernTheme.colors.border,
  },

  // Button styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: modernTheme.spacing.lg,
    borderRadius: modernTheme.borderRadius.sm,
  },
  buttonPrimary: {
    backgroundColor: modernTheme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: modernTheme.colors.surface,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: modernTheme.colors.error,
  },
  buttonSmall: {
    paddingVertical: modernTheme.spacing.sm,
    paddingHorizontal: modernTheme.spacing.md,
  },
  buttonMedium: {
    paddingVertical: modernTheme.spacing.md - 4,
  },
  buttonLarge: {
    paddingVertical: modernTheme.spacing.md,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: modernTheme.spacing.sm,
  },
  buttonText: {
    ...modernTheme.typography.headline,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: modernTheme.colors.textPrimary,
  },
  buttonTextGhost: {
    color: modernTheme.colors.primary,
  },
  buttonTextDanger: {
    color: '#FFFFFF',
  },
  buttonTextSmall: {
    ...modernTheme.typography.subheadline,
  },
  buttonTextMedium: {
    ...modernTheme.typography.headline,
  },
  buttonTextLarge: {
    ...modernTheme.typography.title3,
  },

  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: modernTheme.colors.surface,
    borderRadius: modernTheme.borderRadius.sm,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: modernTheme.spacing.sm,
    paddingHorizontal: modernTheme.spacing.md,
    alignItems: 'center',
    borderRadius: modernTheme.borderRadius.sm - 2,
  },
  tabActive: {
    backgroundColor: modernTheme.colors.cardBackground,
    ...modernTheme.shadows.sm,
  },
  tabText: {
    ...modernTheme.typography.subheadline,
    color: modernTheme.colors.textSecondary,
  },
  tabTextActive: {
    color: modernTheme.colors.textPrimary,
    fontWeight: '600',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: modernTheme.spacing.md,
    paddingBottom: modernTheme.spacing.sm,
    backgroundColor: modernTheme.colors.background,
  },
  headerTransparent: {
    backgroundColor: 'transparent',
  },
  headerLeft: {
    width: 44,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
  },
  headerTitleLarge: {
    ...modernTheme.typography.largeTitle,
  },
  headerSubtitle: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
    marginTop: 2,
  },

  // List item styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: modernTheme.spacing.md,
    paddingHorizontal: modernTheme.spacing.md,
    backgroundColor: modernTheme.colors.cardBackground,
  },
  listItemCompact: {
    paddingVertical: modernTheme.spacing.sm,
  },
  listItemIcon: {
    marginRight: modernTheme.spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    ...modernTheme.typography.body,
    color: modernTheme.colors.textPrimary,
  },
  listItemSubtitle: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
    marginTop: 2,
  },
  listItemRight: {
    marginLeft: modernTheme.spacing.md,
  },

  // Container styles
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: modernTheme.spacing.md,
    paddingBottom: modernTheme.spacing.xl,
  },
});