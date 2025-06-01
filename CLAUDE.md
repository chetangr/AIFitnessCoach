# AI Fitness Coach - Project Documentation

## Important Technical Notes

### Data Storage Implementation
- **Current**: Using SharedPreferences for all local storage (MVP approach)
- **Location**: See platform-specific paths in `ai_fitness_coach/docs/data_storage_migration_guide.md`
- **Migration Plan**: Will migrate to SQLite when app scales beyond 1000 messages or 100 coach swaps
- **TODO**: Monitor storage performance metrics listed in migration guide

### Recent Updates (June 2025)
- **✅ Fixed Workout Tracking UI**: Improved text input fields with better sizing and borders for sets/reps
- **✅ Fixed AI Chat Input**: Enhanced input field visibility with dark background and better contrast
- **✅ Redesigned Timeline**: Now shows all 7 days with activities in a single scrollable view
- **✅ Added Fasting Tab**: Complete intermittent fasting feature with 12:12, 16:8, 18:6, 20:4 plans
- **✅ Fasting Timer**: Real-time countdown timer with progress tracking and history
- **✅ Custom Fasting**: Support for custom fasting durations up to 1 week
- **✅ Enhanced UI Colors**: More vibrant gradients, colored shadows, and animated FABs
- **✅ Tab Bar Update**: Now includes 6 tabs with Fasting feature integrated

### Recent Updates (Latest Session - December 2024)
- **✅ Complete Workout Tracking System**: Full set/rep/weight tracking with RPE ratings
- **✅ Stats Dashboard**: Comprehensive progress metrics with mobile-optimized layout
- **✅ Export Functionality**: Hevy CSV and JSON export capabilities with one-tap sharing
- **✅ Bottom Navigation Enhancement**: Added dedicated Stats tab for easy access
- **✅ Coach Selection System**: 3 AI coach personalities (Sergeant Steel, Coach Maya, Dr. Pace)
- **✅ Timeline Week View**: Full 7-day calendar layout with proper workout indicators
- **✅ Workout Download Feature**: Offline workout access through integrated download system
- **✅ AI Coach Interface Fix**: Resolved blank screen with proper animation initialization
- **✅ Program Service Fix**: Corrected import paths for workout programs database
- **✅ Mobile UI Optimization**: Proper scaling, text truncation, and responsive design

### Previous Updates
- **✅ Complete IMPROVEMENTS.md Implementation**: Fixed all 27 issues including authentication, onboarding, UI improvements
- **✅ Login/Registration System**: Username/password authentication with secure password hashing
- **✅ Demo User System**: Built-in demo credentials (demo@fitness.com / demo123) with pre-filled onboarding data
- **✅ Enhanced Login UI**: Clear input field labels, demo credentials display, improved visual styling
- **✅ Exercise Library**: Pagination for 10,000+ exercises, custom exercise creation, category filters
- **✅ AI Coach Enhancements**: Schedule awareness, daily check-ins, progress motivation with personality system
- **✅ Workout Display**: Improved exercise cards, proper difficulty indicators, equipment requirements
- **✅ Onboarding Flow**: Complete 6-step process matching WhatsApp design with all user preferences
- **✅ AI Coach JSON Fix**: Enhanced JSON filtering and system prompts to prevent raw JSON from appearing in chat
- **✅ Smart Workout Scheduling**: AI Coach now schedules workouts based on user intent (today/tomorrow/next week)
- **✅ Clean Progress Bar**: Created clean progress bar component to replace any striped patterns
- **✅ Compilation Fix**: Removed duplicate parseWorkoutSuggestion method in AICoachService
- **✅ Coach Intro LLM Integration**: Fixed coach intro screen to use actual LLM responses instead of hardcoded messages

### Demo Credentials
- **Username**: demo@fitness.com
- **Password**: demo123
- **Note**: This demo user has completed onboarding with intermediate fitness level, multiple goals, and supportive coach preference
- **Production Migration**: Replace with proper authentication service (Supabase, Firebase Auth, etc.) before production deployment

### Previous Updates
- Coach selection now persists across app sessions
- Added coach swap functionality with reason tracking
- Profile page now shows real user data instead of mock data
- All chat messages are persisted locally

### Implementation Details (June 2025)

#### 1. Fasting Feature Implementation
**Files Created:**
- `src/screens/FastingScreen.tsx` - Complete intermittent fasting tracker with timer

