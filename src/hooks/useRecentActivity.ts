import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecentActivity {
  id: string;
  tipo_atividade: string;
  descricao: string;
  data_atividade: string;
  usuario?: {
    nome: string;
    email: string;
  };
}

interface UseRecentActivityReturn {
  activities: RecentActivity[];
  loading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
}

export function useRecentActivity(limit: number = 10): UseRecentActivityReturn {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('atividades_sistema')
        .select(`
          id,
          tipo_atividade,
          descricao,
          data_atividade,
          usuarios:usuario_id (
            nome,
            email
          )
        `)
        .order('data_atividade', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      const formattedActivities: RecentActivity[] = (data || []).map(item => ({
        id: item.id,
        tipo_atividade: item.tipo_atividade,
        descricao: item.descricao,
        data_atividade: item.data_atividade,
        usuario: item.usuarios ? {
          nome: item.usuarios.nome,
          email: item.usuarios.email
        } : undefined
      }));

      setActivities(formattedActivities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao carregar atividades recentes",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshActivities = async () => {
    await fetchActivities();
  };

  // Função para registrar nova atividade
  const logActivity = async (
    tipoAtividade: string,
    descricao: string,
    usuarioId?: string,
    dadosExtra?: any
  ) => {
    try {
      const { error } = await supabase
        .from('atividades_sistema')
        .insert({
          usuario_id: usuarioId,
          tipo_atividade: tipoAtividade,
          descricao: descricao,
          dados_extra: dadosExtra
        });

      if (error) {
        console.error('Erro ao registrar atividade:', error);
      } else {
        // Atualiza a lista após registrar nova atividade
        await fetchActivities();
      }
    } catch (err) {
      console.error('Erro ao registrar atividade:', err);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Atualiza a cada 60 segundos
    const interval = setInterval(fetchActivities, 60000);

    return () => clearInterval(interval);
  }, [limit]);

  return {
    activities,
    loading,
    error,
    refreshActivities
  };
}