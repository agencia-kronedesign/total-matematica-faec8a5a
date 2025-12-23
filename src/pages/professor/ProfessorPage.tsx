import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ProfessorSidebar from './ProfessorSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import UserMenu from '@/components/UserMenu';

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
        <main className="flex-1 flex flex-col overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8" />
              <h2 className="text-lg font-semibold text-primary">Área do Professor</h2>
            </div>
            <UserMenu />
          </header>
          <div className="flex-1 p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProfessorPage;
