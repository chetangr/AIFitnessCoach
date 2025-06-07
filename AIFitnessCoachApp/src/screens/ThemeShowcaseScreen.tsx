import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHolidayTheme, useThemedStyles } from '../hooks/useHolidayTheme';
import { 
  ThemedGlassButton, 
  ThemedGlassCard, 
  ThemedGlassContainer,
  ThemeSelector,
} from '../components/glass/ThemedGlassComponents';
import { GlassButton, GlassCard } from '../components/glass/GlassComponents';
import { theme } from '../config/theme';

const ThemeShowcaseScreen = ({ navigation }: any) => {
  const { theme: currentTheme, holidayTheme } = useHolidayTheme();
  const { getGradientColors, getAccentColor } = useThemedStyles();
  
  const [showSelector, setShowSelector] = useState(false);

  // Sample workout data
  const sampleWorkouts = [
    { id: '1', name: 'Morning Yoga', duration: '30 min', intensity: 'Low' },
    { id: '2', name: 'HIIT Training', duration: '20 min', intensity: 'High' },
    { id: '3', name: 'Strength Training', duration: '45 min', intensity: 'Medium' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background */}
      <Animated.View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={holidayTheme ? holidayTheme.colors.background as [string, string, ...string[]] : currentTheme.colors.primary.gradient as [string, string, string]}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, currentTheme.typography.title1]}>
            Theme Showcase
          </Text>
          <TouchableOpacity onPress={() => setShowSelector(!showSelector)}>
            <Icon name="color-palette" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Current Theme Info */}
        {holidayTheme && (
          <ThemedGlassContainer style={styles.themeInfo} intensity="medium">
            <Text style={[styles.themeName, currentTheme.typography.title2]}>
              {holidayTheme.name} Theme Active! 🎉
            </Text>
            <Text style={[styles.themeDescription, currentTheme.typography.body]}>
              Special holiday theme with animated particles and custom colors
            </Text>
          </ThemedGlassContainer>
        )}

        {/* Theme Selector */}
        {showSelector && (
          <ThemedGlassContainer style={styles.selectorContainer}>
            <Text style={[styles.sectionTitle, currentTheme.typography.headline]}>
              Choose a Theme
            </Text>
            <ThemeSelector />
          </ThemedGlassContainer>
        )}

        {/* Glassmorphism Examples */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, currentTheme.typography.title2]}>
            Themed Components
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <ThemedGlassButton
              title="Start Workout"
              onPress={() => {}}
              variant="primary"
              icon="fitness"
            />
            <ThemedGlassButton
              title="View Stats"
              onPress={() => {}}
              variant="secondary"
              icon="stats-chart"
            />
          </View>

          {/* Cards */}
          <View style={styles.cardsContainer}>
            {sampleWorkouts.map((workout) => (
              <ThemedGlassCard key={workout.id} style={styles.workoutCard}>
                <View style={styles.cardContent}>
                  <Text style={[styles.workoutName, currentTheme.typography.headline]}>
                    {workout.name}
                  </Text>
                  <View style={styles.workoutMeta}>
                    <View style={styles.metaItem}>
                      <Icon name="time" size={16} color={getAccentColor()} />
                      <Text style={[styles.metaText, currentTheme.typography.footnote]}>
                        {workout.duration}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="flash" size={16} color={getAccentColor()} />
                      <Text style={[styles.metaText, currentTheme.typography.footnote]}>
                        {workout.intensity}
                      </Text>
                    </View>
                  </View>
                </View>
              </ThemedGlassCard>
            ))}
          </View>
        </View>

        {/* Regular Glass Components for Comparison */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, currentTheme.typography.title2]}>
            Regular Glass Components
          </Text>
          
          <GlassCard style={styles.regularCard}>
            <Text style={[styles.cardTitle, currentTheme.typography.headline]}>
              Standard Glass Card
            </Text>
            <Text style={[styles.cardDescription, currentTheme.typography.body]}>
              This uses the default theme without holiday effects
            </Text>
          </GlassCard>

          <GlassButton
            title="Regular Button"
            onPress={() => {}}
            style={styles.regularButton}
          />
        </View>

        {/* Animation Showcase */}
        {holidayTheme?.animations && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, currentTheme.typography.title2]}>
              Active Animations
            </Text>
            <ThemedGlassContainer style={styles.animationInfo}>
              {holidayTheme.animations.pulse && (
                <View style={styles.animationItem}>
                  <Icon name="heart" size={20} color="#FF3B30" />
                  <Text style={styles.animationText}>Pulse Effect Active</Text>
                </View>
              )}
              {holidayTheme.animations.sparkle && (
                <View style={styles.animationItem}>
                  <Icon name="star" size={20} color="#FFD700" />
                  <Text style={styles.animationText}>Sparkle Effect Active</Text>
                </View>
              )}
              {holidayTheme.animations.float && (
                <View style={styles.animationItem}>
                  <Icon name="cloud" size={20} color="#5AC8FA" />
                  <Text style={styles.animationText}>Float Effect Active</Text>
                </View>
              )}
            </ThemedGlassContainer>
          </View>
        )}

        {/* Color Palette */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, currentTheme.typography.title2]}>
            Current Color Palette
          </Text>
          <View style={styles.colorPalette}>
            {getGradientColors().map((color, index) => (
              <View key={index} style={[styles.colorSwatch, { backgroundColor: color }]}>
                <Text style={styles.colorText}>{color}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    color: 'white',
    fontWeight: '700',
  },
  themeInfo: {
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  themeName: {
    color: theme.colors.neutral.gray900,
    marginBottom: 8,
    fontWeight: '700',
  },
  themeDescription: {
    color: theme.colors.neutral.gray700,
    textAlign: 'center',
  },
  selectorContainer: {
    padding: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    marginBottom: 16,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cardsContainer: {
    gap: 12,
  },
  workoutCard: {
    marginBottom: 12,
  },
  cardContent: {
    padding: 16,
  },
  workoutName: {
    color: theme.colors.neutral.gray900,
    marginBottom: 8,
    fontWeight: '600',
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: theme.colors.neutral.gray700,
  },
  regularCard: {
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    color: theme.colors.neutral.gray900,
    marginBottom: 8,
    fontWeight: '600',
  },
  cardDescription: {
    color: theme.colors.neutral.gray700,
  },
  regularButton: {
    alignSelf: 'flex-start',
  },
  animationInfo: {
    padding: 16,
  },
  animationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  animationText: {
    color: theme.colors.neutral.gray900,
    fontSize: 14,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorSwatch: {
    width: 100,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ThemeShowcaseScreen;