import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum ThemeType {
  DEFAULT = 'default',
  CHRISTMAS = 'christmas',
  NEW_YEAR = 'new_year',
  VALENTINE = 'valentine',
  EASTER = 'easter',
  HALLOWEEN = 'halloween',
  THANKSGIVING = 'thanksgiving',
  DIWALI = 'diwali',
  CHINESE_NEW_YEAR = 'chinese_new_year',
  HANUKKAH = 'hanukkah',
  EID = 'eid',
  FOURTH_OF_JULY = 'fourth_of_july',
  ST_PATRICKS = 'st_patricks',
  HOLI = 'holi',
  SUMMER = 'summer',
  WINTER = 'winter',
  SPRING = 'spring',
  AUTUMN = 'autumn',
}

export interface ThemeConfig {
  name: string;
  primary: string[];
  secondary: string[];
  accent: string;
  glass: {
    tint: 'light' | 'dark';
    intensity: number;
    overlay: string;
  };
  particles?: string;
  animation?: string;
  icons?: string[];
}

export interface AnimatedThemeColors {
  primaryGradient: Animated.AnimatedInterpolation[];
  secondaryGradient: Animated.AnimatedInterpolation[];
  accent: Animated.AnimatedInterpolation;
  glassOverlay: Animated.AnimatedInterpolation;
}

class DynamicThemeService {
  private themes: Map<ThemeType, ThemeConfig>;
  private holidayCalendar: Map<ThemeType, Array<[number, number]>>;
  private currentTheme: ThemeType = ThemeType.DEFAULT;
  private themeAnimation = new Animated.Value(0);
  private listeners: Array<(theme: ThemeConfig) => void> = [];

  constructor() {
    this.themes = this.initializeThemes();
    this.holidayCalendar = this.initializeHolidayCalendar();
    this.loadStoredTheme();
  }

