import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

// Auth Screens
import { SplashScreen } from '@/screens/auth/SplashScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';

// Onboarding Screens
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { CoachSelectionScreen } from '@/screens/onboarding/CoachSelectionScreen';
import { CoachIntroScreen } from '@/screens/onboarding/CoachIntroScreen';

// Main Screens
import { CompassScreen } from '@/screens/main/CompassScreen';
import { WorkoutsScreen } from '@/screens/main/WorkoutsScreen';
import { DiscoverScreen } from '@/screens/main/DiscoverScreen';
import { MessagesScreen } from '@/screens/main/MessagesScreen';
import { ProfileScreen } from '@/screens/main/ProfileScreen';

// Workout Screens
import { ActiveWorkoutScreen } from '@/screens/workout/ActiveWorkoutScreen';
import { ExercisePlayerScreen } from '@/screens/workout/ExercisePlayerScreen';

// Other Screens
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { ExerciseLibraryScreen } from '@/screens/exercises/ExerciseLibraryScreen';

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  CoachSelection: undefined;
  CoachIntro: { coachId: string };
  MainTabs: undefined;
  ActiveWorkout: { workoutId: string };
  ExercisePlayer: { exerciseId: string; workoutId: string };
  Settings: undefined;
  ExerciseLibrary: undefined;
};

export type MainTabParamList = {
  Compass: undefined;
  Workouts: undefined;
  Discover: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const { theme } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Compass':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Workouts':
              iconName = focused ? 'dumbbell' : 'dumbbell';
              break;
            case 'Discover':
              iconName = focused ? 'telescope' : 'telescope';
              break;
            case 'Messages':
              iconName = focused ? 'message' : 'message-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Compass" component={CompassScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useThemeStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : !user?.onboardingCompleted ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="CoachSelection" component={CoachSelectionScreen} />
          <Stack.Screen name="CoachIntro" component={CoachIntroScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="ActiveWorkout"
            component={ActiveWorkoutScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="ExercisePlayer"
            component={ExercisePlayerScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="ExerciseLibrary"
            component={ExerciseLibraryScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};