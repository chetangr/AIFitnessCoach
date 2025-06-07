/**
 * Backend Configuration
 * 
 * For development:
 * - Use 'localhost' when running in web browser
 * - Use your machine's IP address when testing on physical device
 * - Use Cloudflare tunnel URL for remote access
 */

import { Platform } from 'react-native';

// Get the appropriate backend URL based on platform
export const getBackendUrl = () => {
  // If explicitly set in environment, use that
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }

  // For web, use localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }

  // For mobile devices, use machine's IP address
  // Update this to your machine's IP address when testing on device
  return 'http://192.168.1.187:8000';
};

// Backend endpoints
export const ENDPOINTS = {
  health: '/health',
  login: '/api/users/login',
  register: '/api/users/register',
  profile: '/api/users/profile',
  multiAgentChat: '/api/multi-agent/chat',
  multiAgentChatDemo: '/api/multi-agent/chat/demo',
  agentChat: '/api/agent/chat',
  agentMessages: '/api/agent/messages',
  agentState: '/api/agent/state',
  agentClear: '/api/agent/clear',
  agentPreferences: '/api/agent/preferences',
  agentStats: '/api/agent/stats',
  workouts: '/api/workouts',
  programs: '/api/programs',
  exercises: '/api/exercises',
};

// Configuration for different environments
export const BACKEND_CONFIG = {
  development: {
    url: getBackendUrl(),
    timeout: 30000,
  },
  production: {
    url: 'https://your-production-url.com',
    timeout: 15000,
  },
};

// Get current config based on environment
export const getCurrentBackendConfig = () => {
  const isDev = process.env.NODE_ENV === 'development' || process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';
  return isDev ? BACKEND_CONFIG.development : BACKEND_CONFIG.production;
};