-- Inserir turmas de teste para as escolas existentes
INSERT INTO public.turmas (nome, escola_id, ano_letivo, turno, nivel_ensino) 
SELECT 
  '6º Ano A', 
  id, 
  2024, 
  'manhã', 
  'fundamental_2'
FROM public.escolas 
LIMIT 1;

INSERT INTO public.turmas (nome, escola_id, ano_letivo, turno, nivel_ensino) 
SELECT 
  '7º Ano B', 
  id, 
  2024, 
  'tarde', 
  'fundamental_2'
FROM public.escolas 
LIMIT 1;

INSERT INTO public.turmas (nome, escola_id, ano_letivo, turno, nivel_ensino) 
SELECT 
  '5º Ano A', 
  id, 
  2024, 
  'manhã', 
  'fundamental_1'
FROM public.escolas 
OFFSET 1 
LIMIT 1;