-- Corrigir as políticas RLS da tabela usuarios para evitar recursão infinita
-- Remover todas as políticas atuais que causam problemas
DROP POLICY IF EXISTS "Admin pode ver todos os usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Admin pode atualizar usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Admin pode inserir usuários" ON public.usuarios;

-- Criar políticas mais simples que não causem recursão
-- Política para admins verem todos os usuários (sem subconsulta na mesma tabela)
CREATE POLICY "Admin pode ver todos os usuários" 
ON public.usuarios 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin'
);

-- Política para usuários verem seus próprios dados + admins/professores verem todos
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.usuarios 
FOR SELECT 
USING (
  auth.uid() = id OR 
  public.get_current_user_role() IN ('admin', 'professor', 'direcao')
);

-- Política para admin atualizar usuários
CREATE POLICY "Admin pode atualizar usuários" 
ON public.usuarios 
FOR UPDATE 
USING (
  public.get_current_user_role() = 'admin'
);

-- Política para admin inserir usuários
CREATE POLICY "Admin pode inserir usuários" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() = 'admin'
);

-- Garantir que o admin@sistema.com seja realmente admin
UPDATE public.usuarios 
SET tipo_usuario = 'admin' 
WHERE email = 'admin@sistema.com';