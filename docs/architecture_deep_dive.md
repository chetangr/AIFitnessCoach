# AI Fitness Coach - Architecture Deep Dive

## System Overview

The AI Fitness Coach application is built on a modern, scalable microservices architecture designed to handle real-time AI interactions, complex workout data, and millions of users. This document provides a comprehensive technical overview for data engineers transitioning to mobile development.

## High-Level Architecture

```mermaid
graph TB
    Mobile[Mobile Apps] --> ALB[Application Load Balancer]
    Web[Web Dashboard] --> ALB
    
    ALB --> API[API Gateway]
    API --> Auth[Auth Service]
    API --> User[User Service]
    API --> Workout[Workout Service]
    API --> AI[AI Coaching Service]
    API --> Analytics[Analytics Service]
    
    Auth --> Redis[(Redis Cache)]
    User --> Postgres[(PostgreSQL)]
    Workout --> Postgres
    Workout --> MongoDB[(MongoDB)]
    AI --> Vector[(Vector DB)]
    AI --> Redis
    Analytics --> ClickHouse[(ClickHouse)]
    
    AI --> OpenAI[OpenAI API]
    AI --> Claude[Claude API]
    AI --> Llama[Llama API]
    
    API --> EventBus[Event Bus]
    EventBus --> Queue[Message Queue]
    Queue --> Workers[Background Workers]
```

## Core Services Architecture

### Microservices Breakdown

```javascript
const services = {
  userService: {
    responsibilities: [
      'User authentication and authorization',
      'Profile management',
      'Preferences and settings',
      'Account lifecycle management'
    ],
    database: 'PostgreSQL',
    scaling: 'Horizontal',
    deployment: 'Containerized (Docker)',
    monitoring: 'APM + Health checks'
  },
  
  workoutService: {
    responsibilities: [
      'Exercise library management',
      'Workout plan CRUD operations',
      'Version control for workout plans',
      'Progress tracking and analytics'
    ],
    database: 'PostgreSQL + MongoDB',
    scaling: 'Horizontal',
    caching: 'Redis for frequently accessed plans',
    eventSourcing: 'For workout modifications'
  },
  
  aiCoachingService: {
    responsibilities: [
      'LLM API integration and fallback management',
      'Conversation context management',
      'Personality-based response generation',
      'Safety protocol enforcement'
    ],
    database: 'Redis + Vector Database',
    scaling: 'Vertical (GPU-optimized instances)',
    caching: 'Aggressive response caching',
    rateLimiting: 'Per-user and global limits'
  },
  
  analyticsService: {
    responsibilities: [
      'Real-time event processing',
      'User behavior analysis',
      'Performance metrics aggregation',
      'Business intelligence reporting'
    ],
    database: 'ClickHouse + Time-series DB',
    scaling: 'Horizontal with partitioning',
    streaming: 'Apache Kafka for real-time events'
  },
  
  notificationService: {
    responsibilities: [
      'Push notification delivery',
      'Email campaign management',
      'In-app notification system',
      'Reminder and motivation triggers'
    ],
    database: 'PostgreSQL',
    scaling: 'Horizontal',
    delivery: 'Firebase FCM + SendGrid'
  }
};
```

## Database Architecture

### Multi-Database Strategy

