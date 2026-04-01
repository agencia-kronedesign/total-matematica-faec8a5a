
-- 1. Tabela de regras de acesso configuráveis
CREATE TABLE IF NOT EXISTS public.access_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('view','create','update','delete','execute')),
  conditions JSONB DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.access_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem gerenciar access_rules"
  ON public.access_rules FOR ALL
  USING (get_current_user_role() = 'admin'::user_type);

-- Trigger updated_at
CREATE TRIGGER update_access_rules_updated_at
  BEFORE UPDATE ON public.access_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Tabela de hierarquia de perfis
CREATE TABLE IF NOT EXISTS public.role_hierarchy (
  parent_role TEXT NOT NULL,
  child_role TEXT NOT NULL,
  PRIMARY KEY (parent_role, child_role)
);

ALTER TABLE public.role_hierarchy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem gerenciar role_hierarchy"
  ON public.role_hierarchy FOR ALL
  USING (get_current_user_role() = 'admin'::user_type);

-- Inserir hierarquia padrão
INSERT INTO public.role_hierarchy (parent_role, child_role) VALUES
  ('admin', 'direcao'),
  ('direcao', 'coordenador'),
  ('coordenador', 'professor'),
  ('professor', 'aluno')
ON CONFLICT DO NOTHING;

-- 3. Tabela de conversas AI
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  message TEXT NOT NULL,
  response TEXT,
  model TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem acessar ai_conversations"
  ON public.ai_conversations FOR ALL
  USING (get_current_user_role() = 'admin'::user_type);
