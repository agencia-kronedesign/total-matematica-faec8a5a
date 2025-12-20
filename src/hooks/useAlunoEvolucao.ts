import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// IMPORTANTE: Importar e reutilizar diretamente do useActivityReport.ts
// Não criar uma segunda versão paralela dessa lógica!
import {
  StatusGeral,
  RespostaDetalhe,
  PRIORIDADE_ACERTO,
  mapAcertoNivelToStatus,
  determinarMelhorTentativa,
} from './useActivityReport';

// Re-exportar para uso externo
export type { StatusGeral } from './useActivityReport';

export interface EvolucaoAtividade {
  atividadeId: string;
  titulo: string;
  turmaNome: string;
  turmaId: string;
  anoLetivo: number;
  dataCriacao: string;
  dataPrazo: string | null;
  melhorStatus: StatusGeral;
  totalExercicios: number;
  totalRespondidos: number;
}

export interface ResumoEvolucao {
  totalAtividades: number;
  concluidas: number;         // Pelo menos 1 resposta
  naoRespondidas: number;     // Zero respostas
  corretas: number;           // Status CORRETO
  acertoMargem: number;       // Status ACERTO_MARGEM
  meioCertas: number;         // Status MEIO_CERTO
  erros: number;              // Status ERRO
}

export interface AlunoInfo {
  id: string;
  nome: string;
  turmaAtual: { id: string; nome: string; ano_letivo: number } | null;
}

interface UseAlunoEvolucaoResult {
  isLoading: boolean;
  error: Error | null;
  aluno: AlunoInfo | null;
  atividades: EvolucaoAtividade[];
  resumo: ResumoEvolucao;
}