#### PostgreSQL (Primary OLTP)
```sql
-- Core entities with ACID compliance
CREATE SCHEMA fitness_core;

-- Users and authentication
CREATE TABLE fitness_core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    profile_image_url TEXT,
    fitness_level fitness_level_enum DEFAULT 'beginner',
    goals JSONB DEFAULT '[]',
    limitations JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    subscription_tier subscription_tier_enum DEFAULT 'free'
);

-- Workout plans with versioning
CREATE TABLE fitness_core.workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES fitness_core.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level difficulty_enum,
    estimated_duration_minutes INTEGER,
    equipment_required TEXT[] DEFAULT '{}',
    muscle_groups_targeted TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    version_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Version control for workout plans
CREATE TABLE fitness_core.workout_plan_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES fitness_core.workout_plans(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    exercises JSONB NOT NULL,
    changes_description TEXT,
    changeset JSONB, -- Diff from previous version
    created_by version_creator_enum, -- 'user' or 'ai'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Exercise library
CREATE TABLE fitness_core.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions JSONB, -- Step-by-step instructions
    muscle_groups TEXT[] NOT NULL,
    equipment_required TEXT[] DEFAULT '{}',
    difficulty_level difficulty_enum,
    video_url TEXT,
    image_urls TEXT[] DEFAULT '{}',
    safety_notes TEXT[] DEFAULT '{}',
    variations JSONB DEFAULT '{}',
    external_id VARCHAR(100), -- wger API ID
    source VARCHAR(50) DEFAULT 'internal',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX CONCURRENTLY idx_users_email ON fitness_core.users(email);
CREATE INDEX CONCURRENTLY idx_users_google_id ON fitness_core.users(google_id);
CREATE INDEX CONCURRENTLY idx_workout_plans_user_id ON fitness_core.workout_plans(user_id);
CREATE INDEX CONCURRENTLY idx_workout_plans_active ON fitness_core.workout_plans(user_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_workout_plan_versions_plan_id ON fitness_core.workout_plan_versions(plan_id);
CREATE INDEX CONCURRENTLY idx_exercises_muscle_groups ON fitness_core.exercises USING GIN(muscle_groups);
CREATE INDEX CONCURRENTLY idx_exercises_equipment ON fitness_core.exercises USING GIN(equipment_required);
```

#### MongoDB (Flexible Document Store)
```javascript
// Workout session tracking with flexible schema
const workoutSessionSchema = {
  _id: ObjectId(),
  userId: "uuid",
  planId: "uuid",
  startedAt: ISODate(),
  completedAt: ISODate(),
  duration: NumberInt(), // seconds
  exercises: [
    {
      exerciseId: "uuid",
      sets: [
        {
          setNumber: NumberInt(),
          reps: NumberInt(),
          weight: NumberDecimal(), // kg
          restTime: NumberInt(), // seconds
          rpe: NumberInt(), // Rate of Perceived Exertion 1-10
          notes: String,
          completedAt: ISODate()
        }
      ],
      modifications: {
        originalExercise: "uuid",
        reason: String,
        modifiedBy: String // 'user' or 'ai'
      }
    }
  ],
  environmentData: {
    temperature: NumberDecimal(),
    humidity: NumberDecimal(),
    location: {
      type: "Point",
      coordinates: [NumberDecimal(), NumberDecimal()]
    }
  },
  userFeedback: {
    difficulty: NumberInt(1-10),
    enjoyment: NumberInt(1-10),
    energyLevel: NumberInt(1-10),
    notes: String
  },
  aiInteractions: [
    {
      timestamp: ISODate(),
      userMessage: String,
      aiResponse: String,
      personality: String,
      confidence: NumberDecimal()
    }
  ]
};

// Indexes for workout sessions
db.workoutSessions.createIndex({ "userId": 1, "startedAt": -1 });
db.workoutSessions.createIndex({ "userId": 1, "completedAt": -1 });
db.workoutSessions.createIndex({ "exercises.exerciseId": 1 });
```

#### Redis (Caching & Session Store)
```javascript
// Redis data structures and usage patterns
const redisStructures = {
  // User sessions
  'session:{userId}': {
    type: 'hash',
    ttl: 604800, // 7 days
    fields: {
      accessToken: 'jwt_token',
      refreshToken: 'refresh_token',
      lastActivity: 'timestamp',
      deviceInfo: 'json_string'
    }
  },
  
  // AI conversation cache
  'conversation:{userId}': {
    type: 'list',
    ttl: 2592000, // 30 days
    maxLength: 100, // Keep last 100 messages
    structure: 'json_serialized_messages'
  },
  
  // Workout plan cache
  'plan:{planId}': {
    type: 'string',
    ttl: 3600, // 1 hour
    content: 'json_serialized_plan'
  },
  
  // Exercise recommendations cache
  'recommendations:{userId}:{contextHash}': {
    type: 'string',
    ttl: 1800, // 30 minutes
    content: 'json_array_of_exercises'
  },
  
  // Rate limiting
  'rate_limit:{userId}:{endpoint}': {
    type: 'string',
    ttl: 60, // 1 minute
    content: 'request_count'
  }
};
```

