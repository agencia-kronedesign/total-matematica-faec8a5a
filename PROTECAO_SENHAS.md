# Módulo de Proteção de Senhas e Segurança de Autenticação

Este documento descreve as políticas de segurança implementadas para proteção de senhas e autenticação no sistema Total Matemática.

## Índice
1. [Requisitos de Complexidade de Senha](#requisitos-de-complexidade-de-senha)
2. [Componentes Criados](#componentes-criados)
3. [Fluxo de Recuperação de Senha](#fluxo-de-recuperação-de-senha)
4. [Rate Limiting Visual](#rate-limiting-visual)
5. [Configuração do Supabase](#configuração-do-supabase)
6. [Arquivos Modificados](#arquivos-modificados)

---

## Requisitos de Complexidade de Senha

Todas as senhas do sistema devem atender aos seguintes critérios:

| Critério | Requisito |
|----------|-----------|
| Comprimento mínimo | 8 caracteres |
| Letra maiúscula | Pelo menos 1 (A-Z) |
| Letra minúscula | Pelo menos 1 (a-z) |
| Número | Pelo menos 1 (0-9) |

### Indicador de Força

O sistema exibe um indicador visual de força da senha:

- **🔴 Fraca**: 0-1 critérios atendidos
- **🟡 Média**: 2-3 critérios atendidos  
- **🟢 Forte**: Todos os 4 critérios atendidos

---

## Componentes Criados

### 1. PasswordInput (`src/components/auth/PasswordInput.tsx`)

Componente reutilizável para entrada de senhas com:

- Toggle de visibilidade (ícone de olho)
- Indicador de força visual (barra colorida)
- Lista de validação em tempo real
- Props configuráveis:
  - `showStrengthIndicator`: Exibir barra de força
  - `showValidationList`: Exibir checklist de critérios

**Funções exportadas:**
- `validatePassword(password)`: Retorna objeto com status de cada critério
- `isPasswordValid(password)`: Retorna `true` se todos os critérios atendidos
- `getPasswordStrength(password)`: Retorna 'weak' | 'medium' | 'strong'

### 2. useLoginRateLimiter (`src/hooks/useLoginRateLimiter.ts`)

Hook para proteção contra ataques de força bruta:

- Bloqueia login após 3 tentativas falhas
- Tempo de bloqueio: 30 segundos
- Contador visual de tempo restante
- Reset automático após período de bloqueio

**Retorno do hook:**
```typescript
{
  isBlocked: boolean;
  remainingSeconds: number;
  failedAttempts: number;
  registerFailedAttempt: () => void;
  resetAttempts: () => void;
}
```

---

## Fluxo de Recuperação de Senha

### Página de Solicitação (`/recuperar-senha`)

Arquivo: `src/pages/ForgotPassword.tsx`

1. Usuário informa email cadastrado
2. Sistema envia email via `supabase.auth.resetPasswordForEmail()`
3. Link de recuperação redireciona para `/redefinir-senha`
4. Link expira em 1 hora

### Página de Redefinição (`/redefinir-senha`)

Arquivo: `src/pages/ResetPassword.tsx`

1. Verifica sessão válida (usuário veio do link de email)
2. Exibe formulário com `PasswordInput` e validação
3. Atualiza senha via `supabase.auth.updateUser()`
4. Faz logout e redireciona para login

---

## Rate Limiting Visual

### Comportamento

| Tentativas | Ação |
|------------|------|
| 1-2 | Login normal |
| 3 | Botão bloqueado por 30 segundos |
| Após 30s | Reset automático do contador |

### Mensagem exibida

> "Muitas tentativas falhas. Tente novamente em X segundos."

---

## Configuração do Supabase

### Configurações Recomendadas (Dashboard)

**Authentication > Settings:**

1. **Minimum password length**: 8
2. **Enable leaked password protection**: ✅ Ativado
3. **Redirect URLs**: Adicionar:
   - `https://seu-dominio.com/redefinir-senha`
   - URL do preview Lovable

### Alinhamento Frontend/Backend

As validações do frontend espelham exatamente as regras do Supabase Auth para garantir:

- ✅ Frontend não aceita senhas que o backend rejeitaria
- ✅ Backend não aceita senhas mais fracas que o frontend permite
- ✅ Experiência consistente para o usuário

---

## Arquivos Modificados

### Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/components/auth/PasswordInput.tsx` | Componente de entrada de senha |
| `src/pages/ForgotPassword.tsx` | Página de solicitação de recuperação |
| `src/pages/ResetPassword.tsx` | Página de redefinição de senha |
| `src/hooks/useLoginRateLimiter.ts` | Hook de rate limiting |
| `PROTECAO_SENHAS.md` | Esta documentação |

### Arquivos Atualizados

| Arquivo | Modificação |
|---------|-------------|
| `src/App.tsx` | Rotas `/recuperar-senha` e `/redefinir-senha` |
| `src/pages/Login.tsx` | Rate limiting + link atualizado |
| `src/pages/Register.tsx` | Validação 8+ chars com complexidade |
| `src/components/auth/UserRegistrationForm.tsx` | PasswordInput + validação |
| `src/components/admin/RecreateUserDialog.tsx` | Validação 8+ chars |
| `src/components/admin/CreateAdminUser.tsx` | Removida senha padrão |

---

## Critérios de Sucesso Verificados

- [x] Formulários bloqueiam senhas simples ("123456", "senha123")
- [x] Feedback visual imediato sobre força da senha
- [x] Supabase rejeita senhas fora dos requisitos
- [x] Botão "olhinho" funciona corretamente
- [x] Página `/recuperar-senha` envia email de reset
- [x] Página `/redefinir-senha` permite criar nova senha segura
- [x] Rate limiting visual após 3 tentativas falhas
- [x] Sem erros no console durante validação

---

## Manutenção

Para alterar os requisitos de senha:

1. Atualizar `validatePassword()` em `PasswordInput.tsx`
2. Atualizar validação Zod nos formulários
3. Atualizar configurações no Supabase Dashboard
4. Atualizar esta documentação
