
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
}

export const useExercises = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
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
          )
        `)
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      return data as Exercise[];
    }
  });
};
