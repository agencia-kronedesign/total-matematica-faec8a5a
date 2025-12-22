# Módulo de Atividades - Total Matemática

## Visão Geral

O módulo de atividades permite que professores criem atividades com exercícios e que alunos resolvam essas atividades com acompanhamento de progresso em tempo real.

**Principais partes:**
- Listagem de atividades do aluno
- Página de resolução de exercícios
- Submissão de respostas
- Relatórios do professor

---

## Fluxo do Aluno

### 1. Listagem de Atividades

**Arquivo:** `src/pages/StudentActivities.tsx`  
**Hook:** `src/hooks/useStudentActivities.ts`

Cada atividade retorna, entre outros campos:

- `exercicios_count` – total de exercícios ativos na atividade
- `exercicios_resolvidos` – exercícios que o aluno já respondeu
- `percentual_conclusao` – % da atividade concluída

**Na UI:**
- Atividades são divididas em:
  - **Pendentes**: `percentual_conclusao < 100`
  - **Concluídas**: `percentual_conclusao === 100`
- Cada card mostra:
  - `exercicios_resolvidos/exercicios_count` exercícios
  - `percentual_conclusao% concluído`
  - Badge "Concluída" quando `percentual_conclusao === 100`

### 2. Resolução de Exercícios

**Arquivo:** `src/pages/ActivityExercises.tsx`

Cálculo de progresso:

```ts
const completedExercises = exercises?.filter(ex =>
  allResponses?.includes(ex.id)
).length || 0;

const progressPercentage = exercises?.length
  ? Math.round((completedExercises / exercises.length) * 100)
  : 0;

const isActivityComplete = exercises?.length
  ? completedExercises === exercises.length
  : false;
```

**Banners:**
- **"Último Exercício!"** (alerta amarelo):
  - Condição: `currentExerciseIndex === exercises.length - 1 && !isActivityComplete`
  - Mensagem: o aluno chegou ao último, mas ainda faltam exercícios.
- **"Atividade Concluída!"** (sucesso verde):
  - Condição: `isActivityComplete === true`
  - Mensagem: o aluno respondeu todos os exercícios da atividade.
  - Mostra progresso final com 100%.

### 3. Submissão de Respostas

**Hook:** `src/hooks/useExerciseSubmission.ts`  
**Componente:** `src/components/exercises/ExerciseResolver.tsx`

Fluxo simplificado:

1. `submitExercise` envia a resposta para o backend (Supabase).
2. Em caso de sucesso:
   - Invalida as queries relacionadas para atualizar o progresso em tempo real:
     - `['activity-all-responses', atividadeId]`
     - `['student-activities']`
3. A UI recalcula:
   - `completedExercises`
   - `progressPercentage`
   - `isActivityComplete` e exibe ou esconde os banners de forma consistente.

---

## Fluxo do Professor

### 1. Minhas Atividades

**Arquivo:** `src/pages/professor/ProfessorAtividades.tsx`

Lista atividades por turma/ano letivo. Permite navegar para:
- Edição da atividade
- Relatório da atividade
- Criação de nova atividade

### 2. Relatório de Atividade

**Arquivo:** `src/pages/professor/ActivityReport.tsx`  
**Hook:** `src/hooks/useActivityReport.ts`

Exibe dados consolidados da atividade:
- Número de alunos
- Distribuição de acertos/erros
- Lista de alunos e status da atividade

### 3. Relatório para Impressão / PDF

**Arquivo:** `src/pages/professor/ActivityReportPrintPage.tsx`

- Usa os mesmos dados do relatório
- Layout otimizado para impressão/PDF

---

## Tabelas do Supabase

| Tabela | Descrição |
|--------|-----------|
| `atividades` | Cadastro de atividades |
| `atividade_exercicios` | Vínculo atividade ↔ exercício |
| `exercicios` | Exercícios (campo `ativo` filtra válidos) |
| `respostas` | Respostas dos alunos |
| `matriculas` | Vínculo aluno ↔ turma |

---

## Queries React Query

| Query Key | Descrição |
|-----------|-----------|
| `['student-activities']` | Lista de atividades do aluno |
| `['activity-exercises', atividadeId]` | Exercícios de uma atividade |
| `['activity-all-responses', atividadeId]` | IDs dos exercícios respondidos pelo aluno |
| `['activity-report', atividadeId]` | Relatório da atividade para o professor |

---

## Arquivos Principais

```
src/
├── pages/
│   ├── StudentActivities.tsx          # Lista de atividades do aluno
│   ├── ActivityExercises.tsx          # Resolução de exercícios
│   └── professor/
│       ├── ProfessorAtividades.tsx    # Lista de atividades do professor
│       ├── ActivityReport.tsx         # Relatório da atividade
│       └── ActivityReportPrintPage.tsx # Versão para impressão
├── hooks/
│   ├── useStudentActivities.ts        # Busca atividades do aluno
│   ├── useActivityExercises.ts        # Busca exercícios de uma atividade
│   ├── useActivityAllResponses.ts     # Busca respostas do aluno
│   ├── useExerciseSubmission.ts       # Submissão de respostas
│   └── useActivityReport.ts           # Dados do relatório
└── components/
    └── exercises/
        └── ExerciseResolver.tsx       # Componente de resolução
```
