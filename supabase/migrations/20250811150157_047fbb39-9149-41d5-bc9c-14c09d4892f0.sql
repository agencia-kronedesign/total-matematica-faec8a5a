-- FASE 1: Implementar políticas RLS para tabelas desprotegidas

-- Política RLS para matriculas
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alunos podem ver suas próprias matrículas"
ON public.matriculas
FOR SELECT
USING (
  auth.uid() = usuario_id OR 
  get_current_user_role() = ANY (ARRAY['admin'::user_type, 'direcao'::user_type, 'coordenador'::user_type])
);

CREATE POLICY "Admins podem inserir matrículas"
ON public.matriculas
FOR INSERT
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::user_type, 'direcao'::user_type, 'coordenador'::user_type]));

CREATE POLICY "Admins podem atualizar matrículas"
ON public.matriculas
FOR UPDATE
USING (get_current_user_role() = ANY (ARRAY['admin'::user_type, 'direcao'::user_type, 'coordenador'::user_type]));

CREATE POLICY "Admins podem deletar matrículas"
ON public.matriculas
FOR DELETE
USING (get_current_user_role() = ANY (ARRAY['admin'::user_type, 'direcao'::user_type]));

-- Política RLS para mensagens
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver mensagens enviadas ou recebidas"
ON public.mensagens
FOR SELECT
USING (
  auth.uid() = remetente_id OR 
  auth.uid() = destinatario_id OR
  get_current_user_role() = 'admin'::user_type
);

CREATE POLICY "Usuários podem enviar mensagens"
ON public.mensagens
FOR INSERT
WITH CHECK (auth.uid() = remetente_id);

CREATE POLICY "Usuários podem atualizar suas mensagens"
ON public.mensagens
FOR UPDATE
USING (
  auth.uid() = remetente_id OR 
  get_current_user_role() = 'admin'::user_type
);

-- Política RLS para notificações
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias notificações"
ON public.notificacoes
FOR SELECT
USING (
  auth.uid() = usuario_id OR
  get_current_user_role() = 'admin'::user_type
);

CREATE POLICY "Sistema pode criar notificações"
ON public.notificacoes
FOR INSERT
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::user_type, 'professor'::user_type, 'coordenador'::user_type, 'direcao'::user_type]));

CREATE POLICY "Usuários podem atualizar suas notificações"
ON public.notificacoes
FOR UPDATE
USING (
  auth.uid() = usuario_id OR
  get_current_user_role() = 'admin'::user_type
);

-- Política RLS para sugestões
ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias sugestões"
ON public.sugestoes
FOR SELECT
USING (
  auth.uid() = usuario_id OR
  get_current_user_role() = 'admin'::user_type
);

CREATE POLICY "Usuários podem criar sugestões"
ON public.sugestoes
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas sugestões"
ON public.sugestoes
FOR UPDATE
USING (auth.uid() = usuario_id);

-- FASE 2: Corrigir políticas muito permissivas

-- Corrigir políticas de categorias
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categorias;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categorias;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.categorias;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.categorias;

CREATE POLICY "Todos podem ver categorias ativas"
ON public.categorias
FOR SELECT
USING (ativo = true);

CREATE POLICY "Professores podem gerenciar categorias"
ON public.categorias
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['admin'::user_type, 'professor'::user_type, 'coordenador'::user_type, 'direcao'::user_type]));

-- Corrigir políticas de subcategorias
DROP POLICY IF EXISTS "Enable read access for all users" ON public.subcategorias;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.subcategorias;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.subcategorias;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.subcategorias;

CREATE POLICY "Todos podem ver subcategorias ativas"
ON public.subcategorias
FOR SELECT
USING (ativo = true);

CREATE POLICY "Professores podem gerenciar subcategorias"
ON public.subcategorias
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['admin'::user_type, 'professor'::user_type, 'coordenador'::user_type, 'direcao'::user_type]));

-- Corrigir políticas de exercícios
DROP POLICY IF EXISTS "Enable read access for all users" ON public.exercicios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.exercicios;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.exercicios;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.exercicios;

CREATE POLICY "Usuários autenticados podem ver exercícios ativos"
ON public.exercicios
FOR SELECT
TO authenticated
USING (ativo = true);

CREATE POLICY "Professores podem gerenciar exercícios"
ON public.exercicios
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['admin'::user_type, 'professor'::user_type, 'coordenador'::user_type, 'direcao'::user_type]));

-- FASE 3: Proteger views sensíveis

-- Criar política RLS para view de acesso de usuários (simulando uma tabela)
-- Note: Views não suportam RLS diretamente, então precisamos proteger via função

-- FASE 4: Corrigir funções de segurança
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_user_preferences()
RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_metricas_dashboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.dashboard_metricas (
    total_usuarios,
    total_escolas,
    total_exercicios,
    total_atividades,
    usuarios_ativos_mes,
    exercicios_resolvidos_mes
  )
  SELECT 
    (SELECT COUNT(*) FROM public.usuarios WHERE ativo = true),
    (SELECT COUNT(*) FROM public.escolas WHERE status = true),
    (SELECT COUNT(*) FROM public.exercicios WHERE ativo = true),
    (SELECT COUNT(*) FROM public.atividades),
    (SELECT COUNT(DISTINCT usuario_id) FROM public.logs_acesso WHERE data_login >= (CURRENT_DATE - INTERVAL '30 days')),
    (SELECT COUNT(*) FROM public.respostas WHERE data_envio >= (CURRENT_DATE - INTERVAL '30 days'))
  ON CONFLICT ON CONSTRAINT dashboard_metricas_pkey DO UPDATE SET
    total_usuarios = EXCLUDED.total_usuarios,
    total_escolas = EXCLUDED.total_escolas,
    total_exercicios = EXCLUDED.total_exercicios,
    total_atividades = EXCLUDED.total_atividades,
    usuarios_ativos_mes = EXCLUDED.usuarios_ativos_mes,
    exercicios_resolvidos_mes = EXCLUDED.exercicios_resolvidos_mes,
    data_atualizacao = now(),
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_type
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role user_type;
BEGIN
  -- Buscar diretamente na tabela usuarios usando auth.uid()
  SELECT tipo_usuario INTO user_role
  FROM public.usuarios 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'aluno'::user_type);
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Extrair o tipo de usuário do raw_user_meta_data, com fallback para 'aluno'
  INSERT INTO public.usuarios (
    id, 
    nome, 
    email, 
    tipo_usuario
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', ''), 
    NEW.email, 
    COALESCE((NEW.raw_user_meta_data->>'tipo_usuario')::user_type, 'aluno'::user_type)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_keep_alive()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Atualizar métricas do dashboard (aproveita para manter dados atualizados)
  PERFORM public.atualizar_metricas_dashboard();
  
  -- Log da execução do keep-alive
  INSERT INTO public.logs_acesso (usuario_id, data_login, ip)
  VALUES (
    '00000000-0000-0000-0000-000000000000', -- UUID especial para keep-alive
    NOW(),
    'keep-alive-cron'
  ) ON CONFLICT DO NOTHING;
END;
$$;