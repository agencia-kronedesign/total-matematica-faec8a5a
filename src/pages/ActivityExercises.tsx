import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { useActivityExercises } from '@/hooks/useActivityExercises';
import { useStudentResponses } from '@/hooks/useActivityExercises';
import { ExerciseResolver, type ExerciseMode } from '@/components/exercises/ExerciseResolver';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import { useActivityType } from '@/hooks/useActivityType';
import { useStudentCallNumber } from '@/hooks/useStudentCallNumber';

const ActivityExercises = () => {
  const { atividadeId } = useParams<{ atividadeId: string }>();
  const navigate = useNavigate();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const { data: exercises, isLoading: exercisesLoading } = useActivityExercises(atividadeId);
  const { data: activityType } = useActivityType(atividadeId);
  const { data: studentCallNumber } = useStudentCallNumber();
  
  const currentExercise = exercises?.[currentExerciseIndex];
  const { data: responses } = useStudentResponses(currentExercise?.id);
  
  // Determinar o modo baseado no tipo da atividade
  const exerciseMode: ExerciseMode = activityType === 'casa' ? 'CASA' : 'AULA';

  const hasResponse = responses && responses.length > 0;
  const completedExercises = exercises?.filter(ex => {
    // Para cada exercício, verificar se há respostas
    return responses?.some(r => r.exercicio_id === ex.id);
  }).length || 0;

  const progressPercentage = exercises?.length ? Math.round((completedExercises / exercises.length) * 100) : 0;

  const goToNextExercise = () => {
    if (exercises && currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const goToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  if (exercisesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/atividades')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Atividades
          </Button>
          
          <div className="text-center py-12">
            <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
            <p className="text-muted-foreground">
              Esta atividade ainda não possui exercícios cadastrados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header com navegação */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/atividades')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Atividades
            </Button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Exercício {currentExerciseIndex + 1} de {exercises.length}
              </span>
              {hasResponse && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolvido
                </Badge>
              )}
            </div>
          </div>

          {/* Progresso da atividade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progresso da Atividade</CardTitle>
              <CardDescription>
                {completedExercises} de {exercises.length} exercícios concluídos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {progressPercentage}% concluído
              </p>
            </CardContent>
          </Card>

          {/* Exercício atual */}
          {currentExercise && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Exercício {currentExercise.ordem || currentExerciseIndex + 1}
                </CardTitle>
                <CardDescription>
                  {currentExercise.categoria} › {currentExercise.subcategoria}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExerciseResolver
                  exerciseId={currentExercise.id}
                  category={currentExercise.categoria}
                  subcategory={currentExercise.subcategoria}
                  order={currentExercise.ordem || currentExerciseIndex + 1}
                  formula={currentExercise.formula}
                  marginError={currentExercise.margem_erro}
                  imageUrl={currentExercise.imagem_url}
                  atividadeId={atividadeId}
                  mode={exerciseMode}
                  studentCallNumber={studentCallNumber}
                />
              </CardContent>
            </Card>
          )}

          {/* Navegação entre exercícios */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousExercise}
              disabled={currentExerciseIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Exercício Anterior
            </Button>
            
            <Button
              variant="outline"
              onClick={goToNextExercise}
              disabled={currentExerciseIndex === exercises.length - 1}
            >
              Próximo Exercício
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Resumo se chegou ao final */}
          {currentExerciseIndex === exercises.length - 1 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Atividade Concluída!</CardTitle>
                <CardDescription className="text-green-600">
                  Você chegou ao último exercício desta atividade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  Progresso final: {completedExercises} de {exercises.length} exercícios resolvidos ({progressPercentage}%)
                </p>
                <Button onClick={() => navigate('/atividades')}>
                  Voltar para Minhas Atividades
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityExercises;