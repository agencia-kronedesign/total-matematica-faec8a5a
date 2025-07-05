-- Remover o usuário admin criado incorretamente
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.usuarios WHERE id = '00000000-0000-0000-0000-000000000001';