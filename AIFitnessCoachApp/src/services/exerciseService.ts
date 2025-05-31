import { WGER_API_URL } from '../config/api';

interface ExerciseQuery {
  muscle?: string;
  page?: number;
  limit?: number;
  search?: string;
}

class ExerciseService {
  async getExercises(query: ExerciseQuery = {}) {
    try {
      const { muscle, page = 1, limit = 20, search } = query;
      
      // Build query params
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', ((page - 1) * limit).toString());
      
      if (search) {
        params.append('name', search);
      }
      
      // WGER muscle IDs mapping
      const muscleMap: Record<string, number> = {
        'Chest': 4,
        'Back': 12,
        'Shoulders': 2,
        'Arms': 1, // Biceps
        'Legs': 10, // Quads
        'Core': 6,
        'Glutes': 8,
      };
      
      if (muscle && muscleMap[muscle]) {
        params.append('muscles', muscleMap[muscle].toString());
      }
      
      const response = await fetch(`${WGER_API_URL}/exercise/?${params.toString()}&language=2`);
      
      if (response.ok) {
        const data = await response.json();
        
        return data.results.map((exercise: any) => ({
          id: exercise.id.toString(),
          name: exercise.name,
          category: this.getCategoryName(exercise.category),
          muscles: exercise.muscles_secondary.concat(exercise.muscles).map((m: number) => 
            this.getMuscleName(m)
          ),
          equipment: this.getEquipmentName(exercise.equipment[0]),
          difficulty: this.getDifficulty(exercise.difficulty),
          description: exercise.description,
        }));
      }
      
      throw new Error('Failed to fetch exercises');
    } catch (error) {
      console.error('Exercise Service Error:', error);
      throw error;
    }
  }

  async getExerciseById(id: string) {
    try {
      const response = await fetch(`${WGER_API_URL}/exercise/${id}/?language=2`);
      
      if (response.ok) {
        const exercise = await response.json();
        
        return {
          id: exercise.id.toString(),
          name: exercise.name,
          category: this.getCategoryName(exercise.category),
          muscles: exercise.muscles_secondary.concat(exercise.muscles).map((m: number) => 
            this.getMuscleName(m)
          ),
          equipment: this.getEquipmentName(exercise.equipment[0]),
          difficulty: this.getDifficulty(exercise.difficulty),
          description: exercise.description,
          instructions: exercise.description?.split('\n') || [],
          images: await this.getExerciseImages(id),
        };
      }
      
      throw new Error('Exercise not found');
    } catch (error) {
      console.error('Exercise Service Error:', error);
      throw error;
    }
  }

  private async getExerciseImages(exerciseId: string) {
    try {
      const response = await fetch(`${WGER_API_URL}/exerciseimage/?exercise=${exerciseId}`);
      if (response.ok) {
        const data = await response.json();
        return data.results.map((img: any) => img.image);
      }
    } catch (error) {
      console.error('Failed to fetch exercise images:', error);
    }
    return [];
  }

  private getCategoryName(categoryId: number): string {
    const categories: Record<number, string> = {
      1: 'Abs',
      2: 'Arms',
      3: 'Back',
      4: 'Calves',
      5: 'Chest',
      6: 'Legs',
      7: 'Shoulders',
    };
    return categories[categoryId] || 'Other';
  }

  private getMuscleName(muscleId: number): string {
    const muscles: Record<number, string> = {
      1: 'Biceps',
      2: 'Shoulders',
      3: 'Back',
      4: 'Chest',
      5: 'Triceps',
      6: 'Abs',
      7: 'Calves',
      8: 'Glutes',
      9: 'Traps',
      10: 'Quads',
      11: 'Hamstrings',
      12: 'Lats',
      13: 'Middle Back',
      14: 'Lower Back',
      15: 'Glutes',
    };
    return muscles[muscleId] || 'Other';
  }

  private getEquipmentName(equipmentId: number): string {
    const equipment: Record<number, string> = {
      1: 'Barbell',
      2: 'SZ-Bar',
      3: 'Dumbbell',
      4: 'Gym mat',
      5: 'Swiss Ball',
      6: 'Pull-up bar',
      7: 'None',
      8: 'Bench',
      9: 'Incline bench',
      10: 'Kettlebell',
    };
    return equipment[equipmentId] || 'None';
  }

  private getDifficulty(level?: number): string {
    if (!level) return 'Beginner';
    if (level <= 3) return 'Beginner';
    if (level <= 6) return 'Intermediate';
    return 'Advanced';
  }
}

export const exerciseService = new ExerciseService();