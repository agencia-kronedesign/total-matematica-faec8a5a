import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SafeMathEvaluator } from '@/utils/safeMathEvaluator';

interface ActivityExercise {
  id: string;
  ordem: number;
  formula: string;
  margem_erro: number;
  imagem_url: string | null;
  categoria: string;
  subcategoria: string;
  nivel_dificuldade: number | null;
  ativo: boolean;
  formulaValida: boolean;
}

export function useActivityExercises(atividadeId?: string) {
  return useQuery({
    queryKey: ['activity-exercises', atividadeId],
    queryFn: async () => {
      if (!atividadeId) {
        console.log('[useActivityExercises] Nenhum atividadeId fornecido');
        return [];
      }

      console.log('[useActivityExercises] Buscando exercícios para atividade:', atividadeId);

      const { data, error } = await supabase
        .from('atividade_exercicios')
        .select(`
          exercicio_id,
          exercicios!inner(
            id,
            ordem,
            formula,
            margem_erro,
            imagem_url,
            ativo,
            subcategorias!inner(
              nome,
              nivel_dificuldade,
              categorias!inner(
                nome
              )
            )
          )
        `)
        .eq('atividade_id', atividadeId);

      if (error) {
        console.error('[useActivityExercises] Erro ao buscar exercícios:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }

      console.log('[useActivityExercises] Exercícios encontrados (total):', data?.length || 0);

      // Log detalhado dos exercícios
      if (data && data.length > 0) {
        const exerciciosAtivos = data.filter(item => item.exercicios.ativo === true);
        const exerciciosInativos = data.filter(item => item.exercicios.ativo === false);
        
        console.log('[useActivityExercises] Exercícios ativos:', exerciciosAtivos.length);
        console.log('[useActivityExercises] Exercícios inativos:', exerciciosInativos.length);
        
        if (exerciciosInativos.length > 0) {
          console.warn('[useActivityExercises] ATENÇÃO: Existem exercícios inativos vinculados a esta atividade:', 
            exerciciosInativos.map(e => e.exercicios.id)
          );
        }
      } else {
        console.warn('[useActivityExercises] Nenhum exercício vinculado a esta atividade');
      }

      // Filtrar apenas exercícios ativos e ordenar por ordem no JavaScript
      const result = data
        .filter(item => item.exercicios.ativo === true)
        .map(item => {
          const formula = item.exercicios.formula || '';
          const formulaValida = SafeMathEvaluator.isValidFormula(formula);
          
          if (!formulaValida) {
            console.warn('[useActivityExercises] Exercício com fórmula inválida:', {
              id: item.exercicios.id,
              formula: formula
            });
          }
          
          return {
            id: item.exercicios.id,
            ordem: item.exercicios.ordem,
            formula: formula,
            margem_erro: item.exercicios.margem_erro,
            imagem_url: item.exercicios.imagem_url,
            categoria: item.exercicios.subcategorias.categorias.nome,
            subcategoria: item.exercicios.subcategorias.nome,
            nivel_dificuldade: item.exercicios.subcategorias.nivel_dificuldade,
            ativo: item.exercicios.ativo,
            formulaValida: formulaValida
          };
        })
        .sort((a, b) => {
          const diffA = a.nivel_dificuldade ?? 999;
          const diffB = b.nivel_dificuldade ?? 999;
          if (diffA !== diffB) return diffA - diffB;
          return (a.ordem || 0) - (b.ordem || 0);
        }) as ActivityExercise[];

      console.log('[useActivityExercises] Exercícios retornados:', result.length);
      
      // Log de resumo de fórmulas
      const formulasInvalidas = result.filter(e => !e.formulaValida);
      if (formulasInvalidas.length > 0) {
        console.warn('[useActivityExercises] ATENÇÃO: Existem', formulasInvalidas.length, 'exercício(s) com fórmulas inválidas');
      }
      
      return result;
    },
    enabled: !!atividadeId
  });
}

export function useStudentResponses(exerciseId?: string) {
  return useQuery({
    queryKey: ['student-responses', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('respostas')
        .select('*')
        .eq('exercicio_id', exerciseId)
        .eq('aluno_id', user.id)
        .order('data_envio', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!exerciseId
  });
}