**Key Features:**
- Pre-configured fasting plans: 12:12, 16:8, 18:6, 20:4
- Custom fasting duration support (1-168 hours)
- Real-time countdown timer with progress animation
- Fasting history tracking with completion status
- Current streak calculation
- Persistent storage using AsyncStorage

#### 2. Timeline Redesign
**Files Modified:**
- `src/screens/TimelineScreen.tsx` - Changed from single day view to full week view

**Key Changes:**
- All 7 days now visible at once with their activities
- Each day shows workouts directly without clicking
- Rest days and active recovery clearly marked
- Compact design with better information density

#### 3. UI Enhancements
**Files Modified:**
- Multiple screens updated with vibrant gradients
- Tab bar enhanced with colored shadows
- FABs now have pulse animations

**Color Updates:**
- Background gradients: `['#667eea', '#764ba2', '#f093fb']`
- FAB colors: Orange/Red and Teal gradients
- Tab bar: Enhanced with purple shadow and border

### Implementation Details (Latest Session - December 2024)

#### 1. Complete Workout Tracking System
**Files Created:**
- `src/screens/WorkoutTrackingScreen.tsx` - Full workout tracking with sets/reps/weight
- `src/screens/StatsScreen.tsx` - Comprehensive stats dashboard with export functionality

**Key Features:**
- Real-time set tracking with RPE (Rate of Perceived Exertion) ratings
- Previous best tracking for progressive overload
- Automatic workout session recording with AsyncStorage persistence
- Mobile-optimized UI with proper text truncation and responsive design

#### 2. Export and Data Management System
**Files Modified:**
- `src/screens/StatsScreen.tsx` - Export to Hevy CSV and JSON formats
- Integration with expo-sharing and expo-file-system for seamless data export

**Key Features:**
- **Hevy CSV Export**: Perfect compatibility with Hevy fitness app
- **JSON Export**: Complete workout data backup with metadata
- One-tap sharing functionality for easy data transfer
- Automatic file generation with proper timestamps

#### 3. Enhanced Navigation System
**Files Modified:**
- `src/navigation/AppNavigator.tsx` - Added Stats tab and WorkoutTracking screen
- `src/screens/TimelineScreen.tsx` - Added workout tracking FAB and improved 7-day layout

**Key Features:**
- Dedicated Stats tab in bottom navigation for easy access
- Quick workout tracking access via Timeline FAB (barbell icon)
- Improved 7-day week grid layout matching reference design
- Proper mobile scaling with responsive day buttons

#### 4. AI Coach System Enhancements
**Files Modified:**
- `src/screens/SimpleMessagesScreen.tsx` - Fixed blank screen with proper animation initialization
- `src/services/exerciseService.ts` - Corrected import paths for workout programs

**Key Features:**
- Resolved animation initialization causing blank AI Coach screen
- Fixed Program Service Error by correcting database import paths
- Maintained existing coach selection system with 3 personalities
- Demo mode fallback for API-less operation

#### 5. Previous Implementation Details

##### Dynamic AI Coaching System
**Files Modified:**
- `lib/services/dynamic_coaching_service.dart` - Complete rewrite with natural, conversational scripts
- `lib/services/text_to_speech_service.dart` - Integration with dynamic coaching

**Key Features:**
- 150+ unique coaching scripts across 3 personality types (Aggressive, Supportive, Steady Pace)
- Natural language patterns with contractions ("you're", "don't", "I'm")
- Personal connection phrases ("I can see", "I'm proud", "You're doing beautifully")
- Exercise-specific guidance for Push-ups, Squats, Planks, and more
- Contextual encouragement based on set progression

#### 2. Drag & Drop Workout Scheduling
**Files Created/Modified:**
- `lib/services/workout_scheduling_service.dart` - New service for managing scheduled workouts
- `lib/presentation/widgets/draggable_workout_card.dart` - Draggable workout cards with visual feedback
- `lib/models/workout.dart` - Added copyWith method to WorkoutPlan
- `lib/providers/workout_provider.dart` - Added moveWorkout method

**Key Features:**
- LongPressDraggable workout cards with haptic feedback
- Visual drop zones with hover states
- "MOVED" indicators for rescheduled workouts
- Original date tracking for cross-day completion
- Full persistence using SharedPreferences

