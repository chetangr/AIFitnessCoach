import { useThemeStore } from '../store/themeStore';
import { modernTheme } from '../config/modernTheme';

export const useModernTheme = () => {
  const { isDarkMode } = useThemeStore();
  
  // Light mode colors
  const lightColors = {
    ...modernTheme.colors,
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceLight: '#F2F2F7',
    textPrimary: '#000000',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',
    cardBackground: '#FFFFFF',
    border: '#E5E5EA',
    divider: '#E5E5EA',
  };
  
  // Return theme with appropriate colors
  return {
    ...modernTheme,
    colors: isDarkMode ? modernTheme.colors : lightColors,
  };
};