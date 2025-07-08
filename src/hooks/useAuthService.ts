import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthService = () => {
  const { toast } = useToast();

  const signUp = async (email: string, password: string, nome: string) => {
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
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Tentativa de login para:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    console.log('✅ Login realizado com sucesso:', email);
  };

  const signOut = async () => {
    console.log('🚪 Iniciando logout...');
    
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
  };

  return { signUp, signIn, signOut };
};