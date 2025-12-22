# Módulo: Relatório REDIN (Desempenho Individual por Atividade)

## Descrição

O REDIN (Relatório de Desempenho Individual) exibe o desempenho detalhado de um aluno específico em uma atividade, mostrando seu resultado questão a questão e comparando com a turma.

## Funcionalidades

### 1. Relatório Individual do Aluno

Acesso via: Botão "Ver detalhes" (ícone Eye) no relatório de atividade do professor

**O que mostra:**
- Cabeçalho com dados do aluno, turma e atividade
- Status geral da atividade (Concluída, Em andamento, Não respondeu)
- Resumo com contagem de questões por resultado
- Percentual de acerto do aluno vs. média da turma
- Indicador comparativo (acima/na média/abaixo)
- Tabela detalhada questão a questão

## Regras de Negócio

### Melhor Tentativa por Questão

Para cada exercício, o sistema considera a **MELHOR TENTATIVA** do aluno:

| Prioridade | acerto_nivel | Status REDIN |
|------------|--------------|--------------|
| 4 (maior) | `correto` | CORRETO |
| 3 | `correto_com_margem` | CORRETO_MARGEM |
| 2 | `meio_certo` | MEIO_CERTO |
| 1 | `incorreto` | INCORRETO |
| - | sem respostas | NAO_RESPONDEU |

### Comparativo com a Turma (Regra ±10pp)

O indicador de comparativo segue esta lógica:

- **ACIMA**: `percentualAcertoAluno >= percentualAcertoTurma + 10`
- **ABAIXO**: `percentualAcertoAluno <= percentualAcertoTurma - 10`
- **NA_MEDIA**: casos intermediários

### Status Geral da Atividade para o Aluno

| Condição | Status |
|----------|--------|
| Nenhuma resposta enviada | NAO_RESPONDEU |
| Algumas questões respondidas | EM_ANDAMENTO |
| Todas as questões respondidas | CONCLUIDA |

### Estatísticas da Turma por Questão

Para cada exercício, o sistema calcula:
- **% acerto da turma**: quantos alunos da turma acertaram (CORRETO ou CORRETO_MARGEM) / total de alunos
- **% não respondeu**: quantos alunos não enviaram nenhuma resposta / total de alunos

## Arquivos do Módulo

### Hooks

- `src/hooks/useRedinReport.ts` - Busca e processa dados do REDIN
  - Tipos exportados: `StatusAluno`, `StatusGeralAtividade`, `ComparativoTurma`, `RedinQuestao`, `RedinResumo`, `RedinCabecalho`, `RedinReport`
  - Função: `useRedinReport({ atividadeId, alunoId })`

### Componentes

- `src/components/relatorios/RedinAlunoDialog.tsx` - Modal do relatório REDIN
  - Props: `open`, `onOpenChange`, `atividadeId`, `alunoId`

### Arquivos Modificados

- `src/pages/professor/ActivityReport.tsx` - Substituído `AlunoDetailModal` por `RedinAlunoDialog`

## Estrutura de Dados

### useRedinReport Response

```typescript
{
  cabecalho: {
    alunoId: string;
    alunoNome: string;
    numeroChamada: number | null;
    turmaId: string;
    turmaNome: string;
    anoLetivo: number;
    atividadeId: string;
    atividadeTitulo: string;
    tipoAtividade: 'casa' | 'aula';
    dataEnvio: string;
    dataLimite: string | null;
    statusGeralAluno: 'NAO_RESPONDEU' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  };
  resumo: {
    totalQuestoes: number;
    corretas: number;
    meioCertas: number;              // CORRETO_MARGEM + MEIO_CERTO
    incorretas: number;
    naoRespondeu: number;
    percentualAcertoAluno: number;   // 0–100
    percentualAcertoTurma: number;   // média geral
    comparativoTurma: 'ACIMA' | 'NA_MEDIA' | 'ABAIXO';
  };
  questoes: Array<{
    exercicioId: string;
    ordem: number;
    formula: string | null;
    statusAluno: 'CORRETO' | 'CORRETO_MARGEM' | 'MEIO_CERTO' | 'INCORRETO' | 'NAO_RESPONDEU';
    tentativasAluno: number;
    respostaDigitada: string | null;
    totalAlunosTurma: number;
    alunosResponderam: number;
    alunosAcertaram: number;
    percentualAcertoTurma: number;       // 0–100
    percentualNaoRespondeuTurma: number; // 0–100
  }>;
}
```

