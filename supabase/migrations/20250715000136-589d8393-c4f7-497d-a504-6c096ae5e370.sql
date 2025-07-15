-- Corrigir o tipo de usuário para Maria Silva (diretor)
UPDATE public.usuarios 
SET tipo_usuario = 'direcao' 
WHERE email = 'maria.silva@exemplo.com' AND tipo_usuario = 'aluno';

-- Verificar se existem outros usuários com problema similar
UPDATE public.usuarios 
SET tipo_usuario = 'direcao' 
WHERE email LIKE '%diretor%' AND tipo_usuario = 'aluno';

UPDATE public.usuarios 
SET tipo_usuario = 'coordenador' 
WHERE email LIKE '%coordenador%' AND tipo_usuario = 'aluno';

UPDATE public.usuarios 
SET tipo_usuario = 'professor' 
WHERE email LIKE '%professor%' AND tipo_usuario = 'aluno';