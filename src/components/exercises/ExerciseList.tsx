
import React from 'react';
import ExerciseCard from './ExerciseCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ExerciseListProps {
  filter: 'todos' | 'pendentes' | 'concluidos';
  selectedCategory: string | null;
  selectedDifficulty: string | null;
}

// Dados de exemplo para demonstração
const mockExercises = [
  {
    id: '1',
    title: 'Equações de Primeiro Grau',
    category: 'algebra',
    difficulty: 'facil',
    description: 'Resolva as seguintes equações de primeiro grau.',
    dueDate: '2025-05-10',
    completed: false
  },
  {
    id: '2',
    title: 'Geometria Analítica',
    category: 'geometria',
    difficulty: 'medio',
    description: 'Calcule a distância entre pontos no plano cartesiano.',
    dueDate: '2025-05-15',
    completed: true
  },
  {
    id: '3',
    title: 'Probabilidade Condicional',
    category: 'probabilidade',
    difficulty: 'dificil',
    description: 'Resolva problemas de probabilidade condicional.',
    dueDate: '2025-05-20',
    completed: false
  },
  {
    id: '4',
    title: 'Operações com Frações',
    category: 'aritmetica',
    difficulty: 'facil',
    description: 'Realize operações de adição, subtração, multiplicação e divisão com frações.',
    dueDate: '2025-05-12',
    completed: false
  },
  {
    id: '5',
    title: 'Teorema de Pitágoras',
    category: 'geometria',
    difficulty: 'medio',
    description: 'Aplique o Teorema de Pitágoras para resolver problemas.',
    dueDate: '2025-05-18',
    completed: true
  },
];

const ExerciseList = ({ filter, selectedCategory, selectedDifficulty }: ExerciseListProps) => {
  // Simulando um carregamento
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simulando o tempo de carregamento
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Filtrando os exercícios com base nas seleções
  const filteredExercises = mockExercises.filter(exercise => {
    // Filtro por status (todos, pendentes, concluídos)
    if (filter === 'pendentes' && exercise.completed) return false;
    if (filter === 'concluidos' && !exercise.completed) return false;
    
    // Filtro por categoria
    if (selectedCategory && exercise.category !== selectedCategory) return false;
    
    // Filtro por dificuldade
    if (selectedDifficulty && exercise.difficulty !== selectedDifficulty) return false;
    
    return true;
  });
  
  if (loading) {
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
  
  if (filteredExercises.length === 0) {
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
