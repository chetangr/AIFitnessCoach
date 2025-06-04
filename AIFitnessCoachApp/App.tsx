import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';

const App: React.FC = () => {
  console.log('App component rendering...');
  
  const [isReady, setIsReady] = useState(false);
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();
  
  console.log('App render state:', { isReady, isLoading, isAuthenticated });

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
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;