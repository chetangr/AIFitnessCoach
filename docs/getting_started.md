# AI Fitness Coach - Getting Started Guide

## Overview

This comprehensive guide will take you from zero to a fully functional AI Fitness Coach application. Designed specifically for data engineers with no mobile development experience, it provides step-by-step instructions with detailed explanations of each concept.

## Prerequisites

### Required Knowledge
- Basic programming experience (any language)
- Understanding of APIs and databases
- Familiarity with command line/terminal
- Git version control basics

### System Requirements
- **Operating System**: macOS 10.15+, Windows 10+, or Ubuntu 18.04+
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 50GB free space
- **Internet**: Stable broadband connection

## Phase 1: Environment Setup (Days 1-2)

### Day 1: Core Development Tools

#### 1.1 Install Flutter SDK

**macOS:**
```bash
# Download Flutter
cd ~/development
git clone https://github.com/flutter/flutter.git -b stable

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="$PATH:$HOME/development/flutter/bin"

# Reload terminal
source ~/.zshrc

# Verify installation
flutter doctor
```

**Windows:**
```bash
# Download Flutter ZIP from flutter.dev
# Extract to C:\flutter

# Add to PATH via System Environment Variables
# Add C:\flutter\bin to PATH

# Open new Command Prompt
flutter doctor
```

**Ubuntu:**
```bash
# Install dependencies
sudo apt update
sudo apt install curl git unzip xz-utils zip libglu1-mesa

# Download and install Flutter
cd ~/development
git clone https://github.com/flutter/flutter.git -b stable

# Add to PATH
echo 'export PATH="$PATH:$HOME/development/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

flutter doctor
```

#### 1.2 Install IDE and Extensions

**VS Code Setup:**
```bash
# Download VS Code from code.visualstudio.com

# Install essential extensions
code --install-extension Dart-Code.flutter
code --install-extension Dart-Code.dart-code
code --install-extension ms-vscode.vscode-json
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
```

**Android Studio Setup:**
```bash
# Download Android Studio from developer.android.com
# Install with default settings

# Install Flutter and Dart plugins:
# File > Settings > Plugins > Flutter (this will also install Dart)
```

#### 1.3 Set Up Mobile Development Environment

**Android Setup:**
```bash
# Open Android Studio
# Go to SDK Manager (Tools > SDK Manager)
# Install Android SDK Platform 33 (API Level 33)
# Install Android SDK Command-line Tools
# Install Android SDK Build-Tools

# Accept licenses
flutter doctor --android-licenses

# Set up environment variables (add to ~/.zshrc)
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
# Windows: Usually C:\Users\%USERNAME%\AppData\Local\Android\Sdk

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**iOS Setup (macOS only):**
```bash
# Install Xcode from App Store (this takes a while!)
# Launch Xcode and accept license agreements

# Install Xcode command line tools
sudo xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Verify setup
flutter doctor
```

#### 1.4 Create Test Project

```bash
# Create a test Flutter project
flutter create test_app
cd test_app

# Run on available device/simulator
flutter run

# If successful, you should see a counter app
```

### Day 2: Backend Development Environment

#### 2.1 Install Node.js and npm

**All Platforms:**
```bash
# Install Node.js from nodejs.org (LTS version)
# Verify installation
node --version  # Should be v18+
npm --version   # Should be v9+

# Install global packages
npm install -g nodemon
npm install -g @angular/cli  # Optional, for future use
```

#### 2.2 Install Database Systems

**PostgreSQL:**
```bash
# macOS (using Homebrew)
brew install postgresql@15
brew services start postgresql@15
createdb fitness_app

# Ubuntu
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb fitness_app

# Windows (download installer from postgresql.org)
# Use pgAdmin to create database
```

**MongoDB:**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org
sudo systemctl start mongod

# Windows (download installer from mongodb.com)
```

**Redis:**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis-server

# Windows (use WSL or Docker)
docker run -d -p 6379:6379 redis:alpine
```

#### 2.3 Install Docker (Optional but Recommended)

```bash
# Download Docker Desktop from docker.com
# Install with default settings

