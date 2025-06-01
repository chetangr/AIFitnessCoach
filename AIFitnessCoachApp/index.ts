import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

// Temporarily disable FileLogger to fix infinite recursion
// import './src/utils/FileLogger';

import App from './App';

// Log app startup
console.log('🚀 App index.ts loaded at:', new Date().toISOString());

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);