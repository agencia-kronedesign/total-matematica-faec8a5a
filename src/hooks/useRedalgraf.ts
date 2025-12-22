import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PRIORIDADE_ACERTO } from './useActivityReport';

export interface RedalgrafAtividade {
  atividadeId: string;
  titulo: string;
  turmaId: string;
  turmaNome: string;
  anoLetivo: number;
  dataEnvio: string;
  tipoAtividade: 'casa' | 'aula';
  percentualAcertoAluno: number;   // 0-100
  percentualAcertoTurma: number;   // 0-100
  totalQuestoes: number;
  questoesRespondidas: number;
  questoesCorretas: number;
}

export interface AlunoRedalgrafInfo {
  id: string;
  nome: string;
  turmaAtual: { id: string; nome: string; ano_letivo: number } | null;
}

export interface ResumoRedalgraf {
  totalAtividades: number;
  mediaGeralAluno: number;
  mediaGeralTurma: number;
}

export interface UseRedalgrafParams {
  alunoId: string;
  turmaId?: string;
  periodo?: '30dias' | 'bimestre' | 'ano';
}

export interface UseRedalgrafResult {
  isLoading: boolean;
  error: Error | null;
  aluno: AlunoRedalgrafInfo | null;
  atividades: RedalgrafAtividade[];
  resumo: ResumoRedalgraf;
}

// Calcular data de corte baseado no período
const calcularDataCorte = (periodo: '30dias' | 'bimestre' | 'ano'): Date => {
  const agora = new Date();
  switch (periodo) {
    case '30dias':
      return new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'bimestre':
      return new Date(agora.getTime() - 60 * 24 * 60 * 60 * 1000);
    case 'ano':
      return new Date(agora.getFullYear(), 0, 1);
    default:
      return new Date(agora.getFullYear(), 0, 1);
  }
};

