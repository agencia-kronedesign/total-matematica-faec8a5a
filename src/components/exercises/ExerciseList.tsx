
import React from 'react';
import ExerciseCard from './ExerciseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useExercises } from '@/hooks/useExercises';

interface ExerciseListProps {
  filter: 'todos' | 'pendentes' | 'concluidos';
  selectedCategory: string | null;
  selectedDifficulty: string | null;
}

const ExerciseList = ({ filter, selectedCategory, selectedDifficulty }: ExerciseListProps) => {
  const { data: exercises, isLoading } = useExercises();
  
  const filteredExercises = exercises?.filter(exercise => {
    if (!exercise.subcategoria) return false;
    
    // Filtro por categoria
    if (selectedCategory && exercise.subcategoria.categoria.id !== selectedCategory) {
      return false;
    }
    
    // Filtro por dificuldade
    if (selectedDifficulty) {
      const nivel = exercise.subcategoria.nivel_dificuldade;
      if (!nivel) return false;
      
      if (selectedDifficulty === 'facil' && nivel > 2) return false;
      if (selectedDifficulty === 'medio' && (nivel <= 2 || nivel > 4)) return false;
      if (selectedDifficulty === 'dificil' && nivel <= 4) return false;
    }
    
    return true;
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-16 w-full mb-2" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!filteredExercises || filteredExercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Nenhum exercício encontrado para os filtros selecionados.</p>
        <p className="text-muted-foreground">Tente mudar os filtros para ver mais resultados.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredExercises.map(exercise => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
};

export default ExerciseList;
