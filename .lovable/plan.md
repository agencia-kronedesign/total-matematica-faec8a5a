
Diagnóstico objetivo do que ainda não resolveu (e por quê)

1) Data de nascimento e 2º responsável ainda falhando em alguns cadastros
- Causa raiz: no `useUserRegistration.ts`, o update completo dos dados só roda dentro de `if (!isAdmin)`.
- Efeito: quando o cadastro é feito por ADMIN via Edge Function, usuário é criado, mas campos complementares (ex.: `data_nascimento`, `nome_responsavel2`, `email_responsavel2`) podem ficar sem persistência.

2) Restrição de acesso de Direção/Coordenação ainda inconsistente
- Causa raiz: `DashboardSidebar` já oculta menu admin para não-admin, mas `AdminPage.tsx` ainda permite `requiredRole={['admin','direcao','coordenador']}`.
- Efeito: mesmo sem menu, Direção/Coordenação ainda conseguem acessar `/admin/*` por URL direta.

3) Imagem do exercício continua sem fixar no cadastro
- Causa raiz: no código está sendo usado `.from('Exercise Images')`, mas o Supabase Storage usa **bucket id** `exercise-images` (nome visual pode ser “Exercise Images”).
- Evidência: exercícios recentes no banco estão com `imagem_url = null`, e objetos existentes estão no bucket `exercise-images`.

4) Ordenação por dificuldade não está aplicada no fluxo de resolução de atividades
- Causa raiz: `useExercises.ts` foi ajustado (lista geral), mas `useActivityExercises.ts` ainda ordena apenas por `ordem`.
- Efeito: em `/atividades/:id` a ordem ainda não respeita dificuldade crescente.
- Extra: `ExerciseResolver.tsx` mostra texto fixo dizendo que “NÃO estão em ordem crescente”, reforçando percepção de erro.

Plano de execução para resolver de vez (em lote)

Etapa 1 — Corrigir persistência no cadastro de usuários (admin)
- Arquivo: `src/hooks/useUserRegistration.ts`
- Ação:
  - Remover dependência de `if (!isAdmin)` para o bloco de update completo.
  - Garantir update dos campos complementares para o usuário recém-criado também no fluxo via Edge Function.
  - Manter sanitização de vazios para `null` em `data_nascimento`, `nome_responsavel2`, `email_responsavel2`.

Etapa 2 — Fechar acesso de gestão ao painel admin completo
- Arquivo: `src/pages/admin/AdminPage.tsx`
- Ação:
  - Alterar `requiredRole` para `admin` (somente).
  - Resultado esperado: Direção/Coordenação continuam com área de professor/gestão, mas sem `/admin/*`.

Etapa 3 — Corrigir upload/preview/fixação da imagem de exercício
- Arquivo: `src/components/exercises/ExerciseRegistrationForm.tsx`
- Ação:
  - Trocar `.from('Exercise Images')` para `.from('exercise-images')`.
  - Manter fluxo: upload → getPublicUrl → update `imagem_url`.
  - Adicionar tratamento de erro mais explícito no toast para facilitar suporte.

Etapa 4 — Aplicar ordenação por dificuldade também nas atividades
- Arquivo: `src/hooks/useActivityExercises.ts`
- Ação:
  - Incluir `nivel_dificuldade` da subcategoria no select.
  - Ordenar por `nivel_dificuldade` ASC e, em empate, por `ordem` ASC.
- Arquivo: `src/components/exercises/ExerciseResolver.tsx`
- Ação:
  - Remover/ajustar texto fixo “NÃO estão em ordem crescente” para não gerar falso negativo após correção.

Etapa 5 — Documentação dos módulos alterados
- Atualizar documentação em PT-BR (sem material de demo), cobrindo:
  - fluxo de cadastro de usuário por admin (Edge Function + update completo),
  - regra de acesso admin-only em rotas `/admin/*`,
  - padrão correto de bucket id no storage de exercícios,
  - regra de ordenação por dificuldade em listas e atividades.
- Arquivos de documentação a atualizar: `GERENCIAMENTO_USUARIOS.md` e `ATIVIDADES_MODULO.md` (e seção de exercícios relacionada).

Validação final (checklist)
- Admin cria usuário com data de nascimento e 2º responsável → campos persistem no banco.
- Direção/Coordenação não acessam `/admin/*` por URL.
- Cadastro de exercício com imagem → preview aparece e `imagem_url` grava.
- Em atividade do aluno, exercícios aparecem em dificuldade crescente.
- Sem erros novos no console e comportamento consistente em desktop/mobile.

Detalhes técnicos (resumo)
- Problema principal foi “correção parcial”: alguns pontos foram ajustados na tela/lista, mas não no fluxo real usado (admin-create-user e activity-exercises).
- Não precisa nova migration para estes ajustes (colunas já existem).
