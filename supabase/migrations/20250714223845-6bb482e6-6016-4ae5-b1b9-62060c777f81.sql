-- Implementar Coordenadores e Direção - Plano Completo

-- Etapa 1: Criar Usuários de Direção
INSERT INTO public.usuarios (
  id, nome, email, tipo_usuario, ativo, cargo, telefone_mobile,
  data_criacao, created_at, updated_at
) VALUES 
-- Diretor 1 - Colégio Sion
(
  gen_random_uuid(),
  'Dr. Roberto Silva',
  'diretor.roberto@colegiosion.edu.br',
  'direcao',
  true,
  'Diretor Geral',
  '(11) 99887-7654',
  now(),
  now(),
  now()
),
-- Diretora 2 - Colégio Santa Inês  
(
  gen_random_uuid(),
  'Dra. Carmen Rodrigues', 
  'diretora.carmen@santaines.edu.br',
  'direcao',
  true,
  'Diretora Geral',
  '(11) 99776-6543',
  now(),
  now(),
  now()
);

-- Etapa 2: Criar Usuários Coordenadores
INSERT INTO public.usuarios (
  id, nome, email, tipo_usuario, ativo, cargo, telefone_mobile,
  data_criacao, created_at, updated_at
) VALUES 
-- Coordenador 1 - Ensino Fundamental (Sion)
(
  gen_random_uuid(),
  'Ana Paula Costa',
  'coord.fundamental@colegiosion.edu.br', 
  'coordenador',
  true,
  'Coordenadora Ensino Fundamental',
  '(11) 99665-5432',
  now(),
  now(),
  now()
),
-- Coordenador 2 - Ensino Médio (Sion)
(
  gen_random_uuid(),
  'Marcos Andrade',
  'coord.medio@colegiosion.edu.br',
  'coordenador', 
  true,
  'Coordenador Ensino Médio',
  '(11) 99554-4321',
  now(),
  now(),
  now()
),
-- Coordenador 3 - Ensino Fundamental (Santa Inês)
(
  gen_random_uuid(),
  'Beatriz Santos',
  'coord.fundamental@santaines.edu.br',
  'coordenador',
  true,
  'Coordenadora Ensino Fundamental', 
  '(11) 99443-3210',
  now(),
  now(),
  now()
),
-- Coordenador 4 - Ensino Médio (Santa Inês)
(
  gen_random_uuid(),
  'Carlos Mendes',
  'coord.medio@santaines.edu.br',
  'coordenador',
  true,
  'Coordenador Ensino Médio',
  '(11) 99332-2109',
  now(),
  now(),
  now()
);

-- Etapa 3: Atualizar Estrutura das Escolas com Diretores
UPDATE public.escolas 
SET 
  diretor_nome = 'Dr. Roberto Silva',
  diretor_email = 'diretor.roberto@colegiosion.edu.br',
  coordenador_nome = 'Ana Paula Costa',
  coordenador_email = 'coord.fundamental@colegiosion.edu.br',
  updated_at = now()
WHERE razao_social = 'Colégio Sion';

UPDATE public.escolas 
SET 
  diretor_nome = 'Dra. Carmen Rodrigues', 
  diretor_email = 'diretora.carmen@santaines.edu.br',
  coordenador_nome = 'Beatriz Santos',
  coordenador_email = 'coord.fundamental@santaines.edu.br',
  updated_at = now()
WHERE razao_social = 'Colégio de Santa Inês';

-- Etapa 4: Criar Turmas Adicionais para Coordenadores
INSERT INTO public.turmas (
  id, escola_id, nome, ano_letivo, nivel_ensino, turno, status,
  created_at, updated_at
) VALUES 
-- Turmas Colégio Sion
(
  gen_random_uuid(),
  (SELECT id FROM escolas WHERE razao_social = 'Colégio Sion' LIMIT 1),
  '6º Ano A - Fundamental',
  2025,
  'Ensino Fundamental',
  'Manhã',
  true,
  now(),
  now()
),
(
  gen_random_uuid(),
  (SELECT id FROM escolas WHERE razao_social = 'Colégio Sion' LIMIT 1),
  '1º Ano A - Médio',
  2025,
  'Ensino Médio', 
  'Manhã',
  true,
  now(),
  now()
),
-- Turmas Colégio Santa Inês
(
  gen_random_uuid(),
  (SELECT id FROM escolas WHERE razao_social = 'Colégio de Santa Inês' LIMIT 1),
  '7º Ano B - Fundamental',
  2025,
  'Ensino Fundamental',
  'Tarde',
  true,
  now(),
  now()
),
(
  gen_random_uuid(),
  (SELECT id FROM escolas WHERE razao_social = 'Colégio de Santa Inês' LIMIT 1),
  '2º Ano B - Médio', 
  2025,
  'Ensino Médio',
  'Tarde',
  true,
  now(),
  now()
);

-- Verificar implementação
SELECT 
  'DIREÇÃO' as tipo,
  nome, 
  email, 
  tipo_usuario,
  cargo
FROM usuarios 
WHERE tipo_usuario = 'direcao'

UNION ALL

SELECT 
  'COORDENAÇÃO' as tipo,
  nome,
  email, 
  tipo_usuario,
  cargo  
FROM usuarios
WHERE tipo_usuario = 'coordenador'

UNION ALL

SELECT
  'ESCOLAS ATUALIZADAS' as tipo,
  razao_social as nome,
  diretor_email as email,
  'escola' as tipo_usuario,
  diretor_nome as cargo
FROM escolas
WHERE diretor_nome IS NOT NULL;

-- Contagem final
SELECT 
  tipo_usuario,
  COUNT(*) as quantidade
FROM usuarios 
GROUP BY tipo_usuario
ORDER BY 
  CASE tipo_usuario 
    WHEN 'admin' THEN 1
    WHEN 'direcao' THEN 2  
    WHEN 'coordenador' THEN 3
    WHEN 'professor' THEN 4
    WHEN 'aluno' THEN 5
  END;