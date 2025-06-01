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
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        <View style={styles.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const iconMap: Record<string, string> = {
            Timeline: 'calendar',
            Discover: 'compass',
            Fasting: 'timer',
            Stats: 'stats-chart',
            Messages: 'chatbubbles',
            Profile: 'person',
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
              <Icon
                name={iconMap[route.name] || 'ellipse'}
                size={20}
                color={isFocused ? '#FF6B6B' : 'rgba(255,255,255,0.8)'}
              />
            </TouchableOpacity>
          );
        })}
        </View>
      </View>
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
    height: Platform.OS === 'ios' ? 90 : 80,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    paddingHorizontal: 20,
  },
  tabBar: {
    height: Platform.OS === 'ios' ? 55 : 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(20px)',
    elevation: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 5 : 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});