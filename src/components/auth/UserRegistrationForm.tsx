import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRegistration } from '@/hooks/useUserRegistration';
import { useUserEdit } from '@/hooks/useUserEdit';
import { UserFormData, UserType, USER_TYPE_LABELS } from '@/types/user';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, RefreshCw, MapPin } from 'lucide-react';
import Logo from '@/components/Logo';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormattedInput } from '@/components/ui/formatted-input';
import { useCEP } from '@/hooks/useCEP';
import { useFormProgressTracker } from '@/hooks/useFormProgressTracker';
import { Progress } from '@/components/ui/progress';

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
  cpf: z.string().optional(), // CPF não é mais obrigatório
  rg: z.string().optional(),
  data_nascimento: z.string().optional(),
  
  // Endereço
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  
  // Dados institucionais
  cargo: z.string().optional(),
  numero_matricula: z.string().optional(),
  numero_chamada: z.number().optional(),
  turma: z.string().optional(),
  
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
  termos_uso: z.boolean().refine(val => val === true, 'Deve aceitar os termos de uso'),
  politica_privacidade: z.boolean().refine(val => val === true, 'Deve aceitar a política de privacidade'),
  
  // Segurança
  captcha: z.string().min(1, 'Captcha é obrigatório'),
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
});

interface UserRegistrationFormProps {
  userId?: string;
}

const UserRegistrationForm = ({ userId }: UserRegistrationFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dados-pessoais');
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
      captcha: '',
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
  
  const formSteps = ['dados-pessoais', 'acesso', 'endereco', 'preferencias', 'consentimento'];
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
        setActiveTab('dados-pessoais');
      }
    }
  };

  const updateUser = async (id: string, data: UserFormData) => {
    try {
      console.log('[UserRegistrationForm] Atualizando usuário:', id);

      // Preparar dados para atualização
      const updateData: any = {
        nome: data.nome,
        email: data.email,
        tipo_usuario: data.tipo_usuario,
        cargo: data.cargo,
        telefone_fixo: data.telefone_fixo,
        telefone_mobile: data.telefone_mobile,
        cpf: data.cpf,
        rg: data.rg,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        data_nascimento: data.data_nascimento,
        numero_matricula: data.numero_matricula,
        numero_chamada: data.numero_chamada,
        turma: data.turma,
        nome_responsavel: data.nome_responsavel,
        email_responsavel: data.email_responsavel,
        permissao_relatorios: data.permissao_relatorios,
        ativo: data.ativo,
      };

      // Atualizar usuário
      const { error: userError } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', id);

      if (userError) throw userError;

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
        description: `Os dados de ${data.nome} foram atualizados.`,
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
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger 
                    value="dados-pessoais" 
                    className={`${getStepStatus('dados-pessoais') === 'error' ? 'border-red-500 text-red-600' : ''} ${getStepStatus('dados-pessoais') === 'completed' ? 'border-green-500 text-green-600' : ''}`}
                  >
                    Dados Pessoais
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

                {/* Dados Pessoais */}
                <TabsContent value="dados-pessoais" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Digite o email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone_mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Celular</FormLabel>
                          <FormControl>
                            <FormattedInput 
                              formatter="phone" 
                              placeholder="(11) 99999-9999" 
                              {...field}
                              onValueChange={(unformatted, formatted) => {
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone_fixo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Fixo</FormLabel>
                          <FormControl>
                            <FormattedInput 
                              formatter="phone" 
                              placeholder="(11) 3333-3333" 
                              {...field}
                              onValueChange={(unformatted, formatted) => {
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <FormattedInput 
                              formatter="cpf" 
                              placeholder="000.000.000-00" 
                              {...field}
                              onValueChange={(unformatted, formatted) => {
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <FormattedInput 
                              formatter="rg" 
                              placeholder="00.000.000-0" 
                              {...field}
                              onValueChange={(unformatted, formatted) => {
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_nascimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isStaffType(watchedUserType) && (
                      <FormField
                        control={form.control}
                        name="cargo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo/Função *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Professor de Matemática" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Campos específicos para alunos */}
                  {isStudentType(watchedUserType) && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-900 col-span-full">Dados do Aluno</h3>
                        
                        <FormField
                          control={form.control}
                          name="numero_matricula"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Matrícula *</FormLabel>
                              <FormControl>
                                <Input placeholder="202512345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="numero_chamada"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Chamada *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="7" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="turma"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Turma/Série *</FormLabel>
                              <FormControl>
                                <Input placeholder="7A" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <h4 className="text-md font-medium text-blue-800 col-span-full">Responsável Principal</h4>
                        
                        <FormField
                          control={form.control}
                          name="nome_responsavel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Responsável *</FormLabel>
                              <FormControl>
                                <Input placeholder="Maria Silva" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email_responsavel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email do Responsável *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="maria@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <h4 className="text-md font-medium text-blue-800 col-span-full mt-4">Segundo Responsável (Opcional)</h4>
                        
                        <FormField
                          control={form.control}
                          name="nome_responsavel2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Segundo Responsável</FormLabel>
                              <FormControl>
                                <Input placeholder="João Silva" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email_responsavel2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email do Segundo Responsável</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="joao@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Acesso */}
                <TabsContent value="acesso" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipo_usuario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Usuário *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(USER_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
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
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="São Paulo" {...field} />
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
                          <FormControl>
                            <Input placeholder="SP" {...field} />
                          </FormControl>
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

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['dados-pessoais', 'acesso', 'endereco', 'preferencias', 'consentimento'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                  disabled={activeTab === 'dados-pessoais'}
                >
                  Anterior
                </Button>

                {activeTab === 'consentimento' ? (
                  <Button type="submit" disabled={loading || loadingUser} className="bg-totalBlue min-w-[200px]">
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{isEditMode ? 'Atualizando...' : 'Cadastrando...'}</span>
                      </div>
                    ) : (
                      isEditMode ? 'Atualizar Usuário' : 'Cadastrar Usuário'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      const tabs = ['dados-pessoais', 'acesso', 'endereco', 'preferencias', 'consentimento'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                  >
                    Próximo
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRegistrationForm;