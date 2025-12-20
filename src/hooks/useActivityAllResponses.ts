import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useActivityAllResponses(atividadeId?: string) {
  return useQuery({
    queryKey: ['activity-all-responses', atividadeId],
    queryFn: async () => {
      if (!atividadeId) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('respostas')
        .select('exercicio_id')
        .eq('atividade_id', atividadeId)
        .eq('aluno_id', user.id);

      if (error) throw error;
      
      // Retornar IDs únicos dos exercícios respondidos
      const uniqueExerciseIds = [...new Set(data.map(r => r.exercicio_id).filter(Boolean))];
      return uniqueExerciseIds as string[];
    },
    enabled: !!atividadeId
  });
}
