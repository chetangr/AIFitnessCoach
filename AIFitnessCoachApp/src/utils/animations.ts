import { Animated, Easing } from 'react-native';

// Common animation durations
export const ANIMATION_DURATION = {
  fast: 100,
  normal: 200,
  slow: 300,
  verySlow: 500,
};

// Scale animation for press effects
export const createScaleAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 0.95,
  duration: number = ANIMATION_DURATION.fast
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.out(Easing.quad),
  });
};

// Bounce animation for buttons
export const createBounceAnimation = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 0.9,
      duration: ANIMATION_DURATION.fast,
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }),
  ]);
};

// Fade animation
export const createFadeAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  duration: number = ANIMATION_DURATION.normal
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.inOut(Easing.ease),
  });
};

// Slide animation
export const createSlideAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 0,
  duration: number = ANIMATION_DURATION.normal
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  });
};

// Rotate animation
export const createRotateAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  duration: number = ANIMATION_DURATION.slow
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.linear,
  });
};

// Stagger animation for lists
export const createStaggerAnimation = (
  animations: Animated.CompositeAnimation[],
  delay: number = 50
) => {
  return Animated.stagger(delay, animations);
};

// Parallel animation
export const createParallelAnimation = (animations: Animated.CompositeAnimation[]) => {
  return Animated.parallel(animations);
};

// Hook for scale press animation
export const usePressAnimation = (initialScale: number = 1) => {
  const scaleValue = new Animated.Value(initialScale);

  const onPressIn = () => {
    createScaleAnimation(scaleValue, 0.95).start();
  };

  const onPressOut = () => {
    createScaleAnimation(scaleValue, 1).start();
  };

  return {
    scaleValue,
    onPressIn,
    onPressOut,
    animatedStyle: {
      transform: [{ scale: scaleValue }],
    },
  };
};

// Hook for fade in animation on mount
export const useFadeInAnimation = (delay: number = 0, duration: number = ANIMATION_DURATION.normal) => {
  const fadeValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return {
    fadeValue,
    animatedStyle: {
      opacity: fadeValue,
    },
  };
};

// Hook for slide in animation
export const useSlideInAnimation = (
  from: 'left' | 'right' | 'top' | 'bottom' = 'bottom',
  delay: number = 0
) => {
  const slideValue = new Animated.Value(getInitialSlideValue(from));

  React.useEffect(() => {
    Animated.timing(slideValue, {
      toValue: 0,
      duration: ANIMATION_DURATION.normal,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const animatedStyle = getSlideAnimatedStyle(from, slideValue);

  return {
    slideValue,
    animatedStyle,
  };
};

const getInitialSlideValue = (from: 'left' | 'right' | 'top' | 'bottom'): number => {
  switch (from) {
    case 'left':
    case 'top':
      return -100;
    case 'right':
    case 'bottom':
      return 100;
  }
};

const getSlideAnimatedStyle = (
  from: 'left' | 'right' | 'top' | 'bottom',
  slideValue: Animated.Value
) => {
  switch (from) {
    case 'left':
    case 'right':
      return { transform: [{ translateX: slideValue }] };
    case 'top':
    case 'bottom':
      return { transform: [{ translateY: slideValue }] };
  }
};

// React import for hooks
import React from 'react';