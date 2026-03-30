

## Plano: Revisão Completa de Níveis de Acesso por Tipo de Usuário

### Problema
Todos os perfis estão vendo funcionalidades que não deveriam, porque as permissões no código não seguem a Política de Acessos oficial. O hook `usePermissions` agrupa perfis incorretamente (ex: coordenador pode criar exercícios quando deveria apenas visualizar relatórios).

### Mapeamento da Política Oficial vs. Código Atual

```text
NÍVEL 0 - ADMIN         → Tudo (OK no código)
NÍVEL 1 - DIREÇÃO       → CRUD usuários, importar, relatórios, gestão local
                           PROBLEMA: bloqueada de /admin/* mas precisa gerenciar usuários/escolas
NÍVEL 2 - COORDENADOR   → Apenas visualizar relatórios, monitorar atividades
                           PROBLEMA: pode criar exercícios, ver menu professor, gerenciar categorias
NÍVEL 3 - PROFESSOR     → Gerenciar PRÓPRIAS turmas/atividades, relatórios próprios alunos
                           PROBLEMA: OK em geral, mas sidebar mostra itens demais
NÍVEL 4 - ALUNO/RESP    → Apenas próprias atividades e relatórios individuais
                           PROBLEMA: OK
```

### Correções por arquivo

#### 1. `src/hooks/usePermissions.ts` — Reescrever permissões conforme política

| Permissão | Antes | Depois (política) |
|-----------|-------|--------------------|
| `canCreateExercises` | admin, direcao, professor, coordenador | admin, professor |
| `canManageCategories` | admin, direcao, professor, coordenador | admin, professor |
| `canManageUsers` | admin, direcao, coordenador | admin, direcao |
| `canDeleteStudents` | admin, direcao | admin, direcao |
| `canViewReports` | admin, direcao, professor, coordenador | admin, direcao, professor, coordenador (OK) |
| `canManageContent` | admin, direcao, professor, coordenador | admin, professor |
| Nova: `canAccessProfessorArea` | - | admin, direcao, professor (coordenador só vê relatórios) |
| Nova: `canManageSchools` | - | admin, direcao |
| Nova: `canManageEnrollments` | - | admin, direcao, coordenador |
| Nova: `isDirecao` | - | boolean helper |
| Nova: `isCoordenador` | - | boolean helper |

#### 2. `src/components/dashboard/DashboardSidebar.tsx` — Menu por nível

- **Aluno**: Home, Minhas Atividades, Mais Exercícios (sem alteração)
- **Professor**: Home, Relatórios, Exercícios (com submenu Novo/Categorias), Atividades em Classe + Seção Professor (Área do Professor, Minhas Atividades, Minhas Turmas)
- **Coordenador**: Home, Relatórios, Atividades em Classe (visualização). SEM seção Professor, SEM criar exercícios, SEM gerenciar categorias
- **Direção**: Home, Relatórios, Atividades em Classe + Seção Gestão (Usuários, Escolas, Turmas, Matrículas) + Seção Professor (visualizar atividades/turmas)
- **Admin**: Tudo acima + Seção Administração completa

#### 3. `src/pages/admin/AdminPage.tsx` — Permitir direção em rotas de gestão

- Alterar `requiredRole` de `['admin']` para `['admin', 'direcao']`
- Direção precisa acessar: Usuários, Escolas, Turmas, Matrículas
- Direção NÃO acessa: Leads, Contatos, Painel Admin (dashboard admin)

#### 4. `src/App.tsx` — Separar rotas admin por nível

- Rotas de gestão (usuários, escolas, turmas, matrículas): `requiredRole=['admin', 'direcao']`
- Rotas exclusivas admin (leads, contatos, dashboard admin): `requiredRole=['admin']`
- Rotas professor: manter `canCreateExercises` (admin + professor) ou criar nova verificação
- Coordenador acessa `/professor/*` apenas para visualizar relatórios, não para criar

#### 5. `src/components/TeacherRoute.tsx` — Ajustar verificação

- Usar nova permissão `canAccessProfessorArea` (admin, direcao, professor, coordenador) para visualização
- Manter `canCreateExercises` (admin, professor) apenas para criação de exercícios

#### 6. `src/pages/professor/ProfessorPage.tsx` — Permitir coordenador e direção verem relatórios

- Trocar `canCreateExercises()` por `canAccessProfessorArea()` para permitir coordenador/direção acessar a área para fins de monitoramento

#### 7. `src/components/Header.tsx` e `src/components/UserMenu.tsx` — Ajustar links por perfil

- Direção: mostrar links de Gestão (Usuários, Escolas) além de Atividades/Turmas
- Coordenador: mostrar apenas Relatórios e Turmas (monitoramento)
- Remover links de criação para coordenador

#### 8. `src/components/dashboard/DashboardContent.tsx` — Cards por perfil

- Coordenador: mostrar card "Relatórios" e "Turmas" (monitoramento), sem "Área do Professor"
- Direção: mostrar card "Gestão" (usuários/escolas) + "Relatórios"
- Professor: manter "Área do Professor"

### Resumo de impacto por perfil

```text
COORDENADOR perde:
  - Criar exercícios
  - Gerenciar categorias
  - Menu "Professor" na sidebar
  - Submenu "Novo Exercício"

DIREÇÃO ganha:
  - Acesso a /admin/usuarios, /admin/escolas, /admin/turmas, /admin/matriculas
  - Seção "Gestão" na sidebar
  - Links de gestão no header

PROFESSOR sem mudanças significativas

ALUNO sem mudanças
```

### Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/usePermissions.ts` | Reescrever todas as permissões |
| `src/components/dashboard/DashboardSidebar.tsx` | Menu por nível hierárquico |
| `src/pages/admin/AdminPage.tsx` | Aceitar direcao em rotas de gestão |
| `src/App.tsx` | Separar rotas admin vs gestão |
| `src/components/TeacherRoute.tsx` | Nova permissão para área professor |
| `src/pages/professor/ProfessorPage.tsx` | Aceitar coordenador/direcao |
| `src/components/Header.tsx` | Links por perfil ajustados |
| `src/components/UserMenu.tsx` | Menu dropdown por perfil |
| `src/components/dashboard/DashboardContent.tsx` | Cards por perfil |

### Critérios de Sucesso
- Admin vê tudo
- Direção vê gestão (usuários, escolas, turmas, matrículas) + relatórios, sem leads/contatos/painel admin
- Coordenador vê apenas relatórios e monitoramento, sem criar nada
- Professor vê apenas suas turmas/atividades/exercícios
- Aluno vê apenas suas atividades e exercícios para praticar
- Nenhuma rota acessível por URL direta fora do nível permitido

