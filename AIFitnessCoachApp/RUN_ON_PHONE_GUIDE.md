# Run AI Fitness Coach on Your Phone (Flutter-style)

## 🔥 Live Development with Logs & Hot Reload

### Step 1: Enable Developer Mode on Your Phone

**Android:**
1. Go to Settings → About Phone
2. Tap "Build Number" 7 times
3. Go back to Settings → Developer Options
4. Enable "USB Debugging"
5. Connect phone to computer via USB

**iPhone:**
1. Connect to computer via USB
2. Trust the computer when prompted

### Step 2: Check Device Connection

```bash
# For Android - check if device is detected
adb devices

# For iPhone - check if device is detected  
npx expo run:ios --device
```

### Step 3: Run with Live Logs (Just like Flutter!)

**Option A: Android with Live Logs**
```bash
cd /Users/chetangrandhe/Desktop/AIFitnessCoach/AIFitnessSimple

# Start Metro bundler first (for hot reload)
npm start

# In another terminal, run on Android device
npx expo run:android --device

# View live logs in another terminal
npx react-native log-android
```

**Option B: iPhone with Live Logs**
```bash
cd /Users/chetangrandhe/Desktop/AIFitnessCoach/AIFitnessSimple

# Start Metro bundler first
npm start

# Run on iOS device
npx expo run:ios --device

# View live logs
npx react-native log-ios
```

**Option C: Expo Development Build (Recommended)**
```bash
cd /Users/chetangrandhe/Desktop/AIFitnessCoach/AIFitnessSimple

# Start Expo with QR code
npx expo start --dev-client

# Scan QR code with phone camera or Expo app
```

## 🔧 What You'll See (Just like Flutter!)

### Live Logs Output:
```
[APP] AI Fitness Coach App Started {"version":"1.0.0"}
[UI] Screen Navigate on workouts
[USER] Workouts Card Pressed
[NAV] home → workouts
[PERF] workouts Screen Render: 2ms
[USER] Start Workout Button Pressed {"workout":"Upper Body Strength"}
[WORKOUT] Workout Started {"name":"Upper Body Strength","timestamp":"2025-05-30T18:20:15.123Z"}
```

### Hot Reload Features:
- ✅ **Instant Code Updates** - Save file → see changes immediately
- ✅ **Live Logs** - All AppLogger calls appear in terminal
- ✅ **Error Debugging** - Stack traces and error details
- ✅ **Performance Metrics** - Render times and performance data
- ✅ **User Interaction Tracking** - Every tap/navigation logged

## 📱 App Features to Test

### 1. Home Screen
- Tap each card (Workouts, AI Coach, Progress, Exercise Library)
- Check logs for navigation events

### 2. Workouts Screen  
- Tap "Start Workout" button
- View logs for workout tracking
- Test back navigation

### 3. AI Coach Screen
- Tap chat input area
- See AI coach interaction logs

### 4. Progress Screen
- View progress stats
- Check performance logging

### 5. Exercise Library
- Tap exercise cards
- Monitor exercise interaction logs

## 🔍 Advanced Debugging

### React Native Debugger
```bash
# Install React Native Debugger
brew install --cask react-native-debugger

# Start debugger
react-native-debugger

# Enable debugging in app
# Shake phone → "Debug" → "Debug with Chrome"
```

### Flipper Integration (Professional Debugging)
```bash
# Install Flipper
brew install --cask flipper

# Your app will automatically connect to Flipper
# View logs, network requests, layout inspector
```

### Metro Bundler Features
- **Fast Refresh**: Automatic reload on file save
- **Error Overlay**: Red screen with detailed errors
- **Console Logs**: All console.log() and AppLogger calls
- **Performance Monitor**: FPS and memory usage

## 🚀 Quick Commands

```bash
# Start development (Flutter equivalent of "flutter run")
npm start

# Run on connected Android device
npx expo run:android --device

# Run on connected iPhone  
npx expo run:ios --device

# View logs (like "flutter logs")
npx react-native log-android  # Android logs
npx react-native log-ios      # iOS logs

# Clear cache if issues
npx expo start --clear

# Build production APK
npx expo build:android
```

## 📊 Logger Features in Your App

Your app includes comprehensive logging:

### Log Categories:
- `[APP]` - General application events
- `[UI]` - User interface interactions  
- `[NAV]` - Navigation between screens
- `[USER]` - User actions (taps, inputs)
- `[WORKOUT]` - Workout-related events
- `[AI_COACH]` - AI coaching interactions
- `[PERF]` - Performance metrics
- `[API]` - Network requests (when added)

### Real-time Monitoring:
Every user interaction is logged with:
- Timestamp
- Action type
- Screen context
- Additional data (workout names, navigation paths, etc.)

This gives you the same live debugging experience as Flutter's `flutter run` command!

## 🔧 Troubleshooting

### Device Not Detected
```bash
# Android
adb kill-server
adb start-server
adb devices

# Make sure USB debugging is enabled
```

### Metro Connection Issues
```bash
# Reset Metro cache
npx expo start --clear

# Reset node modules
rm -rf node_modules
npm install
```

### Build Errors
```bash
# Clean builds
npx expo prebuild --clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

Now you can develop with live logs and hot reload just like Flutter! 🚀