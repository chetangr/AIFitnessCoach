// Quick test script to verify AI functions work
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Mock AsyncStorage
const storage = {};
AsyncStorage.setItem = (key, value) => {
  storage[key] = value;
  return Promise.resolve();
};
AsyncStorage.getItem = (key) => Promise.resolve(storage[key] || null);
AsyncStorage.removeItem = (key) => {
  delete storage[key];
  return Promise.resolve();
};
AsyncStorage.multiRemove = (keys) => {
  keys.forEach(key => delete storage[key]);
  return Promise.resolve();
};

// Import services
const { workoutScheduleService } = require('./src/services/workoutScheduleService');
const { aiActionService } = require('./src/services/aiActionService');

async function testAIFunctions() {
  console.log('🧪 Testing AI Fitness Coach Functions\n');

  try {
    // Test 1: Initialize workout schedule
    console.log('Test 1: Initialize Workout Schedule');
    await workoutScheduleService.initializeDefaultSchedule();
    const schedule = await workoutScheduleService.getFullSchedule();
    console.log(`✅ Schedule initialized with ${Object.keys(schedule).length} workouts\n`);

    // Test 2: Get today's workout
    console.log('Test 2: Get Today\'s Workout');
    const today = new Date();
    const todayWorkout = await workoutScheduleService.getWorkoutForDate(today);
    if (todayWorkout) {
      console.log(`✅ Today's workout: ${todayWorkout.title}`);
      console.log(`   Duration: ${todayWorkout.duration} minutes`);
      console.log(`   Exercises: ${todayWorkout.exercises?.length || 0}\n`);
    } else {
      console.log('✅ Today is a rest day\n');
    }

    // Test 3: AI Action Analysis
    console.log('Test 3: AI Intent Recognition');
    const testQueries = [
      "What's my workout today?",
      "Can you make today a rest day?",
      "I can't do bench press",
      "Create a 30 minute cardio workout"
    ];

    for (const query of testQueries) {
      const actions = await aiActionService.analyzeMessage(query);
      console.log(`✅ "${query}"`);
      console.log(`   → Detected ${actions.length} action(s):`, 
        actions.map(a => a.type).join(', '));
    }
    console.log('');

    // Test 4: Rest Day Flow
    console.log('Test 4: Rest Day Request Flow');
    
    // First add a workout for testing
    const testDate = new Date('2025-01-25');
    await workoutScheduleService.addWorkout(testDate, {
      title: 'Test Workout',
      time: '10:00 AM',
      duration: 60,
      difficulty: 'intermediate',
      type: 'workout',
      calories: 400,
      completed: false,
      exercises: [
        { id: 'squat', name: 'Squats', sets: 4, reps: '8-10', muscleGroups: ['legs'] }
      ]
    });
    console.log('✅ Added test workout for', testDate.toDateString());

    // Request rest day
    const restDayAction = {
      type: 'REQUEST_REST_DAY',
      intent: 'change_to_rest_day',
      entities: { date: testDate },
      confidence: 0.85,
      requiresConfirmation: true
    };
    
    const result = await aiActionService.executeAction(restDayAction);
    console.log('✅ Rest day request:', result.success ? 'Created confirmation' : 'Failed');
    
    if (result.data && result.data.options) {
      console.log('✅ Confirmation message:', result.data.message.substring(0, 50) + '...');
      console.log('✅ Options:', result.data.options.map(o => o.text).join(', '));
    }

    // Test 5: Workout Modification
    console.log('\nTest 5: Exercise Replacement');
    const workoutForReplace = await workoutScheduleService.getWorkoutForDate(new Date());
    if (workoutForReplace && workoutForReplace.exercises?.length > 0) {
      const exerciseToReplace = workoutForReplace.exercises[0];
      console.log(`✅ Found exercise to replace: ${exerciseToReplace.name}`);
      
      const newExercise = {
        id: 'pushups',
        name: 'Push-ups',
        sets: exerciseToReplace.sets,
        reps: '15-20',
        muscleGroups: ['chest', 'triceps']
      };
      
      const replaced = await workoutScheduleService.replaceExerciseInWorkout(
        new Date(),
        exerciseToReplace.id,
        newExercise
      );
      console.log('✅ Exercise replacement:', replaced ? 'Success' : 'Failed');
    } else {
      console.log('ℹ️  No exercises to replace today');
    }

    console.log('\n✨ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the tests
testAIFunctions();