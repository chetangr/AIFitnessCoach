import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { ApiResponse, ApiError as ApiErrorType } from '@/types/models';

const API_BASE_URL = Config.API_URL || 'http://localhost:8000/api';
const AUTH_TOKEN_KEY = '@ai_fitness_coach:auth_token';

class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Get auth token
        if (!this.authToken) {
          this.authToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        }

        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.clearAuthToken();
          // Redirect to login (handled by navigation)
        }
        return Promise.reject(this.handleError(error));
      },
    );
  }

  // Auth methods
  async setAuthToken(token: string): Promise<void> {
    this.authToken = token;
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  async clearAuthToken(): Promise<void> {
    this.authToken = null;
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }

  async getAuthToken(): Promise<string | null> {
    if (!this.authToken) {
      this.authToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }
    return this.authToken;
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return { data: response.data, success: true };
    } catch (error) {
      return { error: error as ApiErrorType, success: false };
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return { data: response.data, success: true };
    } catch (error) {
      return { error: error as ApiErrorType, success: false };
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return { data: response.data, success: true };
    } catch (error) {
      return { error: error as ApiErrorType, success: false };
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return { data: response.data, success: true };
    } catch (error) {
      return { error: error as ApiErrorType, success: false };
    }
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return { data: response.data, success: true };
    } catch (error) {
      return { error: error as ApiErrorType, success: false };
    }
  }

  // Error handling
  private handleError(error: AxiosError): ApiErrorType {
    if (error.response) {
      // Server responded with error
      const data = error.response.data as any;
      return {
        code: data.code || `HTTP_${error.response.status}`,
        message: data.detail || data.message || error.message,
        details: data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        details: error.request,
      };
    } else {
      // Something else happened
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        details: error,
      };
    }
  }

  // Utility method for form data
  createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value !== null && value !== undefined) {
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    return formData;
  }
}

export default new ApiService();