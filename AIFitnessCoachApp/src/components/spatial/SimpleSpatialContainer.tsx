import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface SimpleSpatialContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SimpleSpatialContainer: React.FC<SimpleSpatialContainerProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});