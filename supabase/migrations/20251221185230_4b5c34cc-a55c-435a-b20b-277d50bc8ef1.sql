-- Passo 1: Remover a política de SELECT atual
DROP POLICY IF EXISTS "Alunos podem ver suas próprias matrículas" ON public.matriculas;

-- Passo 2: Criar nova política de SELECT que inclui professor
CREATE POLICY "Alunos, professores e gestão podem ver matrículas relevantes"
ON public.matriculas
FOR SELECT
USING (
  -- Aluno pode ver a própria matrícula
  (auth.uid() = usuario_id)
  -- Gestão (admin, direção, coordenação) + professor podem ver todas
  OR (get_current_user_role() = ANY (
    ARRAY['admin'::user_type, 'direcao'::user_type, 'coordenador'::user_type, 'professor'::user_type]
  ))
);