# Verify installation
docker --version
docker-compose --version

# Test with hello world
docker run hello-world
```

#### 2.4 Set Up Git and GitHub

```bash
# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add SSH key to GitHub account
cat ~/.ssh/id_ed25519.pub
# Copy output and add to GitHub > Settings > SSH Keys
```

## Phase 2: Backend Development (Days 3-4)

### Day 3: Project Setup and Basic API

#### 3.1 Create Backend Project Structure

```bash
# Create project directory
mkdir ai-fitness-coach
cd ai-fitness-coach

# Initialize Git repository
git init
echo "node_modules/\n.env\n*.log" > .gitignore

# Create backend structure
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors helmet morgan dotenv
npm install bcryptjs jsonwebtoken
npm install pg sequelize redis
npm install openai @anthropic-ai/sdk

# Install development dependencies
npm install --save-dev nodemon jest supertest
npm install --save-dev eslint prettier
```

#### 3.2 Set Up Basic Express Server

Create `backend/src/app.js`:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Basic routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/ai', require('./routes/ai'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

#### 3.3 Create Package Scripts

Update `backend/package.json`:
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "db:migrate": "sequelize-cli db:migrate",
    "db:seed": "sequelize-cli db:seed:all"
  }
}
```

#### 3.4 Set Up Environment Variables

Create `backend/.env`:
```bash
# Application
NODE_ENV=development
PORT=3000
APP_NAME=AI Fitness Coach

# Database
DATABASE_URL=postgresql://localhost:5432/fitness_app
MONGODB_URI=mongodb://localhost:27017/fitness_app
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d

# AI Services (you'll get these later)
OPENAI_API_KEY=your-openai-api-key
CLAUDE_API_KEY=your-claude-api-key

# External Services
SENTRY_DSN=your-sentry-dsn
```

### Day 4: Database Setup and Authentication

#### 4.1 Set Up Sequelize ORM

```bash
# Install Sequelize CLI globally
npm install -g sequelize-cli

# Initialize Sequelize
sequelize init

# This creates:
# - config/config.json (database configuration)
# - models/ (database models)
# - migrations/ (database migrations)
# - seeders/ (test data)
```

Update `backend/config/config.json`:
```json
{
  "development": {
    "username": "postgres",
    "password": null,
    "database": "fitness_app",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "postgres", 
    "password": null,
    "database": "fitness_app_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
```

#### 4.2 Create Database Models

```bash
# Generate User model
sequelize model:generate --name User --attributes email:string,googleId:string,displayName:string,fitnessLevel:string

# Generate WorkoutPlan model  
sequelize model:generate --name WorkoutPlan --attributes userId:uuid,name:string,description:text,exercises:jsonb,isActive:boolean

# Generate Exercise model
sequelize model:generate --name Exercise --attributes name:string,description:text,muscleGroups:array,equipment:array,difficulty:string
```

#### 4.3 Set Up Authentication Routes

