
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Exercise {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
  // Conversor de categoria para texto em português
  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      algebra: 'Álgebra',
      geometria: 'Geometria',
      probabilidade: 'Probabilidade',
      aritmetica: 'Aritmética'
    };
    return categories[category] || category;
  };
  
  // Conversor de dificuldade para texto em português
  const getDifficultyLabel = (difficulty: string) => {
    const difficulties: Record<string, string> = {
      facil: 'Fácil',
      medio: 'Médio',
      dificil: 'Difícil'
    };
    return difficulties[difficulty] || difficulty;
  };
  
  // Classes CSS para as badges de dificuldade
  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty) {
      case 'facil':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'dificil':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  // Formatando a data de entrega
  const formattedDueDate = format(new Date(exercise.dueDate), "dd 'de' MMMM", { locale: ptBR });
  
  return (
    <Card className={`overflow-hidden ${exercise.completed ? 'bg-gray-50' : 'bg-white'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{exercise.title}</CardTitle>
          {exercise.completed && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Concluído
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">{getCategoryLabel(exercise.category)}</Badge>
          <Badge className={getDifficultyBadgeClass(exercise.difficulty)}>
            {getDifficultyLabel(exercise.difficulty)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600">{exercise.description}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Entrega: {formattedDueDate}
        </p>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4">
        <Button 
          className="w-full" 
          variant={exercise.completed ? "outline" : "default"}
        >
          {exercise.completed ? 'Ver Resultado' : 'Iniciar Exercício'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExerciseCard;
