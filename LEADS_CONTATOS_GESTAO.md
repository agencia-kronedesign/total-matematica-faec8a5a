# Documentação: Gestão de Leads e Contatos (Mini-CRM)

## Visão Geral

Sistema de gerenciamento de leads e contatos capturados pela landing page, com funcionalidades de filtro, busca, gestão de status e exportação CSV.

---

## Funcionalidades

### 1. Listagem com Paginação
- Exibição de 20 registros por página
- Ordenação por data de criação (mais recentes primeiro)
- Navegação entre páginas

### 2. Filtros Avançados
- **Busca por texto**: filtra por nome ou email
- **Filtro por data**: intervalo de data início e fim
- **Botões**: "Filtrar" para aplicar e "Limpar" para resetar

### 3. Gestão de Status
Status disponíveis para leads e contatos:

| Status | Cor | Descrição |
|--------|-----|-----------|
| `novo` | 🔵 Azul | Registro recém-capturado |
| `em_atendimento` | 🟡 Amarelo | Em processo de atendimento |
| `concluido` | 🟢 Verde | Atendimento finalizado |
| `arquivado` | ⬜ Cinza | Registro arquivado |

### 4. Exportação CSV
- Exporta todos os registros visíveis para arquivo CSV
- Inclui: Nome, Email, Escola/Mensagem, Status, Origem, Data

---

## Arquivos

### Hooks
| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useLeads.ts` | Gerencia dados de leads |
| `src/hooks/useContacts.ts` | Gerencia dados de contatos |

### Páginas
| Arquivo | Rota |
|---------|------|
| `src/pages/admin/LeadsManagement.tsx` | `/admin/leads` |
| `src/pages/admin/ContactsManagement.tsx` | `/admin/contatos` |

---

## Banco de Dados

### Tabela `leads`
```sql
status text NOT NULL DEFAULT 'novo'
-- Valores: 'novo', 'em_atendimento', 'concluido', 'arquivado'
```

### Tabela `contacts`
```sql
status text NOT NULL DEFAULT 'novo'
-- Valores: 'novo', 'em_atendimento', 'concluido', 'arquivado'
```

---

## APIs (Hooks)

### useLeads()
```typescript
const {
  leads,           // Lead[] - lista de leads
  loading,         // boolean - carregando
  error,           // Error | null - erro
  totalCount,      // number - total de registros
  currentPage,     // number - página atual
  totalPages,      // number - total de páginas
  filters,         // UseLeadsFilters - filtros ativos
  setFilters,      // (filters) => void - aplicar filtros
  refreshLeads,    // () => void - recarregar dados
  goToPage,        // (page) => void - ir para página
  exportToCSV,     // () => void - exportar CSV
  updateLeadStatus // (id, status) => void - atualizar status
} = useLeads();
```

### useContacts()
```typescript
const {
  contacts,             // Contact[] - lista de contatos
  loading,              // boolean - carregando
  error,                // Error | null - erro
  totalCount,           // number - total de registros
  currentPage,          // number - página atual
  totalPages,           // number - total de páginas
  filters,              // UseContactsFilters - filtros ativos
  setFilters,           // (filters) => void - aplicar filtros
  refreshContacts,      // () => void - recarregar dados
  goToPage,             // (page) => void - ir para página
  exportToCSV,          // () => void - exportar CSV
  updateContactStatus   // (id, status) => void - atualizar status
} = useContacts();
```

---

## Logs de Console

| Log | Descrição |
|-----|-----------|
| `[Admin/Leads] fetch-start` | Início do carregamento de leads |
| `[Admin/Leads] fetch-success` | Leads carregados com sucesso |
| `[Admin/Leads] fetch-error` | Erro ao carregar leads |
| `[Admin/Contacts] fetch-start` | Início do carregamento de contatos |
| `[Admin/Contacts] fetch-success` | Contatos carregados com sucesso |
| `[Admin/Contacts] fetch-error` | Erro ao carregar contatos |
| `[Admin/Status] update-start` | Início da atualização de status |
| `[Admin/Status] update-success` | Status atualizado com sucesso |
| `[Admin/Status] update-error` | Erro ao atualizar status |

---

## Permissões

- **Acesso**: Apenas administradores (RLS policies)
- **Leitura**: SELECT permitido para admin
- **Escrita**: UPDATE permitido para admin (status)

---

## Uso

### Alterar Status
1. Acesse `/admin/leads` ou `/admin/contatos`
2. Na coluna "Status", clique no dropdown
3. Selecione o novo status
4. A alteração é salva automaticamente

### Buscar Registros
1. Digite nome ou email no campo "Buscar"
2. Pressione Enter ou clique em "Filtrar"

### Exportar Dados
1. Clique no botão "Exportar CSV"
2. O arquivo será baixado automaticamente