#### Vector Database (Pinecone/Milvus)
```python
# Vector embeddings for semantic search and recommendations
vector_collections = {
    'exercise_embeddings': {
        'dimension': 1536,  # OpenAI embedding dimension
        'metric': 'cosine',
        'vectors': {
            'exercise_id': 'uuid',
            'embedding': [0.1, 0.2, ...],  # Exercise description embedding
            'metadata': {
                'name': 'Push-ups',
                'muscle_groups': ['chest', 'triceps'],
                'difficulty': 'beginner',
                'equipment': []
            }
        }
    },
    
    'user_preference_embeddings': {
        'dimension': 1536,
        'metric': 'cosine',
        'vectors': {
            'user_id': 'uuid',
            'embedding': [0.3, 0.4, ...],  # User preference vector
            'metadata': {
                'fitness_level': 'intermediate',
                'last_updated': 'timestamp'
            }
        }
    },
    
    'workout_plan_embeddings': {
        'dimension': 1536,
        'metric': 'cosine',
        'vectors': {
            'plan_id': 'uuid',
            'embedding': [0.5, 0.6, ...],  # Plan description embedding
            'metadata': {
                'difficulty': 'advanced',
                'duration': 45,
                'equipment': ['dumbbells', 'bench']
            }
        }
    }
}
```

## API Gateway Architecture

### Request Flow and Middleware Stack
```javascript
const middlewareStack = [
  // 1. Security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"]
      }
    }
  }),
  
  // 2. CORS configuration
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }),
  
  // 3. Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Rate limit by user ID if authenticated, otherwise by IP
      return req.user?.id || req.ip;
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.round(req.rateLimit.resetTime.getTime() / 1000)
      });
    }
  }),
  
  // 4. Request parsing
  express.json({ limit: '10mb' }),
  express.urlencoded({ extended: true, limit: '10mb' }),
  
  // 5. Request ID generation
  (req, res, next) => {
    req.id = uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
  },
  
  // 6. Logging
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      }
    }
  }),
  
  // 7. Authentication (for protected routes)
  authMiddleware,
  
  // 8. Authorization
  authorizationMiddleware,
  
  // 9. Request validation
  validationMiddleware,
  
  // 10. Business logic
  routeHandler
];
```

### API Versioning Strategy
```javascript
const apiVersioning = {
  strategy: 'URL_PATH', // /api/v1/, /api/v2/
  
  supportedVersions: {
    'v1': {
      status: 'active',
      endpoints: ['/auth', '/users', '/workouts', '/exercises'],
      deprecationDate: null,
      documentation: 'https://docs.aicoach.com/api/v1'
    },
    'v2': {
      status: 'beta',
      endpoints: ['/ai', '/analytics', '/social'],
      features: ['Enhanced AI responses', 'Real-time analytics'],
      documentation: 'https://docs.aicoach.com/api/v2'
    }
  },
  
  backwardCompatibility: {
    duration: '12 months',
    migrationGuide: 'https://docs.aicoach.com/migration',
    breakingChanges: 'Documented in changelog'
  }
};
```

## AI Service Architecture

### Multi-Provider LLM Integration
```javascript
class LLMProviderManager {
  constructor() {
    this.providers = {
      primary: new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o',
        maxTokens: 500,
        temperature: 0.7
      }),
      
      secondary: new ClaudeProvider({
        apiKey: process.env.CLAUDE_API_KEY,
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 500
      }),
      
      fallback: new LlamaProvider({
        endpoint: process.env.LLAMA_ENDPOINT,
        apiKey: process.env.LLAMA_API_KEY,
        model: 'llama-3.3-70b'
      })
    };
    
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 30000
    });
  }

  async generateResponse(prompt, context, options = {}) {
    const providers = [this.providers.primary, this.providers.secondary, this.providers.fallback];
    
    for (const provider of providers) {
      try {
        return await this.circuitBreaker.execute(() => 
          provider.generate(prompt, context, options)
        );
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All LLM providers failed');
  }
}
```

