
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Exercise } from '@/hooks/useExercises';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const getDifficultyLabel = (nivel: number | undefined) => {
    if (!nivel) return 'Não definida';
    if (nivel <= 2) return 'Fácil';
    if (nivel <= 4) return 'Médio';
    return 'Difícil';
  };
  
  const getDifficultyBadgeClass = (nivel: number | undefined) => {
    if (!nivel) return 'bg-gray-100 text-gray-800';
    if (nivel <= 2) return 'bg-green-100 text-green-800';
    if (nivel <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            Exercício {exercise.ordem}
          </CardTitle>
        </div>
        <div className="flex gap-2 mt-2">
          {exercise.subcategoria && (
            <>
              <Badge variant="secondary">
                {exercise.subcategoria.categoria.nome}
              </Badge>
              <Badge variant="secondary">
                {exercise.subcategoria.nome}
              </Badge>
              <Badge className={getDifficultyBadgeClass(exercise.subcategoria.nivel_dificuldade)}>
                {getDifficultyLabel(exercise.subcategoria.nivel_dificuldade)}
              </Badge>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600">Fórmula: {exercise.formula}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Margem de erro: {exercise.margem_erro}
        </p>
        {exercise.imagem_url && (
          <img 
            src={exercise.imagem_url} 
            alt="Imagem do exercício" 
            className="mt-4 rounded-md max-h-48 object-contain"
          />
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-4">
        <Button className="w-full">
          Resolver Exercício
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExerciseCard;
