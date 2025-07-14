-- Verificar se há constraint de foreign key para auth.users
-- Se sim, precisamos criar usuários na auth primeiro

-- Vamos criar usuários diretamente sem foreign key constraint
-- Usando IDs específicos que não conflitam

-- Professor de Matemática - Maria Santos
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  cargo,
  telefone,
  ativo
) VALUES (
  'prof0001-0000-0000-0000-000000000001'::uuid,
  'Maria Santos',
  'prof.maria.santos@escola.com.br',
  'professor'::user_type,
  'Professora de Matemática',
  '(11) 98765-4321',
  true
) ON CONFLICT (id) DO NOTHING;

-- Professor de Ciências - João Oliveira  
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  cargo,
  telefone,
  ativo
) VALUES (
  'prof0002-0000-0000-0000-000000000002'::uuid,
  'João Oliveira',
  'prof.joao.oliveira@escola.com.br',
  'professor'::user_type,
  'Professor de Ciências',
  '(11) 97654-3210',
  true
) ON CONFLICT (id) DO NOTHING;

-- Coordenadora Pedagógica - Ana Silva
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  cargo,
  telefone,
  ativo
) VALUES (
  'coord001-0000-0000-0000-000000000003'::uuid,
  'Ana Silva',
  'coord.ana.silva@escola.com.br',
  'coordenador'::user_type,
  'Coordenadora Pedagógica',
  '(11) 96543-2109',
  true
) ON CONFLICT (id) DO NOTHING;

-- Fase 2: Transferir atividades para a Professora Maria Santos
UPDATE public.atividades 
SET professor_id = 'prof0001-0000-0000-0000-000000000001'::uuid
WHERE titulo IN (
  'Exercícios de Potenciação - Casa',
  'Prática em Sala - Potenciação',
  'Revisão - Exercícios Básicos'
);

-- Inserir preferências para os novos usuários
INSERT INTO public.preferencias_usuario (usuario_id)
VALUES 
  ('prof0001-0000-0000-0000-000000000001'::uuid),
  ('prof0002-0000-0000-0000-000000000002'::uuid),
  ('coord001-0000-0000-0000-000000000003'::uuid)
ON CONFLICT (usuario_id) DO NOTHING;

-- Inserir consentimentos para os novos usuários
INSERT INTO public.consentimento_usuario (usuario_id, termos_uso, politica_privacidade)
VALUES 
  ('prof0001-0000-0000-0000-000000000001'::uuid, true, true),
  ('prof0002-0000-0000-0000-000000000002'::uuid, true, true),
  ('coord001-0000-0000-0000-000000000003'::uuid, true, true)
ON CONFLICT (usuario_id) DO NOTHING;