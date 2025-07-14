-- Matricular os alunos existentes nas turmas criadas
-- Buscar IDs dos alunos e turmas para realizar as matrículas

-- Matricular primeiro aluno na primeira turma
INSERT INTO public.matriculas (usuario_id, turma_id, numero_chamada, status)
SELECT 
  u.id as usuario_id,
  t.id as turma_id,
  1 as numero_chamada,
  'ativo' as status
FROM public.usuarios u, public.turmas t
WHERE u.tipo_usuario = 'aluno' 
  AND u.email LIKE '%@exemplo.com'
  AND t.nome = '6º Ano A'
LIMIT 1;

-- Matricular segundo aluno na segunda turma
INSERT INTO public.matriculas (usuario_id, turma_id, numero_chamada, status)
SELECT 
  u.id as usuario_id,
  t.id as turma_id,
  2 as numero_chamada,
  'ativo' as status
FROM public.usuarios u, public.turmas t
WHERE u.tipo_usuario = 'aluno' 
  AND u.email NOT LIKE '%admin%'
  AND u.id NOT IN (SELECT usuario_id FROM public.matriculas WHERE status = 'ativo')
  AND t.nome = '7º Ano B'
LIMIT 1;