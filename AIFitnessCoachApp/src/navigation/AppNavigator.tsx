import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main Screens
import TimelineScreen from '../screens/TimelineScreen';
import CreativeHomeScreen from '../screens/CreativeHomeScreen';
import EnhancedDiscoverScreen from '../screens/EnhancedDiscoverScreen';
import ImprovedProfileScreen from '../screens/ImprovedProfileScreen';
import SimpleMessagesScreen from '../screens/SimpleMessagesScreen';
import StatsScreen from '../screens/StatsScreen';
import WorkoutTrackingScreen from '../screens/WorkoutTrackingScreen';
import WorkoutOverviewScreen from '../screens/WorkoutOverviewScreen';
import FastingScreen from '../screens/FastingScreen';

// Other Screens
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import EnhancedActiveWorkoutScreen from '../screens/EnhancedActiveWorkoutScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import ProgramDetailScreen from '../screens/ProgramDetailScreen';
import DebugLogScreen from '../screens/DebugLogScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import ProgressPhotosScreen from '../screens/ProgressPhotosScreen';
import MeasurementsScreen from '../screens/MeasurementsScreen';
import TrainerSelectionScreen from '../screens/TrainerSelectionScreen';
import WorkoutDownloadsScreen from '../screens/WorkoutDownloadsScreen';

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

const CustomTabBar = ({ state, navigation }: any) => {
  const scaleValues = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  const animateTab = (index: number, focused: boolean) => {
    Animated.spring(scaleValues[index], {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  useEffect(() => {
    state.routes.forEach((_, index: number) => {
      animateTab(index, state.index === index);
    });
  }, [state.index]);

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={85} tint="dark" style={styles.tabBar}>
        <View style={styles.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const iconMap: Record<string, string> = {
            Timeline: 'calendar-outline',
            Discover: 'compass-outline',
            Fasting: 'timer-outline',
            Stats: 'bar-chart-outline',
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
                  size={22}
                  color={isFocused ? '#fff' : 'rgba(255,255,255,0.4)'}
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
    <Tab.Screen name="Discover" component={EnhancedDiscoverScreen} />
    <Tab.Screen name="Fasting" component={FastingScreen} />
    <Tab.Screen name="Stats" component={StatsScreen} />
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
    <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    <Stack.Screen name="WorkoutOverview" component={WorkoutOverviewScreen} />
    <Stack.Screen name="WorkoutTracking" component={WorkoutTrackingScreen} />
    <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
    <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
    <Stack.Screen name="ProgressPhotos" component={ProgressPhotosScreen} />
    <Stack.Screen name="Measurements" component={MeasurementsScreen} />
    <Stack.Screen name="TrainerSelection" component={TrainerSelectionScreen} />
    <Stack.Screen name="WorkoutDownloads" component={WorkoutDownloadsScreen} />
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
    height: Platform.OS === 'ios' ? 85 : 75,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 16,
  },
  tabBar: {
    height: Platform.OS === 'ios' ? 60 : 55,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
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
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  activeDot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
});