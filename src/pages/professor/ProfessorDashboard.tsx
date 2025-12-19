import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, BookOpen, Home as HomeIcon, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEstatisticasProfessor, useAtividadesProfessor } from '@/hooks/useAtividadesProfessor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const ProfessorDashboard = () => {
  const { data: estatisticas, isLoading: loadingStats } = useEstatisticasProfessor();
  const { data: atividades, isLoading: loadingAtividades } = useAtividadesProfessor();

  console.log('[ProfessorAtividade] Dashboard carregado');

  const atividadesRecentes = atividades?.slice(0, 5);

  const statsCards = [
    { title: 'Total de Atividades', value: estatisticas?.total || 0, icon: Calendar, color: 'text-primary' },
    { title: 'Atividades Ativas', value: estatisticas?.ativas || 0, icon: BookOpen, color: 'text-green-600' },
    { title: 'Para Casa', value: estatisticas?.casa || 0, icon: HomeIcon, color: 'text-blue-600' },
    { title: 'Em Aula', value: estatisticas?.aula || 0, icon: BarChart2, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard do Professor</h1>
          <p className="text-muted-foreground">Gerencie suas atividades e acompanhe o progresso</p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link to="/professor/atividades?criar=true">
            <Plus className="h-4 w-4" />
            Criar Nova Atividade
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Atividades Recentes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Suas últimas atividades criadas</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/professor/atividades">Ver Todas</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAtividades ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : atividadesRecentes?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma atividade criada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira atividade para suas turmas.
              </p>
              <Button asChild>
                <Link to="/professor/atividades?criar=true">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Atividade
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {atividadesRecentes?.map((atividade) => (
                <div 
                  key={atividade.id} 
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className={`h-10 w-10 rounded flex items-center justify-center ${
                    atividade.tipo === 'casa' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {atividade.tipo === 'casa' ? <HomeIcon className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{atividade.titulo}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{atividade.turma?.nome}</span>
                      <span>•</span>
                      <span>{format(new Date(atividade.data_envio), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      <Badge variant={atividade.tipo === 'casa' ? 'secondary' : 'outline'}>
                        {atividade.tipo === 'casa' ? 'Para Casa' : 'Em Aula'}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={atividade.status === 'ativa' ? 'default' : 'secondary'}>
                    {atividade.status || 'ativa'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessorDashboard;
