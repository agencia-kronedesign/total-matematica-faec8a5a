import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Tipos para o relatório
export type StatusGeral = 'CORRETO' | 'ACERTO_MARGEM' | 'MEIO_CERTO' | 'ERRO' | 'NAO_RESPONDEU';

export interface RespostaDetalhe {
  exercicioId: string;
  formula: string | null;
  respostaDigitada: string | null;
  acertoNivel: string | null;
  dataResposta: string;
}

export interface RespostaPorAluno {
  alunoId: string;
  nomeAluno: string;
  numeroChamada: number | null;
  statusGeral: StatusGeral;
  respostas: RespostaDetalhe[];
}

export interface ResumoAtividade {
  totalAlunosNaTurma: number;
  totalAlunosQueResponderam: number;
  totalRespostas: number;
  porCategoriaResultado: {
    correto100: number;
    acertoMargem: number;
    meioCerto: number;
    erros: number;
  };
}

export interface AtividadeInfo {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: 'casa' | 'aula';
  status: string | null;
  data_envio: string;
  data_limite: string | null;
  turma: {
    id: string;
    nome: string;
    ano_letivo: number;
  } | null;
}

export interface ActivityReportData {
  atividade: AtividadeInfo | null;
  resumo: ResumoAtividade;
  respostasPorAluno: RespostaPorAluno[];
}

// Prioridade para determinar melhor tentativa
const PRIORIDADE_ACERTO: Record<string, number> = {
  'correto': 4,
  'correto_com_margem': 3,
  'meio_certo': 2,
  'incorreto': 1,
};

// Mapear acerto_nivel para StatusGeral
const mapAcertoNivelToStatus = (acertoNivel: string | null): StatusGeral => {
  switch (acertoNivel) {
    case 'correto':
      return 'CORRETO';
    case 'correto_com_margem':
      return 'ACERTO_MARGEM';
    case 'meio_certo':
      return 'MEIO_CERTO';
    case 'incorreto':
      return 'ERRO';
    default:
      return 'NAO_RESPONDEU';
  }
};

// Determinar melhor tentativa baseado na prioridade
const determinarMelhorTentativa = (respostas: RespostaDetalhe[]): StatusGeral => {
  if (!respostas || respostas.length === 0) {
    return 'NAO_RESPONDEU';
  }

  let melhorAcertoNivel: string | null = null;
  let melhorPrioridade = 0;

  for (const resp of respostas) {
    const prioridade = PRIORIDADE_ACERTO[resp.acertoNivel || ''] || 0;
    if (prioridade > melhorPrioridade) {
      melhorPrioridade = prioridade;
      melhorAcertoNivel = resp.acertoNivel;
    }
  }

  return mapAcertoNivelToStatus(melhorAcertoNivel);
};

