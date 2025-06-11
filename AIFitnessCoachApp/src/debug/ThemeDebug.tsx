import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeDebug = () => {
  try {
    const themeContext = useTheme();
    console.log('ThemeDebug - context:', themeContext);
    console.log('ThemeDebug - theme:', themeContext?.theme);
    console.log('ThemeDebug - isDarkMode:', themeContext?.isDarkMode);
    
    return (
      <View>
        <Text>Theme Debug: {themeContext ? 'Context exists' : 'No context'}</Text>
        <Text>Has theme: {themeContext?.theme ? 'Yes' : 'No'}</Text>
        <Text>Dark mode: {themeContext?.isDarkMode ? 'Yes' : 'No'}</Text>
      </View>
    );
  } catch (error) {
    console.error('ThemeDebug error:', error);
    return (
      <View>
        <Text>Theme Debug Error: {error.message}</Text>
      </View>
    );
  }
};