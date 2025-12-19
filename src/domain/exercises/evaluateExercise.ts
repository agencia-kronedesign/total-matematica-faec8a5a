import { SafeMathEvaluator } from '@/utils/safeMathEvaluator';

/**
 * Tipos para os níveis de acerto (compatível com o enum do banco de dados)
 */
export type AcertoNivel = 'correto' | 'correto_com_margem' | 'meio_certo' | 'incorreto';

/**
 * Interface de entrada para avaliação de exercício
 */
export interface EvaluationInput {
  formula: string;        // Fórmula com variável 'n' (ex: "2*n + 5")
  margem: number;         // Margem de erro percentual
  n: number;              // Valor do número da chamada
  respostaAluno: string;  // Resposta digitada pelo aluno
}

/**
 * Interface de resultado da avaliação
 */
export interface EvaluationResult {
  acertoNivel: AcertoNivel;
  valorEsperado: number;
  valorAluno: number;
  mensagem: string;
  correto: boolean;       // true para ACERTO_TOTAL e ACERTO_MARGEM
}

/**
 * Mensagens de feedback para cada nível de acerto
 */
const MENSAGENS = {
  correto: 'PARABÉNS! 100% CORRETO!',
  correto_com_margem: 'PARABÉNS! VOCÊ ACERTOU!',
  meio_certo: 'Pode-se dizer que está "MEIO CERTO"! Não desista, continue tentando!',
  incorreto: 'NÃO FOI DESSA VEZ! Continue tentando, VOCÊ CONSEGUE!'
} as const;

/**
 * Normaliza a resposta do aluno:
 * - Substitui vírgula por ponto
 * - Remove espaços
 * - Converte para número
 */
function normalizarResposta(resposta: string): number {
  const normalizada = resposta
    .trim()
    .replace(',', '.')
    .replace(/\s/g, '');
  
  const valor = parseFloat(normalizada);
  
  if (isNaN(valor)) {
    throw new Error('Resposta inválida: não é um número válido');
  }
  
  return valor;
}

/**
 * Função pura que avalia a resposta do aluno para um exercício.
 * 
 * Implementa a lógica original do PHP:
 * - ACERTO_TOTAL: valorAluno === valorEsperado
 * - ACERTO_MARGEM: Diferença dentro de ±margem%
 * - MEIO_CERTO: Fora da margem mas dentro de 10% de tolerância
 * - ERROU: Caso contrário
 * 
 * @param input - Dados de entrada para avaliação
 * @returns Resultado da avaliação com nível de acerto, valores e mensagem
 */
export function evaluateExercise(input: EvaluationInput): EvaluationResult {
  const { formula, margem, n, respostaAluno } = input;
  
  console.log('[evaluateExercise] Entrada:', { formula, margem, n, respostaAluno });
  
  // Validar fórmula
  if (!SafeMathEvaluator.isValidFormula(formula)) {
    throw new Error('Fórmula inválida ou insegura');
  }
  
  // Calcular valor esperado usando o avaliador seguro
  const valorEsperado = SafeMathEvaluator.evaluate(formula, n);
  
  // Normalizar resposta do aluno (vírgula → ponto, converter para número)
  const valorAluno = normalizarResposta(respostaAluno);
  
  let acertoNivel: AcertoNivel;
  
  // 1. Caso 100% correto (igualdade exata)
  if (valorAluno === valorEsperado) {
    acertoNivel = 'correto';
  } else {
    // 2. Cálculo das faixas de margem percentual
    const margemRelativa = margem / 100;
    const lowerMargin = valorEsperado * (1 - margemRelativa);
    const upperMargin = valorEsperado * (1 + margemRelativa);
    
    console.log('[evaluateExercise] Faixas:', { 
      valorEsperado, 
      valorAluno, 
      margem,
      lowerMargin, 
      upperMargin 
    });
    
    // 3. Verifica se está correto dentro da margem
    if (valorAluno >= lowerMargin && valorAluno <= upperMargin) {
      acertoNivel = 'correto_com_margem';
    } else {
      // 4. Cálculo da faixa de "meio certo" (±10% do resultado)
      const halfRelativa = 0.10;
      const lowerHalf = valorEsperado * (1 - halfRelativa);
      const upperHalf = valorEsperado * (1 + halfRelativa);
      
      // Meio certo: dentro de ±10%, MAS fora da margem de erro
      const isWithinHalfRange = valorAluno >= lowerHalf && valorAluno <= upperHalf;
      const isOutsideMarginRange = valorAluno < lowerMargin || valorAluno > upperMargin;
      
      console.log('[evaluateExercise] Meio certo check:', { 
        lowerHalf, 
        upperHalf, 
        isWithinHalfRange, 
        isOutsideMarginRange 
      });
      
      if (isWithinHalfRange && isOutsideMarginRange) {
        acertoNivel = 'meio_certo';
      } else {
        // 5. Caso contrário, está incorreto
        acertoNivel = 'incorreto';
      }
    }
  }
  
  const resultado: EvaluationResult = {
    acertoNivel,
    valorEsperado,
    valorAluno,
    mensagem: MENSAGENS[acertoNivel],
    correto: acertoNivel === 'correto' || acertoNivel === 'correto_com_margem'
  };
  
  console.log('[evaluateExercise] Saída:', resultado);
  
  return resultado;
}

/**
 * Função auxiliar para obter a classe CSS baseada no nível de acerto
 */
export function getResultClassName(acertoNivel: AcertoNivel): string {
  switch (acertoNivel) {
    case 'correto':
    case 'correto_com_margem':
      return 'bg-green-100 text-green-800';
    case 'meio_certo':
      return 'bg-yellow-100 text-yellow-800';
    case 'incorreto':
      return 'bg-red-100 text-red-800';
  }
}

/**
 * Função auxiliar para obter o tipo de toast baseado no nível de acerto
 */
export function getToastType(acertoNivel: AcertoNivel): 'success' | 'warning' | 'error' {
  switch (acertoNivel) {
    case 'correto':
    case 'correto_com_margem':
      return 'success';
    case 'meio_certo':
      return 'warning';
    case 'incorreto':
      return 'error';
  }
}
