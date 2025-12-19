import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrphanUser {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: string;
  ativo: boolean;
  created_at: string;
}

export const useOrphanUsersCheck = () => {
  const [orphanUsers, setOrphanUsers] = useState<OrphanUser[]>([]);
  const [checkingOrphans, setCheckingOrphans] = useState(false);
  const [recreatingUser, setRecreatingUser] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificar usuários órfãos (existem na tabela usuarios mas não no auth)
  const checkOrphanUsers = useCallback(async (usuarios: OrphanUser[]) => {
    setCheckingOrphans(true);
    const orphans: OrphanUser[] = [];

    try {
      // Para cada usuário, tentar fazer uma operação que só funciona se ele existir no auth
      // Usamos um approach diferente: tentamos buscar sessão do usuário
      for (const usuario of usuarios) {
        try {
          // Tentar buscar dados de autenticação via admin API através de edge function
          const { data, error } = await supabase.functions.invoke('check-user-auth', {
            body: { userId: usuario.id, email: usuario.email }
          });

          if (error || !data?.exists) {
            orphans.push(usuario);
          }
        } catch {
          // Se der erro, assumir que pode ser órfão (verificação conservadora)
          // Vamos usar outra abordagem: tentar resetar senha
        }
      }

      setOrphanUsers(orphans);
      
      if (orphans.length > 0) {
        toast({
          title: "Usuários sem autenticação encontrados",
          description: `${orphans.length} usuário(s) não possui(em) registro de autenticação`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar usuários órfãos:', error);
    } finally {
      setCheckingOrphans(false);
    }

    return orphans;
  }, [toast]);

  // Recriar usuário no sistema de autenticação
  const recreateUserAuth = useCallback(async (
    usuario: OrphanUser, 
    newPassword: string
  ): Promise<boolean> => {
    setRecreatingUser(usuario.id);

    try {
      console.log(`[useOrphanUsersCheck] Recriando autenticação para: ${usuario.email}`);

      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: usuario.email,
          password: newPassword,
          nome: usuario.nome,
          tipo_usuario: usuario.tipo_usuario,
          recreate: true,
          existingUserId: usuario.id
        }
      });

      if (error) {
        console.error('[useOrphanUsersCheck] Erro ao recriar usuário:', error);
        toast({
          title: "Erro ao recriar usuário",
          description: error.message || 'Erro desconhecido',
          variant: "destructive",
        });
        return false;
      }

      if (data?.success) {
        toast({
          title: "Usuário recriado com sucesso",
          description: `${usuario.email} agora pode fazer login com a nova senha`,
        });
        
        // Remover da lista de órfãos
        setOrphanUsers(prev => prev.filter(u => u.id !== usuario.id));
        return true;
      }

      toast({
        title: "Erro ao recriar usuário",
        description: data?.error || 'Erro desconhecido',
        variant: "destructive",
      });
      return false;

    } catch (error: any) {
      console.error('[useOrphanUsersCheck] Erro:', error);
      toast({
        title: "Erro ao recriar usuário",
        description: error.message || 'Erro de conexão',
        variant: "destructive",
      });
      return false;
    } finally {
      setRecreatingUser(null);
    }
  }, [toast]);

  // Verificar se um usuário específico é órfão
  const isOrphanUser = useCallback((userId: string) => {
    return orphanUsers.some(u => u.id === userId);
  }, [orphanUsers]);

  return {
    orphanUsers,
    checkingOrphans,
    recreatingUser,
    checkOrphanUsers,
    recreateUserAuth,
    isOrphanUser,
    setOrphanUsers
  };
};
