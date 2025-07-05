-- Permitir que administradores atualizem usuários
CREATE POLICY "Admin pode atualizar usuários" ON public.usuarios
FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM usuarios WHERE tipo_usuario = 'admin'
  )
);

-- Permitir que administradores insiram usuários 
CREATE POLICY "Admin pode inserir usuários" ON public.usuarios
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM usuarios WHERE tipo_usuario = 'admin'
  )
);

-- Permitir que usuários admin vejam todos os usuários
CREATE POLICY "Admin pode ver todos os usuários" ON public.usuarios
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM usuarios WHERE tipo_usuario = 'admin'
  )
);