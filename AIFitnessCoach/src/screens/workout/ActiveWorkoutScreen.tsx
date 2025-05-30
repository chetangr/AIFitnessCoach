import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

const ActiveWorkoutScreen = () => {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Active Workout Screen</Text>
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

export default ActiveWorkoutScreen;