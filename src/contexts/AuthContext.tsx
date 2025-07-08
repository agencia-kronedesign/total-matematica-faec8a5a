
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserStatusVerification } from '@/hooks/useUserStatusVerification';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: any | null;
  isAdmin: boolean;
  isProfessor: boolean;
  userType: string | null;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const { toast } = useToast();
  const { verifyUserStatus, forceLogout } = useUserStatusVerification();

  const isAdmin = userProfile?.tipo_usuario === 'admin';
  const isProfessor = userProfile?.tipo_usuario === 'professor';
  const userType = userProfile?.tipo_usuario || null;

  const signOut = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      setLoading(true);
      
      // Limpar dados locais primeiro
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout:', error);
        throw error;
      }
      
      console.log('✅ Logout realizado com sucesso');
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });
    } catch (error: any) {
      console.error('💥 Erro completo no logout:', error);
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        } else {
          setUserProfile(null);
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
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: nome,
          },
        },
      });

      if (error) throw error;
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Verifique seu email para confirmar o cadastro",
      });
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔐 Tentativa de login para:', email);
      
      // VERIFICAÇÃO CRÍTICA: Verificar se o usuário está ativo ANTES do login
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, ativo, nome')
        .eq('email', email)
        .single();

      if (userError) {
        console.error('❌ Erro ao verificar usuário antes do login:', userError);
        throw new Error('Erro ao verificar credenciais');
      }

      if (!userData) {
        throw new Error('Usuário não encontrado');
      }

      if (userData.ativo === false) {
        console.log('🚫 Login bloqueado: usuário inativo:', email);
        throw new Error('Sua conta foi desativada. Entre em contato com o administrador.');
      }

      console.log('✅ Usuário verificado como ativo, prosseguindo com login...');

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('✅ Login realizado com sucesso para usuário ativo:', email);
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
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
