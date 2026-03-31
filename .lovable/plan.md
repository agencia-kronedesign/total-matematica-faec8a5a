

## Plano: Corrigir área do professor para coordenador

### Problema
O coordenador acessa `/professor/*` e vê exatamente o mesmo layout e menus do professor, incluindo "Criar Atividade", "Novo Exercício" e o label "Professor" no sidebar — funcionalidades que a política de acesso não permite para coordenador.

### Causa raiz
1. `ProfessorSidebar.tsx` mostra todos os itens para qualquer usuário, sem verificar permissões
2. `ProfessorPage.tsx` mostra "Área do Professor" no header para todos os perfis
3. O sidebar exibe label fixo "Professor" ao lado do nome do usuário

### Correções

#### 1. `src/pages/professor/ProfessorSidebar.tsx`
- Importar `usePermissions` e verificar `canCreateExercises()` e `canManageUsers()`
- Filtrar itens do menu:
  - **Coordenador vê**: Dashboard, Turmas (monitoramento), Relatórios
  - **Coordenador NÃO vê**: Criar Atividade, Novo Exercício, Minhas Atividades
  - **Direção vê**: tudo do coordenador + Minhas Atividades
  - **Professor/Admin vê**: tudo
- Trocar label fixo "Professor" pelo tipo real do usuário (ex: "Coordenador", "Direção")

#### 2. `src/pages/professor/ProfessorPage.tsx`
- Trocar texto fixo "Área do Professor" por título dinâmico baseado no perfil:
  - Professor → "Área do Professor"
  - Coordenador → "Monitoramento"
  - Direção → "Gestão Pedagógica"
  - Admin → "Administração Pedagógica"

#### 3. `src/App.tsx` — Proteger rotas de criação
- Rotas `/exercicios/cadastrar` e `/exercicios/editar/:id` já usam `TeacherRoute` que permite coordenador via `canAccessProfessorArea`. Trocar para verificação com `canCreateExercises` (admin + professor apenas).

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/pages/professor/ProfessorSidebar.tsx` | Filtrar menu por permissão, label dinâmico |
| `src/pages/professor/ProfessorPage.tsx` | Título dinâmico por perfil |
| `src/App.tsx` | Proteger rotas de criação de exercício |

### Critérios de Sucesso
- Coordenador vê apenas Dashboard, Turmas e Relatórios no sidebar
- Coordenador não vê "Criar Atividade" nem "Novo Exercício"
- Header mostra "Monitoramento" para coordenador, não "Área do Professor"
- Professor continua vendo tudo normalmente
- Coordenador não acessa `/exercicios/cadastrar` por URL direta

