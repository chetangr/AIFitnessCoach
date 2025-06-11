import { Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as baseTheme } from '../config/theme';

// Liquid Glass Theme Extensions
export interface LiquidGlassConfig {
  intensity: number;
  refractionStrength: number;
  dynamicBackground: boolean;
  shimmerSpeed: number;
  morphSpeed: number;
  adaptiveColors: boolean;
}

// Holiday/Festival Theme Definitions
export interface HolidayTheme {
  id: string;
  name: string;
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
  colors: {
    primary: string[];
    secondary: string[];
    accent: string;
    background: string[];
    glass: {
      light: string;
      medium: string;
      dark: string;
    };
  };
  particles?: {
    type: 'snow' | 'hearts' | 'stars' | 'leaves' | 'fireworks' | 'confetti';
    colors: string[];
    count: number;
  };
  animations?: {
    pulse?: boolean;
    sparkle?: boolean;
    float?: boolean;
  };
  liquidGlass?: LiquidGlassConfig;
}

// Define holiday themes
const holidayThemes: HolidayTheme[] = [
  {
    id: 'new-year',
    name: 'New Year',
    startDate: { month: 12, day: 25 },
    endDate: { month: 1, day: 7 },
    colors: {
      primary: ['#FFD700', '#FFA500', '#FF6347'],
      secondary: ['#4169E1', '#1E90FF', '#00BFFF'],
      accent: '#FFD700',
      background: ['#000033', '#000066', '#000099'],
      glass: {
        light: 'rgba(255, 215, 0, 0.1)',
        medium: 'rgba(255, 215, 0, 0.2)',
        dark: 'rgba(255, 215, 0, 0.3)',
      },
    },
    particles: {
      type: 'fireworks',
      colors: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347'],
      count: 50,
    },
    animations: {
      sparkle: true,
      pulse: true,
    },
  },
  {
    id: 'valentines',
    name: "Valentine's Day",
    startDate: { month: 2, day: 10 },
    endDate: { month: 2, day: 15 },
    colors: {
      primary: ['#FF1493', '#FF69B4', '#FFB6C1'],
      secondary: ['#FF0000', '#DC143C', '#B22222'],
      accent: '#FF1493',
      background: ['#FFE4E1', '#FFF0F5', '#FFF5EE'],
      glass: {
        light: 'rgba(255, 20, 147, 0.1)',
        medium: 'rgba(255, 20, 147, 0.2)',
        dark: 'rgba(255, 20, 147, 0.3)',
      },
    },
    particles: {
      type: 'hearts',
      colors: ['#FF1493', '#FF69B4', '#FFB6C1'],
      count: 30,
    },
    animations: {
      float: true,
      pulse: true,
    },
  },
  {
    id: 'spring',
    name: 'Spring Festival',
    startDate: { month: 3, day: 15 },
    endDate: { month: 4, day: 15 },
    colors: {
      primary: ['#98FB98', '#90EE90', '#00FA9A'],
      secondary: ['#FFB6C1', '#FFC0CB', '#FFDAB9'],
      accent: '#00FA9A',
      background: ['#F0FFF0', '#F5FFFA', '#F0FFFF'],
      glass: {
        light: 'rgba(152, 251, 152, 0.1)',
        medium: 'rgba(152, 251, 152, 0.2)',
        dark: 'rgba(152, 251, 152, 0.3)',
      },
    },
    particles: {
      type: 'leaves',
      colors: ['#98FB98', '#FFB6C1', '#87CEEB'],
      count: 25,
    },
    animations: {
      float: true,
    },
  },
  {
    id: 'summer',
    name: 'Summer Vibes',
    startDate: { month: 6, day: 15 },
    endDate: { month: 8, day: 15 },
    colors: {
      primary: ['#FFA500', '#FF8C00', '#FF7F50'],
      secondary: ['#00CED1', '#48D1CC', '#40E0D0'],
      accent: '#FFA500',
      background: ['#FFEFD5', '#FFE4B5', '#FFDAB9'],
      glass: {
        light: 'rgba(255, 165, 0, 0.1)',
        medium: 'rgba(255, 165, 0, 0.2)',
        dark: 'rgba(255, 165, 0, 0.3)',
      },
    },
    animations: {
      sparkle: true,
    },
  },
  {
    id: 'halloween',
    name: 'Halloween',
    startDate: { month: 10, day: 20 },
    endDate: { month: 11, day: 2 },
    colors: {
      primary: ['#FF8C00', '#FF7F50', '#FF6347'],
      secondary: ['#4B0082', '#8B008B', '#9400D3'],
      accent: '#FF8C00',
      background: ['#1C1C1C', '#2F2F2F', '#424242'],
      glass: {
        light: 'rgba(255, 140, 0, 0.1)',
        medium: 'rgba(255, 140, 0, 0.2)',
        dark: 'rgba(255, 140, 0, 0.3)',
      },
    },
    particles: {
      type: 'stars',
      colors: ['#FF8C00', '#9400D3', '#FFD700'],
      count: 40,
    },
    animations: {
      pulse: true,
      sparkle: true,
    },
  },
  {
    id: 'christmas',
    name: 'Christmas',
    startDate: { month: 12, day: 15 },
    endDate: { month: 12, day: 26 },
    colors: {
      primary: ['#DC143C', '#B22222', '#8B0000'],
      secondary: ['#228B22', '#006400', '#008000'],
      accent: '#FFD700',
      background: ['#F8F8FF', '#FFFAFA', '#FFF8DC'],
      glass: {
        light: 'rgba(220, 20, 60, 0.1)',
        medium: 'rgba(220, 20, 60, 0.2)',
        dark: 'rgba(220, 20, 60, 0.3)',
      },
    },
    particles: {
      type: 'snow',
      colors: ['#FFFFFF', '#F8F8FF', '#FFFAFA'],
      count: 60,
    },
    animations: {
      float: true,
      sparkle: true,
    },
  },
];

