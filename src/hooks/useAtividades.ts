import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: 'casa' | 'aula';
  status: string | null;
  data_envio: string;
  data_limite: string | null;
  professor_id: string | null;
  turma_id: string | null;
  created_at: string;
  updated_at: string;
  professor?: {
    id: string;
    nome: string;
    email: string;
  };
  turma?: {
    id: string;
    nome: string;
    ano_letivo: number;
  };
  exercicios?: Array<{
    id: string;
    exercicio: {
      id: string;
      formula: string;
      imagem_url: string | null;
      subcategoria: {
        nome: string;
        categoria: {
          nome: string;
        };
      } | null;
    };
  }>;
}

export interface AtividadeFormData {
  titulo: string;
  descricao?: string;
  tipo: 'casa' | 'aula';
  turma_id: string;
  data_limite?: string;
  exercicios_ids: string[];
}

export const useAtividades = (turmaId?: string) => {
  return useQuery({
    queryKey: ['atividades', turmaId],
    queryFn: async () => {
      let query = supabase
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
        .order('created_at', { ascending: false });

      if (turmaId) {
        query = query.eq('turma_id', turmaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Atividade[];
    }
  });
};

export const useAtividade = (id: string) => {
  return useQuery({
    queryKey: ['atividade', id],
    queryFn: async () => {
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
              ordem,
              subcategoria:subcategorias(
                nome,
                nivel_dificuldade,
                categoria:categorias(nome)
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Atividade;
    },
    enabled: !!id
  });
};

export const useCreateAtividade = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AtividadeFormData) => {
      // 1. Criar a atividade
      const { data: atividade, error: atividadeError } = await supabase
        .from('atividades')
        .insert({
          titulo: data.titulo,
          descricao: data.descricao,
          tipo: data.tipo,
          turma_id: data.turma_id,
          data_limite: data.data_limite || null,
          professor_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'ativa'
        })
        .select()
        .single();

      if (atividadeError) throw atividadeError;

      // 2. Associar exercícios
      if (data.exercicios_ids.length > 0) {
        const exerciciosData = data.exercicios_ids.map(exercicioId => ({
          atividade_id: atividade.id,
          exercicio_id: exercicioId
        }));

        const { error: exerciciosError } = await supabase
          .from('atividade_exercicios')
          .insert(exerciciosData);

        if (exerciciosError) throw exerciciosError;
      }

      return atividade;
    },
    onSuccess: () => {
      toast({
        title: "Atividade criada",
        description: "A atividade foi criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['atividades'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar atividade",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateAtividade = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AtividadeFormData> }) => {
      // 1. Atualizar a atividade
      const { data: atividade, error: atividadeError } = await supabase
        .from('atividades')
        .update({
          titulo: data.titulo,
          descricao: data.descricao,
          tipo: data.tipo,
          turma_id: data.turma_id,
          data_limite: data.data_limite || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (atividadeError) throw atividadeError;

      // 2. Atualizar exercícios se fornecidos
      if (data.exercicios_ids) {
        // Remover exercícios existentes
        await supabase
          .from('atividade_exercicios')
          .delete()
          .eq('atividade_id', id);

        // Adicionar novos exercícios
        if (data.exercicios_ids.length > 0) {
          const exerciciosData = data.exercicios_ids.map(exercicioId => ({
            atividade_id: id,
            exercicio_id: exercicioId
          }));

          const { error: exerciciosError } = await supabase
            .from('atividade_exercicios')
            .insert(exerciciosData);

          if (exerciciosError) throw exerciciosError;
        }
      }

      return atividade;
    },
    onSuccess: () => {
      toast({
        title: "Atividade atualizada",
        description: "A atividade foi atualizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['atividades'] });
      queryClient.invalidateQueries({ queryKey: ['atividade'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar atividade",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteAtividade = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('atividades')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Atividade excluída",
        description: "A atividade foi excluída com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['atividades'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir atividade",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useTurmas = () => {
  return useQuery({
    queryKey: ['turmas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .eq('status', true)
        .order('nome');

      if (error) throw error;
      return data;
    }
  });
};