

## Plano: Corrigir campos faltantes no cadastro de escolas

### Problema
No hook `useEscolas.ts`, as funções `createEscola` e `updateEscola` não incluem os campos `site`, `email_secundario` e `telefone_secundario` no objeto `dbData` enviado ao Supabase. Os campos existem no formulário e no schema, mas são silenciosamente descartados antes de salvar.

### Correção

**Arquivo:** `src/hooks/useEscolas.ts`

Adicionar os 3 campos faltantes ao objeto `dbData` em **ambas** as funções (`createEscola` e `updateEscola`):

```typescript
const dbData = {
  // ... campos existentes ...
  telefone: escolaData.telefone,
  telefone_secundario: escolaData.telefone_secundario,  // FALTANDO
  email: escolaData.email,
  email_secundario: escolaData.email_secundario,        // FALTANDO
  site: escolaData.site,                                 // FALTANDO
  // ... resto dos campos ...
};
```

### Escopo
- 1 arquivo modificado: `src/hooks/useEscolas.ts`
- 2 pontos de alteração: `createEscola` e `updateEscola`
- Sem alteração no banco, formulário ou schema (já estão corretos)

### Critérios de Sucesso
- Cadastrar escola com site, email secundário e telefone secundário → dados salvos no banco
- Editar escola → campos carregados e atualizados corretamente

