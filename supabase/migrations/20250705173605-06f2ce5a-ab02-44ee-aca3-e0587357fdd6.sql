-- Correção manual: promover admin@sistema.com para admin
UPDATE public.usuarios 
SET tipo_usuario = 'admin' 
WHERE email = 'admin@sistema.com' AND tipo_usuario = 'aluno';