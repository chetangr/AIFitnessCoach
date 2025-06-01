import api from './api';
import {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  ApiResponse,
} from '@/types/models';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  fitness_level: string;
  onboarding_completed: boolean;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.success && response.data) {
      await api.setAuthToken(response.data.access_token);
    }

    return response;
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    const response = await api.post<RegisterResponse>('/auth/register', {
      email: data.email,
      username: data.username,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      fitness_level: data.fitnessLevel || 'beginner',
    });

    if (response.success && response.data) {
      // Auto-login after registration
      const loginResponse = await this.login({
        username: data.username,
        password: data.password,
      });

      if (loginResponse.success && loginResponse.data) {
        return { success: true, data: loginResponse.data.user };
      }
    }

    return response as ApiResponse<User>;
  }

  async loginDemo(): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<LoginResponse>('/auth/demo');

    if (response.success && response.data) {
      await api.setAuthToken(response.data.access_token);
    }

    return response;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    await api.clearAuthToken();
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get<User>('/auth/me');
  }

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const response = await api.post<LoginResponse>('/auth/refresh');

    if (response.success && response.data) {
      await api.setAuthToken(response.data.access_token);
      return {
        success: true,
        data: {
          accessToken: response.data.access_token,
          tokenType: response.data.token_type,
        },
      };
    }

    return response as ApiResponse<AuthTokens>;
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    return api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return api.post('/auth/password-reset', { email });
  }

  async confirmPasswordReset(
    token: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    return api.post('/auth/password-reset/confirm', {
      token,
      new_password: newPassword,
    });
  }

  async validateToken(): Promise<boolean> {
    const token = await api.getAuthToken();
    if (!token) return false;

    const response = await this.getCurrentUser();
    return response.success;
  }
}

export default new AuthService();