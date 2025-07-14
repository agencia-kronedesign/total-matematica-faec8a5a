
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserStatusVerification } from '@/hooks/useUserStatusVerification';
import { useAuthService } from '@/hooks/useAuthService';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Loading inicial da sessão
  const [authLoading, setAuthLoading] = useState(false); // Loading de operações de auth
  const { toast } = useToast();
  const { verifyUserStatus, forceLogout } = useUserStatusVerification();
  const { signUp: authSignUp, signIn: authSignIn, signOut: authSignOut } = useAuthService();
  const { userProfile, fetchUserProfile, clearUserProfile } = useUserProfile();

  const isAdmin = userProfile?.tipo_usuario === 'admin';
  const isProfessor = userProfile?.tipo_usuario === 'professor';
  const userType = userProfile?.tipo_usuario || null;

  const signOut = async () => {
    try {
      setAuthLoading(true);
      
      // Limpar dados locais primeiro para evitar estados inconsistentes
      setUser(null);
      setSession(null);
      clearUserProfile();
      
      // Fazer logout no Supabase (isso limpa automaticamente o storage)
      await authSignOut();
      
      // Forçar limpeza completa do estado de autenticação
      // Aguardar um pouco para garantir que o estado seja limpo
      setTimeout(() => {
        setAuthLoading(false);
      }, 100);
      
    } catch (error: any) {
      console.error('💥 Erro completo no logout:', error);
      
      // Mesmo com erro, limpar o estado local
      setUser(null);
      setSession(null);
      clearUserProfile();
      
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    // Configurar o listener de alteração de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Buscar perfil do usuário após login e verificar se está ativo
          await fetchUserProfile(session.user.id);
          // Login bem-sucedido, limpar authLoading
          setAuthLoading(false);
        } else {
          clearUserProfile();
          // Logout ou sessão limpa, garantir que authLoading seja resetado
          setAuthLoading(false);
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão atual no carregamento inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 Verificando sessão inicial:', session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verificação periódica mais frequente (a cada 10 segundos)
  useEffect(() => {
    if (!user?.id) return;

    const checkUserStatus = async () => {
      const isActive = await verifyUserStatus(user.id);
      if (!isActive) {
        console.log('🚫 Verificação periódica: usuário inativo detectado, fazendo logout...');
        await forceLogout('Sua conta foi desativada. Entre em contato com o administrador.');
      }
    };

    // Verificar imediatamente e depois a cada 10 segundos
    checkUserStatus();
    const interval = setInterval(checkUserStatus, 10 * 1000); // 10 segundos

    return () => clearInterval(interval);
  }, [user?.id, verifyUserStatus, forceLogout]);

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      setAuthLoading(true);
      await authSignUp(email, password, nome);
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      
      // Limpar qualquer estado anterior antes de tentar login
      setUser(null);
      setSession(null);
      clearUserProfile();
      
      await authSignIn(email, password);
      
      // O loading será limpo automaticamente pelo onAuthStateChange quando o login for bem-sucedido
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      setAuthLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    authLoading,
    userProfile,
    isAdmin,
    isProfessor,
    userType,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
