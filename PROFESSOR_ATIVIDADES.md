# Módulo: Gestão de Atividades do Professor

## Descrição
Este módulo permite que professores criem, gerenciem e acompanhem atividades avaliativas para suas turmas, incluindo atividades do tipo "Para Casa" e "Em Aula".

## Funcionalidades

### 1. Dashboard do Professor (`/professor`)
- Visão geral das atividades recentes
- Estatísticas: total de atividades, ativas, por tipo (casa/aula)
- Acesso rápido para criar nova atividade

### 2. Lista de Atividades (`/professor/atividades`)
- Visualização em cards responsivos
- Filtros por: texto, turma, tipo de atividade
- Ações: visualizar, editar, excluir
- Botão de destaque "Nova Atividade"

### 3. Criação/Edição de Atividade
- Campos: título, descrição, tipo (casa/aula), turma, data limite
- Seleção de múltiplos exercícios
- O `professor_id` é salvo automaticamente

## Arquivos do Módulo

### Páginas
- `src/pages/professor/ProfessorPage.tsx` - Layout com sidebar
- `src/pages/professor/ProfessorDashboard.tsx` - Dashboard principal
- `src/pages/professor/ProfessorAtividades.tsx` - Listagem de atividades
- `src/pages/professor/ProfessorSidebar.tsx` - Sidebar de navegação

### Hooks
- `src/hooks/useAtividadesProfessor.ts` - Busca atividades do professor logado
  - `useAtividadesProfessor()` - Lista todas as atividades
  - `useEstatisticasProfessor()` - Retorna estatísticas

### Componentes Reutilizados
- `src/components/atividades/AtividadeFormDialog.tsx` - Formulário
- `src/components/atividades/AtividadeDetailDialog.tsx` - Visualização

## Rotas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/professor` | ProfessorDashboard | Dashboard do professor |
| `/professor/atividades` | ProfessorAtividades | Lista de atividades |
| `/professor/atividades?criar=true` | ProfessorAtividades | Abre modal de criação |

## Permissões

O acesso é controlado pelo hook `usePermissions`:
- `canCreateExercises()` - Professor, Coordenador, Direção, Admin

## Integração com Aluno

As atividades aparecem automaticamente para alunos matriculados na turma:
- Filtro por `turma_id` da matrícula do aluno
- Status `ativa`
- Data limite não expirada (`data_limite IS NULL OR data_limite > NOW()`)

## Tabelas do Banco de Dados

### `atividades`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | ID único |
| titulo | text | Título da atividade |
| descricao | text | Descrição opcional |
| tipo | enum | 'casa' ou 'aula' |
| turma_id | uuid | Turma associada |
| professor_id | uuid | Professor criador |
| data_envio | timestamp | Data de criação |
| data_limite | timestamp | Prazo de entrega |
| status | text | 'ativa', 'finalizada', 'cancelada' |

### `atividade_exercicios`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | ID único |
| atividade_id | uuid | Atividade |
| exercicio_id | uuid | Exercício vinculado |

## Logs

O módulo implementa logs com prefixo `[ProfessorAtividade]` para debugging:
```javascript
console.log('[ProfessorAtividade]', data);
```

## Responsividade

- Mobile-first: cards empilhados em telas < 640px
- Formulário vertical no mobile
- Filtros em grid responsivo
