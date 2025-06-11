import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { getTheme, Theme } from '../config/dynamicTheme';

interface ThemeContextValue {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const { isDarkMode, autoMode, toggleDarkMode } = useThemeStore();
  
  // Determine actual dark mode state
  const actualIsDarkMode = autoMode ? colorScheme === 'dark' : isDarkMode;
  const theme = getTheme(actualIsDarkMode);
  
  useEffect(() => {
    // Update theme when system theme changes in auto mode
    if (autoMode && colorScheme !== null) {
      const shouldBeDark = colorScheme === 'dark';
      if (shouldBeDark !== isDarkMode) {
        useThemeStore.getState().setDarkMode(shouldBeDark);
      }
    }
  }, [colorScheme, autoMode, isDarkMode]);
  
  const contextValue: ThemeContextValue = {
    theme,
    isDarkMode: actualIsDarkMode,
    toggleTheme: toggleDarkMode,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return a default theme to prevent crashes during initialization
    console.warn('useTheme called outside of ThemeProvider, returning default theme');
    return {
      theme: getTheme(false),
      isDarkMode: false,
      toggleTheme: () => console.warn('toggleTheme called outside of ThemeProvider'),
    };
  }
  return context;
};