export const useActivityReport = (atividadeId: string) => {
  return useQuery({
    queryKey: ['activity-report', atividadeId],
    queryFn: async (): Promise<ActivityReportData> => {
      console.log('[ActivityReport] Buscando dados para atividade:', atividadeId);

      // 1. Buscar dados da atividade com turma
      const { data: atividade, error: atividadeError } = await supabase
        .from('atividades')
        .select(`
          id,
          titulo,
          descricao,
          tipo,
          status,
          data_envio,
          data_limite,
          turma_id,
          turma:turmas(id, nome, ano_letivo)
        `)
        .eq('id', atividadeId)
        .maybeSingle();

      if (atividadeError) {
        console.error('[ActivityReport] Erro ao buscar atividade:', atividadeError);
        throw atividadeError;
      }

      if (!atividade) {
        console.log('[ActivityReport] Atividade não encontrada');
        return {
          atividade: null,
          resumo: {
            totalAlunosNaTurma: 0,
            totalAlunosQueResponderam: 0,
            totalRespostas: 0,
            porCategoriaResultado: { correto100: 0, acertoMargem: 0, meioCerto: 0, erros: 0 },
          },
          respostasPorAluno: [],
        };
      }

      const turmaId = atividade.turma_id;

      // 2. Buscar todos os alunos matriculados na turma
      const { data: matriculas, error: matriculasError } = await supabase
        .from('matriculas')
        .select(`
          usuario_id,
          numero_chamada,
          usuario:usuarios(id, nome)
        `)
        .eq('turma_id', turmaId)
        .eq('status', 'ativo');

      if (matriculasError) {
        console.error('[ActivityReport] Erro ao buscar matrículas:', matriculasError);
        throw matriculasError;
      }

      console.log('[ActivityReport] Matrículas encontradas:', matriculas?.length || 0);

      // 3. Buscar exercícios da atividade
      const { data: atividadeExercicios, error: exerciciosError } = await supabase
        .from('atividade_exercicios')
        .select(`
          exercicio_id,
          exercicio:exercicios(id, formula)
        `)
        .eq('atividade_id', atividadeId);

      if (exerciciosError) {
        console.error('[ActivityReport] Erro ao buscar exercícios:', exerciciosError);
        throw exerciciosError;
      }

      const exercicioIds = atividadeExercicios?.map(ae => ae.exercicio_id).filter(Boolean) || [];

      // 4. Buscar todas as respostas para os exercícios desta atividade
      const { data: respostas, error: respostasError } = await supabase
        .from('respostas')
        .select(`
          id,
          aluno_id,
          exercicio_id,
          resposta_digitada,
          acerto_nivel,
          data_envio
        `)
        .eq('atividade_id', atividadeId);

      if (respostasError) {
        console.error('[ActivityReport] Erro ao buscar respostas:', respostasError);
        throw respostasError;
      }

      console.log('[ActivityReport] Respostas encontradas:', respostas?.length || 0);

      // Criar mapa de exercícios por ID
      const exerciciosMap = new Map<string, string | null>();
      atividadeExercicios?.forEach(ae => {
        if (ae.exercicio_id && ae.exercicio) {
          const exercicio = ae.exercicio as { id: string; formula: string | null };
          exerciciosMap.set(ae.exercicio_id, exercicio.formula);
        }
      });

      // 5. Agrupar respostas por aluno
      const respostasPorAlunoMap = new Map<string, RespostaDetalhe[]>();
      
      respostas?.forEach(resp => {
        if (!resp.aluno_id) return;
        
        const detalhes: RespostaDetalhe = {
          exercicioId: resp.exercicio_id || '',
          formula: exerciciosMap.get(resp.exercicio_id || '') || null,
          respostaDigitada: resp.resposta_digitada,
          acertoNivel: resp.acerto_nivel,
          dataResposta: resp.data_envio,
        };

        const existing = respostasPorAlunoMap.get(resp.aluno_id) || [];
        existing.push(detalhes);
        respostasPorAlunoMap.set(resp.aluno_id, existing);
      });

      // 6. Montar lista de todos os alunos com suas respostas
      const respostasPorAluno: RespostaPorAluno[] = [];
      
      matriculas?.forEach(matricula => {
        if (!matricula.usuario_id) return;
        
        const usuario = matricula.usuario as { id: string; nome: string } | null;
        const respostasDoAluno = respostasPorAlunoMap.get(matricula.usuario_id) || [];
        const statusGeral = determinarMelhorTentativa(respostasDoAluno);

        respostasPorAluno.push({
          alunoId: matricula.usuario_id,
          nomeAluno: usuario?.nome || 'Aluno sem nome',
          numeroChamada: matricula.numero_chamada,
          statusGeral,
          respostas: respostasDoAluno,
        });
      });

      // Ordenar por numero_chamada (nulls por último)
      respostasPorAluno.sort((a, b) => {
        if (a.numeroChamada === null && b.numeroChamada === null) return 0;
        if (a.numeroChamada === null) return 1;
        if (b.numeroChamada === null) return -1;
        return a.numeroChamada - b.numeroChamada;
      });

      // 7. Calcular resumo
      const totalAlunosNaTurma = matriculas?.length || 0;
      const alunosQueResponderam = new Set(respostas?.map(r => r.aluno_id).filter(Boolean));
      const totalAlunosQueResponderam = alunosQueResponderam.size;
      const totalRespostas = respostas?.length || 0;

      // Contar por categoria (usando melhor tentativa de cada aluno)
      let correto100 = 0;
      let acertoMargem = 0;
      let meioCerto = 0;
      let erros = 0;

      respostasPorAluno.forEach(aluno => {
        switch (aluno.statusGeral) {
          case 'CORRETO':
            correto100++;
            break;
          case 'ACERTO_MARGEM':
            acertoMargem++;
            break;
          case 'MEIO_CERTO':
            meioCerto++;
            break;
          case 'ERRO':
            erros++;
            break;
        }
      });

      const resumo: ResumoAtividade = {
        totalAlunosNaTurma,
        totalAlunosQueResponderam,
        totalRespostas,
        porCategoriaResultado: {
          correto100,
          acertoMargem,
          meioCerto,
          erros,
        },
      };

      // Formatar dados da atividade
      const turmaData = atividade.turma as { id: string; nome: string; ano_letivo: number } | null;
      
      const atividadeFormatada: AtividadeInfo = {
        id: atividade.id,
        titulo: atividade.titulo,
        descricao: atividade.descricao,
        tipo: atividade.tipo,
        status: atividade.status,
        data_envio: atividade.data_envio,
        data_limite: atividade.data_limite,
        turma: turmaData,
      };

      console.log('[ActivityReport] Resumo:', resumo);
      console.log('[ActivityReport] Total alunos processados:', respostasPorAluno.length);

      return {
        atividade: atividadeFormatada,
        resumo,
        respostasPorAluno,
      };
    },
    enabled: !!atividadeId,
  });
};