#### 3. Theme System Implementation
**Files Modified:**
- `lib/providers/theme_provider.dart` - Fixed JSON storage, proper defaults (darkMode = false)
- `lib/presentation/screens/workouts/workouts_screen_v2.dart` - Theme-aware colors and gradients
- `lib/presentation/widgets/draggable_workout_card.dart` - Dynamic color adaptation
- `lib/main.dart` - Proper theme switching integration

**Key Features:**
- Light mode default with proper toggle functionality
- Background gradients adapt to theme (dark vs light blue gradients)
- All text colors dynamically change based on theme
- Settings properly persist theme choice

#### 4. UI/UX Enhancements
**Files Modified:**
- `lib/presentation/screens/main/main_screen.dart` - FAB positioning fix (centerFloat)
- Multiple screens updated for glassmorphism consistency
- Color theming across all components

**Key Features:**
- FloatingActionButton now floats above bottom navigation
- Consistent glassmorphism effects
- Theme-aware text and icon colors
- Improved visual hierarchy

#### 5. Technical Debt Resolution
**Issues Fixed:**
- Compilation errors in drag-drop implementation
- Missing method signatures for theme parameters
- Proper provider integration for scheduling service
- Type safety improvements across components

---

# AI Fitness App Mega Prompt - Complete Documentation Generator

You are an expert AI assistant specializing in mobile app development, fitness technology, and AI/LLM integration. Your task is to generate comprehensive documentation for building a superior AI fitness app that addresses the limitations of existing apps like Zing. 

## Project Context & Background

### Core Problem Statement
Current AI fitness apps like Zing have critical limitations:
- AI coaches fail to properly add/modify workouts when requested
- No undo/revert functionality for workout plan changes
- Poor contextual exercise suggestions (e.g., when asking for specific exercises like kegels)
- Unnatural, robotic user interactions
- Limited personality options for AI coaches

### Target Developer Profile
- Data engineer with no mobile app development experience
- Seeking cross-platform solution (iOS + Android)
- No budget constraints (provide both free and paid alternatives)
- Looking for comprehensive technical guidance

## Technical Solution Overview

### Core Innovations to Implement
1. **Advanced AI Coaching System**: Context-aware LLM integration with conversation memory and workout modification capabilities
2. **Workout Plan Versioning**: Git-like version control system allowing complete undo/revert functionality
3. **Hybrid Recommendation Engine**: Vector similarity + user history + contextual filtering for intelligent exercise suggestions
4. **Personality-Driven AI Coaches**: Multiple coach personalities (aggressive, steady pace, supportive) with distinct communication styles
5. **Natural Conversation Flow**: Advanced prompt engineering with proper conversation state management

### Technical Architecture
**Mobile Framework**: Flutter (primary recommendation) or React Native
**Backend Architecture**: Microservices with Node.js/Express
**Database Stack**: PostgreSQL + MongoDB + Redis + Vector Database (Pinecone/Milvus)
**AI/LLM Integration**: Claude 3.5 Sonnet + Llama 3.3 70B (hybrid approach)
**Authentication**: Google OAuth 2.0 with PKCE
**Real-time Communication**: WebSockets + REST APIs + GraphQL

### Technology Stack Options

#### Free Solutions
- **Development**: Flutter/React Native, VS Code, Android Studio/Xcode
- **Infrastructure**: Railway/Render (500 hours/month), Supabase (500MB PostgreSQL)
- **AI/LLM**: Llama models via Together AI, Hugging Face inference
- **Analytics**: Firebase Analytics, Mixpanel (100K events/month)
- **Exercise Data**: wger API (690+ exercises, open source)

#### Paid Solutions
- **Infrastructure**: AWS/GCP ($60-200/month), Vercel/Netlify ($20-40/month)
- **AI Services**: OpenAI GPT-4o ($150-300/month), Claude 3.5 ($60-120/month)
- **Analytics**: Amplitude ($299+/month), Auth0 ($23+/month)
- **CI/CD**: Bitrise ($35+/month)

## Documentation Files to Generate

For each file below, create comprehensive, production-ready documentation with specific code examples, implementation details, and actionable guidance:

### 1. Requirements.md
Generate detailed functional and non-functional requirements including:
- **Functional Requirements**: User authentication (Google OAuth), AI coaching with personality system, workout creation/modification/tracking, exercise recommendation engine, progress visualization, social features, offline mode
- **Non-Functional Requirements**: Performance (60fps animations, <2s load times), scalability (100K+ users), security (SOC2 compliance), cross-platform compatibility
- **AI Coaching Requirements**: Natural language processing, context awareness, workout modification capabilities, personality adaptation, safety protocols
- **Workout Management**: Plan versioning, undo/redo functionality, exercise substitution, progress tracking
- **User Experience**: Intuitive onboarding, accessibility compliance, offline functionality, real-time sync

