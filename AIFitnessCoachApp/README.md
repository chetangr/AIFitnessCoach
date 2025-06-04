# AI Fitness Coach App - React Native

**This is the unified codebase for building both Android (APK) and iOS (IPA) files.**

A comprehensive fitness coaching app built with React Native, featuring AI-powered personal training, workout planning, and progress tracking.

## 🚀 Quick Summary

- **Single Codebase**: Build both Android APK and iOS IPA from this directory
- **Demo Login**: `demo@fitness.com` / `demo123`
- **APK Location**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Backend**: Optional Python FastAPI server for full AI features

## ✨ Features

- 🔐 **Authentication System** - Secure login/registration with demo account
- 🏠 **Home Dashboard** - Overview of daily workouts, progress stats, and quick actions
- 💪 **Workout Management** - Drag & drop workout scheduling, exercise library with 10,000+ exercises
- 🤖 **AI Coach Chat** - Real-time chat with AI fitness coach using OpenAI GPT-4
- 🧠 **Multi-Agent System** - Specialized AI agents for comprehensive fitness coaching:
  - 💪 Primary Fitness Coach - Overall guidance and workout planning
  - 🥗 Nutrition Specialist - Meal planning and dietary advice
  - 😴 Recovery Expert - Sleep optimization and stress management
  - 🎯 Goal Strategist - Progress tracking and goal achievement
  - 🛡️ Form & Safety Specialist - Injury prevention and exercise form
  - 📋 Fitness Action Coordinator - Workout modifications and scheduling
- 📅 **Timeline Integration** - All agents have access to your workout schedule
- 👁️ **Agent Visibility** - See which specialists are consulted for each response
- 👤 **Profile & Settings** - User preferences, coach selection, theme customization
- 🎨 **Glassmorphic UI** - Modern design with blur effects and transparency
- 📱 **Cross-Platform** - Single codebase for iOS and Android

## Prerequisites

- Node.js 18+ and npm
- For Android: Android Studio with Android SDK
- For iOS: macOS with Xcode 14+
- Python 3.8+ (optional, for backend)

## 📦 Building Release Files

### 🤖 Building Android APK

```bash
# Navigate to Android directory
cd android

# Build Debug APK (for testing)
./gradlew assembleDebug

# ✅ Debug APK will be at: android/app/build/outputs/apk/debug/app-debug.apk

# Build Release APK (for production)
./gradlew assembleRelease

# ✅ Release APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

### 🍎 Building iOS IPA (macOS only)

```bash
# Navigate to iOS directory
cd ios

# Install CocoaPods dependencies
pod install

# Open in Xcode
open AIFitnessCoachApp.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device (arm64)" as the destination
# 2. Menu: Product → Archive
# 3. Wait for archive to complete
# 4. Menu: Window → Organizer
# 5. Select your archive → "Distribute App"
# 6. Choose "Ad Hoc" or "App Store" → Next
# 7. Select options → Export
# ✅ IPA file will be saved to your chosen location
```

## 🚀 Quick Start (Development)

1. **Install Dependencies**
```bash
npm install --legacy-peer-deps
```

2. **Run on Android Emulator**
```bash
npx react-native run-android
```

3. **Run on iOS Simulator** (macOS only)
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

## 📱 Running on Physical Devices

### Android Device
```bash
# Enable Developer Mode and USB Debugging on your Android device
# Connect device via USB

# Verify device is connected
adb devices

# Run the app
npx react-native run-android
```

### iOS Device (macOS only)
```bash
# Connect iPhone via USB and trust the computer

# In Xcode:
# 1. Select your connected device from the device list
# 2. Click the Run button or press Cmd+R
```

## 🔧 Backend Setup (Optional - for AI features)

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
Create `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost/aicoach
OPENAI_API_KEY=your-openai-api-key
JWT_SECRET=your-jwt-secret
```

5. **Run the backend**
```bash
python main.py
```

Backend will run on http://localhost:8000

## 📁 Project Structure

```
AIFitnessCoachApp/
├── src/
│   ├── screens/          # All app screens
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── WorkoutsScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── services/         # API services
│   ├── store/           # Zustand state management
│   └── types/           # TypeScript types
├── android/             # Android-specific code
├── ios/                 # iOS-specific code
├── backend/             # Python FastAPI backend
└── docs/               # Documentation
```

## 🛠️ Troubleshooting

### Android Build Issues

**Java Version Error:**
```bash
# Use Java 17 for React Native
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

**Gradle Build Failed:**
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS Build Issues

**Pod Installation Failed:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

**Build Failed in Xcode:**
1. Clean build folder: Shift+Cmd+K
2. Delete derived data: ~/Library/Developer/Xcode/DerivedData
3. Restart Xcode

### Metro Bundler Issues

```bash
# Reset cache
npx react-native start --reset-cache

# Kill existing Metro processes
killall -9 node
```

## 🔧 Backend Configuration (Optional)

The app includes a Python FastAPI backend with advanced multi-agent AI capabilities:

### Starting the Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API keys
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Run the backend server
python app.py
```

The backend will start on `http://localhost:8000`

### Multi-Agent System Features

When the backend is running, the app automatically enables:
- **Multi-Agent Responses** - Multiple AI specialists collaborate on your queries
- **Agent Visibility** - See which specialists (nutrition, recovery, etc.) contributed
- **Timeline Integration** - All agents have access to your workout schedule
- **Smart Workout Modifications** - Agents can modify your schedule based on needs

Toggle between single/multi-agent mode using the people/person icon in the AI chat header.

## 🔑 API Keys

For full functionality, configure these in the backend:
- **OpenAI API Key** - Required for AI coach chat and multi-agent system
- **WGER API** - No key needed (public API for exercises)

## 📝 Important Notes

1. **This is the single unified codebase** - Use only this directory for all builds
2. **Demo account works offline** - No backend needed for basic testing
3. **Backend required for**: AI coach chat, workout recommendations, data persistence
4. **Build locations**:
   - Android APK: `android/app/build/outputs/apk/`
   - iOS IPA: Exported from Xcode Organizer

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install --legacy-peer-deps` |
| "SDK location not found" | Open project in Android Studio once |
| "No bundle URL present" | Run `npx react-native start` first |
| "Could not connect to development server" | Check Metro is running on port 8081 |

## 📞 Support

For additional help:
1. Check the [React Native docs](https://reactnative.dev/docs/getting-started)
2. Review the troubleshooting section above
3. Check Metro bundler logs for errors

---

**Remember**: This is your single codebase for building both Android APK and iOS IPA files. All development and builds should be done from this directory.