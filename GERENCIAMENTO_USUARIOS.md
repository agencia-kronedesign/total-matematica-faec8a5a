# Documentação: Gerenciamento de Usuários

## Visão Geral
Sistema completo de cadastro e gerenciamento de usuários com formulários especializados por tipo de usuário, garantindo uma UX limpa e campos apropriados para cada perfil.

## Funcionalidades Implementadas

### 1. Cadastro Especializado por Tipo de Usuário

#### Estrutura do Formulário Refatorado
- **6 abas organizadas logicamente:**
  1. **Tipo de Usuário** - Seleção inicial que define os campos seguintes
  2. **Dados Pessoais** - Informações básicas + campos específicos do tipo
  3. **Acesso** - Configurações de conta e permissões
  4. **Endereço** - Dados de localização
  5. **Preferências** - Configurações de notificações
  6. **Consentimento** - Termos e LGPD

#### Tipos de Usuário Suportados

**ALUNOS:**
- Campos obrigatórios: Número de Matrícula, Número de Chamada, Turma
- Responsável Principal: Nome e Email (obrigatórios)
- Segundo Responsável: Nome e Email (opcionais)
- Validações específicas para dados estudantis

**PROFESSORES:**
- Campos obrigatórios: Cargo/Função
- Campos específicos: Área de ensino/disciplina
- Orientações contextuais para preenchimento

**COORDENADORES:**
- Campos obrigatórios: Cargo/Função
- Foco em áreas de coordenação pedagógica
- Responsabilidades de supervisão

**DIREÇÃO:**
- Campos obrigatórios: Cargo/Função
- Dados administrativos e de gestão
- Permissões elevadas no sistema

**ADMINISTRADORES:**
- Acesso total ao sistema
- Configurações avançadas
- Gerenciamento completo de usuários

**RESPONSÁVEIS:**
- Dados pessoais básicos
- Vinculação com alunos menores

### 2. Componentes Especializados

#### UserTypeSelector
- **Localização:** `src/components/auth/user-fields/UserTypeSelector.tsx`
- **Função:** Interface para seleção do tipo de usuário
- **Características:**
  - Dropdown com todos os tipos disponíveis
  - Descrição contextual do tipo selecionado
  - Visual diferenciado para orientar o usuário

#### BasicPersonalFields
- **Localização:** `src/components/auth/user-fields/BasicPersonalFields.tsx`
- **Função:** Campos pessoais comuns a todos os tipos
- **Campos:**
  - Nome Completo (obrigatório)
  - Email (obrigatório)
  - Telefones (celular e fixo)
  - CPF e RG
  - Data de nascimento

#### StudentRegistrationFields
- **Localização:** `src/components/auth/user-fields/StudentRegistrationFields.tsx`
- **Função:** Campos específicos para alunos
- **Características:**
  - Visual diferenciado (fundo azul)
  - Dados acadêmicos obrigatórios
  - Seção para responsáveis
  - Validações específicas para estudantes

#### StaffRegistrationFields
- **Localização:** `src/components/auth/user-fields/StaffRegistrationFields.tsx`
- **Função:** Campos específicos para equipe (professores, coordenadores, direção)
- **Características:**
  - Visual diferenciado (fundo verde)
  - Campos profissionais
  - Orientações contextuais por tipo

### 3. Validações Específicas

#### Validação de Alunos
```typescript
// Campos obrigatórios para alunos
- numero_matricula: string (obrigatório)
- numero_chamada: number (obrigatório)  
- turma: string (obrigatório)
- nome_responsavel: string (obrigatório)
- email_responsavel: string (obrigatório, email válido)
```

#### Validação de Staff
```typescript
// Campos obrigatórios para equipe
- cargo: string (obrigatório para professor, coordenador, direção, admin)
```

### 4. Fluxo de Navegação Melhorado

#### Progressão Lógica das Abas
1. **Tipo** → Define quais campos aparecerão
2. **Dados** → Coleta informações baseadas no tipo
3. **Acesso** → Configurações de conta
4. **Endereço** → Informações de localização
5. **Preferências** → Configurações pessoais
6. **Consentimento** → Termos e finalização

#### Indicadores Visuais
- Barra de progresso para novos cadastros
- Indicadores de status por aba (erro/completo)
- Navegação intuitiva entre as etapas

### 5. Experiência do Usuário (UX)

#### Melhorias Implementadas
- ✅ **Campos relevantes apenas:** Cada tipo vê só o que precisa
- ✅ **Validações contextuais:** Erros específicos por perfil
- ✅ **Visual diferenciado:** Cores e seções por tipo de usuário
- ✅ **Orientações claras:** Descrições e placeholders contextuais
- ✅ **Navegação fluida:** Botões de anterior/próximo inteligentes
- ✅ **Feedback imediato:** Status visual por etapa

#### Benefícios Alcançados
- **Redução de erros:** Campos irrelevantes eliminados
- **Maior eficiência:** Processo mais rápido e direto
- **Melhor compreensão:** Usuário sabe exatamente o que preencher
- **Manutenibilidade:** Código organizado em componentes especializados

## Tipos de Dados

### Interface UserFormData Estendida
```typescript
export interface UserFormData {
  // Dados básicos (todos os tipos)
  nome: string;
  email: string;
  tipo_usuario: UserType;
  
  // Dados específicos por tipo
  numero_matricula?: string;     // Apenas alunos
  numero_chamada?: number;       // Apenas alunos
  turma?: string;               // Apenas alunos
  nome_responsavel?: string;    // Apenas alunos
  email_responsavel?: string;   // Apenas alunos
  cargo?: string;               // Staff (obrigatório)
  
  // Dados comuns opcionais
  telefone_mobile?: string;
  telefone_fixo?: string;
  cpf?: string;
  // ... outros campos
}
```

## Manutenção e Extensibilidade

### Adicionando Novos Tipos de Usuário
1. Adicionar novo tipo em `UserType`
2. Atualizar `USER_TYPE_LABELS`
3. Criar componente específico se necessário
4. Adicionar validações no schema
5. Testar fluxo completo

### Modificando Campos Existentes
1. Atualizar interface `UserFormData`
2. Ajustar validações no schema
3. Modificar componentes relacionados
4. Verificar impacto no banco de dados

## Considerações de Segurança

### Validações Implementadas
- ✅ Validação de emails
- ✅ Campos obrigatórios por tipo
- ✅ Sanitização de dados
- ✅ Verificação de permissões
- ✅ Captcha de segurança

### Controle de Acesso
- Apenas administradores podem criar usuários
- Validações server-side via RLS Supabase
- Logs de auditoria para ações administrativas

## Status da Implementação
- ✅ **Concluído:** Refatoração completa do formulário
- ✅ **Concluído:** Componentes especializados criados
- ✅ **Concluído:** Validações específicas por tipo
- ✅ **Concluído:** UX melhorada com navegação inteligente
- ✅ **Concluído:** Documentação completa

## Próximos Passos Sugeridos
1. Testes de usabilidade com usuários reais
2. Implementação de upload de foto de perfil
3. Integração com sistema de matrícula automática
4. Relatórios de usuários cadastrados por tipo