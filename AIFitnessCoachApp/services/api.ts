import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '@/config/constants';
import { ApiResponse, ApiError as ApiErrorType } from '@/types/models';

class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Get auth token
        if (!this.authToken) {
          this.authToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
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
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async clearAuthToken(): Promise<void> {
    this.authToken = null;
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async getAuthToken(): Promise<string | null> {
    if (!this.authToken) {
      this.authToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
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