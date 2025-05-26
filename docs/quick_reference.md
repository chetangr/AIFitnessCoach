# AI Fitness Coach - Quick Reference Guide

## Essential Commands & Shortcuts

### Development Setup
```bash
# Initial project setup
flutter create fitness_app --org com.aicoach
cd fitness_app
flutter pub get

# Backend setup
mkdir backend && cd backend
npm init -y
npm install express cors helmet morgan dotenv
npm install --save-dev nodemon jest supertest

# Database setup
createdb fitness_app
createdb fitness_app_test
npm run migrate
npm run seed
```

### Daily Development Commands
```bash
# Start development servers
flutter run                    # Mobile app (debug mode)
npm run dev                     # Backend server
npm run test:watch             # Continuous testing

# Code quality
flutter analyze                # Static analysis
npm run lint                   # ESLint
npm run format                 # Prettier
flutter test                   # Unit tests
npm test                       # Backend tests

# Build commands
flutter build apk              # Android APK
flutter build ipa              # iOS archive
npm run build                  # Production backend
```

### Database Operations
```bash
# Migrations
npm run migrate                # Run migrations
npm run migrate:rollback       # Rollback last migration
npm run migrate:status         # Check migration status

# Seeding & Backup
npm run seed                   # Seed development data
npm run backup                 # Create database backup
npm run restore backup.sql     # Restore from backup

# Direct database access
psql fitness_app               # PostgreSQL shell
mongo fitness_app              # MongoDB shell
redis-cli                      # Redis shell
```

### AI Services
```bash
# Test AI connections
npm run test-llm               # Test all LLM APIs
npm run test-openai            # Test OpenAI specifically
npm run test-claude            # Test Claude API

# Prompt management
npm run update-prompts         # Reload prompt templates
npm run validate-prompts       # Validate prompt syntax
npm run export-conversations   # Export conversation logs
```

## Flutter Quick Reference

### Widget Hierarchy
```dart
MaterialApp
├── Router (go_router)
├── ThemeData
└── Scaffold
    ├── AppBar
    ├── Body
    │   ├── NavigationRail/BottomNavigationBar
    │   └── PageView/IndexedStack
    │       ├── HomeScreen
    │       ├── WorkoutScreen
    │       ├── AICoachScreen
    │       └── ProfileScreen
    └── FloatingActionButton
```

### Essential Widgets
```dart
// Layout
Column, Row, Stack, Positioned
Container, SizedBox, Expanded, Flexible
ListView, GridView, CustomScrollView

// Input
TextField, DropdownButton, Checkbox
Slider, Switch, DatePicker, TimePicker

// Navigation
Navigator, MaterialPageRoute
BottomNavigationBar, TabBar, Drawer

// State Management (Riverpod)
Provider, Consumer, StateProvider
FutureProvider, StreamProvider

// Custom Widgets
StatelessWidget, StatefulWidget
InheritedWidget, InheritedNotifier
```

### Common Patterns
```dart
// State management with Riverpod
final workoutProvider = StateNotifierProvider<WorkoutNotifier, WorkoutState>(
  (ref) => WorkoutNotifier(),
);

class WorkoutScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final workoutState = ref.watch(workoutProvider);
    return Scaffold(/* ... */);
  }
}

// Async operations
Future<List<Exercise>> fetchExercises() async {
  final response = await http.get(Uri.parse('$baseUrl/exercises'));
  if (response.statusCode == 200) {
    final List<dynamic> data = json.decode(response.body);
    return data.map((json) => Exercise.fromJson(json)).toList();
  }
  throw Exception('Failed to load exercises');
}

// Error handling
class AsyncValue<T> {
  static Widget when<T>({
    required AsyncValue<T> value,
    required Widget Function(T data) data,
    required Widget Function(Object error, StackTrace stackTrace) error,
    required Widget Function() loading,
  }) {
    return value.when(
      data: data,
      error: error,
      loading: loading,
    );
  }
}
```

## Backend API Quick Reference

