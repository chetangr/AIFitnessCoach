import { Platform, StatusBar } from 'react-native';

export const modernTheme = {
  colors: {
    // Primary colors
    primary: '#007AFF',
    primaryLight: '#4DA2FF',
    primaryDark: '#0051D5',
    
    // Neutral colors
    background: '#000000',
    surface: '#1C1C1E',
    surfaceLight: '#2C2C2E',
    
    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#48484A',
    
    // Status colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5856D6',
    
    // Semantic colors
    cardBackground: '#1C1C1E',
    border: '#38383A',
    divider: '#48484A',
    
    // Dark mode
    dark: {
      background: '#000000',
      surface: '#1C1C1E',
      surfaceLight: '#2C2C2E',
      textPrimary: '#FFFFFF',
      textSecondary: '#8E8E93',
      textTertiary: '#48484A',
      cardBackground: '#1C1C1E',
      border: '#38383A',
      divider: '#48484A',
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    statusBar: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
  },
  
  typography: {
    largeTitle: {
      fontSize: 34,
      fontWeight: '700' as '700',
      letterSpacing: -0.4,
      lineHeight: 41,
    },
    title1: {
      fontSize: 28,
      fontWeight: '700' as '700',
      letterSpacing: -0.4,
      lineHeight: 34,
    },
    title2: {
      fontSize: 22,
      fontWeight: '600' as '600',
      letterSpacing: -0.2,
      lineHeight: 28,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600' as '600',
      letterSpacing: -0.2,
      lineHeight: 25,
    },
    headline: {
      fontSize: 17,
      fontWeight: '600' as '600',
      letterSpacing: -0.4,
      lineHeight: 22,
    },
    body: {
      fontSize: 17,
      fontWeight: '400' as '400',
      letterSpacing: -0.4,
      lineHeight: 22,
    },
    callout: {
      fontSize: 16,
      fontWeight: '400' as '400',
      letterSpacing: -0.3,
      lineHeight: 21,
    },
    subheadline: {
      fontSize: 15,
      fontWeight: '400' as '400',
      letterSpacing: -0.2,
      lineHeight: 20,
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400' as '400',
      letterSpacing: -0.1,
      lineHeight: 18,
    },
    caption1: {
      fontSize: 12,
      fontWeight: '400' as '400',
      letterSpacing: 0,
      lineHeight: 16,
    },
    caption2: {
      fontSize: 11,
      fontWeight: '400' as '400',
      letterSpacing: 0.1,
      lineHeight: 13,
    },
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  shadows: {
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
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  }
};

export type ModernTheme = typeof modernTheme;