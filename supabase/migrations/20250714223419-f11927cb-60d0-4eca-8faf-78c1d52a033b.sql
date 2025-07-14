-- Fase 1: Cadastrar Professores e Coordenadora diretamente na tabela usuarios
-- (A autenticação será configurada separadamente pelo admin)

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
  gen_random_uuid(),
  'Maria Santos',
  'prof.maria.santos@escola.com.br',
  'professor'::user_type,
  'Professora de Matemática',
  '(11) 98765-4321',
  true
) ON CONFLICT (email) DO NOTHING;

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
  gen_random_uuid(),
  'João Oliveira',
  'prof.joao.oliveira@escola.com.br',
  'professor'::user_type,
  'Professor de Ciências',
  '(11) 97654-3210',
  true
) ON CONFLICT (email) DO NOTHING;

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
  gen_random_uuid(),
  'Ana Silva',
  'coord.ana.silva@escola.com.br',
  'coordenador'::user_type,
  'Coordenadora Pedagógica',
  '(11) 96543-2109',
  true
) ON CONFLICT (email) DO NOTHING;

-- Fase 2: Transferir atividades para a Professora Maria Santos
UPDATE public.atividades 
SET professor_id = (
  SELECT id FROM public.usuarios 
  WHERE email = 'prof.maria.santos@escola.com.br' 
  AND tipo_usuario = 'professor'
  LIMIT 1
)
WHERE titulo IN (
  'Exercícios de Potenciação - Casa',
  'Prática em Sala - Potenciação',
  'Revisão - Exercícios Básicos'
);

-- Inserir preferências para os novos usuários
INSERT INTO public.preferencias_usuario (usuario_id)
SELECT id FROM public.usuarios 
WHERE email IN (
  'prof.maria.santos@escola.com.br',
  'prof.joao.oliveira@escola.com.br', 
  'coord.ana.silva@escola.com.br'
)
ON CONFLICT (usuario_id) DO NOTHING;

-- Inserir consentimentos para os novos usuários
INSERT INTO public.consentimento_usuario (usuario_id, termos_uso, politica_privacidade)
SELECT id, true, true FROM public.usuarios 
WHERE email IN (
  'prof.maria.santos@escola.com.br',
  'prof.joao.oliveira@escola.com.br',
  'coord.ana.silva@escola.com.br'
)
ON CONFLICT (usuario_id) DO NOTHING;