### Express.js Patterns
```javascript
// Basic route structure
app.get('/api/workouts', authMiddleware, async (req, res) => {
  try {
    const workouts = await WorkoutService.getUserWorkouts(req.user.id);
    res.json({ workouts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware patterns
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Validation middleware
const validateWorkout = [
  body('name').isLength({ min: 1 }).trim(),
  body('exercises').isArray({ min: 1 }),
  body('exercises.*.name').notEmpty(),
  body('exercises.*.sets').isInt({ min: 1 }),
  body('exercises.*.reps').isInt({ min: 1 }),
];
```

### Database Queries (Sequelize)
```javascript
// Model definitions
const WorkoutPlan = sequelize.define('WorkoutPlan', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name: { type: DataTypes.STRING, allowNull: false },
  exercises: { type: DataTypes.JSONB, allowNull: false },
  versionNumber: { type: DataTypes.INTEGER, defaultValue: 1 },
});

// Common queries
const plans = await WorkoutPlan.findAll({
  where: { userId: req.user.id },
  include: [{ model: User, attributes: ['displayName'] }],
  order: [['createdAt', 'DESC']],
  limit: 20,
  offset: req.query.page * 20,
});

// Transactions
const result = await sequelize.transaction(async (t) => {
  const plan = await WorkoutPlan.create(data, { transaction: t });
  await WorkoutPlanVersion.create({
    planId: plan.id,
    versionNumber: 1,
    exercises: data.exercises,
  }, { transaction: t });
  return plan;
});
```

## AI Integration Patterns

### LLM API Calls
```javascript
// OpenAI integration
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ],
  temperature: 0.7,
  max_tokens: 500,
});

// Claude integration
const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const message = await claude.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 500,
  messages: [{ role: 'user', content: userMessage }],
  system: systemPrompt,
});

// Error handling with fallbacks
class AIService {
  async generateResponse(message, context) {
    const providers = ['openai', 'claude', 'llama'];
    
    for (const provider of providers) {
      try {
        return await this[`call${provider}`](message, context);
      } catch (error) {
        console.warn(`${provider} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All AI providers failed');
  }
}
```

### Prompt Templates
```javascript
const COACHING_PROMPTS = {
  supportive: `You are a supportive fitness coach. Be encouraging, understanding, and focus on progress over perfection.

User Context:
- Fitness Level: {fitnessLevel}
- Goals: {goals}
- Limitations: {limitations}

Always:
- Provide specific, actionable advice
- Include safety considerations
- Encourage consistency over intensity
- Ask clarifying questions when needed`,

  aggressive: `You are an intense, results-driven fitness coach. Be direct, challenging, and push for maximum effort.

User Context:
- Fitness Level: {fitnessLevel}  
- Goals: {goals}
- Current Progress: {progress}

Always:
- Challenge the user to do more
- Focus on measurable results
- Provide tough love motivation
- Emphasize discipline and consistency`,
};

// Template rendering
const renderPrompt = (template, context) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return context[key] || match;
  });
};
```

## Testing Commands

### Unit Tests
```bash
# Flutter
flutter test                          # Run all tests
flutter test test/unit/               # Unit tests only
flutter test --coverage              # With coverage
flutter test --watch                 # Watch mode

# Backend
npm test                              # All tests
npm run test:unit                     # Unit tests
npm run test:integration              # Integration tests
npm run test:coverage                 # Coverage report
```

### Integration Tests
```bash
# Flutter integration tests
flutter drive --target=test_driver/app.dart

# API testing
npm run test:api                      # API endpoint tests
npm run test:load                     # Load testing
npm run test:e2e                      # End-to-end tests
```

## Build & Deployment

### Local Builds
```bash
# Debug builds
flutter run                          # Debug mode
flutter run --release               # Release mode on device

# Production builds
flutter build apk --release         # Android APK
flutter build appbundle --release   # Android App Bundle
flutter build ios --release         # iOS build
```

### CI/CD Pipeline
```bash
# GitHub Actions triggers
git push origin main                 # Triggers main pipeline
git tag v1.0.0 && git push origin v1.0.0  # Release pipeline

