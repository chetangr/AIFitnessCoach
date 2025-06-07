import { theme, getGradientColors } from '../config/theme';

// Consistent gradient colors to be used across all screens
export const THEME_GRADIENTS = {
  // Main app gradients
  light: ['#667eea', '#764ba2', '#f093fb'] as const,
  dark: ['#0f0c29', '#302b63', '#24243e'] as const,
  
  // FAB gradients
  fabOrange: ['#ff6b6b', '#ff8787'] as const,
  fabTeal: ['#4ecdc4', '#44a39a'] as const,
  fabPurple: ['#764ba2', '#667eea'] as const,
  
  // Special purpose gradients
  success: ['#4CAF50', '#66BB6A'] as const,
  warning: ['#FF9800', '#FFB74D'] as const,
  error: ['#F44336', '#EF5350'] as const,
  
  // Component specific
  button: ['#667eea', '#764ba2'] as const,
  card: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] as const,
};

// Standard text styles for consistency
export const TEXT_STYLES = {
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: theme.colors.textPrimary,
  },
  screenSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: theme.colors.textPrimary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.textPrimary,
  },
  bodyText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  secondaryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
};

// Standard component styles
export const COMPONENT_STYLES = {
  glassCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  
  primaryButton: {
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    overflow: 'hidden' as const,
  },
  
  floatingButton: {
    position: 'absolute' as const,
    bottom: 90,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    ...theme.shadows.colored,
    overflow: 'hidden' as const,
  },
  
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  
  screenContainer: {
    flex: 1,
  },
};

// Helper function to get theme gradient based on mode
export const getThemeGradient = (isDarkMode: boolean) => {
  return isDarkMode ? THEME_GRADIENTS.dark : THEME_GRADIENTS.light;
};

// Color mapping for difficulty levels
export const DIFFICULTY_COLORS = {
  beginner: 'rgba(76, 175, 80, 0.3)',
  intermediate: 'rgba(255, 152, 0, 0.3)',
  advanced: 'rgba(244, 67, 54, 0.3)',
};

// Workout type colors
export const WORKOUT_TYPE_COLORS = {
  strength: '#764ba2',
  cardio: '#ff6b6b',
  flexibility: '#4ecdc4',
  hiit: '#ff8787',
  yoga: '#44a39a',
  sports: '#667eea',
};