export const useAlunoEvolucao = (alunoId: string, turmaId?: string): UseAlunoEvolucaoResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['aluno-evolucao', alunoId, turmaId],
    queryFn: async () => {
      console.log('[AlunoEvolucao] alunoId:', alunoId, 'turmaId:', turmaId);

      // 1. Buscar dados do aluno
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('id', alunoId)
        .maybeSingle();

      if (usuarioError) {
        console.error('[AlunoEvolucao] Erro ao buscar aluno:', usuarioError);
        throw usuarioError;
      }

      if (!usuarioData) {
        console.log('[AlunoEvolucao] Aluno não encontrado');
        return {
          aluno: null,
          atividades: [],
          resumo: {
            totalAtividades: 0,
            concluidas: 0,
            naoRespondidas: 0,
            corretas: 0,
            acertoMargem: 0,
            meioCertas: 0,
            erros: 0,
          },
        };
      }

      // 2. Buscar matrículas do aluno para identificar turmas
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
        console.error('[AlunoEvolucao] Erro ao buscar matrículas:', matriculasError);
        throw matriculasError;
      }

      // Identificar turma atual (para exibição)
      let turmaAtual: { id: string; nome: string; ano_letivo: number } | null = null;
      const turmaIds: string[] = [];

      matriculas?.forEach(mat => {
        if (mat.turma_id) {
          turmaIds.push(mat.turma_id);
          if (!turmaAtual && mat.turma) {
            const turmaData = mat.turma as { id: string; nome: string; ano_letivo: number };
            turmaAtual = turmaData;
          }
        }
      });

      // Se turmaId foi passado como filtro, usamos apenas essa turma
      const turmasFiltro = turmaId ? [turmaId] : turmaIds;

      if (turmasFiltro.length === 0) {
        console.log('[AlunoEvolucao] Aluno sem matrículas ativas');
        return {
          aluno: { id: usuarioData.id, nome: usuarioData.nome, turmaAtual },
          atividades: [],
          resumo: {
            totalAtividades: 0,
            concluidas: 0,
            naoRespondidas: 0,
            corretas: 0,
            acertoMargem: 0,
            meioCertas: 0,
            erros: 0,
          },
        };
      }

      // 3. Buscar atividades das turmas
      const { data: atividades, error: atividadesError } = await supabase
        .from('atividades')
        .select(`
          id,
          titulo,
          data_envio,
          data_limite,
          turma_id,
          turma:turmas(id, nome, ano_letivo)
        `)
        .in('turma_id', turmasFiltro)
        .order('data_envio', { ascending: false });

      if (atividadesError) {
        console.error('[AlunoEvolucao] Erro ao buscar atividades:', atividadesError);
        throw atividadesError;
      }

      console.log('[AlunoEvolucao] Atividades encontradas:', atividades?.length || 0);

      if (!atividades || atividades.length === 0) {
        return {
          aluno: { id: usuarioData.id, nome: usuarioData.nome, turmaAtual },
          atividades: [],
          resumo: {
            totalAtividades: 0,
            concluidas: 0,
            naoRespondidas: 0,
            corretas: 0,
            acertoMargem: 0,
            meioCertas: 0,
            erros: 0,
          },
        };
      }

      const atividadeIds = atividades.map(a => a.id);

      // 4. Buscar exercícios de todas as atividades
      const { data: exerciciosData, error: exerciciosError } = await supabase
        .from('atividade_exercicios')
        .select('atividade_id, exercicio_id')
        .in('atividade_id', atividadeIds);

      if (exerciciosError) {
        console.error('[AlunoEvolucao] Erro ao buscar exercícios:', exerciciosError);
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

      // 5. Buscar todas as respostas do aluno para essas atividades
      const { data: respostas, error: respostasError } = await supabase
        .from('respostas')
        .select(`
          id,
          atividade_id,
          exercicio_id,
          resposta_digitada,
          acerto_nivel,
          data_envio
        `)
        .eq('aluno_id', alunoId)
        .in('atividade_id', atividadeIds);

      if (respostasError) {
        console.error('[AlunoEvolucao] Erro ao buscar respostas:', respostasError);
        throw respostasError;
      }

      // Agrupar respostas por atividade
      const respostasPorAtividade = new Map<string, RespostaDetalhe[]>();
      respostas?.forEach(resp => {
        if (!resp.atividade_id) return;

        const detalhe: RespostaDetalhe = {
          exercicioId: resp.exercicio_id || '',
          formula: null,
          respostaDigitada: resp.resposta_digitada,
          acertoNivel: resp.acerto_nivel,
          dataResposta: resp.data_envio,
        };

        const existing = respostasPorAtividade.get(resp.atividade_id) || [];
        existing.push(detalhe);
        respostasPorAtividade.set(resp.atividade_id, existing);
      });

      // 6. Montar lista de atividades com status
      const atividadesEvolucao: EvolucaoAtividade[] = atividades.map(ativ => {
        const turmaData = ativ.turma as { id: string; nome: string; ano_letivo: number } | null;
        const respostasAtividade = respostasPorAtividade.get(ativ.id) || [];
        const melhorStatus = determinarMelhorTentativa(respostasAtividade);

        return {
          atividadeId: ativ.id,
          titulo: ativ.titulo,
          turmaNome: turmaData?.nome || 'Turma desconhecida',
          turmaId: ativ.turma_id || '',
          anoLetivo: turmaData?.ano_letivo || new Date().getFullYear(),
          dataCriacao: ativ.data_envio,
          dataPrazo: ativ.data_limite,
          melhorStatus,
          totalExercicios: exerciciosPorAtividade.get(ativ.id) || 0,
          totalRespondidos: respostasAtividade.length,
        };
      });

      // 7. Calcular resumo
      let concluidas = 0;
      let naoRespondidas = 0;
      let corretas = 0;
      let acertoMargem = 0;
      let meioCertas = 0;
      let erros = 0;

      atividadesEvolucao.forEach(ativ => {
        if (ativ.totalRespondidos > 0) {
          concluidas++;
        } else {
          naoRespondidas++;
        }

        switch (ativ.melhorStatus) {
          case 'CORRETO':
            corretas++;
            break;
          case 'ACERTO_MARGEM':
            acertoMargem++;
            break;
          case 'MEIO_CERTO':
            meioCertas++;
            break;
          case 'ERRO':
            erros++;
            break;
        }
      });

      const resumo: ResumoEvolucao = {
        totalAtividades: atividadesEvolucao.length,
        concluidas,
        naoRespondidas,
        corretas,
        acertoMargem,
        meioCertas,
        erros,
      };

      console.log('[AlunoEvolucao] Resumo:', resumo);

      return {
        aluno: { id: usuarioData.id, nome: usuarioData.nome, turmaAtual },
        atividades: atividadesEvolucao,
        resumo,
      };
    },
    enabled: !!alunoId,
  });

  return {
    isLoading,
    error: error as Error | null,
    aluno: data?.aluno || null,
    atividades: data?.atividades || [],
    resumo: data?.resumo || {
      totalAtividades: 0,
      concluidas: 0,
      naoRespondidas: 0,
      corretas: 0,
      acertoMargem: 0,
      meioCertas: 0,
      erros: 0,
    },
  };
};
