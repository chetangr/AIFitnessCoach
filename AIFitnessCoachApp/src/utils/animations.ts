import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

// Animation duration constants
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Easing alias for backward compatibility
export const EASING = {
  easeOut: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  easeIn: Easing.bezier(0.42, 0, 1, 1),
  easeInOut: Easing.bezier(0.42, 0, 0.58, 1),
};

// Apple-style easing curves
export const easings = {
  // Standard curves
  easeInOut: Easing.bezier(0.42, 0, 0.58, 1),
  easeOut: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  easeIn: Easing.bezier(0.42, 0, 1, 1),
  
  // Apple's custom curves
  appleEase: Easing.bezier(0.25, 0.1, 0.25, 1),
  appleSpring: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  
  // Material Design curves
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0, 1, 1),
};

// Animation hooks
export const useFadeIn = (delay: number = 0, duration: number = 300) => {
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        easing: easings.easeOut,
        useNativeDriver: true,
      }).start();
    }, delay);
    
    return () => clearTimeout(timer);
  }, []);
  
  return opacity;
};

// Fade in animation with style
export const useFadeInAnimation = (delay: number = 0, duration: number = 300) => {
  const fadeValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeValue, {
        toValue: 1,
        duration,
        easing: easings.easeOut,
        useNativeDriver: true,
      }).start();
    }, delay);
    
    return () => clearTimeout(timer);
  }, []);
  
  const animatedStyle = {
    opacity: fadeValue,
  };
  
  return { fadeValue, animatedStyle };
};

export const useSlideIn = (
  from: 'bottom' | 'top' | 'left' | 'right' = 'bottom',
  delay: number = 0,
  distance: number = 50
) => {
  const translateX = useRef(new Animated.Value(
    from === 'left' ? -distance : from === 'right' ? distance : 0
  )).current;
  
  const translateY = useRef(new Animated.Value(
    from === 'top' ? -distance : from === 'bottom' ? distance : 0
  )).current;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    
    return () => clearTimeout(timer);
  }, []);
  
  return { translateX, translateY };
};

export const useScale = (initialScale: number = 0.9, delay: number = 0) => {
  const scale = useRef(new Animated.Value(initialScale)).current;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, delay);
    
    return () => clearTimeout(timer);
  }, []);
  
  return scale;
};

// Entrance animation with stagger
export const useStaggeredEntrance = (itemCount: number, baseDelay: number = 0) => {
  const animations = useRef(
    Array(itemCount).fill(0).map(() => new Animated.Value(0))
  ).current;
  
  useEffect(() => {
    const staggerDelay = 50; // ms between each item
    
    animations.forEach((anim, index) => {
      setTimeout(() => {
        Animated.spring(anim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, baseDelay + (index * staggerDelay));
    });
  }, []);
  
  return animations;
};

// Press animation
export const usePressAnimation = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  
  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };
  
  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };
  
  const animatedStyle = {
    transform: [{ scale: scaleValue }],
  };
  
  return { scaleValue, onPressIn, onPressOut, animatedStyle, scale: scaleValue, handlePressIn: onPressIn, handlePressOut: onPressOut };
};

// Parallax scroll animation
export const useParallaxScroll = (scrollY: Animated.Value, rate: number = 0.5) => {
  const translateY = scrollY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-rate, 0, rate],
  });
  
  return translateY;
};

// Pulse animation
export const createPulseAnimation = (minScale: number = 0.95, maxScale: number = 1.05) => {
  const scale = new Animated.Value(1);
  
  const pulse = Animated.loop(
    Animated.sequence([
      Animated.timing(scale, {
        toValue: maxScale,
        duration: 1000,
        easing: easings.easeInOut,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: minScale,
        duration: 1000,
        easing: easings.easeInOut,
        useNativeDriver: true,
      }),
    ])
  );
  
  return { scale, pulse };
};

// Shimmer effect for loading states
export const useShimmer = () => {
  const shimmerValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        easing: easings.easeInOut,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });
  
  return translateX;
};

// Legacy functions for backward compatibility
export const createFadeInAnimation = (duration: number = 300) => {
  const animatedValue = new Animated.Value(0);
  
  const fadeIn = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: easings.easeOut,
      useNativeDriver: true,
    }).start();
  };
  
  return { animatedValue, fadeIn };
};

export const createSlideInAnimation = (
  initialPosition: number = 50,
  duration: number = 300
) => {
  const animatedValue = new Animated.Value(initialPosition);
  
  const slideIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };
  
  return { animatedValue, slideIn };
};