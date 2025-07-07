export type UserType = 'admin' | 'direcao' | 'coordenador' | 'professor' | 'aluno' | 'responsavel';

export interface UserPreferences {
  id?: string;
  usuario_id: string;
  notificacao_email: boolean;
  notificacao_site: boolean;
  notificacao_push: boolean;
  aceite_notificacoes: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserConsent {
  id?: string;
  usuario_id: string;
  termos_uso: boolean;
  politica_privacidade: boolean;
  data_consentimento?: string;
  ip_consentimento?: string;
  navegador_consentimento?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserRegistrationData {
  // Campos obrigatórios para todos
  nome: string;
  email: string;
  senha?: string;
  tipo_usuario: UserType;
  ativo: boolean;
  
  // Campos específicos por perfil
  cargo?: string;
  telefone_fixo?: string;
  telefone_mobile?: string;
  cpf?: string;
  rg?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  data_nascimento?: string;
  
  // Campos institucionais
  numero_matricula?: string;
  numero_chamada?: number;
  turma?: string;
  
  // Responsável (para alunos menores)
  nome_responsavel?: string;
  email_responsavel?: string;
  
  // Permissões
  permissao_relatorios: boolean;
  
  // Preferências
  preferencias: UserPreferences;
  
  // Consentimento
  consentimento: UserConsent;
}

export interface UserFormData extends Omit<UserRegistrationData, 'preferencias' | 'consentimento'> {
  confirmarSenha?: string;
  notificacao_email: boolean;
  notificacao_site: boolean;
  notificacao_push: boolean;
  aceite_notificacoes: boolean;
  termos_uso: boolean;
  politica_privacidade: boolean;
  captcha: string;
}

export const USER_TYPE_LABELS: Record<UserType, string> = {
  admin: 'Administrador',
  direcao: 'Direção',
  coordenador: 'Coordenador',
  professor: 'Professor',
  aluno: 'Aluno',
  responsavel: 'Responsável'
};

export const USER_TYPES_HIERARCHY = {
  admin: 0,
  direcao: 1,
  coordenador: 2,
  professor: 3,
  aluno: 4,
  responsavel: 4
};