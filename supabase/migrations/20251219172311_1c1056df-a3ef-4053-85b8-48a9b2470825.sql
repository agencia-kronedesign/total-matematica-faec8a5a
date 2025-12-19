-- Atualizar datas limite das atividades para datas futuras (para permitir testes)
UPDATE atividades 
SET data_limite = '2026-01-31 23:59:59+00'::timestamptz 
WHERE data_limite IS NOT NULL;