### 2. limitations.md
Document comprehensive limitations and constraints:
- **LLM API Limitations**: Rate limits, cost constraints, response time variability, context window limitations
- **Mobile Platform Constraints**: iOS/Android differences, device capability variations, battery optimization requirements
- **Offline Functionality**: Limited AI features, sync conflicts, data storage constraints
- **Regulatory Constraints**: Health data privacy (HIPAA considerations), international compliance, app store restrictions
- **Technical Debt**: Known shortcuts, performance bottlenecks, scalability concerns

### 3. implementation_status.md
Create detailed implementation tracking with specific milestones:
```
## Core Features Implementation Status

### Authentication System
- [ ] Google OAuth integration
- [ ] JWT token management
- [ ] User profile creation
- [ ] Secure token storage
Status: Not Started | Target: Week 2

### AI Coaching System
- [ ] LLM API integration
- [ ] Conversation context management
- [ ] Personality system implementation
- [ ] Workout modification logic
Status: Not Started | Target: Week 4

### Workout Management
- [ ] Exercise database integration
- [ ] Workout plan CRUD operations
- [ ] Versioning system implementation
- [ ] Undo/redo functionality
Status: Not Started | Target: Week 3
```

### 4. test_examples.md
Comprehensive testing framework including:
- **Unit Tests**: Workout algorithm validation, AI response parsing, database operations
- **Integration Tests**: API endpoint testing, LLM integration, authentication flows
- **UI/UX Tests**: Cross-platform compatibility, accessibility, performance
- **Load Tests**: Concurrent user handling, database performance, API response times
- **AI Testing**: Coaching quality validation, safety protocol verification, personality consistency

### 5. troubleshooting_guide.md
Common issues and detailed solutions:
- **Authentication Issues**: OAuth failures, token expiration, cross-platform login
- **AI Service Errors**: API timeouts, rate limiting, response parsing failures
- **Sync Conflicts**: Offline/online data merging, version conflicts, data corruption
- **Performance Issues**: Memory leaks, slow loading, battery drain
- **Deployment Problems**: Build failures, app store rejections, environment issues

### 6. quick_reference.md
Essential commands and shortcuts:
```bash
# Development Setup
flutter create fitness_app
flutter pub get
flutter run

# Backend Services
npm run dev
npm run test
npm run deploy

# Database Operations
npm run migrate
npm run seed
npm run backup

# AI Services
npm run test-llm
npm run update-prompts
```

### 7. getting_started.md
Step-by-step setup guide for data engineers:
1. **Environment Setup** (Day 1-2): Flutter/React Native installation, IDE configuration
2. **Backend Setup** (Day 3-4): Node.js environment, database configuration, API setup
3. **AI Integration** (Day 5-7): LLM API setup, prompt engineering, testing
4. **Mobile Development** (Week 2-3): UI implementation, navigation setup, device integration
5. **Testing & Deployment** (Week 4): Comprehensive testing, app store preparation

### 8. features_and_roadmap.md
Detailed feature planning:
**MVP Features (Month 1-2)**:
- Google authentication
- Basic workout tracking
- Simple AI coaching
- Exercise library integration

**Phase 2 Features (Month 3-4)**:
- Advanced AI personalities
- Social features
- Progress analytics
- Offline synchronization

**Long-term Vision (Month 6+)**:
- Wearable device integration
- Advanced analytics
- Community features
- Enterprise solutions

### 9. architecture_deep_dive.md
Comprehensive technical architecture:
```javascript
// Microservices Architecture
const services = {
  userService: {
    responsibilities: ['Authentication', 'Profile Management', 'Preferences'],
    database: 'PostgreSQL',
    scaling: 'Horizontal'
  },
  workoutService: {
    responsibilities: ['Exercise Library', 'Workout Plans', 'Progress Tracking'],
    database: 'PostgreSQL + MongoDB',
    scaling: 'Horizontal'
  },
  aiCoachingService: {
    responsibilities: ['LLM Integration', 'Conversation Management', 'Personalization'],
    database: 'Redis + Vector DB',
    scaling: 'Vertical'
  }
};
```

