/**
 * Backend Agent Service - Connects React Native app to Python backend with OpenAI Agents SDK
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendUrl } from '../config/backend';

interface AIResponse {
  text: string;
  actions?: any[];
  confirmations?: any[];
}

interface MultiAgentResponse {
  response: string;
  responding_agents: Array<{
    type: string;
    name: string;
    emoji: string;
    confidence: string;
  }>;
  conversation_id?: string;
  action_items?: any[];
  consensus_recommendations?: string[];
}

interface BackendChatRequest {
  message: string;
  personality?: 'emma' | 'max' | 'dr_progress';
  session_id?: string;
  context?: Record<string, any>;
}

interface BackendChatResponse {
  message: string;
  session_id: string;
  personality: string;
  timestamp: string;
  actions: any[];
  requires_confirmation: boolean;
  agent_info: {
    agent_id: string;
    session_stats: Record<string, any>;
    personality: string;
  };
}

interface MultiAgentChatRequest {
  message: string;
  context?: Record<string, any>;
  required_agents?: string[];
  personality?: 'emma' | 'max' | 'dr_progress';
  single_agent_mode?: boolean;
  fast_mode?: boolean;
}

interface AgentInsight {
  agent: string;
  message: string;
  confidence: number;
  recommendations: string[];
}

interface MultiAgentChatResponse {
  primary_message: string;
  agent_insights: AgentInsight[];
  consensus_recommendations: string[];
  action_items: any[];
  confidence_score: number;
  timestamp: string;
  responding_agents: Array<{
    type: string;
    name: string;
    emoji: string;
    confidence: string;
  }>;
}

interface BackendConfig {
  baseUrl: string;
  timeout: number;
}

export class BackendAgentService {
  private config: BackendConfig;
  private authToken: string | null = null;
  private sessionId: string | null = null;

  constructor() {
    // Use dynamic backend URL based on platform
    this.config = {
      baseUrl: getBackendUrl(),
      timeout: 60000 // 60 seconds - increased for better AI responses
    };
    
    console.log('Backend Service initialized with URL:', this.config.baseUrl);
    this.loadAuthToken();
  }

  private async loadAuthToken() {
    try {
      this.authToken = await AsyncStorage.getItem('auth_token');
      console.log('Auth token loaded:', this.authToken ? 'Present' : 'Missing');
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  async setAuthToken(token: string) {
    this.authToken = token;
    await AsyncStorage.setItem('auth_token', token);
  }

  async clearAuthToken() {
    this.authToken = null;
    await AsyncStorage.removeItem('auth_token');
  }

  private async makeRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    skipRetry?: boolean
  ): Promise<any> {
    // Allow requests without auth token for testing
    // if (!this.authToken) {
    //   throw new Error('Authentication required. Please login first.');
    // }

    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Only add Authorization header if we have a token
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const requestConfig: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body);
    }

    console.log(`🌐 ${method} ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle 404 gracefully for endpoints that might not exist
        if (response.status === 404) {
          console.log(`Endpoint not found: ${url}`);
          return null;
        }
        const errorText = await response.text();
        throw new Error(`Backend error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        // For AI chat requests, retry once with a longer timeout
        if (url.includes('/chat') && !skipRetry) {
          console.log('Request timed out, retrying with longer timeout...');
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), 90000); // 90 seconds for retry
          
          try {
            const retryResponse = await fetch(url, {
              ...requestConfig,
              signal: retryController.signal
            });
            
            clearTimeout(retryTimeoutId);
            
            if (!retryResponse.ok) {
              const errorText = await retryResponse.text();
              throw new Error(`Backend error (${retryResponse.status}): ${errorText}`);
            }
            
            return await retryResponse.json();
          } catch (retryError) {
            clearTimeout(retryTimeoutId);
            throw new Error('Request timeout. The AI is taking longer than expected to respond.');
          }
        }
        throw new Error('Request timeout. Please check your connection.');
      }
      console.error(`Backend request failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Backend request failed: ${errorMessage}`);
    }
  }

  /**
   * Send a message to the AI coach agent
   */
  async sendMessage(
    message: string, 
    personality: 'emma' | 'max' | 'dr_progress' = 'emma',
    context?: Record<string, any>
  ): Promise<AIResponse> {
    try {
      const request: BackendChatRequest = {
        message,
        personality,
        session_id: this.sessionId || undefined,
        context
      };

      const response: BackendChatResponse = await this.makeRequest(
        '/api/agent/chat',
        'POST',
        request
      );

      // Update session ID
      this.sessionId = response.session_id;

      // Convert backend response to AIResponse format
      return {
        text: response.message,
        actions: response.actions || [],
        confirmations: [] // Agents handle confirmations internally
      };

    } catch (error) {
      console.error('Backend chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to communicate with AI coach: ${errorMessage}`);
    }
  }

  /**
   * Send a message to multiple specialized agents
   */
  async sendMultiAgentMessage(
    message: string,
    personality: 'emma' | 'max' | 'dr_progress' = 'emma',
    context?: Record<string, any>,
    requiredAgents?: string[],
    options?: { singleAgentMode?: boolean; fastMode?: boolean }
  ): Promise<MultiAgentResponse> {
    try {
      const request: MultiAgentChatRequest = {
        message,
        personality,
        context,
        required_agents: requiredAgents,
        single_agent_mode: options?.singleAgentMode,
        fast_mode: options?.fastMode
      };

      // Use real endpoint if authenticated, demo otherwise
      const endpoint = this.authToken && !this.authToken.startsWith('demo-token-') 
        ? '/api/multi-agent/chat'
        : '/api/multi-agent/chat/demo';
        
      const response: MultiAgentChatResponse = await this.makeRequest(
        endpoint,
        'POST',
        request
      );

      console.log('Backend multi-agent response:', {
        hasResponse: !!response,
        hasPrimaryMessage: !!response?.primary_message,
        primaryMessageLength: response?.primary_message?.length,
        respondingAgentsCount: response?.responding_agents?.length || 0,
        actionItemsCount: response?.action_items?.length || 0
      });

      // Return response with action items
      return {
        response: response.primary_message || 'No response received',
        responding_agents: response.responding_agents || [],
        conversation_id: `conv-${Date.now()}`,
        action_items: response.action_items || [],
        consensus_recommendations: response.consensus_recommendations || []
      };

    } catch (error) {
      console.error('Multi-agent chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to communicate with multi-agent system: ${errorMessage}`);
    }
  }

  /**
   * Get current agent state
   */
  async getAgentState(): Promise<any> {
    try {
      const response = await this.makeRequest('/api/agent/state');
      return response;
    } catch (error) {
      console.error('Failed to get agent state:', error);
      throw error;
    }
  }

  /**
   * Clear agent conversation history
   */
  async clearConversation(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/agent/clear', 'POST');
      return response.status === 'success';
    } catch (error) {
      console.error('Failed to clear conversation:', error);
      return false;
    }
  }

  /**
   * Update user preferences in agent
   */
  async updatePreferences(preferences: Record<string, any>): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/agent/preferences', 'POST', preferences);
      return response.status === 'success';
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(limit: number = 50): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/api/agent/messages?limit=${limit}`);
      return response || [];
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  }

  /**
   * Get agent service statistics
   */
  async getStats(): Promise<any> {
    try {
      const response = await this.makeRequest('/api/agent/stats');
      return response.stats || {};
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {};
    }
  }

  /**
   * Test backend connectivity
   */
  async testConnection(): Promise<{ connected: boolean; latency?: number; error?: string }> {
    try {
      const startTime = Date.now();
      await this.makeRequest('/health');
      const latency = Date.now() - startTime;
      
      return { connected: true, latency };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      return { 
        connected: false, 
        error: errorMessage 
      };
    }
  }

  /**
   * Switch backend URL (for development/production)
   */
  setBackendUrl(url: string) {
    this.config.baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
    console.log('Backend URL updated to:', this.config.baseUrl);
  }

  /**
   * Get current backend configuration
   */
  getConfig(): BackendConfig {
    return { ...this.config };
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    // For demo mode, we only need baseUrl
    return !!(this.config.baseUrl);
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Set session ID manually
   */
  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }
}

// Create singleton instance
export const backendAgentService = new BackendAgentService();

// Export personality types for convenience
export const CoachPersonality = {
  SUPPORTIVE: 'supportive' as const,
  AGGRESSIVE: 'aggressive' as const,
  STEADY_PACE: 'steady_pace' as const,
} as const;

export type CoachPersonalityType = typeof CoachPersonality[keyof typeof CoachPersonality];