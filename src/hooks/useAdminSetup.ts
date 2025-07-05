import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_SETUP_KEY = 'ADMIN_SETUP_2024';

interface AdminSetupState {
  canShowSetup: boolean;
  loading: boolean;
  error: string | null;
  adminCount: number;
  hasValidKey: boolean;
}

export const useAdminSetup = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<AdminSetupState>({
    canShowSetup: false,
    loading: true,
    error: null,
    adminCount: 0,
    hasValidKey: false,
  });

  useEffect(() => {
    const checkAdminSetup = async () => {
      try {
        console.log('🔍 Iniciando verificação de setup admin...');
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Verificar se a chave de setup está presente e é válida
        const setupKey = searchParams.get('setup');
        console.log('🔑 Chave da URL:', setupKey);
        console.log('🔑 Chave esperada:', ADMIN_SETUP_KEY);
        const hasValidKey = setupKey === ADMIN_SETUP_KEY;
        console.log('✅ Chave válida:', hasValidKey);

        // Contar quantos administradores existem
        console.log('👥 Verificando administradores existentes...');
        const { count, error } = await supabase
          .from('usuarios')
          .select('id', { count: 'exact', head: true })
          .eq('tipo_usuario', 'admin');

        if (error) {
          console.error('❌ Erro ao buscar admins:', error);
          throw error;
        }

        const adminCount = count || 0;
        console.log('👥 Total de admins:', adminCount);
        
        const canShowSetup = hasValidKey && adminCount === 0;
        console.log('🎯 Pode mostrar setup:', canShowSetup);

        setState({
          canShowSetup,
          loading: false,
          error: null,
          adminCount,
          hasValidKey,
        });

      } catch (error: any) {
        console.error('💥 Erro no useAdminSetup:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erro ao verificar configuração de administrador',
        }));
      }
    };

    checkAdminSetup();
  }, [searchParams]);

  const getSetupMessage = () => {
    if (state.loading) return null;
    
    if (!state.hasValidKey && searchParams.get('setup')) {
      return {
        type: 'error' as const,
        message: 'Chave de configuração inválida.',
      };
    }

    if (state.hasValidKey && state.adminCount > 0) {
      return {
        type: 'info' as const,
        message: 'Sistema já possui administradores configurados.',
      };
    }

    return null;
  };

  return {
    ...state,
    setupMessage: getSetupMessage(),
  };
};