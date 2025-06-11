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
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../config/dynamicTheme';

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
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
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
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        size === 'small' && styles.buttonSmall,
        size === 'medium' && styles.buttonMedium,
        size === 'large' && styles.buttonLarge,
        fullWidth && styles.buttonFullWidth,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.buttonIcon}>{icon}</View>}
      <Text
        style={[
          styles.buttonText,
          variant === 'primary' && styles.buttonTextPrimary,
          variant === 'secondary' && styles.buttonTextSecondary,
          variant === 'ghost' && styles.buttonTextGhost,
          variant === 'danger' && styles.buttonTextDanger,
          size === 'small' && styles.buttonTextSmall,
          size === 'medium' && styles.buttonTextMedium,
          size === 'large' && styles.buttonTextLarge,
        ]}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};

// Modern Section Component
interface ModernSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  action?: React.ReactNode;
}

export const ModernSection: React.FC<ModernSectionProps> = ({
  title,
  subtitle,
  children,
  style,
  action,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <View style={[styles.section, style]}>
      {(title || subtitle || action) && (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitles}>
            {title && <Text style={styles.sectionTitle}>{title}</Text>}
            {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
          </View>
          {action && <View style={styles.sectionAction}>{action}</View>}
        </View>
      )}
      {children}
    </View>
  );
};

// Modern Header Component
interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'large';
  style?: ViewStyle;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  variant = 'default',
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={[
        styles.header,
        variant === 'large' && styles.headerLarge,
        { paddingTop: insets.top + theme.spacing.sm },
        style,
      ]}
    >
      <View style={styles.headerContent}>
        {leftAction && <View style={styles.headerLeft}>{leftAction}</View>}
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, variant === 'large' && styles.headerTitleLarge]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        {rightAction && <View style={styles.headerRight}>{rightAction}</View>}
      </View>
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
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
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
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
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

const createStyles = (theme: Theme) => StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  cardElevated: {
    ...theme.shadows.md,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Button styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: theme.colors.error,
  },
  buttonSmall: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  buttonMedium: {
    paddingVertical: theme.spacing.sm,
  },
  buttonLarge: {
    paddingVertical: theme.spacing.md,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  buttonText: {
    ...theme.typography.body,
    fontWeight: '600' as '600',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: theme.colors.textPrimary,
  },
  buttonTextGhost: {
    color: theme.colors.primary,
  },
  buttonTextDanger: {
    color: '#FFFFFF',
  },
  buttonTextSmall: {
    ...theme.typography.footnote,
  },
  buttonTextMedium: {
    ...theme.typography.body,
  },
  buttonTextLarge: {
    ...theme.typography.headline,
  },

  // Section styles
  section: {
    marginVertical: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitles: {
    flex: 1,
  },
  sectionTitle: {
    ...theme.typography.title3,
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    ...theme.typography.footnote,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionAction: {
    marginLeft: theme.spacing.md,
  },

  // Header styles
  header: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  headerLarge: {
    paddingVertical: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    marginRight: theme.spacing.md,
  },
  headerCenter: {
    flex: 1,
  },
  headerRight: {
    marginLeft: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.headline,
    color: theme.colors.textPrimary,
    fontWeight: '600' as '600',
  },
  headerTitleLarge: {
    ...theme.typography.title1,
  },
  headerSubtitle: {
    ...theme.typography.footnote,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // List item styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
  },
  listItemCompact: {
    paddingVertical: theme.spacing.sm,
  },
  listItemIcon: {
    marginRight: theme.spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  listItemSubtitle: {
    ...theme.typography.footnote,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  listItemRight: {
    marginLeft: theme.spacing.md,
  },

  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});