# Módulo: Relatório de Atividades (Visão do Professor)

## Descrição
Este módulo permite que professores visualizem o desempenho da turma em uma atividade específica, mostrando dados agregados e individuais dos alunos.

## Funcionalidades

### 1. Relatório por Atividade (`/professor/atividades/:atividadeId/relatorio`)
- Visualização do cabeçalho da atividade (título, turma, tipo, datas)
- Cards de resumo com métricas agregadas
- Distribuição de desempenho por categoria
- Tabela com todos os alunos da turma
- Modal de detalhes por aluno

## Regras de Negócio

### Status Geral do Aluno
O sistema considera a **MELHOR TENTATIVA** do aluno na atividade, seguindo a prioridade:
1. `correto` (prioridade 4) → Status: **100% CORRETO**
2. `correto_com_margem` (prioridade 3) → Status: **ACERTO COM MARGEM**
3. `meio_certo` (prioridade 2) → Status: **MEIO CERTO**
4. `incorreto` (prioridade 1) → Status: **ERRO**
5. Sem respostas → Status: **NÃO RESPONDEU**

### Visibilidade Total da Turma
A lista de alunos inclui **TODOS** os matriculados na turma da atividade:
- Alunos com respostas: exibem seu status baseado na melhor tentativa
- Alunos sem respostas: exibidos com status `NAO_RESPONDEU` (cinza)

### Proteção de Rota
A página usa `ProfessorPage` que verifica:
- Usuário autenticado
- Permissão `canCreateExercises()` (admin, direção, professor, coordenador)

## Arquivos do Módulo

### Hooks
- `src/hooks/useActivityReport.ts` - Busca e agrega dados do relatório
  - Tipos exportados: `StatusGeral`, `RespostaPorAluno`, `ResumoAtividade`, `AtividadeInfo`, `ActivityReportData`
  - Função: `useActivityReport(atividadeId)`

### Páginas
- `src/pages/professor/ActivityReport.tsx` - Página do relatório completo

### Arquivos Modificados
- `src/App.tsx` - Adicionada rota `/professor/atividades/:atividadeId/relatorio`
- `src/pages/professor/ProfessorAtividades.tsx` - Botão "Relatório" nos cards

## Rotas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/professor/atividades/:atividadeId/relatorio` | ActivityReport | Relatório detalhado |

## Estrutura de Dados

### useActivityReport Response
```typescript
{
  atividade: {
    id: string;
    titulo: string;
    descricao: string | null;
    tipo: 'casa' | 'aula';
    status: string | null;
    data_envio: string;
    data_limite: string | null;
    turma: { id: string; nome: string; ano_letivo: number } | null;
  };
  resumo: {
    totalAlunosNaTurma: number;
    totalAlunosQueResponderam: number;
    totalRespostas: number;
    porCategoriaResultado: {
      correto100: number;
      acertoMargem: number;
      meioCerto: number;
      erros: number;
    };
  };
  respostasPorAluno: Array<{
    alunoId: string;
    nomeAluno: string;
    numeroChamada: number | null;
    statusGeral: 'CORRETO' | 'ACERTO_MARGEM' | 'MEIO_CERTO' | 'ERRO' | 'NAO_RESPONDEU';
    respostas: Array<{
      exercicioId: string;
      formula: string | null;
      respostaDigitada: string | null;
      acertoNivel: string | null;
      dataResposta: string;
    }>;
  }>;
}
```

## Consultas Supabase

O hook realiza 4 consultas:
1. `atividades` - Dados da atividade com turma
2. `matriculas` - Alunos matriculados na turma (status = 'ativo')
3. `atividade_exercicios` - Exercícios vinculados
4. `respostas` - Respostas dos alunos (filtrado por atividade_id)

## Cores para Status

| Status | Background | Texto | Borda |
|--------|------------|-------|-------|
| CORRETO | `bg-green-100` | `text-green-800` | `border-green-200` |
| ACERTO_MARGEM | `bg-emerald-100` | `text-emerald-800` | `border-emerald-200` |
| MEIO_CERTO | `bg-yellow-100` | `text-yellow-800` | `border-yellow-200` |
| ERRO | `bg-red-100` | `text-red-800` | `border-red-200` |
| NAO_RESPONDEU | `bg-gray-100` | `text-gray-600` | `border-gray-200` |

## Logs de Debug

```javascript
console.log('[ActivityReport] Buscando dados para atividade:', atividadeId);
console.log('[ActivityReport] Matrículas encontradas:', count);
console.log('[ActivityReport] Respostas encontradas:', count);
console.log('[ActivityReport] Resumo:', resumo);
console.log('[ActivityReport] Total alunos processados:', count);
```

## Responsividade

- **Mobile (< 640px):** Cards em coluna única, tabela com scroll horizontal
- **Tablet (640px - 1024px):** Grid 2x2 para cards
- **Desktop (> 1024px):** Grid 4 colunas para cards de resumo

## Componentes Utilizados

Da biblioteca shadcn/ui:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Badge`
- `Button`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
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
- `resposta_digitada` - Valor digitado pelo aluno
- `acerto_nivel` - Classificação: 'correto', 'correto_com_margem', 'meio_certo', 'incorreto'
- `data_envio` - Data/hora do envio
