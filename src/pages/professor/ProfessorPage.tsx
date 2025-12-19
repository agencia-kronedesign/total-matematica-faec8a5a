import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ProfessorSidebar from './ProfessorSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

interface ProfessorPageProps {
  children: React.ReactNode;
}

const ProfessorPage: React.FC<ProfessorPageProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { canCreateExercises } = usePermissions();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  if (!canCreateExercises()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ProfessorSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Área do Professor</h2>
            </div>
          </header>
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProfessorPage;
