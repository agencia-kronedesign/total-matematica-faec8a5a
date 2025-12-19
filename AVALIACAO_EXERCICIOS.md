# Módulo de Avaliação de Exercícios

## Descrição

Este módulo centraliza toda a lógica de correção de exercícios matemáticos, portada do sistema PHP original para TypeScript moderno e seguro.

## Localização

- **Módulo de Domínio**: `src/domain/exercises/evaluateExercise.ts`
- **Barrel Export**: `src/domain/exercises/index.ts`

## Arquitetura

```
src/domain/exercises/
├── evaluateExercise.ts   # Função pura de avaliação + helpers
└── index.ts              # Exportações públicas do módulo
```

## Tipos Exportados

### `AcertoNivel`
```typescript
type AcertoNivel = 'correto' | 'correto_com_margem' | 'meio_certo' | 'incorreto';
```

### `EvaluationInput`
```typescript
interface EvaluationInput {
  formula: string;        // Fórmula com variável 'n' (ex: "2*n + 5")
  margem: number;         // Margem de erro percentual
  n: number;              // Valor do número da chamada
  respostaAluno: string;  // Resposta digitada pelo aluno
}
```

### `EvaluationResult`
```typescript
interface EvaluationResult {
  acertoNivel: AcertoNivel;
  valorEsperado: number;
  valorAluno: number;
  mensagem: string;
  correto: boolean;       // true para 'correto' e 'correto_com_margem'
}
```

## Funções Exportadas

### `evaluateExercise(input: EvaluationInput): EvaluationResult`

Função pura que avalia a resposta do aluno.

**Regras de Avaliação (Portadas do PHP):**

1. **CORRETO (100%)**: `valorAluno === valorEsperado`
   - Mensagem: "PARABÉNS! 100% CORRETO!"

2. **CORRETO_COM_MARGEM**: Diferença dentro de ±margem%
   - Mensagem: "PARABÉNS! VOCÊ ACERTOU!"

3. **MEIO_CERTO**: Fora da margem mas dentro de 10% de tolerância
   - Mensagem: "Pode-se dizer que está 'MEIO CERTO'! Não desista, continue tentando!"

4. **INCORRETO**: Caso contrário
   - Mensagem: "NÃO FOI DESSA VEZ! Continue tentando, VOCÊ CONSEGUE!"

### `getResultClassName(acertoNivel: AcertoNivel): string`

Retorna classes CSS para estilização do resultado.

### `getToastType(acertoNivel: AcertoNivel): 'success' | 'warning' | 'error'`

Retorna o tipo de toast para feedback visual.

## Uso

```typescript
import { evaluateExercise, getToastType } from '@/domain/exercises';

const result = evaluateExercise({
  formula: '2*n + 5',
  margem: 5,
  n: 10,
  respostaAluno: '25'
});

console.log(result.mensagem);     // "PARABÉNS! 100% CORRETO!"
console.log(result.correto);      // true
console.log(result.acertoNivel);  // 'correto'
```

## Segurança

- **Sem `eval()`**: Usa `SafeMathEvaluator` para avaliação segura de fórmulas
- **Validação de Fórmula**: Verifica se a fórmula é válida antes de avaliar
- **Normalização de Entrada**: Trata vírgulas, espaços e valores inválidos

## Logging

O módulo inclui logs automáticos para debugging:

```
[evaluateExercise] Entrada: { formula, margem, n, respostaAluno }
[evaluateExercise] Saída: { acertoNivel, valorEsperado, valorAluno, mensagem, correto }
```

## Componentes Integrados

- `ExerciseResolver.tsx`: Usa o módulo para modo PRATICAR e ATIVIDADES
- `useExerciseSubmission.ts`: Recebe `acertoNivel` diretamente do resultado

## Compatibilidade

- Compatível com o enum `acerto_nivel_type` do banco de dados Supabase
- Resultados idênticos à lógica original do PHP
