import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useActivityType(atividadeId?: string) {
  return useQuery({
    queryKey: ['activity-type', atividadeId],
    queryFn: async () => {
      if (!atividadeId) return null;
      
      const { data, error } = await supabase
        .from('atividades')
        .select('tipo')
        .eq('id', atividadeId)
        .single();
      
      if (error) throw error;
      return data?.tipo as 'casa' | 'aula' | null;
    },
    enabled: !!atividadeId
  });
}
