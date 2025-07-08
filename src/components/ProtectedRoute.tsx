
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

  if (!user) {
    return <Navigate to="/entrar" />;
  }

  // Verificar se o usuário está ativo
  if (userProfile && userProfile.ativo === false) {
    return <Navigate to="/entrar" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
