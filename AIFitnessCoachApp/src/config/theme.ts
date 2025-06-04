import { Platform } from 'react-native';

export const theme = {
  colors: {
    // Primary gradient colors
    gradientStart: '#667eea',
    gradientMiddle: '#764ba2',
    gradientEnd: '#f093fb',
    
    // Dark mode gradient colors
    darkGradientStart: '#0f0c29',
    darkGradientMiddle: '#302b63',
    darkGradientEnd: '#24243e',
    
    // Glass effects
    glassBackground: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassBackgroundDark: 'rgba(30, 30, 46, 0.85)',
    
    // Text colors
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textTertiary: 'rgba(255, 255, 255, 0.6)',
    
    // Accent colors
    accent: '#764ba2',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    
    // FAB colors
    fabOrange: ['#ff6b6b', '#ff8787'],
    fabTeal: ['#4ecdc4', '#44a39a'],
    fabPurple: ['#764ba2', '#667eea'],
  },
  
  glass: {
    // Glass morphism presets
    light: {
      intensity: Platform.OS === 'ios' ? 80 : 100,
      tint: 'light' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
    },
    
    dark: {
      intensity: Platform.OS === 'ios' ? 95 : 100,
      tint: 'dark' as const,
      backgroundColor: 'rgba(30, 30, 46, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
    },
    
    medium: {
      intensity: Platform.OS === 'ios' ? 60 : 80,
      tint: 'light' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      borderWidth: 1,
    },
    
    heavy: {
      intensity: Platform.OS === 'ios' ? 100 : 100,
      tint: 'dark' as const,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
    
    colored: {
      shadowColor: '#764ba2',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    round: 9999,
  },
  
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

// Helper function to get gradient colors based on theme
export const getGradientColors = (isDarkMode: boolean): readonly [string, string, string] => {
  return isDarkMode
    ? [theme.colors.darkGradientStart, theme.colors.darkGradientMiddle, theme.colors.darkGradientEnd]
    : [theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd];
};

// Helper function to get glass style based on intensity
export const getGlassStyle = (preset: keyof typeof theme.glass = 'medium', customStyles?: any) => {
  const glassPreset = theme.glass[preset];
  return {
    backgroundColor: glassPreset.backgroundColor,
    borderColor: glassPreset.borderColor,
    borderWidth: glassPreset.borderWidth,
    overflow: 'hidden' as const,
    ...customStyles,
  };
};

// Get glass props for BlurView
export const getGlassProps = (preset: keyof typeof theme.glass = 'medium') => {
  const glassPreset = theme.glass[preset];
  return {
    intensity: glassPreset.intensity,
    tint: glassPreset.tint,
  };
};