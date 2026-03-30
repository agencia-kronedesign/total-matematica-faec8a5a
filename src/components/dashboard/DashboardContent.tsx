import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, GraduationCap, Shield, Book, Users, School, FileText } from 'lucide-react';
import { useStudentActivities } from '@/hooks/useStudentActivities';
import WelcomeSection from './sections/WelcomeSection';
import NotificationsSection from './sections/NotificationsSection';
import DailyExerciseSection from './sections/DailyExerciseSection';
import ProgressSection from './sections/ProgressSection';
import MedalsSection from './sections/MedalsSection';

const DashboardContent = () => {
  const { user } = useAuth();
  const { isStudent, isAdmin, canCreateExercises, isDirecao, isCoordenador, canAccessProfessorArea } = usePermissions();
  const navigate = useNavigate();
  const userName = user?.user_metadata?.nome || 'Usuário';
  
  const { data: activities, isLoading } = useStudentActivities();
  
  const pendingActivities = activities?.filter(a => a.percentual_conclusao < 100) || [];
  const recentActivities = activities?.slice(0, 3) || [];
  
  // Dashboard específico para alunos
  if (isStudent()) {
    return (
      <div className="container mx-auto px-4 py-6">
        <WelcomeSection userName={userName} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/atividades')}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg">Minhas Atividades</CardTitle>
                <CardDescription>Ver todas as atividades</CardDescription>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {pendingActivities.length} pendentes
              </p>
            </CardContent>
          </Card>
          
          <NotificationsSection />
        </div>
        
        {!isLoading && recentActivities.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>Suas atividades mais recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.exercicios_resolvidos}/{activity.exercicios_count} exercícios • {activity.percentual_conclusao}% concluído
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/atividades/${activity.id}`)}
                    >
                      {activity.percentual_conclusao === 100 ? 'Revisar' : 'Continuar'}
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/atividades')}
              >
                Ver Todas as Atividades
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          <div className="md:col-span-5">
            <DailyExerciseSection />
          </div>
          <div className="md:col-span-4">
            <ProgressSection />
          </div>
          <div className="md:col-span-3">
            <MedalsSection />
          </div>
        </div>
      </div>
    );
  }
  
  // Dashboard para não-alunos
  return (
    <div className="container mx-auto px-4 py-6">
      <WelcomeSection userName={userName} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* PROFESSOR: Área do Professor */}
        {canCreateExercises() && (
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/professor')}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg">Área do Professor</CardTitle>
                <CardDescription>Gerenciar atividades e turmas</CardDescription>
              </div>
              <GraduationCap className="h-8 w-8 text-primary" />
            </CardHeader>
          </Card>
        )}

        {/* COORDENADOR: Relatórios e Turmas */}
        {isCoordenador() && (
          <>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/relatorios')}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">Relatórios</CardTitle>
                  <CardDescription>Monitorar desempenho</CardDescription>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/professor/turmas')}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">Turmas</CardTitle>
                  <CardDescription>Acompanhar turmas</CardDescription>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </CardHeader>
            </Card>
          </>
        )}

        {/* DIREÇÃO: Gestão + Relatórios */}
        {isDirecao() && (
          <>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/usuarios')}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">Gestão de Usuários</CardTitle>
                  <CardDescription>Gerenciar usuários e acessos</CardDescription>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/escolas')}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">Escolas</CardTitle>
                  <CardDescription>Gerenciar escolas</CardDescription>
                </div>
                <School className="h-8 w-8 text-primary" />
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/relatorios')}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">Relatórios</CardTitle>
                  <CardDescription>Monitorar desempenho</CardDescription>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </CardHeader>
            </Card>
          </>
        )}

        {/* Exercícios — professor e admin */}
        {canCreateExercises() && (
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/exercicios')}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg">Exercícios</CardTitle>
                <CardDescription>Ver e gerenciar exercícios</CardDescription>
              </div>
              <Book className="h-8 w-8 text-primary" />
            </CardHeader>
          </Card>
        )}
        
        {/* ADMIN: Painel Admin */}
        {isAdmin && (
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin')}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg">Painel Admin</CardTitle>
                <CardDescription>Gerenciar sistema</CardDescription>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
