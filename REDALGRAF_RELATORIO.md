# REDALGRAF - Relatório Gráfico de Evolução do Aluno

## Visão Geral

O **REDALGRAF** (Relatório de Desempenho Aluno Gráfico) é um relatório longitudinal que mostra a evolução do desempenho de um aluno ao longo das atividades, com comparação à média da turma.

## Localização

- **Hook:** `src/hooks/useRedalgraf.ts`
- **Página:** `src/pages/professor/AlunoEvolucao.tsx`
- **Rota:** `/professor/alunos/:alunoId/evolucao`

## Tipos Exportados

### `RedalgrafAtividade`

```typescript
interface RedalgrafAtividade {
  atividadeId: string;
  titulo: string;
  turmaId: string;
  turmaNome: string;
  anoLetivo: number;
  dataEnvio: string;
  tipoAtividade: 'casa' | 'aula';
  percentualAcertoAluno: number;   // 0-100
  percentualAcertoTurma: number;   // 0-100
  totalQuestoes: number;
  questoesRespondidas: number;
  questoesCorretas: number;
}
```

### `ResumoRedalgraf`

```typescript
interface ResumoRedalgraf {
  totalAtividades: number;
  mediaGeralAluno: number;   // Média de todas as atividades
  mediaGeralTurma: number;   // Média da turma em todas as atividades
}
```

### `UseRedalgrafParams`

```typescript
interface UseRedalgrafParams {
  alunoId: string;
  turmaId?: string;                           // Opcional: filtrar por turma específica
  periodo?: '30dias' | 'bimestre' | 'ano';    // Padrão: 'ano'
}
```

## Funcionalidades

### 1. Gráfico de Evolução

- **Tipo:** Gráfico de linha (`LineChart` do Recharts)
- **Séries:**
  - Linha sólida: Desempenho do aluno
  - Linha tracejada: Média da turma
- **Interatividade:** Clique em um ponto para abrir o REDIN daquela atividade

### 2. Filtro por Período

- **30 dias:** Últimas 4 semanas
- **Bimestre:** Últimos 60 dias
- **Ano:** Desde 1º de janeiro do ano atual

### 3. Tabela Detalhada

Lista todas as atividades com:
- Título e tipo (Casa/Aula)
- Turma e data
- Questões respondidas/total
- Percentual do aluno vs turma
- Botão para abrir REDIN

### 4. Integração com REDIN

Ao clicar em qualquer atividade (no gráfico ou tabela), abre o modal `RedinAlunoDialog` com o relatório detalhado daquela atividade específica.

## Exemplo de Uso

```typescript
import { useRedalgraf } from '@/hooks/useRedalgraf';

const MeuComponente = () => {
  const { aluno, atividades, resumo, isLoading, error } = useRedalgraf({
    alunoId: 'uuid-do-aluno',
    periodo: 'bimestre',
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <h1>{aluno?.nome}</h1>
      <p>Média: {resumo.mediaGeralAluno.toFixed(1)}%</p>
      {/* Renderizar gráfico e tabela */}
    </div>
  );
};
```

## Cálculo do Percentual de Acerto

Para cada atividade, o percentual é calculado como:

```
percentualAcertoAluno = (questoesCorretas / totalQuestoes) * 100
```

Onde uma questão é considerada "correta" se a melhor tentativa do aluno tem `acerto_nivel` igual a:
- `correto`
- `correto_com_margem`

## Cálculo da Média da Turma

A média da turma por atividade considera:
1. Todos os alunos matriculados na turma (status = 'ativo')
2. Para cada aluno, o percentual de acerto é calculado da mesma forma
3. A média é a soma dos percentuais dividida pelo total de alunos da turma

**Nota:** Alunos que não responderam contribuem com 0% para a média.

## Logs de Debug

O hook emite logs prefixados com `[REDALGRAF]`:

```javascript
console.log('[REDALGRAF] fetch-start', { alunoId, turmaId, periodo });
console.log('[REDALGRAF] fetch-success', { totalAtividades, mediaGeralAluno, mediaGeralTurma });
console.error('[REDALGRAF] Erro ao buscar...', error);
```

## Considerações de RLS

O professor só consegue acessar dados de:
- Alunos matriculados em turmas sob sua responsabilidade
- Atividades que ele próprio criou ou que pertencem a turmas que ele leciona

As políticas RLS do Supabase garantem que:
- `matriculas`: Professor pode ver matrículas de suas turmas
- `atividades`: Professor pode ver atividades de suas turmas
- `respostas`: Professor pode ver respostas de atividades de suas turmas

## Dependências

- `@tanstack/react-query` - Gerenciamento de cache
- `recharts` - Biblioteca de gráficos
- `date-fns` - Formatação de datas
- `useRedinReport` - Reutilizado para o modal de detalhes

## Relacionamentos com Outros Relatórios

```
REDALGRAF (Evolução do Aluno)
    │
    ├── Clique em atividade
    │
    └── REDIN (Detalhes por Questão)
            │
            └── Comparativo com a turma por questão
```

## Atualizações Futuras

- [ ] Exportar REDALGRAF em PDF
- [ ] Comparação com outros alunos selecionados
- [ ] Filtro por categoria/subcategoria de exercício
- [ ] Média móvel no gráfico
