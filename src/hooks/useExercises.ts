
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserResponse {
  id: string;
  acerto_nivel: 'correto' | 'correto_com_margem' | 'meio_certo' | 'incorreto' | null;
}

export interface Exercise {
  id: string;
  formula: string;
  margem_erro: number;
  ordem: number;
  imagem_url: string | null;
  ativo: boolean;
  exemplo_teste_publico: boolean;
  subcategoria: {
    id: string;
    nome: string;
    nivel_dificuldade: number;
    categoria: {
      id: string;
      nome: string;
    };
  } | null;
  userResponse: UserResponse | null;
}

export const useExercises = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('exercicios')
        .select(`
          *,
          exemplo_teste_publico,
          subcategoria:subcategorias(
            id,
            nome,
            nivel_dificuldade,
            categoria:categorias(
              id,
              nome
            )
          ),
          respostas(
            id,
            acerto_nivel,
            aluno_id
          )
        `)
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      
      // Mapear respostas apenas do usuário atual
      const exercisesWithUserResponses = data?.map(exercise => {
        const userResp = exercise.respostas?.find(
          (r: { aluno_id: string | null }) => r.aluno_id === user?.id
        );
        return {
          ...exercise,
          userResponse: userResp ? {
            id: userResp.id,
            acerto_nivel: userResp.acerto_nivel
          } : null,
          respostas: undefined // Remover array original
        };
      });
      
      return exercisesWithUserResponses as Exercise[];
    }
  });
};
