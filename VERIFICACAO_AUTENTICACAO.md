# Verificação de Autenticação de Usuários

## Visão Geral

Este módulo permite verificar e corrigir usuários que existem na tabela `usuarios` mas não possuem registro no sistema de autenticação do Supabase (`auth.users`). Esses usuários "órfãos" não conseguem fazer login no sistema.

## Funcionalidades

### 1. Verificação Automática

O botão **"Verificar Autenticação"** no painel de gerenciamento de usuários verifica todos os usuários cadastrados e identifica aqueles que não possuem registro de autenticação.

**Localização:** Admin → Gerenciamento de Usuários → Botão "Verificar Autenticação"

### 2. Indicação Visual

Usuários sem autenticação são destacados com:
- Ícone de alerta amarelo (⚠️) ao lado do nome
- Linha da tabela com fundo amarelo
- Card de alerta no topo da página quando detectados

### 3. Recriação de Autenticação

Para usuários órfãos, é possível recriar o registro de autenticação:

1. Clique no botão de chave (🔑) na coluna de ações
2. Defina uma nova senha (ou use o gerador automático)
3. Confirme a recriação

O usuário poderá fazer login com a nova senha.

## Arquitetura

### Edge Functions

| Função | Descrição |
|--------|-----------|
| `check-user-auth` | Verifica se um usuário existe no `auth.users` |
| `admin-create-user` | Cria ou recria usuários no sistema de autenticação |

### Hooks

| Hook | Descrição |
|------|-----------|
| `useOrphanUsersCheck` | Gerencia verificação e recriação de usuários órfãos |

### Componentes

| Componente | Descrição |
|------------|-----------|
| `RecreateUserDialog` | Modal para definir nova senha ao recriar usuário |

## Fluxo de Recriação

```
1. Admin clica em "Verificar Autenticação"
   ↓
2. Sistema verifica cada usuário via check-user-auth
   ↓
3. Usuários sem auth são marcados como órfãos
   ↓
4. Admin clica no botão de chave do usuário órfão
   ↓
5. Modal solicita nova senha
   ↓
6. Sistema chama admin-create-user com recreate=true
   ↓
7. Edge Function:
   a. Deleta registro órfão da tabela usuarios
   b. Cria novo usuário no auth.users
   c. Trigger handle_new_user cria novo registro em usuarios
   d. Atualiza tipo_usuario e nome
   ↓
8. Usuário pode fazer login com nova senha
```

## Segurança

- Apenas administradores podem acessar a verificação
- As Edge Functions usam `SUPABASE_SERVICE_ROLE_KEY` para operações admin
- Senhas são definidas pelo administrador e não são armazenadas em logs

## Causas Comuns de Usuários Órfãos

1. **Importação direta no banco**: Usuários inseridos diretamente na tabela `usuarios` sem criar no `auth.users`
2. **Falha no registro**: Erro durante o processo de registro que criou apenas parte do usuário
3. **Migração de dados**: Dados migrados de outro sistema sem sincronização com autenticação

## Resolução de Problemas

### Erro "Usuário já existe"
O email já está registrado no `auth.users`. O sistema tentará sincronizar automaticamente.

### Erro ao recriar
Verifique os logs da Edge Function em: [Logs da Função](https://supabase.com/dashboard/project/bckalmbnlgukcjbvyzbe/functions/admin-create-user/logs)

### Usuário não aparece após recriação
O trigger `handle_new_user` pode ter falhado. Verifique os logs do banco de dados.
