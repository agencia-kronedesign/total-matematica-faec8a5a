import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRegistration } from '@/hooks/useUserRegistration';
import { useUserEdit } from '@/hooks/useUserEdit';
import { UserFormData, UserType, USER_TYPE_LABELS } from '@/types/user';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, RefreshCw, MapPin, Loader2, Key, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormattedInput } from '@/components/ui/formatted-input';
import { useCEP } from '@/hooks/useCEP';
import { useCidades } from '@/hooks/useCidades';
import { useFormProgressTracker } from '@/hooks/useFormProgressTracker';
import { Progress } from '@/components/ui/progress';

// Componentes especializados
import UserTypeSelector from './user-fields/UserTypeSelector';
import BasicPersonalFields from './user-fields/BasicPersonalFields';
import StudentRegistrationFields from './user-fields/StudentRegistrationFields';
import StaffRegistrationFields from './user-fields/StaffRegistrationFields';

const createUserRegistrationSchema = (isEditMode: boolean) => z.object({
  // Dados pessoais básicos
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: isEditMode ? z.string().optional() : z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string().optional(),
  tipo_usuario: z.enum(['admin', 'direcao', 'coordenador', 'professor', 'aluno', 'responsavel']),
  ativo: z.boolean().default(true),
  
  // Dados pessoais complementares
  telefone_mobile: z.string().optional(),
  telefone_fixo: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  data_nascimento: z.string().optional(),
  
  // Endereço
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  
  // Dados institucionais/profissionais
  cargo: z.string().optional(),
  numero_matricula: z.string().optional(),
  numero_chamada: z.number().optional(),
  turma: z.string().optional(),
  area_atuacao: z.string().optional(),
  formacao: z.string().optional(),
  experiencia_anos: z.number().optional(),
  formacao_gestao: z.string().optional(),
  
  // Responsável
  nome_responsavel: z.string().optional(),
  email_responsavel: z.string().email().optional().or(z.literal('')),
  
  // Segundo responsável
  nome_responsavel2: z.string().optional(),
  email_responsavel2: z.string().email().optional().or(z.literal('')),
  
  // Permissões
  permissao_relatorios: z.boolean().default(false),
  
  // Preferências
  notificacao_email: z.boolean().default(true),
  notificacao_site: z.boolean().default(true),
  notificacao_push: z.boolean().default(false),
  aceite_notificacoes: z.boolean().default(true),
  
  // Consentimento
  termos_uso: isEditMode ? z.boolean().optional() : z.boolean().refine(val => val === true, 'Deve aceitar os termos de uso'),
  politica_privacidade: isEditMode ? z.boolean().optional() : z.boolean().refine(val => val === true, 'Deve aceitar a política de privacidade'),
  
  // Segurança
  captcha: isEditMode ? z.string().optional() : z.string().min(1, 'Captcha é obrigatório'),
}).superRefine((data, ctx) => {
  // Validação de senhas
  if (!isEditMode && data.senha !== data.confirmarSenha) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Senhas não coincidem",
      path: ["confirmarSenha"],
    });
  }
  if (isEditMode && data.senha && data.senha !== data.confirmarSenha) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Senhas não coincidem",
      path: ["confirmarSenha"],
    });
  }
  
  // Validações específicas para alunos
  if (data.tipo_usuario === 'aluno') {
    if (!data.numero_matricula) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Número de matrícula é obrigatório para alunos',
        path: ['numero_matricula']
      });
    }
    if (!data.numero_chamada) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Número de chamada é obrigatório para alunos',
        path: ['numero_chamada']
      });
    }
    if (!data.turma) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Turma é obrigatória para alunos',
        path: ['turma']
      });
    }
    if (!data.nome_responsavel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nome do responsável é obrigatório para alunos',
        path: ['nome_responsavel']
      });
    }
    if (!data.email_responsavel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email do responsável é obrigatório para alunos',
        path: ['email_responsavel']
      });
    }
  }
  
  // Validações específicas para staff
  if (['professor', 'coordenador', 'direcao', 'admin'].includes(data.tipo_usuario)) {
    if (!data.cargo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cargo/Função é obrigatório para este tipo de usuário',
        path: ['cargo']
      });
    }
  }
  
  // Validação de captcha apenas para cadastro
  if (!isEditMode && !data.captcha) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Captcha é obrigatório',
      path: ['captcha']
    });
  }
});

interface UserRegistrationFormProps {
  userId?: string;
}

