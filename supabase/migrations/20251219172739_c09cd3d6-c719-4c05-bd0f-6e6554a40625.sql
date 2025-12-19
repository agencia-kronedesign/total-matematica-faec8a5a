-- Política para alunos verem exercícios das atividades da sua turma
CREATE POLICY "Alunos podem ver exercícios das atividades da sua turma"
ON atividade_exercicios
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM atividades a
    JOIN matriculas m ON m.turma_id = a.turma_id
    WHERE a.id = atividade_exercicios.atividade_id 
    AND m.usuario_id = auth.uid()
    AND m.status = 'ativo'
  )
);