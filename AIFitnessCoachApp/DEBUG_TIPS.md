# Debug Tips - App Stuck on Splash Screen

## 🔍 Debugging Steps

### 1. **Check Console Logs**
When running the app, check the terminal/console for these messages:
- "AI Fitness Coach App Started"
- "Starting auth check..."
- "Auth check completed" or "Auth check failed"
- "Loading state changed: true" then "Loading state changed: false"

### 2. **Common Causes & Solutions**

#### **AsyncStorage Issues**
The app might be stuck trying to read from AsyncStorage. Try:
```bash
# Clear app data and cache
# On physical device: Settings > Apps > Expo Go > Clear Data
# Or uninstall and reinstall Expo Go
```

#### **Network Issues**
If the app is trying to make network requests during initialization:
- Check your internet connection
- Make sure you're not behind a restrictive firewall

#### **JavaScript Bundle Issues**
Try clearing the Metro bundler cache:
```bash
npx expo start -c
# or
npx react-native start --reset-cache
```

### 3. **Quick Fix - Force Skip Auth Check**

If you need to quickly test the app, temporarily modify the authStore:

```typescript
// In src/store/authStore.ts, change checkAuth to:
checkAuth: async () => {
  // Temporarily skip auth check
  set({ isLoading: false, isAuthenticated: false });
},
```

### 4. **Check for Infinite Loops**

Look for these patterns:
- Components that call `checkAuth()` in a loop
- Navigation that redirects infinitely
- State updates that trigger re-renders

### 5. **Metro Bundler Logs**

Check the Metro bundler window for:
- Red error messages
- Failed module resolutions
- Syntax errors

### 6. **Device-Specific Issues**

**iOS:**
- Make sure you're using the latest Expo Go app
- Check iOS version compatibility

**Android:**
- Enable USB debugging
- Check Android version (needs 5.0+)

### 7. **Last Resort - Minimal App Test**

Create a minimal App.tsx to isolate the issue:

```typescript
// Temporarily replace App.tsx content with:
import React from 'react';
import { View, Text } from 'react-native';

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>App is loading!</Text>
    </View>
  );
};

export default App;
```

If this works, gradually add back components to find the issue.

## 🛠️ What We've Already Fixed

1. ✅ Added loading state handling in AppNavigator
2. ✅ Added timeout to auth check (3 seconds)
3. ✅ Added debug logging throughout
4. ✅ Fixed TypeScript errors

## 📱 Expected Flow

1. App starts → Shows loading screen (fitness icon)
2. Auth check runs (max 3 seconds)
3. If no user found → Shows Login screen
4. If user found → Shows Main app with tabs

The auth check should complete within 3 seconds maximum due to our timeout.