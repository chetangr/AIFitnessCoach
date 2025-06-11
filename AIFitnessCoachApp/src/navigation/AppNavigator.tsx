import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, TouchableOpacity, Animated, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { modernTheme } from '../config/modernTheme';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main Screens
import ModernTimelineScreen from '../screens/ModernTimelineScreen';
import ModernDiscoverScreen from '../screens/ModernDiscoverScreen';
import ModernProfileScreen from '../screens/ModernProfileScreen';
import ModernMessagesScreen from '../screens/ModernMessagesScreen';
import ModernFastingScreen from '../screens/ModernFastingScreen';
import ModernDietScreen from '../screens/ModernDietScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Workout Screens
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
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
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
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
      <BlurView intensity={95} tint="dark" style={styles.tabBar}>
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
                  color={isFocused ? modernTheme.colors.primary : modernTheme.colors.textTertiary}
                />
              </Animated.View>
              <Text style={[
                styles.tabLabel,
                isFocused && styles.tabLabelActive
              ]}>
                {labelMap[route.name] || route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        </View>
      </BlurView>
      
      {/* Separate bubble for Settings */}
      <BlurView intensity={95} tint="dark" style={styles.searchBubble}>
        <TouchableOpacity 
          style={styles.searchItem}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Icon
            name="settings-outline"
            size={24}
            color={state.routes[state.index].name === 'Profile' ? modernTheme.colors.primary : modernTheme.colors.textTertiary}
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

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
    <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
    <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen as any} />
    <Stack.Screen name="WorkoutOverview" component={WorkoutOverviewScreen} />
    <Stack.Screen name="WorkoutTracking" component={WorkoutTrackingScreen} />
    <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen as any} />
    <Stack.Screen name="Programs" component={ProgramsScreen} />
    <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
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

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 10, // Account for iPhone notch
    paddingHorizontal: modernTheme.spacing.md,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabBar: {
    flex: 1,
    height: Platform.OS === 'ios' ? 70 : 65,
    borderRadius: 35,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    overflow: 'hidden',
    ...modernTheme.shadows.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    backgroundColor: modernTheme.colors.primary,
    shadowColor: modernTheme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  settingsBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 85,
    right: modernTheme.spacing.md,
  },
  settingsButton: {
    width: 56,
    height: 56,
  },
  settingsBar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: modernTheme.colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...modernTheme.shadows.lg,
    borderWidth: 1,
    borderColor: modernTheme.colors.border,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: modernTheme.colors.border,
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
    color: modernTheme.colors.textTertiary,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: modernTheme.colors.primary,
  },
  searchBubble: {
    width: Platform.OS === 'ios' ? 56 : 52,
    height: Platform.OS === 'ios' ? 56 : 52,
    borderRadius: 28,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    overflow: 'hidden',
    ...modernTheme.shadows.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchItem: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});