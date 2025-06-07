import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../config/theme';
import { usePressAnimation, useFadeInAnimation } from '../utils/animations';
import { dynamicThemeService, ThemeConfig } from '../services/dynamicThemeService';

// Theme-aware Glass Button
interface ThemedGlassButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const ThemedGlassButton: React.FC<ThemedGlassButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  variant = 'primary',
  disabled = false,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(dynamicThemeService.getCurrentTheme());
  const isPrimary = variant === 'primary';
  const { scaleValue, onPressIn, onPressOut, animatedStyle } = usePressAnimation();

  useEffect(() => {
    const unsubscribe = dynamicThemeService.addThemeChangeListener((theme) => {
      setCurrentTheme(theme);
    });
    return unsubscribe;
  }, []);

  const getColors = () => {
    if (isPrimary) {
      return currentTheme.primary.slice(0, 2).map(color => color + 'CC');
    }
    return ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'];
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getColors()}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <BlurView
          intensity={currentTheme.glass.intensity}
          tint={currentTheme.glass.tint}
          style={styles.blur}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={[styles.buttonText, theme.typography.headline, textStyle]}>{title}</Text>
          )}
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Theme-aware Glass Card
interface ThemedGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: keyof typeof theme.glass;
  animate?: boolean;
  delay?: number;
}

export const ThemedGlassCard: React.FC<ThemedGlassCardProps> = ({
  children,
  style,
  intensity = 'medium',
  animate = true,
  delay = 0,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(dynamicThemeService.getCurrentTheme());
  const { fadeValue, animatedStyle } = useFadeInAnimation(delay);

  useEffect(() => {
    const unsubscribe = dynamicThemeService.addThemeChangeListener((theme) => {
      setCurrentTheme(theme);
    });
    return unsubscribe;
  }, []);

  const glassProps = theme.getGlassProps(intensity);
  const glassStyle = theme.getGlassStyle(intensity);

  const gradientColors = [
    currentTheme.glass.overlay,
    'rgba(255,255,255,0.05)'
  ];

  const content = (
    <View style={[styles.cardContainer, glassStyle, style]}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <BlurView 
        intensity={currentTheme.glass.intensity} 
        tint={currentTheme.glass.tint}
        style={styles.cardBlur}
      >
        {children}
      </BlurView>
    </View>
  );

  return animate ? (
    <Animated.View style={animatedStyle}>
      {content}
    </Animated.View>
  ) : content;
};

// Theme-aware Glass Container
interface ThemedGlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  showParticles?: boolean;
}

export const ThemedGlassContainer: React.FC<ThemedGlassContainerProps> = ({
  children,
  style,
  showParticles = true,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(dynamicThemeService.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = dynamicThemeService.addThemeChangeListener((theme) => {
      setCurrentTheme(theme);
    });
    return unsubscribe;
  }, []);

  return (
    <LinearGradient
      colors={currentTheme.primary}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {showParticles && currentTheme.particles && (
        <ParticleEffect type={currentTheme.particles} />
      )}
      {children}
    </LinearGradient>
  );
};

// Particle Effect Component
interface ParticleEffectProps {
  type: string;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ type }) => {
  const particles = useParticleAnimation(type);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((particle, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.particle,
            {
              transform: particle.transforms,
              opacity: particle.opacity,
            },
          ]}
        >
          {particle.emoji}
        </Animated.Text>
      ))}
    </View>
  );
};

// Hook for particle animations
const useParticleAnimation = (type: string) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const config = dynamicThemeService.getParticleConfig(type);
    if (!config) return;

    const particleEmojis: Record<string, string[]> = {
      snowflakes: ['❄️', '❅', '❆'],
      hearts: ['❤️', '💕', '💖'],
      leaves: ['🍂', '🍁', '🍃'],
      fireworks: ['✨', '💫', '⭐'],
    };

    const emojis = particleEmojis[type] || ['✨'];
    const newParticles = [];

    for (let i = 0; i < (config.count || 10); i++) {
      const translateY = new Animated.Value(-50);
      const translateX = new Animated.Value(Math.random() * 400 - 200);
      const opacity = new Animated.Value(0);
      const rotation = new Animated.Value(0);

      // Start animations
      Animated.loop(
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 800,
            duration: (config.speed || 1) * 10000,
            useNativeDriver: true,
          }),
          config.sway && Animated.sequence([
            Animated.timing(translateX, {
              toValue: translateX._value + 30,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: translateX._value - 30,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          config.rotation && Animated.timing(rotation, {
            toValue: 360,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Fade in
      Animated.timing(opacity, {
        toValue: config.opacity ? config.opacity[1] : 0.6,
        duration: 1000,
        delay: i * 200,
        useNativeDriver: true,
      }).start();

      newParticles.push({
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        transforms: [
          { translateY },
          { translateX },
          { rotate: rotation.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg'],
          })},
        ],
        opacity,
      });
    }

    setParticles(newParticles);
  }, [type]);

  return particles;
};

// Theme Selector Component
interface ThemeSelectorProps {
  style?: ViewStyle;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { scaleValue, onPressIn, onPressOut } = usePressAnimation();

  const themes = [
    { type: 'default', emoji: '🎨', name: 'Default' },
    { type: 'christmas', emoji: '🎄', name: 'Christmas' },
    { type: 'new_year', emoji: '🎊', name: 'New Year' },
    { type: 'valentine', emoji: '❤️', name: 'Valentine' },
    { type: 'halloween', emoji: '🎃', name: 'Halloween' },
    { type: 'summer', emoji: '☀️', name: 'Summer' },
    { type: 'winter', emoji: '❄️', name: 'Winter' },
    { type: 'spring', emoji: '🌸', name: 'Spring' },
    { type: 'autumn', emoji: '🍂', name: 'Autumn' },
  ];

  return (
    <View style={[styles.themeSelectorContainer, style]}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.themeSelectorButton}
      >
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Text style={styles.themeSelectorIcon}>🎨</Text>
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <ThemedGlassCard style={styles.themeList}>
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme.type}
              style={styles.themeItem}
              onPress={() => {
                dynamicThemeService.setTheme(theme.type as any);
                setIsExpanded(false);
              }}
            >
              <Text style={styles.themeEmoji}>{theme.emoji}</Text>
              <Text style={styles.themeName}>{theme.name}</Text>
            </TouchableOpacity>
          ))}
        </ThemedGlassCard>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    ...theme.shadows.medium,
  },
  blur: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.textPrimary,
  },
  cardContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  cardBlur: {
    padding: theme.spacing.md,
  },
  particle: {
    position: 'absolute',
    fontSize: 20,
  },
  themeSelectorContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  themeSelectorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  themeSelectorIcon: {
    fontSize: 30,
  },
  themeList: {
    position: 'absolute',
    top: 60,
    right: 0,
    minWidth: 150,
    padding: 0,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  themeName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
});