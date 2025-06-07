#!/usr/bin/env node

/**
 * Test Workout Actions
 * Script to test if workout actions are working properly
 */

const testText = `I've analyzed your request and here are some challenging workouts to increase your difficulty:

1. **Squats with Barbell**: 4 sets of 6-8 reps. Focus on adding a challenging weight that you can handle with proper form.

2. **Leg Press**: Increase weight and aim for 4 sets of 8-12 reps.

3. **Walking Lunges with Dumbbells**: Add some extra weight and try for 4 sets of 12 steps each leg.

Safety first! Ensure you're comfortable with the added weights, and don't hesitate to adjust as necessary. You've got the strength to conquer this advanced workout! 💪🔥`;

// Test workout parsing
const parseWorkoutSuggestions = (text) => {
  const exercises = [];
  
  // Pattern to match workout suggestions
  const patterns = [
    /(\d+)\.\s*\*\*([^*]+)\*\*:\s*([^\.]+)/gi,  // "1. **Squats with Barbell**: 4 sets of 6-8 reps"
    /•\s*\*\*([^*]+)\*\*:\s*([^\.]+)/gi,         // "• **Exercise Name**: details"
  ];

  for (const pattern of patterns) {
    let match;
    const patternCopy = new RegExp(pattern);
    while ((match = patternCopy.exec(text)) !== null) {
      const exerciseName = match[2] || match[1];
      const details = match[3] || match[2];
      
      // Parse sets and reps
      const setsMatch = details.match(/(\d+)\s*sets?/i);
      const repsMatch = details.match(/(\d+)[-\s]*(\d+)?\s*reps?/i);
      
      exercises.push({
        id: `exercise_${Date.now()}_${exercises.length}`,
        name: exerciseName.trim(),
        sets: setsMatch ? parseInt(setsMatch[1]) : 3,
        reps: repsMatch ? (repsMatch[2] ? `${repsMatch[1]}-${repsMatch[2]}` : repsMatch[1]) : '10',
        details: details.trim()
      });
    }
  }

  return exercises;
};

// Test pattern detection
const hasWorkoutSuggestions = (message) => {
  const workoutPatterns = [
    /(\d+)\.\s*\*\*([^*]+)\*\*:/gi,
    /•\s*\*\*([^*]+)\*\*:/gi,
    /[-]\s*\*\*([^*]+)\*\*:/gi,
    /(\d+)\.\s+([A-Z][^:]+):/gi,
    /workout|exercise|sets|reps/gi,
  ];
  
  for (const pattern of workoutPatterns) {
    if (pattern.test(message)) {
      return true;
    }
  }
  return false;
};

// Test pain detection
const hasPainContext = (message) => {
  const painKeywords = /pain|injury|hurt|sore|strain|sprain|discomfort|ache/gi;
  return painKeywords.test(message);
};

console.log('🧪 Testing Workout Action Parsing\n');

// Test workout parsing
const exercises = parseWorkoutSuggestions(testText);
console.log(`✅ Found ${exercises.length} exercises:`);
exercises.forEach((ex, i) => {
  console.log(`   ${i + 1}. ${ex.name}: ${ex.sets} sets x ${ex.reps} reps`);
});

console.log('\n🧪 Testing Pattern Detection\n');

// Test pattern detection
console.log('Has workout suggestions:', hasWorkoutSuggestions(testText) ? '✅ Yes' : '❌ No');

// Test pain detection
const painText = "I'm experiencing some knee pain during squats";
console.log('Has pain context (workout text):', hasPainContext(testText) ? '✅ Yes' : '❌ No');
console.log('Has pain context (pain text):', hasPainContext(painText) ? '✅ Yes' : '❌ No');

console.log('\n✅ All tests complete!');