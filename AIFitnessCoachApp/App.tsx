import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { AppLogger } from './utils/logger';

const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Initialize app
    AppLogger.info('AI Fitness Coach App Started', { 
      version: '2.0.0',
      platform: 'React Native',
      features: 'Full App with Auth, AI Chat, Workouts, Exercise Library'
    });
    
    // Check authentication status
    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;