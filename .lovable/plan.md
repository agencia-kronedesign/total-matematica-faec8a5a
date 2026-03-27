
Objetivo: corrigir a edição da escola para que a cidade já salva continue aparecendo selecionada no campo “Cidade” ao abrir o formulário.

Diagnóstico
- O valor está sendo salvo corretamente no banco e listado na tela de administração.
- O problema é visual no formulário de edição: o `Select` da cidade recebe `field.value`, mas a opção salva nem sempre existe na lista carregada naquele momento.
- Há dois fatores fortes no código atual:
  1. O `Loader2` está dentro do `SelectTrigger`, o que pode interferir na renderização do `SelectValue` no Radix.
  2. A lista `fallbackCitiesByState.SP` é incompleta e não contém cidades já salvas no banco, como `Altair`. Se a API do IBGE falhar ou demorar, o select fica sem a opção correspondente e mostra o placeholder.

O que vou ajustar
1. Corrigir o layout do `Select` de cidade
- Arquivo: `src/components/admin/escola-form/ContactAddressSection.tsx`
- Tirar o `Loader2` de dentro do `SelectTrigger`.
- Colocar o spinner posicionado externamente, para o trigger conter apenas o `SelectValue`.

2. Garantir que a cidade atual exista nas opções durante a edição
- Arquivo: `src/components/admin/escola-form/ContactAddressSection.tsx`
- Criar uma lista derivada para renderização:
  - usar `cidadesDisponiveis` normalmente;
  - se `field.value` já existir e não estiver na lista, incluir temporariamente essa cidade no array exibido.
- Assim, mesmo se a API falhar ou o fallback estiver incompleto, o valor salvo continua selecionável e visível.

3. Evitar comportamento que “apaga visualmente” a cidade ao trocar estado
- Manter o reset de `cidade` apenas quando o estado realmente mudar por ação do usuário.
- Na edição inicial, o `reset` do formulário não deve causar perda visual do valor já salvo.

4. Aplicar o mesmo padrão no cadastro de usuário
- Arquivo: `src/components/auth/UserRegistrationForm.tsx`
- O mesmo problema estrutural existe lá: spinner dentro do `SelectTrigger`.
- Vou alinhar o componente para evitar o mesmo bug em outro formulário.

Arquivos envolvidos
- `src/components/admin/escola-form/ContactAddressSection.tsx`
- `src/components/auth/UserRegistrationForm.tsx`

Resultado esperado
- Ao editar uma escola, a cidade já salva aparece selecionada imediatamente.
- Se a cidade existir no banco, mas não vier da API/fallback, ela ainda aparece no select.
- O campo não volta para “Selecione a Cidade” indevidamente.
- O comportamento continua correto ao cadastrar e ao trocar estado.
- Sem impacto no salvamento em banco, que já está funcionando.

Detalhes técnicos
```text
Fonte do bug:
Banco OK -> form.reset carrega cidade OK -> lista de opções não contém o valor atual
ou SelectValue é afetado pela estrutura do Trigger -> placeholder aparece

Correção:
valor atual + opções carregadas -> união segura para renderização
spinner fora do SelectTrigger
```
