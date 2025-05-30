import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  glass: string;
  glassLight: string;
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
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#4F46E5',
    secondary: '#7C3AED',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    glass: 'rgba(255, 255, 255, 0.1)',
    glassLight: 'rgba(255, 255, 255, 0.2)',
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
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#334155',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    glass: 'rgba(0, 0, 0, 0.3)',
    glassLight: 'rgba(0, 0, 0, 0.2)',
  },
};

interface ThemeState {
  isDarkMode: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      theme: lightTheme,

      toggleTheme: () => {
        set((state) => ({
          isDarkMode: !state.isDarkMode,
          theme: !state.isDarkMode ? darkTheme : lightTheme,
        }));
      },

      setDarkMode: (isDark: boolean) => {
        set({
          isDarkMode: isDark,
          theme: isDark ? darkTheme : lightTheme,
        });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.theme = state.isDarkMode ? darkTheme : lightTheme;
        }
      },
    },
  ),
);