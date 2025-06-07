import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import { themeEngine, HolidayTheme } from '../services/themeEngine';

export const useHolidayTheme = () => {
  const [holidayTheme, setHolidayTheme] = useState<HolidayTheme | null>(null);
  const [theme, setTheme] = useState(themeEngine.getTheme());
  const [animations, setAnimations] = useState<{
    colorTransition?: Animated.Value;
    particleOpacity?: Animated.Value;
    pulseScale?: Animated.Value;
    sparkleRotation?: Animated.Value;
    floatTranslation?: Animated.Value;
  }>({});

  useEffect(() => {
    // Subscribe to theme changes
    const unsubscribe = themeEngine.subscribe((newHolidayTheme) => {
      setHolidayTheme(newHolidayTheme);
      setTheme(themeEngine.getTheme());
      
      // Get animation values
      setAnimations({
        colorTransition: themeEngine.getAnimationValue('colorTransition'),
        particleOpacity: themeEngine.getAnimationValue('particleOpacity'),
        pulseScale: themeEngine.getAnimationValue('pulseScale'),
        sparkleRotation: themeEngine.getAnimationValue('sparkleRotation'),
        floatTranslation: themeEngine.getAnimationValue('floatTranslation'),
      });
    });

    return unsubscribe;
  }, []);

  return {
    theme,
    holidayTheme,
    animations,
    isHolidayActive: holidayTheme !== null,
    setTheme: themeEngine.setTheme.bind(themeEngine),
    checkTheme: themeEngine.checkAndApplyTheme.bind(themeEngine),
  };
};

// Hook for animated theme colors
export const useThemedColors = () => {
  const { theme, holidayTheme, animations } = useHolidayTheme();
  const [animatedColors, setAnimatedColors] = useState<{
    primary: Animated.AnimatedInterpolation<string>;
    secondary: Animated.AnimatedInterpolation<string>;
    background: Animated.AnimatedInterpolation<string>;
  } | null>(null);

  useEffect(() => {
    if (!animations.colorTransition) return;

    const baseColors = {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#000000',
    };

    const holidayColors = holidayTheme ? {
      primary: holidayTheme.colors.primary[0],
      secondary: holidayTheme.colors.secondary[0],
      background: holidayTheme.colors.background[0],
    } : baseColors;

    setAnimatedColors({
      primary: animations.colorTransition.interpolate({
        inputRange: [0, 1],
        outputRange: [baseColors.primary, holidayColors.primary],
      }),
      secondary: animations.colorTransition.interpolate({
        inputRange: [0, 1],
        outputRange: [baseColors.secondary, holidayColors.secondary],
      }),
      background: animations.colorTransition.interpolate({
        inputRange: [0, 1],
        outputRange: [baseColors.background, holidayColors.background],
      }),
    });
  }, [holidayTheme, animations.colorTransition]);

  return animatedColors || {
    primary: theme.colors.primary.purple,
    secondary: theme.colors.primary.purpleDark,
    background: theme.colors.neutral.black,
  };
};

// Hook for theme-aware styles
export const useThemedStyles = () => {
  const { theme, holidayTheme } = useHolidayTheme();

  const getGlassStyle = (intensity: 'light' | 'medium' | 'dark' = 'medium') => {
    if (!holidayTheme) {
      return theme.getGlassStyle(intensity);
    }

    return {
      ...theme.getGlassStyle(intensity),
      backgroundColor: holidayTheme.colors.glass[intensity],
    };
  };

  const getGradientColors = (): [string, string, ...string[]] => {
    if (!holidayTheme) {
      return theme.colors.primary.gradient as [string, string, ...string[]];
    }
    
    return holidayTheme.colors.primary as [string, string, ...string[]];
  };

  const getAccentColor = () => {
    return holidayTheme?.colors.accent || theme.colors.primary.purple;
  };

  return {
    getGlassStyle,
    getGradientColors,
    getAccentColor,
    theme,
    holidayTheme,
  };
};