### 10. feature_validation.md
Comprehensive validation framework:
- **Acceptance Criteria**: Specific, measurable requirements for each feature
- **User Testing Protocols**: Beta testing procedures, feedback collection, iteration cycles
- **Performance Benchmarks**: Response times, accuracy metrics, user satisfaction scores
- **Success Metrics**: Retention rates, engagement metrics, business KPIs

### 11. Mega_prompt.md
Master AI coaching prompt system:
```
# AI Fitness Coach System Prompt

You are an AI fitness coach with the following capabilities:

## Core Personality Types:
1. **Aggressive Coach**: High-energy, challenging, results-focused
2. **Steady Pace Coach**: Consistent, methodical, progress-oriented
3. **Supportive Coach**: Encouraging, understanding, motivation-focused

## Conversation Context Management:
- User fitness level: {fitness_level}
- Current workout plan: {current_plan}
- Progress history: {progress_summary}
- Goals: {user_goals}
- Limitations: {injuries_equipment}

## Workout Modification Protocol:
When user requests workout changes:
1. Understand the specific request
2. Validate against user capabilities
3. Generate modified workout plan
4. Explain changes clearly
5. Update workout_plan_version table

## Safety Protocols:
- Never recommend exercises beyond user capability
- Always provide proper form instructions
- Recognize signs of overexertion
- Suggest medical consultation when appropriate

## Response Format:
{
  "coaching_message": "Natural, personality-appropriate response",
  "workout_modifications": {
    "changes": ["specific changes made"],
    "reasoning": "explanation of changes"
  },
  "safety_notes": ["any safety considerations"]
}
```

### 12. .env
Complete environment variables template:
```bash
# Application Configuration
NODE_ENV=development
PORT=3000
APP_NAME=AI Fitness Coach

# Authentication
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# AI/LLM Services
OPENAI_API_KEY=your_openai_api_key
CLAUDE_API_KEY=your_claude_api_key
LLAMA_ENDPOINT=your_llama_endpoint
LLAMA_API_KEY=your_llama_api_key

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/fitness_app
MONGODB_URI=mongodb://localhost:27017/fitness_app
REDIS_URL=redis://localhost:6379
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment

# External Services
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
MIXPANEL_TOKEN=your_mixpanel_token
SENTRY_DSN=your_sentry_dsn

# Email & Notifications
SENDGRID_API_KEY=your_sendgrid_api_key
PUSH_NOTIFICATION_KEY=your_push_notification_key

# File Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket_name

# Development Tools
LOG_LEVEL=debug
API_RATE_LIMIT=100
ENABLE_CORS=true
```

### 13. Success_criteria.md
Measurable success metrics:
- **User Retention**: 30-day retention >10%, 90-day retention >5%
- **Engagement**: Average session duration >15 minutes, weekly active users >60%
- **AI Quality**: User satisfaction >4.5/5, successful workout modifications >85%
- **Performance**: App launch time <3s, API response time <500ms
- **Business**: User acquisition cost <$20, monthly churn rate <10%

### 14. setup.md
Detailed development environment setup:
```bash
# Install Flutter
git clone https://github.com/flutter/flutter.git
export PATH="$PATH:`pwd`/flutter/bin"
flutter doctor

# Install dependencies
flutter pub get
cd backend && npm install

# Database setup
createdb fitness_app
npm run migrate
npm run seed

# Start development servers
flutter run
npm run dev
```

### 15. API.md
Complete REST API documentation:
```javascript
// Authentication Endpoints
POST /auth/google - Google OAuth login
POST /auth/refresh - Refresh JWT token
DELETE /auth/logout - User logout

// User Management
GET /users/profile - Get user profile
PUT /users/profile - Update user profile
GET /users/preferences - Get user preferences

// Workout Management
GET /workouts/plans - Get user workout plans
POST /workouts/plans - Create new workout plan
PUT /workouts/plans/:id - Update workout plan
GET /workouts/plans/:id/versions - Get plan version history
POST /workouts/plans/:id/revert - Revert to previous version

// AI Coaching
POST /ai/chat - Send message to AI coach
GET /ai/personality/:type - Get personality configuration
POST /ai/modify-workout - Request workout modification

// Exercise Library
GET /exercises - Get exercise library
GET /exercises/search - Search exercises
GET /exercises/:id - Get exercise details
```

### 16. Scalability_Analysis.md
Comprehensive scaling strategy:
- **Database Sharding**: User-based partitioning, read replicas, connection pooling
- **Caching Strategy**: Multi-level caching (Redis, CDN, application-level)
- **Load Balancing**: Application load balancer, database load balancing
- **Microservices Scaling**: Independent service scaling, container orchestration
- **AI Service Optimization**: Model caching, request batching, response streaming

### 17. database_schema.md
Complete database design with relationships:
```sql
-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    profile_image_url TEXT,
    fitness_level VARCHAR(50),
    goals JSONB,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Workout Plans with Versioning
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(50),
    duration_minutes INTEGER,
    exercises JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workout_plan_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    changes_description TEXT,
    changeset JSONB,
    exercises JSONB NOT NULL,
    created_by VARCHAR(50), -- 'user' or 'ai'
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Coaching Sessions
CREATE TABLE coaching_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    personality_type VARCHAR(50) NOT NULL,
    conversation_context JSONB,
    session_start TIMESTAMP DEFAULT NOW(),
    session_end TIMESTAMP,
    message_count INTEGER DEFAULT 0
);

CREATE TABLE coaching_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES coaching_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Exercise Library
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    muscle_groups TEXT[],
    equipment_required TEXT[],
    difficulty_level VARCHAR(50),
    instructions JSONB,
    video_url TEXT,
    image_url TEXT,
    safety_notes TEXT[],
    variations JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Workout Sessions and Progress
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES workout_plans(id),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_minutes INTEGER,
    exercises_completed JSONB,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- User Progress Tracking
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'weight', 'body_fat', 'measurements'
    value DECIMAL(10,2),
    unit VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX idx_workout_plan_versions_plan_id ON workout_plan_versions(plan_id);
CREATE INDEX idx_coaching_sessions_user_id ON coaching_sessions(user_id);
CREATE INDEX idx_coaching_messages_session_id ON coaching_messages(session_id);
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);
```

### 18. configuration_reference.md
All configuration options with examples:
- **App Configuration**: Theme settings, feature flags, API endpoints
- **AI Personality Settings**: Tone, language style, coaching approach
- **Exercise Database Config**: Filtering options, recommendation weights
- **Notification Settings**: Push notification types, timing, frequency
- **Performance Settings**: Cache timeouts, API retry logic, offline sync intervals

### 19. integration_guide.md
Third-party integration setup:
- **Google OAuth**: Complete setup with PKCE, token refresh, error handling
- **LLM APIs**: OpenAI, Claude, Llama integration with fallback strategies
- **Analytics Setup**: Firebase, Mixpanel, custom event tracking
- **Payment Processing**: Stripe/Apple Pay integration for premium features
- **Push Notifications**: Firebase Cloud Messaging setup

### 20. error_codes_reference.md
Comprehensive error code system:
```javascript
const ErrorCodes = {
  // Authentication Errors (1xxx)
  1001: "Invalid Google OAuth token",
  1002: "JWT token expired",
  1003: "User not found",
  1004: "Authentication required",

  // AI Service Errors (2xxx)
  2001: "LLM API rate limit exceeded",
  2002: "Invalid workout modification request",
  2003: "AI service temporarily unavailable",
  2004: "Unsafe exercise request detected",

  // Database Errors (3xxx)
  3001: "Workout plan not found",
  3002: "Database connection failed",
  3003: "Constraint violation",
  3004: "Version conflict detected",

  // Network Errors (4xxx)
  4001: "Network timeout",
  4002: "Service unavailable",
  4003: "Invalid request format",
  4004: "Rate limit exceeded"
};
```

### 21. user_manual.md
End-user documentation:
- **Getting Started**: Account creation, initial setup, first workout
- **Feature Tutorials**: AI coaching, workout customization, progress tracking
- **Tips and Tricks**: Advanced features, shortcuts, best practices
- **Troubleshooting**: Common user issues, contact support

### 22. FAQ.md
Comprehensive FAQ covering:
- **Technical FAQs**: App requirements, sync issues, data privacy
- **User FAQs**: How to use features, billing questions, account management
- **Business FAQs**: Pricing, partnerships, enterprise solutions
- **Development FAQs**: API access, customization options, integration support

### 23. onboarding_guide.md
User onboarding flow design:
1. **Welcome & Permissions**: App introduction, required permissions
2. **Goal Setting**: Fitness goals, experience level, preferences
3. **AI Coach Introduction**: Personality selection, coaching style
4. **First Workout**: Guided workout experience, form tips
5. **Progress Setup**: Baseline measurements, tracking preferences

