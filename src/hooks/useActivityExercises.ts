import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActivityExercise {
  id: string;
  ordem: number;
  formula: string;
  margem_erro: number;
  imagem_url: string | null;
  categoria: string;
  subcategoria: string;
  ativo: boolean;
}

export function useActivityExercises(atividadeId?: string) {
  return useQuery({
    queryKey: ['activity-exercises', atividadeId],
    queryFn: async () => {
      if (!atividadeId) return [];

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
              categorias!inner(
                nome
              )
            )
          )
        `)
        .eq('atividade_id', atividadeId)
        .eq('exercicios.ativo', true)
        .order('exercicios.ordem');

      if (error) {
        throw error;
      }

      return data.map(item => ({
        id: item.exercicios.id,
        ordem: item.exercicios.ordem,
        formula: item.exercicios.formula,
        margem_erro: item.exercicios.margem_erro,
        imagem_url: item.exercicios.imagem_url,
        categoria: item.exercicios.subcategorias.categorias.nome,
        subcategoria: item.exercicios.subcategorias.nome,
        ativo: item.exercicios.ativo
      })) as ActivityExercise[];
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