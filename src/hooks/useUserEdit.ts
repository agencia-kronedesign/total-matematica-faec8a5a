import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserFormData } from '@/types/user';

export const useUserEdit = (userId?: string) => {
  const [userData, setUserData] = useState<UserFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id: string) => {
    try {
      setLoading(true);
      console.log('[UserEdit] Buscando dados do usuário:', id);

      // Buscar dados do usuário
      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();

      if (userError) throw userError;

      // Buscar preferências
      const { data: preferences, error: preferencesError } = await supabase
        .from('preferencias_usuario')
        .select('*')
        .eq('usuario_id', id)
        .maybeSingle();

      if (preferencesError) {
        console.warn('[UserEdit] Erro ao buscar preferências:', preferencesError);
      }

      // Buscar consentimento
      const { data: consent, error: consentError } = await supabase
        .from('consentimento_usuario')
        .select('*')
        .eq('usuario_id', id)
        .maybeSingle();

      if (consentError) {
        console.warn('[UserEdit] Erro ao buscar consentimento:', consentError);
      }

      // Transformar dados para o formato do formulário
      const formData: UserFormData = {
        nome: user.nome,
        email: user.email,
        senha: '', // Não preencher senha por segurança
        confirmarSenha: '',
        tipo_usuario: user.tipo_usuario,
        ativo: user.ativo || false,
        cargo: user.cargo || '',
        telefone_fixo: user.telefone_fixo || '',
        telefone_mobile: user.telefone_mobile || '',
        cpf: user.cpf || '',
        rg: user.rg || '',
        endereco: user.endereco || '',
        cidade: user.cidade || '',
        estado: user.estado || '',
        cep: user.cep || '',
        data_nascimento: user.data_nascimento || '',
        numero_matricula: user.numero_matricula || '',
        numero_chamada: user.numero_chamada || undefined,
        turma: user.turma || '',
        nome_responsavel: user.nome_responsavel || '',
        email_responsavel: user.email_responsavel || '',
        permissao_relatorios: user.permissao_relatorios || false,
        notificacao_email: preferences?.notificacao_email ?? true,
        notificacao_site: preferences?.notificacao_site ?? true,
        notificacao_push: preferences?.notificacao_push ?? false,
        aceite_notificacoes: preferences?.aceite_notificacoes ?? true,
        termos_uso: consent?.termos_uso ?? false,
        politica_privacidade: consent?.politica_privacidade ?? false,
        captcha: 'ADMIN_EDIT', // Bypass captcha para edição
      };

      setUserData(formData);
      console.log('[UserEdit] Dados carregados:', formData);
    } catch (error: any) {
      console.error('[UserEdit] Erro ao buscar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    userData,
    loading,
    refetch: () => userId && fetchUserData(userId)
  };
};