-- Fase 1: Cadastrar Professores Exemplo
-- Professor de Matemática
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'prof.maria.santos@escola.com.br',
  now(),
  now(),
  now(),
  '{"nome": "Maria Santos"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Inserir na tabela usuarios
WITH new_user AS (
  SELECT id FROM auth.users WHERE email = 'prof.maria.santos@escola.com.br'
)
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  cargo,
  telefone,
  ativo
) 
SELECT 
  nu.id,
  'Maria Santos',
  'prof.maria.santos@escola.com.br',
  'professor'::user_type,
  'Professora de Matemática',
  '(11) 98765-4321',
  true
FROM new_user nu
ON CONFLICT (id) DO NOTHING;

-- Professor de Ciências
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'prof.joao.oliveira@escola.com.br',
  now(),
  now(),
  now(),
  '{"nome": "João Oliveira"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

WITH new_user AS (
  SELECT id FROM auth.users WHERE email = 'prof.joao.oliveira@escola.com.br'
)
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  cargo,
  telefone,
  ativo
) 
SELECT 
  nu.id,
  'João Oliveira',
  'prof.joao.oliveira@escola.com.br',
  'professor'::user_type,
  'Professor de Ciências',
  '(11) 97654-3210',
  true
FROM new_user nu
ON CONFLICT (id) DO NOTHING;

-- Coordenadora Pedagógica
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'coord.ana.silva@escola.com.br',
  now(),
  now(),
  now(),
  '{"nome": "Ana Silva"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

WITH new_user AS (
  SELECT id FROM auth.users WHERE email = 'coord.ana.silva@escola.com.br'
)
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  cargo,
  telefone,
  ativo
) 
SELECT 
  nu.id,
  'Ana Silva',
  'coord.ana.silva@escola.com.br',
  'coordenador'::user_type,
  'Coordenadora Pedagógica',
  '(11) 96543-2109',
  true
FROM new_user nu
ON CONFLICT (id) DO NOTHING;

-- Fase 2: Transferir atividades para a Professora Maria Santos
UPDATE public.atividades 
SET professor_id = (
  SELECT id FROM public.usuarios 
  WHERE email = 'prof.maria.santos@escola.com.br' 
  AND tipo_usuario = 'professor'
)
WHERE titulo IN (
  'Exercícios de Potenciação - Casa',
  'Prática em Sala - Potenciação',
  'Revisão - Exercícios Básicos'
);

-- Inserir preferências e consentimentos para os novos usuários
INSERT INTO public.preferencias_usuario (usuario_id)
SELECT id FROM public.usuarios 
WHERE email IN (
  'prof.maria.santos@escola.com.br',
  'prof.joao.oliveira@escola.com.br', 
  'coord.ana.silva@escola.com.br'
)
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO public.consentimento_usuario (usuario_id, termos_uso, politica_privacidade)
SELECT id, true, true FROM public.usuarios 
WHERE email IN (
  'prof.maria.santos@escola.com.br',
  'prof.joao.oliveira@escola.com.br',
  'coord.ana.silva@escola.com.br'
)
ON CONFLICT (usuario_id) DO NOTHING;