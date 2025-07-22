
-- Criar políticas RLS para a tabela turmas
-- Permitir INSERT para admins, coordenadores e direção
CREATE POLICY "Admins podem criar turmas" 
ON public.turmas 
FOR INSERT 
WITH CHECK (
  get_current_user_role() IN ('admin', 'coordenador', 'direcao')
);

-- Permitir UPDATE para admins, coordenadores e direção
CREATE POLICY "Admins podem atualizar turmas" 
ON public.turmas 
FOR UPDATE 
USING (
  get_current_user_role() IN ('admin', 'coordenador', 'direcao')
);

-- Permitir DELETE apenas para admins (seguindo padrão das outras tabelas)
CREATE POLICY "Admins podem deletar turmas" 
ON public.turmas 
FOR DELETE 
USING (
  get_current_user_role() = 'admin'
);
