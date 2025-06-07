import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AISettingsState {
  // AI Action Mode: 'pure_ai' | 'hybrid'
  actionMode: 'pure_ai' | 'hybrid';
  
  // Creative toggle names
  isQuantumMode: boolean; // Pure AI mode with creative name
  isTurboMode: boolean;   // Hybrid mode with creative name
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  setActionMode: (mode: 'pure_ai' | 'hybrid') => void;
  toggleQuantumMode: () => void;
  toggleTurboMode: () => void;
  loadSettings: () => Promise<void>;
}

export const useAISettingsStore = create<AISettingsState>((set, get) => ({
  // Default to hybrid mode (faster)
  actionMode: 'hybrid',
  isQuantumMode: false,  // Pure AI mode
  isTurboMode: true,     // Hybrid mode (default)
  isLoading: false,
  
  setActionMode: async (mode) => {
    set({ 
      actionMode: mode,
      isQuantumMode: mode === 'pure_ai',
      isTurboMode: mode === 'hybrid'
    });
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('ai_action_mode', mode);
    } catch (error) {
      console.error('Failed to save AI action mode:', error);
    }
  },
  
  toggleQuantumMode: async () => {
    const newMode = !get().isQuantumMode;
    if (newMode) {
      // Turning on Quantum Mode (Pure AI)
      await get().setActionMode('pure_ai');
    } else {
      // Turning off Quantum Mode, switch to Turbo
      await get().setActionMode('hybrid');
    }
  },
  
  toggleTurboMode: async () => {
    const newMode = !get().isTurboMode;
    if (newMode) {
      // Turning on Turbo Mode (Hybrid)
      await get().setActionMode('hybrid');
    } else {
      // Turning off Turbo Mode, switch to Quantum
      await get().setActionMode('pure_ai');
    }
  },
  
  loadSettings: async () => {
    set({ isLoading: true });
    
    try {
      const savedMode = await AsyncStorage.getItem('ai_action_mode');
      if (savedMode && (savedMode === 'pure_ai' || savedMode === 'hybrid')) {
        set({ 
          actionMode: savedMode,
          isQuantumMode: savedMode === 'pure_ai',
          isTurboMode: savedMode === 'hybrid'
        });
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));