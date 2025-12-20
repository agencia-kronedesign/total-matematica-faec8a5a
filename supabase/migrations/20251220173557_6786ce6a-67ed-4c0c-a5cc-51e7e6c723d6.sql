-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Alunos podem criar suas respostas" ON public.respostas;

-- Create new INSERT policy that allows both free practice and activity-based responses
CREATE POLICY "Alunos podem criar suas respostas" 
ON public.respostas 
FOR INSERT 
WITH CHECK (
  (auth.uid() = aluno_id) AND (
    -- Free practice: atividade_id is NULL
    (atividade_id IS NULL)
    OR
    -- Activity-based: verify enrollment
    (EXISTS (
      SELECT 1
      FROM public.atividades a
      JOIN public.matriculas m ON m.turma_id = a.turma_id
      WHERE a.id = respostas.atividade_id 
        AND m.usuario_id = auth.uid()
        AND m.status = 'ativo'
    ))
  )
);