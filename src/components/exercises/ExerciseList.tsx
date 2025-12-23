
import React from 'react';
import ExerciseCard from './ExerciseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useExercises } from '@/hooks/useExercises';
import { CheckCircle, BookOpen, FileQuestion } from 'lucide-react';

interface ExerciseListProps {
  filter: 'todos' | 'pendentes' | 'concluidos';
  selectedCategory: string | null;
  selectedDifficulty: string | null;
}

const ExerciseList = ({ filter, selectedCategory, selectedDifficulty }: ExerciseListProps) => {
  const { data: exercises, isLoading } = useExercises();
  
  const filteredExercises = exercises?.filter(exercise => {
    if (!exercise.subcategoria) return false;
    
    // Filtro por status de conclusão (NOVO)
    if (filter === 'pendentes') {
      // Pendente = sem resposta OU resposta não correta
      const isCompleted = exercise.userResponse?.acerto_nivel === 'correto' || 
                          exercise.userResponse?.acerto_nivel === 'correto_com_margem';
      if (isCompleted) return false;
    }
    
    if (filter === 'concluidos') {
      // Concluído = resposta correta (com ou sem margem)
      const isCompleted = exercise.userResponse?.acerto_nivel === 'correto' || 
                          exercise.userResponse?.acerto_nivel === 'correto_com_margem';
      if (!isCompleted) return false;
    }
    
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
    const emptyStates = {
      todos: {
        icon: FileQuestion,
        title: "Nenhum exercício disponível no momento.",
        subtitle: "Novos exercícios serão adicionados em breve!"
      },
      pendentes: {
        icon: CheckCircle,
        title: "Nenhum exercício pendente!",
        subtitle: "Parabéns! Você completou todos os exercícios disponíveis."
      },
      concluidos: {
        icon: BookOpen,
        title: "Você ainda não concluiu nenhum exercício.",
        subtitle: "Comece resolvendo exercícios na aba 'Todos os Exercícios'!"
      }
    };
    
    const state = emptyStates[filter];
    const Icon = state.icon;
    
    return (
      <div className="text-center py-12">
        <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg text-foreground">{state.title}</p>
        <p className="text-muted-foreground mt-1">{state.subtitle}</p>
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
