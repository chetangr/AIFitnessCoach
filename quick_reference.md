# AI Fitness Coach - Quick Reference Guide

## Essential Commands & Shortcuts

### Flutter Development

#### Project Setup
```bash
# Create new Flutter project
flutter create fitness_app --org com.yourcompany --platforms=ios,android

# Get dependencies
flutter pub get

# Generate code (models, routes, etc.)
flutter pub run build_runner build --delete-conflicting-outputs

# Clean project
flutter clean && flutter pub get
```

#### Running the App
```bash
# Run in debug mode
flutter run

# Run on specific device
flutter run -d iPhone_14_Pro    # iOS Simulator
flutter run -d emulator-5554    # Android Emulator

# Run with flavor/scheme
flutter run --flavor dev -t lib/main_dev.dart
flutter run --flavor prod -t lib/main_prod.dart

# Hot reload
r  # While app is running

# Hot restart
R  # While app is running
```

#### Building & Testing
```bash
# Run tests
flutter test
flutter test test/unit/
flutter test --coverage

# Build for iOS
flutter build ios --release
flutter build ipa  # For App Store

# Build for Android
flutter build apk --release
flutter build appbundle  # For Play Store

# Analyze code
flutter analyze
```

### Backend Development (Node.js)

#### Server Management
```bash
# Start development server
npm run dev
yarn dev

# Start production server
npm start
pm2 start ecosystem.config.js

# Watch logs
pm2 logs
pm2 logs api-server --lines 100

# Restart server
pm2 restart api-server
pm2 reload api-server  # Zero-downtime reload
```

#### Database Operations
```bash
# Run migrations
npm run migrate
npm run migrate:undo

# Seed database
npm run seed
npm run seed:undo

# Database console
psql -U postgres -d fitness_app
npm run db:console

# Backup database
pg_dump -U postgres fitness_app > backup.sql
npm run db:backup
```

#### Testing Backend
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Git Workflows

#### Feature Development
```bash
# Start new feature
git checkout -b feature/ai-coaching-personality
git push -u origin feature/ai-coaching-personality

# Commit with conventional commits
git add .
git commit -m "feat: add personality selection for AI coach"
git commit -m "fix: resolve workout sync issues"
git commit -m "docs: update API documentation"

# Sync with main
git fetch origin
git rebase origin/main

# Push changes
git push origin feature/ai-coaching-personality
```

#### Quick Fixes
```bash
# Hotfix workflow
git checkout -b hotfix/critical-auth-bug main
# Make fixes
git add . && git commit -m "fix: resolve authentication crash"
git push origin hotfix/critical-auth-bug

# Cherry-pick specific commit
git cherry-pick <commit-hash>
```

### Docker Commands

#### Container Management
```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs --tail=50 postgres

# Execute commands in container
docker-compose exec api npm run migrate
docker-compose exec postgres psql -U postgres

# Clean up
docker-compose down
docker-compose down -v  # Remove volumes too
```

#### Debugging Containers
```bash
# List running containers
docker ps

# Inspect container
docker inspect <container-id>

# Access container shell
docker exec -it <container-id> /bin/bash

# View container logs
docker logs <container-id> --follow
```

### API Testing with cURL

#### Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "google-id-token"}'

# Use auth token
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users/profile
```

#### Workout Operations
```bash
# Get workout plans
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/workouts/plans

# Create workout plan
curl -X POST http://localhost:3000/api/workouts/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Upper Body Strength",
    "exercises": [
      {"exercise_id": "ex-1", "sets": 3, "reps": 10}
    ]
  }'

# Modify workout
curl -X PUT http://localhost:3000/api/workouts/plans/plan-123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"exercises": [...]}'
```

#### AI Coaching
```bash
# Send message to AI coach
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add more leg exercises",
    "personality": "aggressive"
  }'
```

### Environment Management

#### Environment Variables
```bash
# Load .env file
source .env
export $(cat .env | xargs)

# Check current environment
echo $NODE_ENV
env | grep API

# Switch environments
export NODE_ENV=development
export NODE_ENV=production
```

#### Secret Management
```bash
# Generate secrets
openssl rand -base64 32  # For JWT_SECRET
uuidgen                  # For API keys

# Store in .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# Encode/decode base64
echo -n "secret" | base64
echo "c2VjcmV0" | base64 -d
```

### Debugging Commands

#### Flutter Debugging
```bash
# Verbose output
flutter run -v

# Performance profiling
flutter run --profile

# Debug layout issues
flutter inspector

# Check widget tree
# Press 'w' while app is running

# Performance overlay
# Press 'P' while app is running
```

#### Backend Debugging
```bash
# Node.js debugging
node --inspect server.js
node --inspect-brk server.js  # Break on first line

# Debug with VS Code
# Add to launch.json:
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Process",
  "port": 9229
}

