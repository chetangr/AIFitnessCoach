import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '@/services/authService';
import { User, LoginCredentials, RegisterData } from '@/types/models';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  loginDemo: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(credentials);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Login failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'An unexpected error occurred',
          });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(data);
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Registration failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'An unexpected error occurred',
          });
          return false;
        }
      },

      loginDemo: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.loginDemo();
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Demo login failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'An unexpected error occurred',
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error);
        }
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      refreshUser: async () => {
        const response = await authService.getCurrentUser();
        
        if (response.success && response.data) {
          set({ user: response.data });
        }
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...updates,
            },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        
        try {
          const isValid = await authService.validateToken();
          
          if (isValid) {
            const response = await authService.getCurrentUser();
            if (response.success && response.data) {
              set({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);