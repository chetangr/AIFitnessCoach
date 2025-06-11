import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { modernTheme } from '../config/modernTheme';
import {
  ModernCard,
  ModernHeader,
} from '../components/modern/ModernComponents';
import moment from 'moment';

// const { width } = Dimensions.get('window');

const ModernDietScreen = () => {
  const [calories] = useState(0);
  const [protein] = useState(0);
  const [carbs] = useState(0);
  const [fat] = useState(0);
  const [water] = useState(0);

  const macroGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 66,
  };

  const waterGoal = 2.5; // liters

  const meals = [
    { id: 'breakfast', name: 'Breakfast', icon: 'sunny', calories: 0 },
    { id: 'lunch', name: 'Lunch', icon: 'restaurant', calories: 0 },
    { id: 'dinner', name: 'Dinner', icon: 'moon', calories: 0 },
    { id: 'snacks', name: 'Snacks', icon: 'nutrition', calories: 0 },
  ];

  const addWater = (amount: number) => {
    // Would update water intake
    console.log(`Adding ${amount}ml of water`);
  };

  const getMacroPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader 
        title="Nutrition"
        subtitle={moment().format('dddd, MMMM D')}
        rightAction={
          <TouchableOpacity onPress={() => console.log('Settings')}>
            <Ionicons name="settings-outline" size={24} color={modernTheme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Daily Summary */}
        <ModernCard variant="elevated" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.sectionTitle}>Daily Summary</Text>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={20} color={modernTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.caloriesRow}>
            <Text style={styles.caloriesLabel}>Calories</Text>
            <Text style={styles.caloriesValue}>
              {calories} / {macroGoals.calories}
            </Text>
          </View>

          <View style={styles.caloriesProgress}>
            <View 
              style={[
                styles.caloriesProgressFill, 
                { width: `${getMacroPercentage(calories, macroGoals.calories)}%` }
              ]} 
            />
          </View>

          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <View style={[styles.macroCircle, { borderColor: modernTheme.colors.info }]}>
                <Ionicons name="fitness" size={24} color={modernTheme.colors.info} />
              </View>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{protein}g</Text>
            </View>

            <View style={styles.macroItem}>
              <View style={[styles.macroCircle, { borderColor: modernTheme.colors.warning }]}>
                <Ionicons name="pizza" size={24} color={modernTheme.colors.warning} />
              </View>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{carbs}g</Text>
            </View>

            <View style={styles.macroItem}>
              <View style={[styles.macroCircle, { borderColor: '#A78BFA' }]}>
                <Ionicons name="water" size={24} color="#A78BFA" />
              </View>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>{fat}g</Text>
            </View>
          </View>
        </ModernCard>

        {/* Water Intake */}
        <ModernCard variant="elevated" style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View style={styles.waterTitleRow}>
              <Ionicons name="water" size={24} color={modernTheme.colors.primary} />
              <Text style={styles.waterTitle}>Water Intake</Text>
            </View>
          </View>

          <Text style={styles.waterAmount}>{water.toFixed(1)}L / {waterGoal}L</Text>
          
          <View style={styles.waterProgress}>
            <View 
              style={[
                styles.waterProgressFill, 
                { width: `${getMacroPercentage(water, waterGoal)}%` }
              ]} 
            />
          </View>

          <View style={styles.waterButtons}>
            <TouchableOpacity 
              style={styles.waterButton}
              onPress={() => addWater(250)}
            >
              <Text style={styles.waterButtonText}>+250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.waterButton}
              onPress={() => addWater(500)}
            >
              <Text style={styles.waterButtonText}>+500ml</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.waterButton}
              onPress={() => addWater(1000)}
            >
              <Text style={styles.waterButtonText}>+1L</Text>
            </TouchableOpacity>
          </View>
        </ModernCard>

        {/* Today's Meals */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {meals.map((meal) => (
            <TouchableOpacity key={meal.id} style={styles.mealCard}>
              <View style={styles.mealLeft}>
                <View style={styles.mealIcon}>
                  <Ionicons name={meal.icon as any} size={24} color={modernTheme.colors.warning} />
                </View>
                <Text style={styles.mealName}>{meal.name}</Text>
              </View>
              <View style={styles.mealRight}>
                <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                <Ionicons name="add-circle" size={24} color={modernTheme.colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="barcode-outline" size={24} color={modernTheme.colors.primary} />
            <Text style={styles.actionText}>Scan Food</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="search-outline" size={24} color={modernTheme.colors.primary} />
            <Text style={styles.actionText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="time-outline" size={24} color={modernTheme.colors.primary} />
            <Text style={styles.actionText}>Recent</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: modernTheme.spacing.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...modernTheme.typography.title3,
    color: modernTheme.colors.textPrimary,
  },
  summaryCard: {
    marginTop: modernTheme.spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.md,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.sm,
  },
  caloriesLabel: {
    ...modernTheme.typography.body,
    color: modernTheme.colors.textSecondary,
  },
  caloriesValue: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
    fontWeight: '600' as '600',
  },
  caloriesProgress: {
    height: 8,
    backgroundColor: modernTheme.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: modernTheme.spacing.lg,
  },
  caloriesProgressFill: {
    height: '100%',
    backgroundColor: modernTheme.colors.primary,
    borderRadius: 4,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: modernTheme.spacing.sm,
  },
  macroLabel: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
    marginBottom: modernTheme.spacing.xs,
  },
  macroValue: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
    fontWeight: '600' as '600',
  },
  waterCard: {
    marginTop: modernTheme.spacing.lg,
  },
  waterHeader: {
    marginBottom: modernTheme.spacing.md,
  },
  waterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterTitle: {
    ...modernTheme.typography.title3,
    color: modernTheme.colors.textPrimary,
    marginLeft: modernTheme.spacing.sm,
  },
  waterAmount: {
    ...modernTheme.typography.title2,
    color: modernTheme.colors.textPrimary,
    marginBottom: modernTheme.spacing.sm,
  },
  waterProgress: {
    height: 12,
    backgroundColor: modernTheme.colors.surface,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: modernTheme.spacing.md,
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: modernTheme.colors.primary,
    borderRadius: 6,
  },
  waterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterButton: {
    flex: 1,
    backgroundColor: modernTheme.colors.primary,
    paddingVertical: modernTheme.spacing.sm,
    marginHorizontal: modernTheme.spacing.xs,
    borderRadius: modernTheme.borderRadius.sm,
    alignItems: 'center',
  },
  waterButtonText: {
    ...modernTheme.typography.subheadline,
    color: '#FFFFFF',
    fontWeight: '600' as '600',
  },
  mealsSection: {
    marginTop: modernTheme.spacing.xl,
  },
  mealCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.cardBackground,
    padding: modernTheme.spacing.md,
    borderRadius: modernTheme.borderRadius.md,
    marginTop: modernTheme.spacing.sm,
    ...modernTheme.shadows.sm,
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modernTheme.colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.md,
  },
  mealName: {
    ...modernTheme.typography.headline,
    color: modernTheme.colors.textPrimary,
  },
  mealRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealCalories: {
    ...modernTheme.typography.body,
    color: modernTheme.colors.textSecondary,
    marginRight: modernTheme.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: modernTheme.spacing.xl,
    paddingTop: modernTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.border,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
    marginTop: modernTheme.spacing.xs,
  },
});

export default ModernDietScreen;