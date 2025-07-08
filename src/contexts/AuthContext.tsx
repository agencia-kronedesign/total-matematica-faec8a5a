
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
      
      // Handle case where no profile exists
      if (!data) {
        console.warn('⚠️ Perfil não encontrado para o usuário:', userId);
        return;
      }
      
      console.log('✅ Perfil carregado:', data);
      
      // Verificar se o usuário está ativo
      if (data.ativo === false) {
        console.log('🚫 Usuário inativo detectado, fazendo logout...');
        toast({
          title: "Acesso negado",
          description: "Sua conta foi desativada. Entre em contato com o administrador.",
          variant: "destructive",
        });
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
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Buscar perfil do usuário após login
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão atual no carregamento inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verificar periodicamente se o usuário ainda está ativo (a cada 5 minutos)
  useEffect(() => {
    if (!user?.id) return;

    const checkUserStatus = async () => {
      try {
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
          console.log('🚫 Usuário foi desativado, fazendo logout...');
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

    // Verificar imediatamente e depois a cada 5 minutos
    checkUserStatus();
    const interval = setInterval(checkUserStatus, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user?.id]);

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
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
