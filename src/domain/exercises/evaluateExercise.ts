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
  
  // 1. Verifica se está 100% correto
  if (valorEsperado === valorAluno) {
    acertoNivel = 'correto';
  }
  // 2. Verifica se está correto com margem (inferior)
  else {
    const marginLowerBound = Math.abs(valorEsperado - (valorEsperado * (1 - (margem / 100))));
    const marginUpperBound = Math.abs(valorEsperado * (1 + (margem / 100)) - valorEsperado);
    const diferencaAbsoluta = Math.abs(valorAluno - valorEsperado);
    
    if (diferencaAbsoluta <= marginLowerBound || diferencaAbsoluta <= marginUpperBound) {
      // Está dentro da margem de erro permitida
      acertoNivel = 'correto_com_margem';
    }
    // 3. Verifica se está "meio certo" (dentro de 10% de tolerância)
    else {
      const halfRightBound = Math.abs(valorEsperado * 0.1); // 10% de tolerância
      const marginCheck = Math.max(marginLowerBound, marginUpperBound);
      const diferencaAbsolutaValores = Math.abs(Math.abs(valorAluno) - Math.abs(valorEsperado));
      
      if (diferencaAbsolutaValores <= Math.abs(valorEsperado * 1.1 - valorEsperado) && 
          diferencaAbsoluta >= marginCheck) {
        acertoNivel = 'meio_certo';
      }
      // 4. Caso contrário, está incorreto
      else {
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
