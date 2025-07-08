
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        return;
      }
      
      if (!data) {
        console.warn('⚠️ Perfil não encontrado para o usuário:', userId);
        return;
      }
      
      console.log('✅ Perfil carregado:', data);
      
      // Verificar se o usuário está ativo ANTES de definir o perfil
      if (data.ativo === false) {
        console.log('🚫 Usuário inativo detectado, fazendo logout...');
        toast({
          title: "Acesso negado",
          description: "Sua conta foi desativada. Entre em contato com o administrador.",
          variant: "destructive",
        });
        // Não definir o perfil e fazer logout imediatamente
        await signOut();
        return;
      }
      
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

  // Verificar periodicamente se o usuário ainda está ativo (a cada 30 segundos)
  useEffect(() => {
    if (!user?.id) return;

    const checkUserStatus = async () => {
      try {
        console.log('🔍 Verificando status do usuário:', user.email);
        const { data, error } = await supabase
          .from('usuarios')
          .select('ativo')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar status do usuário:', error);
          return;
        }

        if (data && data.ativo === false) {
          console.log('🚫 Usuário foi desativado, fazendo logout imediato...');
          toast({
            title: "Sessão encerrada",
            description: "Sua conta foi desativada. Entre em contato com o administrador.",
            variant: "destructive",
          });
          await signOut();
        }
      } catch (error) {
        console.error('Erro na verificação periódica de status:', error);
      }
    };

    // Verificar imediatamente e depois a cada 30 segundos
    checkUserStatus();
    const interval = setInterval(checkUserStatus, 30 * 1000); // 30 segundos

    return () => clearInterval(interval);
  }, [user?.id, user?.email]);

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // O toast de sucesso será mostrado após a verificação do perfil
      console.log('✅ Login inicial realizado, aguardando verificação de perfil...');
    } catch (error: any) {
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
