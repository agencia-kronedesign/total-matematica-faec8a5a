-- Criar novo usuário admin totalmatematica.com.br@gmail.com
-- Primeiro, verificar se o usuário já existe
DO $$
DECLARE
    user_exists INTEGER;
BEGIN
    -- Verificar se o usuário já existe na tabela auth.users
    SELECT COUNT(*) INTO user_exists 
    FROM auth.users 
    WHERE email = 'totalmatematica.com.br@gmail.com';
    
    -- Se não existir, criar o usuário diretamente na tabela usuarios
    IF user_exists = 0 THEN
        -- Gerar um UUID para o novo usuário
        INSERT INTO public.usuarios (
            id, 
            nome, 
            email, 
            tipo_usuario,
            ativo,
            data_criacao
        ) VALUES (
            gen_random_uuid(),
            'Total Matemática Admin',
            'totalmatematica.com.br@gmail.com',
            'admin',
            true,
            now()
        );
        
        RAISE NOTICE 'Usuário admin totalmatematica.com.br@gmail.com criado com sucesso na tabela usuarios';
    ELSE
        -- Se já existir, apenas atualizar o tipo de usuário
        UPDATE public.usuarios 
        SET tipo_usuario = 'admin' 
        WHERE email = 'totalmatematica.com.br@gmail.com';
        
        RAISE NOTICE 'Usuário totalmatematica.com.br@gmail.com atualizado para admin';
    END IF;
END $$;