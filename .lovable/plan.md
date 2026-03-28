

## Plano: Corrigir os 7 itens da conferência

### Resumo dos 7 itens

| # | Item | Causa raiz |
|---|------|-----------|
| 1 | Logo no footer sem fundo amarelo | `bg-white` no container do logo |
| 2 | CEP não auto-preenche endereço/estado/cidade no cadastro de escolas | `useCEP` não está integrado no `useEscolaForm` |
| 3 | Data de nascimento não salva | `data_nascimento` pode ser `""` (string vazia) — precisa sanitizar para `null` no `useUserRegistration` |
| 4 | 2º responsável não salva | Tabela `usuarios` não tem colunas `nome_responsavel2`/`email_responsavel2`. Precisa adicionar via migration |
| 5 | Direção/Coordenação sem restrição de acesso | Sidebar mostra itens admin para esses perfis mas as rotas não estão protegidas adequadamente |
| 6 | Imagem do exercício não aparece | Bucket chama-se `Exercise Images` (com espaço) mas o código usa `exercise-images` (com hífen) |
| 7 | Exercícios não ordenam por dificuldade crescente | Query ordena por `ordem` mas não por `nivel_dificuldade` da subcategoria |

---

### Correções detalhadas

#### 1. Logo com fundo amarelo no footer
**Arquivo:** `src/components/Footer.tsx`
- Trocar `bg-white` por `bg-[#FFD700]` (amarelo) no container do logo

#### 2. Auto-preenchimento por CEP no cadastro de escolas
**Arquivos:** `src/hooks/useEscolaForm.ts`, `src/components/admin/escola-form/BasicInfoSection.tsx`
- Integrar `useCEP` no hook `useEscolaForm`
- Ao digitar CEP completo (8 dígitos), chamar `fetchAddressByCEP`
- Preencher automaticamente `endereco` (logradouro + bairro), `estado` (uf) e `cidade` (localidade)
- Retornar a função de busca CEP do hook para o componente BasicInfoSection disparar a busca no `onValueChange` do campo CEP

#### 3. Data de nascimento não salva
**Arquivo:** `src/hooks/useUserRegistration.ts`
- Sanitizar `data_nascimento`: converter `""` para `null` antes de enviar ao banco
- Já tem sanitização no `updateUser` do `UserRegistrationForm.tsx`, falta no `registerUser`
- Linha 243: trocar `data_nascimento: formData.data_nascimento` por `data_nascimento: formData.data_nascimento || null`

#### 4. Segundo responsável não salva
**Mudança de banco + código:**
- **Migration:** Adicionar colunas `nome_responsavel2 text` e `email_responsavel2 text` na tabela `usuarios`
- **Arquivo:** `src/hooks/useUserRegistration.ts` — incluir `nome_responsavel2` e `email_responsavel2` no update
- **Arquivo:** `src/components/auth/UserRegistrationForm.tsx` — incluir os campos no `updateUser`

#### 5. Restrição de acesso para Direção/Coordenação
**Arquivo:** `src/components/dashboard/DashboardSidebar.tsx`
- Itens de professor (`professorItems`) devem aparecer para `professor`, `coordenador`, `direcao` (já funciona via `canCreateExercises`)
- Itens de admin (`adminItems`) devem aparecer APENAS para `admin` (verificar se `canManageSystem()` está sendo usado corretamente)
- Verificar se `direcao` e `coordenador` veem menus que não deveriam acessar

**Arquivo:** `src/App.tsx` — verificar se as rotas `/admin/*` usam `AdminRoute` com `requiredRole` adequado; direção/coordenação NÃO devem acessar o painel admin completo

#### 6. Imagem do exercício não aparece
**Arquivo:** `src/components/exercises/ExerciseRegistrationForm.tsx`
- O bucket no Supabase se chama `Exercise Images` (com espaço)
- O código referencia `exercise-images` (com hífen)
- Trocar todas as referências de `'exercise-images'` para `'Exercise Images'`

#### 7. Exercícios ordenados por dificuldade crescente
**Arquivo:** `src/hooks/useExercises.ts`
- A query atual ordena apenas por `ordem`
- Adicionar ordenação pela `nivel_dificuldade` da subcategoria: `.order('ordem')` não resolve sozinho pois `nivel_dificuldade` está na tabela relacionada
- Solução: ordenar no frontend após fetch — `sort` por `subcategoria.nivel_dificuldade` ascendente, depois por `ordem`

---

### Arquivos modificados

| Arquivo | Itens |
|---------|-------|
| `src/components/Footer.tsx` | #1 |
| `src/hooks/useEscolaForm.ts` | #2 |
| `src/components/admin/escola-form/BasicInfoSection.tsx` | #2 |
| `src/hooks/useUserRegistration.ts` | #3, #4 |
| `src/components/auth/UserRegistrationForm.tsx` | #4 |
| `src/components/dashboard/DashboardSidebar.tsx` | #5 |
| `src/components/exercises/ExerciseRegistrationForm.tsx` | #6 |
| `src/hooks/useExercises.ts` | #7 |
| Migration SQL | #4 (adicionar colunas) |

### Migration SQL (item 4)
```sql
ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS nome_responsavel2 text,
  ADD COLUMN IF NOT EXISTS email_responsavel2 text;
```

### Critérios de Sucesso
- Logo no footer com fundo amarelo
- CEP auto-preenche endereço, estado e cidade no cadastro de escolas
- Data de nascimento salva corretamente
- 2º responsável salva e carrega na edição
- Direção/Coordenação não veem menu admin
- Imagem do exercício aparece no preview e após salvar
- Lista de exercícios ordenada por dificuldade crescente

