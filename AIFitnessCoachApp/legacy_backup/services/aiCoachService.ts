import api from './api';
import {
  CoachingMessage,
  CoachPersonality,
  WorkoutPlan,
  ApiResponse,
} from '@/types/models';

interface ChatRequest {
  message: string;
  personality: CoachPersonality;
  context?: {
    currentGoals?: string[];
    recentWorkouts?: string[];
    userMood?: string;
  };
}

interface ChatResponse {
  message: string;
  workoutSuggestion?: WorkoutPlan;
  metadata?: {
    motivationalTone?: 'high' | 'medium' | 'low';
    suggestedExercises?: string[];
  };
}

interface CoachPersonalityConfig {
  name: string;
  avatar: string;
  description: string;
  tone: string;
  motivationStyle: string;
}

export const COACH_PERSONALITIES: Record<CoachPersonality, CoachPersonalityConfig> = {
  [CoachPersonality.EMMA]: {
    name: 'Emma Encourage',
    avatar: '🤗',
    description: 'Supportive and understanding coach who celebrates every achievement',
    tone: 'warm and encouraging',
    motivationStyle: 'positive reinforcement',
  },
  [CoachPersonality.MAX]: {
    name: 'Max Power',
    avatar: '💪',
    description: 'High-energy coach who pushes you to your limits',
    tone: 'intense and challenging',
    motivationStyle: 'aggressive motivation',
  },
  [CoachPersonality.DR_PROGRESS]: {
    name: 'Dr. Progress',
    avatar: '📊',
    description: 'Methodical coach focused on consistent improvement',
    tone: 'analytical and steady',
    motivationStyle: 'data-driven encouragement',
  },
};

class AICoachService {
  async sendMessage(
    message: string,
    personality: CoachPersonality,
    sessionId?: string,
  ): Promise<ApiResponse<ChatResponse>> {
    const request: ChatRequest = {
      message,
      personality,
      context: {
        // Add user context here
      },
    };

    return api.post<ChatResponse>('/coach/chat', {
      ...request,
      session_id: sessionId,
    });
  }

  async getCoachingHistory(
    sessionId?: string,
    limit: number = 50,
  ): Promise<ApiResponse<CoachingMessage[]>> {
    return api.get<CoachingMessage[]>('/coach/messages', {
      params: { session_id: sessionId, limit },
    });
  }

  async startNewSession(
    personality: CoachPersonality,
  ): Promise<ApiResponse<{ sessionId: string }>> {
    return api.post<{ sessionId: string }>('/coach/sessions', {
      personality_type: personality,
    });
  }

  async endSession(sessionId: string): Promise<ApiResponse<void>> {
    return api.post(`/coach/sessions/${sessionId}/end`);
  }

  async requestWorkoutModification(
    workoutId: string,
    request: string,
    personality: CoachPersonality,
  ): Promise<ApiResponse<WorkoutPlan>> {
    return api.post<WorkoutPlan>('/coach/modify-workout', {
      workout_id: workoutId,
      modification_request: request,
      personality,
    });
  }

  async getMotivationalMessage(
    context: string,
    personality: CoachPersonality,
  ): Promise<ApiResponse<string>> {
    const response = await api.post<{ message: string }>('/coach/motivate', {
      context,
      personality,
    });

    if (response.success && response.data) {
      return { ...response, data: response.data.message };
    }

    return response as ApiResponse<string>;
  }

  getCoachGreeting(personality: CoachPersonality): string {
    switch (personality) {
      case CoachPersonality.EMMA:
        return "Hey there! I'm Emma, and I'm so excited to be part of your fitness journey! 🌟";
      case CoachPersonality.MAX:
        return "WHAT'S UP, CHAMPION! Max here, ready to CRUSH some goals! 🔥";
      case CoachPersonality.DR_PROGRESS:
        return "Greetings! I'm Dr. Progress. Let's analyze your fitness data and optimize your results. 📈";
    }
  }

  getCoachPrompt(personality: CoachPersonality): string {
    const config = COACH_PERSONALITIES[personality];
    return `You are ${config.name}, a fitness coach with a ${config.tone} personality. 
    Your motivation style is ${config.motivationStyle}. 
    Always stay in character and provide helpful fitness advice while maintaining your unique personality.
    Never break character or mention that you're an AI.`;
  }
}

export default new AICoachService();