# Módulo: Relatório de Evolução do Aluno

## Descrição

Este módulo permite que professores acompanhem a evolução de um aluno ao longo de várias atividades, mostrando desempenho por atividade, datas, status e um resumo geral.

## Funcionalidade

- **Rota:** `/professor/alunos/:alunoId/evolucao`
- **Query string opcional:** `?turma={turmaId}` para filtrar por turma específica
- **Acesso:** A partir do botão "Ver evolução" (ícone TrendingUp) no relatório de atividade

## Recursos

### Cabeçalho
- Nome do aluno em destaque
- Badge com turma atual (se informada)
- Botão voltar para página anterior

### Cards de Resumo
- **Total de Atividades:** Quantidade total de atividades
- **Concluídas:** Atividades com pelo menos 1 resposta
- **Não Respondidas:** Atividades sem nenhuma resposta
- **100% Corretas:** Atividades com status CORRETO

### Distribuição de Desempenho
Cards coloridos mostrando:
- **Correto:** Verde - respostas 100% corretas
- **Com Margem:** Verde-claro - respostas corretas dentro da margem de erro
- **Parcial:** Amarelo - respostas parcialmente corretas
- **Incorreto:** Vermelho - respostas incorretas

### Lista de Atividades
Grid responsivo com cards contendo:
- Título da atividade
- Badge de status geral
- Turma e ano letivo
- Data de criação e prazo
- Indicador X/Y exercícios respondidos

### Tabela Detalhada
Tabela com colunas:
- Atividade | Turma | Data | Status | Exercícios
- Ordenada por data (mais recente primeiro)
- Scroll horizontal em mobile

## Arquivos do Módulo

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useAlunoEvolucao.ts` | Hook para buscar evolução do aluno reutilizando lógica do useActivityReport |
| `src/pages/professor/AlunoEvolucao.tsx` | Página de evolução do aluno com cards e tabela |

## Dependências

### Hooks Reutilizados
- `PRIORIDADE_ACERTO` de `useActivityReport.ts`
- `mapAcertoNivelToStatus` de `useActivityReport.ts`
- `determinarMelhorTentativa` de `useActivityReport.ts`
- `StatusGeral` type de `useActivityReport.ts`
- `RespostaDetalhe` interface de `useActivityReport.ts`

### Tabelas do Banco de Dados (somente leitura)
- `usuarios` - Dados do aluno
- `matriculas` - Matrículas do aluno nas turmas
- `turmas` - Informações das turmas
- `atividades` - Atividades das turmas
- `atividade_exercicios` - Exercícios de cada atividade
- `respostas` - Respostas do aluno

## Tipos Exportados

```typescript
export type StatusGeral = 'CORRETO' | 'ACERTO_MARGEM' | 'MEIO_CERTO' | 'ERRO' | 'NAO_RESPONDEU';

export interface EvolucaoAtividade {
  atividadeId: string;
  titulo: string;
  turmaNome: string;
  turmaId: string;
  anoLetivo: number;
  dataCriacao: string;
  dataPrazo: string | null;
  melhorStatus: StatusGeral;
  totalExercicios: number;
  totalRespondidos: number;
}

export interface ResumoEvolucao {
  totalAtividades: number;
  concluidas: number;
  naoRespondidas: number;
  corretas: number;
  acertoMargem: number;
  meioCertas: number;
  erros: number;
}

export interface AlunoInfo {
  id: string;
  nome: string;
  turmaAtual: { id: string; nome: string; ano_letivo: number } | null;
}
```

## Uso do Hook

```typescript
import { useAlunoEvolucao } from '@/hooks/useAlunoEvolucao';

const { aluno, atividades, resumo, isLoading, error } = useAlunoEvolucao(alunoId, turmaId);
```

## Navegação

### Para acessar a evolução do aluno:
1. Acesse o relatório de uma atividade (`/professor/atividades/:atividadeId/relatorio`)
2. Na tabela "Desempenho por Aluno", clique no ícone de gráfico (TrendingUp) na coluna Ações

### Botão Ver Evolução
- Localização: Coluna "Ações" da tabela de alunos no relatório de atividade
- Ícone: `TrendingUp` (lucide-react)
- Navegação: `/professor/alunos/{alunoId}/evolucao?turma={turmaId}`

## Responsividade

- **Mobile (< 640px):** 1 coluna para cards
- **Tablet (640px - 1024px):** 2 colunas para cards de resumo, 2 para atividades
- **Desktop (> 1024px):** 4 colunas para resumo, 3 para atividades
- Tabela com `overflow-x-auto` para scroll horizontal em telas pequenas
