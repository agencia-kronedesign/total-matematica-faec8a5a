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
  
  // Nomenclatura dos PDFs:
  // RESPOSTA = valor correto calculado pela fórmula
  // RESULTADO = valor que o aluno digitou
  const RESPOSTA = valorEsperado;
  const RESULTADO = valorAluno;
  
  let acertoNivel: AcertoNivel;
  
  // Condição 1: Verifica se está 100% correto
  if (RESULTADO === RESPOSTA) {
    console.log('[evaluateExercise] Condição 1 satisfeita: 100% correto');
    acertoNivel = 'correto';
  } else {
    // Cálculos para as condições 2-5 (baseados no RESULTADO conforme PDFs)
    const diferencaResposta = Math.abs(RESPOSTA - RESULTADO);
    
    // Condição 2: Margem inferior
    // |RESPOSTA - RESULTADO| <= |RESULTADO - (RESULTADO * (1 - MARGEM/100))|
    const condicao2_direita = Math.abs(RESULTADO - (RESULTADO * (1 - margem / 100)));
    
    // Condição 3: Margem superior
    // |RESPOSTA - RESULTADO| <= |RESULTADO * (1 + MARGEM/100) - RESULTADO|
    const condicao3_direita = Math.abs(RESULTADO * (1 + margem / 100) - RESULTADO);
    
    // Condições 4 e 5: Faixa de "meio certo" (±10%)
    const diferencaAbsolutos = Math.abs(Math.abs(RESPOSTA) - Math.abs(RESULTADO));
    const condicao4_direita1 = Math.abs(RESULTADO - RESULTADO * 1.1);
    const condicao5_direita1 = Math.abs(RESULTADO * 1.1 - RESULTADO);
    
    console.log('[evaluateExercise] Valores calculados:', { 
      RESPOSTA, 
      RESULTADO, 
      margem,
      diferencaResposta,
      condicao2_direita,
      condicao3_direita,
      diferencaAbsolutos,
      condicao4_direita1,
      condicao5_direita1
    });
    
    // Condição 2: Verifica margem inferior
    if (diferencaResposta <= condicao2_direita) {
      console.log('[evaluateExercise] Condição 2 satisfeita: margem inferior');
      acertoNivel = 'correto_com_margem';
    }
    // Condição 3: Verifica margem superior
    else if (diferencaResposta <= condicao3_direita) {
      console.log('[evaluateExercise] Condição 3 satisfeita: margem superior');
      acertoNivel = 'correto_com_margem';
    }
    // Condição 4: Verifica "meio certo" inferior
    // ||RESPOSTA| - |RESULTADO|| <= |RESULTADO - RESULTADO * 1.1| E
    // |RESPOSTA - RESULTADO| >= |RESULTADO - RESULTADO * (1 - MARGEM/100)|
    else if (diferencaAbsolutos <= condicao4_direita1 && diferencaResposta >= condicao2_direita) {
      console.log('[evaluateExercise] Condição 4 satisfeita: meio certo inferior');
      acertoNivel = 'meio_certo';
    }
    // Condição 5: Verifica "meio certo" superior
    // ||RESPOSTA| - |RESULTADO|| <= |RESULTADO * 1.1 - RESULTADO| E
    // |RESPOSTA - RESULTADO| >= |RESULTADO * (1 + MARGEM/100) - RESULTADO|
    else if (diferencaAbsolutos <= condicao5_direita1 && diferencaResposta >= condicao3_direita) {
      console.log('[evaluateExercise] Condição 5 satisfeita: meio certo superior');
      acertoNivel = 'meio_certo';
    }
    // Caso contrário: erro
    else {
      console.log('[evaluateExercise] Nenhuma condição satisfeita: incorreto');
      acertoNivel = 'incorreto';
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
