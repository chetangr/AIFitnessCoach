# AI Fitness Coach - Complete Running Guide

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.x or higher
- **Python**: Version 3.9 or higher
- **iOS Development** (Mac only): Xcode 14+ with iOS Simulator
- **Android Development**: Android Studio with Android SDK

### Required Tools
```bash
# Check versions
node --version  # Should be 18.x or higher
python --version  # Should be 3.9 or higher
npm --version  # Should be 8.x or higher
```

## 🚀 Quick Start (Frontend Only)

If you just want to run the app with demo features:

```bash
# Navigate to the app directory
cd AIFitnessCoachApp

# Install dependencies
npm install --legacy-peer-deps

# For iOS (Mac only)
cd ios && pod install && cd ..
npx react-native run-ios

# For Android
npx react-native run-android
```

### Demo Credentials
- **Email**: demo@fitness.com
- **Password**: demo123

## 🔧 Complete Setup (Frontend + Backend)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd AIFitnessCoachApp/backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file for backend
cat > .env << EOF
# Backend Configuration
PORT=8000
ENV=development

# Database (SQLite for development)
DATABASE_URL=sqlite:///./fitness_app.db

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# JWT Secret (generate a random string)
JWT_SECRET=your-very-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=10080

# CORS Settings
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8081", "exp://localhost:8081"]
EOF

# Run the backend server
python app.py
```

The backend will start at `http://localhost:8000`. You can view the API documentation at `http://localhost:8000/docs`.

### Step 2: Frontend Setup

Open a new terminal window:

```bash
# Navigate to app directory
cd AIFitnessCoachApp

# Install dependencies
npm install --legacy-peer-deps

# iOS specific setup (Mac only)
cd ios && pod install && cd ..
```

### Step 3: Configure Frontend Environment

The frontend `.env` file is already configured with:
- OpenAI API key for direct AI interactions
- Backend URL pointing to localhost:8000

No changes needed unless you're using a different backend URL.

### Step 4: Run the Mobile App

```bash
# Start Metro bundler (in one terminal)
npx react-native start

# In another terminal, run the app:

# For iOS (Mac only)
npx react-native run-ios

# For Android
npx react-native run-android

# Or use Expo commands:
npm start  # Then press 'i' for iOS or 'a' for Android
```

## 🎯 Features Available

### Without Backend (Demo Mode)
- ✅ Full UI and navigation
- ✅ Authentication flow with demo account
- ✅ Browse 10,000+ exercises (via WGER API)
- ✅ View pre-built workout plans
- ✅ Basic AI responses (using frontend OpenAI key)
- ✅ Image selection for form checks
- ✅ All glassmorphic designs and animations

### With Backend Running
- ✨ Full authentication with user accounts
- ✨ Persistent data storage
- ✨ Multi-agent AI system (6 specialized coaches)
- ✨ Advanced workout generation
- ✨ Progress tracking and analytics
- ✨ Custom workout creation
- ✨ Real-time data synchronization

## 🛠️ Troubleshooting

### Backend Issues

#### Port 8000 Already in Use
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or use different port
PORT=8001 python app.py
```

#### Database Connection Error
```bash
# Reset database
rm fitness_app.db  # Remove existing database
python app.py  # Will create new database on startup
```

#### OpenAI API Key Error
- Ensure your API key is valid and has credits
- Check the key is properly set in backend/.env
- Verify no extra spaces or quotes around the key

### Frontend Issues

#### Metro Bundler Not Starting
```bash
# Clear cache and restart
npx react-native start --reset-cache

# If still failing, kill all node processes
killall -9 node  # macOS/Linux
taskkill /F /IM node.exe  # Windows
```

#### Build Errors on iOS
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
npx react-native run-ios
```

#### Build Errors on Android
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### Module Resolution Errors
```bash
# Clear all caches
watchman watch-del-all  # If you have watchman
rm -rf node_modules
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*
npm install --legacy-peer-deps
```

## 📱 Running on Physical Device

### iOS Device
1. Open `ios/AIFitnessSimple.xcworkspace` in Xcode
2. Select your device from the device list
3. Ensure your device is trusted for development
4. Build and run (Cmd + R)

### Android Device
1. Enable Developer Mode and USB Debugging on your device
2. Connect device via USB
3. Verify device is connected: `adb devices`
4. Run: `npx react-native run-android`

For wireless debugging, see the [RUN_ON_PHONE_GUIDE.md](./RUN_ON_PHONE_GUIDE.md).

## 🔍 Verifying Everything Works

### Backend Health Check
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"AI Fitness Coach Backend","version":"1.0.0"}
```

### Frontend Checks
1. **Login**: Use demo@fitness.com / demo123
2. **Navigation**: All 5 bottom tabs should work
3. **Exercises**: Browse exercises in Discover tab
4. **AI Chat**: Send a message in Messages tab
5. **Workouts**: View workout plans in Workouts tab

## 📊 Monitoring Logs

### Backend Logs
- Backend logs appear in the terminal where `python app.py` is running
- Look for database connections, API requests, and error messages

### Frontend Logs
- **Metro Bundler**: Shows bundle building and refresh status
- **Device Logs**: 
  - iOS: Use Xcode console or `npx react-native log-ios`
  - Android: Use `npx react-native log-android`

## 🚀 Production Deployment

For production deployment:

1. **Backend**: Use proper PostgreSQL database and deploy to cloud (AWS, GCP, Heroku)
2. **Frontend**: Build release versions for app stores
3. **Environment**: Update all URLs and API keys for production
4. **Security**: Enable HTTPS, proper CORS, and authentication

See [deployment_guide.md](./docs/deployment_guide.md) for detailed production setup.

## 📞 Getting Help

If you encounter issues:
1. Check the [ERROR_HISTORY.md](./ERROR_HISTORY.md) for common errors
2. Review [TROUBLESHOOTING_GUIDE.md](./docs/troubleshooting_guide.md)
3. Check terminal logs for specific error messages
4. Ensure all prerequisites are properly installed

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Backend shows "AI Fitness Coach Backend started on port 8000"
- ✅ Frontend loads without red error screens
- ✅ You can login with demo credentials
- ✅ AI chat responds to messages
- ✅ Exercises load in the Discover tab
- ✅ No errors in console logs

Happy coding! 💪