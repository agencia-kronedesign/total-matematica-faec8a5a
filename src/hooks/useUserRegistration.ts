import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserFormData, UserRegistrationData } from '@/types/user';

export const useUserRegistration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();

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
      console.log('[UserRegistration] ===== INÍCIO DO CADASTRO =====');
      console.log('[UserRegistration] Dados do formulário:', { 
        email: formData.email, 
        tipo: formData.tipo_usuario,
        isAdmin: isAdmin,
        currentPath: window.location.pathname
      });

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

      let authData;

      // FORÇAR Edge Function se estiver em rota administrativa
      const isAdminRoute = window.location.pathname.startsWith('/admin') || 
                          window.location.pathname.includes('cadastro-usuario');
      
      const shouldUseEdgeFunction = isAdmin || isAdminRoute;
      
      console.log('[UserRegistration] Decisão de método:', {
        isAdmin,
        isAdminRoute,
        shouldUseEdgeFunction,
        currentPath: window.location.pathname
      });

      if (shouldUseEdgeFunction) {
        console.log('[UserRegistration] ✅ USANDO EDGE FUNCTION - Preservando sessão admin');
        
        // Salvar sessão atual como backup
        const currentSession = await supabase.auth.getSession();
        console.log('[UserRegistration] Sessão atual salva:', {
          userId: currentSession.data.session?.user?.id,
          email: currentSession.data.session?.user?.email
        });
        
        const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('admin-create-user', {
          body: {
            email: formData.email,
            password: senha,
            nome: formData.nome,
            tipo_usuario: formData.tipo_usuario,
          },
        });

        if (edgeFunctionError) {
          console.error('[UserRegistration] ❌ Erro na Edge Function:', edgeFunctionError);
          throw edgeFunctionError;
        }
        
        if (!edgeFunctionData?.user) {
          console.error('[UserRegistration] ❌ Edge Function não retornou usuário');
          throw new Error('Erro ao criar usuário via Edge Function');
        }

        console.log('[UserRegistration] ✅ Usuário criado via Edge Function:', edgeFunctionData.user.id);
        authData = { user: edgeFunctionData.user };
        
        // Verificar se sessão ainda está válida após Edge Function
        const sessionAfterEdge = await supabase.auth.getSession();
        console.log('[UserRegistration] Sessão após Edge Function:', {
          still_logged: !!sessionAfterEdge.data.session,
          same_user: sessionAfterEdge.data.session?.user?.id === currentSession.data.session?.user?.id
        });
        
        // Para criação via Edge Function, aguardar menos tempo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } else {
        console.log('[UserRegistration] ⚠️  USANDO SIGNUP NORMAL - Pode afetar sessão');
        
        // Cadastro público - usar signUp normal que loga automaticamente
        const { data: signUpData, error: authError } = await supabase.auth.signUp({
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

        if (!signUpData.user) {
          throw new Error('Erro ao criar usuário');
        }

        authData = signUpData;
        
        // Aguardar o trigger handle_new_user criar o registro inicial
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Verificar se o usuário foi criado na tabela usuarios
      let attempts = 0;
      let userExists = false;
      while (attempts < 5 && !userExists) {
        const { data: checkUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle();
        
        if (checkUser) {
          userExists = true;
        } else {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!userExists) {
        console.error('[UserRegistration] Usuário não foi criado na tabela usuarios');
        throw new Error('Erro na criação do usuário - tente novamente');
      }

      console.log('[UserRegistration] Atualizando dados do usuário:', { 
        id: authData.user.id, 
        tipo_usuario: formData.tipo_usuario 
      });

      // Atualizar dados completos do usuário (se não foi criado via Edge Function)
      if (!isAdmin) {
        const { error: updateError, data: updateData } = await supabase
          .from('usuarios')
          .update({
            nome: formData.nome,
            tipo_usuario: formData.tipo_usuario,
            cargo: formData.cargo,
            telefone_fixo: formData.telefone_fixo?.replace(/\D/g, '') || null,
            telefone_mobile: formData.telefone_mobile?.replace(/\D/g, '') || null,
            cpf: formData.cpf?.replace(/\D/g, '') || null,
            rg: formData.rg?.replace(/\D/g, '') || null,
            endereco: formData.endereco,
            cidade: formData.cidade,
            estado: formData.estado,
            cep: formData.cep?.replace(/\D/g, '') || null,
            data_nascimento: formData.data_nascimento,
            numero_matricula: formData.numero_matricula,
            numero_chamada: formData.numero_chamada,
            turma: formData.turma,
            nome_responsavel: formData.nome_responsavel,
            email_responsavel: formData.email_responsavel,
            permissao_relatorios: formData.permissao_relatorios,
            ativo: formData.ativo,
          })
          .eq('id', authData.user.id)
          .select();

        if (updateError) {
          console.error('[UserRegistration] Erro ao atualizar dados:', updateError);
          throw updateError;
        }

        console.log('[UserRegistration] Dados atualizados com sucesso:', updateData);

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
      }

      // Verificar se o tipo foi realmente atualizado
      const { data: verifyUser } = await supabase
        .from('usuarios')
        .select('tipo_usuario')
        .eq('id', authData.user.id)
        .single();

      if (verifyUser?.tipo_usuario !== formData.tipo_usuario) {
        console.error('[UserRegistration] Tipo de usuário não foi atualizado corretamente:', {
          esperado: formData.tipo_usuario,
          atual: verifyUser?.tipo_usuario
        });
        throw new Error(`Erro: usuário foi criado como ${verifyUser?.tipo_usuario} em vez de ${formData.tipo_usuario}`);
      }

      console.log('[UserRegistration] ===== USUÁRIO CADASTRADO COM SUCESSO =====');
      console.log('[UserRegistration] Detalhes:', {
        usuarioCriado: authData.user.id,
        email: formData.email,
        tipo: formData.tipo_usuario,
        metodoUsado: shouldUseEdgeFunction ? 'Edge Function' : 'signUp',
        isAdmin: isAdmin,
        isAdminRoute: isAdminRoute
      });

      // Verificar sessão final para admins
      if (shouldUseEdgeFunction) {
        const finalSession = await supabase.auth.getSession();
        console.log('[UserRegistration] Verificação final da sessão admin:', {
          sessionExists: !!finalSession.data.session,
          currentUser: finalSession.data.session?.user?.email,
          isStillAdmin: finalSession.data.session?.user?.id === user?.id
        });
      }

      toast({
        title: "Usuário cadastrado com sucesso!",
        description: `Email: ${formData.email}. A senha foi enviada por email.`,
      });

      // Redirecionamento automático para admins
      if (shouldUseEdgeFunction && window.location.pathname.startsWith('/admin')) {
        console.log('[UserRegistration] Redirecionando admin para lista de usuários');
        setTimeout(() => {
          window.location.href = '/admin/usuarios';
        }, 1500);
      }

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