### 24. performance_benchmarks.md
Performance targets and monitoring:
- **API Response Times**: Authentication <200ms, Workout data <500ms, AI responses <2s
- **App Performance**: Launch time <3s, Navigation <100ms, Sync <5s
- **Resource Usage**: Memory <150MB, Battery drain <5%/hour, Network <10MB/session
- **AI Performance**: Response accuracy >90%, Safety protocol compliance 100%

### 25. security.md
Comprehensive security implementation:
- **Authentication Security**: OAuth 2.0 with PKCE, JWT with refresh tokens
- **Data Encryption**: AES-256 for data at rest, TLS 1.3 for data in transit
- **API Security**: Rate limiting, input validation, SQL injection prevention
- **Privacy Compliance**: GDPR compliance, data minimization, user consent
- **Mobile Security**: Certificate pinning, secure storage, obfuscation

### 26. deployment_guide.md
Production deployment procedures:
- **Build Configuration**: Production builds, environment setup, secret management
- **App Store Submission**: iOS App Store, Google Play Store requirements
- **Backend Deployment**: Docker containerization, CI/CD pipelines, rollback procedures
- **Monitoring Setup**: Error tracking, performance monitoring, alerting

### 27. monitoring_and_logging.md
Observability implementation:
- **Error Tracking**: Sentry integration, error categorization, alert thresholds
- **Performance Monitoring**: APM tools, custom metrics, dashboards
- **User Analytics**: Event tracking, funnel analysis, cohort analysis
- **System Health**: Uptime monitoring, resource utilization, dependency checks

### 28. cost_analysis.md
Detailed cost breakdown and projections:
- **Infrastructure Costs**: Hosting, databases, CDN, scaling projections
- **AI/LLM API Costs**: Per-request pricing, volume discounts, optimization strategies
- **Third-party Services**: Analytics, monitoring, payment processing
- **Development Costs**: Team size, timeline, maintenance overhead

### 29. stakeholder_communication.md
Communication framework:
- **Progress Reports**: Weekly updates, milestone tracking, issue escalation
- **Feature Announcements**: Release notes, user communications, marketing support
- **Incident Response**: Communication protocols, status page updates, post-mortems
- **Business Reviews**: Quarterly business reviews, metrics reporting, strategic planning

### 30. risk_assessment.md
Comprehensive risk analysis:
- **Technical Risks**: Technology obsolescence, performance issues, security vulnerabilities
- **Business Risks**: Market competition, user adoption, revenue projections
- **Operational Risks**: Team capacity, timeline delays, quality issues
- **Mitigation Strategies**: Risk prevention, contingency planning, response procedures

### 31. caching_strategy.md
Multi-level caching implementation:
```javascript
// Redis Caching Strategy
const cacheStrategy = {
  userProfiles: { ttl: 3600, strategy: 'write-through' },
  workoutPlans: { ttl: 1800, strategy: 'cache-aside' },
  exerciseLibrary: { ttl: 86400, strategy: 'write-behind' },
  aiResponses: { ttl: 300, strategy: 'cache-aside' }
};

// Cache Invalidation Rules
const invalidationRules = {
  userProfileUpdate: ['userProfiles', 'workoutPlans'],
  workoutModification: ['workoutPlans', 'aiResponses'],
  exerciseLibraryUpdate: ['exerciseLibrary', 'workoutPlans']
};
```

### 32. analytics_and_metrics.md
Analytics implementation framework:
- **Event Tracking**: User interactions, feature usage, conversion funnels
- **Performance Metrics**: App performance, API response times, error rates
- **Business KPIs**: User acquisition, retention, revenue metrics
- **AI Metrics**: Coaching effectiveness, user satisfaction, safety compliance

### 33. load_testing_results.md
Load testing documentation:
- **Test Scenarios**: Concurrent users, peak usage, stress testing
- **Performance Results**: Response times, throughput, error rates
- **Bottleneck Analysis**: Database performance, API limitations, resource constraints
- **Optimization Recommendations**: Scaling strategies, performance improvements

### 34. maintenance_schedule.md
Maintenance planning:
- **Regular Updates**: Weekly releases, monthly major updates, quarterly reviews
- **Security Patches**: Immediate critical patches, regular security updates
- **Dependency Management**: Monthly dependency updates, vulnerability scans
- **Data Maintenance**: Database cleanup, backup verification, archive procedures

