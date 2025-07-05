-- Criar o primeiro usuário administrador diretamente no sistema
-- Inserir na tabela auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@sistema.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome": "Administrador do Sistema"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = 'admin@sistema.com',
  encrypted_password = crypt('admin123', gen_salt('bf')),
  raw_user_meta_data = '{"nome": "Administrador do Sistema"}';

-- Inserir na tabela usuarios
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