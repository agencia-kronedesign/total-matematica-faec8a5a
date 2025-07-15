-- Corrigir o usuário "João Santos" que foi criado incorretamente como aluno
UPDATE public.usuarios 
SET tipo_usuario = 'direcao' 
WHERE nome = 'João Santos' AND tipo_usuario = 'aluno';

-- Modificar o trigger handle_new_user para usar o tipo correto do raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Criar política temporária para permitir que usuários atualizem seu próprio tipo uma vez
CREATE POLICY "Usuários podem atualizar seu próprio tipo inicial" 
ON public.usuarios 
FOR UPDATE 
USING (
  auth.uid() = id AND 
  -- Só permite se o usuário foi criado recentemente (últimos 5 minutos)
  created_at > (now() - interval '5 minutes')
);