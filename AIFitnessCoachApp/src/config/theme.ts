import { Platform } from 'react-native';

// Typography Scale based on Apple's Human Interface Guidelines
export const typography = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
  },
};

// Glass Effects
export const glassEffects = {
  light: {
    blur: 10,
    intensity: Platform.OS === 'ios' ? 50 : 60,
    tint: 'light' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  medium: {
    blur: 20,
    intensity: Platform.OS === 'ios' ? 70 : 80,
    tint: 'light' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dark: {
    blur: 30,
    intensity: Platform.OS === 'ios' ? 80 : 90,
    tint: 'dark' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  heavy: {
    blur: 40,
    intensity: Platform.OS === 'ios' ? 90 : 95,
    tint: 'dark' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
};

// Colors
export const colors = {
  // Primary brand colors
  primary: {
    purple: '#667eea',
    purpleDark: '#764ba2',
    pink: '#f093fb',
    gradient: ['#667eea', '#764ba2', '#f093fb'],
  },
  
  // Semantic colors
  semantic: {
    success: '#4CD964',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5AC8FA',
  },
  
  // Activity colors (Apple Fitness+ style)
  activity: {
    move: '#FA114F',
    exercise: '#92E82A',
    stand: '#1EEAEF',
  },
  
  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray100: '#F2F2F7',
    gray200: '#E5E5EA',
    gray300: '#D1D1D6',
    gray400: '#C7C7CC',
    gray500: '#AEAEB2',
    gray600: '#8E8E93',
    gray700: '#636366',
    gray800: '#48484A',
    gray900: '#2C2C2E',
  },
  
  // Glass overlays
  glass: {
    lightOverlay: 'rgba(255, 255, 255, 0.1)',
    mediumOverlay: 'rgba(255, 255, 255, 0.2)',
    darkOverlay: 'rgba(0, 0, 0, 0.2)',
    heavyOverlay: 'rgba(0, 0, 0, 0.4)',
  },
};

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    purple: {
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 0,
    },
    pink: {
      shadowColor: '#f093fb',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 0,
    },
  },
};

// Animation timing
export const animations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  spring: {
    default: {
      tension: 40,
      friction: 7,
    },
    bouncy: {
      tension: 50,
      friction: 5,
    },
    stiff: {
      tension: 100,
      friction: 10,
    },
  },
};

// Glass style helper
export const getGlassStyle = (variant: keyof typeof glassEffects = 'medium') => {
  const effect = glassEffects[variant];
  return {
    backgroundColor: effect.backgroundColor,
    overflow: 'hidden' as const,
    ...Platform.select({
      ios: {
        backdropFilter: `blur(${effect.blur}px)`,
      },
      android: {
        // Android doesn't support backdrop filter
        backgroundColor: variant === 'dark' || variant === 'heavy' 
          ? 'rgba(0, 0, 0, 0.4)' 
          : 'rgba(255, 255, 255, 0.3)',
      },
    }),
  };
};

// Glass props helper
export const getGlassProps = (variant: keyof typeof glassEffects = 'medium') => {
  const effect = glassEffects[variant];
  return {
    intensity: effect.intensity,
    tint: effect.tint,
  };
};

// Extended theme colors for glassmorphism
export const glassThemeColors = {
  gradientStart: '#667eea',
  gradientMiddle: '#764ba2',
  gradientEnd: '#f093fb',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassBackground: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
};

// Theme object
export const theme = {
  typography,
  colors: {
    ...colors,
    ...glassThemeColors,
  },
  spacing,
  borderRadius,
  shadows,
  animations,
  glassEffects,
  glass: glassEffects, // Add alias for compatibility
  getGlassStyle,
  getGlassProps,
};

export default theme;