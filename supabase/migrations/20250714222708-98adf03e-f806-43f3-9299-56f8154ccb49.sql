-- Criar uma resposta de teste do Stevan para testar o sistema
INSERT INTO public.respostas (
  atividade_id,
  aluno_id,
  exercicio_id,
  numero_n,
  resposta_digitada,
  resultado_calculado,
  margem_aplicada,
  acerto_nivel
) VALUES (
  '9d961389-1c63-40f2-912a-d3e8aba2a240', -- Atividade "Exercícios de Potenciação - Casa"
  'a52b8b8b-97c0-4eaf-a6df-b770170aa25c', -- Stevan
  '6aee9b2c-a4cd-4db1-9dc6-376748dab312', -- Exercício de potenciação
  5, -- n = 5
  '25', -- resposta digitada
  25, -- resultado calculado (5^2 = 25)
  0.1, -- margem de erro aplicada
  'correto' -- acerto total
);