const UserRegistrationForm = ({ userId }: UserRegistrationFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('tipo-usuario');
  const { registerUser, generatePassword, loading } = useUserRegistration();
  const { userData, loading: loadingUser } = useUserEdit(userId);
  const { toast } = useToast();
  const { fetchAddressByCEP, loading: cepLoading } = useCEP();
  
  const isEditMode = !!userId;
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(createUserRegistrationSchema(isEditMode)),
    defaultValues: {
      ativo: true,
      permissao_relatorios: false,
      notificacao_email: true,
      notificacao_site: true,
      notificacao_push: false,
      aceite_notificacoes: true,
      termos_uso: false,
      politica_privacidade: false,
      captcha: isEditMode ? 'ADMIN_EDIT' : '',
      tipo_usuario: 'aluno',
    },
  });

  // Preencher formulário quando os dados do usuário chegarem
  useEffect(() => {
    if (userData && isEditMode) {
      form.reset(userData);
    }
  }, [userData, isEditMode, form]);

  const watchedUserType = form.watch('tipo_usuario');
  
  // Estado e cidades
  const selectedEstado = form.watch('estado');
  const { data: cidadesDisponiveis = [], isLoading: isLoadingCidades } = useCidades(selectedEstado);
  
  const formSteps = ['tipo-usuario', 'dados-pessoais', 'acesso', 'endereco', 'preferencias', 'consentimento'];
  const { progressPercentage, getStepStatus } = useFormProgressTracker(
    formSteps,
    activeTab,
    form.formState.errors
  );

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    form.setValue('senha', newPassword);
    form.setValue('confirmarSenha', newPassword);
  };

  const handleCEPChange = async (cep: string) => {
    if (cep && cep.replace(/\D/g, '').length === 8) {
      const addressData = await fetchAddressByCEP(cep);
      if (addressData) {
        form.setValue('cidade', addressData.localidade);
        form.setValue('estado', addressData.uf);
        if (addressData.logradouro) {
          form.setValue('endereco', addressData.logradouro);
        }
      }
    }
  };

  const onSubmit = async (data: UserFormData) => {
    console.log('[UserRegistrationForm] Submitting form data:', data);
    
    if (isEditMode) {
      // Lógica de atualização
      const result = await updateUser(userId!, data);
      if (result.success) {
        // Não resetar o form na edição
      }
    } else {
      // Lógica de cadastro
      const result = await registerUser(data);
      if (result.success) {
        form.reset();
        setActiveTab('tipo-usuario');
      }
    }
  };

  const updateUser = async (id: string, data: UserFormData) => {
    setIsUpdating(true);
    try {
      console.log('[UserRegistrationForm] Atualizando usuário:', id);

      // Função auxiliar para sanitizar valores vazios para null
      const sanitize = (value: any) => {
        if (value === '' || value === undefined) return null;
        return value;
      };

      // Preparar dados para atualização (convertendo strings vazias para null)
      const updateData: any = {
        nome: data.nome,
        email: data.email,
        tipo_usuario: data.tipo_usuario,
        cargo: sanitize(data.cargo),
        telefone_fixo: sanitize(data.telefone_fixo),
        telefone_mobile: sanitize(data.telefone_mobile),
        cpf: sanitize(data.cpf),
        rg: sanitize(data.rg),
        endereco: sanitize(data.endereco),
        cidade: sanitize(data.cidade),
        estado: sanitize(data.estado),
        cep: sanitize(data.cep),
        data_nascimento: sanitize(data.data_nascimento),
        numero_matricula: sanitize(data.numero_matricula),
        numero_chamada: sanitize(data.numero_chamada),
        turma: sanitize(data.turma),
        nome_responsavel: sanitize(data.nome_responsavel),
        email_responsavel: sanitize(data.email_responsavel),
        permissao_relatorios: data.permissao_relatorios,
        ativo: data.ativo,
      };

      // Atualizar usuário
      const { error: userError } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', id);

      if (userError) throw userError;

      // Se senha foi preenchida, atualizar no Supabase Auth
      let passwordUpdated = false;
      if (data.senha && data.senha.length >= 6) {
        console.log('[UserRegistrationForm] Atualizando senha no Auth...');
        
        const { data: resetData, error: resetError } = await supabase.functions.invoke(
          'admin-reset-password',
          {
            body: { userId: id, newPassword: data.senha }
          }
        );

        if (resetError) {
          console.error('[UserRegistrationForm] Erro ao atualizar senha:', resetError);
          throw new Error('Erro ao atualizar senha: ' + resetError.message);
        }

        console.log('[UserRegistrationForm] Senha atualizada com sucesso');
        passwordUpdated = true;
      }

      // Atualizar preferências
      const { error: preferencesError } = await supabase
        .from('preferencias_usuario')
        .update({
          notificacao_email: data.notificacao_email,
          notificacao_site: data.notificacao_site,
          notificacao_push: data.notificacao_push,
          aceite_notificacoes: data.aceite_notificacoes,
        })
        .eq('usuario_id', id);

      if (preferencesError) {
        console.error('[UserRegistrationForm] Erro ao atualizar preferências:', preferencesError);
      }

      // Atualizar consentimento
      const { error: consentError } = await supabase
        .from('consentimento_usuario')
        .update({
          termos_uso: data.termos_uso,
          politica_privacidade: data.politica_privacidade,
        })
        .eq('usuario_id', id);

      if (consentError) {
        console.error('[UserRegistrationForm] Erro ao atualizar consentimento:', consentError);
      }

      toast({
        title: "Usuário atualizado com sucesso!",
        description: passwordUpdated 
          ? `Os dados de ${data.nome} foram atualizados, incluindo a senha.`
          : `Os dados de ${data.nome} foram atualizados.`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('[UserRegistrationForm] Erro na atualização:', error);
      toast({
        title: "Erro na atualização",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsUpdating(false);
    }
  };

  const isStaffType = (type: UserType) => ['admin', 'direcao', 'coordenador', 'professor'].includes(type);
  const isStudentType = (type: UserType) => type === 'aluno';
  const isParentType = (type: UserType) => type === 'responsavel';

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-totalBlue mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando dados do usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo />
          <CardTitle className="text-2xl mt-4">
            {isEditMode ? 'Editar Usuário' : 'Cadastro Completo de Usuário'}
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Atualize os dados do usuário conforme necessário'
              : 'Preencha todos os campos necessários para criar uma conta no sistema'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {!isEditMode && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progresso do Cadastro</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="w-full" />
                </div>
              )}
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-6 w-full text-xs">
                  <TabsTrigger 
                    value="tipo-usuario" 
                    className={`${getStepStatus('tipo-usuario') === 'error' ? 'border-red-500 text-red-600' : ''} ${getStepStatus('tipo-usuario') === 'completed' ? 'border-green-500 text-green-600' : ''}`}
                  >
                    Tipo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dados-pessoais" 
                    className={`${getStepStatus('dados-pessoais') === 'error' ? 'border-red-500 text-red-600' : ''} ${getStepStatus('dados-pessoais') === 'completed' ? 'border-green-500 text-green-600' : ''}`}
                  >
                    Dados
                  </TabsTrigger>
                  <TabsTrigger 
                    value="acesso"
                    className={`${getStepStatus('acesso') === 'error' ? 'border-red-500 text-red-600' : ''} ${getStepStatus('acesso') === 'completed' ? 'border-green-500 text-green-600' : ''}`}
                  >
                    Acesso
                  </TabsTrigger>
                  <TabsTrigger 
                    value="endereco"
                    className={`${getStepStatus('endereco') === 'error' ? 'border-red-500 text-red-600' : ''} ${getStepStatus('endereco') === 'completed' ? 'border-green-500 text-green-600' : ''}`}
                  >
                    Endereço
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferencias"
                    className={`${getStepStatus('preferencias') === 'error' ? 'border-red-500 text-red-600' : ''} ${getStepStatus('preferencias') === 'completed' ? 'border-green-500 text-green-600' : ''}`}
                  >
                    Preferências
                  </TabsTrigger>
                  <TabsTrigger 
                    value="consentimento"
                    className={`${getStepStatus('consentimento') === 'error' ? 'border-red-500 text-red-600' : ''} ${getStepStatus('consentimento') === 'completed' ? 'border-green-500 text-green-600' : ''}`}
                  >
                    Consentimento
                  </TabsTrigger>
                </TabsList>

                {/* Tipo de Usuário */}
                <TabsContent value="tipo-usuario" className="space-y-4">
                  <UserTypeSelector form={form} />
                </TabsContent>

                {/* Dados Pessoais */}
                <TabsContent value="dados-pessoais" className="space-y-4">
                  <BasicPersonalFields form={form} />

                  {/* Campos específicos por tipo de usuário */}
                  {isStudentType(watchedUserType) && (
                    <StudentRegistrationFields form={form} />
                  )}

                  {isStaffType(watchedUserType) && (
                    <StaffRegistrationFields form={form} userType={watchedUserType} />
                  )}
                </TabsContent>

                {/* Acesso */}
                <TabsContent value="acesso" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ativo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Conta Ativa</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permissao_relatorios"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Permissão para Relatórios</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="senha"
                      render={({ field }) => (
                         <FormItem>
                           <FormLabel>Senha {isEditMode ? '' : '*'}</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Input
                                 type={showPassword ? "text" : "password"}
                                 placeholder={isEditMode ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
                                 {...field}
                               />
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleGeneratePassword}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                          {isEditMode && form.watch('senha') && form.watch('senha').length >= 6 && (
                            <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
                              <Key className="h-4 w-4" />
                              <span>A senha será atualizada ao salvar</span>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmarSenha"
                      render={({ field }) => (
                         <FormItem>
                           <FormLabel>Confirmar Senha {isEditMode ? '' : '*'}</FormLabel>
                          <FormControl>
                             <Input
                               type={showPassword ? "text" : "password"}
                               placeholder={isEditMode ? "Confirme apenas se alterou a senha" : "Confirme a senha"}
                               {...field}
                             />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Endereço */}
                <TabsContent value="endereco" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FormattedInput 
                                formatter="cep" 
                                placeholder="00000-000" 
                                {...field}
                                onValueChange={(unformatted, formatted) => {
                                  field.onChange(formatted);
                                  handleCEPChange(formatted);
                                }}
                              />
                              {cepLoading && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                  <MapPin className="h-4 w-4 animate-spin" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Endereço Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número, complemento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Limpa a cidade quando o estado muda
                              form.setValue('cidade', '');
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o Estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
                                'MG', 'MS', 'MT', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
                                'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map((estado) => (
                                <SelectItem key={estado} value={estado}>
                                  {estado}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!selectedEstado || isLoadingCidades}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue 
                                  placeholder={
                                    !selectedEstado 
                                      ? "Primeiro selecione o Estado" 
                                      : isLoadingCidades 
                                        ? "Carregando cidades..." 
                                        : "Selecione a Cidade"
                                  } 
                                />
                                {isLoadingCidades && (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cidadesDisponiveis.length === 0 && !isLoadingCidades && selectedEstado && (
                                <SelectItem value="no-cities" disabled>
                                  Nenhuma cidade disponível
                                </SelectItem>
                              )}
                              {cidadesDisponiveis.map((cidade) => (
                                <SelectItem key={cidade} value={cidade}>
                                  {cidade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Preferências */}
                <TabsContent value="preferencias" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
                    
                    <FormField
                      control={form.control}
                      name="aceite_notificacoes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Aceito receber notificações do sistema</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pl-6 space-y-3">
                      <FormField
                        control={form.control}
                        name="notificacao_email"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Notificações por email</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notificacao_site"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Notificações no site</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notificacao_push"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Notificações push (se disponível)</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Consentimento */}
                <TabsContent value="consentimento" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Termos e Consentimento</h3>
                    
                    {!isEditMode && (
                      <FormField
                        control={form.control}
                        name="captcha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verificação de Segurança *</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Input placeholder="Digite o código: ABCD123" {...field} />
                                <div className="bg-gray-200 p-2 rounded border">ABCD123</div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <Alert>
                      <AlertDescription>
                        <strong>LGPD - Lei Geral de Proteção de Dados:</strong> Seus dados pessoais serão tratados de acordo com a legislação vigente e utilizados exclusivamente para os fins educacionais do sistema Total Matemática.
                      </AlertDescription>
                    </Alert>

                    <FormField
                      control={form.control}
                      name="termos_uso"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Li e aceito os <a href="/termos-de-uso" className="text-blue-600 hover:underline" target="_blank">Termos de Uso</a> *
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="politica_privacidade"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Li e aceito a <a href="/politica-privacidade" className="text-blue-600 hover:underline" target="_blank">Política de Privacidade</a> *
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Alerta de erros de validação */}
              {Object.keys(form.formState.errors).length > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Existem campos com erros. Verifique todas as abas antes de salvar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['tipo-usuario', 'dados-pessoais', 'acesso', 'endereco', 'preferencias', 'consentimento'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                  disabled={activeTab === 'tipo-usuario'}
                >
                  Anterior
                </Button>

                <div className="flex space-x-2">
                  {/* Botão salvar sempre visível em modo edição */}
                  {isEditMode && (
                    <Button 
                      type="submit" 
                      disabled={isUpdating || loadingUser} 
                      className="bg-totalBlue min-w-[200px]"
                    >
                      {isUpdating ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Atualizando...</span>
                        </div>
                      ) : (
                        'Atualizar Usuário'
                      )}
                    </Button>
                  )}

                  {/* Botão próximo (não mostrar na última aba) */}
                  {activeTab !== 'consentimento' && (
                    <Button
                      type="button"
                      variant={isEditMode ? "outline" : "default"}
                      onClick={() => {
                        const tabs = ['tipo-usuario', 'dados-pessoais', 'acesso', 'endereco', 'preferencias', 'consentimento'];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1]);
                        }
                      }}
                    >
                      Próximo
                    </Button>
                  )}

                  {/* Botão cadastrar apenas para novos usuários na última aba */}
                  {!isEditMode && activeTab === 'consentimento' && (
                    <Button type="submit" disabled={loading} className="bg-totalBlue min-w-[200px]">
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Cadastrando...</span>
                        </div>
                      ) : (
                        'Cadastrar Usuário'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRegistrationForm;