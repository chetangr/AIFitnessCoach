# AI Fitness Coach - Getting Started Guide

## Welcome, Data Engineer! 🚀

This comprehensive guide will take you from zero mobile development experience to launching your AI Fitness Coach app. We'll cover everything step-by-step, with clear explanations of new concepts and practical examples.

## Prerequisites Checklist

Before starting, ensure you have:

- **Computer**: Mac (recommended for iOS development) or PC with 16GB+ RAM
- **Storage**: At least 50GB free space
- **Internet**: Stable connection for downloading tools and packages
- **Accounts**:
  - Google account (for authentication and Play Store)
  - Apple ID (for iOS development - $99/year developer account needed for publishing)
  - GitHub account (for version control)

## Day 1-2: Environment Setup

### Step 1: Install Core Development Tools

#### 1.1 Install Git
```bash
# macOS
brew install git

# Windows
# Download from https://git-scm.com/download/win

# Linux
sudo apt-get install git

# Verify installation
git --version
```

#### 1.2 Install Node.js and npm
```bash
# Download from https://nodejs.org/ (LTS version)
# Or use Node Version Manager (recommended)

# macOS/Linux - Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

#### 1.3 Install Flutter

**Important**: Flutter is the framework we'll use to build both iOS and Android apps with one codebase.

```bash
# macOS
# 1. Download Flutter SDK
cd ~/development
git clone https://github.com/flutter/flutter.git

# 2. Add Flutter to PATH
echo 'export PATH="$PATH:~/development/flutter/bin"' >> ~/.zshrc
source ~/.zshrc

# 3. Run Flutter doctor
flutter doctor

# 4. Accept licenses
flutter doctor --android-licenses
```

```bash
# Windows
# 1. Download Flutter SDK from https://flutter.dev/docs/get-started/install/windows
# 2. Extract to C:\src\flutter
# 3. Add C:\src\flutter\bin to PATH
# 4. Run in PowerShell:
flutter doctor
```

#### 1.4 Install Platform-Specific Tools

**For iOS Development (macOS only):**
```bash
# Install Xcode from Mac App Store (this takes time - ~10GB)
# After installation:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch

# Install CocoaPods
sudo gem install cocoapods
```

**For Android Development (All platforms):**
```bash
# Install Android Studio from https://developer.android.com/studio
# During setup, ensure you install:
# - Android SDK
# - Android SDK Platform-Tools
# - Android SDK Build-Tools
# - Android Emulator

# Set up environment variables
# macOS/Linux:
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools/bin' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

#### 1.5 Install VS Code and Extensions

```bash
# Download VS Code from https://code.visualstudio.com/

# Install essential extensions via command line:
code --install-extension dart-code.dart-code
code --install-extension dart-code.flutter
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension eamodio.gitlens
code --install-extension formulahendry.auto-rename-tag
```

### Step 2: Verify Everything Works

```bash
# Run Flutter doctor to check your setup
flutter doctor -v

# You should see checkmarks for:
# ✓ Flutter
# ✓ Android toolchain
# ✓ Xcode (macOS only)
# ✓ VS Code
```

Common issues and fixes:
```bash
# If Android licenses not accepted:
flutter doctor --android-licenses

# If Xcode not found (macOS):
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# If CocoaPods not working (macOS):
sudo gem uninstall cocoapods
brew install cocoapods
```

## Day 3-4: Backend Setup

### Step 3: Initialize Backend Project

```bash
# Create project structure
mkdir ai-fitness-coach
cd ai-fitness-coach
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors helmet compression dotenv
npm install jsonwebtoken bcrypt
npm install sequelize pg pg-hstore
npm install redis bull
npm install winston morgan
npm install joi celebrate

# Install dev dependencies
npm install -D nodemon jest supertest
npm install -D @types/node @types/express typescript
npm install -D eslint prettier eslint-config-prettier
```

### Step 4: Set Up Database

#### 4.1 Install PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

#### 4.2 Create Database
```bash
# Access PostgreSQL
psql -U postgres

# In psql console:
CREATE DATABASE fitness_app_dev;
CREATE DATABASE fitness_app_test;
CREATE USER fitness_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fitness_app_dev TO fitness_user;
GRANT ALL PRIVILEGES ON DATABASE fitness_app_test TO fitness_user;
\q
```

#### 4.3 Install Redis (for caching)
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl start redis