// Default Liquid Glass Configuration
const defaultLiquidGlassConfig: LiquidGlassConfig = {
  intensity: 80,
  refractionStrength: 1.5,
  dynamicBackground: true,
  shimmerSpeed: 2000,
  morphSpeed: 4000,
  adaptiveColors: true,
};

// Add Liquid Glass to all holiday themes
holidayThemes.forEach(theme => {
  theme.liquidGlass = {
    ...defaultLiquidGlassConfig,
    // Customize per theme
    intensity: theme.id === 'new-year' ? 90 : 
               theme.id === 'valentines' ? 70 : 
               theme.id === 'spring' ? 60 : 80,
    refractionStrength: theme.id === 'new-year' ? 2.0 : 1.5,
    shimmerSpeed: theme.id === 'new-year' ? 1500 : 2000,
  };
});

// Theme Engine Class
class ThemeEngine {
  private currentTheme: HolidayTheme | null = null;
  private animationValues: Map<string, Animated.Value> = new Map();
  private listeners: Set<(theme: HolidayTheme | null) => void> = new Set();
  private liquidGlassConfig: LiquidGlassConfig = defaultLiquidGlassConfig;
  
  constructor() {
    this.initializeAnimations();
    this.checkAndApplyTheme();
  }

  private initializeAnimations() {
    // Initialize animation values for smooth transitions
    this.animationValues.set('colorTransition', new Animated.Value(0));
    this.animationValues.set('particleOpacity', new Animated.Value(0));
    this.animationValues.set('pulseScale', new Animated.Value(1));
    this.animationValues.set('sparkleRotation', new Animated.Value(0));
    this.animationValues.set('floatTranslation', new Animated.Value(0));
  }

  // Check current date and apply appropriate theme
  checkAndApplyTheme() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
    const currentDay = today.getDate();

    for (const theme of holidayThemes) {
      if (this.isDateInRange(currentMonth, currentDay, theme)) {
        this.applyTheme(theme);
        return;
      }
    }

