

## Plano: Adicionar campo de chave API na página de configurações

### Problema
A página `/admin/configuracoes-api` é apenas informativa, sem campo para inserir ou gerenciar uma chave de API.

### Solução

**1. Criar tabela `configuracoes_sistema` para armazenar a chave de forma segura**

```sql
CREATE TABLE configuracoes_sistema (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS: apenas admin
```

**2. Atualizar `src/pages/admin/ApiSettings.tsx`**

Adicionar:
- Campo input `type="password"` para inserir chave OpenRouter
- Botão "Salvar Chave" que grava na tabela `configuracoes_sistema`
- Botão "Testar Conexão" que chama a edge function com uma mensagem de teste
- Indicador de status (chave configurada ou não)
- Switch para escolher entre Lovable AI Gateway (padrão, automático) ou OpenRouter (chave manual)

**3. Atualizar `supabase/functions/ai-chat/index.ts`**

- Buscar configuração de API na tabela `configuracoes_sistema`
- Se houver chave OpenRouter configurada e modo OpenRouter ativo, usar `https://openrouter.ai/api/v1/chat/completions`
- Caso contrário, continuar usando Lovable AI Gateway com `LOVABLE_API_KEY`

### Arquivos

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar tabela `configuracoes_sistema` com RLS |
| `src/pages/admin/ApiSettings.tsx` | Adicionar formulário de chave API, switch de provider, botão testar |
| `supabase/functions/ai-chat/index.ts` | Suportar OpenRouter como provider alternativo |

### Critérios de Sucesso
- Admin consegue inserir e salvar chave API pelo painel
- Botão "Testar Conexão" valida a chave
- Switch entre Lovable Gateway e OpenRouter funciona
- Chave nunca aparece no frontend após salvar (mascarada)