# Test Redis
redis-cli ping
# Should return: PONG
```

### Step 5: Create Basic Backend Structure

Create the following file structure:
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── redis.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── workoutController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── index.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── workouts.js
│   ├── services/
│   │   └── aiCoaching.js
│   └── app.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

Create `backend/server.js`:
```javascript
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
});
```

Create `backend/src/app.js`:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workouts', require('./routes/workouts'));

// Error handling
app.use(require('./middleware/errorHandler'));

module.exports = app;
```

## Day 5-7: Mobile App Setup

### Step 6: Create Flutter Project

```bash
# Go back to main project directory
cd ~/ai-fitness-coach

# Create Flutter app
flutter create fitness_app \
  --org com.yourcompany \
  --project-name fitness_app \
  --platforms=ios,android

cd fitness_app

# Open in VS Code
code .
```

### Step 7: Configure Flutter Project

Update `pubspec.yaml`:
```yaml
name: fitness_app
description: AI-powered fitness coaching app
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # UI Components
  cupertino_icons: ^1.0.6
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # State Management
  provider: ^6.1.1
  flutter_riverpod: ^2.4.9
  
  # Navigation
  go_router: ^12.1.3
  
  # Authentication
  google_sign_in: ^6.1.6
  firebase_auth: ^4.15.0
  firebase_core: ^2.24.0
  
  # Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  
  # Networking
  dio: ^5.4.0
  pretty_dio_logger: ^1.3.1
  
  # Database
  sqflite: ^2.3.0
  path: ^1.8.3
  
  # Utilities
  intl: ^0.18.1
  uuid: ^4.2.1
  equatable: ^2.0.5
  json_annotation: ^4.8.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  build_runner: ^2.4.6
  json_serializable: ^6.7.1
  mockito: ^5.4.3
```

Run:
```bash
flutter pub get
```

### Step 8: Set Up Basic App Structure

Create the following structure:
```
lib/
├── main.dart
├── config/
│   ├── theme.dart
│   └── constants.dart
├── models/
│   ├── user.dart
│   └── workout.dart
├── providers/
│   ├── auth_provider.dart
│   └── workout_provider.dart
├── screens/
│   ├── auth/
│   │   └── login_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   └── workout/
│       └── workout_screen.dart
├── services/
│   ├── api_service.dart
│   └── storage_service.dart
├── utils/
│   └── validators.dart
└── widgets/
    └── common/
        └── loading_indicator.dart
```

## Day 8-10: AI Integration

### Step 9: Set Up AI Services

#### 9.1 Get API Keys

1. **Claude API (Anthropic)**
   - Go to https://console.anthropic.com/
   - Create account and get API key
   - Note: May require waitlist approval

2. **OpenAI (Alternative)**
   - Go to https://platform.openai.com/
   - Create account and get API key
   - Add payment method

3. **Llama (Free Alternative)**
   - Use Together AI: https://api.together.xyz/
   - Sign up for free tier
   - Get API key

#### 9.2 Create AI Service

Create `backend/src/services/aiCoaching.js`:
```javascript
const axios = require('axios');

class AICoachingService {
  constructor() {
    this.claudeApiKey = process.env.CLAUDE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.togetherApiKey = process.env.TOGETHER_API_KEY;
  }

  async generateCoachingResponse(message, personality, userContext) {
    try {
      // Try Claude first
      if (this.claudeApiKey) {
        return await this.callClaude(message, personality, userContext);
      }
      
      // Fallback to OpenAI
      if (this.openaiApiKey) {
        return await this.callOpenAI(message, personality, userContext);
      }
      
      // Final fallback to Llama via Together
      if (this.togetherApiKey) {
        return await this.callLlama(message, personality, userContext);
      }
      
      // If no API keys, use rule-based system
      return this.generateRuleBasedResponse(message, personality);
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.generateRuleBasedResponse(message, personality);
    }
  }

  async callClaude(message, personality, userContext) {
    const systemPrompt = this.buildSystemPrompt(personality, userContext);
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-sonnet-20240229',
        messages: [
          { role: 'user', content: message }
        ],
        system: systemPrompt,
        max_tokens: 1000
      },
      {
        headers: {
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return this.parseAIResponse(response.data.content[0].text);
  }

  buildSystemPrompt(personality, userContext) {
    const personalityPrompts = {
      aggressive: `You are an intense, motivating fitness coach who pushes users to their limits. 
                   You use strong, energetic language and don't accept excuses. 
                   You're like a drill sergeant but caring about user safety.`,
      
      supportive: `You are a warm, encouraging fitness coach who celebrates every small victory. 
                   You use positive reinforcement and understanding language. 
                   You're like a supportive friend who believes in the user.`,
      
      steady: `You are a balanced, methodical fitness coach who focuses on sustainable progress. 
              You emphasize consistency and proper form over intensity. 
              You're like a wise mentor guiding long-term success.`
    };

    return `
      ${personalityPrompts[personality] || personalityPrompts.supportive}
      
      User Context:
      - Fitness Level: ${userContext.fitnessLevel}
      - Goals: ${userContext.goals.join(', ')}
      - Available Equipment: ${userContext.equipment.join(', ')}
      - Injuries/Limitations: ${userContext.limitations || 'None'}
      
      When responding:
      1. Always prioritize user safety
      2. Provide specific, actionable advice
      3. If modifying workouts, return structured JSON data
      4. Be encouraging but realistic
      5. Consider the user's fitness level and limitations
    `;
  }
}