### 35. decision_log.md
Technical decision documentation:
- **Framework Selection**: Flutter vs React Native analysis, final decision rationale
- **Architecture Decisions**: Microservices vs monolith, database choices
- **Technology Choices**: AI/LLM selection, cloud provider selection
- **Trade-off Analysis**: Performance vs cost, complexity vs maintainability

### 36. technical_debt_log.md
Technical debt tracking:
- **Known Issues**: Performance bottlenecks, code quality issues, architectural shortcuts
- **Refactoring Needs**: Code cleanup, architecture improvements, testing gaps
- **Optimization Opportunities**: Database queries, API efficiency, mobile performance
- **Priority Assessment**: Impact analysis, effort estimation, timeline planning

## Implementation Code Examples

### AI Coaching System Implementation
```javascript
class AICoachingService {
  constructor() {
    this.llm = new LLMClient({
      primary: 'claude-3.5-sonnet',
      fallback: 'llama-3.3-70b'
    });
  }

  async generateCoachingResponse(userId, message, personality) {
    const context = await this.buildUserContext(userId);
    const systemPrompt = this.getPersonalityPrompt(personality);
    
    try {
      const response = await this.llm.chat({
        model: this.llm.primary,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Context: ${context}\n\nUser: ${message}` }
        ],
        temperature: this.getPersonalityTemperature(personality),
        max_tokens: 500
      });

      const parsedResponse = this.parseAIResponse(response);
      
      if (parsedResponse.workout_modifications) {
        await this.applyWorkoutModifications(userId, parsedResponse.workout_modifications);
      }

      await this.saveConversation(userId, message, parsedResponse.coaching_message);
      return parsedResponse;
      
    } catch (error) {
      // Fallback to simpler model or rule-based response
      return this.generateFallbackResponse(message, personality);
    }
  }

  async applyWorkoutModifications(userId, modifications) {
    const currentPlan = await WorkoutPlan.findActive(userId);
    const newVersion = await this.createWorkoutVersion(currentPlan, modifications);
    
    await WorkoutPlanVersion.create({
      plan_id: currentPlan.id,
      version_number: newVersion.version + 1,
      changes_description: modifications.reasoning,
      changeset: modifications.changes,
      exercises: newVersion.exercises,
      created_by: 'ai'
    });
  }
}
```

### Workout Versioning System
```javascript
class WorkoutVersioningService {
  async revertWorkoutPlan(planId, targetVersion) {
    const versions = await WorkoutPlanVersion.findByPlanId(planId)
      .orderBy('version_number', 'desc');
    
    const currentVersion = versions[0];
    const targetVersionData = versions.find(v => v.version_number === targetVersion);
    
    if (!targetVersionData) {
      throw new Error('Target version not found');
    }

    // Create new version that reverts to target
    const revertedPlan = await WorkoutPlanVersion.create({
      plan_id: planId,
      version_number: currentVersion.version_number + 1,
      changes_description: `Reverted to version ${targetVersion}`,
      changeset: this.generateRevertChangeset(currentVersion, targetVersionData),
      exercises: targetVersionData.exercises,
      created_by: 'user'
    });

    await WorkoutPlan.update(planId, {
      exercises: targetVersionData.exercises,
      updated_at: new Date()
    });

    return revertedPlan;
  }

  generateRevertChangeset(currentVersion, targetVersion) {
    // Compare exercises and generate changeset
    const changes = [];
    // Implementation details for tracking specific changes
    return changes;
  }
}
```

## Generation Instructions

When generating each documentation file:

1. **Use the technical specifications provided above** - Include specific architecture details, technology choices, and implementation patterns
2. **Provide concrete, actionable content** - Avoid generic descriptions, include specific code examples and configuration
3. **Maintain consistency across all files** - Use the same technology stack, architecture patterns, and naming conventions
4. **Focus on the data engineer perspective** - Provide learning paths, explain mobile development concepts, include debugging guidance
5. **Include both free and paid alternatives** - Show progression from MVP to enterprise solutions
6. **Address Zing's specific limitations** - Ensure each solution directly addresses the identified problems
7. **Provide implementation timelines** - Include realistic estimates for someone learning mobile development
8. **Include safety and security considerations** - Especially important for fitness apps handling health data
9. **Use production-ready patterns** - Include error handling, monitoring, and scalability considerations
10. **Make it beginner-friendly** - Explain concepts that might be new to data engineers

Each file should be comprehensive enough to serve as a complete reference for that topic, while also integrating seamlessly with the overall project architecture and goals.