## Consultas Supabase

O hook realiza 6 consultas:

1. `atividades` - Dados da atividade com turma
2. `matriculas` - Matrícula do aluno específico (nome, número de chamada)
3. `atividade_exercicios` - Exercícios vinculados à atividade
4. `respostas` - Respostas do aluno específico
5. `respostas` - Todas as respostas da turma (para estatísticas)
6. `matriculas` - Total de alunos matriculados na turma

## Cores e Badges

### Status do Aluno por Questão

| Status | Background | Texto | Borda |
|--------|------------|-------|-------|
| CORRETO | `bg-green-100` | `text-green-800` | `border-green-200` |
| CORRETO_MARGEM | `bg-emerald-100` | `text-emerald-800` | `border-emerald-200` |
| MEIO_CERTO | `bg-yellow-100` | `text-yellow-800` | `border-yellow-200` |
| INCORRETO | `bg-red-100` | `text-red-800` | `border-red-200` |
| NAO_RESPONDEU | `bg-gray-100` | `text-gray-600` | `border-gray-200` |

### Status Geral da Atividade

| Status | Cor |
|--------|-----|
| CONCLUIDA | `bg-green-500 text-white` |
| EM_ANDAMENTO | `bg-yellow-500 text-white` |
| NAO_RESPONDEU | `bg-gray-400 text-white` |

### Comparativo com a Turma

| Comparativo | Cor | Ícone |
|-------------|-----|-------|
| ACIMA | `bg-green-500 text-white` | TrendingUp |
| NA_MEDIA | `bg-blue-500 text-white` | Minus |
| ABAIXO | `bg-orange-500 text-white` | TrendingDown |

## Logs de Debug

```javascript
console.log('[REDIN] fetch-start', { atividadeId, alunoId });
console.log('[REDIN] fetch-success', { totalQuestoes, percentualAcertoAluno, percentualAcertoTurma });
console.error('[REDIN] fetch-error', error);
```

## Responsividade

- **Mobile (< 640px):** Cards em grid 2x2, tabela com scroll horizontal
- **Tablet/Desktop:** Cards em grid 4 colunas, tabela completa

## Componentes Utilizados

Da biblioteca shadcn/ui:
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Badge`
- `Button`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`
- `Alert`, `AlertTitle`, `AlertDescription`
- `Skeleton`

## Integração com Tabelas do Banco

### Tabelas Lidas

- `atividades` - Informações da atividade
- `turmas` - Nome e ano letivo da turma
- `matriculas` - Alunos matriculados com número de chamada
- `usuarios` - Nome dos alunos
- `atividade_exercicios` - Exercícios da atividade
- `exercicios` - Fórmulas dos exercícios
- `respostas` - Respostas enviadas pelos alunos

### Campos Utilizados da Tabela `respostas`

- `aluno_id` - Identificação do aluno
- `exercicio_id` - Identificação do exercício
- `atividade_id` - Identificação da atividade
- `resposta_digitada` - Valor digitado pelo aluno
- `acerto_nivel` - Classificação: 'correto', 'correto_com_margem', 'meio_certo', 'incorreto'
- `data_envio` - Data/hora do envio

## Permissões

O REDIN reutiliza as políticas RLS existentes:
- Professor pode ver respostas de alunos das suas turmas
- Admin/Coordenador/Direção têm acesso completo

## Uso Futuro

O hook `useRedinReport` é independente de role e pode ser reutilizado em:

- `/admin/relatorios/alunos/:alunoId/atividades/:atividadeId`
- `/responsavel/relatorios` (filtrado pelo(s) filho(s))
- `/aluno/relatorios` (apenas dados do próprio aluno, respeitando RLS)
