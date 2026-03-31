

## Plano: Corrigir campo de data de nascimento travando ao digitar

### Problema
Loop destrutivo entre o componente e o formulário:
1. Usuário digita "3" → `onValueChange("3", "3")` → `handleDateChange` vê que não tem 8 dígitos → `form.setValue('data_nascimento', '')` → value prop vira `''`
2. `FormattedInput` recebe `value=""` → `displayValue = formatDate('') = ''` → campo volta para vazio
3. Resultado: impossível digitar qualquer coisa — cada tecla é imediatamente apagada

### Causa raiz
O `handleDateChange` limpa o valor do formulário (`''`) para datas incompletas, e o `value={field.value || ''}` faz o componente usar esse valor vazio como exibição, criando um ciclo que impede a digitação.

### Correção

**Arquivo: `src/components/auth/user-fields/BasicPersonalFields.tsx`**

1. Remover `value={field.value || ''}` do `FormattedInput` de data — deixar o componente gerenciar seu estado interno de exibição
2. Alterar `handleDateChange` para também armazenar o valor formatado parcial no campo (ex: `"31/0"`) enquanto incompleto, e converter para ISO apenas quando completo (8 dígitos)
3. Passar o valor inicial via `defaultValue` ou inicializar via `useEffect` no FormattedInput (já existe lógica para isso internamente)

**Arquivo: `src/components/ui/formatted-input.tsx`**

4. Ajustar a lógica para que quando `value` não é passado mas o componente recebe um valor inicial via outra prop, o estado interno seja usado para exibição sem interferência externa

### Mudança concreta

```tsx
// BasicPersonalFields.tsx - handleDateChange
const handleDateChange = useCallback((unformatted: string, formatted: string) => {
  if (unformatted.length === 8) {
    const isoDate = dateToISO(formatted);
    form.setValue('data_nascimento', isoDate);
  } else {
    form.setValue('data_nascimento', formatted); // Guardar parcial em vez de ''
  }
}, [form]);

// Campo data_nascimento - remover value prop
<FormattedInput 
  formatter="date" 
  placeholder="DD/MM/AAAA" 
  onValueChange={handleDateChange}
/>
```

**Arquivo: `src/components/ui/formatted-input.tsx`** — Pequeno ajuste no `useEffect` para também inicializar o valor interno quando o componente monta com dados de edição (usando o form value passado externamente uma única vez).

### Escopo
- 2 arquivos modificados
- Corrige digitação e mantém exibição na edição

