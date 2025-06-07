import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main Screens
import TimelineScreen from '../screens/TimelineScreen';
import AppleDiscoverScreen from '../screens/AppleDiscoverScreen';
import ImprovedProfileScreen from '../screens/ImprovedProfileScreen';
import SimpleMessagesScreen from '../screens/SimpleMessagesScreen';
import StatsScreen from '../screens/StatsScreen';
import DietScreen from '../screens/DietScreen';
import WorkoutTrackingScreen from '../screens/WorkoutTrackingScreen';
import WorkoutOverviewScreen from '../screens/WorkoutOverviewScreen';

// Other Screens
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import EnhancedActiveWorkoutScreen from '../screens/EnhancedActiveWorkoutScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import ProgramDetailScreen from '../screens/ProgramDetailScreen';
import ProgramsScreen from '../screens/ProgramsScreen';
import DebugLogScreen from '../screens/DebugLogScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import ProgressPhotosScreen from '../screens/ProgressPhotosScreen';
import MeasurementsScreen from '../screens/MeasurementsScreen';
import TrainerSelectionScreen from '../screens/TrainerSelectionScreen';
import WorkoutDownloadsScreen from '../screens/WorkoutDownloadsScreen';

// Enhanced Screens with Backend Integration
import FixedEnhancedFastingScreen from '../screens/FixedEnhancedFastingScreen';
import EnhancedWorkoutTrackingScreen from '../screens/EnhancedWorkoutTrackingScreen';
import EnhancedMeasurementsScreen from '../screens/EnhancedMeasurementsScreen';

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

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={95} tint="dark" style={styles.tabBar}>
        <View style={styles.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const iconMap: Record<string, string> = {
            Timeline: 'calendar-outline',
            Discover: 'compass-outline',
            Fasting: 'timer-outline',
            Diet: 'nutrition-outline',
            Messages: 'chatbubble-outline',
            Profile: 'person-outline',
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
                    transform: [{ scale: scaleValues[index] }],
                  },
                  isFocused && styles.activeIconContainer,
                ]}
              >
                <Icon
                  name={iconMap[route.name] || 'ellipse-outline'}
                  size={24}
                  color={isFocused ? '#f093fb' : 'rgba(255,255,255,0.6)'}
                />
                {isFocused && (
                  <View style={styles.activeDot} />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
        </View>
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
    <Tab.Screen name="Timeline" component={TimelineScreen} />
    <Tab.Screen name="Discover" component={AppleDiscoverScreen} />
    <Tab.Screen name="Fasting" component={FixedEnhancedFastingScreen} />
    <Tab.Screen name="Diet" component={DietScreen} />
    <Tab.Screen name="Messages" component={SimpleMessagesScreen} />
    <Tab.Screen name="Profile" component={ImprovedProfileScreen} />
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
    <Stack.Screen name="ExerciseDetail" component={ActiveWorkoutScreen} />
    <Stack.Screen name="ActiveWorkout" component={EnhancedActiveWorkoutScreen} />
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
    
    {/* Enhanced Screens with Backend Integration */}
    <Stack.Screen name="EnhancedFasting" component={FixedEnhancedFastingScreen} />
    <Stack.Screen name="EnhancedWorkoutTracking" component={EnhancedWorkoutTrackingScreen} />
    <Stack.Screen name="EnhancedMeasurements" component={EnhancedMeasurementsScreen} />
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
    height: Platform.OS === 'ios' ? 90 : 80,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 12,
  },
  tabBar: {
    height: Platform.OS === 'ios' ? 65 : 60,
    borderRadius: 32,
    backgroundColor: 'rgba(30, 30, 46, 0.85)',
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(240, 147, 251, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(240, 147, 251, 0.4)',
    shadowColor: '#f093fb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  activeDot: {
    position: 'absolute',
    bottom: -10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f093fb',
    shadowColor: '#f093fb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
});