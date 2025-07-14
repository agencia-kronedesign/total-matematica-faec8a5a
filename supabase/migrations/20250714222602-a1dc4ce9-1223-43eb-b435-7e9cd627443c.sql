-- Criar atividades de demonstração
-- Primeiro, vamos buscar o ID do professor admin para associar às atividades
DO $$
DECLARE
    professor_id uuid;
    turma_id uuid;
    exercicio_id uuid;
    atividade1_id uuid;
    atividade2_id uuid;
    atividade3_id uuid;
BEGIN
    -- Buscar professor admin
    SELECT id INTO professor_id FROM usuarios WHERE tipo_usuario = 'admin' LIMIT 1;
    
    -- Buscar turma do 7º Ano B
    SELECT id INTO turma_id FROM turmas WHERE nome = '7º Ano B' LIMIT 1;
    
    -- Buscar exercício disponível
    SELECT id INTO exercicio_id FROM exercicios WHERE ativo = true LIMIT 1;
    
    -- Criar primeira atividade (Para Casa)
    INSERT INTO atividades (
        id,
        professor_id,
        turma_id,
        tipo,
        titulo,
        descricao,
        data_limite,
        status
    ) VALUES (
        gen_random_uuid(),
        professor_id,
        turma_id,
        'casa',
        'Exercícios de Potenciação - Casa',
        'Atividade para casa focando em exercícios de potenciação. Pratique os conceitos vistos em aula.',
        now() + interval '7 days',
        'ativa'
    ) RETURNING id INTO atividade1_id;
    
    -- Associar exercício à primeira atividade
    INSERT INTO atividade_exercicios (atividade_id, exercicio_id)
    VALUES (atividade1_id, exercicio_id);
    
    -- Criar segunda atividade (Aula)
    INSERT INTO atividades (
        id,
        professor_id,
        turma_id,
        tipo,
        titulo,
        descricao,
        data_limite,
        status
    ) VALUES (
        gen_random_uuid(),
        professor_id,
        turma_id,
        'aula',
        'Prática em Sala - Potenciação',
        'Exercícios para serem resolvidos durante a aula com acompanhamento do professor.',
        now() + interval '1 days',
        'ativa'
    ) RETURNING id INTO atividade2_id;
    
    -- Associar exercício à segunda atividade
    INSERT INTO atividade_exercicios (atividade_id, exercicio_id)
    VALUES (atividade2_id, exercicio_id);
    
    -- Criar terceira atividade (Para Casa - vencida para teste)
    INSERT INTO atividades (
        id,
        professor_id,
        turma_id,
        tipo,
        titulo,
        descricao,
        data_limite,
        status
    ) VALUES (
        gen_random_uuid(),
        professor_id,
        turma_id,
        'casa',
        'Revisão - Exercícios Básicos',
        'Atividade de revisão dos conceitos básicos de matemática.',
        now() - interval '2 days',
        'ativa'
    ) RETURNING id INTO atividade3_id;
    
    -- Associar exercício à terceira atividade
    INSERT INTO atividade_exercicios (atividade_id, exercicio_id)
    VALUES (atividade3_id, exercicio_id);
    
END $$;