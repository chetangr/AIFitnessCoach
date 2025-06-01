import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';

interface SpatialLayerType {
  depth: number;
  parallaxFactor?: number;
  scaleWithDepth?: boolean;
  children: React.ReactNode;
}

interface SpatialContainerProps {
  children: React.ReactNode;
  layers?: SpatialLayerType[];
  scrollY?: SharedValue<number>;
  style?: ViewStyle;
}

export const SpatialContainer: React.FC<SpatialContainerProps> = ({
  children,
  layers = [],
  scrollY,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {layers.map((layer, index) => (
        <SpatialLayerView key={index} layer={layer} scrollY={scrollY} />
      ))}
      {children}
    </View>
  );
};

const SpatialLayerView: React.FC<{
  layer: SpatialLayerType;
  scrollY?: SharedValue<number>;
}> = ({ layer, scrollY }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const style: any = {};
    
    if (scrollY && layer.parallaxFactor) {
      const parallaxOffset = interpolate(
        scrollY.value,
        [-1000, 0, 1000],
        [-layer.parallaxFactor * 500, 0, layer.parallaxFactor * 500]
      );
      style.transform = [{ translateY: parallaxOffset }];
    }

    if (layer.scaleWithDepth) {
      const scale = 1 - (layer.depth * 0.1);
      if (!style.transform) style.transform = [];
      style.transform.push({ scale });
    }

    const opacity = interpolate(
      layer.depth,
      [0, 10],
      [1, 0.3]
    );
    style.opacity = opacity;

    return style;
  });

  return (
    <Animated.View 
      style={[
        styles.layer,
        { zIndex: -layer.depth },
        animatedStyle
      ]}
    >
      {layer.children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});