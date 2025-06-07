import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { Platform } from 'react-native';

class AICoachService {
  private conversationHistory: any[] = [];
  private userContext: any = null;

  async loadUserContext() {
    try {
      // Load user profile data
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        this.userContext = JSON.parse(userDataStr);
      }
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  }

  async sendMessage(message: string, imageUri?: string): Promise<string> {
    // Ensure user context is loaded
    if (!this.userContext) {
      await this.loadUserContext();
    }
    try {
      // Get user token
      const token = await AsyncStorage.getItem('token');
      
      // For backend API calls
      if (API_BASE_URL && token && token !== 'demo-token') {
        // Prepare form data for image upload
        const formData = new FormData();
        formData.append('message', message);
        formData.append('conversationHistory', JSON.stringify(this.conversationHistory));
        
        if (imageUri) {
          formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'photo.jpg',
          } as any);
        }

        // Use proper API endpoint based on platform
        const apiUrl = Platform.OS === 'android' 
          ? API_BASE_URL.replace('localhost', '10.0.2.2')
          : API_BASE_URL;

        const response = await fetch(`${apiUrl}${API_ENDPOINTS.aiChat}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': imageUri ? 'multipart/form-data' : 'application/json',
          },
          body: imageUri ? formData : JSON.stringify({
            message,
            conversationHistory: this.conversationHistory,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Store conversation history
          this.conversationHistory.push({ role: 'user', content: message });
          this.conversationHistory.push({ role: 'assistant', content: data.response });
          
          // Limit history to last 10 messages for context
          if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
          }
          
          return data.response;
        }
      }

      // Enhanced fallback responses
      return this.generateLocalResponse(message, imageUri);
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.generateLocalResponse(message, imageUri);
    }
  }

  private generateLocalResponse(message: string, imageUri?: string): string {
    if (imageUri) {
      return "I can see you've uploaded an image! While I can't analyze images in the local mode, I can help you with:\n\n• Form checks and technique tips\n• Exercise recommendations\n• Workout plans\n• Nutrition advice\n\nWhat would you like to know about?";
    }
    const lowerMessage = message.toLowerCase();
    
    // Get user context for personalized responses
    const fitnessLevel = this.userContext?.fitnessLevel || 'intermediate';
    const goals = this.userContext?.goals || ['general fitness'];
    const name = this.userContext?.name || 'there';

    // Workout creation
    if (lowerMessage.includes('workout') && (lowerMessage.includes('create') || lowerMessage.includes('plan'))) {
      return "I'll create a personalized workout plan for you! Let me know:\n\n1. What's your fitness goal? (muscle gain, weight loss, endurance)\n2. How many days per week can you train?\n3. Do you have access to a gym or prefer home workouts?\n\nBased on your answers, I'll design the perfect plan for you!";
    }

    // Weight loss
    if (lowerMessage.includes('lose weight') || lowerMessage.includes('weight loss')) {
      return "For weight loss, here's what I recommend:\n\n🔥 **Exercise**: Combine cardio (3-4x/week) with strength training (2-3x/week)\n🥗 **Nutrition**: Create a moderate calorie deficit (300-500 calories)\n💧 **Hydration**: Drink at least 8 glasses of water daily\n😴 **Rest**: Get 7-9 hours of quality sleep\n\nWould you like me to create a specific weight loss workout plan?";
    }

    // Muscle gain
    if (lowerMessage.includes('muscle') || lowerMessage.includes('gain') || lowerMessage.includes('bulk')) {
      return "To build muscle effectively:\n\n💪 **Progressive Overload**: Gradually increase weights/reps\n🍖 **Protein**: Aim for 0.8-1g per pound of body weight\n🏋️ **Compound Exercises**: Focus on squats, deadlifts, bench press\n🔄 **Recovery**: Rest each muscle group 48-72 hours\n\nShall I design a muscle-building program for you?";
    }

    // Abs/Core
    if (lowerMessage.includes('abs') || lowerMessage.includes('core') || lowerMessage.includes('six pack')) {
      return "For strong, visible abs:\n\n🎯 **Core Exercises**:\n- Planks (3 sets, 60s)\n- Russian Twists (3x20)\n- Bicycle Crunches (3x25)\n- Leg Raises (3x15)\n\n🥗 **Remember**: Abs are made in the kitchen! You need low body fat (10-15% for men, 16-20% for women) to see definition.\n\nWant a complete 30-day abs challenge?";
    }

    // Nutrition - Personalized based on goals
    if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('eat')) {
      const isWeightLoss = goals.some((g: string) => g.toLowerCase().includes('weight loss') || g.toLowerCase().includes('lose weight'));
      const isMuscleGain = goals.some((g: string) => g.toLowerCase().includes('muscle') || g.toLowerCase().includes('gain'));
      
      let nutritionAdvice = `Hey ${name}! Based on your ${fitnessLevel} fitness level`;
      
      if (isWeightLoss) {
        nutritionAdvice += " and weight loss goals:\n\n📉 **Calorie Deficit**: Aim for 300-500 calorie deficit\n🥗 **High Protein**: 0.8-1g per lb bodyweight to preserve muscle\n🥦 **Volume Eating**: Fill up on low-calorie, high-volume foods\n⏰ **Intermittent Fasting**: Consider 16:8 IF for easier adherence\n💧 **Hydration**: Drink water before meals to help with satiety";
      } else if (isMuscleGain) {
        nutritionAdvice += " and muscle gain goals:\n\n📈 **Calorie Surplus**: Eat 200-300 calories above maintenance\n🍖 **Protein Power**: 1g per lb bodyweight minimum\n🍚 **Carb Timing**: Eat carbs around workouts for energy\n🥜 **Healthy Fats**: 25-30% of total calories\n🍌 **Post-Workout**: Protein + carbs within 2 hours";
      } else {
        nutritionAdvice += ":\n\n🥦 **Whole Foods**: Base your diet on unprocessed foods\n⚖️ **Balanced Meals**: Include protein, carbs, and healthy fats\n⏰ **Meal Timing**: Eat every 3-4 hours to maintain energy\n💧 **Hydration**: Drink water before, during, and after workouts";
      }
      
      return nutritionAdvice + "\n\nWould you like specific meal suggestions for today?";
    }

    // Exercises
    if (lowerMessage.includes('exercise') || lowerMessage.includes('best')) {
      return "Here are some of the best exercises by muscle group:\n\n🏋️ **Chest**: Bench press, push-ups, dips\n💪 **Back**: Pull-ups, rows, deadlifts\n🦵 **Legs**: Squats, lunges, leg press\n🤸 **Core**: Planks, crunches, mountain climbers\n\nWhich muscle group would you like to focus on?";
    }

    // Schedule queries
    if (lowerMessage.includes('schedule') || lowerMessage.includes('today') || lowerMessage.includes('what should i do')) {
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      return `Happy ${dayOfWeek}, ${name}! Based on your ${fitnessLevel} level and goals (${goals.join(', ')}), here's what I recommend:\n\n${this.getScheduleRecommendation(dayOfWeek, fitnessLevel, goals)}\n\nRemember to listen to your body and adjust intensity as needed!`;
    }

    // Default response - Personalized greeting
    return `Hey ${name}! I'm your AI fitness coach, ready to help you with your ${goals.join(' and ')} goals. As a${fitnessLevel === 'advanced' ? 'n' : ''} ${fitnessLevel} athlete, I can assist you with:\n\n• Creating personalized workout plans\n• Exercise form and technique\n• Nutrition advice tailored to your goals\n• Recovery strategies\n• Progress tracking\n\nWhat would you like to work on today?`;
  }
  
  private getScheduleRecommendation(day: string, level: string, goals: string[]): string {
    const isRestDay = day === 'Sunday' || day === 'Wednesday';
    
    if (isRestDay) {
      return "🧘‍♀️ **Rest Day**:\n• Light stretching or yoga (15-20 min)\n• Focus on nutrition and hydration\n• Optional: 20-30 min walk\n• Foam rolling for recovery";
    }
    
    const workoutSplit: { [key: string]: string } = {
      'Monday': "🏋️ **Upper Body Push** (Chest, Shoulders, Triceps)",
      'Tuesday': "🦵 **Lower Body** (Quads, Hamstrings, Glutes)",
      'Thursday': "💪 **Upper Body Pull** (Back, Biceps)",
      'Friday': "🏃 **Cardio & Core**",
      'Saturday': "💥 **Full Body HIIT**"
    };
    
    return workoutSplit[day] || "🏋️ **Active Recovery** - Light activity of your choice";
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const aiCoachService = new AICoachService();