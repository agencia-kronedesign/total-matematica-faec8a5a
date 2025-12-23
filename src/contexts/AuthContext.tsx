
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
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();
  const { verifyUserStatus, forceLogout } = useUserStatusVerification();
  const { signUp: authSignUp, signIn: authSignIn, signOut: authSignOut } = useAuthService();
  const { userProfile, fetchUserProfile, clearUserProfile, refreshUserProfile } = useUserProfile();

  const isAdmin = userProfile?.tipo_usuario === 'admin';
  const isProfessor = userProfile?.tipo_usuario === 'professor';
  const userType = userProfile?.tipo_usuario || null;

  // Verificar se sessão expirou no carregamento inicial
  const checkSessionExpiry = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      return false;
    }
    
    if (!session) {
      return false;
    }
    
    // Verificar se o token expirou
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('🚫 Sessão expirada detectada, fazendo logout...');
      await supabase.auth.signOut();
      
      // Limpar dados de sessão local
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('sessionStartTime');
      
      toast({
        title: "Sessão expirada",
        description: "Por favor, faça login novamente.",
        variant: "destructive",
      });
      
      return false;
    }
    
    return true;
  };

  const signOut = async () => {
    try {
      setAuthLoading(true);
      
      // Limpar dados de sessão local
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('sessionStartTime');
      
      // Limpar dados locais primeiro
      setUser(null);
      setSession(null);
      clearUserProfile();
      
      // Fazer logout no Supabase
      await authSignOut();
      
      setTimeout(() => {
        setAuthLoading(false);
      }, 100);
      
    } catch (error: any) {
      console.error('💥 Erro completo no logout:', error);
      
      // Mesmo com erro, limpar o estado local
      setUser(null);
      setSession(null);
      clearUserProfile();
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('sessionStartTime');
      
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Verificar se sessão expirou antes de configurar listeners
      const sessionValid = await checkSessionExpiry();
      
      if (!mounted) return;

      // Configurar o listener de alteração de estado de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;
          
          console.log('🔄 [AuthContext] Auth state changed:', {
            event,
            newUserEmail: session?.user?.email,
            newUserId: session?.user?.id,
            previousUserEmail: user?.email,
            previousUserId: user?.id,
            sessionChanged: session?.user?.id !== user?.id,
            timestamp: new Date().toISOString()
          });
          
          // DETECTAR TROCA INESPERADA DE USUÁRIO
          if (user && session?.user && user.id !== session.user.id) {
            console.warn('⚠️ [AuthContext] DETECÇÃO DE TROCA DE USUÁRIO INESPERADA!', {
              from: { id: user.id, email: user.email },
              to: { id: session.user.id, email: session.user.email },
              event: event,
              currentPath: window.location.pathname
            });
            
            if (window.location.pathname.startsWith('/admin') && event !== 'SIGNED_OUT') {
              console.error('❌ [AuthContext] Troca de usuário não autorizada em área admin!');
            }
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Inicializar timestamp de atividade se não existir
            if (!localStorage.getItem('lastActivity')) {
              localStorage.setItem('lastActivity', Date.now().toString());
            }
            if (!localStorage.getItem('sessionStartTime')) {
              localStorage.setItem('sessionStartTime', Date.now().toString());
            }
            
            if (!userProfile || userProfile.id !== session.user.id) {
              console.log('[AuthContext] Buscando perfil para usuário:', session.user.id);
              setTimeout(() => {
                if (mounted) {
                  fetchUserProfile(session.user.id);
                }
              }, 100);
            }
            setAuthLoading(false);
          } else {
            console.log('[AuthContext] Limpando perfil do usuário');
            clearUserProfile();
            // Limpar dados de sessão local
            localStorage.removeItem('lastActivity');
            localStorage.removeItem('sessionStartTime');
            setAuthLoading(false);
          }
          
          setLoading(false);
        }
      );

      // Verificar sessão atual no carregamento inicial apenas se ainda for válida
      if (sessionValid) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!mounted) return;
          
          console.log('🔍 Verificando sessão inicial:', session?.user?.email);
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            setTimeout(() => {
              if (mounted) {
                fetchUserProfile(session.user.id);
              }
            }, 100);
          }
          
          setLoading(false);
        });
      } else {
        setLoading(false);
      }

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  // Verificação periódica menos frequente (a cada 30 segundos)
  useEffect(() => {
    if (!user?.id || !userProfile) return;

    let isChecking = false;

    const checkUserStatus = async () => {
      if (isChecking) return;
      isChecking = true;
      
      try {
        const isActive = await verifyUserStatus(user.id);
        if (!isActive) {
          console.log('🚫 Verificação periódica: usuário inativo detectado, fazendo logout...');
          await forceLogout('Sua conta foi desativada. Entre em contato com o administrador.');
        }
      } finally {
        isChecking = false;
      }
    };

    const interval = setInterval(checkUserStatus, 30 * 1000);

    return () => clearInterval(interval);
  }, [user?.id, userProfile, verifyUserStatus, forceLogout]);

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
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('sessionStartTime');
      
      await authSignIn(email, password);
      
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

  const value: AuthContextType = {
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
    signOut,
    refreshUserProfile: () => user?.id ? refreshUserProfile(user.id) : Promise.resolve(),
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
