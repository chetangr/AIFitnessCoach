# Actually Missing API Endpoints

This document lists API endpoints that should exist based on the current database models but are not implemented.

## 1. Body Measurements & Progress Tracking

### Models: `BodyMeasurement`, `ProgressPhoto` (in `models/measurements.py`)

**Missing Endpoints:**
```
POST   /api/measurements                 - Record new body measurement
GET    /api/measurements                 - Get measurement history
GET    /api/measurements/latest          - Get latest measurements
GET    /api/measurements/trends          - Get measurement trends/charts
DELETE /api/measurements/{id}            - Delete a measurement

POST   /api/progress-photos              - Upload progress photo
GET    /api/progress-photos              - Get photo gallery
GET    /api/progress-photos/{id}         - Get specific photo
DELETE /api/progress-photos/{id}         - Delete a photo
PUT    /api/progress-photos/{id}/privacy - Update photo privacy
```

## 2. Fasting Management

### Model: `FastingSession` (in `models/measurements.py`)

**Missing Endpoints:**
```
POST   /api/fasting/start                - Start fasting session
POST   /api/fasting/stop                 - Stop current fasting session
GET    /api/fasting/current              - Get active fasting session
GET    /api/fasting/history              - Get fasting history
GET    /api/fasting/stats                - Get fasting statistics/streaks
DELETE /api/fasting/{id}                 - Delete fasting record
```

## 3. User Settings

### Model: `UserSettings` (in `models/measurements.py`)

**Missing Endpoints:**
```
GET    /api/settings                     - Get user settings
PUT    /api/settings                     - Update settings
PUT    /api/settings/units               - Update unit preferences
PUT    /api/settings/notifications       - Update notification preferences
PUT    /api/settings/workout-preferences - Update workout preferences
```

## 4. Workout Session Tracking (Set-by-Set)

### Models: `WorkoutSessionV2`, `ExercisePerformance`, `SetPerformance` (in `models/tracking.py`)

**Missing Endpoints:**
```
POST   /api/workout-sessions/start       - Start a workout session
POST   /api/workout-sessions/{id}/exercise - Add exercise to session
POST   /api/workout-sessions/{id}/set    - Record a set
PUT    /api/workout-sessions/{id}/set/{setId} - Update a set
POST   /api/workout-sessions/{id}/complete - Complete workout session
GET    /api/workout-sessions             - Get session history
GET    /api/workout-sessions/{id}        - Get session details
DELETE /api/workout-sessions/{id}        - Delete session
```

## 5. Personal Records

### Model: `PersonalRecord` (in `models/tracking.py`)

**Missing Endpoints:**
```
GET    /api/personal-records             - Get all PRs
GET    /api/personal-records/exercise/{exerciseId} - Get PRs for exercise
GET    /api/personal-records/recent      - Get recent PRs
POST   /api/personal-records/calculate   - Calculate/update PRs
```

## 6. Custom Exercises

### Model: `CustomExercise` (in `models/custom_content.py`)

**Missing Endpoints:**
```
POST   /api/custom-exercises             - Create custom exercise
GET    /api/custom-exercises             - Get user's custom exercises
GET    /api/custom-exercises/{id}        - Get exercise details
PUT    /api/custom-exercises/{id}        - Update custom exercise
DELETE /api/custom-exercises/{id}        - Delete custom exercise
POST   /api/custom-exercises/{id}/share  - Make exercise public
```

## 7. Workout Templates

### Model: `WorkoutTemplate` (in `models/custom_content.py`)

**Missing Endpoints:**
```
POST   /api/workout-templates            - Create workout template
GET    /api/workout-templates            - Get user's templates
GET    /api/workout-templates/{id}       - Get template details
PUT    /api/workout-templates/{id}       - Update template
DELETE /api/workout-templates/{id}       - Delete template
POST   /api/workout-templates/{id}/use   - Create workout from template
```

## 8. Training Programs (Custom)

### Model: `TrainingProgram` (in `models/custom_content.py`)

**Missing Endpoints:**
```
POST   /api/training-programs            - Create custom program
GET    /api/training-programs/custom     - Get user's custom programs
PUT    /api/training-programs/{id}       - Update custom program
DELETE /api/training-programs/{id}       - Delete custom program
POST   /api/training-programs/{id}/enroll - Enroll in program
POST   /api/training-programs/{id}/rate  - Rate/review program
```

## 9. Exercise History

### Model: `ExerciseHistory` (in `models/custom_content.py`)

**Missing Endpoints:**
```
GET    /api/exercise-history/{exerciseId} - Get performance history for exercise
GET    /api/exercise-history/recent      - Get recent exercise history
GET    /api/exercise-history/favorites   - Get most performed exercises
```

## 10. Workout Schedule

### Model: `WorkoutSchedule` (in `models/measurements.py`)

**Missing Endpoints:**
```
POST   /api/workout-schedule             - Create/update schedule
GET    /api/workout-schedule             - Get current schedule
PUT    /api/workout-schedule/move        - Move workout to different day
POST   /api/workout-schedule/rest-day    - Mark day as rest
DELETE /api/workout-schedule             - Clear schedule
```

## 11. Enhanced Coach API

### Model: `CoachingSession`, `Message` (in `models/coach.py`)

**Missing Endpoints:**
```
GET    /api/coach/sessions               - Get all coaching sessions
GET    /api/coach/sessions/{id}/messages - Get all messages from session
DELETE /api/coach/sessions/{id}          - Delete/archive session
POST   /api/coach/export                 - Export chat history
GET    /api/coach/insights               - Get AI insights/recommendations
```

## 12. Workout Plan Versioning

### Model: `WorkoutPlanVersion` (in `models/workout.py`)

**Missing Endpoints:**
```
GET    /api/workouts/{id}/versions       - Get version history
POST   /api/workouts/{id}/revert/{version} - Revert to specific version
GET    /api/workouts/{id}/diff/{v1}/{v2} - Compare versions
```

## Summary

The backend has well-designed database models for comprehensive fitness tracking, but most of the API endpoints to interact with these models are missing. This creates a significant gap between what the database can store and what the app can actually do.

**Priority Implementation Order:**
1. **Workout Session Tracking** - Core functionality for recording workouts
2. **Body Measurements & Progress Photos** - Essential for progress tracking
3. **Custom Exercises & Templates** - User content creation
4. **Personal Records** - Motivation and progress tracking
5. **Settings Management** - User preferences
6. **Fasting & Schedule** - Additional features

These endpoints would unlock the full potential of the existing database schema without requiring any new models.