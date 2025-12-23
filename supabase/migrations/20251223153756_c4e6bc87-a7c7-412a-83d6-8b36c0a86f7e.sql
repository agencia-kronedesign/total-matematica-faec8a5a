-- Adicionar coluna para marcar exercícios como exemplo público
ALTER TABLE exercicios 
ADD COLUMN IF NOT EXISTS exemplo_teste_publico boolean DEFAULT false;

-- Criar política RLS para permitir leitura anônima dos exercícios de exemplo
CREATE POLICY "Visitantes podem ver exercícios de exemplo" 
ON exercicios FOR SELECT 
TO anon
USING (exemplo_teste_publico = true AND ativo = true);

-- Comentário para documentação
COMMENT ON COLUMN exercicios.exemplo_teste_publico IS 'Indica se o exercício pode ser usado na página pública Faça um Teste';