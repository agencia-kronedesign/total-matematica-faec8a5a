
-- Verificar se precisamos adicionar as colunas telefone_secundario e email_secundario
-- O campo 'site' já existe na tabela escolas

-- Adicionar telefone_secundario se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escolas' AND column_name = 'telefone_secundario') THEN
        ALTER TABLE public.escolas ADD COLUMN telefone_secundario text;
    END IF;
END $$;

-- Adicionar email_secundario se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escolas' AND column_name = 'email_secundario') THEN
        ALTER TABLE public.escolas ADD COLUMN email_secundario text;
    END IF;
END $$;
