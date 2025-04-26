
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category } from './types';

export const useCategoryManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('ordem', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
  });

  const checkSubcategories = async (categoryId: string) => {
    const { data, error } = await supabase
      .from('subcategorias')
      .select('id')
      .eq('categoria_id', categoryId)
      .eq('ativo', true)
      .single();

    if (error && error.code === 'PGRST116') {
      return false;
    }

    return true;
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const hasSubcategories = await checkSubcategories(id);
      
      if (hasSubcategories) {
        throw new Error('Esta categoria possui subcategorias ativas. Remova todas as subcategorias primeiro.');
      }

      const { error } = await supabase
        .from('categorias')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria desativada com sucesso');
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Erro ao desativar categoria');
      setIsDeleteDialogOpen(false);
    },
  });

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  return {
    categories,
    isLoading,
    selectedCategory,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleDeleteClick,
    handleEditClick,
    deleteMutation,
    queryClient,
  };
};
