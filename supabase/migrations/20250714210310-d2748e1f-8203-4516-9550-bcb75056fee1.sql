-- Criar políticas RLS para atividades
CREATE POLICY "Professores podem criar atividades" 
ON public.atividades 
FOR INSERT 
WITH CHECK (
  auth.uid() = professor_id AND 
  get_current_user_role() IN ('professor', 'admin', 'coordenador', 'direcao')
);

CREATE POLICY "Professores podem ver suas atividades" 
ON public.atividades 
FOR SELECT 
USING (
  auth.uid() = professor_id OR 
  get_current_user_role() IN ('admin', 'coordenador', 'direcao') OR
  -- Alunos podem ver atividades de suas turmas
  EXISTS (
    SELECT 1 FROM matriculas m 
    WHERE m.usuario_id = auth.uid() 
    AND m.turma_id = atividades.turma_id
  )
);

CREATE POLICY "Professores podem atualizar suas atividades" 
ON public.atividades 
FOR UPDATE 
USING (
  auth.uid() = professor_id OR 
  get_current_user_role() IN ('admin', 'coordenador', 'direcao')
);

CREATE POLICY "Admins podem deletar atividades" 
ON public.atividades 
FOR DELETE 
USING (
  get_current_user_role() IN ('admin', 'coordenador', 'direcao')
);

-- Criar políticas RLS para atividade_exercicios
CREATE POLICY "Professores podem associar exercícios" 
ON public.atividade_exercicios 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM atividades a 
    WHERE a.id = atividade_exercicios.atividade_id 
    AND (
      auth.uid() = a.professor_id OR 
      get_current_user_role() IN ('admin', 'coordenador', 'direcao')
    )
  )
);

-- Criar políticas RLS para respostas
CREATE POLICY "Alunos podem criar suas respostas" 
ON public.respostas 
FOR INSERT 
WITH CHECK (
  auth.uid() = aluno_id AND 
  -- Verificar se o aluno está matriculado na turma da atividade
  EXISTS (
    SELECT 1 FROM atividades a 
    JOIN matriculas m ON m.turma_id = a.turma_id 
    WHERE a.id = respostas.atividade_id 
    AND m.usuario_id = auth.uid()
  )
);

CREATE POLICY "Alunos podem atualizar suas respostas" 
ON public.respostas 
FOR UPDATE 
USING (
  auth.uid() = aluno_id OR 
  get_current_user_role() IN ('admin', 'professor', 'coordenador', 'direcao')
);