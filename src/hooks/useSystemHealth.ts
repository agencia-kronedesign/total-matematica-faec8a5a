import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  database: boolean;
  lastBackup: string | null;
  activeUsers: number;
  errorRate: number;
  responseTime: number;
  maintenanceMode: boolean;
  version: string;
}

interface UseSystemHealthReturn {
  health: SystemHealth | null;
  loading: boolean;
  error: string | null;
  refreshHealth: () => Promise<void>;
}

export function useSystemHealth(): UseSystemHealthReturn {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkDatabaseConnection = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('configuracoes_sistema')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  };

  const getActiveUsersCount = async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('logs_acesso')
        .select('usuario_id')
        .gte('data_login', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // últimos 15 minutos
        .eq('sucesso', true);

      if (error) return 0;
      
      // Contar usuários únicos
      const uniqueUsers = new Set(data?.map(log => log.usuario_id) || []);
      return uniqueUsers.size;
    } catch {
      return 0;
    }
  };

  const getSystemConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('chave, valor')
        .in('chave', ['sistema_manutencao', 'versao_sistema']);

      if (error) return { maintenanceMode: false, version: '1.0.0' };

      const configs = data?.reduce((acc, config) => {
        acc[config.chave] = config.valor;
        return acc;
      }, {} as Record<string, string>) || {};

      return {
        maintenanceMode: configs.sistema_manutencao === 'true',
        version: configs.versao_sistema || '1.0.0'
      };
    } catch {
      return { maintenanceMode: false, version: '1.0.0' };
    }
  };

  const calculateErrorRate = async (): Promise<number> => {
    try {
      const { data: totalLogs, error: totalError } = await supabase
        .from('logs_acesso')
        .select('id', { count: 'exact' })
        .gte('data_login', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // últimas 24h

      const { data: errorLogs, error: errorError } = await supabase
        .from('logs_acesso')
        .select('id', { count: 'exact' })
        .eq('sucesso', false)
        .gte('data_login', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (totalError || errorError) return 0;

      const total = totalLogs?.length || 0;
      const errors = errorLogs?.length || 0;

      return total > 0 ? (errors / total) * 100 : 0;
    } catch {
      return 0;
    }
  };

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      const startTime = Date.now();
      
      const [
        databaseStatus,
        activeUsers,
        systemConfigs,
        errorRate
      ] = await Promise.all([
        checkDatabaseConnection(),
        getActiveUsersCount(),
        getSystemConfigs(),
        calculateErrorRate()
      ]);

      const responseTime = Date.now() - startTime;

      // Determinar status geral do sistema
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (!databaseStatus || systemConfigs.maintenanceMode) {
        status = 'critical';
      } else if (errorRate > 10 || responseTime > 2000) {
        status = 'warning';
      }

      setHealth({
        status,
        database: databaseStatus,
        lastBackup: null, // TODO: implementar verificação de backup
        activeUsers,
        errorRate,
        responseTime,
        maintenanceMode: systemConfigs.maintenanceMode,
        version: systemConfigs.version
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao verificar saúde do sistema",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshHealth = async () => {
    await fetchHealth();
  };

  useEffect(() => {
    fetchHealth();

    // Atualiza a cada 2 minutos
    const interval = setInterval(fetchHealth, 120000);

    return () => clearInterval(interval);
  }, []);

  return {
    health,
    loading,
    error,
    refreshHealth
  };
}