  private initializeThemes(): Map<ThemeType, ThemeConfig> {
    const themes = new Map<ThemeType, ThemeConfig>();

    themes.set(ThemeType.DEFAULT, {
      name: 'Default',
      primary: ['#667eea', '#764ba2', '#f093fb'],
      secondary: ['#6B46C1', '#9333EA', '#C084FC'],
      accent: '#FA114F',
      glass: {
        tint: 'light',
        intensity: 70,
        overlay: 'rgba(255, 255, 255, 0.15)',
      },
    });

    themes.set(ThemeType.CHRISTMAS, {
      name: 'Christmas Magic',
      primary: ['#165B33', '#EA4630', '#F8B229'],
      secondary: ['#BB2528', '#146B3A', '#F7941E'],
      accent: '#EA4630',
      glass: {
        tint: 'light',
        intensity: 80,
        overlay: 'rgba(255, 255, 255, 0.25)',
      },
      particles: 'snowflakes',
      animation: 'gentle_fall',
      icons: ['🎄', '🎅', '🎁', '⛄', '❄️'],
    });

    themes.set(ThemeType.NEW_YEAR, {
      name: 'New Year Celebration',
      primary: ['#FFD700', '#FFA500', '#FF6347'],
      secondary: ['#C0C0C0', '#FFD700', '#000000'],
      accent: '#FFD700',
      glass: {
        tint: 'dark',
        intensity: 85,
        overlay: 'rgba(255, 215, 0, 0.2)',
      },
      particles: 'fireworks',
      animation: 'burst',
      icons: ['🎊', '🎉', '🥳', '🍾', '✨'],
    });

    themes.set(ThemeType.VALENTINE, {
      name: "Valentine's Love",
      primary: ['#FF1744', '#E91E63', '#FF80AB'],
      secondary: ['#F50057', '#C51162', '#FF4081'],
      accent: '#FF1744',
      glass: {
        tint: 'light',
        intensity: 75,
        overlay: 'rgba(255, 23, 68, 0.15)',
      },
      particles: 'hearts',
      animation: 'float_up',
      icons: ['❤️', '💕', '💖', '💗', '🌹'],
    });

    themes.set(ThemeType.HALLOWEEN, {
      name: 'Spooky Halloween',
      primary: ['#FF6600', '#8B4513', '#FF8C00'],
      secondary: ['#8B008B', '#4B0082', '#FF4500'],
      accent: '#FF6600',
      glass: {
        tint: 'dark',
        intensity: 90,
        overlay: 'rgba(255, 102, 0, 0.2)',
      },
      particles: 'bats',
      animation: 'spooky_float',
      icons: ['🎃', '👻', '🦇', '🕷️', '🍬'],
    });

    themes.set(ThemeType.DIWALI, {
      name: 'Festival of Lights',
      primary: ['#FF6B35', '#F7931E', '#FFCC00'],
      secondary: ['#C1272D', '#FF5722', '#FFC107'],
      accent: '#FF6B35',
      glass: {
        tint: 'light',
        intensity: 85,
        overlay: 'rgba(255, 204, 0, 0.25)',
      },
      particles: 'diyas',
      animation: 'twinkle',
      icons: ['🪔', '✨', '🎆', '🌟', '💫'],
    });

    themes.set(ThemeType.SUMMER, {
      name: 'Summer Vibes',
      primary: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
      secondary: ['#F7B731', '#5F27CD', '#00D2D3'],
      accent: '#FF6B6B',
      glass: {
        tint: 'light',
        intensity: 60,
        overlay: 'rgba(255, 230, 109, 0.15)',
      },
      particles: 'sun_rays',
      animation: 'shimmer',
      icons: ['☀️', '🌊', '🏖️', '🌺', '🍹'],
    });

    themes.set(ThemeType.WINTER, {
      name: 'Winter Wonderland',
      primary: ['#00D9FF', '#0099CC', '#003366'],
      secondary: ['#87CEEB', '#4682B4', '#191970'],
      accent: '#00D9FF',
      glass: {
        tint: 'light',
        intensity: 85,
        overlay: 'rgba(0, 217, 255, 0.2)',
      },
      particles: 'snow',
      animation: 'gentle_fall',
      icons: ['❄️', '⛷️', '🏔️', '☃️', '🧊'],
    });

    themes.set(ThemeType.SPRING, {
      name: 'Spring Bloom',
      primary: ['#50C878', '#FFB6C1', '#DDA0DD'],
      secondary: ['#98FB98', '#FF69B4', '#9370DB'],
      accent: '#50C878',
      glass: {
        tint: 'light',
        intensity: 65,
        overlay: 'rgba(80, 200, 120, 0.15)',
      },
      particles: 'petals',
      animation: 'gentle_float',
      icons: ['🌸', '🌺', '🌷', '🦋', '🌱'],
    });

    themes.set(ThemeType.AUTUMN, {
      name: 'Autumn Harvest',
      primary: ['#D2691E', '#FF8C00', '#B22222'],
      secondary: ['#8B4513', '#FF6347', '#CD853F'],
      accent: '#D2691E',
      glass: {
        tint: 'dark',
        intensity: 75,
        overlay: 'rgba(210, 105, 30, 0.2)',
      },
      particles: 'leaves',
      animation: 'falling_leaves',
      icons: ['🍂', '🍁', '🎃', '🌰', '🍄'],
    });

    return themes;
  }

  private initializeHolidayCalendar(): Map<ThemeType, Array<[number, number]>> {
    const calendar = new Map<ThemeType, Array<[number, number]>>();

    calendar.set(ThemeType.CHRISTMAS, [[12, 1], [12, 31]]);
    calendar.set(ThemeType.NEW_YEAR, [[12, 26], [1, 7]]);
    calendar.set(ThemeType.VALENTINE, [[2, 7], [2, 21]]);
    calendar.set(ThemeType.HALLOWEEN, [[10, 15], [11, 2]]);
    calendar.set(ThemeType.THANKSGIVING, [[11, 15], [11, 30]]);
    calendar.set(ThemeType.FOURTH_OF_JULY, [[6, 28], [7, 10]]);
    calendar.set(ThemeType.ST_PATRICKS, [[3, 10], [3, 24]]);
    calendar.set(ThemeType.SUMMER, [[6, 1], [8, 31]]);
    calendar.set(ThemeType.AUTUMN, [[9, 1], [11, 30]]);
    calendar.set(ThemeType.WINTER, [[12, 1], [2, 28]]);
    calendar.set(ThemeType.SPRING, [[3, 1], [5, 31]]);

    return calendar;
  }

