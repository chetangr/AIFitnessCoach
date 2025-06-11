import { wgerExercises, WgerExercise } from '../data/wgerExerciseDatabase';

interface ExerciseQuery {
  muscle?: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface ProgramQuery {
  level?: string;
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

class ExerciseService {
  async getExercises(query: ExerciseQuery = {}) {
    try {
      const { muscle, page = 1, limit = 20, search } = query;
      
      // Filter exercises
      let filteredExercises = wgerExercises;
      
      // Search filter
      if (search) {
        filteredExercises = filteredExercises.filter(ex =>
          ex.name.toLowerCase().includes(search.toLowerCase()) ||
          ex.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Muscle filter
      if (muscle && muscle !== 'All') {
        filteredExercises = filteredExercises.filter(ex =>
          ex.primaryMuscles.some(m => m.toLowerCase().includes(muscle.toLowerCase()))
        );
      }
      
      // Implement pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedExercises = filteredExercises.slice(startIndex, endIndex);
      
      // Transform to match expected interface
      return paginatedExercises.map((exercise: WgerExercise) => ({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        muscles: exercise.primaryMuscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        description: exercise.description,
        instructions: exercise.instructions,
        imageUrl: exercise.images?.[0],
      }));
    } catch (error) {
      console.error('Exercise Service Error:', error);
      throw error;
    }
  }

  async searchExercises(searchTerm: string, filters: any = {}) {
    const filteredExercises = wgerExercises.filter((ex: WgerExercise) =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filteredExercises.map((ex: WgerExercise) => ({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.primaryMuscles?.[0] || ex.category,
      difficulty: ex.difficulty,
    }));
  }

  async getExerciseById(id: string) {
    const exercise = wgerExercises.find((ex: WgerExercise) => ex.id === id);
    return exercise || null;
  }

  async getPrograms(query: ProgramQuery = {}) {
    // Mock program data
    const mockPrograms = [
      {
        id: '1',
        name: 'Beginner Full Body',
        description: 'Perfect for fitness newcomers',
        level: 'beginner',
        duration: '4 weeks',
        workoutsPerWeek: 3,
        category: 'strength',
      },
      {
        id: '2',
        name: 'Advanced Muscle Building',
        description: 'Intensive muscle building program',
        level: 'advanced',
        duration: '8 weeks',
        workoutsPerWeek: 5,
        category: 'strength',
      },
    ];

    const { level, category, page = 1, limit = 10, search } = query;
    
    let filteredPrograms = mockPrograms;
    
    if (level) {
      filteredPrograms = filteredPrograms.filter(p => p.level === level);
    }
    
    if (category) {
      filteredPrograms = filteredPrograms.filter(p => p.category === category);
    }
    
    if (search) {
      filteredPrograms = filteredPrograms.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return filteredPrograms.slice(startIndex, endIndex);
  }

  async getProgramById(id: string) {
    const programs = await this.getPrograms();
    return programs.find(p => p.id === id) || null;
  }

  async getExercisesByIds(exerciseIds: string[]) {
    return exerciseIds
      .map((id: string) => wgerExercises.find((ex: WgerExercise) => ex.id === id))
      .filter(Boolean);
  }

  async getTotalCounts() {
    return {
      exercises: wgerExercises.length,
      programs: 2, // Mock count
    };
  }
}

export const exerciseService = new ExerciseService();