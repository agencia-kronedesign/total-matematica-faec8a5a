
Objetivo: corrigir o campo Cidade na edição de escolas para que o valor já salvo apareça selecionado de forma estável, sem voltar para o placeholder.

Diagnóstico confirmado
- O banco está correto: a cidade está sendo salva e aparece na listagem administrativa.
- O problema está no formulário de edição, na combinação entre:
  1. `form.reset(...)` carregando `estado` e `cidade` ao mesmo tempo;
  2. `useCidades(selectedEstado)` carregando opções de forma assíncrona;
  3. `Radix Select` nem sempre exibindo corretamente o texto inicial quando o valor controlado entra antes da opção estabilizar.
- O ajuste anterior ajudou, mas não resolveu o caso de edição já aberta com valor salvo.

Arquivos principais
- `src/components/admin/escola-form/ContactAddressSection.tsx`
- `src/hooks/useEscolaForm.ts`
- `src/components/auth/UserRegistrationForm.tsx` (alinhar o mesmo padrão para evitar o mesmo bug em outro formulário)
- Documentação do módulo de escolas

O que vou implementar
1. Separar “valor salvo da cidade” das opções carregadas
- No hook/formulário, criar uma referência estável da cidade inicial da edição.
- Garantir que essa cidade inicial entre nas opções renderizadas enquanto o carregamento das cidades não estabiliza.

2. Evitar reset visual indevido da cidade
- Ajustar a lógica do campo `estado` para limpar `cidade` apenas quando a troca de estado for feita manualmente pelo usuário.
- Não limpar a cidade durante a carga inicial do formulário em modo edição.

3. Tornar o trigger do select explicitamente controlado
- Em vez de depender só do comportamento automático do `SelectValue`, renderizar o texto visível da cidade selecionada de forma mais explícita quando houver `field.value`.
- Isso elimina o efeito de “ficar salvo por trás, mas mostrar placeholder”.

4. Manter spinner e layout sem interferir no valor
- Preservar o loader fora do `SelectTrigger`.
- Ajustar posicionamento para não competir com o texto nem com o ícone do select.

5. Aplicar o mesmo padrão no cadastro/edição de usuários
- O mesmo componente/lógica de cidade em `UserRegistrationForm.tsx` deve seguir a mesma abordagem para evitar inconsistência futura.

6. Documentação
- Atualizar/criar documentação do módulo de gerenciamento de escolas explicando:
  - causa do bug;
  - estratégia adotada para selects dependentes de estado/cidade;
  - cuidado para edição com dados assíncronos.

Resultado esperado
- Ao editar uma escola, a cidade já salva aparece selecionada imediatamente.
- O campo não volta para “Selecione a Cidade”.
- Trocar o estado manualmente continua limpando a cidade corretamente.
- Cadastro novo continua funcionando.
- Mesmo comportamento consistente no formulário de usuário.

Detalhe técnico
```text
Fluxo corrigido:
escola carregada -> reset do form -> cidade inicial preservada
-> opções de cidade = cidades carregadas + cidade atual, se necessário
-> trigger mostra explicitamente o valor atual
-> limpar cidade apenas em mudança manual de estado
```
