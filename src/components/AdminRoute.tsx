import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, requiredRole = 'admin' }) => {
  const { user, loading, userProfile } = useAuth();
  const { hasPermission } = usePermissions();

  if (loading || (user && !userProfile)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" />;
  }

  if (!hasPermission(requiredRole)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta área do sistema.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;