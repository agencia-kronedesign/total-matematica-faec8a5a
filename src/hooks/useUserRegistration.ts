import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserFormData, UserRegistrationData } from '@/types/user';

export const useUserRegistration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const validateCPF = (cpf: string): boolean => {
    if (!cpf) return true; // CPF é opcional para alguns tipos
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    
    // Validação básica do CPF
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cpf[9]) !== digit) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cpf[10]) !== digit) return false;
    
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMatricula = (matricula: string, tipo_usuario: string): boolean => {
    if (tipo_usuario === 'aluno' && !matricula) return false;
    if (tipo_usuario !== 'aluno' && matricula) return false;
    return true;
  };

  const registerUser = async (formData: UserFormData): Promise<{ success: boolean; user?: any; error?: string }> => {
    try {
      setLoading(true);
      console.log('[UserRegistration] Iniciando cadastro de usuário:', { email: formData.email, tipo: formData.tipo_usuario });

      // Validações
      if (!validateEmail(formData.email)) {
        throw new Error('Email inválido');
      }

      if (!validateCPF(formData.cpf || '')) {
        throw new Error('CPF inválido');
      }

      if (!validateMatricula(formData.numero_matricula || '', formData.tipo_usuario)) {
        throw new Error('Matrícula é obrigatória para alunos');
      }

      if (!formData.termos_uso || !formData.politica_privacidade) {
        throw new Error('É necessário aceitar os termos de uso e política de privacidade');
      }

      // Gerar senha se não fornecida
      const senha = formData.senha || generatePassword();

      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Email já cadastrado no sistema');
      }

      // Verificar se matrícula já existe (para alunos)
      if (formData.numero_matricula) {
        const { data: existingMatricula } = await supabase
          .from('usuarios')
          .select('numero_matricula')
          .eq('numero_matricula', formData.numero_matricula)
          .maybeSingle();

        if (existingMatricula) {
          throw new Error('Número de matrícula já cadastrado');
        }
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: formData.nome,
            tipo_usuario: formData.tipo_usuario,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Aguardar um pouco para o trigger handle_new_user funcionar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Atualizar dados completos do usuário
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          nome: formData.nome,
          tipo_usuario: formData.tipo_usuario,
          cargo: formData.cargo,
          telefone_fixo: formData.telefone_fixo,
          telefone_mobile: formData.telefone_mobile,
          cpf: formData.cpf,
          rg: formData.rg,
          endereco: formData.endereco,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
          data_nascimento: formData.data_nascimento,
          numero_matricula: formData.numero_matricula,
          numero_chamada: formData.numero_chamada,
          turma: formData.turma,
          nome_responsavel: formData.nome_responsavel,
          email_responsavel: formData.email_responsavel,
          permissao_relatorios: formData.permissao_relatorios,
          ativo: formData.ativo,
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('[UserRegistration] Erro ao atualizar dados:', updateError);
        throw updateError;
      }

      // Atualizar preferências
      const { error: preferencesError } = await supabase
        .from('preferencias_usuario')
        .update({
          notificacao_email: formData.notificacao_email,
          notificacao_site: formData.notificacao_site,
          notificacao_push: formData.notificacao_push,
          aceite_notificacoes: formData.aceite_notificacoes,
        })
        .eq('usuario_id', authData.user.id);

      if (preferencesError) {
        console.error('[UserRegistration] Erro ao atualizar preferências:', preferencesError);
      }

      // Atualizar consentimento
      const { error: consentError } = await supabase
        .from('consentimento_usuario')
        .update({
          termos_uso: formData.termos_uso,
          politica_privacidade: formData.politica_privacidade,
          data_consentimento: new Date().toISOString(),
          ip_consentimento: 'N/A', // TODO: Capturar IP real
          navegador_consentimento: navigator.userAgent,
        })
        .eq('usuario_id', authData.user.id);

      if (consentError) {
        console.error('[UserRegistration] Erro ao atualizar consentimento:', consentError);
      }

      console.log('[UserRegistration] Usuário cadastrado com sucesso:', authData.user.id);

      toast({
        title: "Usuário cadastrado com sucesso!",
        description: `Email: ${formData.email} | Senha: ${senha}`,
      });

      return { success: true, user: authData.user };
    } catch (error: any) {
      console.error('[UserRegistration] Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    registerUser,
    generatePassword,
    validateCPF,
    validateEmail,
    loading
  };
};