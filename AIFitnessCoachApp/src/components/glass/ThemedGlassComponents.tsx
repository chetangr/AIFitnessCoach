import React, { useEffect, useState } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { themeEngine, HolidayTheme } from '../../services/themeEngine';
import {
  GlassButton,
  GlassCard,
  GlassContainer,
} from './GlassComponents';

// Re-export props interfaces
interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'dark';
}

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'dark' | 'heavy';
  animated?: boolean;
  delay?: number;
}

// Particle System Component
interface ParticleSystemProps {
  theme: HolidayTheme;
  style?: ViewStyle;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ theme, style }) => {
  const [particles, setParticles] = useState<Array<{
    id: string;
    x: Animated.Value;
    y: Animated.Value;
    rotation: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
    initialX: number;
  }>>([]);

  useEffect(() => {
    if (!theme.particles) return;

    // Create particles
    const newParticles = Array.from({ length: theme.particles.count }, (_, i) => {
      const initialX = Math.random() * 400;
      return {
        id: `particle-${i}`,
        x: new Animated.Value(initialX),
        y: new Animated.Value(-50),
        rotation: new Animated.Value(0),
        opacity: new Animated.Value(Math.random() * 0.8 + 0.2),
        scale: new Animated.Value(Math.random() * 0.5 + 0.5),
        initialX,
      };
    });

    setParticles(newParticles);

    // Animate particles
    newParticles.forEach((particle, index) => {
      const delay = index * 100;
      
      // Falling animation
      Animated.loop(
        Animated.timing(particle.y, {
          toValue: 1000,
          duration: 10000 + Math.random() * 5000,
          delay,
          useNativeDriver: true,
        })
      ).start();

      // Rotation animation
      if (theme.particles && (theme.particles.type === 'snow' || theme.particles.type === 'leaves')) {
        Animated.loop(
          Animated.timing(particle.rotation, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          })
        ).start();
      }

      // Horizontal drift
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.x, {
            toValue: particle.initialX + 50,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: particle.initialX - 50,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    return () => {
      // Cleanup animations
      newParticles.forEach(particle => {
        particle.x.stopAnimation();
        particle.y.stopAnimation();
        particle.rotation.stopAnimation();
        particle.opacity.stopAnimation();
      });
    };
  }, [theme]);

  const renderParticle = (particle: typeof particles[0]) => {
    const particleIcon = {
      snow: '❄️',
      hearts: '❤️',
      stars: '⭐',
      leaves: '🍃',
      fireworks: '✨',
      confetti: '🎊',
    };

    const rotation = particle.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.Text
        key={particle.id}
        style={[
          styles.particle,
          {
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { rotate: rotation },
              { scale: particle.scale },
            ],
            opacity: particle.opacity,
          },
        ]}
      >
        {particleIcon[theme.particles!.type]}
      </Animated.Text>
    );
  };

  if (!theme.particles) return null;

  return (
    <View style={[styles.particleContainer, style]} pointerEvents="none">
      {particles.map(renderParticle)}
    </View>
  );
};

// Themed Glass Button
export const ThemedGlassButton: React.FC<GlassButtonProps> = (props) => {
  const [holidayTheme, setHolidayTheme] = useState<HolidayTheme | null>(null);
  const pulseScale = themeEngine.getAnimationValue('pulseScale');
  const sparkleRotation = themeEngine.getAnimationValue('sparkleRotation');

  useEffect(() => {
    const unsubscribe = themeEngine.subscribe(setHolidayTheme);
    return unsubscribe;
  }, []);

  const animatedStyle = {
    transform: [
      ...(pulseScale && holidayTheme?.animations?.pulse
        ? [{ scale: pulseScale }]
        : []),
      ...(sparkleRotation && holidayTheme?.animations?.sparkle
        ? [{ rotate: sparkleRotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          })}]
        : []),
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
      <GlassButton {...props} />
      {holidayTheme?.animations?.sparkle && (
        <View style={styles.sparkleOverlay} pointerEvents="none">
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
            style={styles.sparkle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      )}
    </Animated.View>
  );
};

// Themed Glass Card
export const ThemedGlassCard: React.FC<GlassCardProps> = ({ children, ...props }) => {
  const [holidayTheme, setHolidayTheme] = useState<HolidayTheme | null>(null);
  const floatTranslation = themeEngine.getAnimationValue('floatTranslation');

  useEffect(() => {
    const unsubscribe = themeEngine.subscribe(setHolidayTheme);
    return unsubscribe;
  }, []);

  const animatedStyle = floatTranslation && holidayTheme?.animations?.float
    ? { transform: [{ translateY: floatTranslation }] }
    : {};

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard {...props}>
        {holidayTheme && <ParticleSystem theme={holidayTheme} style={styles.cardParticles} />}
        {children}
      </GlassCard>
    </Animated.View>
  );
};

// Themed Glass Container
export const ThemedGlassContainer: React.FC<GlassContainerProps> = ({ children, style, ...props }) => {
  const [holidayTheme, setHolidayTheme] = useState<HolidayTheme | null>(null);
  const currentTheme = themeEngine.getTheme();

  useEffect(() => {
    const unsubscribe = themeEngine.subscribe(setHolidayTheme);
    return unsubscribe;
  }, []);

  if (!holidayTheme) {
    return <GlassContainer style={style} {...props}>{children}</GlassContainer>;
  }

  return (
    <View style={style}>
      <LinearGradient
        colors={holidayTheme.colors.background as [string, string, ...string[]]}
        style={styles.themedBackground}
      >
        <BlurView
          intensity={80}
          tint="light"
          style={[
            styles.themedGlass,
            { backgroundColor: currentTheme.colors.glass.mediumOverlay },
          ]}
        >
          {children}
          <ParticleSystem theme={holidayTheme} style={styles.containerParticles} />
        </BlurView>
      </LinearGradient>
    </View>
  );
};

// Theme Selector Component
export const ThemeSelector: React.FC = () => {
  const [themes] = useState(themeEngine.getAvailableThemes());
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = themeEngine.subscribe((theme) => {
      setActiveTheme(theme?.id || null);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.themeSelector}>
      {themes.map((theme) => (
        <TouchableOpacity
          key={theme.id}
          onPress={() => themeEngine.setTheme(theme.id)}
          style={[
            styles.themeOption,
            activeTheme === theme.id && styles.activeThemeOption,
          ]}
        >
          <LinearGradient
            colors={theme.colors.primary as [string, string, ...string[]]}
            style={styles.themePreview}
          >
            <Text style={styles.themeName}>{theme.name}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={() => themeEngine.setTheme(null)}
        style={[
          styles.themeOption,
          !activeTheme && styles.activeThemeOption,
        ]}
      >
        <View style={[styles.themePreview, styles.defaultTheme]}>
          <Text style={styles.themeName}>Default</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    fontSize: 20,
  },
  sparkleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    flex: 1,
  },
  cardParticles: {
    borderRadius: 16,
  },
  containerParticles: {
    zIndex: -1,
  },
  themedBackground: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  themedGlass: {
    flex: 1,
    padding: 16,
  },
  themeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  themeOption: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThemeOption: {
    borderColor: '#667eea',
  },
  themePreview: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultTheme: {
    backgroundColor: '#667eea',
  },
  themeName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default {
  ThemedGlassButton,
  ThemedGlassCard,
  ThemedGlassContainer,
  ThemeSelector,
  ParticleSystem,
};