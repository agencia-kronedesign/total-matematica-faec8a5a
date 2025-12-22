import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AtividadeStats {
  alunosParticipantes: number;
  respostasEnviadas: number;
  taxaAcerto: number;
}

export const useAtividadeStats = (atividadeId: string | undefined) => {
  return useQuery({
    queryKey: ['atividade-stats', atividadeId],
    queryFn: async (): Promise<AtividadeStats> => {
      if (!atividadeId) throw new Error('ID da atividade não informado');
      
      console.log('[useAtividadeStats] Buscando estatísticas para atividade:', atividadeId);
      
      // Buscar respostas da atividade
      const { data: respostas, error } = await supabase
        .from('respostas')
        .select('aluno_id, acerto_nivel')
        .eq('atividade_id', atividadeId);
        
      if (error) {
        console.error('[useAtividadeStats] Erro ao buscar respostas:', error);
        throw error;
      }
      
      console.log('[useAtividadeStats] Respostas encontradas:', respostas?.length || 0, respostas);
      
      const totalRespostas = respostas?.length || 0;
      const alunosUnicos = new Set(respostas?.map(r => r.aluno_id).filter(Boolean)).size;
      const acertos = respostas?.filter(r => 
        r.acerto_nivel === 'correto' || r.acerto_nivel === 'correto_com_margem'
      ).length || 0;
      
      const stats = {
        alunosParticipantes: alunosUnicos,
        respostasEnviadas: totalRespostas,
        taxaAcerto: totalRespostas > 0 ? Math.round((acertos / totalRespostas) * 100) : 0
      };
      
      console.log('[useAtividadeStats] Estatísticas calculadas:', stats);
      
      return stats;
    },
    enabled: !!atividadeId
  });
};
