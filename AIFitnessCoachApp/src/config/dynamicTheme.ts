import { Platform, StatusBar } from 'react-native';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Neutral colors
  background: string;
  surface: string;
  surfaceLight: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Semantic colors
  cardBackground: string;
  border: string;
  divider: string;
  
  // Tab bar specific
  tabBarBackground: string;
  tabBarTint: 'light' | 'dark';
  tabBarBlur: 'light' | 'dark' | 'default';
  tabBarIcon: string;
  tabBarIconActive: string;
  tabBarBorder: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    statusBar: number;
  };
  typography: {
    largeTitle: {
      fontSize: number;
      fontWeight: '700';
      letterSpacing: number;
      lineHeight: number;
    };
    title1: {
      fontSize: number;
      fontWeight: '700';
      letterSpacing: number;
      lineHeight: number;
    };
    title2: {
      fontSize: number;
      fontWeight: '600';
      letterSpacing: number;
      lineHeight: number;
    };
    title3: {
      fontSize: number;
      fontWeight: '600';
      letterSpacing: number;
      lineHeight: number;
    };
    headline: {
      fontSize: number;
      fontWeight: '600';
      letterSpacing: number;
      lineHeight: number;
    };
    body: {
      fontSize: number;
      fontWeight: '400';
      letterSpacing: number;
      lineHeight: number;
    };
    callout: {
      fontSize: number;
      fontWeight: '400';
      letterSpacing: number;
      lineHeight: number;
    };
    subheadline: {
      fontSize: number;
      fontWeight: '400';
      letterSpacing: number;
      lineHeight: number;
    };
    footnote: {
      fontSize: number;
      fontWeight: '400';
      letterSpacing: number;
      lineHeight: number;
    };
    caption1: {
      fontSize: number;
      fontWeight: '400';
      letterSpacing: number;
      lineHeight: number;
    };
    caption2: {
      fontSize: number;
      fontWeight: '400';
      letterSpacing: number;
      lineHeight: number;
    };
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

const lightColors: ThemeColors = {
  // Primary colors
  primary: '#007AFF',
  primaryLight: '#4DA2FF',
  primaryDark: '#0051D5',
  
  // Neutral colors
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceLight: '#F2F2F7',
  
  // Text colors
  textPrimary: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#C7C7CC',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5856D6',
  
  // Semantic colors
  cardBackground: '#FFFFFF',
  border: '#E5E5EA',
  divider: '#E5E5EA',
  
  // Tab bar specific
  tabBarBackground: 'rgba(255, 255, 255, 0.9)',
  tabBarTint: 'light',
  tabBarBlur: 'light',
  tabBarIcon: '#8E8E93',
  tabBarIconActive: '#007AFF',
  tabBarBorder: 'rgba(0, 0, 0, 0.08)',
};

const darkColors: ThemeColors = {
  // Primary colors
  primary: '#0A84FF',
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
  success: '#32D74B',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#5E5CE6',
  
  // Semantic colors
  cardBackground: '#1C1C1E',
  border: '#38383A',
  divider: '#48484A',
  
  // Tab bar specific
  tabBarBackground: 'rgba(30, 30, 30, 0.9)',
  tabBarTint: 'dark',
  tabBarBlur: 'dark',
  tabBarIcon: '#8E8E93',
  tabBarIconActive: '#0A84FF',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',
};

const createTheme = (isDarkMode: boolean): Theme => {
  const colors = isDarkMode ? darkColors : lightColors;
  
  return {
    colors,
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
        fontWeight: '700',
        letterSpacing: -0.4,
        lineHeight: 41,
      },
      title1: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.4,
        lineHeight: 34,
      },
      title2: {
        fontSize: 22,
        fontWeight: '600',
        letterSpacing: -0.2,
        lineHeight: 28,
      },
      title3: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.2,
        lineHeight: 25,
      },
      headline: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.4,
        lineHeight: 22,
      },
      body: {
        fontSize: 17,
        fontWeight: '400',
        letterSpacing: -0.4,
        lineHeight: 22,
      },
      callout: {
        fontSize: 16,
        fontWeight: '400',
        letterSpacing: -0.3,
        lineHeight: 21,
      },
      subheadline: {
        fontSize: 15,
        fontWeight: '400',
        letterSpacing: -0.2,
        lineHeight: 20,
      },
      footnote: {
        fontSize: 13,
        fontWeight: '400',
        letterSpacing: -0.1,
        lineHeight: 18,
      },
      caption1: {
        fontSize: 12,
        fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 16,
      },
      caption2: {
        fontSize: 11,
        fontWeight: '400',
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
        shadowOpacity: isDarkMode ? 0.15 : 0.05,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.08,
        shadowRadius: 8,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.25 : 0.12,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  };
};

export const lightTheme = createTheme(false);
export const darkTheme = createTheme(true);
export const getTheme = (isDarkMode: boolean) => createTheme(isDarkMode);