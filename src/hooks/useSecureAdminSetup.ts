import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdminSetupState {
  canShowSetup: boolean;
  loading: boolean;
  error: string | null;
  adminCount: number;
  hasValidKey: boolean;
}

// Rate limiting for setup attempts
const setupAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

export const useSecureAdminSetup = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<AdminSetupState>({
    canShowSetup: false,
    loading: true,
    error: null,
    adminCount: 0,
    hasValidKey: false,
  });

  const validateSetupKey = async (key: string): Promise<boolean> => {
    try {
      // Rate limiting by IP (using a simple client-side approach)
      const clientId = 'setup_' + (navigator.userAgent + navigator.language).slice(0, 50);
      const now = Date.now();
      const attempts = setupAttempts.get(clientId);
      
      if (attempts && attempts.count >= MAX_ATTEMPTS && now - attempts.lastAttempt < ATTEMPT_WINDOW) {
        throw new Error('Muitas tentativas de configuração. Tente novamente em 15 minutos.');
      }

      // Update attempt counter
      setupAttempts.set(clientId, {
        count: attempts ? attempts.count + 1 : 1,
        lastAttempt: now
      });

      // Server-side validation through edge function
      const { data, error } = await supabase.functions.invoke('validate-admin-setup', {
        body: { setupKey: key }
      });

      if (error) {
        throw error;
      }

      return data?.valid === true;
    } catch (error) {
      console.error('❌ Erro na validação da chave:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAdminSetup = async () => {
      try {
        console.log('🔍 Iniciando verificação segura de setup admin...');
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Check if setup key is present
        const setupKey = searchParams.get('setup');
        
        if (!setupKey) {
          setState({
            canShowSetup: false,
            loading: false,
            error: null,
            adminCount: 0,
            hasValidKey: false,
          });
          return;
        }

        // Validate setup key securely
        const hasValidKey = await validateSetupKey(setupKey);
        console.log('✅ Chave válida:', hasValidKey);

        if (!hasValidKey) {
          setState({
            canShowSetup: false,
            loading: false,
            error: 'Chave de configuração inválida',
            adminCount: 0,
            hasValidKey: false,
          });
          return;
        }

        // Count existing administrators
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
        console.error('💥 Erro no useSecureAdminSetup:', error);
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