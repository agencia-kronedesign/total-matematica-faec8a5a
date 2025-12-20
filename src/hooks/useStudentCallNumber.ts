import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStudentCallNumber() {
  return useQuery({
    queryKey: ['student-call-number'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('numero_chamada')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data?.numero_chamada;
    }
  });
}
