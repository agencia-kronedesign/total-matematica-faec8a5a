import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PRIORIDADE_ACERTO, mapAcertoNivelToStatus, StatusGeral } from './useActivityReport';

// Tipos específicos do REDIN
export type StatusAluno = 'CORRETO' | 'CORRETO_MARGEM' | 'MEIO_CERTO' | 'INCORRETO' | 'NAO_RESPONDEU';
export type StatusGeralAtividade = 'NAO_RESPONDEU' | 'EM_ANDAMENTO' | 'CONCLUIDA';
export type ComparativoTurma = 'ACIMA' | 'NA_MEDIA' | 'ABAIXO';

export interface RedinQuestao {
  exercicioId: string;
  ordem: number;
  formula: string | null;
  statusAluno: StatusAluno;
  tentativasAluno: number;
  respostaDigitada: string | null;
  // Estatísticas da turma nessa questão
  totalAlunosTurma: number;
  alunosResponderam: number;
  alunosAcertaram: number;
  percentualAcertoTurma: number;       // 0–100
  percentualNaoRespondeuTurma: number; // 0–100
}

export interface RedinResumo {
  totalQuestoes: number;
  corretas: number;
  meioCertas: number;              // CORRETO_MARGEM + MEIO_CERTO
  incorretas: number;
  naoRespondeu: number;
  percentualAcertoAluno: number;   // 0–100
  percentualAcertoTurma: number;   // média geral
  comparativoTurma: ComparativoTurma;
}

export interface RedinCabecalho {
  alunoId: string;
  alunoNome: string;
  numeroChamada: number | null;
  turmaId: string;
  turmaNome: string;
  anoLetivo: number;
  atividadeId: string;
  atividadeTitulo: string;
  tipoAtividade: 'casa' | 'aula';
  dataEnvio: string;
  dataLimite: string | null;
  statusGeralAluno: StatusGeralAtividade;
}

export interface RedinReport {
  cabecalho: RedinCabecalho;
  resumo: RedinResumo;
  questoes: RedinQuestao[];
}

// Mapear StatusGeral (do useActivityReport) para StatusAluno (do REDIN)
const mapStatusGeralToStatusAluno = (status: StatusGeral): StatusAluno => {
  switch (status) {
    case 'CORRETO':
      return 'CORRETO';
    case 'ACERTO_MARGEM':
      return 'CORRETO_MARGEM';
    case 'MEIO_CERTO':
      return 'MEIO_CERTO';
    case 'ERRO':
      return 'INCORRETO';
    case 'NAO_RESPONDEU':
    default:
      return 'NAO_RESPONDEU';
  }
};

// Determinar melhor tentativa e retornar detalhes completos
interface RespostaDetalhe {
  acertoNivel: string | null;
  respostaDigitada: string | null;
}

const determinarMelhorTentativaComDetalhes = (
  respostas: RespostaDetalhe[]
): { status: StatusAluno; respostaDigitada: string | null } => {
  if (!respostas || respostas.length === 0) {
    return { status: 'NAO_RESPONDEU', respostaDigitada: null };
  }

  let melhorResposta: RespostaDetalhe | null = null;
  let melhorPrioridade = 0;

  for (const resp of respostas) {
    const prioridade = PRIORIDADE_ACERTO[resp.acertoNivel || ''] || 0;
    if (prioridade > melhorPrioridade) {
      melhorPrioridade = prioridade;
      melhorResposta = resp;
    }
  }

  if (!melhorResposta) {
    return { status: 'NAO_RESPONDEU', respostaDigitada: null };
  }

  const statusGeral = mapAcertoNivelToStatus(melhorResposta.acertoNivel);
  const statusAluno = mapStatusGeralToStatusAluno(statusGeral);

  return {
    status: statusAluno,
    respostaDigitada: melhorResposta.respostaDigitada,
  };
};

export interface UseRedinParams {
  atividadeId: string;
  alunoId: string;
}

