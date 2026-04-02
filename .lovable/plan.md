

## Plano: Corrigir erro "Não autorizado" no Playground AI

### Problema
O hook `useAIChat.ts` envia a **anon key** (`VITE_SUPABASE_PUBLISHABLE_KEY`) como Authorization header. A edge function precisa do **token JWT do usuário logado** para identificar quem está fazendo a requisição via `supabase.auth.getUser()`.

### Correção

**Arquivo: `src/hooks/useAIChat.ts`**

- Importar `supabase` do client
- Antes de cada requisição, obter o token da sessão atual com `supabase.auth.getSession()`
- Enviar `session.access_token` no header Authorization em vez da anon key
- Manter o `apikey` header com a anon key (necessário para Supabase Edge Functions)

```typescript
// Antes
Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,

// Depois
const { data: { session } } = await supabase.auth.getSession();
// ...
Authorization: `Bearer ${session?.access_token}`,
apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
```

### Escopo
- 1 arquivo modificado
- Sem impacto em outros componentes

