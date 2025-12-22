-- Corrigir política RLS de SELECT na tabela respostas
-- Problema: a política atual usa auth.jwt() que não contém o tipo_usuario
-- Solução: usar get_current_user_role() que busca da tabela usuarios

DROP POLICY IF EXISTS "Alunos podem ver suas próprias respostas" ON respostas;

CREATE POLICY "Usuários podem ver respostas relevantes"
ON respostas FOR SELECT
USING (
  (auth.uid() = aluno_id) 
  OR 
  (get_current_user_role() = ANY (ARRAY['admin'::user_type, 'professor'::user_type, 'coordenador'::user_type, 'direcao'::user_type]))
);