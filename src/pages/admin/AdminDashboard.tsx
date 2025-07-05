import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, School, BookOpen, MessageSquare, BarChart3, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { userProfile } = useAuth();

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: '124',
      description: 'Alunos, professores e coordenadores',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Escolas Ativas',
      value: '3',
      description: 'Escolas cadastradas no sistema',
      icon: School,
      color: 'text-green-600',
    },
    {
      title: 'Exercícios',
      value: '56',
      description: 'Total de exercícios cadastrados',
      icon: BookOpen,
      color: 'text-purple-600',
    },
    {
      title: 'Mensagens',
      value: '23',
      description: 'Mensagens não lidas',
      icon: MessageSquare,
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
        </div>
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <Users className="w-4 h-4 mr-1" />
          Administrador
        </Badge>
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
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

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
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Novo usuário cadastrado</p>
                <p className="text-xs text-muted-foreground">João Silva - há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Exercício adicionado</p>
                <p className="text-xs text-muted-foreground">Matemática - Frações - há 4 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Configuração alterada</p>
                <p className="text-xs text-muted-foreground">Sistema de notificações - há 1 dia</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;