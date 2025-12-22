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
        .maybeSingle();

      if (matriculaError) {
        throw new Error('Erro ao buscar matrícula do aluno');
      }

      if (!matricula) {
        return [];
      }

      // Buscar todas as atividades ativas da turma
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
        .order('data_envio', { ascending: false });

      if (atividadesError) {
        throw atividadesError;
      }

      // Para cada atividade, buscar o progresso do aluno considerando apenas exercícios ATIVOS
      const atividadesComProgresso = await Promise.all(
        atividades.map(async (atividade) => {
          // Buscar exercícios ATIVOS da atividade (JOIN com tabela exercicios)
          const { data: exerciciosAtivos, error: exerciciosError } = await supabase
            .from('atividade_exercicios')
            .select(`
              exercicio_id,
              exercicios!inner(id, ativo)
            `)
            .eq('atividade_id', atividade.id)
            .eq('exercicios.ativo', true);

          if (exerciciosError) {
            // Erro silencioso - continua processando outras atividades
          }

          const totalExercicios = exerciciosAtivos?.length || 0;
          const idsExerciciosAtivos = exerciciosAtivos?.map(e => e.exercicio_id).filter(Boolean) || [];

          // Buscar respostas do aluno para esta atividade
          const { data: respostasData } = await supabase
            .from('respostas')
            .select('exercicio_id')
            .eq('atividade_id', atividade.id)
            .eq('aluno_id', user.id);

          // Contar apenas respostas para exercícios que ainda estão ATIVOS
          const exerciciosRespondidosAtivos = [...new Set(
            respostasData
              ?.map(r => r.exercicio_id)
              .filter(id => id && idsExerciciosAtivos.includes(id)) || []
          )];
          
          const resolvidos = exerciciosRespondidosAtivos.length;
          const percentual = totalExercicios > 0 ? Math.round((resolvidos / totalExercicios) * 100) : 0;

          return {
            id: atividade.id,
            titulo: atividade.titulo,
            descricao: atividade.descricao,
            tipo: atividade.tipo,
            data_envio: atividade.data_envio,
            data_limite: atividade.data_limite,
            status: atividade.status,
            professor_nome: atividade.usuarios?.nome || 'Professor',
            exercicios_count: totalExercicios,
            exercicios_resolvidos: resolvidos,
            percentual_conclusao: percentual
          } as StudentActivity;
        })
      );

      // Filtrar atividades que ainda têm exercícios ativos (oculta atividades "fantasmas")
      const atividadesValidas = atividadesComProgresso.filter(a => a.exercicios_count > 0);

      return atividadesValidas;
    }
  });
}
