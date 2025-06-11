# Liquid Glass Design Update Guide

## ✅ Screens Updated with Liquid Glass

1. **Timeline Screen** (`LiquidTimelineScreen.tsx`)
   - Dynamic header that appears on scroll
   - Workout cards with interactive 3D tilt
   - Liquid Glass tab bar
   - Animated FAB with pulse effect

2. **Discover Screen** (`LiquidDiscoverScreen.tsx`)
   - Tab system with liquid transitions
   - Activity cards with refraction effects
   - Exercise cards with interactive depth
   - Program cards with image overlays

3. **Navigation Tab Bar**
   - Replaced BlurView with LiquidGlassView
   - Dynamic refraction strength
   - Smooth liquid transitions

## 🔄 Screens To Update

### Priority 1 - Core Screens
- [ ] **Messages/AI Coach Screen** - Apply to chat bubbles and input
- [ ] **Profile Screen** - Stats cards and settings
- [ ] **Fasting Screen** - Timer and progress cards
- [ ] **Diet Screen** - Meal cards and nutrition info

### Priority 2 - Workout Screens
- [ ] **Active Workout Screen** - Exercise cards and timers
- [ ] **Workout Detail Screen** - Exercise list and info cards
- [ ] **Exercise Library Screen** - Search and filter UI
- [ ] **Programs Screen** - Program cards and progress

### Priority 3 - Settings & Utility
- [ ] **Settings Screen** - Setting items and toggles
- [ ] **Measurements Screen** - Input fields and charts
- [ ] **Stats Screen** - Data visualization cards
- [ ] **Login/Register Screens** - Input fields and buttons

## 🎨 How to Apply Liquid Glass to a Screen

### 1. Import Liquid Glass Components
```typescript
import { 
  LiquidGlassView, 
  LiquidButton, 
  LiquidCard,
  LiquidInput,
  LiquidFocusRing 
} from '../components/glass';
```

### 2. Replace Background
```typescript
// Old
<View style={styles.container}>
  <LinearGradient colors={theme.colors.gradient} style={StyleSheet.absoluteFillObject} />
  
// New
<View style={styles.container}>
  <LinearGradient colors={theme.colors.primary.gradient} style={StyleSheet.absoluteFillObject} />
```

### 3. Add Animated Header
```typescript
const scrollY = useRef(new Animated.Value(0)).current;

<Animated.View 
  style={[
    styles.animatedHeader,
    {
      opacity: scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      })
    }
  ]}
>
  <LiquidGlassView intensity={90} dynamicBackground={true}>
    <View style={styles.headerBar}>
      <Text style={styles.headerTitle}>Screen Title</Text>
    </View>
  </LiquidGlassView>
</Animated.View>
```

### 4. Replace Cards
```typescript
// Old
<GlassCard>
  {content}
</GlassCard>

// New
<LiquidCard interactive={true}>
  {content}
</LiquidCard>
```

### 5. Replace Buttons
```typescript
// Old
<UniversalButton onPress={handlePress} label="Button" />

// New
<LiquidButton 
  onPress={handlePress} 
  label="Button"
  variant="primary"
  icon="play"
/>
```

### 6. Replace Input Fields
```typescript
// Old
<UniversalInput value={text} onChangeText={setText} />

// New
<LiquidInput 
  value={text} 
  onChangeText={setText}
  placeholder="Enter text"
  icon="search"
/>
```

## 🔧 Configuration Options

### LiquidGlassView
- `intensity`: 40-90 (blur strength)
- `dynamicBackground`: true/false (animated background)
- `refractionStrength`: 0.5-2.0 (refraction effect)

### LiquidCard
- `interactive`: true/false (3D tilt on touch)
- `onPress`: Optional press handler

### LiquidButton
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
- `size`: 'small' | 'medium' | 'large' | 'huge'
- `icon`: Icon name from Ionicons
- `haptic`: true/false (haptic feedback)

## 📱 Platform Considerations

### iOS
- Full haptic feedback support
- Smooth 120Hz animations on ProMotion
- Native blur performance

### Android
- Reduced blur intensity for performance
- Adjusted animation timing
- Hardware acceleration required

## 🎯 Best Practices

1. **Performance**
   - Limit to 3-5 glass elements per screen
   - Use `interactive={false}` for static cards
   - Reduce intensity on list items

2. **Consistency**
   - Headers: intensity 90
   - Cards: intensity 60-70
   - Inputs: intensity 80
   - Badges: intensity 40

3. **Accessibility**
   - Ensure text contrast on glass surfaces
   - Add haptic feedback for interactions
   - Test with reduced transparency mode

## 🚀 Quick Start Template

```typescript
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { 
  LiquidGlassView, 
  LiquidButton, 
  LiquidCard 
} from '../components/glass';

const LiquidScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={theme.colors.primary.gradient} 
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { /* animation styles */ }]}>
        <LiquidGlassView intensity={90} dynamicBackground={true}>
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>Screen Title</Text>
          </View>
        </LiquidGlassView>
      </Animated.View>
      
      <ScrollView>
        {/* Content */}
        <LiquidCard interactive={true}>
          <Text>Card Content</Text>
        </LiquidCard>
        
        <LiquidButton
          onPress={() => {}}
          label="Action"
          variant="primary"
        />
      </ScrollView>
    </View>
  );
};

export default LiquidScreen;
```

---

Follow this guide to systematically update all screens with the Liquid Glass design system for a cohesive, modern UI throughout the app.