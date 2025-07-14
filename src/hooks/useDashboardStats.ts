import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsuarios: number;
  totalEscolas: number;
  totalExercicios: number;
  totalAtividades: number;
  usuariosAtivosMes: number;
  exerciciosResolvidosMes: number;
  dataAtualizacao: string;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro, atualiza as métricas
      const { error: updateError } = await supabase.rpc('atualizar_metricas_dashboard');
      
      if (updateError) {
        console.error('Erro ao atualizar métricas:', updateError);
      }

      // Busca as métricas mais recentes
      const { data, error: fetchError } = await supabase
        .from('dashboard_metricas')
        .select('*')
        .order('data_atualizacao', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setStats({
          totalUsuarios: data.total_usuarios,
          totalEscolas: data.total_escolas,
          totalExercicios: data.total_exercicios,
          totalAtividades: data.total_atividades,
          usuariosAtivosMes: data.usuarios_ativos_mes,
          exerciciosResolvidosMes: data.exercicios_resolvidos_mes,
          dataAtualizacao: data.data_atualizacao
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao carregar estatísticas",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  useEffect(() => {
    fetchStats();

    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats
  };
}