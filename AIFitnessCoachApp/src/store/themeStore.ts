import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SunriseSunsetService } from '../services/sunriseSunsetService';

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
    primary: '#667eea',
    secondary: '#764ba2',
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
    primary: '#667eea',
    secondary: '#764ba2',
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
  autoMode: boolean;
  theme: Theme;
  toggleTheme: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  setAutoMode: (enabled: boolean) => void;
  checkAndUpdateTheme: () => Promise<void>;
  initializeAutoMode: () => void;
}

let autoModeInterval: NodeJS.Timeout | null = null;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      autoMode: false,
      theme: lightTheme,

      toggleTheme: () => {
        set((state) => ({
          isDarkMode: !state.isDarkMode,
          theme: !state.isDarkMode ? darkTheme : lightTheme,
          autoMode: false, // Disable auto mode when manually toggling
        }));
      },

      toggleDarkMode: () => {
        set((state) => ({
          isDarkMode: !state.isDarkMode,
          theme: !state.isDarkMode ? darkTheme : lightTheme,
          autoMode: false, // Disable auto mode when manually toggling
        }));
      },

      setDarkMode: (isDark: boolean) => {
        console.log('ThemeStore: setDarkMode called with:', isDark);
        set((state) => {
          console.log('ThemeStore: Previous state:', state.isDarkMode, 'New state:', isDark);
          return {
            isDarkMode: isDark,
            theme: isDark ? darkTheme : lightTheme,
          };
        });
      },

      setAutoMode: async (enabled: boolean) => {
        console.log('ThemeStore: setAutoMode called with:', enabled);
        
        // Clear any existing interval
        if (autoModeInterval) {
          clearInterval(autoModeInterval);
          autoModeInterval = null;
        }

        set({ autoMode: enabled });

        if (enabled) {
          // Check immediately
          await get().checkAndUpdateTheme();
          
          // Set up interval to check every minute
          autoModeInterval = setInterval(() => {
            get().checkAndUpdateTheme();
          }, 60000); // Check every minute
        }
      },

      checkAndUpdateTheme: async () => {
        const state = get();
        if (!state.autoMode) return;

        try {
          const isDark = await SunriseSunsetService.isDarkTime();
          if (isDark !== state.isDarkMode) {
            console.log('ThemeStore: Auto updating theme based on sun times. Dark:', isDark);
            state.setDarkMode(isDark);
          }
        } catch (error) {
          console.error('Error checking sun times:', error);
        }
      },

      initializeAutoMode: () => {
        const state = get();
        if (state.autoMode) {
          // Re-initialize auto mode after app restart
          state.setAutoMode(true);
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isDarkMode: state.isDarkMode, autoMode: state.autoMode }),
      onRehydrateStorage: () => {
        console.log('ThemeStore: Starting rehydration...');
        return (state) => {
          if (state) {
            console.log('ThemeStore: Rehydrated with isDarkMode:', state.isDarkMode, 'autoMode:', state.autoMode);
            state.theme = state.isDarkMode ? darkTheme : lightTheme;
            // Initialize auto mode if it was enabled
            if (state.autoMode) {
              setTimeout(() => state.initializeAutoMode(), 1000); // Delay to ensure app is ready
            }
          } else {
            console.log('ThemeStore: No stored state found, using default');
          }
        };
      },
    },
  ),
);