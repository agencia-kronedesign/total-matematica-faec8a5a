# Configuração do Primeiro Administrador

Este sistema implementa um mecanismo seguro para criação do primeiro administrador, evitando exposição pública da funcionalidade.

## Como Funciona

### 1. Segurança por Chave de URL
- O botão "Criar Primeiro Admin" só aparece quando uma chave secreta está presente na URL
- A chave atual é: `ADMIN_SETUP_2024`
- URL de exemplo: `/cadastrar?setup=ADMIN_SETUP_2024`

### 2. Auto-desativação
- O sistema conta quantos administradores existem no banco de dados
- Após criar o primeiro admin, o botão desaparece permanentemente
- Mesmo com a chave correta, não será possível criar mais admins por esta interface

### 3. Validações de Segurança
- Chave inválida → Mensagem de erro
- Sistema já tem admins → Mensagem informativa
- Sem chave na URL → Interface normal de cadastro

## Como Usar

### Primeira Configuração do Sistema
1. Acesse a URL: `https://seusite.com/cadastrar?setup=ADMIN_SETUP_2024`
2. A página mostrará um alerta informativo sobre configuração inicial
3. Clique em "Criar Primeiro Admin"
4. Será criado um usuário com:
   - **Email:** admin@sistema.com
   - **Senha:** admin123
   - **Tipo:** Administrador

### Após Criação do Admin
- O botão desaparece automaticamente
- Faça login com as credenciais do admin
- **IMPORTANTE:** Altere a senha padrão imediatamente!

## Configuração de Desenvolvimento

### Alterando a Chave de Segurança
Para alterar a chave de setup, edite o arquivo `src/hooks/useAdminSetup.ts`:

```typescript
const ADMIN_SETUP_KEY = 'SUA_NOVA_CHAVE_AQUI';
```

### Ambientes Diferentes
Você pode usar chaves diferentes para:
- **Desenvolvimento:** `DEV_ADMIN_SETUP_2024`
- **Produção:** `PROD_ADMIN_SETUP_2024`
- **Testes:** `TEST_ADMIN_SETUP_2024`

### Resetar para Desenvolvimento
Se precisar testar novamente durante desenvolvimento:
1. Delete todos os administradores do banco via console do Supabase
2. Use a URL com a chave: `/cadastrar?setup=ADMIN_SETUP_2024`

## Mensagens do Sistema

### Chave Inválida
- **Cenário:** URL com `?setup=chave_errada`
- **Mensagem:** "Chave de configuração inválida."

### Sistema Já Configurado
- **Cenário:** URL correta mas já existem admins
- **Mensagem:** "Sistema já possui administradores configurados."

### Configuração Válida
- **Cenário:** URL correta e nenhum admin existe
- **Resultado:** Mostra interface de criação do primeiro admin

## Segurança Adicional

### Logs de Auditoria
O sistema registra:
- Tentativas de acesso com chaves inválidas
- Criação de administradores
- Horário e IP das operações

### Proteções Implementadas
- ✅ Chave secreta obrigatória
- ✅ Verificação de administradores existentes
- ✅ Auto-desativação após primeiro uso
- ✅ Estados de loading para prevenir cliques duplos
- ✅ Mensagens informativas claras
- ✅ Recarregamento automático após criação

## Criação Manual de Admin (Alternativa)

Se houver problemas com a interface, você pode criar um admin diretamente no console do Supabase:

```sql
-- 1. Criar usuário no auth.users (via interface do Supabase Auth)
-- 2. Depois executar:
UPDATE usuarios 
SET tipo_usuario = 'admin' 
WHERE email = 'seuemail@exemplo.com';
```

## Troubleshooting

### Botão não aparece
- Verifique se a URL contém `?setup=ADMIN_SETUP_2024`
- Confirme que não existem admins no banco
- Verifique console do navegador para erros

### Erro ao criar admin
- Verifique conexão com Supabase
- Confirme que as políticas RLS estão corretas
- Verifique logs no console do Supabase

### Chave não funciona
- Confirme que a chave em `useAdminSetup.ts` está correta
- Verifique se não há espaços ou caracteres especiais na URL