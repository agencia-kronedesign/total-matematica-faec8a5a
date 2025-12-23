-- Política: Usuários podem atualizar seu próprio perfil (nome, telefone, etc.)
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);