import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';

console.log('[App.tsx] Starting imports...');

// Add try-catch around each import to identify issues
let AppNavigator: any;
try {
  console.log('[App.tsx] About to require AppNavigator...');
  const navModule = require('./src/navigation/AppNavigator');
  console.log('[App.tsx] AppNavigator module loaded, keys:', Object.keys(navModule));
  AppNavigator = navModule.default;
  console.log('[App.tsx] AppNavigator default export:', typeof AppNavigator);
} catch (error: any) {
  console.error('[App.tsx] Error importing AppNavigator:', error.message);
  console.error('[App.tsx] Error stack:', error.stack);
  
  // Create a fallback navigator
  AppNavigator = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Navigation Error</Text>
      <Text style={{ fontSize: 12, color: 'red', margin: 20 }}>{error.message}</Text>
    </View>
  );
}

let useAuthStore: any;
try {
  console.log('[App.tsx] Importing useAuthStore...');
  const authModule = require('./src/store/authStore');
  useAuthStore = authModule.useAuthStore;
  console.log('[App.tsx] useAuthStore imported successfully');
} catch (error) {
  console.error('[App.tsx] Error importing useAuthStore:', error);
}

let ThemeProvider: any, useTheme: any;
try {
  console.log('[App.tsx] Importing ThemeContext...');
  const themeModule = require('./src/contexts/ThemeContext');
  ThemeProvider = themeModule.ThemeProvider;
  useTheme = themeModule.useTheme;
  console.log('[App.tsx] ThemeContext imported successfully');
} catch (error) {
  console.error('[App.tsx] Error importing ThemeContext:', error);
}

console.log('[App.tsx] All imports completed');

const AppContent: React.FC = () => {
  console.log('[AppContent] Component rendering...');
  
  const [isReady, setIsReady] = useState(false);
  
  let checkAuth: any, isLoading: any, isAuthenticated: any;
  try {
    console.log('[AppContent] Calling useAuthStore...');
    const authState = useAuthStore();
    checkAuth = authState.checkAuth;
    isLoading = authState.isLoading;
    isAuthenticated = authState.isAuthenticated;
    console.log('[AppContent] Auth state retrieved:', { isLoading, isAuthenticated });
  } catch (error) {
    console.error('[AppContent] Error using auth store:', error);
    checkAuth = async () => {};
    isLoading = false;
    isAuthenticated = false;
  }
  
  let theme: any, isDarkMode: any;
  try {
    console.log('[AppContent] Calling useTheme...');
    const themeContext = useTheme();
    console.log('[AppContent] Theme context:', themeContext);
    theme = themeContext.theme;
    isDarkMode = themeContext.isDarkMode;
    console.log('[AppContent] Theme retrieved successfully');
  } catch (error) {
    console.error('[AppContent] Error using theme:', error);
    // Use default values if theme context is not ready
    theme = {
      colors: {
        background: '#F2F2F7',
        primary: '#007AFF',
      }
    };
    isDarkMode = false;
  }

  useEffect(() => {
    console.log('[AppContent] useEffect running...');
    
    const initializeApp = async () => {
      try {
        console.log('[AppContent] Starting app initialization...');
        await checkAuth();
        console.log('[AppContent] Auth check completed');
        setIsReady(true);
        console.log('[AppContent] App is ready');
      } catch (error) {
        console.error('[AppContent] App initialization error:', error);
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  console.log('[AppContent] Render check - isReady:', isReady, 'isLoading:', isLoading);

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

  console.log('[AppContent] Rendering main app...');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar 
          barStyle={isDarkMode ? "light-content" : "dark-content"} 
          backgroundColor={theme.colors.background} 
        />
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <NavigationContainer>
            {AppNavigator ? <AppNavigator /> : <Text>Navigator not loaded</Text>}
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const App: React.FC = () => {
  console.log('[App] Root component rendering...');
  
  if (!ThemeProvider) {
    console.error('[App] ThemeProvider not loaded!');
    return <Text>Error: ThemeProvider not loaded</Text>;
  }
  
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

console.log('[App.tsx] Exporting App component...');
export default App;