export const useRedinReport = ({ atividadeId, alunoId }: UseRedinParams) => {
  return useQuery({
    queryKey: ['redin-report', atividadeId, alunoId],
    queryFn: async (): Promise<RedinReport> => {
      console.log('[REDIN] fetch-start', { atividadeId, alunoId });

      // 1. Buscar dados da atividade com turma
      const { data: atividade, error: atividadeError } = await supabase
        .from('atividades')
        .select(`
          id,
          titulo,
          tipo,
          data_envio,
          data_limite,
          turma_id,
          turma:turmas(id, nome, ano_letivo)
        `)
        .eq('id', atividadeId)
        .maybeSingle();

      if (atividadeError) {
        console.error('[REDIN] fetch-error', atividadeError);
        throw new Error('Erro ao carregar dados da atividade.');
      }

      if (!atividade || !atividade.turma_id) {
        throw new Error('Atividade não encontrada ou sem turma vinculada.');
      }

      const turmaId = atividade.turma_id;
      const turmaData = atividade.turma as { id: string; nome: string; ano_letivo: number } | null;

      // 2. Buscar dados da matrícula do aluno nessa turma
      const { data: matricula, error: matriculaError } = await supabase
        .from('matriculas')
        .select(`
          usuario_id,
          numero_chamada,
          usuario:usuarios(id, nome)
        `)
        .eq('turma_id', turmaId)
        .eq('usuario_id', alunoId)
        .eq('status', 'ativo')
        .maybeSingle();

      if (matriculaError) {
        console.error('[REDIN] fetch-error', matriculaError);
        throw new Error('Erro ao carregar matrícula do aluno.');
      }

      const usuarioData = matricula?.usuario as { id: string; nome: string } | null;
      const alunoNome = usuarioData?.nome || 'Aluno não identificado';
      const numeroChamada = matricula?.numero_chamada || null;

      // 3. Buscar exercícios da atividade (ordenados)
      const { data: atividadeExercicios, error: exerciciosError } = await supabase
        .from('atividade_exercicios')
        .select(`
          id,
          exercicio_id,
          exercicio:exercicios(id, formula)
        `)
        .eq('atividade_id', atividadeId)
        .order('created_at', { ascending: true });

      if (exerciciosError) {
        console.error('[REDIN] fetch-error', exerciciosError);
        throw new Error('Não foi possível carregar os exercícios da atividade.');
      }

      // 4. Respostas do aluno nessa atividade
      const { data: respostasAluno, error: respostasAlunoError } = await supabase
        .from('respostas')
        .select(`
          id,
          exercicio_id,
          resposta_digitada,
          acerto_nivel,
          data_envio
        `)
        .eq('atividade_id', atividadeId)
        .eq('aluno_id', alunoId);

      if (respostasAlunoError) {
        console.error('[REDIN] fetch-error', respostasAlunoError);
        throw new Error('Erro ao carregar respostas do aluno.');
      }

      // 5. Respostas de TODOS os alunos da turma nessa atividade
      const { data: respostasTurma, error: respostasTurmaError } = await supabase
        .from('respostas')
        .select(`
          id,
          exercicio_id,
          aluno_id,
          acerto_nivel
        `)
        .eq('atividade_id', atividadeId);

      if (respostasTurmaError) {
        console.error('[REDIN] fetch-error', respostasTurmaError);
        throw new Error('Erro ao carregar respostas da turma.');
      }

      // 6. Total de alunos matriculados na turma
      const { data: matriculasTurma, error: matriculasTurmaError } = await supabase
        .from('matriculas')
        .select('usuario_id')
        .eq('turma_id', turmaId)
        .eq('status', 'ativo');

      if (matriculasTurmaError) {
        console.error('[REDIN] fetch-error', matriculasTurmaError);
        throw new Error('Não foi possível carregar os alunos da turma.');
      }

      const totalAlunosTurma = matriculasTurma?.length || 0;
      const alunosDaTurma = new Set(matriculasTurma?.map(m => m.usuario_id));

      // Filtrar respostas apenas de alunos da turma
      const respostasTurmaFiltradas = respostasTurma?.filter(r => 
        r.aluno_id && alunosDaTurma.has(r.aluno_id)
      ) || [];

      // ---------- Lógica por questão ----------
      const questoes: RedinQuestao[] = [];
      let corretas = 0;
      let meioCertas = 0;
      let incorretas = 0;
      let naoRespondeu = 0;

      // Map auxiliar: exercício -> respostas do aluno
      const respostasAlunoPorExercicio = new Map<string, typeof respostasAluno>();
      respostasAluno?.forEach(r => {
        if (!r.exercicio_id) return;
        const arr = respostasAlunoPorExercicio.get(r.exercicio_id) || [];
        arr.push(r);
        respostasAlunoPorExercicio.set(r.exercicio_id, arr);
      });

      // Map auxiliar: exercício -> respostas da turma
      const respostasTurmaPorExercicio = new Map<string, typeof respostasTurmaFiltradas>();
      respostasTurmaFiltradas.forEach(r => {
        if (!r.exercicio_id) return;
        const arr = respostasTurmaPorExercicio.get(r.exercicio_id) || [];
        arr.push(r);
        respostasTurmaPorExercicio.set(r.exercicio_id, arr);
      });

      // Processar cada exercício
      atividadeExercicios?.forEach((ae, index) => {
        const exercicioId = ae.exercicio_id;
        if (!exercicioId) return;

        const exercicio = ae.exercicio as { id: string; formula: string | null } | null;
        const formula = exercicio?.formula || null;

        const respostasAlunoEx = respostasAlunoPorExercicio.get(exercicioId) || [];
        const respostasTurmaEx = respostasTurmaPorExercicio.get(exercicioId) || [];

        // Melhor tentativa do aluno
        const { status: statusAluno, respostaDigitada } = determinarMelhorTentativaComDetalhes(
          respostasAlunoEx.map(r => ({
            acertoNivel: r.acerto_nivel,
            respostaDigitada: r.resposta_digitada,
          }))
        );
        const tentativasAluno = respostasAlunoEx.length;

        // Estatísticas da turma nessa questão
        // Para cada aluno da turma, determinar sua melhor tentativa nesse exercício
        const respostasPorAlunoDaTurma = new Map<string, { acertoNivel: string | null }[]>();
        respostasTurmaEx.forEach(r => {
          if (!r.aluno_id) return;
          const arr = respostasPorAlunoDaTurma.get(r.aluno_id) || [];
          arr.push({ acertoNivel: r.acerto_nivel });
          respostasPorAlunoDaTurma.set(r.aluno_id, arr);
        });

        const alunosQueResponderam = respostasPorAlunoDaTurma.size;
        let alunosQueAcertaram = 0;

        respostasPorAlunoDaTurma.forEach(respostas => {
          let melhorPrioridade = 0;
          let melhorAcerto: string | null = null;
          
          for (const r of respostas) {
            const prioridade = PRIORIDADE_ACERTO[r.acertoNivel || ''] || 0;
            if (prioridade > melhorPrioridade) {
              melhorPrioridade = prioridade;
              melhorAcerto = r.acertoNivel;
            }
          }
          
          // Considerar acerto: 'correto' ou 'correto_com_margem'
          if (melhorAcerto === 'correto' || melhorAcerto === 'correto_com_margem') {
            alunosQueAcertaram++;
          }
        });

        const percentualAcertoTurma = totalAlunosTurma > 0
          ? (alunosQueAcertaram / totalAlunosTurma) * 100
          : 0;

        const percentualNaoRespondeuTurma = totalAlunosTurma > 0
          ? ((totalAlunosTurma - alunosQueResponderam) / totalAlunosTurma) * 100
          : 0;

        // Contagens para resumo
        switch (statusAluno) {
          case 'CORRETO':
            corretas++;
            break;
          case 'CORRETO_MARGEM':
          case 'MEIO_CERTO':
            meioCertas++;
            break;
          case 'INCORRETO':
            incorretas++;
            break;
          case 'NAO_RESPONDEU':
            naoRespondeu++;
            break;
        }

        questoes.push({
          exercicioId,
          ordem: index + 1,
          formula,
          statusAluno,
          tentativasAluno,
          respostaDigitada,
          totalAlunosTurma,
          alunosResponderam: alunosQueResponderam,
          alunosAcertaram: alunosQueAcertaram,
          percentualAcertoTurma: Math.round(percentualAcertoTurma * 10) / 10,
          percentualNaoRespondeuTurma: Math.round(percentualNaoRespondeuTurma * 10) / 10,
        });
      });

      const totalQuestoes = questoes.length;
      const percentualAcertoAluno = totalQuestoes > 0
        ? (corretas / totalQuestoes) * 100
        : 0;

      // Média de acerto da turma (média dos percentuais por questão)
      const mediaPercentualAcertoTurma = questoes.length > 0
        ? questoes.reduce((acc, q) => acc + q.percentualAcertoTurma, 0) / questoes.length
        : 0;

      // Comparativo aluno x turma (regra: ±10pp)
      let comparativoTurma: ComparativoTurma = 'NA_MEDIA';
      if (percentualAcertoAluno >= mediaPercentualAcertoTurma + 10) {
        comparativoTurma = 'ACIMA';
      } else if (percentualAcertoAluno <= mediaPercentualAcertoTurma - 10) {
        comparativoTurma = 'ABAIXO';
      }

      // Status geral da atividade para o aluno
      let statusGeralAluno: StatusGeralAtividade = 'NAO_RESPONDEU';
      if (corretas + meioCertas + incorretas === 0) {
        statusGeralAluno = 'NAO_RESPONDEU';
      } else if (naoRespondeu > 0) {
        statusGeralAluno = 'EM_ANDAMENTO';
      } else {
        statusGeralAluno = 'CONCLUIDA';
      }

      const cabecalho: RedinCabecalho = {
        alunoId,
        alunoNome,
        numeroChamada,
        turmaId,
        turmaNome: turmaData?.nome || 'Turma não identificada',
        anoLetivo: turmaData?.ano_letivo || new Date().getFullYear(),
        atividadeId: atividade.id,
        atividadeTitulo: atividade.titulo,
        tipoAtividade: atividade.tipo,
        dataEnvio: atividade.data_envio,
        dataLimite: atividade.data_limite,
        statusGeralAluno,
      };

      const resumo: RedinResumo = {
        totalQuestoes,
        corretas,
        meioCertas,
        incorretas,
        naoRespondeu,
        percentualAcertoAluno: Math.round(percentualAcertoAluno * 10) / 10,
        percentualAcertoTurma: Math.round(mediaPercentualAcertoTurma * 10) / 10,
        comparativoTurma,
      };

      const report: RedinReport = {
        cabecalho,
        resumo,
        questoes,
      };

      console.log('[REDIN] fetch-success', {
        atividadeId,
        alunoId,
        totalQuestoes,
        percentualAcertoAluno: resumo.percentualAcertoAluno,
        percentualAcertoTurma: resumo.percentualAcertoTurma,
      });

      return report;
    },
    enabled: !!atividadeId && !!alunoId,
  });
};
