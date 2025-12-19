-- Remover políticas existentes de categorias
DROP POLICY IF EXISTS "Todos podem ver categorias ativas" ON categorias;

-- Criar nova política para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver categorias ativas"
ON categorias
FOR SELECT
TO authenticated
USING (ativo = true);

-- Criar política para usuários anônimos
CREATE POLICY "Usuários anônimos podem ver categorias ativas"
ON categorias
FOR SELECT
TO anon
USING (ativo = true);

-- Remover políticas existentes de subcategorias
DROP POLICY IF EXISTS "Todos podem ver subcategorias ativas" ON subcategorias;

-- Criar nova política para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver subcategorias ativas"
ON subcategorias
FOR SELECT
TO authenticated
USING (ativo = true);

-- Criar política para usuários anônimos
CREATE POLICY "Usuários anônimos podem ver subcategorias ativas"
ON subcategorias
FOR SELECT
TO anon
USING (ativo = true);