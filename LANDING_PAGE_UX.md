# Documentação - UX da Landing Page

## Visão Geral

Este documento descreve a estrutura e funcionamento da landing page do Total Matemática, incluindo navegação, formulários e componentes.

## Estrutura de Arquivos

```
src/
├── pages/
│   └── Index.tsx                    # Página principal da landing
├── components/
│   ├── Header.tsx                   # Navegação principal com scroll suave
│   ├── Footer.tsx                   # Rodapé com formulário de contato
│   ├── Faq.tsx                      # Seção de perguntas frequentes
│   ├── BenefitCard.tsx              # Card de benefícios/método
│   ├── Testimonial.tsx              # Componente de depoimento
│   ├── VideoButton.tsx              # Botão para vídeos
│   ├── VideoModal.tsx               # Modal de vídeo YouTube
│   └── forms/
│       ├── ContactForm.tsx          # Formulário de contato reutilizável
│       └── LeadForm.tsx             # Formulário de videoconferência/lead
```

## Seções da Landing Page

### 1. Hero Section
- **Localização:** Topo da página
- **Conteúdo:** Banner principal com título "Matemática Criativa"
- **CTAs:** 
  - "Método" → Scroll suave para `#metodo`
  - "Na prática" → Scroll suave para `#na-pratica`

### 2. Benefícios/Método (`id="metodo"`)
- **Localização:** Após o hero
- **Conteúdo:** 4 cards com benefícios do método
  - Sequência Didática
  - Aprendizado Cooperativo
  - Exercícios Diários
  - Vídeo Aulas

### 3. Depoimentos (`id="na-pratica"`)
- **Localização:** Após benefícios
- **Conteúdo:** Depoimento de usuário
- **CTAs:**
  - "Quero ver na minha escola" → Scroll para `#lead-form`
  - "Faça você mesmo!" → Link para `/signup`

### 4. Formulário de Lead (`id="lead-form"`)
- **Localização:** Seção amarela
- **Componente:** `LeadForm.tsx`
- **Campos:**
  - Nome (obrigatório)
  - Email (obrigatório)
  - Escola ou Rede (opcional)
  - Termos de uso (checkbox obrigatório)

### 5. FAQ (`id="faq"`)
- **Localização:** Após formulário de lead
- **Componente:** `Faq.tsx`
- **Conteúdo:** Perguntas frequentes em accordion

### 6. Contato (`id="contato"`)
- **Localização:** Seção azul
- **Componente:** `ContactForm.tsx` com `origin="meio"`
- **Campos:**
  - Nome (obrigatório, min 2 caracteres)
  - Email (obrigatório, formato válido)
  - Mensagem (obrigatória, min 10 / max 4000 caracteres)
  - Verificação anti-robô (checkbox obrigatório)

### 7. Footer
- **Componente:** `Footer.tsx`
- **Conteúdo:** Logo, links rápidos, formulário de contato
- **Formulário:** `ContactForm.tsx` com `origin="footer"`

## Componentes de Formulário

### ContactForm

```typescript
interface ContactFormProps {
  origin: 'meio' | 'footer' | 'generic';
  title?: string;
  className?: string;
}
```

**Estados:**
- `idle` - Formulário pronto para preenchimento
- `submitting` - Enviando (botão desabilitado, spinner)
- `success` - Enviado com sucesso (campos limpos, toast)
- `error` - Erro no envio (toast de erro)

**Validação (Zod):**
- `nome`: mínimo 2 caracteres
- `email`: formato de email válido
- `mensagem`: mínimo 10, máximo 4000 caracteres
- `antiRobo`: checkbox deve estar marcado

**Logs:**
```javascript
console.log('[ContactForm]', 'submit', { origin, nome, email });
console.log('[ContactForm]', 'success');
console.log('[ContactForm]', 'error', error);
```

### LeadForm

**Campos:**
- `nome`: obrigatório, mínimo 2 caracteres
- `email`: obrigatório, formato válido
- `escolaOuRede`: opcional
- `termos`: checkbox obrigatório

**Logs:**
```javascript
console.log('[LeadForm]', 'submit', { nome, email, escolaOuRede });
console.log('[LeadForm]', 'success');
console.log('[LeadForm]', 'error', error);
```

## Navegação

### Header
- **HOME:** Link para `/`
- **QUEM SOMOS:** Link para `/quem-somos`
- **FAQ:** Scroll suave para `#faq` (ou navega para `/` + scroll)
- **CONTATO:** Scroll suave para `#contato`
- **FAÇA UM TESTE:** Link para `/cadastrar`
- **Entrar/Cadastrar:** Via `UserMenu` component

### Scroll Suave

Função utilitária usada em Header e Index:

```typescript
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  console.log('[Component]', 'scroll-to', id);
};
```

## TODO - Integrações Futuras

- [ ] Integrar `ContactForm` com Supabase (tabela `contatos` ou edge function)
- [ ] Integrar `LeadForm` com Supabase (tabela `leads`)
- [ ] Implementar reCAPTCHA real no lugar do checkbox simples
- [ ] Adicionar página `/quem-somos` com conteúdo institucional
- [ ] Implementar envio de email de confirmação para leads

## Responsividade

- **Mobile (< 768px):**
  - Menu hambúrguer no header
  - Cards em coluna única
  - Formulários em largura total
  
- **Desktop (≥ 768px):**
  - Menu horizontal completo
  - Cards em grid 4 colunas
  - Formulários com largura máxima

## Padrão de Logs

Todos os logs seguem o padrão: `[Componente] ação detalhes`

Exemplos:
- `[Header] scroll-to faq`
- `[Landing/Hero] cta-click { action: 'metodo' }`
- `[ContactForm] submit { origin: 'meio', nome, email }`
- `[LeadForm] success`
