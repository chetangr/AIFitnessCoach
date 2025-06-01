import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (user: User) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('token', user.token);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    console.log('checkAuth called - starting auth check...');
    
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          console.log('Auth check timeout reached (3000ms)');
          reject(new Error('Auth check timeout'));
        }, 3000)
      );
      
      const checkPromise = (async () => {
        console.log('Attempting to read user from AsyncStorage...');
        const userJson = await AsyncStorage.getItem('user');
        console.log('AsyncStorage read complete. User found:', !!userJson);
        
        if (userJson) {
          const user = JSON.parse(userJson);
          console.log('User parsed successfully:', { email: user.email, name: user.name });
          return { user, isAuthenticated: true };
        }
        console.log('No user found in AsyncStorage');
        return { user: null, isAuthenticated: false };
      })();
      
      console.log('Racing auth check with timeout...');
      const result = await Promise.race([checkPromise, timeoutPromise])
        .catch((error) => {
          console.error('Auth check race failed:', error);
          return { user: null, isAuthenticated: false };
        }) as { user: User | null, isAuthenticated: boolean };
      
      console.log('Setting auth state:', { 
        hasUser: !!result.user,
        isAuthenticated: result.isAuthenticated 
      });
      
      set({ 
        user: result.user || null, 
        isAuthenticated: result.isAuthenticated || false, 
        isLoading: false 
      });
      
      console.log('Auth state updated successfully');
    } catch (error) {
      console.error('checkAuth error:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      set({ isLoading: false });
      console.log('isLoading set to false after error');
    }
  },
}));