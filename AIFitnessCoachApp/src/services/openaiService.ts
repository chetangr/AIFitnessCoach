import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  text: string;
  workoutModification?: null; // Simplified - LLM handles everything
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
    const systemPrompt = `You are Alex, an expert AI fitness coach with complete access to the user's workout schedule and training history. You provide REAL-TIME, personalized fitness coaching through natural conversation.

CORE CAPABILITIES:
🏋️ Creating personalized workout plans
🔄 Modifying existing workout programs  
📅 Accessing current workout schedules and today's training
🥗 Providing nutrition guidance
📈 Tracking progress and motivation
💪 Exercise form and technique
🎯 Goal-specific training (weight loss, muscle gain, endurance)
🏥 Injury assessment and workout modifications

WORKOUT SCHEDULE AWARENESS:
- You have full access to the user's weekly workout schedule
- When users ask about "today's workout" or "what's on my schedule", refer to the provided workout context
- Monday/Wednesday/Friday: Strength training (Chest & Triceps, Back & Biceps, Legs & Glutes)
- Tuesday/Thursday: Functional training (Shoulders & Abs, Full Body HIIT)
- Saturday: Recovery (Yoga & Stretching)
- Sunday: Rest day

INJURY & PAIN RESPONSE PROTOCOL:
When users mention pain, injury, or discomfort:
1. Express genuine concern for their wellbeing
2. Provide immediate care recommendations (rest, ice, gentle movement)
3. List today's scheduled exercises with modification suggestions
4. Offer specific alternative exercises that avoid the affected area
5. Recommend professional medical consultation if needed
6. Use emojis and clear formatting for easy reading

WORKOUT MODIFICATION CAPABILITIES:
- Analyze user requests for workout changes
- Create custom workout programs with specific exercises
- Modify existing programs by adding/removing/replacing exercises
- Suggest alternative exercises based on equipment, injuries, or preferences
- Adapt programs for different fitness levels and time constraints
- Always reference the current day's scheduled workout when making suggestions

RESPONSE STYLE:
- Conversational, encouraging, and empathetic
- Use relevant emojis to enhance readability
- Provide specific, actionable advice
- Include exercise names, sets, reps, and modifications
- Format responses with clear sections using **bold** headers
- Keep responses helpful but concise
- Always prioritize user safety and wellbeing
- When discussing today's workout, be specific about the scheduled exercises

EXERCISE DATABASE:
You have access to 1000+ exercises across all categories. When suggesting modifications, provide specific exercise names, rep ranges, and explain why they're suitable alternatives.

IMPORTANT: When users ask about their workout schedule, training plans, or "what's on today", always refer to the provided workout context data to give accurate, personalized responses about their actual scheduled workouts.

Remember: You're not just giving advice - you're actively helping users with their ACTUAL scheduled workouts and providing real-time modifications based on their current training plan.`;

    this.conversationHistory = [
      { role: 'system', content: systemPrompt }
    ];
  }

  async sendMessage(message: string, _imageUri?: string): Promise<AIResponse> {
    try {
      // Add workout context for workout-related queries
      let enhancedMessage = message;
      const isWorkoutQuery = this.containsWorkoutKeywords(message);
      
      if (isWorkoutQuery) {
        const todaysWorkouts = await this.getTodaysWorkoutsForContext();
        enhancedMessage = `${message}\n\n[WORKOUT CONTEXT: Today's scheduled exercises: ${todaysWorkouts}]`;
      }
      
      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: enhancedMessage });

      let response: string;
      
      // Enhanced context injection for injury/pain keywords
      const enhancedMessages = [...this.conversationHistory];
      let contextAdded = false;
      
      // Check for injury/pain keywords and add context
      if (this.containsInjuryKeywords(message)) {
        const bodyPart = this.extractBodyPart(message.toLowerCase());
        const todaysWorkouts = await this.getTodaysWorkoutsForContext();
        enhancedMessages[enhancedMessages.length - 1] = {
          role: 'user',
          content: `${message}\n\n[INJURY CONTEXT: User mentioned ${bodyPart} discomfort. Today's scheduled exercises: ${todaysWorkouts}. Please provide immediate care advice and suggest exercise modifications to avoid the affected area.]`
        };
        contextAdded = true;
      }
      
      // Call OpenAI API - always use LLM, never fallback
      response = await this.callOpenAI(contextAdded ? enhancedMessages : this.conversationHistory);

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
        workoutModification: null, // Let LLM handle workout modifications naturally
        shouldCreateProgram: false
      };
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      console.error('API Key present:', !!this.apiKey);
      console.error('API Key value:', this.apiKey?.substring(0, 7) + '...');
      
      // Re-throw the error instead of providing fallback response
      throw error;
    }
  }

  // For backward compatibility
  async sendMessageSimple(message: string, imageUri?: string): Promise<string> {
    try {
      const response = await this.sendMessage(message, imageUri);
      return response.text;
    } catch (error) {
      // Re-throw the error to let the UI handle it properly
      throw error;
    }
  }


  private extractBodyPart(message: string): string {
    const bodyParts = {
      'neck': 'neck',
      'back': 'back',
      'shoulder': 'shoulder',
      'knee': 'knee',
      'ankle': 'ankle',
      'wrist': 'wrist',
      'elbow': 'elbow',
      'hip': 'hip',
      'chest': 'chest',
      'arm': 'arm',
      'leg': 'leg'
    };

    for (const [keyword, part] of Object.entries(bodyParts)) {
      if (message.includes(keyword)) {
        return part;
      }
    }
    return 'area';
  }

  private containsWorkoutKeywords(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const workoutKeywords = [
      'workout', 'exercise', 'training', 'fitness', 'gym', 'today',
      'schedule', 'plan', 'routine', 'what\'s on', 'what am i doing',
      'chest', 'back', 'legs', 'shoulders', 'arms', 'triceps', 'biceps',
      'squats', 'deadlift', 'bench', 'press', 'curl', 'push', 'pull'
    ];
    
    return workoutKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private containsInjuryKeywords(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const injuryKeywords = [
      'pain', 'hurt', 'injury', 'sore', 'ache', 'pulled', 'strain', 
      'neck', 'back', 'shoulder', 'knee', 'ankle', 'wrist', 'elbow', 
      'hip', 'chest', 'arm', 'leg', 'sprain', 'bruise', 'tender'
    ];
    
    return injuryKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async getTodaysWorkoutsForContext(): Promise<string> {
    try {
      // Get today's date
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Get workout schedule based on day (mimicking the timeline logic)
      let todaysWorkouts: string[] = [];
      
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) { // Mon, Wed, Fri
        const workoutTypes = ['Chest & Triceps', 'Back & Biceps', 'Legs & Glutes'];
        const workoutIndex = dayOfWeek === 1 ? 0 : dayOfWeek === 3 ? 1 : 2;
        const workoutType = workoutTypes[workoutIndex];
        
        if (workoutType === 'Chest & Triceps') {
          todaysWorkouts = [
            "Bench Press (4×8-10)",
            "Incline Dumbbell Press (3×10-12)",
            "Chest Flyes (3×12-15)",
            "Tricep Dips (3×12-15)",
            "Overhead Tricep Extension (3×10-12)",
            "Push-ups (3×max)"
          ];
        } else if (workoutType === 'Back & Biceps') {
          todaysWorkouts = [
            "Pull-ups/Lat Pulldowns (4×8-10)",
            "Bent-over Rows (3×10-12)",
            "Seated Cable Rows (3×12-15)",
            "Bicep Curls (3×12-15)",
            "Hammer Curls (3×10-12)",
            "Face Pulls (3×15-20)"
          ];
        } else if (workoutType === 'Legs & Glutes') {
          todaysWorkouts = [
            "Squats (4×8-10)",
            "Romanian Deadlifts (3×10-12)",
            "Bulgarian Split Squats (3×12 each leg)",
            "Hip Thrusts (3×12-15)",
            "Calf Raises (3×15-20)",
            "Leg Curls (3×12-15)"
          ];
        }
      } else if (dayOfWeek === 2 || dayOfWeek === 4) { // Tue, Thu
        if (dayOfWeek === 2) { // Tuesday - Shoulders & Abs
          todaysWorkouts = [
            "Overhead Press (4×8-10)",
            "Lateral Raises (3×12-15)",
            "Rear Delt Flyes (3×12-15)",
            "Plank (3×30-60s)",
            "Russian Twists (3×20)",
            "Mountain Climbers (3×30s)"
          ];
        } else { // Thursday - Full Body HIIT
          todaysWorkouts = [
            "Burpees (4×10)",
            "Jump Squats (4×15)",
            "Push-up to T (4×10)",
            "High Knees (4×30s)",
            "Plank Jacks (4×15)",
            "Mountain Climbers (4×30s)"
          ];
        }
      } else if (dayOfWeek === 6) { // Saturday - Yoga & Stretching
        todaysWorkouts = [
          "Sun Salutation (5 rounds)",
          "Warrior Poses (hold 30s each)",
          "Downward Dog (hold 60s)",
          "Child's Pose (hold 60s)",
          "Pigeon Pose (hold 30s each side)",
          "Savasana (5 minutes)"
        ];
      } else { // Sunday - Rest Day
        return "Today is your rest day! Perfect time for recovery, light stretching, or a gentle walk.";
      }
      
      if (todaysWorkouts.length === 0) {
        return "No specific workout scheduled for today. Would you like me to suggest something?";
      }
      
      return todaysWorkouts.join(", ");
      
    } catch (error) {
      console.error('Error getting today\'s workouts:', error);
      return "Unable to retrieve today's workout schedule. Would you like me to suggest a workout?";
    }
  }


  private async callOpenAI(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set your API key in the app settings.');
    }

    // Check if API key is properly configured
    if (this.apiKey === 'demo-mode' || this.apiKey === 'sk-your-openai-api-key-here') {
      throw new Error('Please configure a valid OpenAI API key. Demo mode is not available for live responses.');
    }

    console.log('Calling OpenAI API with messages:', messages.length);
    
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
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    console.log('OpenAI API response received, length:', aiResponse.length);
    
    return aiResponse;
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