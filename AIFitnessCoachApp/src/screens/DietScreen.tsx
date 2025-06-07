import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '../store/themeStore';

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
  water: number; // in ml
  foods: FoodItem[];
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

const DietScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useThemeStore();
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
  }, [selectedDate]);

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

  const gradientColors = isDarkMode 
    ? [theme.colors.background, theme.colors.surface, '#24243e'] as const
    : [theme.colors.primary, theme.colors.secondary] as const;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Nutrition</Text>
          <Text style={[styles.headerDate, { color: theme.colors.textSecondary }]}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Daily Summary */}
        <View style={styles.summaryContainer}>
          <BlurView intensity={25} tint={isDarkMode ? "dark" : "light"} style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Daily Summary</Text>
              <TouchableOpacity onPress={() => Alert.alert('Edit Goals', 'Goal editing coming soon!')}>
                <Icon name="settings-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Calories Progress */}
            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <Text style={[styles.macroLabel, { color: theme.colors.text }]}>Calories</Text>
                <Text style={[styles.macroValue, { color: theme.colors.text }]}>
                  {dailyNutrition.calories} / {nutritionGoals.calories}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${getProgress(dailyNutrition.calories, nutritionGoals.calories)}%`,
                      backgroundColor: '#FF6B6B' 
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Macros Grid */}
            <View style={styles.macrosGrid}>
              {/* Protein */}
              <View style={styles.macroBox}>
                <Icon name="fitness" size={20} color="#4ECDC4" />
                <Text style={[styles.macroBoxLabel, { color: theme.colors.textSecondary }]}>Protein</Text>
                <Text style={[styles.macroBoxValue, { color: theme.colors.text }]}>
                  {dailyNutrition.protein}g
                </Text>
                <View style={styles.miniProgressBar}>
                  <View 
                    style={[
                      styles.miniProgressFill, 
                      { 
                        width: `${getProgress(dailyNutrition.protein, nutritionGoals.protein)}%`,
                        backgroundColor: '#4ECDC4' 
                      }
                    ]} 
                  />
                </View>
              </View>

              {/* Carbs */}
              <View style={styles.macroBox}>
                <Icon name="pizza" size={20} color="#FFB74D" />
                <Text style={[styles.macroBoxLabel, { color: theme.colors.textSecondary }]}>Carbs</Text>
                <Text style={[styles.macroBoxValue, { color: theme.colors.text }]}>
                  {dailyNutrition.carbs}g
                </Text>
                <View style={styles.miniProgressBar}>
                  <View 
                    style={[
                      styles.miniProgressFill, 
                      { 
                        width: `${getProgress(dailyNutrition.carbs, nutritionGoals.carbs)}%`,
                        backgroundColor: '#FFB74D' 
                      }
                    ]} 
                  />
                </View>
              </View>

              {/* Fat */}
              <View style={styles.macroBox}>
                <Icon name="water" size={20} color="#7E57C2" />
                <Text style={[styles.macroBoxLabel, { color: theme.colors.textSecondary }]}>Fat</Text>
                <Text style={[styles.macroBoxValue, { color: theme.colors.text }]}>
                  {dailyNutrition.fat}g
                </Text>
                <View style={styles.miniProgressBar}>
                  <View 
                    style={[
                      styles.miniProgressFill, 
                      { 
                        width: `${getProgress(dailyNutrition.fat, nutritionGoals.fat)}%`,
                        backgroundColor: '#7E57C2' 
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Water Tracking */}
        <View style={styles.waterContainer}>
          <BlurView intensity={25} tint={isDarkMode ? "dark" : "light"} style={styles.waterCard}>
            <View style={styles.waterHeader}>
              <Icon name="water-outline" size={24} color="#4FC3F7" />
              <Text style={[styles.waterTitle, { color: theme.colors.text }]}>Water Intake</Text>
            </View>
            <Text style={[styles.waterValue, { color: theme.colors.text }]}>
              {(dailyNutrition.water / 1000).toFixed(1)}L / {(nutritionGoals.water / 1000).toFixed(1)}L
            </Text>
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
          </BlurView>
        </View>

        {/* Meals */}
        <View style={styles.mealsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Meals</Text>
          
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
                <BlurView intensity={25} tint={isDarkMode ? "dark" : "light"} style={styles.mealContent}>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealLeft}>
                      <View style={[styles.mealIcon, { backgroundColor: meal.color + '20' }]}>
                        <Icon name={meal.icon} size={20} color={meal.color} />
                      </View>
                      <Text style={[styles.mealName, { color: theme.colors.text }]}>{meal.name}</Text>
                    </View>
                    <View style={styles.mealRight}>
                      <Text style={[styles.mealCalories, { color: theme.colors.text }]}>{mealCalories} cal</Text>
                      <Icon name="add-circle" size={24} color={theme.colors.primary} />
                    </View>
                  </View>
                  
                  {mealFoods.length > 0 && (
                    <View style={styles.mealFoods}>
                      {mealFoods.map((food) => (
                        <View key={food.id} style={styles.foodItem}>
                          <Text style={[styles.foodName, { color: theme.colors.textSecondary }]}>{food.name}</Text>
                          <Text style={[styles.foodCalories, { color: theme.colors.textSecondary }]}>{food.calories} cal</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </BlurView>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Add Section */}
        <View style={styles.quickAddContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Add</Text>
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
                        onPress: () => addFood(food)
                      },
                    ]
                  );
                }}
              >
                <BlurView intensity={20} tint={isDarkMode ? "dark" : "light"} style={styles.quickAddContent}>
                  <Text style={[styles.quickAddName, { color: theme.colors.text }]}>{food.name}</Text>
                  <Text style={[styles.quickAddCalories, { color: theme.colors.textSecondary }]}>{food.calories} cal</Text>
                  <View style={styles.quickAddMacros}>
                    <Text style={[styles.quickAddMacro, { color: '#4ECDC4' }]}>P: {food.protein}g</Text>
                    <Text style={[styles.quickAddMacro, { color: '#FFB74D' }]}>C: {food.carbs}g</Text>
                    <Text style={[styles.quickAddMacro, { color: '#7E57C2' }]}>F: {food.fat}g</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Add Food Modal */}
      <Modal
        visible={showAddFood}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddFood(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} tint={isDarkMode ? "dark" : "light"} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Food</Text>
              <TouchableOpacity onPress={() => setShowAddFood(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text, backgroundColor: theme.colors.surface }]}
              placeholder="Search food..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <FlatList
              data={quickAddFoods}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.foodSearchItem, { borderBottomColor: theme.colors.border }]}
                  onPress={() => addFood(item)}
                >
                  <View>
                    <Text style={[styles.foodSearchName, { color: theme.colors.text }]}>{item.name}</Text>
                    <View style={styles.foodSearchMacros}>
                      <Text style={[styles.foodSearchMacro, { color: theme.colors.textSecondary }]}>
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
                  <Icon name="add-circle" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            />
          </BlurView>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerDate: {
    fontSize: 16,
    marginTop: 4,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
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
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
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
  macroBoxLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  macroBoxValue: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  miniProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  waterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  waterCard: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
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
  },
  waterValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  waterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  waterButton: {
    flex: 1,
    backgroundColor: 'rgba(79, 195, 247, 0.2)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  waterButtonText: {
    color: '#4FC3F7',
    fontWeight: '600',
  },
  mealsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mealCard: {
    marginBottom: 12,
  },
  mealContent: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
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
  },
  mealRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '500',
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
  },
  foodCalories: {
    fontSize: 14,
  },
  quickAddContainer: {
    paddingLeft: 20,
    paddingBottom: 100,
  },
  quickAddCard: {
    marginRight: 12,
    width: 120,
  },
  quickAddContent: {
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  quickAddName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickAddCalories: {
    fontSize: 12,
    marginBottom: 8,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
    overflow: 'hidden',
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
  },
  searchInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  foodSearchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  foodSearchName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  foodSearchMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  foodSearchMacro: {
    fontSize: 12,
  },
});

export default DietScreen;