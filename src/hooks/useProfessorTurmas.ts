import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProfessorTurmaInfo {
  id: string;
  nome: string;
  ano_letivo: number;
  turno: string | null;
  nivel_ensino: string | null;
  status: boolean;
  totalAlunos: number;
}

interface UseProfessorTurmasResult {
  isLoading: boolean;
  error: Error | null;
  turmas: ProfessorTurmaInfo[];
  refetch: () => void;
}

export const useProfessorTurmas = (): UseProfessorTurmasResult => {
  const { user } = useAuth();

  const { data: turmas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['professor-turmas', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('[ProfessorTurmas] Sem usuário logado');
        return [];
      }

      console.log('[ProfessorTurmas] Professor ID:', user.id);

      // 1. Buscar atividades do professor para obter turma_ids únicos
      const { data: atividades, error: atividadesError } = await supabase
        .from('atividades')
        .select('turma_id')
        .eq('professor_id', user.id);

      if (atividadesError) {
        console.error('[ProfessorTurmas] Erro ao buscar atividades:', atividadesError);
        throw atividadesError;
      }

      // 2. Extrair IDs únicos de turmas
      const turmaIds = [...new Set(atividades?.map(a => a.turma_id).filter(Boolean))] as string[];

      if (turmaIds.length === 0) {
        console.log('[ProfessorTurmas] Nenhuma turma encontrada para o professor');
        return [];
      }

      // 3. Buscar dados das turmas
      const { data: turmasData, error: turmasError } = await supabase
        .from('turmas')
        .select('id, nome, ano_letivo, turno, nivel_ensino, status')
        .in('id', turmaIds)
        .order('ano_letivo', { ascending: false })
        .order('nome', { ascending: true });

      if (turmasError) {
        console.error('[ProfessorTurmas] Erro ao buscar turmas:', turmasError);
        throw turmasError;
      }

      // 4. Para cada turma, contar alunos ativos
      const turmasComAlunos: ProfessorTurmaInfo[] = await Promise.all(
        (turmasData || []).map(async (turma) => {
          const { count, error: countError } = await supabase
            .from('matriculas')
            .select('*', { count: 'exact', head: true })
            .eq('turma_id', turma.id)
            .eq('status', 'ativo');

          if (countError) {
            console.error('[ProfessorTurmas] Erro ao contar alunos:', countError);
          }

          return {
            id: turma.id,
            nome: turma.nome,
            ano_letivo: turma.ano_letivo,
            turno: turma.turno,
            nivel_ensino: turma.nivel_ensino,
            status: turma.status ?? true,
            totalAlunos: count ?? 0,
          };
        })
      );

      console.log('[ProfessorTurmas] Turmas encontradas:', turmasComAlunos.length);
      return turmasComAlunos;
    },
    enabled: !!user?.id,
  });

  return {
    isLoading,
    error: error as Error | null,
    turmas,
    refetch,
  };
};

// Hook para buscar alunos de uma turma específica
export interface AlunoTurma {
  alunoId: string;
  nome: string;
  numeroChamada: number | null;
  status: string;
}

interface UseAlunosTurmaResult {
  isLoading: boolean;
  error: Error | null;
  alunos: AlunoTurma[];
}

export const useAlunosTurma = (turmaId: string | null): UseAlunosTurmaResult => {
  const { data: alunos = [], isLoading, error } = useQuery({
    queryKey: ['alunos-turma', turmaId],
    queryFn: async () => {
      if (!turmaId) {
        return [];
      }

      console.log('[ProfessorTurmas] Buscando alunos da turma:', turmaId);

      // Buscar matrículas ativas com join em usuarios
      const { data: matriculas, error: matriculasError } = await supabase
        .from('matriculas')
        .select(`
          usuario_id,
          numero_chamada,
          status,
          usuarios!inner(nome)
        `)
        .eq('turma_id', turmaId)
        .eq('status', 'ativo')
        .order('numero_chamada', { ascending: true });

      if (matriculasError) {
        console.error('[ProfessorTurmas] Erro ao buscar alunos:', matriculasError);
        throw matriculasError;
      }

      const alunosFormatados: AlunoTurma[] = (matriculas || []).map((m: any) => ({
        alunoId: m.usuario_id,
        nome: m.usuarios?.nome || 'Nome não disponível',
        numeroChamada: m.numero_chamada,
        status: m.status,
      }));

      console.log('[ProfessorTurmas] Alunos encontrados:', alunosFormatados.length);
      return alunosFormatados;
    },
    enabled: !!turmaId,
  });

  return {
    isLoading,
    error: error as Error | null,
    alunos,
  };
};
