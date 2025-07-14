-- Criar tabelas para o dashboard administrativo

-- Tabela para métricas do dashboard
CREATE TABLE public.dashboard_metricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_usuarios INTEGER NOT NULL DEFAULT 0,
  total_escolas INTEGER NOT NULL DEFAULT 0,
  total_exercicios INTEGER NOT NULL DEFAULT 0,
  total_atividades INTEGER NOT NULL DEFAULT 0,
  usuarios_ativos_mes INTEGER NOT NULL DEFAULT 0,
  exercicios_resolvidos_mes INTEGER NOT NULL DEFAULT 0,
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para atividades do sistema (logs de ações)
CREATE TABLE public.atividades_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id),
  tipo_atividade TEXT NOT NULL, -- 'cadastro', 'login', 'exercicio_criado', 'escola_cadastrada', etc
  descricao TEXT NOT NULL,
  dados_extra JSONB,
  ip_address TEXT,
  user_agent TEXT,
  data_atividade TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para configurações do sistema
CREATE TABLE public.configuracoes_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  descricao TEXT,
  tipo TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  categoria TEXT DEFAULT 'geral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.dashboard_metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas admins podem acessar
CREATE POLICY "Apenas admins podem acessar dashboard_metricas" 
ON public.dashboard_metricas 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Apenas admins podem acessar atividades_sistema" 
ON public.atividades_sistema 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Apenas admins podem acessar configuracoes_sistema" 
ON public.configuracoes_sistema 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Triggers para updated_at
CREATE TRIGGER update_dashboard_metricas_updated_at
  BEFORE UPDATE ON public.dashboard_metricas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_sistema_updated_at
  BEFORE UPDATE ON public.configuracoes_sistema
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações iniciais
INSERT INTO public.configuracoes_sistema (chave, valor, descricao, categoria) VALUES 
('dashboard_refresh_interval', '30', 'Intervalo de atualização do dashboard em segundos', 'dashboard'),
('sistema_manutencao', 'false', 'Modo de manutenção do sistema', 'sistema'),
('versao_sistema', '1.0.0', 'Versão atual do sistema', 'sistema');

-- Função para atualizar métricas do dashboard
CREATE OR REPLACE FUNCTION public.atualizar_metricas_dashboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Executar a função para criar o primeiro registro
SELECT public.atualizar_metricas_dashboard();