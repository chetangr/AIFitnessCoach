import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
      
      if (!this.apiKey) {
        // Fallback to AsyncStorage for runtime configuration
        const storedKey = await AsyncStorage.getItem('openai_api_key');
        if (storedKey) {
          this.apiKey = storedKey;
        } else {
          console.warn('OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in .env file or call setApiKey()');
        }
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  }

  async setApiKey(key: string) {
    this.apiKey = key;
    await AsyncStorage.setItem('openai_api_key', key);
  }

  private initializeConversation() {
    const systemPrompt = `You are Alex, an expert AI fitness coach with a friendly, motivational personality. You specialize in:

🏋️ Creating personalized workout plans
🥗 Providing nutrition guidance  
📈 Tracking progress and motivation
💪 Exercise form and technique
🎯 Goal-specific training (weight loss, muscle gain, endurance)

Your responses should be:
- Conversational and encouraging
- Practical and actionable
- Tailored to the user's fitness level
- Include relevant emojis
- Keep responses concise but helpful

When users ask about workouts, always ask about their:
- Current fitness level
- Available equipment
- Time constraints
- Specific goals

Remember: You're not just an information source, you're a supportive coach who builds confidence and helps users achieve their fitness goals!`;

    this.conversationHistory = [
      { role: 'system', content: systemPrompt }
    ];
  }

  async sendMessage(message: string, _imageUri?: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: message });

      // Use actual OpenAI API
      const response = await this.callOpenAI(this.conversationHistory);

      // Add AI response to history
      this.conversationHistory.push({ role: 'assistant', content: response });

      // Keep conversation history manageable (last 20 messages)
      if (this.conversationHistory.length > 21) { // 20 + system message
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-20)
        ];
      }

      // Save conversation to local storage
      await this.saveConversation();

      return response;
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      // Fallback to local intelligent response
      const fallbackResponse = await this.generateIntelligentResponse(message);
      this.conversationHistory.push({ role: 'assistant', content: fallbackResponse });
      await this.saveConversation();
      return fallbackResponse;
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