
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserStatusVerification = () => {
  const { toast } = useToast();

  const verifyUserStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('ativo, nome, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erro ao verificar status do usuário:', error);
        return false;
      }

      if (!data) {
        console.warn('⚠️ Usuário não encontrado:', userId);
        return false;
      }

      console.log(`🔍 Status verificado para ${data.email}: ${data.ativo ? 'ATIVO' : 'INATIVO'}`);
      return data.ativo === true;
    } catch (error) {
      console.error('💥 Erro na verificação de status:', error);
      return false;
    }
  }, []);

  const forceLogout = useCallback(async (reason: string) => {
    try {
      console.log(`🚪 Forçando logout: ${reason}`);
      
      // Fazer logout no Supabase (ele cuida da limpeza do storage)
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout forçado:', error);
      }
      
      toast({
        title: "Acesso negado",
        description: reason,
        variant: "destructive",
      });
      
      // Aguardar um pouco antes de redirecionar para garantir limpeza
      setTimeout(() => {
        window.location.href = '/entrar';
      }, 500);
      
    } catch (error) {
      console.error('💥 Erro no logout forçado:', error);
      // Mesmo com erro, redirecionar
      setTimeout(() => {
        window.location.href = '/entrar';
      }, 500);
    }
  }, [toast]);

  return { verifyUserStatus, forceLogout };
};