### Conversation Context Management
```javascript
class ConversationManager {
  constructor(redis, vectorDb) {
    this.redis = redis;
    this.vectorDb = vectorDb;
    this.maxContextLength = 4000; // tokens
  }

  async buildContext(userId, currentMessage) {
    // Get recent conversation history
    const recentMessages = await this.redis.lrange(
      `conversation:${userId}`, 
      -10, 
      -1
    );
    
    // Get user profile and workout context
    const userContext = await this.getUserContext(userId);
    const workoutContext = await this.getWorkoutContext(userId);
    
    // Retrieve relevant conversation history using vector search
    const messageEmbedding = await this.generateEmbedding(currentMessage);
    const relevantHistory = await this.vectorDb.search(
      'conversation_embeddings',
      messageEmbedding,
      { userId, limit: 5 }
    );
    
    // Build comprehensive context
    return {
      userProfile: userContext,
      currentWorkout: workoutContext,
      recentMessages: recentMessages.map(msg => JSON.parse(msg)),
      relevantHistory: relevantHistory,
      timestamp: new Date().toISOString()
    };
  }

  async saveConversation(userId, userMessage, aiResponse, metadata = {}) {
    const conversationEntry = {
      timestamp: new Date().toISOString(),
      user: userMessage,
      assistant: aiResponse,
      metadata
    };
    
    // Save to Redis for quick access
    await this.redis.lpush(
      `conversation:${userId}`,
      JSON.stringify(conversationEntry)
    );
    
    // Trim to keep only recent messages
    await this.redis.ltrim(`conversation:${userId}`, 0, 99);
    
    // Index in vector database for semantic search
    const embedding = await this.generateEmbedding(
      `${userMessage} ${aiResponse}`
    );
    
    await this.vectorDb.upsert('conversation_embeddings', {
      id: `${userId}_${Date.now()}`,
      embedding,
      metadata: { userId, ...conversationEntry }
    });
  }
}
```

## Mobile App Architecture

### Flutter Architecture Pattern (Clean Architecture)
```dart
// lib/architecture/
├── core/
│   ├── error/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   └── network_info.dart
│   └── usecases/
│       └── usecase.dart
├── features/
│   ├── authentication/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── bloc/
│   │       ├── pages/
│   │       └── widgets/
│   ├── workouts/
│   │   └── [same structure]
│   └── ai_coaching/
│       └── [same structure]
```

### State Management with Riverpod
```dart
// Domain layer - Use case
class GetWorkoutPlansUseCase {
  final WorkoutRepository repository;
  
  GetWorkoutPlansUseCase(this.repository);
  
  Future<Either<Failure, List<WorkoutPlan>>> call(String userId) async {
    return await repository.getWorkoutPlans(userId);
  }
}

// Data layer - Repository implementation
class WorkoutRepositoryImpl implements WorkoutRepository {
  final WorkoutRemoteDataSource remoteDataSource;
  final WorkoutLocalDataSource localDataSource;
  final NetworkInfo networkInfo;
  
  WorkoutRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });
  
  @override
  Future<Either<Failure, List<WorkoutPlan>>> getWorkoutPlans(String userId) async {
    if (await networkInfo.isConnected) {
      try {
        final plans = await remoteDataSource.getWorkoutPlans(userId);
        await localDataSource.cacheWorkoutPlans(plans);
        return Right(plans);
      } on ServerException {
        return Left(ServerFailure());
      }
    } else {
      try {
        final plans = await localDataSource.getCachedWorkoutPlans(userId);
        return Right(plans);
      } on CacheException {
        return Left(CacheFailure());
      }
    }
  }
}

// Presentation layer - Provider
final workoutPlansProvider = FutureProvider.family<List<WorkoutPlan>, String>(
  (ref, userId) async {
    final useCase = ref.read(getWorkoutPlansUseCaseProvider);
    final result = await useCase(userId);
    
    return result.fold(
      (failure) => throw failure,
      (plans) => plans,
    );
  },
);

// UI layer - Consumer widget
class WorkoutListScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final workoutPlansAsync = ref.watch(workoutPlansProvider(userId));
    
    return workoutPlansAsync.when(
      data: (plans) => WorkoutPlansList(plans: plans),
      loading: () => LoadingWidget(),
      error: (error, stack) => ErrorWidget(error: error),
    );
  }
}
```