# Memory profiling
node --max-old-space-size=4096 server.js
node --trace-gc server.js
```

#### Database Debugging
```sql
-- Check slow queries
EXPLAIN ANALYZE SELECT * FROM workout_plans WHERE user_id = 'uuid';

-- View current connections
SELECT pid, usename, application_name, client_addr, state 
FROM pg_stat_activity;

-- Kill stuck query
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' AND query_start < now() - interval '5 minutes';

-- Table sizes
SELECT 
  schemaname AS table_schema,
  tablename AS table_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Deployment Commands

#### iOS Deployment
```bash
# Build for TestFlight
flutter build ipa --release

# Upload to App Store Connect
xcrun altool --upload-app -f build/ios/ipa/*.ipa \
  -u "your-apple-id@email.com" -p "app-specific-password"

# Or use Transporter app
open ~/build/ios/ipa/*.ipa
```

#### Android Deployment
```bash
# Build for Play Store
flutter build appbundle --release

# Test bundle locally
bundletool build-apks --bundle=app-release.aab --output=app.apks
bundletool install-apks --apks=app.apks

# Sign APK manually
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore release.keystore app-release.apk alias_name
```

#### Server Deployment
```bash
# Deploy with PM2
pm2 deploy production

# Manual deployment
ssh user@server
cd /app
git pull origin main
npm install --production
npm run build
pm2 restart all

# Docker deployment
docker build -t fitness-api:latest .
docker push registry.com/fitness-api:latest
kubectl rollout restart deployment/fitness-api
```

### Performance Monitoring

#### Flutter Performance
```bash
# CPU/GPU profiling
flutter run --profile --trace-skia

# Memory profiling
flutter run --profile --track-widget-creation

# Network profiling
# Use Flutter DevTools
flutter pub global activate devtools
flutter pub global run devtools
```

#### Backend Performance
```bash
# Load testing
artillery quick -n 100 -c 10 http://localhost:3000/api/health

# Memory usage
pm2 monit

# CPU profiling
node --prof server.js
node --prof-process isolate-*.log > profile.txt

# Heap snapshot
kill -USR2 <pid>  # Triggers heap snapshot
```

### Useful One-Liners

#### Development Helpers
```bash
# Find TODO comments
grep -r "TODO\|FIXME" --include="*.dart" --include="*.js" .

# Count lines of code
find . -name "*.dart" -o -name "*.js" | xargs wc -l

# Format all Dart files
dart format .

# Update all packages
flutter pub upgrade --major-versions

# Clean everything
flutter clean && rm -rf ios/Pods && rm ios/Podfile.lock
```

#### Monitoring & Logs
```bash
# Tail multiple logs
tail -f logs/*.log

# Search logs for errors
grep -i error logs/app.log | tail -20

# Monitor API response times
while true; do curl -w "@curl-format.txt" -s http://localhost:3000/api/health; sleep 5; done

# Watch database connections
watch -n 1 'psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"'
```

### VS Code Shortcuts

#### Flutter Development
```
Cmd/Ctrl + .          : Quick fix
Cmd/Ctrl + Shift + R  : Refactor
Cmd/Ctrl + Shift + P  : Command palette
F5                    : Start debugging
Shift + F5           : Stop debugging
Cmd/Ctrl + Shift + F5 : Hot restart
```

#### Code Navigation
```
Cmd/Ctrl + P         : Go to file
Cmd/Ctrl + Shift + O : Go to symbol
F12                  : Go to definition
Shift + F12         : Find all references
Cmd/Ctrl + K, V     : Preview markdown
```

### Terminal Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Flutter aliases
alias fr='flutter run'
alias ft='flutter test'
alias fb='flutter build'
alias fpg='flutter pub get'
alias fc='flutter clean'

# Git aliases
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline'

# Docker aliases
alias dc='docker-compose'
alias dcu='docker-compose up'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'

# Node/NPM aliases
alias ni='npm install'
alias nr='npm run'
alias nrd='npm run dev'
alias nrt='npm run test'

# Database aliases
alias pgstart='pg_ctl -D /usr/local/var/postgres start'
alias pgstop='pg_ctl -D /usr/local/var/postgres stop'
```

### Emergency Commands

#### System Recovery
```bash
# Kill all Node processes
killall node

# Kill specific port
lsof -ti:3000 | xargs kill -9

# Clear all Docker resources
docker system prune -a --volumes

# Reset Flutter
rm -rf ~/.pub-cache
flutter clean
flutter pub cache repair

# Emergency database backup
pg_dump -U postgres -h localhost fitness_app > emergency_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Quick Diagnostics
```bash
# Check system resources
top
htop
df -h
free -m

# Check network
netstat -tulpn | grep LISTEN
ss -tulpn

# Check processes
ps aux | grep node
ps aux | grep flutter
```

This quick reference guide provides the most commonly used commands and shortcuts for developing the AI Fitness Coach app. Keep it handy for rapid development and troubleshooting!