Create `backend/src/routes/auth.js`:
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { googleToken, userInfo } = req.body;
    
    // In production, verify googleToken with Google
    // For now, we'll trust the client
    
    let user = await User.findOne({ where: { googleId: userInfo.id } });
    
    if (!user) {
      user = await User.create({
        email: userInfo.email,
        googleId: userInfo.id,
        displayName: userInfo.name,
        profileImageUrl: userInfo.picture,
        fitnessLevel: 'beginner'
      });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    
    res.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        fitnessLevel: user.fitnessLevel
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Refresh token endpoint
router.post('/refresh', (req, res) => {
  // Implementation for token refresh
  res.json({ message: 'Token refresh not implemented yet' });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // Client-side logout (remove token)
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
```

#### 4.4 Test Your Backend

```bash
# Start the development server
npm run dev

# Test health endpoint
curl http://localhost:3000/health

# You should see:
# {"status":"healthy","timestamp":"...","version":"1.0.0"}
```

## Phase 3: AI Integration (Days 5-7)

### Day 5: Set Up AI Service Accounts

#### 5.1 OpenAI API Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and verify email
3. Go to API Keys section
4. Create new API key
5. Add to your `.env` file:
   ```bash
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

#### 5.2 Claude API Setup

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create account and request API access
3. Once approved, create API key
4. Add to `.env`:
   ```bash
   CLAUDE_API_KEY=sk-ant-your-actual-api-key-here
   ```

#### 5.3 Create AI Service

Create `backend/src/services/aiService.js`:
```javascript
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.claude = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  async generateCoachingResponse(message, personality = 'supportive', userContext = {}) {
    const systemPrompt = this.getPersonalityPrompt(personality, userContext);
    
    try {
      // Try OpenAI first
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return {
        response: completion.choices[0].message.content,
        provider: 'openai',
        usage: completion.usage
      };
    } catch (error) {
      console.warn('OpenAI failed, trying Claude:', error.message);
      
      try {
        // Fallback to Claude
        const message = await this.claude.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          messages: [{ role: 'user', content: `${systemPrompt}\n\nUser: ${message}` }]
        });

        return {
          response: message.content[0].text,
          provider: 'claude',
          usage: message.usage
        };
      } catch (claudeError) {
        console.error('Both AI providers failed:', claudeError.message);
        throw new Error('AI services unavailable');
      }
    }
  }

  getPersonalityPrompt(personality, userContext) {
    const prompts = {
      supportive: `You are a supportive and encouraging fitness coach. Be positive, understanding, and focus on progress over perfection.`,
      
      aggressive: `You are an intense, results-driven fitness coach. Be direct, challenging, and push for maximum effort.`,
      
      steady: `You are a methodical fitness coach who emphasizes consistency and gradual progress.`
    };

    const basePrompt = prompts[personality] || prompts.supportive;
    
    return `${basePrompt}

User Context:
- Fitness Level: ${userContext.fitnessLevel || 'unknown'}
- Goals: ${userContext.goals?.join(', ') || 'general fitness'}
- Limitations: ${userContext.limitations?.join(', ') || 'none specified'}

Guidelines:
- Provide specific, actionable advice
- Always prioritize safety
- Ask clarifying questions when needed
- Keep responses conversational and encouraging`;
  }
}

module.exports = new AIService();
```

### Day 6: Create AI Routes and Testing

#### 6.1 Create AI Routes

Create `backend/src/routes/ai.js`:
```javascript
const express = require('express');
const aiService = require('../services/aiService');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Chat with AI coach
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, personality = 'supportive' } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user context (in a real app, this would come from database)
    const userContext = {
      fitnessLevel: req.user.fitnessLevel || 'beginner',
      goals: req.user.goals || ['general fitness'],
      limitations: req.user.limitations || []
    };

    const response = await aiService.generateCoachingResponse(
      message, 
      personality, 
      userContext
    );

    res.json({
      response: response.response,
      provider: response.provider,
      conversationId: req.user.id, // Simplified for demo
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      fallback: 'I apologize, but I am unable to respond right now. Please try again later.'
    });
  }
});

// Get available personalities
router.get('/personalities', (req, res) => {
  res.json({
    personalities: [
      {
        id: 'supportive',
        name: 'Supportive Coach',
        description: 'Encouraging and understanding, focuses on progress'
      },
      {
        id: 'aggressive', 
        name: 'Aggressive Coach',
        description: 'Intense and challenging, pushes for maximum results'
      },
      {
        id: 'steady',
        name: 'Steady Pace Coach', 
        description: 'Methodical and consistent, emphasizes gradual progress'
      }
    ]
  });
});

module.exports = router;
```

#### 6.2 Create Auth Middleware

Create `backend/src/middleware/auth.js`:
```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

#### 6.3 Test AI Integration

```bash
# Start your server
npm run dev

# Test AI chat (you'll need a valid JWT token)
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "I want to start working out", "personality": "supportive"}'
```

### Day 7: Exercise Database Integration

#### 7.1 Integrate wger Exercise API

Create `backend/src/services/exerciseService.js`:
```javascript
const axios = require('axios');
const { Exercise } = require('../models');

class ExerciseService {
  constructor() {
    this.wgerBaseUrl = 'https://wger.de/api/v2';
  }

  async syncExercises() {
    try {
      console.log('Syncing exercises from wger API...');
      
      let page = 1;
      let hasMore = true;
      let totalSynced = 0;

      while (hasMore) {
        const response = await axios.get(`${this.wgerBaseUrl}/exercise/`, {
          params: {
            language: 2, // English
            page: page,
            limit: 50
          }
        });

        const exercises = response.data.results;
        
        for (const exercise of exercises) {
          await this.saveExercise(exercise);
          totalSynced++;
        }

        hasMore = response.data.next !== null;
        page++;
        
        // Rate limiting - be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Synced ${totalSynced} exercises successfully`);
      return totalSynced;
    } catch (error) {
      console.error('Exercise sync error:', error);
      throw error;
    }
  }

  async saveExercise(wgerExercise) {
    try {
      const exerciseData = {
        name: wgerExercise.name,
        description: wgerExercise.description || '',
        muscleGroups: await this.getMuscleGroups(wgerExercise.muscles),
        equipment: await this.getEquipment(wgerExercise.equipment),
        difficulty: this.mapDifficulty(wgerExercise.category),
        instructions: [wgerExercise.description],
        externalId: wgerExercise.id,
        source: 'wger'
      };

      const [exercise, created] = await Exercise.findOrCreate({
        where: { externalId: wgerExercise.id, source: 'wger' },
        defaults: exerciseData
      });

      if (!created && exercise) {
        await exercise.update(exerciseData);
      }

      return exercise;
    } catch (error) {
      console.error('Error saving exercise:', error);
    }
  }

  async getMuscleGroups(muscleIds) {
    // Map wger muscle IDs to readable names
    const muscleMap = {
      1: 'biceps',
      2: 'anterior deltoid',
      3: 'serratus anterior',
      4: 'chest',
      5: 'triceps',
      6: 'back',
      7: 'lats',
      8: 'abs',
      9: 'calves',
      10: 'glutes',
      11: 'hamstrings',
      12: 'quadriceps',
      13: 'soleus'
    };

    return muscleIds.map(id => muscleMap[id] || 'unknown').filter(name => name !== 'unknown');
  }

  async searchExercises(query, filters = {}) {
    const whereClause = {};
    
    if (query) {
      whereClause.name = { [Op.iLike]: `%${query}%` };
    }

    if (filters.muscleGroups) {
      whereClause.muscleGroups = { [Op.overlap]: filters.muscleGroups };
    }

    if (filters.equipment) {
      whereClause.equipment = { [Op.overlap]: filters.equipment };
    }

    if (filters.difficulty) {
      whereClause.difficulty = filters.difficulty;
    }

    return await Exercise.findAll({
      where: whereClause,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      order: [['name', 'ASC']]
    });
  }
}

module.exports = new ExerciseService();
```

## Phase 4: Mobile Development (Weeks 2-3)

### Week 2: Flutter App Foundation

#### Day 8-9: Create Flutter Project Structure

```bash
# Create the Flutter project
flutter create ai_fitness_coach --org com.aicoach
cd ai_fitness_coach

# Add dependencies to pubspec.yaml
flutter pub add http
flutter pub add shared_preferences
flutter pub add google_sign_in
flutter pub add flutter_riverpod
flutter pub add go_router
flutter pub add json_annotation
flutter pub add cached_network_image

# Add dev dependencies
flutter pub add --dev flutter_test
flutter pub add --dev json_serializable
flutter pub add --dev build_runner
```

Update `pubspec.yaml`:
```yaml
name: ai_fitness_coach
description: AI-powered fitness coaching app

dependencies:
  flutter:
    sdk: flutter
  
  # State management
  flutter_riverpod: ^2.4.9
  
  # Navigation
  go_router: ^12.1.3
  
  # Networking
  http: ^1.1.2
  
  # Authentication
  google_sign_in: ^6.1.6
  
  # Storage
  shared_preferences: ^2.2.2
  
  # JSON serialization
  json_annotation: ^4.8.1
  
  # UI
  cached_network_image: ^3.3.0
  
  # Utils
  uuid: ^4.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  json_serializable: ^6.7.1
  build_runner: ^2.4.7

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
```

#### Day 10-11: Create App Structure and Models

Create the following directory structure:
```
lib/
├── main.dart
├── app.dart
├── models/
│   ├── user.dart
│   ├── workout_plan.dart
│   ├── exercise.dart
│   └── ai_response.dart
├── providers/
│   ├── auth_provider.dart
│   ├── workout_provider.dart
│   └── ai_provider.dart
├── services/
│   ├── api_service.dart
│   ├── auth_service.dart
│   └── storage_service.dart
├── screens/
│   ├── splash_screen.dart
│   ├── auth/
│   │   └── login_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── workout/
│   │   ├── workout_list_screen.dart
│   │   └── workout_detail_screen.dart
│   └── ai/
│       └── ai_chat_screen.dart
├── widgets/
│   ├── common/
│   │   ├── loading_widget.dart
│   │   └── error_widget.dart
│   └── workout/
│       └── exercise_card.dart
└── utils/
    ├── constants.dart
    ├── theme.dart
    └── routes.dart
```

Create `lib/models/user.dart`:
```dart
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final String id;
  final String email;
  final String displayName;
  final String? profileImageUrl;
  final String fitnessLevel;
  final List<String> goals;
  final List<String> limitations;

  const User({
    required this.id,
    required this.email,
    required this.displayName,
    this.profileImageUrl,
    required this.fitnessLevel,
    this.goals = const [],
    this.limitations = const [],
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  User copyWith({
    String? id,
    String? email,
    String? displayName,
    String? profileImageUrl,
    String? fitnessLevel,
    List<String>? goals,
    List<String>? limitations,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      fitnessLevel: fitnessLevel ?? this.fitnessLevel,
      goals: goals ?? this.goals,
      limitations: limitations ?? this.limitations,
    );
  }
}
```

Generate model files:
```bash
flutter packages pub run build_runner build
```

#### Day 12-14: Authentication and Navigation

Create `lib/services/auth_service.dart`:
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../utils/constants.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  Future<User?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final GoogleSignInAuthentication googleAuth = 
          await googleUser.authentication;

      // Send to backend for verification
      final response = await http.post(
        Uri.parse('${Constants.apiBaseUrl}/auth/google'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'googleToken': googleAuth.idToken,
          'userInfo': {
            'id': googleUser.id,
            'email': googleUser.email,
            'name': googleUser.displayName,
            'picture': googleUser.photoUrl,
          },
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final user = User.fromJson(data['user']);
        
        await _saveAuthData(data['accessToken'], user);
        return user;
      } else {
        throw Exception('Authentication failed');
      }
    } catch (error) {
      print('Sign in error: $error');
      return null;
    }
  }

  Future<void> _saveAuthData(String token, User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, json.encode(user.toJson()));
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      return User.fromJson(json.decode(userJson));
    }
    return null;
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }
}
```

Create `lib/main.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';

void main() {
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}
```

## Summary and Next Steps

At this point, you should have:

1. ✅ Complete development environment setup
2. ✅ Working backend API with authentication
3. ✅ AI integration with OpenAI/Claude
4. ✅ Flutter project foundation
5. ✅ Basic authentication flow

### Week 3-4 Roadmap:
- Complete Flutter UI implementation
- Add workout management features
- Implement AI chat interface
- Add offline capabilities
- Testing and debugging
- App store preparation

### Key Learning Resources:
- [Flutter Documentation](https://docs.flutter.dev/)
- [Riverpod Documentation](https://riverpod.dev/)
- [Node.js Guide](https://nodejs.org/en/learn/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

### Common Beginner Mistakes to Avoid:
1. Not handling async operations properly
2. Forgetting to dispose of controllers
3. Not implementing proper error handling
4. Ignoring performance implications
5. Not testing on multiple devices

Continue with the implementation following the detailed guides in the other documentation files. Remember to commit your code frequently and test each feature as you build it.