### Offline-First Architecture
```dart
class OfflineFirstRepository {
  final RemoteDataSource remoteDataSource;
  final LocalDataSource localDataSource;
  final SyncManager syncManager;

  Future<Either<Failure, T>> getData<T>() async {
    // Always try local first
    try {
      final localData = await localDataSource.getData<T>();
      
      // Background sync if connected
      if (await networkInfo.isConnected) {
        _backgroundSync();
      }
      
      return Right(localData);
    } on CacheException {
      // Fall back to remote if local fails
      if (await networkInfo.isConnected) {
        return await _fetchFromRemote<T>();
      } else {
        return Left(OfflineFailure());
      }
    }
  }

  Future<void> _backgroundSync() async {
    try {
      final remoteData = await remoteDataSource.getData();
      await localDataSource.saveData(remoteData);
      
      // Sync any pending local changes
      await syncManager.syncPendingChanges();
    } catch (error) {
      // Log error but don't affect user experience
      logger.warning('Background sync failed: $error');
    }
  }
}
```

## Security Architecture

### Authentication & Authorization Flow
```mermaid
sequenceDiagram
    participant Client as Mobile App
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Google as Google OAuth
    participant Cache as Redis
    
    Client->>Google: Login with Google
    Google->>Client: Return OAuth token
    Client->>Gateway: POST /auth/google {token}
    Gateway->>Auth: Verify Google token
    Auth->>Google: Validate token
    Google->>Auth: Token valid + user info
    Auth->>Cache: Store session
    Auth->>Gateway: Return JWT + refresh token
    Gateway->>Client: {accessToken, refreshToken, user}
    
    Note over Client,Cache: Subsequent requests
    Client->>Gateway: API request + JWT
    Gateway->>Cache: Validate session
    Cache->>Gateway: Session valid
    Gateway->>Client: API response
```

### JWT Token Structure
```javascript
const jwtPayload = {
  // Standard claims
  iss: 'ai-fitness-coach', // Issuer
  aud: 'ai-fitness-coach-app', // Audience
  sub: userId, // Subject (user ID)
  iat: Math.floor(Date.now() / 1000), // Issued at
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // Expires in 7 days
  jti: uuidv4(), // JWT ID for revocation
  
  // Custom claims
  email: user.email,
  role: user.role, // 'user', 'coach', 'admin'
  subscription: user.subscriptionTier, // 'free', 'premium', 'pro'
  permissions: user.permissions, // Array of specific permissions
  
  // Security
  deviceId: hashedDeviceId, // For device-specific sessions
  ipAddress: hashedIpAddress, // For suspicious activity detection
  
  // Feature flags
  features: user.enabledFeatures // Beta features, A/B test variants
};
```

### Data Encryption Strategy
```javascript
const encryptionStrategy = {
  dataAtRest: {
    database: 'AES-256-GCM encryption for PII fields',
    fileStorage: 'S3 server-side encryption with KMS',
    backups: 'Encrypted with customer-managed keys'
  },
  
  dataInTransit: {
    clientToServer: 'TLS 1.3 with certificate pinning',
    serviceToService: 'mTLS with service mesh',
    externalAPIs: 'TLS 1.3 with API key encryption'
  },
  
  dataInUse: {
    sensitiveOperations: 'Application-level encryption',
    aiProcessing: 'Data anonymization before LLM calls',
    analytics: 'Pseudonymization with rotating keys'
  }
};
```

## Monitoring & Observability

### Distributed Tracing
```javascript
const tracingConfig = {
  service: 'ai-fitness-coach',
  version: process.env.APP_VERSION,
  
  // OpenTelemetry configuration
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new SequelizeInstrumentation(),
    new RedisInstrumentation()
  ],
  
  // Custom spans for business logic
  customSpans: {
    aiRequest: {
      name: 'ai.request',
      attributes: {
        'ai.provider': 'openai|claude|llama',
        'ai.model': 'model_name',
        'ai.personality': 'supportive|aggressive|steady',
        'user.id': 'hashed_user_id',
        'request.tokens': 'token_count'
      }
    },
    
    workoutModification: {
      name: 'workout.modify',
      attributes: {
        'workout.id': 'workout_plan_id',
        'modification.type': 'ai|user',
        'modification.complexity': 'simple|complex'
      }
    }
  }
};
```

