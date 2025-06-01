import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { VisionGlass } from './VisionGlass';
import { FloatingElement } from './FloatingElement';

interface ProgressOrbProps {
  progress: number; // 0-1
  size?: number;
  title: string;
  subtitle?: string;
  color?: string[];
  glowIntensity?: number;
  animated?: boolean;
  style?: any;
}

export const ProgressOrb: React.FC<ProgressOrbProps> = ({
  progress,
  size = 120,
  title,
  subtitle,
  color = ['#667eea', '#764ba2'],
  glowIntensity = 0.8,
  animated = true,
  style,
}) => {
  const animatedProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(glowIntensity);

  useEffect(() => {
    // Animate progress
    animatedProgress.value = withTiming(progress, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });

    if (animated) {
      // Continuous pulse
      pulseScale.value = withRepeat(
        withTiming(1.05, { duration: 2000 }),
        -1,
        true
      );

      // Continuous rotation
      rotation.value = withRepeat(
        withTiming(360, { duration: 10000, easing: Easing.linear }),
        -1,
        false
      );

      // Glow pulse
      glowOpacity.value = withRepeat(
        withTiming(glowIntensity * 0.5, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [progress, animated, glowIntensity]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => {
    const progressAngle = interpolate(
      animatedProgress.value,
      [0, 1],
      [0, 360]
    );

    return {
      transform: [{ rotate: `${progressAngle}deg` }],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const contentOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(animatedProgress.value, [0, 0.1], [0, 1]),
  }));

  return (
    <View style={[styles.container, style]}>
      <FloatingElement variant="subtle" depth={2}>
        <Animated.View style={[{ width: size, height: size }, orbStyle]}>
          {/* Outer glow */}
          <Animated.View style={[styles.outerGlow, glowStyle]}>
            <LinearGradient
              colors={[...color, 'transparent']}
              style={[styles.glowGradient, { width: size * 1.4, height: size * 1.4 }]}
            />
          </Animated.View>

          {/* Main orb */}
          <VisionGlass
            variant="thick"
            depth={3}
            floating
            style={{ width: size, height: size, borderRadius: size / 2 }}
          >
            <LinearGradient
              colors={color}
              style={[styles.orbGradient, { borderRadius: size / 2 }]}
            >
              {/* Progress ring */}
              <View style={styles.progressContainer}>
                <Animated.View style={[styles.progressRing, progressStyle]}>
                  <LinearGradient
                    colors={['white', 'rgba(255,255,255,0.5)']}
                    style={[styles.progressGradient, { 
                      width: size * 0.9, 
                      height: size * 0.9,
                      borderRadius: size * 0.45,
                    }]}
                  />
                </Animated.View>
              </View>

              {/* Content */}
              <Animated.View style={[styles.content, contentOpacity]}>
                <Text style={[styles.progressText, { fontSize: size * 0.15 }]}>
                  {Math.round(progress * 100)}%
                </Text>
                <Text style={[styles.titleText, { fontSize: size * 0.08 }]}>
                  {title}
                </Text>
                {subtitle && (
                  <Text style={[styles.subtitleText, { fontSize: size * 0.06 }]}>
                    {subtitle}
                  </Text>
                )}
              </Animated.View>

              {/* Inner particles */}
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.innerParticle,
                    {
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 200}ms`,
                    },
                  ]}
                />
              ))}
            </LinearGradient>
          </VisionGlass>
        </Animated.View>
      </FloatingElement>
    </View>
  );
};

// Achievement Badge Component
export const AchievementOrb: React.FC<{
  achieved: boolean;
  icon: string;
  title: string;
  date?: string;
  size?: number;
}> = ({ achieved, icon, title, date, size = 80 }) => {
  const achievedScale = useSharedValue(achieved ? 1 : 0.8);
  const achievedOpacity = useSharedValue(achieved ? 1 : 0.5);

  useEffect(() => {
    if (achieved) {
      achievedScale.value = withSpring(1.1, {}, () => {
        achievedScale.value = withSpring(1);
      });
      achievedOpacity.value = withTiming(1);
    }
  }, [achieved]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: achievedScale.value }],
    opacity: achievedOpacity.value,
  }));

  return (
    <FloatingElement variant={achieved ? "pronounced" : "subtle"} depth={3}>
      <Animated.View style={[animatedStyle, { width: size, height: size }]}>
        <VisionGlass
          variant={achieved ? "thick" : "ultraThin"}
          depth={achieved ? 2 : 4}
          floating={achieved}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        >
          <LinearGradient
            colors={achieved 
              ? ['#FFD700', '#FFA500', '#FF8C00'] 
              : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
            }
            style={[styles.achievementGradient, { borderRadius: size / 2 }]}
          >
            <Text style={[styles.achievementIcon, { fontSize: size * 0.35 }]}>
              {icon}
            </Text>
            <Text style={[styles.achievementTitle, { fontSize: size * 0.08 }]}>
              {title}
            </Text>
            {achieved && date && (
              <Text style={[styles.achievementDate, { fontSize: size * 0.06 }]}>
                {date}
              </Text>
            )}
          </LinearGradient>
        </VisionGlass>
      </Animated.View>
    </FloatingElement>
  );
};

// Progress Constellation - Multiple orbs in spatial arrangement
export const ProgressConstellation: React.FC<{
  metrics: Array<{
    title: string;
    progress: number;
    color: string[];
    position: { x: number; y: number };
  }>;
}> = ({ metrics }) => {
  return (
    <View style={styles.constellation}>
      {metrics.map((metric, index) => (
        <View
          key={index}
          style={[
            styles.constellationOrb,
            {
              left: metric.position.x,
              top: metric.position.y,
            },
          ]}
        >
          <ProgressOrb
            progress={metric.progress}
            title={metric.title}
            color={metric.color}
            size={60 + metric.progress * 40} // Size based on progress
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -35 }, { translateY: -35 }],
  },
  glowGradient: {
    borderRadius: 100,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: 'rgba(255,255,255,0.8)',
    borderRightColor: 'rgba(255,255,255,0.8)',
  },
  progressGradient: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleText: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 1,
  },
  innerParticle: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 1,
  },
  achievementGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIcon: {
    marginBottom: 4,
  },
  achievementTitle: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementDate: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  constellation: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  constellationOrb: {
    position: 'absolute',
  },
});