module.exports = AICoachingService;
```

## Day 11-14: Integration & Testing

### Step 10: Connect Frontend to Backend

Create `lib/services/api_service.dart`:
```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: 'http://localhost:3000/api',
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 3),
    ));
    
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token to requests
          final token = await _storage.read(key: 'auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Token expired, try to refresh
            await _refreshToken();
            // Retry the request
            handler.resolve(await _retry(error.requestOptions));
          } else {
            handler.next(error);
          }
        },
      ),
    );
  }
  
  Future<Response> _retry(RequestOptions requestOptions) async {
    final options = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
    );
    return _dio.request(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }
}
```

### Step 11: Create Your First Working Feature

Let's create a simple workout list feature:

1. **Create Workout Model** (`lib/models/workout.dart`):
```dart
class Workout {
  final String id;
  final String name;
  final String description;
  final List<Exercise> exercises;
  final String difficulty;
  final int durationMinutes;
  
  Workout({
    required this.id,
    required this.name,
    required this.description,
    required this.exercises,
    required this.difficulty,
    required this.durationMinutes,
  });
  
  factory Workout.fromJson(Map<String, dynamic> json) {
    return Workout(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      exercises: (json['exercises'] as List)
          .map((e) => Exercise.fromJson(e))
          .toList(),
      difficulty: json['difficulty'],
      durationMinutes: json['duration_minutes'],
    );
  }
}

class Exercise {
  final String id;
  final String name;
  final int sets;
  final int reps;
  final int restSeconds;
  
  Exercise({
    required this.id,
    required this.name,
    required this.sets,
    required this.reps,
    required this.restSeconds,
  });
  
  factory Exercise.fromJson(Map<String, dynamic> json) {
    return Exercise(
      id: json['id'],
      name: json['name'],
      sets: json['sets'],
      reps: json['reps'],
      restSeconds: json['rest_seconds'],
    );
  }
}
```

2. **Create Workout Provider** (`lib/providers/workout_provider.dart`):
```dart
import 'package:flutter/material.dart';
import '../models/workout.dart';
import '../services/api_service.dart';

class WorkoutProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Workout> _workouts = [];
  bool _isLoading = false;
  String? _error;
  
  List<Workout> get workouts => _workouts;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  Future<void> fetchWorkouts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.get('/workouts');
      _workouts = (response.data as List)
          .map((w) => Workout.fromJson(w))
          .toList();
    } catch (e) {
      _error = 'Failed to load workouts: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

3. **Create Workout List Screen** (`lib/screens/workout/workout_list_screen.dart`):
```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/workout_provider.dart';

class WorkoutListScreen extends StatefulWidget {
  @override
  _WorkoutListScreenState createState() => _WorkoutListScreenState();
}

class _WorkoutListScreenState extends State<WorkoutListScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch workouts when screen loads
    Future.microtask(() =>
      context.read<WorkoutProvider>().fetchWorkouts()
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('My Workouts'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () {
              // Navigate to create workout screen
            },
          ),
        ],
      ),
      body: Consumer<WorkoutProvider>(
        builder: (context, workoutProvider, child) {
          if (workoutProvider.isLoading) {
            return Center(child: CircularProgressIndicator());
          }
          
          if (workoutProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Error loading workouts',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  SizedBox(height: 8),
                  Text(workoutProvider.error!),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => workoutProvider.fetchWorkouts(),
                    child: Text('Retry'),
                  ),
                ],
              ),
            );
          }
          
          if (workoutProvider.workouts.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.fitness_center, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(
                    'No workouts yet',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  SizedBox(height: 8),
                  Text('Create your first workout to get started!'),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      // Navigate to create workout
                    },
                    child: Text('Create Workout'),
                  ),
                ],
              ),
            );
          }
          
          return ListView.builder(
            padding: EdgeInsets.all(16),
            itemCount: workoutProvider.workouts.length,
            itemBuilder: (context, index) {
              final workout = workoutProvider.workouts[index];
              return Card(
                margin: EdgeInsets.only(bottom: 16),
                child: ListTile(
                  leading: CircleAvatar(
                    child: Icon(Icons.fitness_center),
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  title: Text(workout.name),
                  subtitle: Text(
                    '${workout.exercises.length} exercises • '
                    '${workout.durationMinutes} mins • '
                    '${workout.difficulty}',
                  ),
                  trailing: Icon(Icons.arrow_forward_ios),
                  onTap: () {
                    // Navigate to workout detail
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}
```

### Step 12: Run and Test

1. **Start the backend:**
```bash
cd backend
npm run dev
```

2. **Start the Flutter app:**
```bash
# In a new terminal
cd fitness_app

# For iOS Simulator
open -a Simulator
flutter run

# For Android Emulator
flutter emulators --launch <emulator_id>
flutter run

# For physical device
flutter run -d <device_id>
```

## Common Beginner Mistakes to Avoid

### 1. State Management Confusion
```dart
// ❌ Wrong: Directly modifying state
class BadExample extends StatefulWidget {
  List<String> items = []; // This won't trigger rebuilds
}

// ✅ Correct: Using setState
class GoodExample extends StatefulWidget {
  @override
  _GoodExampleState createState() => _GoodExampleState();
}

class _GoodExampleState extends State<GoodExample> {
  List<String> items = [];
  
  void addItem(String item) {
    setState(() {
      items.add(item); // This triggers a rebuild
    });
  }
}
```

### 2. Async/Await Confusion
```dart
// ❌ Wrong: Not waiting for async operations
void loadData() {
  apiService.fetchData(); // This runs but doesn't wait
  print(data); // data is not available yet!
}

// ✅ Correct: Properly handling async operations
Future<void> loadData() async {
  try {
    final data = await apiService.fetchData();
    print(data); // data is available here
  } catch (e) {
    print('Error: $e');
  }
}
```

### 3. Not Handling Errors
```dart
// ❌ Wrong: No error handling
Future<void> fetchWorkouts() async {
  final response = await http.get(url);
  workouts = json.decode(response.body);
}

// ✅ Correct: Comprehensive error handling
Future<void> fetchWorkouts() async {
  try {
    final response = await http.get(url);
    if (response.statusCode == 200) {
      workouts = json.decode(response.body);
    } else {
      throw Exception('Failed to load workouts: ${response.statusCode}');
    }
  } on SocketException {
    throw Exception('No internet connection');
  } on HttpException {
    throw Exception('Server error');
  } catch (e) {
    throw Exception('Unexpected error: $e');
  }
}
```

## Next Steps

### Week 3: Advanced Features
- Implement AI coaching chat interface
- Add workout tracking and progress visualization
- Integrate exercise video tutorials
- Implement offline mode

### Week 4: Polish and Deploy
- Add animations and transitions
- Implement push notifications
- Set up CI/CD pipeline
- Submit to app stores

## Helpful Resources

### Documentation
- Flutter: https://docs.flutter.dev/
- Node.js: https://nodejs.org/docs/
- PostgreSQL: https://www.postgresql.org/docs/
- Express.js: https://expressjs.com/

### Learning Platforms
- Flutter Codelabs: https://docs.flutter.dev/codelabs
- Node.js Tutorial: https://nodejs.dev/learn
- SQL Tutorial: https://www.w3schools.com/sql/

### Community Support
- Flutter Discord: https://discord.gg/flutter
- Stack Overflow: https://stackoverflow.com/questions/tagged/flutter
- Reddit: r/FlutterDev, r/node

## Tips for Success

1. **Start Small**: Build one feature at a time, test it thoroughly
2. **Use Version Control**: Commit your code frequently with clear messages
3. **Read Error Messages**: They usually tell you exactly what's wrong
4. **Test on Real Devices**: Simulators don't catch all issues
5. **Ask for Help**: The Flutter and Node.js communities are very helpful
6. **Keep Learning**: Mobile development evolves quickly, stay updated

Remember, every expert was once a beginner. Take it one step at a time, and you'll have your AI Fitness Coach app running in no time! 🎉