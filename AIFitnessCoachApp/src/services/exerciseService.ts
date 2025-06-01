import { 
  searchExercises, 
  comprehensiveExerciseDatabase,
  getExercisesByCategory,
  getRandomExercises
} from '../data/comprehensiveExerciseDatabase';
import { workoutPrograms } from '../data/exercisesDatabase';

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
      
      // Use comprehensive database with search functionality
      const filters: any = {};
      if (muscle && muscle !== 'All') {
        filters.muscleGroup = muscle;
      }
      
      let filteredExercises = searchExercises(search || '', filters);
      
      // Implement pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedExercises = filteredExercises.slice(startIndex, endIndex);
      
      // Transform to match expected interface
      return paginatedExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        muscles: exercise.primaryMuscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        description: exercise.description,
        instructions: exercise.instructions,
        tips: exercise.tips,
        videoUrl: exercise.videoUrl,
        imageUrl: exercise.imageUrl,
      }));
    } catch (error) {
      console.error('Exercise Service Error:', error);
      throw error;
    }
  }

  async getExerciseById(id: string) {
    try {
      // Find in comprehensive database
      const exercise = comprehensiveExerciseDatabase.find(ex => ex.id === id);
      
      if (!exercise) {
        throw new Error('Exercise not found');
      }
      
      return {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        muscles: exercise.primaryMuscles,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        description: exercise.description,
        instructions: exercise.instructions,
        tips: exercise.tips,
        videoUrl: exercise.videoUrl,
        imageUrl: exercise.imageUrl,
        primaryMuscles: exercise.primaryMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
      };
    } catch (error) {
      console.error('Exercise Service Error:', error);
      throw error;
    }
  }

  async getPrograms(query: ProgramQuery = {}) {
    try {
      const { level, category, page = 1, limit = 20, search } = query;
      
      // Filter programs based on query
      let filteredPrograms = workoutPrograms.filter(program => {
        let matches = true;
        
        if (search && search.trim() !== '') {
          matches = matches && program.name.toLowerCase().includes(search.toLowerCase());
        }
        
        if (level && level !== 'All') {
          matches = matches && program.level === level;
        }
        
        if (category && category !== 'All') {
          matches = matches && program.category === category;
        }
        
        return matches;
      });
      
      // Implement pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPrograms = filteredPrograms.slice(startIndex, endIndex);
      
      return paginatedPrograms;
    } catch (error) {
      console.error('Program Service Error:', error);
      throw error;
    }
  }

  async getProgramById(id: string) {
    try {
      const program = workoutPrograms.find(p => p.id === id);
      
      if (!program) {
        throw new Error('Program not found');
      }
      
      // Get exercises for this program
      const programExercises = program.exercises.map(exerciseId => 
        comprehensiveExerciseDatabase.find(ex => ex.id === exerciseId)
      ).filter(Boolean);
      
      return {
        ...program,
        exerciseDetails: programExercises,
      };
    } catch (error) {
      console.error('Program Service Error:', error);
      throw error;
    }
  }

  // Get exercise categories for filtering
  getCategories() {
    return ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Cardio', 'Functional'];
  }

  // Get difficulty levels for filtering
  getDifficultyLevels() {
    return ['All', 'Beginner', 'Intermediate', 'Advanced'];
  }

  // Get exercise count for display
  getExerciseCount() {
    return comprehensiveExerciseDatabase.length;
  }

  // Get program count for display
  getProgramCount() {
    return workoutPrograms.length;
  }
}

export const exerciseService = new ExerciseService();