-- Fase 1: Extensão do Schema da Tabela Usuarios
-- Adicionar campos faltantes na tabela usuarios
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS cargo text,
ADD COLUMN IF NOT EXISTS telefone_fixo text,
ADD COLUMN IF NOT EXISTS telefone_mobile text,
ADD COLUMN IF NOT EXISTS numero_chamada integer,
ADD COLUMN IF NOT EXISTS turma text,
ADD COLUMN IF NOT EXISTS nome_responsavel text,
ADD COLUMN IF NOT EXISTS email_responsavel text,
ADD COLUMN IF NOT EXISTS permissao_relatorios boolean DEFAULT false;

-- Criar tabela de preferências de usuário
CREATE TABLE IF NOT EXISTS public.preferencias_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  notificacao_email boolean DEFAULT true,
  notificacao_site boolean DEFAULT true,
  notificacao_push boolean DEFAULT false,
  aceite_notificacoes boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(usuario_id)
);

-- Criar tabela de consentimento de usuário
CREATE TABLE IF NOT EXISTS public.consentimento_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  termos_uso boolean DEFAULT false,
  politica_privacidade boolean DEFAULT false,
  data_consentimento timestamp with time zone DEFAULT now(),
  ip_consentimento text,
  navegador_consentimento text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(usuario_id)
);

-- Expandir tabela logs_acesso com mais detalhes
ALTER TABLE public.logs_acesso 
ADD COLUMN IF NOT EXISTS dispositivo text,
ADD COLUMN IF NOT EXISTS localizacao text,
ADD COLUMN IF NOT EXISTS tipo_login text DEFAULT 'manual';

-- Adicionar triggers para updated_at
CREATE TRIGGER update_preferencias_usuario_updated_at
  BEFORE UPDATE ON public.preferencias_usuario
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consentimento_usuario_updated_at
  BEFORE UPDATE ON public.consentimento_usuario
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.preferencias_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consentimento_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para preferencias_usuario
CREATE POLICY "Usuários podem ver suas próprias preferências"
ON public.preferencias_usuario
FOR SELECT
USING (
  auth.uid() = usuario_id OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Usuários podem atualizar suas próprias preferências"
ON public.preferencias_usuario
FOR UPDATE
USING (
  auth.uid() = usuario_id OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Usuários podem inserir suas próprias preferências"
ON public.preferencias_usuario
FOR INSERT
WITH CHECK (
  auth.uid() = usuario_id OR 
  public.get_current_user_role() = 'admin'
);

-- Políticas RLS para consentimento_usuario
CREATE POLICY "Usuários podem ver seus próprios consentimentos"
ON public.consentimento_usuario
FOR SELECT
USING (
  auth.uid() = usuario_id OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Usuários podem atualizar seus próprios consentimentos"
ON public.consentimento_usuario
FOR UPDATE
USING (
  auth.uid() = usuario_id OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Usuários podem inserir seus próprios consentimentos"
ON public.consentimento_usuario
FOR INSERT
WITH CHECK (
  auth.uid() = usuario_id OR 
  public.get_current_user_role() = 'admin'
);

-- Criar função para inicializar preferências padrão ao criar usuário
CREATE OR REPLACE FUNCTION public.initialize_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir preferências padrão
  INSERT INTO public.preferencias_usuario (usuario_id)
  VALUES (NEW.id)
  ON CONFLICT (usuario_id) DO NOTHING;
  
  -- Inserir consentimento inicial
  INSERT INTO public.consentimento_usuario (usuario_id)
  VALUES (NEW.id)
  ON CONFLICT (usuario_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para inicializar preferências ao criar usuário
DROP TRIGGER IF EXISTS on_user_created_initialize_preferences ON public.usuarios;
CREATE TRIGGER on_user_created_initialize_preferences
  AFTER INSERT ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_preferences();