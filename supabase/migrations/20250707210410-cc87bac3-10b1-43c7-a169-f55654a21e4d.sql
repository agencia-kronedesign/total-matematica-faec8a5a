-- Corrigir a função get_current_user_role para evitar dependências circulares
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_type AS $$
DECLARE
  user_role user_type;
BEGIN
  -- Buscar diretamente na tabela usuarios usando auth.uid()
  SELECT tipo_usuario INTO user_role
  FROM public.usuarios 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'aluno'::user_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Garantir que o admin@sistema.com seja admin
UPDATE public.usuarios 
SET tipo_usuario = 'admin' 
WHERE email = 'admin@sistema.com';

-- Recriar políticas RLS mais simples para usuários
DROP POLICY IF EXISTS "Admin pode ver todos os usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Admin pode atualizar usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Admin pode inserir usuários" ON public.usuarios;

-- Política para admins verem todos os usuários
CREATE POLICY "Admin pode ver todos os usuários" 
ON public.usuarios 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo_usuario = 'admin'
  )
);

-- Política para usuários verem seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.usuarios 
FOR SELECT 
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo_usuario IN ('admin', 'professor', 'direcao')
  )
);

-- Política para admin atualizar usuários
CREATE POLICY "Admin pode atualizar usuários" 
ON public.usuarios 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo_usuario = 'admin'
  )
);

-- Política para admin inserir usuários
CREATE POLICY "Admin pode inserir usuários" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.id = auth.uid() AND u.tipo_usuario = 'admin'
  )
);