  private async loadStoredTheme() {
    try {
      const storedTheme = await AsyncStorage.getItem('selectedTheme');
      if (storedTheme) {
        this.currentTheme = storedTheme as ThemeType;
      } else {
        this.currentTheme = this.detectCurrentTheme();
      }
    } catch {
      this.currentTheme = this.detectCurrentTheme();
    }
  }

  private detectCurrentTheme(): ThemeType {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const holidayPriority = [
      ThemeType.CHRISTMAS,
      ThemeType.NEW_YEAR,
      ThemeType.VALENTINE,
      ThemeType.HALLOWEEN,
      ThemeType.FOURTH_OF_JULY,
      ThemeType.THANKSGIVING,
      ThemeType.ST_PATRICKS,
    ];

    for (const holiday of holidayPriority) {
      if (this.isHolidayActive(holiday, month, day)) {
        return holiday;
      }
    }

    // Check seasonal themes
    const seasons = [ThemeType.SUMMER, ThemeType.AUTUMN, ThemeType.WINTER, ThemeType.SPRING];
    for (const season of seasons) {
      if (this.isHolidayActive(season, month, day)) {
        return season;
      }
    }

    return ThemeType.DEFAULT;
  }

  private isHolidayActive(holiday: ThemeType, month: number, day: number): boolean {
    const dateRanges = this.holidayCalendar.get(holiday);
    if (!dateRanges) return false;

    for (const [start, end] of dateRanges) {
      const [startMonth, startDay] = start;
      const [endMonth, endDay] = end;

      if (startMonth > endMonth) {
        // Crosses year boundary
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
          return true;
        }
      } else {
        // Normal range
        if (month === startMonth && month === endMonth) {
          if (day >= startDay && day <= endDay) return true;
        } else if (month === startMonth && day >= startDay) {
          return true;
        } else if (month === endMonth && day <= endDay) {
          return true;
        } else if (month > startMonth && month < endMonth) {
          return true;
        }
      }
    }

    return false;
  }

  public getCurrentTheme(): ThemeConfig {
    return this.themes.get(this.currentTheme) || this.themes.get(ThemeType.DEFAULT)!;
  }

  public async setTheme(theme: ThemeType) {
    if (this.currentTheme === theme) return;

    const oldTheme = this.getCurrentTheme();
    this.currentTheme = theme;
    const newTheme = this.getCurrentTheme();

    await AsyncStorage.setItem('selectedTheme', theme);

    // Animate theme transition
    this.animateThemeTransition();

    // Notify listeners
    this.listeners.forEach(listener => listener(newTheme));
  }

  private animateThemeTransition() {
    this.themeAnimation.setValue(0);
    Animated.timing(this.themeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }

  public getAnimatedColors(fromTheme: ThemeConfig, toTheme: ThemeConfig): AnimatedThemeColors {
    const interpolate = (from: string, to: string) => {
      return this.themeAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [from, to],
      });
    };

    return {
      primaryGradient: fromTheme.primary.map((color, index) =>
        interpolate(color, toTheme.primary[index] || color)
      ),
      secondaryGradient: fromTheme.secondary.map((color, index) =>
        interpolate(color, toTheme.secondary[index] || color)
      ),
      accent: interpolate(fromTheme.accent, toTheme.accent),
      glassOverlay: interpolate(fromTheme.glass.overlay, toTheme.glass.overlay),
    };
  }

  public addThemeChangeListener(listener: (theme: ThemeConfig) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getParticleConfig(particleType?: string) {
    const configs: Record<string, any> = {
      snowflakes: {
        count: 30,
        speed: 1.5,
        size: [10, 20],
        opacity: [0.4, 0.8],
        wind: true,
        spin: true,
      },
      fireworks: {
        count: 5,
        speed: 3,
        burst: true,
        colors: ['#FFD700', '#FF6347', '#00FF00'],
        trail: true,
      },
      hearts: {
        count: 15,
        speed: 1,
        size: [15, 25],
        sway: true,
        fadeIn: true,
      },
      leaves: {
        count: 20,
        speed: 1.2,
        rotation: true,
        colors: ['#D2691E', '#FF8C00', '#B22222'],
        sway: true,
      },
    };

    return particleType ? configs[particleType] : null;
  }

  public detectAndSetTheme() {
    const detectedTheme = this.detectCurrentTheme();
    this.setTheme(detectedTheme);
  }
}

export const dynamicThemeService = new DynamicThemeService();