### Metrics and Alerting
```yaml
# Prometheus metrics configuration
metrics:
  application:
    - name: ai_requests_total
      type: counter
      labels: [provider, model, personality, status]
      description: Total AI requests by provider and status
    
    - name: workout_modifications_total
      type: counter
      labels: [type, complexity, success]
      description: Total workout modifications
    
    - name: user_engagement_duration
      type: histogram
      labels: [feature, user_tier]
      description: Time spent in different app features
    
  infrastructure:
    - name: database_query_duration
      type: histogram
      labels: [query_type, table]
      description: Database query performance
    
    - name: cache_hit_ratio
      type: gauge
      labels: [cache_type]
      description: Cache hit ratios for different cache types

alerting_rules:
  - name: HighErrorRate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    
  - name: AIProviderDown
    condition: ai_provider_success_rate < 90%
    duration: 2m
    severity: warning
    
  - name: DatabaseSlowQueries
    condition: db_query_duration_p95 > 1s
    duration: 5m
    severity: warning
```

## Deployment Architecture

### Kubernetes Deployment
```yaml
# deployment/kubernetes/
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-fitness-coach-api
  labels:
    app: ai-fitness-coach
    component: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-fitness-coach
      component: api
  template:
    metadata:
      labels:
        app: ai-fitness-coach
        component: api
    spec:
      containers:
      - name: api
        image: ai-fitness-coach:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ai-fitness-coach-api-service
spec:
  selector:
    app: ai-fitness-coach
    component: api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: fitness_app_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/fitness_app_test
    
    - name: Run security audit
      run: npm audit --audit-level moderate
  
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: |
        docker build -t ${{ secrets.DOCKER_REGISTRY }}/ai-fitness-coach:${{ github.sha }} .
        docker tag ${{ secrets.DOCKER_REGISTRY }}/ai-fitness-coach:${{ github.sha }} ${{ secrets.DOCKER_REGISTRY }}/ai-fitness-coach:latest
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin ${{ secrets.DOCKER_REGISTRY }}
        docker push ${{ secrets.DOCKER_REGISTRY }}/ai-fitness-coach:${{ github.sha }}
        docker push ${{ secrets.DOCKER_REGISTRY }}/ai-fitness-coach:latest
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/ai-fitness-coach-api api=${{ secrets.DOCKER_REGISTRY }}/ai-fitness-coach:${{ github.sha }}
        kubectl rollout status deployment/ai-fitness-coach-api
```

## Performance Optimization

### Caching Strategy
```javascript
const cachingLayers = {
  l1_browser: {
    description: 'Client-side caching in Flutter app',
    storage: 'SharedPreferences + Hive',
    ttl: '1 hour',
    data: ['user profile', 'recent workouts', 'exercise library']
  },
  
  l2_cdn: {
    description: 'CloudFlare CDN for static assets',
    storage: 'Global edge network',
    ttl: '24 hours',
    data: ['exercise videos', 'images', 'static content']
  },
  
  l3_application: {
    description: 'Redis application cache',
    storage: 'Redis cluster',
    ttl: '5 minutes - 1 hour',
    data: ['AI responses', 'workout plans', 'user sessions']
  },
  
  l4_database: {
    description: 'Database query result cache',
    storage: 'PostgreSQL shared_buffers + Redis',
    ttl: '15 minutes',
    data: ['frequently accessed queries', 'aggregated analytics']
  }
};
```

### Database Optimization
```sql
-- Partitioning strategy for large tables
CREATE TABLE workout_sessions_y2025m01 PARTITION OF workout_sessions
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Materialized views for complex analytics
CREATE MATERIALIZED VIEW user_workout_summary AS
SELECT 
    u.id as user_id,
    u.display_name,
    COUNT(ws.id) as total_workouts,
    AVG(ws.duration) as avg_duration,
    MAX(ws.completed_at) as last_workout,
    COUNT(CASE WHEN ws.completed_at >= NOW() - INTERVAL '7 days' THEN 1 END) as workouts_this_week
FROM users u
LEFT JOIN workout_sessions ws ON u.id = ws.user_id
WHERE u.is_active = true
GROUP BY u.id, u.display_name;

-- Refresh materialized view daily
CREATE OR REPLACE FUNCTION refresh_user_workout_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_workout_summary;
END;
$$ LANGUAGE plpgsql;

-- Connection pooling configuration
-- max_connections = 200
-- shared_buffers = 256MB
-- effective_cache_size = 1GB
-- work_mem = 4MB
-- maintenance_work_mem = 64MB
```

This architecture provides a robust, scalable foundation capable of supporting millions of users while maintaining the real-time responsiveness required for AI coaching interactions. The modular design allows for independent scaling of different components based on demand patterns.