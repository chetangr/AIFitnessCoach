console.log('[AppNavigator] Starting imports...');

import React, { useRef, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, TouchableOpacity, Animated, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';

console.log('[AppNavigator] Importing useTheme...');
import { useTheme } from '../contexts/ThemeContext';
console.log('[AppNavigator] useTheme imported');

// Auth Screens
console.log('[AppNavigator] Importing LoginScreen...');
import LoginScreen from '../screens/LoginScreen';
console.log('[AppNavigator] LoginScreen imported');

console.log('[AppNavigator] Importing RegisterScreen...');
import RegisterScreen from '../screens/RegisterScreen';
console.log('[AppNavigator] RegisterScreen imported');

// Main Screens
console.log('[AppNavigator] Importing ModernTimelineScreen...');
import ModernTimelineScreen from '../screens/ModernTimelineScreen';
console.log('[AppNavigator] ModernTimelineScreen imported');

console.log('[AppNavigator] Importing ModernDiscoverScreen...');
import ModernDiscoverScreen from '../screens/ModernDiscoverScreen';
console.log('[AppNavigator] ModernDiscoverScreen imported');

console.log('[AppNavigator] About to import ModernExerciseLibraryScreen...');
try {
  const ModernExerciseLib = require('../screens/ModernExerciseLibraryScreen').default;
  console.log('[AppNavigator] ModernExerciseLibraryScreen loaded:', typeof ModernExerciseLib);
} catch (error) {
  console.error('[AppNavigator] Error loading ModernExerciseLibraryScreen:', error);
}

console.log('[AppNavigator] Importing ModernProfileScreen...');
import ModernProfileScreen from '../screens/ModernProfileScreen';
console.log('[AppNavigator] ModernProfileScreen imported');

console.log('[AppNavigator] Importing ModernMessagesScreen...');
import ModernMessagesScreen from '../screens/ModernMessagesScreen';
console.log('[AppNavigator] ModernMessagesScreen imported');

console.log('[AppNavigator] Importing ModernFastingScreen...');
import ModernFastingScreen from '../screens/ModernFastingScreen';
console.log('[AppNavigator] ModernFastingScreen imported');

console.log('[AppNavigator] Importing ModernDietScreen...');
import ModernDietScreen from '../screens/ModernDietScreen';
console.log('[AppNavigator] ModernDietScreen imported');

console.log('[AppNavigator] Importing StatsScreen...');
import StatsScreen from '../screens/StatsScreen';
console.log('[AppNavigator] StatsScreen imported');

// Workout Screens
console.log('[AppNavigator] Importing workout screens...');
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
console.log('[AppNavigator] Importing ModernExerciseLibraryScreen directly...');
import ModernExerciseLibraryScreen from '../screens/ModernExerciseLibraryScreen';
console.log('[AppNavigator] ModernExerciseLibraryScreen imported successfully');
import ModernWorkoutDetailScreen from '../screens/ModernWorkoutDetailScreen';
import WorkoutTrackingScreen from '../screens/WorkoutTrackingScreen';
import WorkoutOverviewScreen from '../screens/WorkoutOverviewScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';

// Program Screens
import ProgramsScreen from '../screens/ProgramsScreen';
import ProgramDetailScreen from '../screens/ProgramDetailScreen';

// Progress Screens
import MeasurementsScreen from '../screens/MeasurementsScreen';
import ProgressPhotosScreen from '../screens/ProgressPhotosScreen';

// Other Screens
import HomeScreen from '../screens/HomeScreen';
import TrainerSelectionScreen from '../screens/TrainerSelectionScreen';
import WorkoutDownloadsScreen from '../screens/WorkoutDownloadsScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import ModernExerciseDetailScreen from '../screens/ModernExerciseDetailScreen';
import DebugLogScreen from '../screens/DebugLogScreen';

// Store
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="DebugLogs" component={DebugLogScreen} />
  </Stack.Navigator>
);

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { theme } = useTheme();
  const scaleValues = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  const animateTab = (index: number, focused: boolean) => {
    if (focused) {
      // Bounce effect when selected
      Animated.sequence([
        Animated.spring(scaleValues[index], {
          toValue: 1.2,
          useNativeDriver: true,
          speed: 20,
          bounciness: 12,
        }),
        Animated.spring(scaleValues[index], {
          toValue: 1.1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
      ]).start();
    } else {
      Animated.spring(scaleValues[index], {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }).start();
    }
  };

  useEffect(() => {
    state.routes.forEach((_route, index: number) => {
      animateTab(index, state.index === index);
    });
  }, [state.index]);

  // Filter out Profile to show in separate bubble
  const mainRoutes = state.routes.filter((route: any) => 
    route.name !== 'Profile'
  );

  return (
    <View style={styles.tabBarContainer}>
      {/* Main navigation bar with 4 items */}
      <BlurView 
        intensity={95} 
        tint={theme.colors.tabBarBlur}
        style={[
          styles.tabBar,
          {
            backgroundColor: Platform.OS === 'ios' ? theme.colors.tabBarBackground : theme.colors.surface,
            borderColor: theme.colors.tabBarBorder,
          }
        ]}
      >
        <View style={styles.tabBarContent}>
        {mainRoutes.map((route: any, index: number) => {
          const isFocused = state.index === state.routes.findIndex((r: any) => r.name === route.name);

          const iconMap: Record<string, string> = {
            Timeline: 'calendar-outline',
            Discover: 'compass-outline',
            Fasting: 'timer-outline',
            Diet: 'nutrition-outline',
            Messages: 'chatbubble-outline',
          };
          
          const labelMap: Record<string, string> = {
            Timeline: 'Timeline',
            Discover: 'Discover',
            Fasting: 'Fasting',
            Diet: 'Nutrition',
            Messages: 'AI Coach',
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity 
              key={index} 
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: scaleValues[state.routes.findIndex((r: any) => r.name === route.name)] }],
                  },
                  isFocused && styles.activeIconContainer,
                ]}
              >
                <Icon
                  name={iconMap[route.name] || 'ellipse-outline'}
                  size={24}
                  color={isFocused ? theme.colors.tabBarIconActive : theme.colors.tabBarIcon}
                />
              </Animated.View>
              <Text style={[
                styles.tabLabel,
                {
                  color: isFocused ? theme.colors.tabBarIconActive : theme.colors.tabBarIcon,
                }
              ]}>
                {labelMap[route.name] || route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        </View>
      </BlurView>
      
      {/* Separate bubble for Settings/Profile */}
      <BlurView 
        intensity={95} 
        tint={theme.colors.tabBarBlur}
        style={[
          styles.searchBubble,
          {
            backgroundColor: Platform.OS === 'ios' ? theme.colors.tabBarBackground : theme.colors.surface,
            borderColor: theme.colors.tabBarBorder,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.searchItem}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Icon
            name="person-outline"
            size={24}
            color={state.routes[state.index].name === 'Profile' ? theme.colors.tabBarIconActive : theme.colors.tabBarIcon}
          />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarStyle: { display: 'none' }, // Hide default tab bar
    }}
    initialRouteName="Timeline"
  >
    <Tab.Screen name="Timeline" component={ModernTimelineScreen} />
    <Tab.Screen name="Discover" component={ModernDiscoverScreen} />
    <Tab.Screen name="Fasting" component={ModernFastingScreen} />
    <Tab.Screen name="Diet" component={ModernDietScreen} />
    <Tab.Screen name="Messages" component={ModernMessagesScreen} />
    <Tab.Screen name="Profile" component={ModernProfileScreen} />
  </Tab.Navigator>
);

const MainStack = () => {
  console.log('[MainStack] Creating stack with ModernExerciseLibraryScreen:', !!ModernExerciseLibraryScreen);
  return (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
    <Stack.Screen name="ExerciseDetail" component={ModernExerciseDetailScreen} />
    <Stack.Screen name="WorkoutDetail" component={ModernWorkoutDetailScreen as any} />
    <Stack.Screen name="WorkoutOverview" component={WorkoutOverviewScreen} />
    <Stack.Screen name="WorkoutTracking" component={WorkoutTrackingScreen} />
    <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen as any} />
    <Stack.Screen name="Programs" component={ProgramsScreen} />
    <Stack.Screen 
      name="ExerciseLibrary" 
      component={ModernExerciseLibraryScreen}
      listeners={{
        focus: () => console.log('[Navigation] ExerciseLibrary screen focused'),
        beforeRemove: () => console.log('[Navigation] Leaving ExerciseLibrary screen')
      }}
    />
    <Stack.Screen name="Stats" component={StatsScreen} />
    <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
    <Stack.Screen name="ProgressPhotos" component={ProgressPhotosScreen} />
    <Stack.Screen name="Measurements" component={MeasurementsScreen} />
    <Stack.Screen name="TrainerSelection" component={TrainerSelectionScreen} />
    <Stack.Screen name="WorkoutDownloads" component={WorkoutDownloadsScreen} />
    <Stack.Screen name="Workouts" component={WorkoutsScreen} />
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 10, // Account for iPhone notch
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    pointerEvents: 'box-none', // Allow touches to pass through empty areas
  },
  tabBar: {
    flex: 1,
    height: Platform.OS === 'ios' ? 70 : 65,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 0.5,
    // Dynamic shadows based on theme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  activeIconContainer: {
    // Remove background for cleaner look
  },
  activeDot: {
    position: 'absolute',
    bottom: -10,
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  settingsBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 85,
    right: 16,
  },
  settingsButton: {
    width: 56,
    height: 56,
  },
  settingsBar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  divider: {
    width: 1,
    height: 32,
    marginHorizontal: 12,
  },
  settingsItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 16,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelActive: {
    // Dynamic color handled inline
  },
  searchBubble: {
    width: Platform.OS === 'ios' ? 56 : 52,
    height: Platform.OS === 'ios' ? 56 : 52,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  searchItem: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});