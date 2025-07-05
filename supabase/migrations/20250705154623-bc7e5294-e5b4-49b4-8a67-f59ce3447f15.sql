-- 1. Criar função para obter o tipo de usuário atual (evita recursão infinita)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_type AS $$
BEGIN
  RETURN (
    SELECT tipo_usuario 
    FROM public.usuarios 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Remover as políticas RLS problemáticas da tabela usuarios
DROP POLICY IF EXISTS "Admin pode atualizar usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Admin pode inserir usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Admin pode ver todos os usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;

-- 3. Recriar as políticas usando a função SECURITY DEFINER
CREATE POLICY "Admin pode ver todos os usuários" 
ON public.usuarios 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin pode atualizar usuários" 
ON public.usuarios 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admin pode inserir usuários" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = id OR public.get_current_user_role() IN ('admin', 'professor'));

-- 4. Deletar o usuário admin@sistema.com que está como aluno (causa conflito)
DELETE FROM public.usuarios WHERE email = 'admin@sistema.com' AND tipo_usuario = 'aluno';

-- 5. Deletar também da tabela auth se necessário
DELETE FROM auth.users WHERE email = 'admin@sistema.com';