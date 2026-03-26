

## Diagnóstico: Cidade não fixa no Select

O problema é que o componente `SelectTrigger` do campo Cidade tem um `Loader2` como filho ao lado do `SelectValue`. O Radix Select espera apenas `SelectValue` dentro do `SelectTrigger` — o elemento extra interfere na renderização do valor selecionado, fazendo o select "voltar" ao placeholder.

## Correção

**Arquivo:** `src/components/admin/escola-form/ContactAddressSection.tsx`

1. Mover o ícone `Loader2` para **fora** do `SelectTrigger`, colocando-o ao lado como indicador visual separado
2. Simplificar o `SelectTrigger` para conter apenas o `SelectValue`

```tsx
{/* ANTES (quebrado) */}
<SelectTrigger>
  <SelectValue placeholder="..." />
  {isLoadingCidades && <Loader2 ... />}  {/* ← interfere no Radix */}
</SelectTrigger>

{/* DEPOIS (correto) */}
<div className="relative">
  <SelectTrigger>
    <SelectValue placeholder="..." />
  </SelectTrigger>
  {isLoadingCidades && (
    <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-muted-foreground" />
  )}
</div>
```

- 1 arquivo modificado
- Nenhuma alteração de lógica, schema ou banco

