

## Plano: Área Administrativa com Playground AI e Sistema de Controle de Acesso Baseado em Regras

### Visão Geral

Criar sistema completo com: (1) tabelas de regras de acesso configuráveis, (2) interface admin para gerenciar regras, (3) Playground AI com OpenRouter, (4) Edge Function para proxy de API. Tudo restrito ao perfil `admin`.

### Fase 1: Banco de Dados (Migration)

Criar 3 tabelas novas com RLS:

```sql
-- Regras de acesso configuráveis
CREATE TABLE access_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('view','create','update','delete','execute')),
  conditions JSONB DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hierarquia de perfis
CREATE TABLE role_hierarchy (
  parent_role TEXT NOT NULL,
  child_role TEXT NOT NULL,
  PRIMARY KEY (parent_role, child_role)
);

-- Conversas AI com auditoria
CREATE TABLE ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  message TEXT NOT NULL,
  response TEXT,
  model TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

RLS: todas as tabelas com acesso apenas para `admin` via `get_current_user_role()`.

Inserir hierarquia padrão: admin > direcao > coordenador > professor > aluno.

### Fase 2: Edge Function `openrouter-proxy`

- Recebe mensagem + histórico do frontend
- Valida JWT do usuário (deve ser admin)
- Busca chave API do Supabase secrets (`OPENROUTER_API_KEY`)
- Faz chamada para `https://openrouter.ai/api/v1/chat/completions`
- Suporta modelo free (`google/gemma-3-1b-it:free`) ou pago (configurável)
- Retorna resposta e salva em `ai_conversations`

### Fase 3: Páginas e Componentes

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/admin/AdminPlayground.tsx` | Chat AI com textarea, histórico, seleção de modelo |
| `src/pages/admin/AccessRulesManagement.tsx` | CRUD de regras: tabela com filtros, dialog para criar/editar |
| `src/pages/admin/ApiSettings.tsx` | Config OpenRouter: switch free/pago, campo chave API, teste conexão |
| `src/components/admin/RuleFormDialog.tsx` | Formulário para criar/editar regra (role, resource, action, conditions JSON) |
| `src/components/admin/PlaygroundChat.tsx` | Componente de chat com markdown rendering |
| `src/hooks/useAccessRules.ts` | Hook para CRUD de regras |
| `src/hooks/useAIChat.ts` | Hook para enviar mensagens ao playground |

### Fase 4: Rotas e Navegação

Adicionar ao `App.tsx` (dentro de `AdminPage adminOnly`):
- `/admin/playground` → `AdminPlayground`
- `/admin/regras-acesso` → `AccessRulesManagement`
- `/admin/configuracoes-api` → `ApiSettings`

Adicionar ao `DashboardSidebar.tsx` nos `adminItems`:
- "Playground AI" (ícone Bot)
- "Regras de Acesso" (ícone ShieldCheck)
- "Config API" (ícone Settings)

### Fase 5: Secret para OpenRouter

Solicitar ao usuário a chave `OPENROUTER_API_KEY` via ferramenta de secrets (ou usar modelo free sem chave inicialmente).

### Arquivos criados/modificados

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar 3 tabelas + RLS + hierarquia |
| `supabase/functions/openrouter-proxy/index.ts` | Criar Edge Function |
| `src/pages/admin/AdminPlayground.tsx` | Criar |
| `src/pages/admin/AccessRulesManagement.tsx` | Criar |
| `src/pages/admin/ApiSettings.tsx` | Criar |
| `src/components/admin/RuleFormDialog.tsx` | Criar |
| `src/components/admin/PlaygroundChat.tsx` | Criar |
| `src/hooks/useAccessRules.ts` | Criar |
| `src/hooks/useAIChat.ts` | Criar |
| `src/App.tsx` | Adicionar 3 rotas |
| `src/components/dashboard/DashboardSidebar.tsx` | Adicionar 3 itens no menu admin |

### Restrições

- Todas as novas funcionalidades acessíveis **apenas por admin**
- Chaves API nunca expostas no frontend (sempre via Edge Function)
- Não modifica nenhum componente existente além de `App.tsx` e `DashboardSidebar.tsx`
- Usa o sistema de design existente (cores, componentes shadcn/ui)
- Mobile-first com sidebar colapsível

### Critérios de Sucesso

- Playground AI funciona com modelo free (sem chave) e pago (com chave)
- Admin pode criar/editar/desativar regras de acesso via interface
- Hierarquia de perfis visível e editável
- Histórico de conversas AI salvo no banco
- Zero erros TypeScript
- RLS em todas as novas tabelas
- Responsivo em mobile

