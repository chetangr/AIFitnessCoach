// Backup of original App.tsx
import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from './src/store/authStore';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { ErrorBoundary } from './src/utils/errorBoundary';

const AppContent: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();
  
  let theme, isDarkMode;
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    isDarkMode = themeContext.isDarkMode;
  } catch (error) {
    console.log('Theme not ready yet, using defaults');
    // Use default values if theme context is not ready
    theme = {
      colors: {
        background: '#F2F2F7',
        primary: '#007AFF',
      }
    };
    isDarkMode = false;
  }
  
  console.log('App component rendering...');
  
  console.log('App render state:', { isReady, isLoading, isAuthenticated, isDarkMode });

  useEffect(() => {
    console.log('App useEffect running...');
    
    // Initialize app
    console.log('AI Fitness Coach App Started', { 
      version: '2.0.0',
      platform: 'React Native',
      features: 'Full App with Auth, AI Chat, Workouts, Exercise Library',
      timestamp: new Date().toISOString()
    });
    
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        console.log('Current auth state before check:', { isLoading, isAuthenticated });
        
        // Check authentication status
        const startTime = Date.now();
        await checkAuth();
        const endTime = Date.now();
        console.log(`Auth check completed in ${endTime - startTime}ms`);
        
        // Mark app as ready
        setIsReady(true);
        console.log('App is ready - isReady set to true');
      } catch (error) {
        console.error('App initialization error:', error);
        if (error instanceof Error) {
          console.error('Error stack:', error.stack);
        }
        // Even if auth fails, show the app
        setIsReady(true);
        console.log('App marked ready despite error');
      }
    };

    initializeApp();
  }, []);

  // Show loading screen while initializing
  if (!isReady || isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#1a1a1a' 
        }}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar 
          barStyle={isDarkMode ? "light-content" : "dark-content"} 
          backgroundColor={theme.colors.background} 
        />
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;