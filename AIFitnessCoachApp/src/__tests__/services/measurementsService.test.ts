import AsyncStorage from '@react-native-async-storage/async-storage';
import measurementsService from '../../services/measurementsService';

// Mock fetch and AsyncStorage
global.fetch = jest.fn();
jest.mock('@react-native-async-storage/async-storage');

describe('MeasurementsService', () => {
  const mockToken = 'test-token';
  
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);
  });

  describe('Body Measurements', () => {
    it('should create a new measurement', async () => {
      const mockResponse = { id: '1', weight: 75.5, recorded_at: '2024-01-01' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const measurement = { weight: 75.5, body_fat_percentage: 18.5 };
      const result = await measurementsService.createMeasurement(measurement);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/measurements'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
          body: JSON.stringify(measurement),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get measurement history', async () => {
      const mockMeasurements = [
        { id: '1', weight: 75.5, recorded_at: '2024-01-01' },
        { id: '2', weight: 75.0, recorded_at: '2024-01-02' },
      ];
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMeasurements,
      });

      const result = await measurementsService.getMeasurements();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/measurements?limit=30&offset=0'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockMeasurements);
    });

    it('should get measurement trends', async () => {
      const mockTrends = {
        weight_trend: [{ date: '2024-01-01', value: 75.5 }],
        body_fat_trend: [],
        measurements_trend: {},
        total_weight_change: -0.5,
        total_body_fat_change: 0,
        average_weekly_change: -0.1,
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrends,
      });

      const result = await measurementsService.getMeasurementTrends(30);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/measurements/trends?days=30'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockTrends);
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(measurementsService.createMeasurement({})).rejects.toThrow(
        'Failed to create measurement'
      );
    });
  });

  describe('Fasting Management', () => {
    it('should start a fasting session', async () => {
      const mockSession = {
        id: '1',
        fasting_type: '16:8',
        planned_duration_hours: 16,
        started_at: '2024-01-01T08:00:00Z',
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const session = {
        fasting_type: '16:8',
        planned_duration_hours: 16,
        notes: 'Starting fast',
      };
      const result = await measurementsService.startFasting(session);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/fasting/start'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(session),
        })
      );
      expect(result).toEqual(mockSession);
    });

    it('should get current fasting session', async () => {
      const mockSession = {
        id: '1',
        fasting_type: '16:8',
        started_at: '2024-01-01T08:00:00Z',
        actual_duration_hours: 5.5,
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await measurementsService.getCurrentFasting();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/fasting/current'),
        expect.any(Object)
      );
      expect(result).toEqual(mockSession);
    });

    it('should get fasting statistics', async () => {
      const mockStats = {
        total_sessions: 10,
        completed_sessions: 8,
        current_streak: 3,
        longest_streak: 7,
        average_duration_hours: 16.5,
        total_fasting_hours: 165,
        favorite_fasting_type: '16:8',
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const result = await measurementsService.getFastingStats();

      expect(result).toEqual(mockStats);
    });
  });

  describe('User Settings', () => {
    it('should get user settings', async () => {
      const mockSettings = {
        unit_system: 'metric',
        theme_preference: 'dark',
        notifications_enabled: true,
        rest_timer_duration: 90,
        weight_increment: 2.5,
        show_warmup_sets: true,
        export_format: 'csv',
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
      });

      const result = await measurementsService.getSettings();

      expect(result).toEqual(mockSettings);
    });

    it('should update unit preference', async () => {
      const mockSettings = { unit_system: 'imperial' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
      });

      const result = await measurementsService.updateUnitPreference('imperial');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/settings/units'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ unit_system: 'imperial' }),
        })
      );
      expect(result).toEqual(mockSettings);
    });
  });

  describe('Progress Photos', () => {
    it('should upload a progress photo', async () => {
      const mockPhoto = {
        id: '1',
        photo_url: '/uploads/photo1.jpg',
        angle: 'front',
        is_private: true,
        taken_at: '2024-01-01',
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhoto,
      });

      const photo = {
        uri: 'file://photo.jpg',
        type: 'image/jpeg',
        fileName: 'photo.jpg',
      };
      const result = await measurementsService.uploadProgressPhoto(
        photo,
        'front',
        'Progress check'
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/progress-photos'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
      expect(result).toEqual(mockPhoto);
    });

    it('should update photo privacy', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await measurementsService.updatePhotoPrivacy('photo1', false);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/progress-photos/photo1/privacy'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ is_private: false }),
        })
      );
    });
  });
});