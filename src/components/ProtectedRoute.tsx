
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  // Verificar se o usuário está logado
  if (!user) {
    console.log('🚫 ProtectedRoute: Usuário não logado, redirecionando...');
    return <Navigate to="/entrar" replace />;
  }

  // Verificar se o perfil foi carregado e se o usuário está ativo
  if (userProfile !== null && userProfile.ativo === false) {
    console.log('🚫 ProtectedRoute: Usuário inativo detectado, redirecionando...');
    return <Navigate to="/entrar" replace />;
  }

  // Se o perfil ainda está sendo carregado, mostrar loading
  if (userProfile === null) {
    return <div className="flex justify-center items-center h-screen">Verificando permissões...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
