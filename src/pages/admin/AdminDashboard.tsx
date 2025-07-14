import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  School, 
  BookOpen, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Clock,
  TrendingUp,
  Database,
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const { stats, loading: statsLoading, refreshStats } = useDashboardStats();
  const { activities, loading: activitiesLoading, refreshActivities } = useRecentActivity(8);
  const { health, loading: healthLoading, refreshHealth } = useSystemHealth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refreshStats(),
      refreshActivities(),
      refreshHealth()
    ]);
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'cadastro': return Users;
      case 'login': return CheckCircle;
      case 'exercicio_criado': return BookOpen;
      case 'escola_cadastrada': return School;
      default: return Activity;
    }
  };

  const getActivityColor = (tipo: string) => {
    switch (tipo) {
      case 'cadastro': return 'bg-blue-500';
      case 'login': return 'bg-green-500';
      case 'exercicio_criado': return 'bg-purple-500';
      case 'escola_cadastrada': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: statsLoading ? '...' : stats?.totalUsuarios.toString() || '0',
      description: `Usuários ativos no mês: ${statsLoading ? '...' : stats?.usuariosAtivosMes || 0}`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Escolas Ativas',
      value: statsLoading ? '...' : stats?.totalEscolas.toString() || '0',
      description: 'Escolas cadastradas no sistema',
      icon: School,
      color: 'text-green-600',
    },
    {
      title: 'Exercícios',
      value: statsLoading ? '...' : stats?.totalExercicios.toString() || '0',
      description: `Resolvidos no mês: ${statsLoading ? '...' : stats?.exerciciosResolvidosMes || 0}`,
      icon: BookOpen,
      color: 'text-purple-600',
    },
    {
      title: 'Atividades',
      value: statsLoading ? '...' : stats?.totalAtividades.toString() || '0',
      description: 'Total de atividades criadas',
      icon: Activity,
      color: 'text-orange-600',
    },
  ];

  const quickActions = [
    {
      title: 'Gerenciar Usuários',
      description: 'Adicionar, editar ou remover usuários do sistema',
      icon: Users,
      href: '/admin/usuarios',
    },
    {
      title: 'Configurações',
      description: 'Configurações gerais do sistema',
      icon: Settings,
      href: '/admin/configuracoes',
    },
    {
      title: 'Relatórios',
      description: 'Visualizar relatórios e estatísticas',
      icon: BarChart3,
      href: '/admin/relatorios',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo, {userProfile?.nome}
          </p>
          {stats?.dataAtualizacao && (
            <p className="text-xs text-muted-foreground mt-1">
              Última atualização: {formatDistanceToNow(new Date(stats.dataAtualizacao), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshAll}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <Users className="w-4 h-4 mr-1" />
            Administrador
          </Badge>
          {health && (
            <Badge 
              variant={health.status === 'healthy' ? 'default' : 'destructive'}
              className={`${health.status === 'healthy' ? 'bg-green-100 text-green-800' : 
                health.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}
            >
              {React.createElement(getStatusIcon(health.status), { className: "w-4 h-4 mr-1" })}
              Sistema {health.status === 'healthy' ? 'Saudável' : 
                health.status === 'warning' ? 'Atenção' : 'Crítico'}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health Panel */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Saúde do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getStatusColor(health.status)}`}>
                  {health.status === 'healthy' ? '100%' : health.status === 'warning' ? '85%' : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">Status Geral</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{health.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Usuários Ativos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{health.responseTime}ms</div>
                <p className="text-xs text-muted-foreground">Tempo Resposta</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{health.errorRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Taxa de Erro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <action.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Atividade Recente</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshActivities}
              disabled={activitiesLoading}
            >
              <RefreshCw className={`w-4 h-4 ${activitiesLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          <CardDescription>
            Últimas ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.tipo_atividade);
                return (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 ${getActivityColor(activity.tipo_atividade)} rounded-full`}></div>
                    <ActivityIcon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.usuario?.nome && `${activity.usuario.nome} - `}
                        {formatDistanceToNow(new Date(activity.data_atividade), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;