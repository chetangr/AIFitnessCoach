import AsyncStorage from '@react-native-async-storage/async-storage';
import backendWorkoutService from '../../services/backendWorkoutService';

// Mock fetch and AsyncStorage
global.fetch = jest.fn();
jest.mock('@react-native-async-storage/async-storage');

describe('BackendWorkoutService', () => {
  const mockToken = 'test-token';
  
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);
  });

  describe('Workout Sessions', () => {
    it('should start a workout session', async () => {
      const mockSession = {
        id: 'session1',
        workout_name: 'Upper Body Day',
        started_at: '2024-01-01T10:00:00Z',
        total_sets: 0,
        total_reps: 0,
        total_volume: 0,
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await backendWorkoutService.startWorkoutSession(
        'Upper Body Day',
        'plan1',
        'Ready to crush it!'
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout-sessions/start'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
          body: JSON.stringify({
            workout_name: 'Upper Body Day',
            workout_plan_id: 'plan1',
            notes: 'Ready to crush it!',
          }),
        })
      );
      expect(result).toEqual(mockSession);
    });

    it('should add exercise to session', async () => {
      const mockExercise = {
        id: 'perf1',
        exercise_id: 'bench-press',
        exercise_name: 'Bench Press',
        order_in_workout: 1,
        total_sets: 0,
        total_reps: 0,
        total_volume: 0,
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExercise,
      });

      const result = await backendWorkoutService.addExerciseToSession(
        'session1',
        'bench-press',
        1,
        'First exercise'
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout-sessions/session1/exercise'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            exercise_id: 'bench-press',
            order_in_workout: 1,
            notes: 'First exercise',
          }),
        })
      );
      expect(result).toEqual(mockExercise);
    });

    it('should record a set', async () => {
      const mockSet = {
        id: 'set1',
        set_number: 1,
        actual_reps: 10,
        weight: 80,
        rpe: 7,
        is_warmup: false,
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSet,
      });

      const setData = {
        set_number: 1,
        target_reps: 10,
        actual_reps: 10,
        weight: 80,
        rpe: 7,
        is_warmup: false,
      };

      const result = await backendWorkoutService.recordSet(
        'session1',
        'perf1',
        setData
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout-sessions/session1/set'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            exercise_performance_id: 'perf1',
            ...setData,
          }),
        })
      );
      expect(result).toEqual(mockSet);
    });

    it('should complete a workout session', async () => {
      const mockCompleted = {
        id: 'session1',
        ended_at: '2024-01-01T11:00:00Z',
        total_duration_minutes: 60,
        rating: 4,
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompleted,
      });

      const result = await backendWorkoutService.completeWorkoutSession(
        'session1',
        4,
        'Great workout!'
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout-sessions/session1/complete'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ rating: 4, notes: 'Great workout!' }),
        })
      );
      expect(result).toEqual(mockCompleted);
    });

    it('should get workout session details', async () => {
      const mockDetails = {
        session: { id: 'session1', workout_name: 'Upper Body Day' },
        exercises: [
          {
            performance: { id: 'perf1', exercise_name: 'Bench Press' },
            sets: [{ id: 'set1', weight: 80, actual_reps: 10 }],
          },
        ],
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDetails,
      });

      const result = await backendWorkoutService.getWorkoutSessionDetails('session1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout-sessions/session1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockDetails);
    });
  });

  describe('Personal Records', () => {
    it('should get personal records', async () => {
      const mockPRs = [
        {
          id: 'pr1',
          exercise_id: 'bench-press',
          exercise_name: 'Bench Press',
          pr_type: 'max_weight',
          value: 100,
          achieved_at: '2024-01-01',
        },
      ];
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPRs,
      });

      const result = await backendWorkoutService.getPersonalRecords();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/personal-records'),
        expect.any(Object)
      );
      expect(result).toEqual(mockPRs);
    });

    it('should calculate personal records', async () => {
      const mockResult = {
        message: 'Personal records calculated successfully',
        records_created: 5,
        records_updated: 2,
        exercises_analyzed: 10,
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const result = await backendWorkoutService.calculatePersonalRecords(true);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/personal-records/calculate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ force_recalculate: true }),
        })
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('Workout Schedule', () => {
    it('should get workout schedule', async () => {
      const mockSchedule = {
        id: 'schedule1',
        monday: 'chest-day',
        tuesday: 'rest',
        wednesday: 'leg-day',
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSchedule,
      });

      const result = await backendWorkoutService.getWorkoutSchedule();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout-schedule'),
        expect.any(Object)
      );
      expect(result).toEqual(mockSchedule);
    });

    it('should move workout between days', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await backendWorkoutService.moveWorkout('monday', 'wednesday', true);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout-schedule/move'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            from_day: 'monday',
            to_day: 'wednesday',
            swap: true,
          }),
        })
      );
    });

    it('should mark rest day', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await backendWorkoutService.markRestDay('tuesday');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workout-schedule/rest-day'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ day: 'tuesday' }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        backendWorkoutService.startWorkoutSession('Test Workout')
      ).rejects.toThrow('Failed to start workout session');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        backendWorkoutService.getWorkoutSessions()
      ).rejects.toThrow('Network error');
    });
  });
});