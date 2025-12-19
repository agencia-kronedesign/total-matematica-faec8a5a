import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Atividade } from './useAtividades';

export const useAtividadesProfessor = () => {
  return useQuery({
    queryKey: ['atividades-professor'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('[ProfessorAtividade] Buscando atividades do professor:', user.id);

      const { data, error } = await supabase
        .from('atividades')
        .select(`
          *,
          professor:usuarios!professor_id(id, nome, email),
          turma:turmas!turma_id(id, nome, ano_letivo),
          exercicios:atividade_exercicios(
            id,
            exercicio:exercicios(
              id,
              formula,
              imagem_url,
              subcategoria:subcategorias(
                nome,
                categoria:categorias(nome)
              )
            )
          )
        `)
        .eq('professor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('[ProfessorAtividade] Erro:', error);
        throw error;
      }

      console.log('[ProfessorAtividade] Atividades encontradas:', data?.length);
      return data as Atividade[];
    }
  });
};

export const useEstatisticasProfessor = () => {
  return useQuery({
    queryKey: ['estatisticas-professor'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: atividades, error } = await supabase
        .from('atividades')
        .select('id, tipo, status')
        .eq('professor_id', user.id);

      if (error) throw error;

      const total = atividades?.length || 0;
      const ativas = atividades?.filter(a => a.status === 'ativa').length || 0;
      const casa = atividades?.filter(a => a.tipo === 'casa').length || 0;
      const aula = atividades?.filter(a => a.tipo === 'aula').length || 0;

      console.log('[ProfessorAtividade] Estatísticas:', { total, ativas, casa, aula });

      return { total, ativas, casa, aula };
    }
  });
};
