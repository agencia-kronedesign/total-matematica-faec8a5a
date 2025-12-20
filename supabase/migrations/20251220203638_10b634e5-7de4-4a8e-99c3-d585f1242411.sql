-- Corrigir fórmulas que usam sintaxe JavaScript incorreta
-- Math.pow(n, 2) deve ser convertido para pow(n, 2) ou n^2
UPDATE exercicios 
SET formula = 'pow(n, 2)', updated_at = now()
WHERE formula = 'Math.pow(n, 2)';