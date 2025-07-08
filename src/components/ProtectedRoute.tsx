
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStatusVerification } from '@/hooks/useUserStatusVerification';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const { verifyUserStatus, forceLogout } = useUserStatusVerification();
  const [verificationComplete, setVerificationComplete] = useState(false);

  // Verificação adicional de status sempre que a rota é acessada
  useEffect(() => {
    const verifyAccess = async () => {
      if (!user?.id) {
        setVerificationComplete(true);
        return;
      }

      console.log('🔒 ProtectedRoute: Verificando acesso para:', user.email);
      
      const isActive = await verifyUserStatus(user.id);
      if (!isActive) {
        console.log('🚫 ProtectedRoute: Usuário inativo detectado, bloqueando acesso...');
        await forceLogout('Acesso negado: conta desativada');
        return;
      }

      console.log('✅ ProtectedRoute: Acesso liberado para usuário ativo');
      setVerificationComplete(true);
    };

    verifyAccess();
  }, [user?.id, user?.email, verifyUserStatus, forceLogout]);

  if (loading || !verificationComplete) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-totalBlue mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Verificar se o usuário está logado
  if (!user) {
    console.log('🚫 ProtectedRoute: Usuário não logado, redirecionando...');
    return <Navigate to="/entrar" replace />;
  }

  // Verificar se o perfil foi carregado e se o usuário está ativo
  if (userProfile !== null && userProfile.ativo === false) {
    console.log('🚫 ProtectedRoute: Usuário inativo no perfil, redirecionando...');
    return <Navigate to="/entrar" replace />;
  }

  // Se o perfil ainda está sendo carregado, mostrar loading
  if (userProfile === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-totalBlue mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando dados do usuário...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
