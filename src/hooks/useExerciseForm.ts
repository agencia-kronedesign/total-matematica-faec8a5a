
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { exerciseFormSchema, type ExerciseFormValues } from '@/components/exercises/form/types';

export const useExerciseForm = (exerciseId?: string) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      ordem: 1,
      formula: '',
      margem_erro: 0.1,
    },
  });

  const { data: exerciseData, isLoading: isLoadingExercise } = useQuery({
    queryKey: ['exercise', exerciseId || id],
    queryFn: async () => {
      if (!exerciseId && !id) return null;
      const { data, error } = await supabase
        .from('exercicios')
        .select(`
          *,
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
        .eq('id', exerciseId || id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: Boolean(exerciseId || id),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ExerciseFormValues) => {
      const { error } = await supabase
        .from('exercicios')
        .update({
          subcategoria_id: data.subcategoria_id,
          ordem: data.ordem,
          formula: data.formula,
          margem_erro: data.margem_erro,
        })
        .eq('id', exerciseId || id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Exercício atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      navigate('/exercicios');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar exercício');
      console.error('Error updating exercise:', error);
    },
  });

  return {
    form,
    selectedCategory,
    setSelectedCategory,
    imageFile,
    setImageFile,
    imagePreview,
    setImagePreview,
    isUploading,
    setIsUploading,
    exerciseData,
    isLoadingExercise,
    updateMutation,
    queryClient,
  };
};