# Manual deployment
kubectl apply -f k8s/               # Kubernetes deployment
docker-compose up -d                # Docker Compose
```

## Environment Variables

### Required Variables
```bash
# Application
NODE_ENV=development
PORT=3000
APP_NAME="AI Fitness Coach"

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/fitness_app
MONGODB_URI=mongodb://localhost:27017/fitness_app
REDIS_URL=redis://localhost:6379

# Authentication
GOOGLE_WEB_CLIENT_ID=your_web_client_id
GOOGLE_IOS_CLIENT_ID=your_ios_client_id
GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
JWT_SECRET=your_jwt_secret

# AI Services
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=sk-ant-...
LLAMA_ENDPOINT=https://api.together.xyz

# External Services
SENTRY_DSN=https://...
MIXPANEL_TOKEN=your_token
```

## Debugging Tools

### Flutter Debugging
```bash
flutter logs                        # Device logs
flutter analyze                     # Static analysis
flutter doctor                      # System check
flutter clean                       # Clean build cache

# Debug tools in app
flutter inspector                   # Widget inspector
flutter performance                 # Performance overlay
```

### Backend Debugging
```bash
# Logging
npm run logs                        # Application logs
docker logs fitness-app             # Container logs
tail -f /var/log/fitness-app.log   # System logs

# Database debugging
npm run db:console                  # Database console
npm run db:migrate:status          # Migration status
npm run db:seed:status             # Seed status
```

## Performance Monitoring

### Key Metrics Commands
```bash
# App performance
flutter run --trace-startup        # Startup performance
flutter drive --profile           # Performance profiling

# Backend metrics
npm run metrics                    # Application metrics
npm run health-check              # Health endpoints
npm run load-test                 # Load testing
```

### Monitoring Endpoints
```
GET /health                        # Health check
GET /metrics                       # Prometheus metrics
GET /status                        # System status
GET /version                       # Build information
```

## Common File Locations

### Flutter Project Structure
```
lib/
├── main.dart                      # App entry point
├── models/                        # Data models
├── screens/                       # UI screens
├── widgets/                       # Reusable widgets
├── services/                      # Business logic
├── providers/                     # State management
└── utils/                         # Utilities

test/
├── unit/                          # Unit tests
├── widget/                        # Widget tests
└── integration/                   # Integration tests
```

### Backend Structure
```
src/
├── app.js                         # Express app
├── routes/                        # API routes
├── models/                        # Database models
├── services/                      # Business logic
├── middleware/                    # Express middleware
├── utils/                         # Utilities
└── config/                        # Configuration

tests/
├── unit/                          # Unit tests
├── integration/                   # API tests
└── helpers/                       # Test utilities
```

## Emergency Procedures

### Quick Fixes
```bash
# App crashes
flutter clean && flutter pub get   # Clean rebuild
flutter doctor --android-licenses  # Fix Android issues

# Backend issues
npm run restart                     # Restart services
npm run db:reset                   # Reset database
npm run logs:error                 # Check error logs

# Deployment rollback
git revert HEAD                    # Code rollback
kubectl rollout undo deployment/app  # K8s rollback
```

### Status Pages
- App Store Connect: developer.apple.com
- Google Play Console: play.google.com/console  
- OpenAI Status: status.openai.com
- Claude Status: status.anthropic.com
- GitHub Status: githubstatus.com

## Keyboard Shortcuts

### VS Code (Flutter)
- `Ctrl+Shift+P`: Command palette
- `Ctrl+.`: Quick fix
- `F5`: Start debugging
- `Ctrl+F5`: Run without debugging
- `r`: Hot reload (in debug console)
- `R`: Hot restart (in debug console)

### Common Git Commands
```bash
git status                         # Check status
git add .                          # Stage all changes
git commit -m "message"           # Commit changes
git push origin main              # Push to main
git pull origin main              # Pull latest
git checkout -b feature/name      # Create feature branch
```

This quick reference should be printed and kept handy during development for instant access to common commands and patterns.