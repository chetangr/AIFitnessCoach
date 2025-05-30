# AI Fitness Coach - React Native + Python Backend

A modern AI-powered fitness coaching app built with React Native (TypeScript) and Python FastAPI backend. Features personalized workout plans, AI coaching with multiple personalities, and comprehensive fitness tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- PostgreSQL 14+
- Redis (optional, for caching)
- Xcode (for iOS development)
- Android Studio (for Android development)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Set up PostgreSQL database:**
```bash
createdb ai_fitness_coach
```

6. **Run database migrations:**
```bash
alembic upgrade head
```

7. **Start the backend server:**
```bash
python app.py
# Server will run on http://localhost:8000
# API docs available at http://localhost:8000/docs
```

### Frontend Setup (React Native)

1. **Navigate to React Native directory:**
```bash
cd AIFitnessCoach
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **iOS specific setup:**
```bash
cd ios && pod install && cd ..
```

4. **Create environment configuration:**
```bash
echo "API_URL=http://localhost:8000/api" > .env
```

5. **Start Metro bundler:**
```bash
npm start
# or
yarn start
```

6. **Run on iOS:**
```bash
npm run ios
# or
yarn ios
```

7. **Run on Android:**
```bash
npm run android
# or
yarn android
```

## 📱 Features

### Core Functionality
- **AI Coaching System**: Three distinct coach personalities (Supportive Emma, Aggressive Max, Steady Dr. Progress)
- **Smart Workout Management**: Drag & drop scheduling, workout versioning, progress tracking
- **Exercise Library**: 10,000+ exercises with filters, custom exercise creation
- **Authentication**: Secure login/registration with demo mode
- **Glassmorphism UI**: Modern, visually appealing interface with dark mode support

### Technical Features
- **TypeScript**: Full type safety across the application
- **Zustand State Management**: Efficient, simple state management
- **FastAPI Backend**: High-performance Python backend with automatic API documentation
- **PostgreSQL Database**: Robust data persistence with proper relationships
- **OpenAI Integration**: GPT-4 powered coaching conversations
- **Responsive Design**: Works seamlessly on phones and tablets

## 🏗️ Architecture

### Frontend Structure
```
AIFitnessCoach/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── services/       # API services
│   ├── store/          # Zustand stores
│   ├── navigation/     # React Navigation setup
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── constants/      # App constants
├── assets/             # Images, fonts, animations
└── App.tsx            # Root component
```

### Backend Structure
```
backend/
├── api/               # API endpoints
├── models/            # SQLAlchemy models
├── services/          # Business logic
├── utils/             # Utility functions
├── schemas/           # Pydantic schemas
└── app.py            # FastAPI application
```

## 🔧 Development

### Running Tests

**Backend:**
```bash
cd backend
pytest
```

**Frontend:**
```bash
cd AIFitnessCoach
npm test
# or
yarn test
```

### Code Quality

**Backend:**
```bash
# Format code
black .

# Lint
flake8

# Type checking
mypy .
```

**Frontend:**
```bash
# Lint
npm run lint

# Type checking
npm run type-check
```

## 🚀 Deployment

### Backend Deployment

1. **Using Docker:**
```bash
docker build -t ai-fitness-coach-backend .
docker run -p 8000:8000 ai-fitness-coach-backend
```

2. **Using Heroku/Railway:**
- Ensure Procfile is configured
- Set environment variables
- Deploy via Git push

### Mobile App Deployment

1. **iOS:**
- Configure signing in Xcode
- Archive and upload to App Store Connect
- Submit for review

2. **Android:**
- Generate signed APK/AAB
- Upload to Google Play Console
- Submit for review

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- API rate limiting
- CORS configuration
- Environment variable management
- SQL injection prevention

## 📊 Database Schema

Key tables:
- `users`: User profiles and authentication
- `workout_plans`: User workout plans
- `workout_plan_versions`: Version history for undo/redo
- `exercises`: Exercise library
- `coaching_sessions`: AI coaching conversations
- `user_progress`: Progress tracking metrics

## 🤝 API Documentation

The backend automatically generates interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

Key endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/workouts/plans` - Get user workouts
- `POST /api/coach/chat` - AI coach conversation
- `GET /api/exercises` - Exercise library

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues:**
```bash
npx react-native start --reset-cache
```

2. **iOS build failures:**
```bash
cd ios && pod deintegrate && pod install
```

3. **Android build issues:**
```bash
cd android && ./gradlew clean
```

4. **Database connection errors:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check database exists

## 📝 Environment Variables

### Backend (.env)
```
ENV=development
PORT=8000
DATABASE_URL=postgresql://user:password@localhost:5432/ai_fitness_coach
JWT_SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
```

### Frontend (.env)
```
API_URL=http://localhost:8000/api
```

## 🎯 Demo Credentials

For testing purposes:
- Email: demo@fitness.com
- Password: demo123

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.