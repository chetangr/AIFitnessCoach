import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

const SettingsScreen = () => {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;