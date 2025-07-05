-- Criar o primeiro usuário administrador
-- Primeiro, inserir o usuário na tabela usuarios com tipo admin
INSERT INTO public.usuarios (
  id, 
  nome, 
  email, 
  tipo_usuario, 
  ativo, 
  data_criacao
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Administrador do Sistema',
  'admin@sistema.com',
  'admin',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  tipo_usuario = 'admin',
  nome = 'Administrador do Sistema',
  ativo = true;