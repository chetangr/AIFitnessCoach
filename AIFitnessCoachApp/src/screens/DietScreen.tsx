import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '../store/themeStore';
import { LiquidGlassView, LiquidButton, LiquidCard, LiquidInput } from '../components/glass';

const { width } = Dimensions.get('window');

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  foods: FoodItem[];
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

const LiquidDietScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition>({
    date: new Date().toISOString().split('T')[0],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
    foods: [],
  });
  
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    water: 2500,
  });

  const [showAddFood, setShowAddFood] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  // Animation values
  const scrollAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const waterAnimation = useRef(new Animated.Value(0)).current;

  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', icon: 'sunny', color: '#FFB74D' },
    { id: 'lunch', name: 'Lunch', icon: 'restaurant', color: '#4FC3F7' },
    { id: 'dinner', name: 'Dinner', icon: 'moon', color: '#7E57C2' },
    { id: 'snack', name: 'Snack', icon: 'nutrition', color: '#66BB6A' },
  ];

  const quickAddFoods = [
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
    { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0.7 },
    { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14 },
    { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
    { name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3 },
  ];

  useEffect(() => {
    loadDailyNutrition();
    loadNutritionGoals();
    
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [selectedDate]);

  useEffect(() => {
    // Animate water progress
    Animated.timing(waterAnimation, {
      toValue: getProgress(dailyNutrition.water, nutritionGoals.water),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [dailyNutrition.water]);

  const loadDailyNutrition = async () => {
    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const saved = await AsyncStorage.getItem(`nutrition_${dateKey}`);
      if (saved) {
        setDailyNutrition(JSON.parse(saved));
      } else {
        setDailyNutrition({
          date: dateKey,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          water: 0,
          foods: [],
        });
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    }
  };

  const loadNutritionGoals = async () => {
    try {
      const saved = await AsyncStorage.getItem('nutritionGoals');
      if (saved) {
        setNutritionGoals(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading nutrition goals:', error);
    }
  };

  const saveNutritionGoals = async (goals: NutritionGoals) => {
    try {
      await AsyncStorage.setItem('nutritionGoals', JSON.stringify(goals));
      setNutritionGoals(goals);
    } catch (error) {
      console.error('Error saving nutrition goals:', error);
    }
  };

  const addFood = async (food: Omit<FoodItem, 'id' | 'time'>) => {
    const newFood: FoodItem = {
      ...food,
      id: Date.now().toString(),
      time: new Date().toISOString(),
      meal: selectedMeal,
    };

    const updatedNutrition = {
      ...dailyNutrition,
      calories: dailyNutrition.calories + food.calories,
      protein: dailyNutrition.protein + food.protein,
      carbs: dailyNutrition.carbs + food.carbs,
      fat: dailyNutrition.fat + food.fat,
      foods: [...dailyNutrition.foods, newFood],
    };

    setDailyNutrition(updatedNutrition);
    await AsyncStorage.setItem(`nutrition_${dailyNutrition.date}`, JSON.stringify(updatedNutrition));
    setShowAddFood(false);
  };

  const addWater = async (amount: number) => {
    const updatedNutrition = {
      ...dailyNutrition,
      water: dailyNutrition.water + amount,
    };
    setDailyNutrition(updatedNutrition);
    await AsyncStorage.setItem(`nutrition_${dailyNutrition.date}`, JSON.stringify(updatedNutrition));
  };

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const renderProgressRing = (current: number, goal: number, color: string, size: number = 60) => {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = getProgress(current, goal);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{
              translateY: scrollAnimation.interpolate({
                inputRange: [0, 100],
                outputRange: [0, -20],
                extrapolate: 'clamp',
              })
            }],
            opacity: scrollAnimation.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0.9],
              extrapolate: 'clamp',
            })
          }
        ]}
      >
        <LiquidGlassView intensity={90} style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nutrition</Text>
          <Text style={styles.headerDate}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </LiquidGlassView>
      </Animated.View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollAnimation } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Daily Summary */}
        <View style={styles.summaryContainer}>
          <LiquidCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Daily Summary</Text>
              <TouchableOpacity onPress={() => Alert.alert('Edit Goals', 'Goal editing coming soon!')}>
                <Icon name="settings-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Calories Progress */}
            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>Calories</Text>
                <Text style={styles.macroValue}>
                  {dailyNutrition.calories} / {nutritionGoals.calories}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${getProgress(dailyNutrition.calories, nutritionGoals.calories)}%`,
                      backgroundColor: theme.colors.error 
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Macros Grid */}
            <View style={styles.macrosGrid}>
              {/* Protein */}
              <View style={styles.macroBox}>
                <View style={styles.macroRingContainer}>
                  {renderProgressRing(dailyNutrition.protein, nutritionGoals.protein, '#4ECDC4')}
                  <Icon name="fitness" size={20} color="#4ECDC4" style={styles.macroIcon} />
                </View>
                <Text style={styles.macroBoxLabel}>Protein</Text>
                <Text style={styles.macroBoxValue}>{dailyNutrition.protein}g</Text>
              </View>

              {/* Carbs */}
              <View style={styles.macroBox}>
                <View style={styles.macroRingContainer}>
                  {renderProgressRing(dailyNutrition.carbs, nutritionGoals.carbs, '#FFB74D')}
                  <Icon name="pizza" size={20} color="#FFB74D" style={styles.macroIcon} />
                </View>
                <Text style={styles.macroBoxLabel}>Carbs</Text>
                <Text style={styles.macroBoxValue}>{dailyNutrition.carbs}g</Text>
              </View>

              {/* Fat */}
              <View style={styles.macroBox}>
                <View style={styles.macroRingContainer}>
                  {renderProgressRing(dailyNutrition.fat, nutritionGoals.fat, '#7E57C2')}
                  <Icon name="water" size={20} color="#7E57C2" style={styles.macroIcon} />
                </View>
                <Text style={styles.macroBoxLabel}>Fat</Text>
                <Text style={styles.macroBoxValue}>{dailyNutrition.fat}g</Text>
              </View>
            </View>
          </LiquidCard>
        </View>

        {/* Water Tracking */}
        <View style={styles.waterContainer}>
          <LiquidCard style={styles.waterCard}>
            <View style={styles.waterHeader}>
              <Icon name="water-outline" size={24} color="#4FC3F7" />
              <Text style={styles.waterTitle}>Water Intake</Text>
            </View>
            <Text style={styles.waterValue}>
              {(dailyNutrition.water / 1000).toFixed(1)}L / {(nutritionGoals.water / 1000).toFixed(1)}L
            </Text>
            <View style={styles.waterButtons}>
              <LiquidButton
                label="+250ml"
                size="small"
                variant="secondary"
                onPress={() => addWater(250)}
                style={styles.waterButton}
              />
              <LiquidButton
                label="+500ml"
                size="small"
                variant="secondary"
                onPress={() => addWater(500)}
                style={styles.waterButton}
              />
              <LiquidButton
                label="+1L"
                size="small"
                variant="secondary"
                onPress={() => addWater(1000)}
                style={styles.waterButton}
              />
            </View>
          </LiquidCard>
        </View>

        {/* Meals */}
        <View style={styles.mealsContainer}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          
          {mealTypes.map((meal) => {
            const mealFoods = dailyNutrition.foods.filter(f => f.meal === meal.id);
            const mealCalories = mealFoods.reduce((sum, f) => sum + f.calories, 0);
            
            return (
              <TouchableOpacity
                key={meal.id}
                style={styles.mealCard}
                onPress={() => {
                  setSelectedMeal(meal.id as any);
                  setShowAddFood(true);
                }}
              >
                <LiquidCard style={styles.mealContent}>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealLeft}>
                      <View style={[styles.mealIcon, { backgroundColor: meal.color + '20' }]}>
                        <Icon name={meal.icon} size={20} color={meal.color} />
                      </View>
                      <Text style={styles.mealName}>{meal.name}</Text>
                    </View>
                    <View style={styles.mealRight}>
                      <Text style={styles.mealCalories}>{mealCalories} cal</Text>
                      <Icon name="add-circle" size={24} color={theme.colors.primary.main} />
                    </View>
                  </View>
                  
                  {mealFoods.length > 0 && (
                    <View style={styles.mealFoods}>
                      {mealFoods.map((food) => (
                        <View key={food.id} style={styles.foodItem}>
                          <Text style={styles.foodName}>{food.name}</Text>
                          <Text style={styles.foodCalories}>{food.calories} cal</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </LiquidCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Add Section */}
        <View style={styles.quickAddContainer}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickAddFoods.map((food, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickAddCard}
                onPress={() => {
                  Alert.alert(
                    'Add Food',
                    `Add ${food.name} to ${selectedMeal}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Add', 
                        onPress: () => addFood({ ...food, meal: selectedMeal })
                      },
                    ]
                  );
                }}
              >
                <LiquidCard style={styles.quickAddContent}>
                  <Text style={styles.quickAddName}>{food.name}</Text>
                  <Text style={styles.quickAddCalories}>{food.calories} cal</Text>
                  <View style={styles.quickAddMacros}>
                    <Text style={[styles.quickAddMacro, { color: '#4ECDC4' }]}>P: {food.protein}g</Text>
                    <Text style={[styles.quickAddMacro, { color: '#FFB74D' }]}>C: {food.carbs}g</Text>
                    <Text style={[styles.quickAddMacro, { color: '#7E57C2' }]}>F: {food.fat}g</Text>
                  </View>
                </LiquidCard>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: Platform.OS === 'ios' ? 120 : 100 }} />
      </Animated.ScrollView>

      {/* Add Food Modal */}
      <Modal
        visible={showAddFood}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddFood(false)}
      >
        <View style={styles.modalOverlay}>
          <LiquidCard style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food to {selectedMeal}</Text>
              <TouchableOpacity onPress={() => setShowAddFood(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <LiquidInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search food..."
              style={styles.searchInput}
            />
            
            <FlatList
              data={quickAddFoods.filter(food => 
                food.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.foodSearchItem}
                  onPress={() => addFood({ ...item, meal: selectedMeal })}
                >
                  <View>
                    <Text style={styles.foodSearchName}>{item.name}</Text>
                    <View style={styles.foodSearchMacros}>
                      <Text style={styles.foodSearchMacro}>
                        {item.calories} cal
                      </Text>
                      <Text style={[styles.foodSearchMacro, { color: '#4ECDC4' }]}>
                        P: {item.protein}g
                      </Text>
                      <Text style={[styles.foodSearchMacro, { color: '#FFB74D' }]}>
                        C: {item.carbs}g
                      </Text>
                      <Text style={[styles.foodSearchMacro, { color: '#7E57C2' }]}>
                        F: {item.fat}g
                      </Text>
                    </View>
                  </View>
                  <Icon name="add-circle" size={24} color={theme.colors.primary.main} />
                </TouchableOpacity>
              )}
            />
          </LiquidCard>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerDate: {
    fontSize: 16,
    marginTop: 4,
    color: 'rgba(255,255,255,0.7)',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 140 : 120,
    paddingBottom: 20,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  macroItem: {
    marginBottom: 20,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  macroRingContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroIcon: {
    position: 'absolute',
  },
  macroBoxLabel: {
    fontSize: 12,
    marginTop: 8,
    color: 'rgba(255,255,255,0.7)',
  },
  macroBoxValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    color: 'white',
  },
  waterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  waterCard: {
    padding: 16,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  waterValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'white',
  },
  waterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  waterButton: {
    flex: 1,
  },
  mealsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  mealCard: {
    marginBottom: 12,
  },
  mealContent: {
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  mealRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  mealFoods: {
    marginTop: 12,
    paddingLeft: 52,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  foodName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  foodCalories: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  quickAddContainer: {
    paddingLeft: 20,
  },
  quickAddCard: {
    marginRight: 12,
    width: 120,
  },
  quickAddContent: {
    padding: 12,
  },
  quickAddName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: 'white',
  },
  quickAddCalories: {
    fontSize: 12,
    marginBottom: 8,
    color: 'rgba(255,255,255,0.7)',
  },
  quickAddMacros: {
    gap: 2,
  },
  quickAddMacro: {
    fontSize: 10,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchInput: {
    marginBottom: 16,
  },
  foodSearchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  foodSearchName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: 'white',
  },
  foodSearchMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  foodSearchMacro: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default LiquidDietScreen;