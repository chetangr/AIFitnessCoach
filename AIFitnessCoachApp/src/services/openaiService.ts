import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  completeExercisesDatabase, 
  workoutPrograms, 
  searchExercises,
  WorkoutProgram,
  Exercise 
} from '../data/exercisesDatabase';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface WorkoutModification {
  action: 'create' | 'modify' | 'suggest';
  programName?: string;
  exercises?: string[]; // Exercise IDs
  duration?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  focus?: string; // muscle group or goal
  modifications?: {
    add?: string[];
    remove?: string[];
    replace?: { old: string; new: string }[];
  };
}

interface AIResponse {
  text: string;
  workoutModification?: WorkoutModification;
  shouldCreateProgram?: boolean;
}

class OpenAIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    this.initializeConversation();
    this.loadApiKey();
  }

  private async loadApiKey() {
    try {
      // First try to get from environment variables (Expo uses EXPO_PUBLIC_ prefix)
      this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || null;
      
      if (!this.apiKey || this.apiKey === 'sk-your-openai-api-key-here') {
        // Fallback to AsyncStorage for runtime configuration
        const storedKey = await AsyncStorage.getItem('openai_api_key');
        if (storedKey) {
          this.apiKey = storedKey;
        } else {
          console.warn('OpenAI API key not found. Using demo mode. Please set EXPO_PUBLIC_OPENAI_API_KEY in .env file or call setApiKey()');
          // For demo purposes, we'll generate mock responses
          this.apiKey = 'demo-mode';
        }
      }
    } catch (error) {
      console.error('Error loading API key:', error);
      this.apiKey = 'demo-mode';
    }
  }

  async setApiKey(key: string) {
    this.apiKey = key;
    await AsyncStorage.setItem('openai_api_key', key);
  }

  private initializeConversation() {
    const systemPrompt = `You are Alex, an expert AI fitness coach with advanced workout modification capabilities. You specialize in:

🏋️ Creating personalized workout plans
🔄 Modifying existing workout programs
🥗 Providing nutrition guidance  
📈 Tracking progress and motivation
💪 Exercise form and technique
🎯 Goal-specific training (weight loss, muscle gain, endurance)

WORKOUT MODIFICATION CAPABILITIES:
- Analyze user requests for workout changes
- Create custom workout programs
- Modify existing programs by adding/removing/replacing exercises
- Suggest alternative exercises based on equipment or preferences
- Adapt programs for different fitness levels

Available exercises database includes 1000+ exercises across categories:
- Chest, Back, Shoulders, Legs, Arms, Core, Cardio, Functional

When users request workout modifications:
1. Understand their specific needs (equipment, time, goals, limitations)
2. Suggest specific exercises from the database
3. Create structured workout programs
4. Explain the reasoning behind modifications

WORKOUT MODIFICATION TRIGGERS:
- "add [exercise/muscle group] to my workout"
- "create a [type] workout"
- "modify my current routine"
- "replace [exercise] with something else"
- "I need a [time] minute workout"
- "design a program for [goal]"

Your responses should be:
- Conversational and encouraging
- Practical and actionable
- Include specific exercise recommendations
- Explain the benefits of modifications
- Keep responses concise but helpful

Remember: You can actually modify and create workouts, not just give advice!`;

    this.conversationHistory = [
      { role: 'system', content: systemPrompt }
    ];
  }

  async sendMessage(message: string, _imageUri?: string): Promise<AIResponse> {
    try {
      // Check if this is a workout modification request
      const workoutModification = this.analyzeWorkoutRequest(message);
      
      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: message });

      let response: string;
      
      if (workoutModification) {
        // Handle workout modification locally with structured response
        response = await this.handleWorkoutModification(message, workoutModification);
      } else {
        // Use OpenAI API for general conversation
        response = await this.callOpenAI(this.conversationHistory);
      }

      // Add AI response to history
      this.conversationHistory.push({ role: 'assistant', content: response });

      // Keep conversation history manageable
      if (this.conversationHistory.length > 21) {
        this.conversationHistory = [
          this.conversationHistory[0],
          ...this.conversationHistory.slice(-20)
        ];
      }

      await this.saveConversation();

      return {
        text: response,
        workoutModification,
        shouldCreateProgram: workoutModification?.action === 'create'
      };
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      const fallbackResponse = await this.generateIntelligentResponse(message);
      this.conversationHistory.push({ role: 'assistant', content: fallbackResponse });
      await this.saveConversation();
      return { text: fallbackResponse };
    }
  }

  // For backward compatibility
  async sendMessageSimple(message: string, imageUri?: string): Promise<string> {
    const response = await this.sendMessage(message, imageUri);
    return response.text;
  }

  private analyzeWorkoutRequest(message: string): WorkoutModification | null {
    const lowerMessage = message.toLowerCase();
    
    // Create new workout program
    if (lowerMessage.includes('create') && (lowerMessage.includes('workout') || lowerMessage.includes('program'))) {
      return {
        action: 'create',
        focus: this.extractFocus(lowerMessage),
        level: this.extractLevel(lowerMessage),
        duration: this.extractDuration(lowerMessage)
      };
    }
    
    // Add exercises to workout
    if (lowerMessage.includes('add') && (lowerMessage.includes('workout') || lowerMessage.includes('exercise'))) {
      return {
        action: 'modify',
        modifications: {
          add: this.extractExercises(lowerMessage)
        },
        focus: this.extractFocus(lowerMessage)
      };
    }
    
    // Modify existing routine
    if ((lowerMessage.includes('modify') || lowerMessage.includes('change')) && 
        (lowerMessage.includes('routine') || lowerMessage.includes('workout'))) {
      return {
        action: 'modify',
        focus: this.extractFocus(lowerMessage)
      };
    }
    
    // Replace exercises
    if (lowerMessage.includes('replace') && lowerMessage.includes('with')) {
      return {
        action: 'modify',
        modifications: {
          replace: this.extractReplacements(lowerMessage)
        }
      };
    }
    
    // Design/plan workout
    if ((lowerMessage.includes('design') || lowerMessage.includes('plan')) && 
        (lowerMessage.includes('workout') || lowerMessage.includes('program'))) {
      return {
        action: 'create',
        focus: this.extractFocus(lowerMessage),
        level: this.extractLevel(lowerMessage),
        duration: this.extractDuration(lowerMessage)
      };
    }

    return null;
  }

  private extractFocus(message: string): string {
    const focusKeywords = {
      'chest': 'Chest',
      'back': 'Back', 
      'shoulders': 'Shoulders',
      'legs': 'Legs',
      'arms': 'Arms',
      'core': 'Core',
      'abs': 'Core',
      'cardio': 'Cardio',
      'strength': 'Strength',
      'weight loss': 'Fat Loss',
      'muscle gain': 'Muscle Gain',
      'endurance': 'Endurance'
    };

    for (const [keyword, focus] of Object.entries(focusKeywords)) {
      if (message.includes(keyword)) {
        return focus;
      }
    }
    return 'General Fitness';
  }

  private extractLevel(message: string): 'Beginner' | 'Intermediate' | 'Advanced' {
    if (message.includes('beginner') || message.includes('new') || message.includes('start')) {
      return 'Beginner';
    }
    if (message.includes('advanced') || message.includes('expert') || message.includes('hard')) {
      return 'Advanced';
    }
    return 'Intermediate';
  }

  private extractDuration(message: string): string {
    const timeMatch = message.match(/(\d+)\s*(min|minute|hour)/);
    if (timeMatch) {
      const num = parseInt(timeMatch[1]);
      const unit = timeMatch[2];
      if (unit.startsWith('min')) {
        return `${num} min`;
      } else {
        return `${num} hour${num > 1 ? 's' : ''}`;
      }
    }
    return '45 min'; // default
  }

  private extractExercises(message: string): string[] {
    // Search for exercises mentioned in the message
    const exercises: string[] = [];
    const words = message.toLowerCase().split(/\s+/);
    
    for (const exercise of completeExercisesDatabase) {
      const exerciseName = exercise.name.toLowerCase();
      if (words.some(word => exerciseName.includes(word) || word.includes(exerciseName.split(' ')[0]))) {
        exercises.push(exercise.id);
      }
    }
    
    return exercises.slice(0, 5); // Limit to 5 exercises
  }

  private extractReplacements(message: string): { old: string; new: string }[] {
    // Simple replacement extraction - can be enhanced
    return [];
  }

  private async handleWorkoutModification(message: string, modification: WorkoutModification): Promise<string> {
    switch (modification.action) {
      case 'create':
        return this.createCustomProgram(modification);
      case 'modify':
        return this.modifyExistingProgram(modification);
      case 'suggest':
        return this.suggestAlternatives(modification);
      default:
        return "I'd love to help with your workout! Can you be more specific about what you'd like to do?";
    }
  }

  private createCustomProgram(modification: WorkoutModification): string {
    const { focus, level, duration } = modification;
    
    // Find exercises that match the criteria
    let relevantExercises = completeExercisesDatabase.filter(ex => {
      if (focus && focus !== 'General Fitness') {
        return ex.category === focus || 
               ex.primaryMuscles.includes(focus) ||
               (focus === 'Fat Loss' && ex.category === 'Cardio') ||
               (focus === 'Muscle Gain' && ex.category !== 'Cardio');
      }
      return ex.difficulty === level;
    });

    if (level) {
      relevantExercises = relevantExercises.filter(ex => ex.difficulty === level);
    }

    // Select 5-8 exercises for the program
    const selectedExercises = this.selectBalancedExercises(relevantExercises, 6);
    
    if (selectedExercises.length === 0) {
      return `I'd love to create a ${focus} workout for you! However, I need a bit more information. What equipment do you have available?`;
    }

    // Create program description
    const programName = `Custom ${focus} Program`;
    const exerciseList = selectedExercises.map((ex, i) => 
      `${i + 1}. **${ex.name}** (${ex.difficulty}) - ${ex.description}`
    ).join('\n');

    // Save this as a new program (this would integrate with a program storage system)
    const newProgram: WorkoutProgram = {
      id: `custom_${Date.now()}`,
      name: programName,
      description: `Custom program focused on ${focus}`,
      duration: duration || '45 min',
      level: level || 'Intermediate',
      category: focus || 'General Fitness',
      trainer: 'AI Coach Alex',
      rating: 4.8,
      exercises: selectedExercises.map(ex => ex.id),
      daysPerWeek: 3,
      estimatedCalories: 400,
      equipment: [...new Set(selectedExercises.map(ex => ex.equipment))]
    };

    // Store the program (this would save to database/storage)
    this.saveCustomProgram(newProgram);

    return `🎉 Perfect! I've created a custom **${programName}** for you!\n\n**Program Details:**\n- Duration: ${duration}\n- Level: ${level}\n- Focus: ${focus}\n\n**Exercises (${selectedExercises.length}):**\n${exerciseList}\n\n💪 This program is designed to help you achieve your ${focus.toLowerCase()} goals. Each exercise targets the key muscle groups and provides progressive challenge.\n\n**Ready to start?** I can add this program to your schedule!`;
  }

  private modifyExistingProgram(modification: WorkoutModification): string {
    const { modifications, focus } = modification;
    
    if (modifications?.add) {
      const addedExercises = modifications.add.map(id => {
        const exercise = completeExercisesDatabase.find(ex => ex.id === id);
        return exercise ? exercise.name : 'Unknown Exercise';
      }).filter(Boolean);

      if (addedExercises.length > 0) {
        return `✅ Great! I've added these exercises to your routine:\n\n${addedExercises.map((name, i) => `${i + 1}. **${name}**`).join('\n')}\n\n💡 **Why these work well:**\nThese exercises complement your existing routine and will help target ${focus || 'your goals'} more effectively.\n\n**Updated routine is ready!** Want me to show you the complete modified program?`;
      }
    }

    if (focus) {
      const suggestedExercises = searchExercises('', focus).slice(0, 3);
      const exerciseList = suggestedExercises.map((ex, i) => 
        `${i + 1}. **${ex.name}** - ${ex.description}`
      ).join('\n');

      return `🔄 Perfect! I can help modify your routine to focus more on ${focus}.\n\n**Here are some excellent ${focus} exercises I recommend adding:**\n\n${exerciseList}\n\n💪 **Benefits:**\n- Better muscle balance\n- Improved ${focus.toLowerCase()} development\n- More variety to prevent plateaus\n\nWould you like me to create a modified program with these exercises?`;
    }

    return `I'd love to help modify your workout routine! What specific changes would you like to make? For example:\n\n- Add more chest exercises\n- Replace cardio with strength training\n- Make it more beginner-friendly\n- Focus on a specific muscle group`;
  }

  private suggestAlternatives(modification: WorkoutModification): string {
    const { focus } = modification;
    const alternatives = searchExercises('', focus).slice(0, 4);
    
    const exerciseList = alternatives.map((ex, i) => 
      `${i + 1}. **${ex.name}** (${ex.equipment}) - ${ex.difficulty}`
    ).join('\n');

    return `💡 Here are some great ${focus || 'exercise'} alternatives:\n\n${exerciseList}\n\nEach of these exercises offers unique benefits and can be adapted to your fitness level. Which one interests you most?`;
  }

  private selectBalancedExercises(exercises: Exercise[], count: number): Exercise[] {
    // Simple selection algorithm - can be enhanced
    const categories = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];
    const selected: Exercise[] = [];
    
    // Try to get one exercise from each category
    for (const category of categories) {
      const categoryExercises = exercises.filter(ex => ex.category === category);
      if (categoryExercises.length > 0 && selected.length < count) {
        selected.push(categoryExercises[Math.floor(Math.random() * categoryExercises.length)]);
      }
    }
    
    // Fill remaining slots randomly
    while (selected.length < count && selected.length < exercises.length) {
      const remaining = exercises.filter(ex => !selected.includes(ex));
      if (remaining.length > 0) {
        selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
      } else {
        break;
      }
    }
    
    return selected;
  }

  private async saveCustomProgram(program: WorkoutProgram) {
    try {
      const existingPrograms = await AsyncStorage.getItem('customPrograms');
      const programs = existingPrograms ? JSON.parse(existingPrograms) : [];
      programs.push(program);
      await AsyncStorage.setItem('customPrograms', JSON.stringify(programs));
      console.log('Custom program saved:', program.name);
    } catch (error) {
      console.error('Error saving custom program:', error);
    }
  }

  // Method to retrieve custom programs
  async getCustomPrograms(): Promise<WorkoutProgram[]> {
    try {
      const saved = await AsyncStorage.getItem('customPrograms');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading custom programs:', error);
      return [];
    }
  }

  private async generateIntelligentResponse(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Simulate thinking time for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || message.length < 10) {
      const greetings = [
        "Hey there! 💪 I'm Alex, your AI fitness coach. Ready to crush some fitness goals today?",
        "Hello! 🔥 Great to see you! What aspect of your fitness journey can I help you with?",
        "Hi! 🌟 I'm excited to help you on your fitness journey. What would you like to work on today?",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Are you real? responses
    if (lowerMessage.includes('are you real') || lowerMessage.includes('real person')) {
      return "I'm Alex, your AI fitness coach! 🤖💪 While I'm not human, I'm powered by advanced AI and trained on tons of fitness knowledge. I'm here 24/7 to help you reach your goals! Think of me as your personal trainer who never sleeps 😄\n\nWhat fitness challenge can I help you tackle today?";
    }

    // Workout creation with follow-up questions
    if (lowerMessage.includes('workout') && (lowerMessage.includes('create') || lowerMessage.includes('plan') || lowerMessage.includes('routine'))) {
      return "Perfect! Let's create an amazing workout plan for you! 🏋️‍♀️\n\nTo design the best program, I need to know:\n\n🎯 **Your main goal**: Weight loss, muscle gain, or general fitness?\n⚡ **Your experience**: Beginner, intermediate, or advanced?\n📅 **Time available**: How many days per week?\n🏠 **Equipment**: Gym access or home workouts?\n\nTell me about these and I'll create something perfect for you!";
    }

    // Weight loss with specific advice
    if (lowerMessage.includes('lose weight') || lowerMessage.includes('weight loss') || lowerMessage.includes('fat loss')) {
      return "Great goal! 🔥 Weight loss success comes from the right combination:\n\n**🏃‍♀️ Cardio (3-4x/week):**\n- HIIT: 20-30 min sessions\n- Steady cardio: 30-45 min\n\n**💪 Strength Training (3x/week):**\n- Builds muscle & boosts metabolism\n- Full body or upper/lower split\n\n**🥗 Nutrition Keys:**\n- Calorie deficit: 300-500 below maintenance\n- High protein: 0.8-1g per lb bodyweight\n- Lots of veggies and water!\n\nWhat's your current activity level? I can create a specific plan!";
    }

    // Muscle gain
    if (lowerMessage.includes('muscle') || lowerMessage.includes('gain') || lowerMessage.includes('bulk') || lowerMessage.includes('strong')) {
      return "Awesome! Building muscle is one of my favorite topics! 💪\n\n**🏋️ Training Essentials:**\n- Progressive overload (gradually increase weight/reps)\n- Compound movements: squats, deadlifts, bench press\n- Train each muscle 2x per week\n- 6-20 rep range for hypertrophy\n\n**🥩 Nutrition Must-Haves:**\n- Protein: 0.8-1g per lb bodyweight\n- Slight calorie surplus (200-500 above maintenance)\n- Carbs around workouts for energy\n\n**😴 Recovery:**\n- 7-9 hours sleep\n- Rest days between training same muscles\n\nHow many days can you train per week?";
    }

    // Specific exercise requests
    if (lowerMessage.includes('abs') || lowerMessage.includes('core') || lowerMessage.includes('stomach')) {
      return "Let's build that core strength! 🔥 Here's my proven abs routine:\n\n**💥 4-Week Abs Blast:**\n\n**Week 1-2 (3x/week):**\n- Plank: 3 x 30-45 sec\n- Bicycle crunches: 3 x 15 each side\n- Dead bugs: 3 x 10 each side\n- Russian twists: 3 x 20\n\n**Week 3-4:**\n- Increase plank to 60+ sec\n- Add mountain climbers: 3 x 30 sec\n- Hollow body hold: 3 x 20 sec\n\n**💡 Pro tip:** Abs are revealed through fat loss! Combine this with cardio and proper nutrition.\n\nReady to start? Which exercise feels most challenging for you?";
    }

    // Nutrition questions
    if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('eat') || lowerMessage.includes('food')) {
      return "Nutrition is 70% of your results! 🥗 Let me break it down:\n\n**🍽️ Meal Structure:**\n- Protein at every meal (palm-sized portion)\n- Complex carbs (fist-sized)\n- Healthy fats (thumb-sized)\n- Lots of colorful veggies!\n\n**⏰ Timing Tips:**\n- Eat every 3-4 hours\n- Pre-workout: carbs for energy\n- Post-workout: protein + carbs within 30 min\n\n**💧 Hydration:**\n- Half your body weight in ounces of water\n- Extra 16-20oz per hour of exercise\n\nWhat's your biggest nutrition challenge? Meal prep? Cravings? I can help!";
    }

    // Exercise form and technique
    if (lowerMessage.includes('form') || lowerMessage.includes('technique') || lowerMessage.includes('how to')) {
      return "Perfect form prevents injury and maximizes results! 💯\n\n**🎯 Universal Form Principles:**\n- Start with lighter weight to master technique\n- Control the negative (lowering) portion\n- Full range of motion when possible\n- Breathe: exhale on exertion, inhale on release\n- Core engaged throughout\n\n**🔍 Self-Check:**\n- Record yourself from the side\n- Start slow, focus on feeling the right muscles\n- If form breaks down, reduce weight or reps\n\nWhich specific exercise would you like form tips for? I can give you detailed cues!";
    }

    // Motivation and encouragement
    if (lowerMessage.includes('motivat') || lowerMessage.includes('tired') || lowerMessage.includes('hard') || lowerMessage.includes('difficult')) {
      return "I hear you! 💪 Remember, every champion was once a beginner who refused to give up!\n\n**🌟 Quick Motivation Boost:**\n- You've already started - that's the hardest part!\n- Progress isn't always visible day-to-day\n- Small consistent actions create big results\n- Your future self will thank you\n\n**💡 When motivation is low:**\n- Just commit to 10 minutes\n- Focus on how you feel AFTER exercising\n- Remember your 'why' - what started this journey?\n\nYou've got this! What's one small thing you can do today to move forward?";
    }

    // Progress tracking
    if (lowerMessage.includes('track') || lowerMessage.includes('progress') || lowerMessage.includes('measure')) {
      return "Tracking progress keeps you motivated and on course! 📈\n\n**📊 Best Ways to Track:**\n\n**🏋️ Performance:**\n- Weights lifted (reps x sets x weight)\n- Workout duration\n- Exercises completed\n\n**📐 Body Changes:**\n- Progress photos (front, side, back)\n- Body measurements (waist, chest, arms)\n- How clothes fit\n\n**⚡ Energy & Wellness:**\n- Sleep quality (1-10 scale)\n- Energy levels throughout day\n- Mood and confidence\n\n**💡 Pro tip:** The scale can be misleading! Muscle weighs more than fat, so use multiple metrics.\n\nWhat would you like to start tracking first?";
    }

    // General fitness advice
    const generalResponses = [
      "That's a great question! 🤔 Every fitness journey is unique. Here's what I'd focus on:\n\n✅ **Start where you are** - don't compare to others\n✅ **Consistency over perfection** - 80% effort daily beats 100% effort occasionally\n✅ **Listen to your body** - rest when needed\n✅ **Celebrate small wins** - they add up to big results!\n\nWhat specific area would you like to dive deeper into?",
      
      "I love your enthusiasm! 🔥 Here's my philosophy:\n\n**🎯 Focus on the fundamentals:**\n- Move your body daily (even just walking!)\n- Eat whole foods most of the time\n- Get quality sleep\n- Stay hydrated\n- Have fun with it!\n\n**💪 Remember:** The best workout is the one you'll actually do consistently.\n\nWhat type of movement do you enjoy most?",
      
      "Excellent! Let me help you with that! 🌟\n\n**🚀 Quick Action Steps:**\n1. Set one specific, achievable goal\n2. Plan when you'll work out (schedule it!)\n3. Prepare everything the night before\n4. Start with just 15-20 minutes\n5. Track your progress somehow\n\n**💡 Success Secret:** Focus on building the habit first, results will follow!\n\nWhat's your biggest obstacle to staying consistent?"
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }

  private async callOpenAI(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Demo mode fallback
    if (this.apiKey === 'demo-mode') {
      const lastMessage = messages[messages.length - 1]?.content || '';
      return await this.generateIntelligentResponse(lastMessage);
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  private async saveConversation() {
    try {
      await AsyncStorage.setItem('aiConversation', JSON.stringify(this.conversationHistory));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  async loadConversation() {
    try {
      const saved = await AsyncStorage.getItem('aiConversation');
      if (saved) {
        this.conversationHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      this.initializeConversation();
    }
  }

  clearHistory() {
    this.initializeConversation();
    AsyncStorage.removeItem('aiConversation');
  }
}

export const openaiService = new OpenAIService();