# AI Fitness Coach - Detailed Setup Guide

This guide provides step-by-step instructions for setting up the AI Fitness Coach application from scratch.

## 📋 System Requirements

### Minimum Requirements
- **macOS**: 10.15+ (for iOS development)
- **Windows**: Windows 10+ (for Android development)
- **Linux**: Ubuntu 20.04+ (for Android development)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space

### Software Requirements
- **Node.js**: 18.0.0 or higher
- **Python**: 3.9 or higher
- **PostgreSQL**: 14.0 or higher
- **Git**: 2.0 or higher
- **Xcode**: 14.0+ (macOS only, for iOS)
- **Android Studio**: 2022.1+ (for Android)
- **Visual Studio Code** (recommended IDE)

## 🔧 Development Environment Setup

### 1. Install Node.js

**macOS (using Homebrew):**
```bash
brew install node
```

**Windows/Linux:**
Download and install from [nodejs.org](https://nodejs.org/)

**Verify installation:**
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 8.0.0 or higher
```

### 2. Install Python

**macOS (using Homebrew):**
```bash
brew install python@3.9
```

**Windows:**
Download from [python.org](https://www.python.org/downloads/)

**Linux:**
```bash
sudo apt update
sudo apt install python3.9 python3.9-venv python3-pip
```

**Verify installation:**
```bash
python3 --version  # Should show Python 3.9.x or higher
```

### 3. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)

**Linux:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Create database user:**
```bash
sudo -u postgres psql
postgres=# CREATE USER aicoach WITH PASSWORD 'your_password';
postgres=# ALTER USER aicoach CREATEDB;
postgres=# \q
```

### 4. Install React Native Dependencies

**Install React Native CLI:**
```bash
npm install -g react-native-cli
```

**macOS - iOS Development:**
1. Install Xcode from Mac App Store
2. Install Xcode Command Line Tools:
```bash
xcode-select --install
```
3. Install CocoaPods:
```bash
sudo gem install cocoapods
```

**Android Development (All Platforms):**
1. Download and install [Android Studio](https://developer.android.com/studio)
2. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)
3. Configure environment variables:

**macOS/Linux (~/.zshrc or ~/.bashrc):**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows (System Environment Variables):**
- ANDROID_HOME: C:\Users\[username]\AppData\Local\Android\Sdk
- Add to PATH: %ANDROID_HOME%\platform-tools

## 🚀 Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-fitness-coach.git
cd ai-fitness-coach
```

### 2. Backend Setup

**Navigate to backend directory:**
```bash
cd backend
```

**Create and activate virtual environment:**

macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

**Install Python dependencies:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Set up environment variables:**
```bash
cp .env.example .env
```

**Edit .env file with your configuration:**
```env
ENV=development
PORT=8000
DATABASE_URL=postgresql://aicoach:your_password@localhost:5432/ai_fitness_coach
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-chars
OPENAI_API_KEY=sk-your-openai-api-key
```

**Create database:**
```bash
createdb -U aicoach ai_fitness_coach
```

**Initialize database schema:**
```bash
# Create initial migration
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

**Seed database with sample data (optional):**
```bash
python scripts/seed_database.py
```

**Start the backend server:**
```bash
python app.py
```

The backend should now be running at http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Alternative API Docs: http://localhost:8000/redoc

### 3. Frontend Setup (React Native)

**Open a new terminal and navigate to React Native directory:**
```bash
cd ../AIFitnessCoach
```

**Install dependencies:**
```bash
npm install
# or
yarn install
```

**iOS specific setup (macOS only):**
```bash
cd ios
pod install
cd ..
```

**Create environment configuration:**
```bash
echo "API_URL=http://localhost:8000/api" > .env
```

For physical devices, use your computer's IP address:
```bash
# Find your IP address
# macOS/Linux: ifconfig | grep inet
# Windows: ipconfig

echo "API_URL=http://YOUR_IP_ADDRESS:8000/api" > .env
```

### 4. Running the Application

**Start Metro bundler:**
```bash
npm start
# or
yarn start
```

**Run on iOS Simulator (macOS only):**
```bash
npm run ios
# or
yarn ios
```

**Run on Android Emulator:**
```bash
# Start Android emulator first from Android Studio
npm run android
# or
yarn android
```

**Run on Physical Device:**

iOS:
1. Connect iPhone via USB
2. Open `ios/AIFitnessCoach.xcworkspace` in Xcode
3. Select your device from the device list
4. Click Run button

Android:
1. Enable Developer Mode and USB Debugging on your device
2. Connect via USB
3. Run `adb devices` to verify connection
4. Run `npm run android`

## 🛠️ Common Setup Issues

### Backend Issues

**1. PostgreSQL connection error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Solution:
- Ensure PostgreSQL is running: `brew services start postgresql@14` (macOS)
- Check credentials in .env file
- Verify database exists: `psql -U aicoach -d ai_fitness_coach`

**2. Python dependency conflicts:**
```
ERROR: Could not find a version that satisfies the requirement
```
Solution:
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

**3. Port already in use:**
```
Error: Address already in use
```
Solution:
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Frontend Issues

**1. Metro bundler issues:**
```
Error: Unable to resolve module
```
Solution:
```bash
npx react-native start --reset-cache
rm -rf node_modules
npm install
```

**2. iOS build failures:**
```
error: The sandbox is not in sync with the Podfile.lock
```
Solution:
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**3. Android build failures:**
```
Could not determine the dependencies of task ':app:compileDebugJavaWithJavac'
```
Solution:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**4. React Native version mismatch:**
```
Error: React Native version mismatch
```
Solution:
```bash
# Check versions
npm list react-native

# Update if needed
npm update react-native
```

## 🔍 Verification Steps

### 1. Backend Verification
```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","service":"AI Fitness Coach Backend","version":"1.0.0"}
```

### 2. Database Verification
```bash
psql -U aicoach -d ai_fitness_coach -c "\dt"

# Should list all tables
```

### 3. Frontend Verification
- App should launch without errors
- You should see the splash screen followed by login screen
- Try demo login: demo@fitness.com / demo123

## 📱 Development Tools

### Recommended VS Code Extensions
- Python (ms-python.python)
- Pylance (ms-python.vscode-pylance)
- React Native Tools (msjsdiag.vscode-react-native)
- TypeScript React code snippets (infeng.vscode-react-typescript)
- Prettier - Code formatter (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)

### Debugging Setup

**React Native Debugger:**
```bash
brew install --cask react-native-debugger  # macOS
```

**Flipper (recommended):**
Download from [fbflipper.com](https://fbflipper.com/)

**Python Debugging:**
Add to VS Code launch.json:
```json
{
  "name": "Python: FastAPI",
  "type": "python",
  "request": "launch",
  "module": "uvicorn",
  "args": ["app:app", "--reload"],
  "jinja": true
}
```

## 🚦 Next Steps

1. **Run tests:**
```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd AIFitnessCoach && npm test
```

2. **Set up pre-commit hooks:**
```bash
cd backend
pre-commit install
```

3. **Configure your IDE** for optimal development experience

4. **Review the architecture** in MIGRATION_GUIDE.md

5. **Start developing!** Check the README.md for feature implementation details

## 📞 Getting Help

If you encounter issues not covered in this guide:
1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Search existing GitHub issues
3. Create a new issue with detailed error information
4. Join our Discord community (link in README)

Happy coding! 🎉