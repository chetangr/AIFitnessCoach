import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main Screens
import CreativeHomeScreen from '../screens/CreativeHomeScreen';
import EnhancedDiscoverScreen from '../screens/EnhancedDiscoverScreen';
import ImprovedProfileScreen from '../screens/ImprovedProfileScreen';
import SimpleMessagesScreen from '../screens/SimpleMessagesScreen';

// Other Screens
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import DebugLogScreen from '../screens/DebugLogScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import ProgressPhotosScreen from '../screens/ProgressPhotosScreen';
import MeasurementsScreen from '../screens/MeasurementsScreen';

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
      <BlurView intensity={100} tint="dark" style={styles.tabBar}>
        <View style={styles.tabBarOverlay}>
          <View style={styles.tabBarContent}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const iconMap: Record<string, string> = {
              Home: 'home',
              Discover: 'compass',
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
              <View key={index} style={styles.tabItem}>
                <Icon
                  name={iconMap[route.name] || 'ellipse'}
                  size={24}
                  color={isFocused ? '#667eea' : 'rgba(255,255,255,0.6)'}
                  onPress={onPress}
                />
              </View>
            );
          })}
          </View>
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
  >
    <Tab.Screen name="Home" component={CreativeHomeScreen} />
    <Tab.Screen name="Discover" component={EnhancedDiscoverScreen} />
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
    <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
    <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
    <Stack.Screen name="ProgressPhotos" component={ProgressPhotosScreen} />
    <Stack.Screen name="Measurements" component={MeasurementsScreen} />
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
    height: Platform.OS === 'ios' ? 110 : 100,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  tabBar: {
    height: Platform.OS === 'ios' ? 70 : 60,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tabBarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Added solid overlay
    borderRadius: 25,
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