export const useRedalgraf = ({
  alunoId,
  turmaId,
  periodo = 'ano',
}: UseRedalgrafParams): UseRedalgrafResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['redalgraf', alunoId, turmaId, periodo],
    queryFn: async () => {
      console.log('[REDALGRAF] fetch-start', { alunoId, turmaId, periodo });

      // 1. Buscar dados do aluno
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('id', alunoId)
        .maybeSingle();

      if (usuarioError) {
        console.error('[REDALGRAF] Erro ao buscar aluno:', usuarioError);
        throw usuarioError;
      }

      if (!usuarioData) {
        console.log('[REDALGRAF] Aluno não encontrado');
        return {
          aluno: null,
          atividades: [],
          resumo: { totalAtividades: 0, mediaGeralAluno: 0, mediaGeralTurma: 0 },
        };
      }

      // 2. Buscar matrículas do aluno
      const { data: matriculas, error: matriculasError } = await supabase
        .from('matriculas')
        .select(`
          id,
          turma_id,
          status,
          turma:turmas(id, nome, ano_letivo)
        `)
        .eq('usuario_id', alunoId)
        .eq('status', 'ativo');

      if (matriculasError) {
        console.error('[REDALGRAF] Erro ao buscar matrículas:', matriculasError);
        throw matriculasError;
      }

      let turmaAtual: { id: string; nome: string; ano_letivo: number } | null = null;
      const turmaIds: string[] = [];

      matriculas?.forEach(mat => {
        if (mat.turma_id) {
          turmaIds.push(mat.turma_id);
          if (!turmaAtual && mat.turma) {
            turmaAtual = mat.turma as { id: string; nome: string; ano_letivo: number };
          }
        }
      });

      const turmasFiltro = turmaId ? [turmaId] : turmaIds;

      if (turmasFiltro.length === 0) {
        console.log('[REDALGRAF] Aluno sem matrículas ativas');
        return {
          aluno: { id: usuarioData.id, nome: usuarioData.nome, turmaAtual },
          atividades: [],
          resumo: { totalAtividades: 0, mediaGeralAluno: 0, mediaGeralTurma: 0 },
        };
      }

      // 3. Buscar atividades das turmas com filtro de data
      const dataCorte = calcularDataCorte(periodo);

      const { data: atividades, error: atividadesError } = await supabase
        .from('atividades')
        .select(`
          id,
          titulo,
          tipo,
          data_envio,
          turma_id,
          turma:turmas(id, nome, ano_letivo)
        `)
        .in('turma_id', turmasFiltro)
        .gte('data_envio', dataCorte.toISOString())
        .order('data_envio', { ascending: true });

      if (atividadesError) {
        console.error('[REDALGRAF] Erro ao buscar atividades:', atividadesError);
        throw atividadesError;
      }

      if (!atividades || atividades.length === 0) {
        console.log('[REDALGRAF] Nenhuma atividade encontrada no período');
        return {
          aluno: { id: usuarioData.id, nome: usuarioData.nome, turmaAtual },
          atividades: [],
          resumo: { totalAtividades: 0, mediaGeralAluno: 0, mediaGeralTurma: 0 },
        };
      }

      const atividadeIds = atividades.map(a => a.id);

      // 4. Buscar exercícios de todas as atividades
      const { data: exerciciosData, error: exerciciosError } = await supabase
        .from('atividade_exercicios')
        .select('atividade_id, exercicio_id')
        .in('atividade_id', atividadeIds);

      if (exerciciosError) {
        console.error('[REDALGRAF] Erro ao buscar exercícios:', exerciciosError);
        throw exerciciosError;
      }

      // Contar exercícios por atividade
      const exerciciosPorAtividade = new Map<string, number>();
      exerciciosData?.forEach(ex => {
        if (ex.atividade_id) {
          const count = exerciciosPorAtividade.get(ex.atividade_id) || 0;
          exerciciosPorAtividade.set(ex.atividade_id, count + 1);
        }
      });

      // 5. Buscar respostas do aluno
      const { data: respostasAluno, error: respostasAlunoError } = await supabase
        .from('respostas')
        .select(`
          id,
          atividade_id,
          exercicio_id,
          acerto_nivel
        `)
        .eq('aluno_id', alunoId)
        .in('atividade_id', atividadeIds);

      if (respostasAlunoError) {
        console.error('[REDALGRAF] Erro ao buscar respostas do aluno:', respostasAlunoError);
        throw respostasAlunoError;
      }

      // 6. Buscar respostas de todos da turma para calcular média
      const { data: respostasTurma, error: respostasTurmaError } = await supabase
        .from('respostas')
        .select(`
          id,
          atividade_id,
          exercicio_id,
          aluno_id,
          acerto_nivel
        `)
        .in('atividade_id', atividadeIds);

      if (respostasTurmaError) {
        console.error('[REDALGRAF] Erro ao buscar respostas da turma:', respostasTurmaError);
        throw respostasTurmaError;
      }

      // 7. Buscar matrículas de cada turma para saber total de alunos
      const matriculasPorTurma = new Map<string, Set<string>>();
      for (const turmaIdItem of turmasFiltro) {
        const { data: mats } = await supabase
          .from('matriculas')
          .select('usuario_id')
          .eq('turma_id', turmaIdItem)
          .eq('status', 'ativo');
        
        if (mats) {
          matriculasPorTurma.set(turmaIdItem, new Set(mats.map(m => m.usuario_id)));
        }
      }

      // ---------- Processar dados por atividade ----------

      // Agrupar respostas do aluno por atividade e exercício
      const respostasAlunoPorAtividade = new Map<string, Map<string, { acertoNivel: string | null }[]>>();
      respostasAluno?.forEach(r => {
        if (!r.atividade_id || !r.exercicio_id) return;
        
        if (!respostasAlunoPorAtividade.has(r.atividade_id)) {
          respostasAlunoPorAtividade.set(r.atividade_id, new Map());
        }
        
        const exercicioMap = respostasAlunoPorAtividade.get(r.atividade_id)!;
        if (!exercicioMap.has(r.exercicio_id)) {
          exercicioMap.set(r.exercicio_id, []);
        }
        exercicioMap.get(r.exercicio_id)!.push({ acertoNivel: r.acerto_nivel });
      });

      // Agrupar respostas da turma por atividade
      const respostasTurmaPorAtividade = new Map<string, { alunoId: string; exercicioId: string; acertoNivel: string | null }[]>();
      respostasTurma?.forEach(r => {
        if (!r.atividade_id || !r.aluno_id) return;
        
        if (!respostasTurmaPorAtividade.has(r.atividade_id)) {
          respostasTurmaPorAtividade.set(r.atividade_id, []);
        }
        respostasTurmaPorAtividade.get(r.atividade_id)!.push({
          alunoId: r.aluno_id,
          exercicioId: r.exercicio_id || '',
          acertoNivel: r.acerto_nivel,
        });
      });

      const atividadesProcessadas: RedalgrafAtividade[] = [];

      for (const ativ of atividades) {
        const turmaData = ativ.turma as { id: string; nome: string; ano_letivo: number } | null;
        const totalQuestoes = exerciciosPorAtividade.get(ativ.id) || 0;
        
        if (totalQuestoes === 0) continue;

        const respostasAlunoAtiv = respostasAlunoPorAtividade.get(ativ.id);
        
        // Calcular acertos do aluno nessa atividade
        let questoesCorretas = 0;
        let questoesRespondidas = 0;

        if (respostasAlunoAtiv) {
          respostasAlunoAtiv.forEach((respostas, _) => {
            questoesRespondidas++;
            
            // Determinar melhor tentativa
            let melhorPrioridade = 0;
            let melhorAcerto: string | null = null;
            
            for (const r of respostas) {
              const prioridade = PRIORIDADE_ACERTO[r.acertoNivel || ''] || 0;
              if (prioridade > melhorPrioridade) {
                melhorPrioridade = prioridade;
                melhorAcerto = r.acertoNivel;
              }
            }
            
            if (melhorAcerto === 'correto' || melhorAcerto === 'correto_com_margem') {
              questoesCorretas++;
            }
          });
        }

        const percentualAcertoAluno = totalQuestoes > 0 
          ? (questoesCorretas / totalQuestoes) * 100 
          : 0;

        // Calcular média da turma nessa atividade
        const respostasTurmaAtiv = respostasTurmaPorAtividade.get(ativ.id) || [];
        const alunosDaTurma = matriculasPorTurma.get(ativ.turma_id || '') || new Set();
        const totalAlunosTurma = alunosDaTurma.size;

        // Agrupar por aluno -> exercício -> melhor resposta
        const acertosPorAlunoDaTurma = new Map<string, number>();
        const respostasPorAlunoExercicio = new Map<string, Map<string, { acertoNivel: string | null }[]>>();

        for (const r of respostasTurmaAtiv) {
          if (!alunosDaTurma.has(r.alunoId)) continue;
          
          if (!respostasPorAlunoExercicio.has(r.alunoId)) {
            respostasPorAlunoExercicio.set(r.alunoId, new Map());
          }
          
          const exMap = respostasPorAlunoExercicio.get(r.alunoId)!;
          if (!exMap.has(r.exercicioId)) {
            exMap.set(r.exercicioId, []);
          }
          exMap.get(r.exercicioId)!.push({ acertoNivel: r.acertoNivel });
        }

        // Calcular acertos de cada aluno da turma
        respostasPorAlunoExercicio.forEach((exMap, alunoIdItem) => {
          let acertos = 0;
          exMap.forEach((respostas, _) => {
            let melhorPrioridade = 0;
            let melhorAcerto: string | null = null;
            
            for (const r of respostas) {
              const prioridade = PRIORIDADE_ACERTO[r.acertoNivel || ''] || 0;
              if (prioridade > melhorPrioridade) {
                melhorPrioridade = prioridade;
                melhorAcerto = r.acertoNivel;
              }
            }
            
            if (melhorAcerto === 'correto' || melhorAcerto === 'correto_com_margem') {
              acertos++;
            }
          });
          
          const percentual = totalQuestoes > 0 ? (acertos / totalQuestoes) * 100 : 0;
          acertosPorAlunoDaTurma.set(alunoIdItem, percentual);
        });

        // Média da turma
        let somaPercentuais = 0;
        acertosPorAlunoDaTurma.forEach(p => {
          somaPercentuais += p;
        });
        
        const percentualAcertoTurma = totalAlunosTurma > 0 
          ? somaPercentuais / totalAlunosTurma 
          : 0;

        atividadesProcessadas.push({
          atividadeId: ativ.id,
          titulo: ativ.titulo,
          turmaId: ativ.turma_id || '',
          turmaNome: turmaData?.nome || 'Turma desconhecida',
          anoLetivo: turmaData?.ano_letivo || new Date().getFullYear(),
          dataEnvio: ativ.data_envio,
          tipoAtividade: ativ.tipo as 'casa' | 'aula',
          percentualAcertoAluno: Math.round(percentualAcertoAluno * 10) / 10,
          percentualAcertoTurma: Math.round(percentualAcertoTurma * 10) / 10,
          totalQuestoes,
          questoesRespondidas,
          questoesCorretas,
        });
      }

      // Calcular médias gerais
      const totalAtividades = atividadesProcessadas.length;
      let somaAcertosAluno = 0;
      let somaAcertosTurma = 0;

      atividadesProcessadas.forEach(a => {
        somaAcertosAluno += a.percentualAcertoAluno;
        somaAcertosTurma += a.percentualAcertoTurma;
      });

      const mediaGeralAluno = totalAtividades > 0 ? somaAcertosAluno / totalAtividades : 0;
      const mediaGeralTurma = totalAtividades > 0 ? somaAcertosTurma / totalAtividades : 0;

      console.log('[REDALGRAF] fetch-success', {
        alunoId,
        totalAtividades,
        mediaGeralAluno: Math.round(mediaGeralAluno * 10) / 10,
        mediaGeralTurma: Math.round(mediaGeralTurma * 10) / 10,
      });

      return {
        aluno: { id: usuarioData.id, nome: usuarioData.nome, turmaAtual },
        atividades: atividadesProcessadas,
        resumo: {
          totalAtividades,
          mediaGeralAluno: Math.round(mediaGeralAluno * 10) / 10,
          mediaGeralTurma: Math.round(mediaGeralTurma * 10) / 10,
        },
      };
    },
    enabled: !!alunoId,
  });

  return {
    isLoading,
    error: error as Error | null,
    aluno: data?.aluno || null,
    atividades: data?.atividades || [],
    resumo: data?.resumo || { totalAtividades: 0, mediaGeralAluno: 0, mediaGeralTurma: 0 },
  };
};