    // No holiday theme active
    this.applyTheme(null);
  }

  private isDateInRange(month: number, day: number, theme: HolidayTheme): boolean {
    const { startDate, endDate } = theme;
    
    // Handle year-end wrap (e.g., Christmas to New Year)
    if (startDate.month > endDate.month) {
      return (month === startDate.month && day >= startDate.day) ||
             (month === endDate.month && day <= endDate.day);
    }
    
    // Normal date range
    if (month === startDate.month && month === endDate.month) {
      return day >= startDate.day && day <= endDate.day;
    }
    
    if (month === startDate.month) {
      return day >= startDate.day;
    }
    
    if (month === endDate.month) {
      return day <= endDate.day;
    }
    
    return month > startDate.month && month < endDate.month;
  }

  // Apply theme with animations
  async applyTheme(theme: HolidayTheme | null) {
    if (theme?.id === this.currentTheme?.id) return;

    // Save current theme to storage
    await AsyncStorage.setItem('currentHolidayTheme', JSON.stringify(theme));

    // Animate theme transition
    this.animateThemeTransition(() => {
      this.currentTheme = theme;
      this.notifyListeners();
      
      if (theme) {
        this.startThemeAnimations(theme);
      } else {
        this.stopAllAnimations();
      }
    });
  }

  private animateThemeTransition(callback: () => void) {
    const colorTransition = this.animationValues.get('colorTransition')!;
    
    Animated.sequence([
      // Fade out current theme
      Animated.timing(colorTransition, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      // Apply new theme
      Animated.timing(colorTransition, {
        toValue: 1,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(callback);
  }

  private startThemeAnimations(theme: HolidayTheme) {
    // Particle fade in
    if (theme.particles) {
      const particleOpacity = this.animationValues.get('particleOpacity')!;
      Animated.timing(particleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }

    // Pulse animation
    if (theme.animations?.pulse) {
      const pulseScale = this.animationValues.get('pulseScale')!;
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Sparkle animation
    if (theme.animations?.sparkle) {
      const sparkleRotation = this.animationValues.get('sparkleRotation')!;
      Animated.loop(
        Animated.timing(sparkleRotation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }

    // Float animation
    if (theme.animations?.float) {
      const floatTranslation = this.animationValues.get('floatTranslation')!;
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatTranslation, {
            toValue: -20,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatTranslation, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }

  private stopAllAnimations() {
    // Stop all running animations
    this.animationValues.forEach((value) => {
      value.stopAnimation();
    });
    
    // Reset animation values
    this.animationValues.get('particleOpacity')?.setValue(0);
    this.animationValues.get('pulseScale')?.setValue(1);
    this.animationValues.get('sparkleRotation')?.setValue(0);
    this.animationValues.get('floatTranslation')?.setValue(0);
  }

  // Get merged theme object
  getTheme() {
    if (!this.currentTheme) {
      return baseTheme;
    }

    // Merge holiday theme with base theme
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: {
          ...baseTheme.colors.primary,
          gradient: this.currentTheme.colors.primary,
          purple: this.currentTheme.colors.primary[0],
          purpleDark: this.currentTheme.colors.primary[1],
          pink: this.currentTheme.colors.primary[2],
        },
        glass: {
          ...baseTheme.colors.glass,
          lightOverlay: this.currentTheme.colors.glass.light,
          mediumOverlay: this.currentTheme.colors.glass.medium,
          darkOverlay: this.currentTheme.colors.glass.dark,
        },
      },
      holiday: this.currentTheme,
    };
  }

  // Get animation values
  getAnimationValue(key: string): Animated.Value | undefined {
    return this.animationValues.get(key);
  }
  
  // Get Liquid Glass configuration
  getLiquidGlassConfig(): LiquidGlassConfig {
    if (this.currentTheme?.liquidGlass) {
      return this.currentTheme.liquidGlass;
    }
    return this.liquidGlassConfig;
  }
  
  // Update Liquid Glass configuration
  updateLiquidGlassConfig(config: Partial<LiquidGlassConfig>) {
    this.liquidGlassConfig = {
      ...this.liquidGlassConfig,
      ...config,
    };
    this.notifyListeners();
  }

  // Subscribe to theme changes
  subscribe(listener: (theme: HolidayTheme | null) => void) {
    this.listeners.add(listener);
    listener(this.currentTheme);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  // Manual theme override
  async setTheme(themeId: string | null) {
    if (themeId === null) {
      await this.applyTheme(null);
      return;
    }

    const theme = holidayThemes.find(t => t.id === themeId);
    if (theme) {
      await this.applyTheme(theme);
    }
  }

  // Get all available themes
  getAvailableThemes() {
    return holidayThemes;
  }

  // Check if a specific theme is active
  isThemeActive(themeId: string): boolean {
    return this.currentTheme?.id === themeId;
  }
}

// Export singleton instance
export const themeEngine = new ThemeEngine();
export default themeEngine;