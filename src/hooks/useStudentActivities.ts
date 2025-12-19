import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StudentActivity {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: 'casa' | 'aula';
  data_envio: string;
  data_limite: string | null;
  status: string | null;
  professor_nome: string;
  exercicios_count: number;
  exercicios_resolvidos: number;
  percentual_conclusao: number;
}

export function useStudentActivities() {
  return useQuery({
    queryKey: ['student-activities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar matrícula do aluno
      const { data: matricula, error: matriculaError } = await supabase
        .from('matriculas')
        .select('turma_id')
        .eq('usuario_id', user.id)
        .eq('status', 'ativo')
        .single();

      if (matriculaError) {
        throw new Error('Aluno não está matriculado em nenhuma turma');
      }

      // Buscar atividades da turma com filtro de data
      const { data: atividades, error: atividadesError } = await supabase
        .from('atividades')
        .select(`
          id,
          titulo,
          descricao,
          tipo,
          data_envio,
          data_limite,
          status,
          usuarios!professor_id(nome)
        `)
        .eq('turma_id', matricula.turma_id)
        .eq('status', 'ativa')
        .or(`data_limite.is.null,data_limite.gt.${new Date().toISOString()}`)
        .order('data_envio', { ascending: false });

      if (atividadesError) {
        throw atividadesError;
      }

      // Para cada atividade, buscar o progresso do aluno
      const atividadesComProgresso = await Promise.all(
        atividades.map(async (atividade) => {
          // Contar total de exercícios da atividade
          const { count: totalExercicios } = await supabase
            .from('atividade_exercicios')
            .select('*', { count: 'exact', head: true })
            .eq('atividade_id', atividade.id);

          // Contar exercícios resolvidos pelo aluno
          const { count: exerciciosResolvidos } = await supabase
            .from('respostas')
            .select('exercicio_id', { count: 'exact', head: true })
            .eq('atividade_id', atividade.id)
            .eq('aluno_id', user.id);

          const total = totalExercicios || 0;
          const resolvidos = exerciciosResolvidos || 0;
          const percentual = total > 0 ? Math.round((resolvidos / total) * 100) : 0;

          return {
            id: atividade.id,
            titulo: atividade.titulo,
            descricao: atividade.descricao,
            tipo: atividade.tipo,
            data_envio: atividade.data_envio,
            data_limite: atividade.data_limite,
            status: atividade.status,
            professor_nome: atividade.usuarios?.nome || 'Professor',
            exercicios_count: total,
            exercicios_resolvidos: resolvidos,
            percentual_conclusao: percentual
          } as StudentActivity;
        })
      );

      return atividadesComProgresso;
    }
  });
}