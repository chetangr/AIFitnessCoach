import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SunriseSunsetService } from '../services/sunriseSunsetService';

export interface ThemeColors {
  primary: {
    main: string;
    gradient: string[];
  };
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

const themePresets = {
  default: {
    name: 'Default',
    gradient: ['#667eea', '#764ba2', '#f093fb'],
    primary: '#667eea',
    secondary: '#764ba2',
  },
  festival: {
    name: 'Festival',
    gradient: ['#FF6B6B', '#FFB347', '#FFE66D'],
    primary: '#FF6B6B',
    secondary: '#FFB347',
  },
  ocean: {
    name: 'Ocean',
    gradient: ['#4ECDC4', '#44A08D', '#093637'],
    primary: '#4ECDC4',
    secondary: '#44A08D',
  },
  sunset: {
    name: 'Sunset',
    gradient: ['#F97B22', '#F15412', '#D22B2B'],
    primary: '#F97B22',
    secondary: '#F15412',
  },
  forest: {
    name: 'Forest',
    gradient: ['#2C7744', '#3D8B53', '#4E9F62'],
    primary: '#2C7744',
    secondary: '#3D8B53',
  },
};

const createTheme = (isDark: boolean, themeColor: string): Theme => {
  const preset = themePresets[themeColor as keyof typeof themePresets] || themePresets.default;
  
  const baseTheme: Theme = {
    colors: {
      primary: {
        main: preset.primary,
        gradient: preset.gradient,
      },
      secondary: preset.secondary,
      background: isDark ? '#0F172A' : '#FFFFFF',
      surface: isDark ? '#1E293B' : '#F9FAFB',
      text: isDark ? '#F9FAFB' : '#111827',
      textSecondary: isDark ? '#9CA3AF' : '#6B7280',
      border: isDark ? '#334155' : '#E5E7EB',
      error: isDark ? '#F87171' : '#EF4444',
      success: isDark ? '#34D399' : '#10B981',
      warning: isDark ? '#FBBF24' : '#F59E0B',
      info: isDark ? '#60A5FA' : '#3B82F6',
      glass: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
      glassLight: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
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
  
  return baseTheme;
};

interface ThemeState {
  isDarkMode: boolean;
  autoMode: boolean;
  themeColor: string;
  theme: Theme;
  toggleTheme: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  setAutoMode: (enabled: boolean) => void;
  setThemeColor: (color: string) => void;
  checkAndUpdateTheme: () => Promise<void>;
  initializeAutoMode: () => void;
}

let autoModeInterval: NodeJS.Timeout | null = null;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      autoMode: false,
      themeColor: 'default',
      theme: createTheme(false, 'default'),

      toggleTheme: () => {
        set((state) => ({
          isDarkMode: !state.isDarkMode,
          theme: createTheme(!state.isDarkMode, state.themeColor),
          autoMode: false, // Disable auto mode when manually toggling
        }));
      },

      toggleDarkMode: () => {
        set((state) => ({
          isDarkMode: !state.isDarkMode,
          theme: createTheme(!state.isDarkMode, state.themeColor),
          autoMode: false, // Disable auto mode when manually toggling
        }));
      },

      setDarkMode: (isDark: boolean) => {
        console.log('ThemeStore: setDarkMode called with:', isDark);
        set((state) => {
          console.log('ThemeStore: Previous state:', state.isDarkMode, 'New state:', isDark);
          return {
            isDarkMode: isDark,
            theme: createTheme(isDark, state.themeColor),
          };
        });
      },

      setThemeColor: (color: string) => {
        console.log('ThemeStore: setThemeColor called with:', color);
        set((state) => ({
          themeColor: color,
          theme: createTheme(state.isDarkMode, color),
        }));
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
      partialize: (state) => ({ 
        isDarkMode: state.isDarkMode, 
        autoMode: state.autoMode,
        themeColor: state.themeColor 
      }),
      onRehydrateStorage: () => {
        console.log('ThemeStore: Starting rehydration...');
        return (state) => {
          if (state) {
            console.log('ThemeStore: Rehydrated with isDarkMode:', state.isDarkMode, 'autoMode:', state.autoMode, 'themeColor:', state.themeColor);
            state.theme = createTheme(state.isDarkMode, state.themeColor);
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