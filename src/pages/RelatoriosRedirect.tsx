import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Componente de redirecionamento para /relatorios
 * Redireciona usuários para a página correta baseado no tipo de usuário
 */
const RelatoriosRedirect = () => {
  const { userProfile, loading } = useAuth();

  useEffect(() => {
    console.log('[DEBUG-ROTA] RelatoriosRedirect - userProfile:', userProfile?.tipo_usuario);
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redireciona baseado no tipo de usuário
  const tipoUsuario = userProfile?.tipo_usuario;

  if (tipoUsuario === 'admin' || tipoUsuario === 'direcao' || tipoUsuario === 'coordenador') {
    // Admin/Direção/Coordenador vão para o painel admin
    return <Navigate to="/admin" replace />;
  }

  if (tipoUsuario === 'professor') {
    // Professor vai para suas atividades (onde pode acessar relatórios)
    return <Navigate to="/professor/atividades" replace />;
  }

  // Alunos e outros vão para o dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RelatoriosRedirect;
