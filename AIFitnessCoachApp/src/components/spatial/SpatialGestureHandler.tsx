import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  PinchGestureHandler,
  RotationGestureHandler,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { spatialHaptics } from '../../services/spatialHaptics';

interface SpatialGestureHandlerProps {
  children: React.ReactNode;
  enablePinch?: boolean;
  enableRotation?: boolean;
  enablePan?: boolean;
  minScale?: number;
  maxScale?: number;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (rotation: number) => void;
  onPan?: (translation: { x: number; y: number }) => void;
}

export const SpatialGestureHandler: React.FC<SpatialGestureHandlerProps> = ({
  children,
  enablePinch = true,
  enableRotation = true,
  enablePan = true,
  minScale = 0.5,
  maxScale = 3,
  onGestureStart,
  onGestureEnd,
  onPinch,
  onRotate,
  onPan,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // Base values for gesture continuity
  const baseScale = useSharedValue(1);
  const baseRotation = useSharedValue(0);
  const baseTranslateX = useSharedValue(0);
  const baseTranslateY = useSharedValue(0);

  // Gesture state
  const [isGestureActive, setIsGestureActive] = useState(false);

  // Pinch gesture handler
  const pinchHandler = useAnimatedGestureHandler({
    onStart: () => {
      baseScale.value = scale.value;
      if (onGestureStart) {
        runOnJS(onGestureStart)();
      }
      runOnJS(setIsGestureActive)(true);
      runOnJS(spatialHaptics.pinchGesture)();
    },
    onActive: (event) => {
      const newScale = Math.max(
        minScale,
        Math.min(maxScale, baseScale.value * event.scale)
      );
      scale.value = newScale;
      
      if (onPinch) {
        runOnJS(onPinch)(newScale);
      }
    },
    onEnd: () => {
      // Snap to nearest logical scale
      if (scale.value < 0.8) {
        scale.value = withSpring(0.7);
      } else if (scale.value > 2.5) {
        scale.value = withSpring(2.5);
      } else if (scale.value > 0.9 && scale.value < 1.1) {
        scale.value = withSpring(1);
      }
      
      runOnJS(setIsGestureActive)(false);
      if (onGestureEnd) {
        runOnJS(onGestureEnd)();
      }
    },
  });

  // Rotation gesture handler
  const rotationHandler = useAnimatedGestureHandler({
    onStart: () => {
      baseRotation.value = rotation.value;
      if (!isGestureActive && onGestureStart) {
        runOnJS(onGestureStart)();
      }
      runOnJS(setIsGestureActive)(true);
      runOnJS(spatialHaptics.rotateGesture)();
    },
    onActive: (event) => {
      rotation.value = baseRotation.value + event.rotation;
      
      if (onRotate) {
        runOnJS(onRotate)(rotation.value);
      }
    },
    onEnd: () => {
      // Snap to 45-degree increments if close
      const degrees = (rotation.value * 180) / Math.PI;
      const snappedDegrees = Math.round(degrees / 45) * 45;
      rotation.value = withSpring((snappedDegrees * Math.PI) / 180);
      
      runOnJS(setIsGestureActive)(false);
      if (onGestureEnd) {
        runOnJS(onGestureEnd)();
      }
    },
  });

  // Pan gesture handler
  const panHandler = useAnimatedGestureHandler({
    onStart: () => {
      baseTranslateX.value = translateX.value;
      baseTranslateY.value = translateY.value;
      if (!isGestureActive && onGestureStart) {
        runOnJS(onGestureStart)();
      }
      runOnJS(setIsGestureActive)(true);
      runOnJS(spatialHaptics.swipeGesture)();
    },
    onActive: (event) => {
      translateX.value = baseTranslateX.value + event.translationX;
      translateY.value = baseTranslateY.value + event.translationY;
      
      if (onPan) {
        runOnJS(onPan)({
          x: translateX.value,
          y: translateY.value,
        });
      }
    },
    onEnd: () => {
      // Spring back to center if not far enough
      if (Math.abs(translateX.value) < 50 && Math.abs(translateY.value) < 50) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      
      runOnJS(setIsGestureActive)(false);
      if (onGestureEnd) {
        runOnJS(onGestureEnd)();
      }
    },
  });

  // Combined animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Reset function
  const reset = () => {
    scale.value = withSpring(1);
    rotation.value = withSpring(0);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    baseScale.value = 1;
    baseRotation.value = 0;
    baseTranslateX.value = 0;
    baseTranslateY.value = 0;
  };

  let gestureContent = (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );

  // Wrap with gesture handlers based on enabled features
  if (enablePan) {
    gestureContent = (
      <PanGestureHandler onGestureEvent={panHandler}>
        {gestureContent}
      </PanGestureHandler>
    );
  }

  if (enableRotation) {
    gestureContent = (
      <RotationGestureHandler onGestureEvent={rotationHandler}>
        {gestureContent}
      </RotationGestureHandler>
    );
  }

  if (enablePinch) {
    gestureContent = (
      <PinchGestureHandler onGestureEvent={pinchHandler}>
        {gestureContent}
      </PinchGestureHandler>
    );
  }

  return gestureContent;
};

// Specialized gesture components
export const PinchToZoomView: React.FC<{
  children: React.ReactNode;
  onZoomChange?: (scale: number) => void;
}> = ({ children, onZoomChange }) => (
  <SpatialGestureHandler
    enablePinch
    enableRotation={false}
    enablePan={false}
    onPinch={onZoomChange}
  >
    {children}
  </SpatialGestureHandler>
);

export const RotatableView: React.FC<{
  children: React.ReactNode;
  onRotateChange?: (rotation: number) => void;
}> = ({ children, onRotateChange }) => (
  <SpatialGestureHandler
    enablePinch={false}
    enableRotation
    enablePan={false}
    onRotate={onRotateChange}
  >
    {children}
  </SpatialGestureHandler>
);

export const DraggableView: React.FC<{
  children: React.ReactNode;
  onPositionChange?: (position: { x: number; y: number }) => void;
}> = ({ children, onPositionChange }) => (
  <SpatialGestureHandler
    enablePinch={false}
    enableRotation={false}
    enablePan
    onPan={onPositionChange}
  >
    {children}
  </SpatialGestureHandler>
);

// Full gesture view for maximum interaction
export const FullGestureView: React.FC<{
  children: React.ReactNode;
  onGestureChange?: (state: {
    scale: number;
    rotation: number;
    translation: { x: number; y: number };
  }) => void;
}> = ({ children, onGestureChange }) => {
  const [gestureState, setGestureState] = useState({
    scale: 1,
    rotation: 0,
    translation: { x: 0, y: 0 },
  });

  const updateGestureState = (newState: Partial<typeof gestureState>) => {
    const updatedState = { ...gestureState, ...newState };
    setGestureState(updatedState);
    onGestureChange?.(updatedState);
  };

  return (
    <SpatialGestureHandler
      enablePinch
      enableRotation
      enablePan
      onPinch={(scale) => updateGestureState({ scale })}
      onRotate={(rotation) => updateGestureState({ rotation })}
      onPan={(translation) => updateGestureState({ translation })}
    >
      {children}
    </SpatialGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});