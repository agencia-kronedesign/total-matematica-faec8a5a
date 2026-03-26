

## Diagnóstico: Formulário de Escolas não salva ao selecionar cidade

### Problema Real
O formulário **não está falhando por causa da cidade** — a cidade é selecionada corretamente. O problema é que a **validação do schema Zod está bloqueando o submit** silenciosamente por causa de outros campos obrigatórios que o usuário provavelmente não preencheu ou não percebeu o erro.

### Campos que bloqueiam o submit sem aviso visível:

1. **Inscrição Municipal** — obrigatória quando "Isento" não está marcado (refine no final do schema). O erro aparece, mas o formulário tem múltiplas seções (cards), e o erro pode ficar invisível se o usuário não rolar a tela.

2. **Inscrição Estadual** — mesma situação.

3. **CEP** — obrigatório com `min(1)` + `validateCEP` (precisa ter 8 dígitos).

4. **CNPJ** — mesmo sendo "optional", se o usuário digitar um CNPJ parcial (ex: "123"), `validateCNPJ` falha porque o tamanho não é 14.

5. **Telefone/Telefone Secundário** — mesma situação: se digitar parcial, a validação falha.

### Solução

**Arquivo:** `src/schemas/escolaSchema.ts`

Tornar as validações mais tolerantes para campos opcionais:

1. **CNPJ**: Aceitar string vazia como válido (já aceita `undefined` mas não `""` corretamente com partial input)
2. **Telefone e Telefone Secundário**: Aceitar string vazia como válido
3. **CEP**: Tornar opcional (muitas escolas podem não ter CEP à mão)
4. **Inscrições Municipal/Estadual**: Marcar `isento` como `true` por padrão, OU tornar inscrições realmente opcionais sem o refine obrigatório
5. **E-mails e Site**: Já estão com `.or(z.literal(''))`, OK

**Arquivo:** `src/components/admin/EscolaForm.tsx`

Adicionar feedback visual ao tentar submeter com erros:
- Após `form.handleSubmit` falhar, mostrar toast com "Verifique os campos obrigatórios" e fazer scroll até o primeiro erro

### Alterações detalhadas

#### 1. `src/schemas/escolaSchema.ts`
```typescript
// CNPJ - aceitar vazio explicitamente
cnpj: z.string().optional().refine((val) => !val || validateCNPJ(val), {
  message: 'CNPJ inválido'
}),

// CEP - tornar opcional ou manter obrigatório mas aceitar vazio
cep: z.string().optional().refine((val) => !val || validateCEP(val), {
  message: 'CEP inválido'
}),

// Telefones - aceitar vazio
telefone: z.string().optional().refine((val) => !val || validatePhone(val), {
  message: 'Telefone inválido'
}),
telefone_secundario: z.string().optional().refine((val) => !val || validatePhone(val), {
  message: 'Telefone secundário inválido'
}),
```

E remover os 2 `.refine()` finais que tornam inscrição municipal/estadual obrigatórias — deixar esses campos realmente opcionais. A obrigatoriedade pode ser adicionada depois com lógica de negócio mais clara.

#### 2. `src/components/admin/EscolaForm.tsx`
Adicionar handler de erro no submit para mostrar toast:
```typescript
<form onSubmit={form.handleSubmit(onSubmit, (errors) => {
  console.log('[EscolaForm] Validation errors:', errors);
  toast({
    title: "Campos obrigatórios",
    description: "Verifique os campos destacados em vermelho.",
    variant: "destructive",
  });
})}>
```

### Arquivos a modificar
- `src/schemas/escolaSchema.ts` — relaxar validações de campos opcionais, remover refines de inscrições
- `src/components/admin/EscolaForm.tsx` — adicionar feedback de erro de validação

### Critérios de Sucesso
- Formulário salva com apenas razão social, nome fantasia, estado e cidade preenchidos
- Campos opcionais (CNPJ, CEP, telefones, inscrições) não bloqueiam o submit quando vazios
- CNPJ/telefone parcial mostra erro visível no campo
- Toast de "verifique os campos" aparece quando há erros de validação
- Dados salvos corretamente no banco

