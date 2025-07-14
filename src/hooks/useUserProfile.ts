import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserStatusVerification } from '@/hooks/useUserStatusVerification';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const { forceLogout } = useUserStatusVerification();
  const fetchingRef = useRef(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    // Evitar múltiplas chamadas simultâneas
    if (fetchingRef.current) {
      console.log('🔄 Fetch já em andamento, ignorando...');
      return;
    }

    fetchingRef.current = true;
    
    try {
      console.log('🔍 Buscando perfil para usuário:', userId);
      
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
      
      // Verificar se usuário está ativo apenas uma vez
      if (data.ativo === false) {
        console.log('🚫 Perfil carregado está inativo, fazendo logout...');
        await forceLogout('Sua conta foi desativada. Entre em contato com o administrador.');
        return;
      }
      
      console.log('✅ Perfil ativo carregado:', data.email, data.ativo);
      setUserProfile(data);
    } catch (error) {
      console.error('💥 Erro ao buscar perfil:', error);
    } finally {
      fetchingRef.current = false;
    }
  }, [forceLogout]);

  const clearUserProfile = useCallback(() => {
    setUserProfile(null);
    fetchingRef.current = false;
  }, []);

  return { userProfile, fetchUserProfile, clearUserProfile };
};