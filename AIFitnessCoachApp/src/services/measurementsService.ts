import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface BodyMeasurement {
  id?: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  waist_circumference?: number;
  chest_circumference?: number;
  arm_circumference?: number;
  thigh_circumference?: number;
  hip_circumference?: number;
  neck_circumference?: number;
  notes?: string;
  recorded_at?: string;
}

export interface ProgressPhoto {
  id: string;
  photo_url: string;
  angle: string;
  notes?: string;
  is_private: boolean;
  taken_at: string;
}

export interface MeasurementTrends {
  weight_trend: Array<{ date: string; value: number }>;
  body_fat_trend: Array<{ date: string; value: number }>;
  measurements_trend: {
    [key: string]: Array<{ date: string; value: number }>;
  };
  total_weight_change: number;
  total_body_fat_change: number;
  average_weekly_change: number;
}

export interface FastingSession {
  id?: string;
  fasting_type: string;
  planned_duration_hours: number;
  started_at?: string;
  ended_at?: string;
  actual_duration_hours?: number;
  completed_successfully?: boolean;
  notes?: string;
}

export interface FastingStats {
  total_sessions: number;
  completed_sessions: number;
  current_streak: number;
  longest_streak: number;
  average_duration_hours: number;
  total_fasting_hours: number;
  favorite_fasting_type?: string;
}

export interface UserSettings {
  unit_system: 'metric' | 'imperial';
  theme_preference: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  workout_reminder_time?: string;
  rest_timer_duration: number;
  auto_start_rest_timer: boolean;
  weight_increment: number;
  default_workout_duration: number;
  show_warmup_sets: boolean;
  export_format: 'csv' | 'json';
}

class MeasurementsService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Body Measurements
  async createMeasurement(measurement: BodyMeasurement): Promise<BodyMeasurement> {
    const response = await fetch(`${API_BASE_URL}/api/measurements`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(measurement),
    });

    if (!response.ok) {
      throw new Error('Failed to create measurement');
    }

    return response.json();
  }

  async getMeasurements(limit = 30, offset = 0): Promise<BodyMeasurement[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/measurements?limit=${limit}&offset=${offset}`,
      {
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch measurements');
    }

    return response.json();
  }

  async getLatestMeasurement(): Promise<BodyMeasurement | null> {
    const response = await fetch(`${API_BASE_URL}/api/measurements/latest`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch latest measurement');
    }

    return response.json();
  }

  async getMeasurementTrends(days = 30): Promise<MeasurementTrends> {
    const response = await fetch(
      `${API_BASE_URL}/api/measurements/trends?days=${days}`,
      {
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch measurement trends');
    }

    return response.json();
  }

  async deleteMeasurement(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/measurements/${id}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete measurement');
    }
  }

  // Progress Photos
  async uploadProgressPhoto(
    photo: any,
    angle: string,
    notes?: string,
    isPrivate = true
  ): Promise<ProgressPhoto> {
    const formData = new FormData();
    formData.append('file', {
      uri: photo.uri,
      type: photo.type || 'image/jpeg',
      name: photo.fileName || 'photo.jpg',
    } as any);
    formData.append('angle', angle);
    if (notes) formData.append('notes', notes);
    formData.append('is_private', isPrivate.toString());

    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/progress-photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload progress photo');
    }

    return response.json();
  }

  async getProgressPhotos(limit = 20, offset = 0): Promise<ProgressPhoto[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/progress-photos?limit=${limit}&offset=${offset}`,
      {
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch progress photos');
    }

    return response.json();
  }

  async updatePhotoPrivacy(photoId: string, isPrivate: boolean): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/progress-photos/${photoId}/privacy`,
      {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ is_private: isPrivate }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update photo privacy');
    }
  }

  async deleteProgressPhoto(photoId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/progress-photos/${photoId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete progress photo');
    }
  }

  // Fasting
  async startFasting(session: Omit<FastingSession, 'id' | 'started_at'>): Promise<FastingSession> {
    const response = await fetch(`${API_BASE_URL}/api/fasting/start`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(session),
    });

    if (!response.ok) {
      throw new Error('Failed to start fasting session');
    }

    return response.json();
  }

  async stopFasting(): Promise<FastingSession> {
    const response = await fetch(`${API_BASE_URL}/api/fasting/stop`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to stop fasting session');
    }

    return response.json();
  }

  async getCurrentFasting(): Promise<FastingSession | null> {
    const response = await fetch(`${API_BASE_URL}/api/fasting/current`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current fasting session');
    }

    return response.json();
  }

  async getFastingHistory(limit = 30, offset = 0): Promise<FastingSession[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/fasting/history?limit=${limit}&offset=${offset}`,
      {
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch fasting history');
    }

    return response.json();
  }

  async getFastingStats(): Promise<FastingStats> {
    const response = await fetch(`${API_BASE_URL}/api/fasting/stats`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch fasting stats');
    }

    return response.json();
  }

  // User Settings
  async getSettings(): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user settings');
    }

    return response.json();
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to update settings');
    }

    return response.json();
  }

  async updateUnitPreference(unitSystem: 'metric' | 'imperial'): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/api/settings/units`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ unit_system: unitSystem }),
    });

    if (!response.ok) {
      throw new Error('Failed to update unit preference');
    }

    return response.json();
  }
}

export default new MeasurementsService();