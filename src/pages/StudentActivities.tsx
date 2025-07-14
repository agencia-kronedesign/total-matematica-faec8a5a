import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Clock, BookOpen, User, Play } from 'lucide-react';
import { useStudentActivities, StudentActivity } from '@/hooks/useStudentActivities';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/Header';

const ActivityCard = ({ activity }: { activity: StudentActivity }) => {
  const navigate = useNavigate();
  
  const isOverdue = activity.data_limite && new Date(activity.data_limite) < new Date();
  const isCompleted = activity.percentual_conclusao === 100;
  
  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge variant="default" className="bg-green-500">Concluída</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">Atrasada</Badge>;
    }
    return <Badge variant="secondary">Pendente</Badge>;
  };

  const getTypeLabel = (tipo: string) => {
    return tipo === 'casa' ? 'Para Casa' : 'Em Aula';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{activity.titulo}</CardTitle>
            <CardDescription className="mt-1">
              {activity.descricao || 'Sem descrição'}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{activity.professor_nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{getTypeLabel(activity.tipo)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>{format(new Date(activity.data_envio), 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>
          {activity.data_limite && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Até {format(new Date(activity.data_limite), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{activity.exercicios_resolvidos}/{activity.exercicios_count} exercícios</span>
          </div>
          <Progress value={activity.percentual_conclusao} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {activity.percentual_conclusao}% concluído
          </p>
        </div>

        <Button 
          onClick={() => navigate(`/atividades/${activity.id}`)}
          className="w-full"
          disabled={activity.exercicios_count === 0}
        >
          <Play className="h-4 w-4 mr-2" />
          {isCompleted ? 'Revisar Atividade' : 'Continuar Atividade'}
        </Button>
      </CardContent>
    </Card>
  );
};

const StudentActivities = () => {
  const { data: activities, isLoading, error } = useStudentActivities();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar atividades</h1>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Ocorreu um erro inesperado'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pendingActivities = activities?.filter(a => a.percentual_conclusao < 100) || [];
  const completedActivities = activities?.filter(a => a.percentual_conclusao === 100) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Minhas Atividades</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe suas atividades e progresso de aprendizado
            </p>
          </div>

          {pendingActivities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Atividades Pendentes</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingActivities.map(activity => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          )}

          {completedActivities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Atividades Concluídas</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedActivities.map(activity => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          )}

          {activities?.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
              <p className="text-muted-foreground">
                Você não possui atividades no momento ou não está matriculado em uma turma.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentActivities;