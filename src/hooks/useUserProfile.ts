import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserStatusVerification } from '@/hooks/useUserStatusVerification';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const { verifyUserStatus, forceLogout } = useUserStatusVerification();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Buscando perfil para usuário:', userId);
      
      // VERIFICAÇÃO CRÍTICA: Verificar se usuário está ativo ANTES de carregar perfil
      const isActive = await verifyUserStatus(userId);
      if (!isActive) {
        console.log('🚫 Usuário inativo detectado durante busca de perfil, bloqueando acesso...');
        await forceLogout('Sua conta foi desativada. Entre em contato com o administrador.');
        return;
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        return;
      }
      
      if (!data) {
        console.warn('⚠️ Perfil não encontrado para o usuário:', userId);
        return;
      }
      
      // VERIFICAÇÃO DUPLA: Confirmar que o perfil carregado está ativo
      if (data.ativo === false) {
        console.log('🚫 Perfil carregado está inativo, fazendo logout...');
        await forceLogout('Sua conta foi desativada. Entre em contato com o administrador.');
        return;
      }
      
      console.log('✅ Perfil ativo carregado:', data.email, data.ativo);
      setUserProfile(data);
    } catch (error) {
      console.error('💥 Erro ao buscar perfil:', error);
    }
  };

  const clearUserProfile = () => {
    setUserProfile(null);
  };

  return { userProfile, fetchUserProfile, clearUserProfile };
};