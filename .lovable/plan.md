

## Plano: Corrigir exibição da data de nascimento na edição

### Problema
No campo "Data de Nascimento" em `BasicPersonalFields.tsx` (linha 147-150), o `FormattedInput` **não recebe `field.value`** — diferente de todos os outros campos formatados que usam `{...field}`. Isso significa que ao editar um usuário, o valor ISO salvo no banco (ex: `1990-05-15`) nunca é passado ao componente, que fica sempre vazio mostrando apenas o placeholder "DD/MM/AAAA".

### Correção

**Arquivo: `src/components/auth/user-fields/BasicPersonalFields.tsx`**

Passar `value={field.value}` ao `FormattedInput` do campo `data_nascimento`. O componente `FormattedInput` já tem lógica interna para converter ISO (`YYYY-MM-DD`) para formato visual (`DD/MM/AAAA`) quando `formatter="date"`.

Mudar de:
```tsx
<FormattedInput 
  formatter="date" 
  placeholder="DD/MM/AAAA" 
  onValueChange={handleDateChange}
/>
```

Para:
```tsx
<FormattedInput 
  formatter="date" 
  placeholder="DD/MM/AAAA" 
  value={field.value || ''}
  onValueChange={handleDateChange}
/>
```

### Escopo
- 1 arquivo, 1 linha alterada
- Sem impacto em outros campos ou fluxos

